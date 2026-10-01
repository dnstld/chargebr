# Resultado da carga canônica `0012`

## Estado

`EXECUTADA E CONFIRMADA — AGUARDANDO MERGE`

Este documento registra a transição do endpoint
`aneel-board-meetings-index` de `active` para `unavailable` no Supabase. A
execução ocorreu somente depois da confirmação de Denis Toledo e do merge do
[pacote de revisão](revisao-carga-canonica-0012.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0012_aneel-board-meetings-index-unavailable.sql`](../data/canonical/0012_aneel-board-meetings-index-unavailable.sql) |
| Verificação | [`0012_aneel-board-meetings-index-unavailable.verify.sql`](../data/canonical/0012_aneel-board-meetings-index-unavailable.verify.sql) |
| Projeto | `chargebr` — `vbzhsalvzbmfczeeeszq` |
| Região | `eu-central-1` |
| Data da execução | 1º de outubro de 2026 |
| Autorização | confirmação de Denis Toledo e merge do PR #199 |
| Commit da `main` usado | `457101f6d0ff7298ae9c07860f1970805e49b80d` |
| SHA-256 da carga | `b8bc4bed3ea5c0db22e53dbb9513e670717516d1473de84b458090425dd1201a` |
| SHA-256 da verificação | `46ee2a45bfed9055f5523d2b86d59f07bfb47cd0d917459a15b2ed7c08a44b61` |
| Resultado | `SUCCESS` |

Os dois arquivos lidos da `main` eram byte a byte idênticos aos arquivos
confirmados. Nenhuma correção, transformação ou cópia manual do SQL foi feita
durante a execução.

## Procedimento

1. O merge do PR #199 foi confirmado no commit `457101f`, com o check
   `verify` concluído com sucesso.
2. A `main` local foi sincronizada por avanço direto e permaneceu sem
   alterações locais.
3. Os hashes dos dois arquivos da `main` foram comparados com o pacote
   confirmado.
4. O changelog e a documentação atuais do Supabase foram conferidos. As
   mudanças recentes não afetam esta atualização de dados: não houve DDL, uso
   de extensões, criação de tabela nem exposição pela Data API.
5. A consulta reutilizável confirmou `load_0012_state = 'old'`, uma source
   ANEEL, um target no estado antigo e nenhuma linha no estado novo.
6. O arquivo aceito foi enviado integralmente e executado uma única vez como
   uma instrução atômica no PostgreSQL remoto. Todas as proteções internas
   terminaram sem exceção.
7. A consulta reutilizável foi executada novamente sem modificação e retornou
   `load_0012_state = 'complete'`, um target e uma linha exata.
8. Uma consulta final confirmou o registro persistido e as contagens gerais do
   ambiente.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois da carga |
| --- | ---: | ---: |
| Estado da carga `0012` | `old` | `complete` |
| Sources ANEEL resolvidas | 1 | 1 |
| Endpoints target | 1 | 1 |
| Linhas no estado antigo | 1 | 0 |
| Linhas no estado novo | 0 | 1 |
| Outros endpoints | 1 | 1 |
| Assinatura dos demais endpoints | `ecb70c87ac568d93ae1fba22a577ea0b` | `ecb70c87ac568d93ae1fba22a577ea0b` |
| `collection_runs` | 1 | 1 |
| Assinatura de `collection_runs` | `1d4f4345a6a74619447f4e3c74653780` | `1d4f4345a6a74619447f4e3c74653780` |

As assinaturas idênticas demonstram que o endpoint ABVE e a execução de coleta
existente permaneceram integralmente inalterados.

## Registro persistido

| Campo | Resultado |
| --- | --- |
| ID interno do endpoint | `2` |
| ID interno da source | `40` |
| Slug da source | `aneel` |
| Chave do endpoint | `aneel-board-meetings-index` |
| Situação | `unavailable` |
| Criado em | `2026-09-29T21:33:45.213467Z` |
| Atualizado em | `2026-09-30T16:58:59Z` |
| Acesso revisado em | `2026-09-25T05:11:10Z` |

Os IDs são internos ao ambiente e não fazem parte do contrato. O instante de
atualização permaneceu no valor determinístico aprovado, correspondente ao
merge da decisão de indisponibilidade. `access_reviewed_at` foi preservado
porque a configuração sensível do endpoint não mudou.

Depois da execução, o banco continha cinco sources, dois `source_endpoints`, um
`collection_run` e vinte e uma migrations aplicadas. A carga de dados não
adicionou migration.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, trigger, policy, grant ou credencial
  foi criada ou alterada;
- a source ANEEL e a identidade do endpoint permaneceram inalteradas;
- todos os campos do endpoint fora de `status` e `updated_at` foram
  preservados;
- o endpoint ABVE permaneceu integralmente inalterado;
- o `collection_run` existente permaneceu integralmente inalterado;
- nenhum novo run, request HTTP, PDF, conteúdo, observação ou evidência foi
  criado;
- nenhum componente ou decisão de backend foi introduzido.

## Conclusão

A carga canônica `0012` foi persistida com sucesso. O Supabase agora representa
explicitamente que o endpoint ANEEL está indisponível, enquanto todo o estado
fora do alvo permaneceu inalterado. Depois do merge deste resultado, o ciclo de
indisponibilidade do collector ANEEL poderá ser considerado encerrado e o
trabalho poderá avançar para a auditoria final do pacote de handoff anterior ao
backend, sem escolher ou implementar a arquitetura do backend.

## Perguntas para revisão

1. A execução usou exatamente os arquivos confirmados e incorporados à `main`?
2. Está correto que o estado passou de `old` para `complete`, com um único
   target exato?
3. As assinaturas idênticas demonstram que o endpoint ABVE e o
   `collection_run` existente permaneceram inalterados?
4. Está correto que somente `status` e `updated_at` mudaram no endpoint ANEEL?
5. Está documentado que não houve migration, alteração de schema, grant,
   credencial, coleta ou decisão de backend?
6. Está correto liberar, depois do merge, apenas a auditoria final do handoff
   pré-backend?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta for
`não`, indique o número e a correção necessária. Este documento não deverá ser
incorporado antes da confirmação.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 1º de outubro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente o resultado da execução e não
solicitou correções. O pacote está liberado para commit e abertura de PR. Depois
do merge, o ciclo de indisponibilidade do collector ANEEL poderá ser encerrado
e a auditoria final do handoff pré-backend poderá começar.
