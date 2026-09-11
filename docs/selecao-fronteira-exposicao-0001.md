# Seleção da fronteira de exposição `0001`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento aplica a [decisão do nono ciclo](decisao-nono-ciclo-fluxo-inteligencia.md) ao contrato `chargebr-methodology-reading-v1` e propõe a menor fronteira segura para o primeiro backend interno do ChargeBR.

Ele não cria aplicação, credencial, schema, role, view, função, policy ou grant permanente. Nenhuma migration foi adicionada ou aplicada.

## Resultado proposto

A alternativa selecionada é:

```text
função fixa, somente de leitura, em schema privado e não exposto
  +
papel executor sem acesso às tabelas
  +
conexão PostgreSQL exclusiva do backend
```

Ela corresponde à **alternativa C — função controlada**, chamada diretamente pelo servidor. A função não será RPC da Data API nesta primeira etapa.

A conexão direta continuará existindo como transporte entre o backend e o PostgreSQL, mas o backend não executará a consulta bruta nem receberá `SELECT` nas tabelas. Seu único ponto de entrada será a função do contrato.

## Explicação em linguagem simples

As três alternativas podem ser comparadas como formas de acesso a um arquivo protegido:

- na alternativa A, o backend recebe as chaves de treze salas e é instruído a buscar somente um documento;
- na alternativa B, ele consulta uma janela, mas a janela ainda exige que ele tenha as chaves das salas atrás dela;
- na alternativa C, ele pode pedir um único documento em um balcão, sem entrar nas salas.

Para o contrato `0001`, o balcão é a menor fronteira. O backend pode executar uma operação específica e receber o envelope aceito, mas não pode trocar a consulta, explorar outras métricas ou escrever nas tabelas.

## Escopo avaliado

| Dimensão | Valor |
| --- | --- |
| Contrato | `chargebr-methodology-reading-v1` |
| Consulta | `queries/0001_abve-eletrificados-janeiro-2025.read.sql` |
| SHA-256 da consulta | `185ad7910765378650d0c2ca12d81e16ee6220c915fdd95973b0a867772a8bdd` |
| Caso canônico | carga `0007` |
| Período | janeiro de 2025 |
| Consumidor | backend interno do ChargeBR |
| Banco observado | projeto `chargebr`, PostgreSQL `17.6` |
| Data da avaliação | 11 de setembro de 2026 |

A seleção não autoriza parâmetros, outras métricas, acesso público ou uma interface.

## Estado inicial confirmado

A inspeção somente de leitura confirmou:

| Controle | Estado |
| --- | --- |
| Tabelas no schema `public` | `21` |
| Tabelas com RLS habilitada | `21` |
| Policies no schema `public` | `0` |
| Grants de tabela para `anon` | `0` |
| Grants de tabela para `authenticated` | `0` |
| Views públicas | `0` |
| Funções próprias no schema `public` | `0` |
| Funções `SECURITY DEFINER` no schema `public` | `0` |
| Papel `service_role` | possui `BYPASSRLS` e privilégios amplos |
| Migrations aplicadas | `17` |

RLS sem policy funciona atualmente como negação por padrão para papéis não proprietários. Os avisos `rls_enabled_no_policy` do Security Advisor descrevem esse estado; não indicam exposição pública enquanto os papéis públicos também permanecem sem grants.

Os Default Privileges atuais de `postgres` no schema `public` concedem execução de novas funções a `anon`, `authenticated` e `service_role`. Por isso, uma função criada em `public` poderia ampliar a superfície da API automaticamente e foi excluída da proposta.

A configuração dos schemas expostos pela Data API não ficou disponível na sessão SQL. A alternativa selecionada não depende da Data API, mas a implementação deverá confirmar no Dashboard que o novo schema privado não está exposto.

## Resultado administrativo de referência

A consulta aceita foi executada novamente sem alteração de dados:

| Medida | Resultado |
| --- | --- |
| Linhas | `3` |
| Projeções | `current_methodology`, `as_published`, `methodology_comparison` |
| Estados | três vezes `complete` |
| MD5 do documento JSON ordenado | `8b76c0ab9106076250315b8e073b8b4a` |
| Tamanho do documento JSON no PostgreSQL | `36.324 bytes` |
| Planejamento observado | `14,860 ms` |
| Execução observada | `7,559 ms` |
| Blocos compartilhados em cache | `85` |
| Blocos lidos do disco | `0` |
| Blocos temporários | `0` |

O MD5 identifica o conteúdo produzido nesse estado do banco; ele não substitui o SHA-256 do arquivo SQL nem passa a fazer parte do contrato público.

## Superfície real da consulta

O SQL usa treze tabelas:

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

O banco contém atualmente:

| Conjunto | Dentro do contrato | Fora do contrato | Total |
| --- | ---: | ---: | ---: |
| Definições de métricas | `1` | `3` | `4` |
| Valores de métricas | `2` | `6` | `8` |

Conceder leitura irrestrita nas tabelas para executar o contrato não liberaria apenas o caso `0007`. Também permitiria ao papel consultar registros que o contrato fixo não deve expor.

## Avaliação da alternativa A — consulta direta no servidor

### O que seria necessário

Um papel próprio do backend precisaria de:

- `USAGE` no schema `public`;
- `SELECT` nas treze tabelas;
- policies RLS que tornassem as linhas necessárias visíveis;
- uma credencial de login mantida somente no servidor.

### O que ela preserva

- usa o SQL exato já aceito;
- não depende da Data API;
- pode negar todas as operações de escrita;
- mantém o segredo fora do navegador.

### Por que não foi selecionada

Uma policy simples `USING (true)` permitiria consultar diretamente as três definições e os seis valores hoje existentes fora do contrato. Policies restritas poderiam reduzir essa superfície, mas teriam de repetir por treze tabelas as relações que já estão expressas na consulta.

Isso criaria duas regras paralelas:

```text
consulta decide quais registros formam o contrato
policies decidem novamente quais registros pertencem ao caso
```

Uma divergência futura entre elas poderia bloquear dados corretos ou liberar dados adicionais. Mesmo com policies perfeitamente alinhadas, o backend poderia fazer consultas próprias aos fragmentos permitidos, em vez de receber somente o envelope.

### Resultado

`NÃO SELECIONADA`

A alternativa é tecnicamente possível, mas não é a menor fronteira para um contrato fixo.

## Avaliação da alternativa B — view com `security_invoker`

### O que seria necessário

A view precisaria usar `security_invoker = true`. Assim, a leitura das tabelas seria avaliada com os privilégios e as policies do backend, não com os do proprietário da view.

O backend ainda precisaria de:

- `SELECT` na view;
- privilégios nas treze tabelas subjacentes;
- policies RLS suficientes para todas as relações da consulta;
- acesso ao schema da view;
- configuração explícita da Data API, caso a view fosse consumida por ela.

### O que ela preserva

- oferece uma forma tabular estável;
- evita o bypass implícito de RLS das views tradicionais;
- pode executar a mesma lógica SQL.

### Por que não foi selecionada

`security_invoker` corrige quem deve responder pelos privilégios, mas não elimina a necessidade desses privilégios. A view depende da mesma liberação das tabelas e das mesmas policies extensas da alternativa A.

Ela adicionaria um objeto intermediário sem impedir que o papel consulte diretamente as tabelas às quais recebeu acesso. Expor a view pela Data API também introduziria uma configuração hoje desconhecida e desnecessária para o backend interno.

### Resultado

`NÃO SELECIONADA`

A alternativa poderá ser reavaliada quando existir um consumidor que precise de composição tabular autorizada por RLS, mas essa necessidade não existe no contrato `0001`.

## Avaliação da alternativa C — função privada controlada

### Forma selecionada

A função deverá:

- ter zero parâmetros;
- reproduzir integralmente a consulta aceita;
- retornar as seis colunas do envelope;
- ser `STABLE` e somente de leitura;
- usar `SECURITY DEFINER` de forma deliberada;
- pertencer a um papel proprietário sem login e sem `BYPASSRLS`;
- ficar em um schema privado e não exposto pela Data API;
- fixar um `search_path` seguro;
- usar nomes qualificados para as tabelas;
- negar `EXECUTE` a `PUBLIC`, `anon`, `authenticated` e `service_role`;
- conceder `EXECUTE` somente ao papel executor do contrato.

O backend terá `USAGE` no schema privado e `EXECUTE` nessa função. Ele não terá `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` ou `TRIGGER` nas tabelas.

### Separação das identidades

O desenho exige três responsabilidades:

| Identidade | Login | Poder necessário |
| --- | --- | --- |
| Proprietário da função | não | `SELECT` somente nas treze tabelas e execução sob as policies destinadas a ele |
| Executor do contrato | não | `USAGE` no schema privado e `EXECUTE` somente na função `0001` |
| Login operacional do backend | sim | herdar exclusivamente o papel executor |

O segredo pertencerá ao login operacional. Ele não será escrito na migration, no repositório, no navegador, na resposta ou nos logs de revisão.

### Por que `SECURITY DEFINER` é aceitável somente aqui

`SECURITY DEFINER` é perigoso quando pertence a `postgres`, fica em schema exposto, aceita entrada ampla ou conserva execução pública. Ele é necessário neste desenho porque o chamador não deve possuir acesso às tabelas.

O risco será reduzido por cinco barreiras independentes:

1. proprietário sem login, sem escrita e sem `BYPASSRLS`;
2. função fixa, sem parâmetros e sem SQL dinâmico;
3. schema privado fora da Data API;
4. revogação explícita de toda execução pública;
5. migration atômica que não deixa a função visível entre criação e revogação.

Se qualquer uma dessas barreiras não puder ser comprovada, a função não deverá ser aplicada.

### RLS do proprietário

Como todas as tabelas têm RLS e nenhuma policy, o papel proprietário da função não verá linhas apenas com um grant de `SELECT`.

A implementação deverá criar policies `FOR SELECT TO <papel_proprietário> USING (true)` somente nas treze tabelas. Isso permite ao proprietário sem login ler os registros necessários, mas não concede nada ao executor ou ao login do backend.

Essas policies não tentam reproduzir o recorte do contrato. O recorte permanece em um único lugar: o SQL fixo da função. O proprietário não pode fazer login, e o consumidor não pode assumir esse papel.

### Forma de conexão

O backend chamará a função por conexão PostgreSQL. O modo exato dependerá do ambiente futuro:

- conexão direta para backend persistente compatível com IPv6;
- pooler em modo de sessão para backend persistente que precise de IPv4;
- pooler em modo de transação para execução temporária ou serverless.

A escolha operacional não altera os privilégios. Ela deverá ser decidida quando o runtime do backend existir, com pool e timeout explícitos.

### Resultado

`SELECIONADA — SUJEITA À REVISÃO E À PROVA DE IMPLEMENTAÇÃO`

## Matriz comparativa

| Critério | A: consulta direta | B: view invocadora | C: função privada |
| --- | --- | --- | --- |
| Mesmo SQL | atende | atende | atende |
| Backend sem segredo no navegador | atende | atende | atende |
| Backend sem acesso às tabelas | não atende | não atende | atende pelo desenho |
| Restringe ao contrato `0001` | não atende sem duplicar regras | não atende sem duplicar regras | atende pelo ponto de entrada fixo |
| Escrita negada | demonstrável | demonstrável | exigida para proprietário e executor |
| Não depende da Data API | atende | depende da forma de consumo | atende |
| Mantém `anon` e `authenticated` sem acesso | atende | exige cuidado adicional | atende pelo desenho |
| Regra semântica em um único lugar | atende parcialmente | atende parcialmente | atende |
| Menor quantidade de dados alcançável pelo consumidor | não atende | não atende | atende pelo desenho |
| Complexidade de segurança | policies extensas e credencial | policies extensas, view e configuração | proprietário restrito, policies e ACL da função |
| Teste completo com identidade final | pendente | pendente | pendente |
| Decisão | rejeitada | rejeitada | selecionada |

“Atende pelo desenho” não significa “já provado”. A implementação posterior deverá executar os testes com os papéis reais antes de concluir o nono ciclo.

## Ensaio interrompido com segurança

Foi preparado um papel descartável, sem login, sem `BYPASSRLS`, com `SELECT` e uma policy exclusiva em cada uma das treze tabelas. Isso confirmou que a alternativa direta exigiria treze grants e treze policies.

Ao iniciar o ensaio da função, o controle de segurança recusou criar, ainda que temporariamente, uma função `SECURITY DEFINER` pertencente a `postgres` antes das revogações. O ensaio foi interrompido; não houve tentativa de contornar a proteção.

Todos os objetos descartáveis foram removidos. A verificação final encontrou:

| Objeto | Quantidade restante |
| --- | ---: |
| Roles de teste | `0` |
| Schemas de teste | `0` |
| Policies de teste | `0` |
| Policies públicas totais | `0` |
| Views públicas | `0` |
| Funções próprias públicas | `0` |
| Grants de tabela para `anon` | `0` |
| Grants de tabela para `authenticated` | `0` |
| Migrations aplicadas | `17` |

A interrupção fortalece a seleção: a função só deverá ser criada em uma migration atômica que estabeleça primeiro os papéis e o schema privado e revogue todos os acessos antes do commit.

## Requisitos da futura decisão de implementação

O próximo documento deverá definir, sem aplicar ainda:

1. nomes finais do schema e dos três papéis;
2. comandos exatos de criação sem senha persistida;
3. grants mínimos do proprietário nas treze tabelas;
4. treze policies exclusivas de leitura;
5. assinatura e retorno exatos da função;
6. criação da função sob o proprietário restrito;
7. `search_path` e qualificação de nomes;
8. revogações de `PUBLIC`, `anon`, `authenticated` e `service_role`;
9. default privileges seguros no schema privado;
10. vínculo entre login operacional e papel executor;
11. rotação e revogação da credencial fora do Git;
12. conexão ou pool adequado ao runtime futuro;
13. rollback integral;
14. testes positivos, negativos e de bloqueio;
15. verificações dos Security e Performance Advisors.

Nenhuma senha real poderá aparecer no documento ou na migration.

## Provas obrigatórias depois da implementação

A implementação só poderá ser aceita quando demonstrar:

- exatamente três linhas `complete` no estado normal;
- conteúdo ordenado com MD5 `8b76c0ab9106076250315b8e073b8b4a` no mesmo estado canônico;
- uma linha `blocked`, `payload: null` e nenhum número principal nos ensaios de falha;
- executor capaz de chamar somente a função;
- executor incapaz de consultar qualquer uma das treze tabelas;
- proprietário incapaz de fazer login ou escrever;
- login do backend incapaz de escrever, criar objetos ou assumir o proprietário;
- `PUBLIC`, `anon`, `authenticated` e `service_role` sem `EXECUTE` na função;
- schema privado ausente da lista da Data API;
- segredo ausente do Git, navegador, resposta e logs;
- tempo, plano e tamanho de resposta registrados;
- advisors sem novo alerta causado pela implementação;
- rollback restaurando integralmente o estado anterior.

## Interrupções obrigatórias

A implementação deverá parar se:

- a função precisar pertencer a `postgres` ou a papel com `BYPASSRLS`;
- a função precisar ficar no schema `public` ou em outro schema exposto;
- a migration não puder criar e revogar acessos atomicamente;
- o papel proprietário receber qualquer poder de escrita;
- o executor ou o login receber acesso direto às tabelas;
- `PUBLIC`, `anon`, `authenticated` ou `service_role` conservar `EXECUTE`;
- o consumidor puder passar SQL, nome de tabela, métrica, período ou outro parâmetro;
- o `search_path` depender de schema gravável pelo consumidor;
- a identidade real não puder ser usada nos testes;
- o backend precisar copiar a regra de metodologia ou ignorar `blocked`;
- o schema privado não puder ser confirmado fora da Data API;
- qualquer segredo precisar ser versionado;
- os ensaios alterarem dados canônicos permanentemente.

## Limites da seleção

Esta etapa não prova ainda:

- execução pela identidade final do backend;
- comportamento da função criada;
- segurança da migration ainda inexistente;
- conexão direta, de sessão ou de transação em um runtime real;
- rotação prática da credencial;
- observabilidade da aplicação;
- compatibilidade com outra métrica;
- acesso público ou autenticado;
- estabilidade de uma API externa.

Essas lacunas não invalidam a comparação. Elas impedem transformar a alternativa selecionada em implementação sem outra decisão e revisão.

## Referências oficiais consideradas

- [Securing your API — Supabase](https://supabase.com/docs/guides/api/securing-your-api)
- [Securing your data — Supabase](https://supabase.com/docs/guides/database/secure-data)
- [Row Level Security — Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Functions — Supabase](https://supabase.com/docs/guides/database/functions)
- [Postgres Roles — Supabase](https://supabase.com/docs/guides/database/postgres/roles)
- [Connect to your database — Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Using Custom Schemas — Supabase](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Database Advisor: função `SECURITY DEFINER` executável por usuários autenticados — Supabase](https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0029_authenticated_security_definer_function_executable)
- [Breaking change: tabelas não serão expostas automaticamente — Supabase](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

## Perguntas para revisão

1. Está correto selecionar uma função privada como a menor fronteira para o contrato fixo `0001`?
2. Está claro que o backend usará conexão PostgreSQL, mas não executará a consulta bruta nem terá acesso às tabelas?
3. Está correto rejeitar a consulta direta porque ela alcançaria registros fora do contrato ou exigiria duplicar o recorte em treze policies?
4. Está correto rejeitar a view `security_invoker` porque ela conserva a necessidade de acesso às tabelas subjacentes?
5. A separação entre proprietário sem login, executor sem login e login operacional do backend reduz adequadamente os privilégios?
6. Está correto usar `SECURITY DEFINER` somente com proprietário restrito, schema privado, função fixa, revogações explícitas e migration atômica?
7. Está correto permitir ao proprietário leitura das treze tabelas por policies próprias, mantendo o executor sem acesso direto?
8. Está correto não usar a Data API nem conceder acesso a `anon`, `authenticated` ou `service_role`?
9. A interrupção do ensaio foi tratada corretamente, sem contornar a proteção e com remoção comprovada dos objetos descartáveis?
10. As provas e interrupções impedem que a seleção seja confundida com uma implementação já validada?
11. Está correto decidir o modo de conexão somente quando existir um runtime concreto, sem alterar os privilégios selecionados?
12. Está correto criar uma decisão de implementação separada antes de escrever ou aplicar a migration?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Esta seleção não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a seleção e não solicitou correções. O PR está liberado para merge. A decisão detalhada de implementação só poderá começar depois que esta versão aceita estiver incorporada à `main`.
