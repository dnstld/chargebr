# Resultado da implementação da fronteira de exposição `0001`

## Estado

`EXECUTADA E ACEITA — AGUARDANDO MERGE`

Este documento registra a aplicação e a verificação estrutural da primeira fronteira privada de leitura do ChargeBR no Supabase. A execução ocorreu somente depois do `ACCEPTED` de Denis Toledo e do merge do PR #92 na `main`.

A fronteira foi instalada, mas não foi ativada para uso externo: o login operacional permanece com `PASSWORD NULL`. Nenhuma senha, chave ou string de conexão foi criada nesta etapa.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Migration | [`20260911171207_expose_methodology_contract_0001.sql`](../supabase/migrations/20260911171207_expose_methodology_contract_0001.sql) |
| Decisão aceita | [`decisao-implementacao-fronteira-exposicao-0001.md`](decisao-implementacao-fronteira-exposicao-0001.md) |
| Data da execução | 11 de setembro de 2026 |
| Autorização | Merge do PR #92 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `1c2e724` |
| Commit da `main` usado | `af97780` |
| SHA-256 da migration | `2683d02c77e5afaed92b4fe24c70d41f90e9686d90b997e4bf227fb7f2cd113b` |
| SHA-256 da consulta incorporada | `185ad7910765378650d0c2ca12d81e16ee6220c915fdd95973b0a867772a8bdd` |
| Versão registrada pelo Supabase | `20260911173003` |
| Nome registrado pelo Supabase | `expose_methodology_contract_0001` |
| Resultado da aplicação | `SUCCESS` |

O arquivo aplicado era byte a byte idêntico ao arquivo aceito e incorporado à `main`. Nenhuma correção, transformação ou cópia manual do SQL foi feita durante a aplicação.

## Pré-condições confirmadas

Imediatamente antes da execução, foram novamente confirmados:

- PostgreSQL `17.6`;
- exatamente 17 migrations anteriores;
- ausência do schema `chargebr_private`;
- ausência dos três papéis da fronteira;
- ausência da função e das treze policies propostas;
- presença das treze tabelas necessárias, todas com RLS habilitada;
- ausência de policy pública nas tabelas do contrato;
- ausência de grants de tabela para `anon` e `authenticated`;
- consulta administrativa de referência com três projeções completas;
- hashes correspondentes aos artefatos aceitos.

Nenhuma pré-condição havia mudado desde a revisão.

## Procedimento

1. O merge do PR #92 foi confirmado e a `main` foi sincronizada no commit `af97780`.
2. Os hashes do arquivo e da consulta incorporada foram recalculados.
3. As pré-condições e os diagnósticos do Supabase foram consultados novamente.
4. A migration aceita foi enviada integralmente uma única vez ao mecanismo de migrations do Supabase.
5. A transação interna concluiu todas as invariantes e recebeu `COMMIT`.
6. O histórico remoto passou de 17 para 18 migrations.
7. Papéis, associações, schema, função, policies e privilégios foram auditados diretamente nos catálogos do PostgreSQL.
8. A consulta aceita foi executada administrativamente para comparar forma, situação e assinatura do resultado sem expor o conteúdo integral.
9. `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` foi resumido por um objeto temporário dentro de uma transação descartável, encerrada com `ROLLBACK`.
10. Os diagnósticos de segurança e desempenho foram consultados depois da aplicação.

Não foi concedido privilégio temporário adicional a `postgres` para simular o login do backend. O teste positivo com a identidade real continua reservado à etapa de ativação, como definido na decisão aceita.

## Objetos instalados

```text
chargebr_private
  └── read_methodology_contract_0001()

chargebr_methodology_contract_0001_owner
  └── propriedade da função e SELECT restrito nas 13 tabelas

chargebr_methodology_contract_0001_executor
  └── USAGE no schema privado e EXECUTE na função

chargebr_backend_methodology_0001
  └── login inativo que herda somente o executor
```

Não foram criadas tabelas, colunas, índices, dados canônicos, endpoints públicos ou funções RPC na Data API.

## Papéis e atributos

| Papel | Login | Herança | Limite de conexões | Senha | Poder administrativo |
| --- | --- | --- | ---: | --- | --- |
| `chargebr_methodology_contract_0001_owner` | não | não | sem aplicação | sem aplicação | nenhum |
| `chargebr_methodology_contract_0001_executor` | não | não | sem aplicação | sem aplicação | nenhum |
| `chargebr_backend_methodology_0001` | sim | sim | 5 | `NULL` | nenhum |

Os três papéis ficaram sem `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION` e `BYPASSRLS`.

O login operacional recebeu as configurações defensivas previstas:

| Configuração | Valor |
| --- | --- |
| `search_path` | `pg_catalog` |
| `statement_timeout` | `5s` |
| `lock_timeout` | `1s` |
| `idle_in_transaction_session_timeout` | `10s` |
| `default_transaction_read_only` | `on` |

Como a senha é nula, a presença de `LOGIN` não permite conexão por senha nesta etapa.

## Associações entre papéis

| Papel concedido | Membro | `ADMIN` | `INHERIT` | `SET` |
| --- | --- | --- | --- | --- |
| executor | backend | não | sim | não |
| proprietário | `postgres` | sim | não | não |
| executor | `postgres` | sim | não | não |
| backend | `postgres` | sim | não | não |

O backend não é membro do proprietário e não pode assumir executor ou proprietário com `SET ROLE`.

## Schema privado

O schema `chargebr_private` pertence a `postgres`.

| Papel | `USAGE` | `CREATE` |
| --- | --- | --- |
| proprietário | sim | não |
| executor | sim | não |
| backend | sim, por herança do executor | não |
| `anon` | não | não |
| `authenticated` | não | não |
| `service_role` | não | não |
| `PUBLIC` | não | não |

A migration não alterou a configuração dos schemas expostos pela Data API. `chargebr_private` foi criado como schema separado e sem acesso para os papéis da API. A confirmação operacional da lista configurada no Dashboard permanece a mesma pré-condição já revisada; sua eventual mudança futura deverá ser tratada como alteração separada.

## Função instalada

| Propriedade | Resultado |
| --- | --- |
| Nome | `chargebr_private.read_methodology_contract_0001()` |
| Proprietário | `chargebr_methodology_contract_0001_owner` |
| Linguagem | `plpgsql` |
| Volatilidade | `STABLE` |
| Segurança | `SECURITY DEFINER` |
| `search_path` próprio | vazio |
| Comentário com SHA-256 da origem | presente |
| `EXECUTE` para proprietário | sim |
| `EXECUTE` para executor | sim |
| `EXECUTE` para backend | sim, somente por herança |
| `EXECUTE` para `anon` | não |
| `EXECUTE` para `authenticated` | não |
| `EXECUTE` para `service_role` | não |
| `EXECUTE` para `PUBLIC` | não |

A função também verifica internamente que `session_user` pertence ao executor e rejeita contexto JWT da Data API com erro PostgreSQL `42501`.

## Grants de tabela e RLS

O proprietário recebeu exatamente treze grants de `SELECT`, um por tabela necessária ao contrato, e nenhum grant de escrita.

Foram encontradas exatamente treze policies com estas propriedades:

```text
nome: chargebr_methodology_contract_0001_owner_select
comando: SELECT
tipo: permissiva
destinatário: somente chargebr_methodology_contract_0001_owner
expressão: USING (true)
```

O uso de `true` não torna a leitura pública: o destinatário é um papel `NOLOGIN`, sem escrita e sem poderes administrativos, usado somente pela função fixa. Executor, backend, `anon` e `authenticated` ficaram sem qualquer grant direto nas treze tabelas.

## Resultado da leitura de referência

A consulta incorporada foi executada administrativamente sem retornar o conteúdo completo ao relatório.

| Campo | Resultado |
| --- | --- |
| Linhas | 3 |
| Tipos de projeção | `current_methodology`, `as_published`, `methodology_comparison` |
| Situação das projeções | todas `complete` |
| MD5 agregado | `8b76c0ab9106076250315b8e073b8b4a` |
| Tamanho agregado do documento | 36.324 bytes |

A assinatura corresponde à referência aceita. Isso confirma que a aplicação da migration não mudou a leitura dos dados canônicos.

## Medição de desempenho

Uma única medição pós-aplicação retornou:

| Medida | Resultado |
| --- | ---: |
| Planejamento | 15,206 ms |
| Execução | 7,595 ms |
| Linhas | 3 |
| Blocos compartilhados em cache | 85 |
| Blocos compartilhados lidos do disco | 0 |
| Blocos compartilhados alterados | 0 |
| Blocos compartilhados escritos | 0 |
| Blocos temporários lidos | 0 |
| Blocos temporários escritos | 0 |

O tempo de execução ficou praticamente igual à referência anterior de 7,559 ms. O plano continuou atendido por 85 blocos em cache e não exigiu leitura de disco, arquivo temporário ou escrita.

## Diagnósticos do Supabase

### Segurança

| Momento | Grupo | Nível | Quantidade |
| --- | --- | --- | ---: |
| Antes | `rls_enabled_no_policy` | `INFO` | 21 |
| Depois | `rls_enabled_no_policy` | `INFO` | 8 |

A redução exata de treze corresponde às treze tabelas que receberam policies privadas. As oito ocorrências restantes pertencem a tabelas fora do contrato. Não surgiu alerta de função `SECURITY DEFINER` pública, policy pública ou privilégio concedido a `anon` ou `authenticated`.

Referência do diagnóstico: [RLS habilitada sem policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

### Desempenho

| Momento | Grupo | Nível | Quantidade |
| --- | --- | --- | ---: |
| Antes | `unused_index` | `INFO` | 12 |
| Depois | `unused_index` | `INFO` | 12 |

São os mesmos avisos informativos já conhecidos no volume atual. A migration não criou índices nem introduziu novo grupo de diagnóstico. Não há evidência para remover ou adicionar índices nesta etapa.

Referência do diagnóstico: [índice ainda sem uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Ausência de alterações indevidas

- nenhuma senha, chave ou string de conexão foi criada ou registrada;
- nenhum papel público recebeu acesso ao schema ou à função;
- executor e backend não receberam grants de tabela;
- o proprietário não recebeu escrita, login ou capacidade de ignorar RLS;
- o schema privado não recebeu `CREATE` para os novos papéis;
- nenhuma configuração da Data API foi alterada;
- nenhum dado canônico foi inserido, atualizado ou removido;
- nenhuma migration anterior foi modificada;
- nenhum objeto temporário usado na medição permaneceu no banco;
- nenhuma tentativa de ampliar privilégios para teste foi executada.

## Verificações deliberadamente pendentes

Esta etapa comprova a estrutura instalada, não a operação de um backend ainda inexistente. Permanecem para a ativação segura:

1. escolher runtime, modo de conexão e secret manager;
2. criar uma senha fora do Git, histórico SQL e logs;
3. conectar realmente como `chargebr_backend_methodology_0001`;
4. comparar integralmente a saída da função com a consulta administrativa;
5. provar com a sessão real que tabelas, escrita, DDL e `SET ROLE` são negados;
6. provar que contexto JWT simulado é negado;
7. repetir a leitura e registrar tempo e tamanho pela conexão real;
8. rotacionar a senha de ensaio antes do uso contínuo.

Adiar esses testes não deixa uma exposição aberta, porque o login permanece sem senha. Ativá-lo sem cumprir a etapa separada contrariaria a decisão aceita.

## Conclusão

A implementação estrutural da fronteira `0001` foi aplicada com sucesso e corresponde à decisão aceita. O Supabase agora possui uma função privada, imutavelmente ligada à consulta aprovada, executada por um proprietário restrito e acessível somente por um executor sem login. O login destinado ao futuro backend existe, mas permanece inativo.

Os catálogos confirmam os privilégios mínimos; a leitura administrativa mantém as três projeções completas e a assinatura esperada; o plano mantém o desempenho de referência; e os diagnósticos não apontam nova exposição. O nono ciclo ainda não está concluído: depois do aceite deste resultado, ele dependerá do merge deste PR e, posteriormente, da ativação e dos testes com a identidade real.

## Perguntas para revisão

1. A aplicação usou exatamente a migration aceita e incorporada à `main`, com commits e hashes documentados?
2. As pré-condições foram reconfirmadas antes da execução e a migration foi registrada uma única vez como a 18ª migration?
3. Os três papéis possuem os atributos mínimos e o login permanece corretamente inativo com `PASSWORD NULL`?
4. As associações impedem o backend de assumir ou administrar executor e proprietário?
5. O schema privado e a função permanecem inacessíveis para `PUBLIC`, `anon`, `authenticated` e `service_role`?
6. Está correto que somente o proprietário tenha `SELECT` nas treze tabelas e somente o executor tenha o grant operacional de `EXECUTE`?
7. As treze policies destinadas ao proprietário preservam RLS sem criar leitura pública?
8. As três projeções completas, o MD5 esperado e o tamanho registrado demonstram que o contrato manteve a saída aceita?
9. A medição de desempenho e os diagnósticos antes/depois mostram que a migration não introduziu regressão ou alerta novo?
10. Está documentado que nenhum dado canônico, segredo, configuração da Data API ou migration anterior foi alterado?
11. Está correto não simular a identidade real mediante ampliação temporária dos privilégios de `postgres`?
12. Está claro que senha, conexão real e testes positivos e negativos pertencem à futura etapa de ativação e que o nono ciclo ainda não está concluído?
13. O conjunto de verificações permite considerar bem-sucedida a implementação estrutural da fronteira `0001`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o resultado da implementação estrutural e não solicitou correções. O PR está liberado para merge. A ativação do login e os testes com a identidade real continuam sendo uma etapa separada e não foram antecipados por este aceite.
