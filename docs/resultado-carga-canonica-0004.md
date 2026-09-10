# Resultado da carga canônica `0004`

## Estado

`EXECUTADA — AGUARDANDO REVISÃO`

Este documento registra a persistência do segundo valor mensal da série de emplacamentos de veículos leves BEV no Supabase. A execução ocorreu somente depois do `ACCEPTED` de Denis Toledo e do merge do [pacote de revisão](revisao-carga-canonica-0004.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0004_abve-bev-emplacamentos-agosto-2026.sql`](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql) |
| Verificação | [`0004_abve-bev-emplacamentos-agosto-2026.verify.sql`](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.verify.sql) |
| Resultado medido | 27.166 emplacamentos de veículos leves BEV no Brasil durante agosto de 2026 |
| Data da execução | 10 de setembro de 2026 |
| Autorização | Merge do PR #77 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `80635fa` |
| Commit da `main` usado | `253bd6a` |
| SHA-256 da carga | `b4176bdbdcd5107ff08aa89e184d142735721cc95e684ae66eaab6416da6de8a` |
| SHA-256 da verificação | `34a083cf3c7c908f9497ac41d45074bd9dde2c5e6a54f0899fc9a5aaeaeeb778` |
| Resultado | `SUCCESS` |

Os dois arquivos incorporados à `main` eram byte a byte idênticos aos arquivos aceitos no commit `80635fa`. Nenhuma correção, transformação ou cópia manual do SQL foi aplicada durante a execução.

## Procedimento

1. O merge do PR #77 foi confirmado e a `main` foi sincronizada no commit `253bd6a`.
2. Os dois arquivos incorporados foram comparados diretamente com o commit aceito e seus hashes SHA-256 foram registrados.
3. O changelog atual do Supabase foi conferido; nenhuma mudança recente afetava esta carga transacional de dados.
4. A consulta reutilizável confirmou `load_0004_state = 'absent'`, assinatura anterior `a5e325a3f0eb2bde724949b4f4bba322`, somente julho na série e nenhum identificador de piloto.
5. O arquivo aceito foi executado integralmente uma única vez entre `BEGIN` e `COMMIT`.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
7. O arquivo de verificação foi executado novamente sem modificação e retornou `load_0004_state = 'complete'`.
8. Uma consulta adicional reconstruiu os identificadores, vínculos, valores, períodos e contagens agregadas persistidos.

## Registros persistidos e reutilizados

| Registro | Identificador interno | Identificador estável | Operação |
| --- | ---: | --- | --- |
| Fonte ABVE | 39 | `abve` | Reutilizada |
| Organização ABVE | 34 | `abve` | Reutilizada |
| Definição da métrica | 8 | `monthly-light-bev-registrations-brazil` | Reutilizada |
| Publicação | 74 | `canonical-0004-abve-data-bev-agosto-2026-2026-09-09` | Criada |
| Observação | 95 | `canonical-0004-abve-bev-emplacamentos-agosto-2026` | Criada |
| Evidência | 95 | `canonical-0004-abve-data-bev-agosto-2026` | Criada |
| Acontecimento | 110 | `canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09` | Criado |
| Valor de métrica | 32 | definição 8 + observação 95 + agosto de 2026 + Brasil | Criado |

Os identificadores internos foram gerados pelo banco. Os identificadores estáveis e a chave composta do valor são os elementos usados para impedir duplicação e reconstruir o recorte.

## Valor quantitativo persistido

| Campo | Resultado |
| --- | --- |
| Valor numérico | `27166` |
| Unidade canônica | `vehicle_registration` |
| Início do período | `2026-08-01` |
| Fim do período | `2026-08-31` |
| Geografia | Brasil |
| Situação | `validated` |
| Tecnologia incluída | Veículos leves 100% elétricos — BEV |

O valor representa somente os emplacamentos ocorridos durante agosto de 2026. Ele não é o total de eletrificados, não é um acumulado e não inclui PHEV, HEV, HEV Flex ou MHEV.

A grafia publicada `27.166` foi armazenada como o número inteiro `27166`. Nenhum cálculo, arredondamento ou conversão de unidade foi realizado. A participação de `47,3%`, a variação de `5,4%` sobre julho e outros números da publicação não foram persistidos.

## Série mensal resultante

| Período | Valor | Situação | Origem |
| --- | ---: | --- | --- |
| Julho de 2026 | `25782` | `validated` | Carga `0003` |
| Agosto de 2026 | `27166` | `validated` | Carga `0004` |

A série contém exatamente duas observações independentes, uma para cada mês. Não foi criado um vínculo direto entre os valores e não foi armazenado um percentual calculado. Essa separação permite recalcular comparações posteriormente sem transformar um resultado derivado em fato de origem.

## Cadeias verificadas

### Cadeia factual

```text
fonte ABVE (39)
  → publicação (74)
  → observação (95)
  → evidência established (95)
  → vínculo supports
  → acontecimento (110)
```

### Cadeia métrica

```text
observação (95)
  → valor validated (32)
  → definição approved (8)
  → 27166 vehicle_registration
  → 01/08/2026 a 31/08/2026
  → Brasil
```

As duas cadeias compartilham a mesma observação. O valor pode ser rastreado até a publicação exata da ABVE Data, e o acontecimento pode ser rastreado até a mesma evidência.

## Estado do acontecimento

| Verificação | Resultado |
| --- | --- |
| Identificador interno | 110 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-09-09` |
| Precisão | `day` |
| Geografia | Brasil |
| Situação | `accepted` |
| Nível de verificação | `confirmed` |
| Organização central | ABVE, identificador 34, vínculo `subject` |
| Evidência | Identificador 95, vínculo `supports` |

A data de 9 de setembro é a data da publicação. Agosto é o período medido e permanece no valor métrico. `confirmed` registra que a fonte primária sustenta aquilo que a própria ABVE publicou, sem alegar auditoria ou confirmação independente.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0004` | `absent` | `complete` |
| Fonte ABVE reutilizada | 1 | 1 |
| Organização ABVE reutilizada | 1 | 1 |
| Definição de métrica reutilizada | 1 | 1 |
| Publicações da carga | 0 | 1 |
| Observações da carga | 0 | 1 |
| Evidências da carga | 0 | 1 |
| Acontecimentos da carga | 0 | 1 |
| Valores da carga | 0 | 1 |
| Vínculos acontecimento–evidência | 0 | 1 |
| Vínculos acontecimento–organização | 0 | 1 |
| Cadeias completas e exatas | 0 | 1 |
| Valores da série | `[25782]` | `[25782, 27166]` |
| Períodos iniciais da série | `[2026-07-01]` | `[2026-07-01, 2026-08-01]` |
| Observações distintas na série | 1 | 2 |
| Estruturas históricas indevidas da `0004` | 0 | 0 |
| Identificadores de piloto | 0 | 0 |
| Assinatura dos registros anteriores | `a5e325a3f0eb2bde724949b4f4bba322` | `a5e325a3f0eb2bde724949b4f4bba322` |

A assinatura idêntica compara integralmente os registros e vínculos anteriores excluídos do escopo da carga `0004`. Nenhum deles foi modificado.

## Contagens agregadas do banco

| Estrutura | Antes | Depois |
| --- | ---: | ---: |
| `sources` | 4 | 4 |
| `content_items` | 8 | 9 |
| `observations` | 8 | 9 |
| `evidence` | 8 | 9 |
| `events` | 7 | 8 |
| `event_evidence` | 9 | 10 |
| `metric_definitions` | 3 | 3 |
| `metric_values` | 5 | 6 |
| `organizations` | 4 | 4 |
| `event_organizations` | 9 | 10 |
| `content_item_relations` | 1 | 1 |
| `metric_value_resolutions` | 1 | 1 |
| `metric_value_status_transitions` | 2 | 2 |

O banco passou a ter oito acontecimentos `accepted`: sete `confirmed` e um `corroborated`. O histórico permanece com 16 migrations, pois a carga inseriu dados e não alterou o schema.

As três estruturas regulatórias continuam vazias: `regulatory_instruments`, `event_regulatory_instruments` e `regulatory_instrument_relations` permanecem com zero registros.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, política ou permissão foi criada ou alterada;
- a fonte ABVE, a organização ABVE e a definição da métrica foram reutilizadas sem modificação;
- nenhum registro anterior foi alterado;
- nenhum identificador de piloto foi persistido;
- não foram criadas relações entre conteúdos, resoluções ou transições próprias da carga `0004`;
- não foram carregados totais de eletrificados, acumulados, participação, crescimento, projeções ou outras tecnologias;
- cada registro e vínculo da carga aparece exatamente uma vez.

## Saltos nos identificadores internos

Os identificadores internos não são necessariamente consecutivos. Sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e podem avançar em tentativas de `INSERT ... ON CONFLICT DO NOTHING`.

As validações descartáveis anteriores não deixaram linhas no banco, mas podem ter consumido valores das sequências. Esses saltos não representam registros apagados, duplicatas ou dados de teste persistidos e não afetam os identificadores estáveis.

## Conclusão

A carga canônica `0004` foi persistida com sucesso. O banco contém um único valor `27166`, `validated`, referente aos emplacamentos de veículos leves BEV durante agosto de 2026 no Brasil. A série mensal agora preserva julho e agosto em observações próprias, as cadeias factual e métrica são reconstruíveis, os registros anteriores permaneceram inalterados e o schema não mudou.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com commits e hashes documentados?
2. Fonte, organização e definição da métrica foram reutilizadas sem alteração, enquanto cada novo registro e vínculo aparece exatamente uma vez?
3. O valor persistido é exatamente `27166`, com unidade `vehicle_registration`, período de 1º a 31 de agosto de 2026, geografia Brasil e situação `validated`?
4. Está claro que `27166` é o resultado mensal de agosto, e não o total de eletrificados nem um acumulado?
5. A série contém exatamente julho `25782` e agosto `27166`, em observações distintas e sem percentual ou relação calculada persistida?
6. A cadeia factual e a cadeia métrica alcançam a mesma observação e permitem reconstruir a proveniência até a publicação da ABVE?
7. O acontecimento preserva `market_data`, `publication`, 9 de setembro de 2026, `accepted` e `confirmed`, sem alegar corroboração independente?
8. A assinatura idêntica demonstra que todos os registros anteriores permaneceram inalterados?
9. Está documentado que nenhum dado de piloto, número excluído, estrutura histórica indevida ou alteração de schema foi introduzido?
10. O conjunto de verificações permite considerar a persistência da carga canônica `0004` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
