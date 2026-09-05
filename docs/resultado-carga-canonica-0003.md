# Resultado da carga canônica `0003`

## Estado

`EXECUTADA E ACEITA — AGUARDANDO MERGE`

Este documento registra a persistência do primeiro valor quantitativo canônico do ChargeBR no Supabase. A execução ocorreu somente depois do `ACCEPTED` da pessoa revisora e do merge do [pacote de revisão](revisao-carga-canonica-0003.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0003_abve-bev-emplacamentos-julho-2026.sql`](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.sql) |
| Verificação | [`0003_abve-bev-emplacamentos-julho-2026.verify.sql`](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.verify.sql) |
| Resultado medido | 25.782 emplacamentos de veículos leves BEV no Brasil durante julho de 2026 |
| Data da execução | 5 de setembro de 2026 |
| Autorização | Merge do PR #56 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `1965814` |
| Commit da `main` usado | `6603b1f` |
| SHA-256 da carga | `3440df354a7a7174d966f9ecf1c9c9f889382810f0bd32ee8eddd2c6acdcce63` |
| SHA-256 da verificação | `48a6256f60b233db9fde9bc80c04a75f28325b7a1115e6b97bf1fef9b5a3bf0f` |
| Resultado | `SUCCESS` |

Os dois arquivos da `main` eram byte a byte idênticos aos arquivos aceitos no commit `1965814`. Nenhuma correção, transformação ou cópia manual da consulta foi aplicada durante a execução.

## Procedimento

1. O merge do PR #56 foi confirmado no GitHub.
2. A `main` foi sincronizada no commit `6603b1f`.
3. A identidade dos dois arquivos foi confirmada por SHA-256 contra o commit aceito.
4. A consulta reutilizável confirmou `load_0003_state = 'absent'`, zero identificadores de piloto e a assinatura esperada das cargas `0001` e `0002`.
5. O arquivo da carga foi executado integralmente uma única vez entre `BEGIN` e `COMMIT`, com limite local de 30 segundos por instrução.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
7. O arquivo de verificação foi executado novamente sem modificação e retornou `load_0003_state = 'complete'`.
8. Uma consulta adicional reconstruiu a cadeia factual, a cadeia métrica, os vínculos e os identificadores internos persistidos.
9. O histórico de migrations, os acontecimentos aceitos e a ausência de identificadores de piloto foram conferidos.

## Registros persistidos

| Registro | Identificador interno | Identificador estável | Contagem |
| --- | ---: | --- | ---: |
| Fonte | 39 | `abve` | 1 |
| Publicação | 55 | `canonical-0003-abve-data-bev-julho-2026-2026-08-11` | 1 |
| Observação | 76 | `canonical-0003-abve-bev-emplacamentos-julho-2026` | 1 |
| Evidência | 76 | `canonical-0003-abve-data-bev-julho-2026` | 1 |
| Acontecimento | 91 | `canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11` | 1 |
| Organização | 34 | `abve` | 1 |
| Definição de métrica | 8 | `monthly-light-bev-registrations-brazil` | 1 |
| Valor de métrica | 13 | definição 8 + observação 76 + julho de 2026 + Brasil | 1 |

Os identificadores internos foram gerados pelo banco. Os identificadores estáveis e a chave composta do valor são os elementos usados para impedir duplicação e reconstruir o recorte.

## Valor quantitativo

| Campo | Resultado persistido |
| --- | --- |
| Valor numérico | `25782` |
| Unidade canônica | `vehicle_registration` |
| Início do período | `2026-07-01` |
| Fim do período | `2026-07-31` |
| Geografia | Brasil |
| Situação do valor | `validated` |
| Tecnologia incluída | Veículos leves 100% elétricos — BEV |

O valor representa somente os emplacamentos ocorridos durante julho de 2026. Ele não representa o acumulado de janeiro a julho e não inclui PHEV, HEV, HEV Flex ou MHEV.

A grafia publicada `25.782` foi armazenada como o número inteiro `25782`. Nenhum cálculo, arredondamento, estimativa ou conversão de unidade foi realizado.

## Cadeias verificadas

### Cadeia factual

```text
fonte ABVE (39)
  → publicação (55)
  → observação (76)
  → evidência established (76)
  → vínculo supports
  → acontecimento (91)
```

### Cadeia métrica

```text
observação (76)
  → valor validated (13)
  → definição approved (8)
  → 25782 vehicle_registration
  → 01/07/2026 a 31/07/2026
  → Brasil
```

As duas cadeias compartilham a mesma observação de origem. Assim, o valor estruturado pode ser rastreado até a publicação exata e o acontecimento pode ser rastreado até a mesma evidência.

## Estado do acontecimento

| Verificação | Resultado |
| --- | --- |
| Identificador interno | 91 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-08-11` |
| Precisão | `day` |
| Geografia | Brasil |
| Situação | `accepted` |
| Nível de verificação | `confirmed` |
| Organização central | ABVE, identificador 34, vínculo `subject` |
| Evidência | Identificador 76, vínculo `supports` |

A data de 11 de agosto é a data em que a ABVE publicou o resultado. O período de 1º a 31 de julho é o mês medido e permanece em `metric_values`.

`confirmed` preserva que uma fonte primária sustenta aquilo que a própria ABVE Data publicou. A execução não elevou o acontecimento a `corroborated`, pois nenhuma linhagem independente foi incorporada.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0003` | `absent` | `complete` |
| Fontes | 0 | 1 |
| Publicações | 0 | 1 |
| Observações | 0 | 1 |
| Evidências | 0 | 1 |
| Acontecimentos | 0 | 1 |
| Organizações | 0 | 1 |
| Definições de métrica | 0 | 1 |
| Valores de métrica | 0 | 1 |
| Vínculos acontecimento–evidência | 0 | 1 |
| Vínculos acontecimento–organização | 0 | 1 |
| Cadeias completas | 0 | 1 |
| Evidências `established` ligadas por `supports` | 0 | 1 |
| Valores mensais `25782` e `validated` | 0 | 1 |
| Identificadores de piloto | 0 | 0 |
| Assinatura conjunta das cargas `0001` e `0002` | `7cc4c60de77d59f68fa621f522f776e4` | `7cc4c60de77d59f68fa621f522f776e4` |

A igualdade da assinatura compara integralmente os registros e vínculos das duas cargas anteriores, incluindo seus identificadores internos e datas de controle. Nenhum deles foi modificado.

## Estado agregado do banco

| Verificação | Resultado |
| --- | ---: |
| Acontecimentos canônicos `accepted` | 3 |
| Acontecimentos `corroborated` | 1 |
| Migrations no histórico | 15 |
| Identificadores de piloto | 0 |

Os três acontecimentos aceitos correspondem às cargas canônicas `0001`, `0002` e `0003`. O único acontecimento `corroborated` continua sendo o da carga `0002`; a carga atual é `confirmed`.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, política ou permissão foi criada ou alterada;
- nenhuma linha das cargas `0001` e `0002` foi modificada;
- nenhum identificador de piloto foi persistido;
- não foram carregados valores acumulados, percentuais, comparações, outras tecnologias, projeções ou rankings;
- cada registro e vínculo da carga `0003` aparece exatamente uma vez;
- o valor mensal permaneceu separado da data de publicação.

## Saltos nos identificadores internos

Os identificadores internos não são necessariamente consecutivos em relação às cargas anteriores. Isso é esperado porque sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e podem consumir valores em tentativas de `INSERT ... ON CONFLICT DO NOTHING`.

As validações descartáveis anteriores não deixaram linhas no banco, mas consumiram valores das sequências. Esses saltos:

- não representam registros canônicos apagados;
- não são duplicatas nem dados de teste persistidos;
- não afetam identificadores estáveis, vínculos ou contagens;
- não exigem reinício ou manipulação das sequências.

## Conclusão

A carga canônica `0003` foi persistida com sucesso. O banco contém um único valor `25782`, `validated`, referente aos emplacamentos de veículos leves BEV durante julho de 2026 no Brasil. A cadeia factual e a cadeia métrica são reconstruíveis, as cargas anteriores permaneceram integralmente inalteradas, nenhum dado de piloto foi introduzido e o schema não mudou.

O resultado deve ser revisado e incorporado à `main` antes da conclusão formal do terceiro ciclo.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com os commits e hashes documentados?
2. Cada fonte, publicação, observação, evidência, acontecimento, organização, definição, valor e vínculo aparece exatamente uma vez?
3. O valor persistido é exatamente `25782`, com unidade `vehicle_registration`, período de 1º a 31 de julho de 2026, geografia Brasil e situação `validated`?
4. Está claro que o valor é mensal e não representa o acumulado de janeiro a julho?
5. A cadeia factual e a cadeia métrica alcançam a mesma observação e permitem reconstruir a proveniência até a publicação da ABVE?
6. O acontecimento preserva `market_data`, `publication`, 11 de agosto de 2026, `accepted` e `confirmed`, sem alegar corroboração independente?
7. Fonte e organização representam corretamente os papéis distintos de canal institucional e sujeito publicador?
8. A assinatura idêntica demonstra que as cargas `0001` e `0002` permaneceram inalteradas?
9. Está documentado que nenhum dado de piloto, número excluído ou alteração de schema foi introduzido?
10. O conjunto de verificações permite considerar a persistência da carga canônica `0003` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 5 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o resultado da execução e não solicitou correções. O PR está liberado para merge. Depois do merge, o terceiro ciclo poderá ser concluído formalmente.
