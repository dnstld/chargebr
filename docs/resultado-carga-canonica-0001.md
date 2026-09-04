# Resultado da carga canônica `0001`

## Estado

`EXECUTADA E ACEITA — AGUARDANDO MERGE`

Este documento registra a persistência do primeiro acontecimento canônico no Supabase. A execução ocorreu somente depois do `ACCEPTED` da pessoa revisora e do merge do [pacote de revisão](revisao-carga-canonica-0001.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0001_jeep-avenger-lancamento-brasil.sql`](../data/canonical/0001_jeep-avenger-lancamento-brasil.sql) |
| Acontecimento | Lançamento do Jeep Avenger híbrido MHEV no Brasil |
| Data da execução | 4 de setembro de 2026 |
| Autorização | Merge do PR #46 após `ACCEPTED` de Denis Toledo |
| Commit da `main` usado | `7076a65` |
| SHA-256 do arquivo | `851620c8fd06434845cd1f62373dcb1ff051cbd8b8ef624a14cc7a8ddd42a6d2` |
| Resultado | `SUCCESS` |

O arquivo da `main` era idêntico ao arquivo aceito no commit `1aa66e2`. Nenhuma correção ou transformação foi aplicada durante a execução.

## Procedimento

1. A `main` foi sincronizada depois do merge do PR #46.
2. A identidade do arquivo aprovado foi confirmada por comparação e por SHA-256.
3. Uma consulta anterior à carga encontrou zero registros com seus identificadores estáveis.
4. O arquivo aprovado foi executado integralmente entre `BEGIN` e `COMMIT`.
5. Uma consulta posterior reconstruiu a cadeia completa e contou cada registro e vínculo.
6. A lista de migrations foi consultada; nenhuma migration ou alteração de schema foi produzida pela carga.

## Registros persistidos

| Registro | Identificador interno | Identificador estável | Contagem |
| --- | ---: | --- | ---: |
| Fonte | 30 | `jeep-stellantis-media` | 1 |
| Publicação | 46 | `canonical-0001-jeep-avenger-2026-08-13` | 1 |
| Observação | 67 | `canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13` | 1 |
| Evidência | 67 | `canonical-0001-jeep-avenger-lancamento-2026-08-13` | 1 |
| Acontecimento | 85 | `canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13` | 1 |
| Organização | 28 | `jeep` | 1 |

Os identificadores internos são referências geradas pelo banco. Os identificadores estáveis são os usados para impedir duplicação e reconstruir a carga.

## Vínculos e estados verificados

| Verificação | Resultado |
| --- | --- |
| Cadeia completa do acontecimento até fonte, publicação, observação, evidência e organização | 1 |
| Vínculo entre acontecimento e evidência | 1 `supports` |
| Vínculo entre acontecimento e Jeep | 1 `subject` |
| Situação do acontecimento | `accepted` |
| Nível de verificação | `confirmed` |
| Tipo e fase | `product_service` / `occurrence` |
| Data e precisão | 13/08/2026 / `day` |
| Fonte primária | `true` |
| Tipo da organização Jeep | `other` |
| Linhagem da evidência | `established` |

## Ausência de resíduos e alterações indevidas

- não existem acontecimentos ou publicações com identificadores de `pilot-%`;
- não foram carregados dados do seed;
- cada identificador da carga aparece exatamente uma vez;
- permanecem somente as 15 migrations de schema já aprovadas;
- a migration mais recente continua sendo `event_expiry_phase`;
- a carga não criou nem alterou tabelas, colunas, índices, funções ou regras de acesso.

## Conclusão

A carga canônica `0001` foi persistida com sucesso e atende aos critérios de execução definidos para o primeiro ciclo: versão aprovada antes da carga, acontecimento aceito e verificado, cadeia completa, vínculos aplicáveis, ausência de duplicatas e nenhuma alteração de schema.

O resultado precisa ser revisado e incorporado à `main` antes de concluir formalmente o primeiro ciclo e decidir a etapa seguinte.

## Perguntas para revisão

1. A execução usou a versão aceita e incorporada à `main`?
2. Cada registro e vínculo necessário aparece exatamente uma vez?
3. A cadeia completa preserva `accepted`, `confirmed`, `supports`, `subject` e Jeep como `other`?
4. Está documentado que nenhum dado dos pilotos, migration ou alteração de schema foi introduzido?
5. O resultado permite considerar a persistência da carga canônica `0001` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 4 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o resultado da execução e não solicitou correções. O PR está liberado para merge. Depois do merge, o primeiro ciclo poderá ser concluído formalmente e a etapa seguinte poderá ser decidida.
