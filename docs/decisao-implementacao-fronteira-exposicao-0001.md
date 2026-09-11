# Decisão: implementação da fronteira de exposição `0001`

## Estado

`AGUARDANDO REVISÃO`

Este documento transforma a [seleção da fronteira `0001`](selecao-fronteira-exposicao-0001.md) em um desenho concreto de implementação. Ele define objetos, identidades, privilégios, ordem atômica, ativação, verificação e reversão.

Ele não cria a migration, não cria senha ou conexão e não altera o Supabase.

## Resultado proposto

A implementação será composta por:

```text
chargebr_private.read_methodology_contract_0001()
  executa como proprietário restrito
  lê somente as 13 tabelas necessárias
  retorna chargebr-methodology-reading-v1

chargebr_methodology_contract_0001_executor
  pode executar somente a função

chargebr_backend_methodology_0001
  login operacional inicialmente sem senha
  herda somente o papel executor
```

A função ficará fora da Data API. O backend a chamará por conexão PostgreSQL e não terá acesso direto às tabelas.

## Por que existem três identidades

Uma única identidade teria de acumular responsabilidades incompatíveis:

- possuir a função;
- ler as tabelas;
- receber conexão externa;
- ser rotacionada operacionalmente.

A separação proposta mantém cada poder no menor lugar possível:

| Identidade | Pode fazer login | Pode ler tabelas | Pode executar a função | Possui a função |
| --- | --- | --- | --- | --- |
| `chargebr_methodology_contract_0001_owner` | não | sim, somente `SELECT` nas 13 tabelas | sim, por ser proprietário | sim |
| `chargebr_methodology_contract_0001_executor` | não | não | sim | não |
| `chargebr_backend_methodology_0001` | sim, somente após ativação | não | sim, por herança | não |

O proprietário é a identidade interna da função. O executor é um pacote de privilégios. O login é a identidade rotacionável de uma aplicação concreta.

## Objetos e nomes definitivos

| Tipo | Nome |
| --- | --- |
| Schema privado | `chargebr_private` |
| Função | `chargebr_private.read_methodology_contract_0001()` |
| Proprietário | `chargebr_methodology_contract_0001_owner` |
| Executor | `chargebr_methodology_contract_0001_executor` |
| Login operacional | `chargebr_backend_methodology_0001` |
| Policy de leitura, repetida por tabela | `chargebr_methodology_contract_0001_owner_select` |
| Contrato retornado | `chargebr-methodology-reading-v1` |

Os nomes contêm `0001` porque a fronteira é fixa. Uma generalização futura não deverá ampliar silenciosamente esses objetos.

## A migration

A implementação deverá usar o Supabase CLI para gerar o nome cronológico:

```text
supabase migration new expose_methodology_contract_0001
```

O arquivo resultante será o único arquivo de schema no PR de implementação. A migration conterá `begin` e `commit` explícitos para que nenhum objeto intermediário se torne visível se qualquer comando falhar.

Não serão usados:

- `if not exists`;
- `create or replace function`;
- senha literal;
- chave da API;
- SQL dinâmico;
- alteração de migrations anteriores.

Uma colisão de nome ou diferença de estado deverá interromper a migration em vez de reutilizar um objeto desconhecido.

## Pré-condições obrigatórias

Antes de criar o arquivo e novamente antes de aplicar a migration, deverão ser confirmados:

1. PostgreSQL `17.6` ou versão compatível;
2. exatamente `17` migrations anteriores aplicadas;
3. ausência do schema `chargebr_private`;
4. ausência dos três papéis propostos;
5. ausência da função proposta;
6. ausência das treze policies propostas;
7. RLS habilitada nas treze tabelas;
8. nenhuma policy pública já existente nas tabelas;
9. nenhum grant de tabela para `anon` ou `authenticated`;
10. SHA-256 `185ad7910765378650d0c2ca12d81e16ee6220c915fdd95973b0a867772a8bdd` para o SQL de leitura;
11. três linhas completas na execução administrativa de referência;
12. schema privado ausente dos schemas expostos pela Data API.

Se uma pré-condição mudar, o PR deverá ser atualizado antes da aplicação.

## Atributos dos papéis

### Proprietário da função

`chargebr_methodology_contract_0001_owner` será criado com:

```text
NOLOGIN
NOINHERIT
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOREPLICATION
NOBYPASSRLS
```

Ele receberá:

- `USAGE` no schema `public`;
- `USAGE` temporário e `CREATE` temporário no schema `chargebr_private` durante a migration;
- `SELECT` somente nas treze tabelas do contrato;
- uma policy `FOR SELECT` destinada exclusivamente a ele em cada tabela.

Depois de criar a função, `CREATE` no schema privado será revogado. O papel não receberá acesso a sequences nem qualquer operação de escrita.

### Executor

`chargebr_methodology_contract_0001_executor` será criado com os mesmos atributos sem login e sem privilégios administrativos.

Ele receberá somente:

- `USAGE` no schema `chargebr_private`;
- `EXECUTE` em `chargebr_private.read_methodology_contract_0001()`.

Ele não receberá `USAGE` adicional no `public`, grants de tabela ou capacidade de assumir o proprietário.

### Login operacional

`chargebr_backend_methodology_0001` será criado com:

```text
LOGIN
INHERIT
PASSWORD NULL
CONNECTION LIMIT 5
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOREPLICATION
NOBYPASSRLS
```

O login será membro somente do executor:

```text
INHERIT TRUE
SET FALSE
ADMIN FALSE
```

Assim, ele herda a execução da função, mas não pode usar `SET ROLE` para assumir o executor nem repassar a associação a outro papel.

Enquanto `PASSWORD NULL` permanecer, nenhuma conexão por senha será possível. A migration cria a identidade inativa; não cria o segredo que a ativa.

## Configurações defensivas do login

A migration definirá para novas sessões do backend:

| Configuração | Valor inicial | Finalidade |
| --- | --- | --- |
| `search_path` | `pg_catalog` | exigir o nome qualificado da função e evitar resolução em schema de aplicação |
| `statement_timeout` | `5s` | interromper leitura anormalmente longa |
| `lock_timeout` | `1s` | evitar espera prolongada por lock |
| `idle_in_transaction_session_timeout` | `10s` | encerrar transação abandonada |
| `default_transaction_read_only` | `on` | reduzir risco operacional de escrita acidental |

`default_transaction_read_only` não substitui grants. O login continuará sem privilégios de escrita mesmo que tente alterar essa configuração na sessão.

O limite de cinco conexões é conservador para o primeiro backend. A revisão do runtime poderá reduzi-lo ou ampliá-lo com evidência antes da ativação.

## Schema privado

`chargebr_private` será propriedade de `postgres`, mas não será exposto ao consumidor público.

A migration revogará todo acesso ao schema de:

```text
PUBLIC
anon
authenticated
service_role
```

Depois concederá:

- `USAGE` e `CREATE` temporário ao proprietário;
- `USAGE` ao executor;
- nenhum privilégio direto ao login, que herdará `USAGE` do executor.

Ao final, somente `postgres` manterá `CREATE`; o proprietário e o executor terão `USAGE` conforme a função de cada um.

A ausência do schema na Data API deverá ser confirmada no Dashboard. O SQL do banco não revelou a configuração `pgrst.db_schemas`, portanto essa verificação não poderá ser inferida.

## Default privileges da função

Funções recebem execução pública por padrão no PostgreSQL. Além disso, os Default Privileges atuais de `postgres` no schema `public` incluem `anon`, `authenticated` e `service_role`.

A função não será criada por `postgres` e não ficará em `public`. Antes da criação, a migration executará para o papel proprietário:

```sql
alter default privileges
  for role chargebr_methodology_contract_0001_owner
  revoke execute on routines from public;
```

Essa regra será global para objetos futuros do proprietário. O papel existe somente para este contrato e não deverá criar outros objetos depois da migration.

Após a criação, a migration repetirá a proteção no objeto concreto:

```text
revogar EXECUTE de PUBLIC
revogar EXECUTE de anon
revogar EXECUTE de authenticated
revogar EXECUTE de service_role
conceder EXECUTE somente ao executor
```

A duplicação entre default privilege e revogação concreta é defesa em profundidade, não duplicação da regra editorial.

## Criação sob o proprietário restrito

Para evitar que a função pertença a `postgres`, a migration seguirá esta ordem dentro da mesma transação:

1. criar o papel proprietário;
2. conceder temporariamente a `postgres` capacidade de `SET ROLE` para esse papel;
3. criar o schema privado;
4. configurar default privileges e grants do proprietário;
5. criar as treze policies;
6. executar `SET ROLE chargebr_methodology_contract_0001_owner`;
7. criar a função;
8. executar `RESET ROLE`;
9. revogar `CREATE` do proprietário no schema privado;
10. retirar de `postgres` a capacidade de `SET ROLE`, mantendo somente administração explícita do papel;
11. aplicar as ACLs finais da função e do schema;
12. criar o vínculo do login com o executor;
13. confirmar invariantes por consultas ao catálogo;
14. fazer `commit`.

A associação administrativa de `postgres` ao proprietário ficará com:

```text
ADMIN TRUE
INHERIT FALSE
SET FALSE
```

Uma migration futura que precise alterar a função deverá habilitar `SET` temporariamente, agir como o proprietário e desabilitá-lo novamente antes do commit.

## As treze policies

Cada tabela receberá uma policy permissiva somente para seleção e somente para o proprietário:

```sql
create policy chargebr_methodology_contract_0001_owner_select
  on public.<tabela>
  for select
  to chargebr_methodology_contract_0001_owner
  using (true);
```

As tabelas são:

1. `content_items`;
2. `event_evidence`;
3. `events`;
4. `evidence`;
5. `metric_definitions`;
6. `metric_methodology_components`;
7. `metric_methodology_evidence`;
8. `metric_methodology_relations`;
9. `metric_methodology_versions`;
10. `metric_value_methodology_assignments`;
11. `metric_values`;
12. `observations`;
13. `sources`.

`USING (true)` é aceitável apenas porque:

- o destinatário não pode fazer login;
- ele não possui capacidade de escrita;
- o backend não pode assumir esse papel;
- o único objeto executado com essa identidade é uma função fixa e sem parâmetros.

Não serão criadas policies para `anon`, `authenticated`, `service_role`, executor ou login operacional.

## Contrato da função

A assinatura será:

```sql
chargebr_private.read_methodology_contract_0001()
```

Sem parâmetros, ela retornará uma tabela com:

| Coluna | Tipo |
| --- | --- |
| `contract_version` | `text` |
| `projection_type` | `text` |
| `projection_order` | `integer` |
| `projection_status` | `text` |
| `payload` | `jsonb` |
| `blockers` | `jsonb` |

As propriedades serão:

```text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
```

O corpo terá duas partes:

1. verificar que a sessão pertence ao executor e não possui contexto JWT da Data API;
2. executar com `RETURN QUERY` uma cópia literal da consulta aceita.

A verificação interna usará `session_user`, `pg_has_role` e os parâmetros `request.jwt.claims` disponíveis na sessão. Uma chamada será negada quando:

- `session_user` não herdar o executor;
- existir contexto JWT de uma requisição da Data API.

Essa verificação complementa as ACLs. Ela não usará `user_metadata`, não dependerá de dado controlável por usuário e não transformará falta de autorização em resposta `blocked`. Falta de autorização deverá produzir erro PostgreSQL `42501`.

## Por que não usar `auth.uid()` nesta fronteira

`auth.uid()` é apropriado para autorização de usuários da Supabase Auth. O consumidor escolhido é um login PostgreSQL interno e não representa um usuário final.

Além disso, o novo proprietário não possui `USAGE` no schema `auth`. Conceder essa dependência apenas para obter sempre `null` ampliaria o acesso sem melhorar a decisão.

A função negará qualquer contexto JWT e exigirá a associação do `session_user` ao executor. Se no futuro a fronteira for aberta a usuários da Supabase Auth, ela deverá ser outra função, outra versão e outra decisão com `auth.uid()` e RLS por usuário.

## Cópia controlada do SQL aceito

O PostgreSQL não lê o arquivo `queries/0001_abve-eletrificados-janeiro-2025.read.sql` em tempo de execução. A migration precisará incorporar a consulta no corpo da função.

Para impedir divergência:

1. a incorporação será mecânica, sem edição semântica;
2. o SHA-256 do arquivo de origem será registrado em comentário da função;
3. o diff será revisado entre marcadores de início e fim;
4. a saída administrativa e a saída da função serão comparadas integralmente;
5. qualquer mudança futura criará nova versão, sem alterar esta migration.

Depois da aplicação, a migration será a definição imutável da função instalada. O arquivo em `queries/` continuará sendo a referência legível que originou aquela versão.

## Resultado normal e bloqueado

A fronteira não mudará a semântica:

- estado normal: exatamente três linhas `complete`;
- falha crítica: exatamente uma linha `blocked`;
- resposta bloqueada: `payload: null` e nenhum número principal;
- ordenação: `projection_order` crescente;
- versão: `chargebr-methodology-reading-v1`.

Uma falha de autenticação ou autorização não será convertida em `blocked`. `blocked` descreve a impossibilidade editorial de produzir o contrato a partir dos dados; permissão negada descreve quem pode chamá-lo.

## Ativação separada da migration

Depois que a migration aceita for incorporada e aplicada, o login ainda terá `PASSWORD NULL`.

A ativação exigirá uma etapa operacional própria:

1. escolher o runtime do backend;
2. escolher conexão direta, pool de sessão ou pool de transação;
3. gerar uma senha longa em gerenciador seguro;
4. definir a senha sem registrá-la em Git, histórico SQL ou logs;
5. guardar a connection string somente no secret manager do servidor;
6. conectar realmente como `chargebr_backend_methodology_0001`;
7. executar testes positivos e negativos;
8. rotacionar a senha de ensaio antes do uso contínuo.

O procedimento deverá preferir um mecanismo interativo como `psql \password`, que evita colocar o segredo em um comando versionado ou histórico de consulta.

Se ainda não houver runtime ou secret manager adequado, o login permanecerá inativo. Isso não impede aplicar e auditar a estrutura; impede concluir a ativação.

## Verificações sem segredo após a migration

Antes da ativação, consultas administrativas deverão provar:

- proprietário e executor com `NOLOGIN`;
- login operacional com `LOGIN`, senha nula e limite de cinco conexões;
- os três papéis sem `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION` e `BYPASSRLS`;
- associação backend → executor com `INHERIT TRUE`, `SET FALSE`, `ADMIN FALSE`;
- associação postgres → proprietário com `INHERIT FALSE`, `SET FALSE`, `ADMIN TRUE`;
- função pertencente ao proprietário;
- função `SECURITY DEFINER`, `STABLE` e com `search_path` vazio;
- ACL de execução somente para proprietário e executor;
- schema privado sem acesso para papéis públicos;
- treze grants `SELECT` e nenhum grant de escrita para o proprietário;
- treze policies `FOR SELECT` destinadas somente ao proprietário;
- nenhum grant novo de tabela para executor, backend, `anon` ou `authenticated`;
- nenhuma alteração na Data API;
- uma migration adicional e nenhum dado canônico modificado.

## Verificações com a identidade ativada

Depois da ativação segura, a sessão real do backend deverá provar:

1. chamada qualificada da função bem-sucedida;
2. exatamente três linhas completas;
3. MD5 `8b76c0ab9106076250315b8e073b8b4a` no mesmo estado canônico;
4. repetição com conteúdo idêntico;
5. acesso negado às treze tabelas;
6. acesso negado a métricas fora do contrato;
7. `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` e DDL persistente negados;
8. `SET ROLE` para executor e proprietário negado;
9. chamada negada quando um contexto JWT for simulado;
10. bloqueios sem alteração permanente dos dados;
11. tempo e tamanho da resposta registrados;
12. segredo ausente de saída e logs.

Os ensaios de bloqueio usarão transação descartável e rollback ou outra técnica previamente aprovada. Eles não modificaram nem modificarão o estado canônico permanentemente.

## Advisors e desempenho

Antes da migration, o Security Advisor apresenta somente o estado já conhecido de 21 tabelas com RLS e sem policy. O Performance Advisor apresenta doze índices ainda sem uso no volume atual.

Depois da aplicação:

- o Security Advisor não poderá apresentar alerta novo sobre função `SECURITY DEFINER` executável por `anon` ou `authenticated`;
- um aviso referente às policies `USING (true)` deverá ser interpretado pelo papel destinatário e não ignorado automaticamente;
- o Performance Advisor não deverá justificar novos índices sem evidência do plano;
- `EXPLAIN (ANALYZE, BUFFERS)` deverá permanecer próximo da referência de `7,559 ms`, 85 blocos em cache e nenhum bloco de disco ou temporário.

Qualquer alerta novo causado pela migration deverá ser resolvido ou documentado antes do aceite da implementação.

## Reversão

Se a aplicação falhar antes de qualquer consumidor ser ativado, a reversão deverá ocorrer por migration compensatória, não pela edição do arquivo já aplicado.

A ordem será:

1. definir `NOLOGIN` e `PASSWORD NULL` no login operacional;
2. revogar a associação ao executor;
3. revogar `EXECUTE` e `USAGE`;
4. remover a função;
5. remover as treze policies;
6. revogar os treze grants de `SELECT`;
7. remover o default privilege do proprietário;
8. remover o schema privado;
9. remover login, executor e proprietário;
10. confirmar que tabelas, dados e permissões públicas voltaram ao estado anterior.

Se a fronteira já estiver em uso, primeiro será necessário retirar o backend de tráfego e confirmar ausência de chamadas. Esta decisão não autoriza apagar dados canônicos.

## Sequência dos próximos PRs

Depois do aceite e merge desta decisão:

1. um PR criará somente a migration, gerada pelo CLI e ainda não aplicada;
2. Denis Toledo revisará a migration;
3. somente após aceite e merge, a migration será aplicada ao Supabase;
4. outro PR registrará a verificação de catálogo e os advisors;
5. a ativação do login aguardará runtime e secret manager concretos;
6. a conclusão do nono ciclo só ocorrerá depois do teste com a identidade real.

Nenhuma etapa poderá antecipar o aceite da anterior.

## Critérios de sucesso da implementação estrutural

A implementação estrutural estará pronta para revisão quando:

1. a migration corresponder integralmente a esta decisão;
2. o SQL da função corresponder à consulta de origem;
3. todos os objetos forem criados em uma transação;
4. a função nascer sob o proprietário restrito;
5. o schema permanecer fora da Data API;
6. somente o proprietário receber `SELECT` nas treze tabelas;
7. somente o executor receber `EXECUTE` na função;
8. o login permanecer sem senha;
9. nenhum papel novo puder escrever ou ignorar RLS;
10. `anon`, `authenticated` e `service_role` não receberem acesso à fronteira;
11. verificações de catálogo confirmarem todas as ACLs e associações;
12. advisors não indicarem nova exposição;
13. o banco continuar sem modificação de dados canônicos;
14. uma reversão compensatória estiver definida.

## Interrupções obrigatórias

A implementação deverá parar se:

- algum nome já existir;
- alguma pré-condição não corresponder ao estado revisado;
- o CLI não gerar a migration corretamente;
- a função for criada por `postgres` ou outro papel com `BYPASSRLS`;
- a função ficar pública em qualquer instante confirmado;
- `search_path` não puder permanecer vazio;
- a transação não cobrir criação, revogação e invariantes;
- o proprietário receber escrita, login ou bypass de RLS;
- o executor ou backend receber acesso às tabelas;
- o login precisar nascer com senha no arquivo;
- o schema precisar ser exposto à Data API;
- a consulta incorporada divergir do arquivo aceito;
- um alerta crítico de segurança permanecer sem solução;
- testes exigirem alteração permanente dos registros canônicos;
- qualquer segredo aparecer em saída, commit ou PR.

## Fora de escopo

- criar aplicação ou escolher framework;
- ativar a senha do backend;
- armazenar connection string;
- expor função como RPC;
- conceder acesso a usuários finais;
- parametrizar métrica ou período;
- alterar `chargebr-methodology-reading-v1`;
- criar cache, paginação ou materialized view;
- criar índices sem evidência;
- resolver o conflito da carga `0005`;
- retomar a carga `0004`;
- criar interface pública.

## Referências oficiais consideradas

- [Database Functions — Supabase](https://supabase.com/docs/guides/database/functions)
- [Postgres Roles — Supabase](https://supabase.com/docs/guides/database/postgres/roles)
- [Connect to your database — Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Row Level Security — Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Securing your data — Supabase](https://supabase.com/docs/guides/database/secure-data)
- [GRANT — PostgreSQL 17](https://www.postgresql.org/docs/17/sql-grant.html)
- [SET ROLE — PostgreSQL 17](https://www.postgresql.org/docs/17/sql-set-role.html)
- [ALTER DEFAULT PRIVILEGES — PostgreSQL 17](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)
- [ALTER ROLE — PostgreSQL 17](https://www.postgresql.org/docs/17/sql-alterrole.html)
- [Breaking change: tabelas não serão expostas automaticamente — Supabase](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

## Perguntas para revisão

1. Está correta a separação entre proprietário, executor e login operacional?
2. Está correto criar o login com `PASSWORD NULL` e ativá-lo somente em etapa operacional posterior?
3. Os nomes definitivos deixam claro que a fronteira é privada e fixa ao contrato `0001`?
4. Está correto criar a função diretamente sob um proprietário sem login, escrita ou `BYPASSRLS`?
5. Está correto usar treze policies `FOR SELECT ... USING (true)` exclusivamente para esse proprietário inacessível ao backend?
6. As revogações, o schema privado e o `search_path` vazio protegem adequadamente uma função `SECURITY DEFINER`?
7. Está correto negar contexto JWT e autorizar a sessão pela associação do `session_user` ao executor, sem usar `auth.uid()` nesta fronteira interna?
8. Está correto impedir que o backend use `SET ROLE`, mesmo herdando `EXECUTE` do executor?
9. A incorporação mecânica e o hash controlam adequadamente a cópia do SQL para a migration imutável?
10. Está correta a separação entre migration estrutural, aplicação no Supabase e ativação da credencial?
11. As verificações de catálogo, identidade real, advisors e desempenho são suficientes antes da conclusão do ciclo?
12. A reversão compensatória e as interrupções evitam uma ampliação silenciosa da fronteira?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Esta decisão não deve ser incorporada antes do aceite.
