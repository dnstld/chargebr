# Resultado da carga canônica `0011`

## Estado

`EXECUTADA E CONFIRMADA — AGUARDANDO MERGE`

Este documento registra a persistência do endpoint oficial de Pautas e Atas
da ANEEL no Supabase. A execução ocorreu somente depois da confirmação de Denis
Toledo e do merge do [pacote de revisão](revisao-carga-canonica-0011.md) na
`main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0011_aneel-board-meetings-index-source-endpoint.sql`](../data/canonical/0011_aneel-board-meetings-index-source-endpoint.sql) |
| Verificação | [`0011_aneel-board-meetings-index-source-endpoint.verify.sql`](../data/canonical/0011_aneel-board-meetings-index-source-endpoint.verify.sql) |
| Projeto | `chargebr` — `vbzhsalvzbmfczeeeszq` |
| Região | `eu-central-1` |
| Data da execução | 29 de setembro de 2026 |
| Autorização | confirmação de Denis Toledo e merge do PR #189 |
| Commit da `main` usado | `1346cb70290d9dad38a4345bd7ffcbbd098203c7` |
| SHA-256 da carga | `13cbe759f6edabaf6d3fb651b592b0a796c85b9b70dc05392ffe816b3ebd36b1` |
| SHA-256 da verificação | `9739e6f5724a6b5c73f410a5bd76b3816dd782615bb4b20c47f308815b428c04` |
| Resultado | `SUCCESS` |

Os dois arquivos lidos da `main` eram byte a byte idênticos aos arquivos
confirmados. Nenhuma correção, transformação ou cópia manual do SQL foi feita
durante a execução.

## Procedimento

1. O merge do PR #189 foi confirmado no commit `1346cb7`.
2. Os hashes dos arquivos da `main` foram comparados com o pacote confirmado.
3. O changelog e a documentação atuais do Supabase foram conferidos. A mudança
   recente do PostgreSQL 17.11 não afeta esta inserção transacional: a carga não
   usa `ltree`, `pgcrypto`, índices `btree_gist` sobre `NaN` ou operadores
   personalizados.
4. A consulta reutilizável confirmou `load_0011_state = 'absent'`, uma source
   ANEEL, zero targets e um endpoint fora do escopo.
5. O arquivo aceito foi executado integralmente uma única vez entre `BEGIN` e
   `COMMIT`.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu
   `COMMIT`.
7. A consulta reutilizável foi executada novamente sem modificação e retornou
   `load_0011_state = 'complete'`, um target e uma linha exata.
8. Uma consulta final confirmou a identidade, os timestamps, as contagens e a
   ausência de `collection_runs` para o novo endpoint.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado da carga `0011` | `absent` | `complete` |
| Sources ANEEL resolvidas | 1 | 1 |
| Endpoints target | 0 | 1 |
| Linhas target exatas | 0 | 1 |
| Outros endpoints | 1 | 1 |
| Assinatura dos demais endpoints | `ecb70c87ac568d93ae1fba22a577ea0b` | `ecb70c87ac568d93ae1fba22a577ea0b` |

A assinatura idêntica compara integralmente o endpoint ABVE, excluído do
escopo da carga `0011`. Ele não foi alterado.

## Registro persistido

| Campo | Resultado |
| --- | --- |
| ID interno do endpoint | `2` |
| ID interno da source | `40` |
| Slug da source | `aneel` |
| Chave do endpoint | `aneel-board-meetings-index` |
| Situação | `active` |
| Criado em | `2026-09-29T21:33:45.213467Z` |
| Atualizado em | `2026-09-29T21:33:45.213467Z` |
| Runs associados | `0` |

Os IDs são internos ao ambiente e não fazem parte do contrato. O collector
deverá continuar resolvendo a source por `slug` e o endpoint por
`endpoint_key`.

Depois do commit, o banco continha cinco sources, dois `source_endpoints` e
vinte migrations aplicadas. A carga de dados não adicionou migration.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, trigger, policy ou permissão foi
  criada ou alterada;
- a source ANEEL foi reutilizada sem alteração;
- o endpoint ABVE permaneceu integralmente inalterado;
- nenhum `collection_run` foi criado;
- nenhum PDF, conteúdo canônico, observação, evidência ou evento foi coletado;
- nenhuma credencial, grant, adapter, runtime ou automação foi criada;
- o dump CKAN histórico não foi promovido ou persistido como endpoint.

## Conclusão

A carga canônica `0011` foi persistida com sucesso. O Supabase agora possui um
único endpoint ANEEL ativo com o contrato confirmado, enquanto todo o estado
fora do escopo permaneceu inalterado. Isso libera a próxima decisão isolada:
definir a extensão mínima da role do collector para ler a source e o endpoint
ANEEL, antes de implementar o adapter.

## Perguntas para revisão

1. A execução usou exatamente os arquivos confirmados e incorporados à `main`?
2. Está correto que o estado passou de `absent` para `complete`, com um único
   target exato?
3. A assinatura idêntica demonstra que o endpoint ABVE permaneceu inalterado?
4. Está correto manter os IDs internos apenas como registro do ambiente, sem
   torná-los parte do contrato?
5. Está documentado que não houve migration, alteração de schema, grant,
   coleta, conteúdo canônico ou automação?
6. Está correto liberar como próximo passo somente a decisão de acesso mínimo
   da role do collector para ANEEL?

Se todas as respostas forem `sim`, registre `CONFIRMADO`. Se alguma resposta
for `não`, indique o número e a correção necessária. Este documento não deverá
ser incorporado antes da confirmação.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 29 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente o resultado da execução e não
solicitou correções. O PR está liberado para merge. Depois do merge, a próxima
etapa poderá decidir exclusivamente o acesso mínimo do collector à source e ao
endpoint ANEEL.
