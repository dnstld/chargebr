# Resultado da carga canônica `0007`

## Estado

`EXECUTADA E ACEITA — AGUARDANDO MERGE`

Este documento registra a persistência da primeira revisão metodológica quantitativa canônica do ChargeBR no Supabase. A execução ocorreu somente depois do `ACCEPTED` de Denis Toledo e do merge do [pacote de revisão](revisao-carga-canonica-0007.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql`](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql) |
| Verificação | [`0007_abve-revisao-metodologica-eletrificados-janeiro-2025.verify.sql`](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.verify.sql) |
| Resultado medido | Revisão da classificação ABVE Data dos emplacamentos mensais de veículos leves eletrificados no Brasil |
| Data da execução | 11 de setembro de 2026 |
| Autorização | Merge do PR #83 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `b04e234` |
| Commit da `main` usado | `f44c8a2` |
| SHA-256 da carga | `41fcbf280b8a3940db361efad39f8792399416f543a3b0fde4f7d90c07ffec86` |
| SHA-256 da verificação | `6da79e5319dcce4bcbe8b85786166fc1b813e2554725ef52ec52eb19de2e9956` |
| Resultado | `SUCCESS` |

Os dois arquivos da `main` eram byte a byte idênticos aos arquivos aceitos. Nenhuma correção, transformação ou cópia manual do SQL foi feita durante a execução.

## Procedimento

1. O merge do PR #83 foi confirmado e a `main` foi sincronizada no commit `f44c8a2`.
2. Os hashes dos arquivos foram comparados com os registrados no pacote aceito.
3. O changelog atual do Supabase foi conferido; nenhuma mudança relevante afetava esta carga de dados transacional.
4. A consulta reutilizável confirmou `load_0007_state = 'absent'` e assinatura anterior `5cbe217edb134cf2b02352cd7910f9ed`.
5. O arquivo aceito foi executado integralmente uma única vez entre `BEGIN` e `COMMIT`.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
7. A consulta reutilizável foi executada novamente sem modificação e retornou `load_0007_state = 'complete'`.
8. Uma consulta adicional reconstruiu os identificadores, valores, papéis, metodologias, acontecimentos e contagens persistidas.

## Registros persistidos e reutilizados

| Registro | Identificador interno | Identificador estável | Operação |
| --- | ---: | --- | --- |
| Fonte ABVE | 39 | `abve` | Reutilizada |
| Organização ABVE | 34 | `abve` | Reutilizada |
| Publicação do anúncio | 71 | `canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida` | Reutilizada da carga `0006` |
| Publicação do primeiro resultado | 83 | `canonical-0007-abve-classificacao-eletrificados-janeiro-2025-2025-02-10` | Criada |
| Publicação da confirmação posterior | 84 | `canonical-0007-abve-confirma-classificacao-janeiro-2026-2026-02-09` | Criada |
| Definição da métrica | 21 | `monthly-light-electrified-vehicle-registrations-brazil-abve-classification` | Criada |
| Metodologia anterior | 9 | `canonical-0007-abve-classificacao-anterior-com-mhev` | Criada |
| Metodologia vigente | 10 | `canonical-0007-abve-classificacao-vigente-sem-mhev` | Criada |
| Valor principal `12556` | 41 | Observação 117 + metodologia 10 | Criado |
| Valor contrafactual `16502` | 42 | Observação 118 + metodologia 9 | Criado |

Os identificadores internos foram gerados pelo banco. A publicação 71 foi reutilizada sem alteração porque já preservava o anúncio da mudança prospectiva feito pela ABVE em 6 de janeiro de 2025.

## Observações e evidências

| Função | Observação | Evidência | Identificador estável |
| --- | ---: | ---: | --- |
| Anúncio dos critérios | 116 | 116 | `canonical-0007-abve-anuncia-criterios-eletrificados-2025` |
| Resultado pela metodologia vigente | 117 | 117 | `canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente` |
| Comparação pelo critério anterior | 118 | 118 | `canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior` |
| Contexto MHEV | 119 | 119 | `canonical-0007-abve-mhev-janeiro-2025` |
| Continuidade metodológica | 120 | 120 | `canonical-0007-abve-confirma-classificacao-eletrificados-2026` |

As cinco evidências ficaram `established` e apontam para uma versão de conteúdo conhecida. Isso identifica a origem documental usada; não afirma auditoria independente da base de emplacamentos da ABVE.

## Valores e metodologias persistidos

| Campo | Resultado principal | Comparação contrafactual |
| --- | --- | --- |
| Identificador do valor | 41 | 42 |
| Valor numérico | `12556` | `16502` |
| Período | 1/1/2025 a 31/1/2025 | 1/1/2025 a 31/1/2025 |
| Geografia | Brasil | Brasil |
| Unidade | `vehicle_registration` | `vehicle_registration` |
| Situação | `validated` | `validated` |
| Versão metodológica | 10 — vigente sem MHEV no total | 9 — anterior com MHEV no total |
| Origem | `source_published` | `source_published` |
| Papel | `primary` | `counterfactual` |

Os dois valores pertencem à mesma definição conceitual. Os papéis estruturados impedem que `16502` seja apresentado como o resultado principal de janeiro de 2025, sem tratá-lo como erro factual.

A observação 119 preserva `3946` MHEV, divididos pela fonte em `2883` MHEV de 12 V e `1063` MHEV de 48 V. Nenhuma linha adicional foi criada em `metric_values` para esse contexto.

## Componentes e substituição metodológica

As duas versões possuem cinco componentes consultáveis:

| Versão | BEV | PHEV | HEV | HEV Flex | MHEV |
| --- | --- | --- | --- | --- | --- |
| 9 — anterior | `included` | `included` | `included` | `included` | `included` |
| 10 — vigente | `included` | `included` | `included` | `included` | `reported_separately` |

A versão 10 possui `applies_from = 2025-01-01`. A data inicial da versão 9 permanece nula porque não foi determinada no recorte documental.

Uma relação `supersedes` liga a versão 9 à versão 10 com vigência em 1º de janeiro de 2025. A consulta confirmou uma única relação exata e nenhum ciclo. Essa substituição define o método principal vigente; ela não rejeita ou invalida o valor contrafactual associado ao critério anterior.

## Evidência metodológica

Foram persistidos seis vínculos:

| Tipo | Quantidade | Função |
| --- | ---: | --- |
| `defines` | 2 | Definir a composição de cada versão |
| `announces` | 1 | Registrar o anúncio prospectivo da metodologia vigente |
| `confirms` | 1 | Confirmar posteriormente sua continuidade |
| `contextualizes` | 2 | Explicar o tratamento de MHEV nas duas versões |

Assim, a metodologia não depende apenas de descrição livre. Anúncio, definição inicial, contexto quantitativo e confirmação posterior podem ser consultados separadamente.

## Acontecimentos persistidos

| Identificador | Fase | Data | Identificador estável |
| ---: | --- | --- | --- |
| 123 | `announcement` | 6/1/2025 | `canonical-0007-abve-anuncia-revisao-metodologica-2025-01-06` |
| 124 | `publication` | 10/2/2025 | `canonical-0007-abve-publica-eletrificados-janeiro-2025-2025-02-10` |
| 125 | `update` | 9/2/2026 | `canonical-0007-abve-confirma-metodologia-eletrificados-2026-02-09` |

Os três acontecimentos ficaram `confirmed` e `accepted`. A ABVE, organização 34, foi vinculada como sujeito de cada um. Os resultados referentes a janeiro de 2026 não foram importados; a última publicação foi usada somente para confirmar a continuidade metodológica e a referência histórica a `12556`.

## Cadeias verificadas

### Resultado principal

```text
fonte ABVE (39)
  → conteúdo do resultado (83)
  → observação 12.556 (117)
  → evidência da metodologia vigente (117)
  → acontecimento da publicação (124)
  ↘ valor validated (41)
     → metodologia vigente (10)
     → papel primary
```

### Comparação contrafactual

```text
fonte ABVE (39)
  → conteúdo do resultado (83)
  → observação 16.502 (118)
  → evidência do critério anterior (118)
  → acontecimento da publicação (124)
  ↘ valor validated (42)
     → metodologia anterior (9)
     → papel counterfactual
```

### História metodológica

```text
anúncio reutilizado (conteúdo 71)
  → metodologia vigente (10)

metodologia anterior (9)
  → supersedes em 1/1/2025
  → metodologia vigente (10)
  → confirmação posterior (conteúdo 84)
```

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0007` | `absent` | `complete` |
| Fonte ABVE reutilizada | 1 | 1 |
| Organização ABVE reutilizada | 1 | 1 |
| Anúncio reutilizado | 1 | 1 |
| Novas versões de conteúdo | 0 | 2 |
| Observações | 0 | 5 |
| Evidências | 0 | 5 |
| Acontecimentos | 0 | 3 |
| Definições de métrica | 0 | 1 |
| Valores métricos | 0 | 2 |
| Vínculos acontecimento–evidência | 0 | 5 |
| Vínculos acontecimento–organização | 0 | 3 |
| Versões metodológicas | 0 | 2 |
| Componentes metodológicos | 0 | 10 |
| Vínculos metodologia–evidência | 0 | 6 |
| Relações entre metodologias | 0 | 1 |
| Atribuições valor–metodologia | 0 | 2 |
| Valores exatos | `NULL` | `[12556, 16502]` |
| Papéis dos valores | `NULL` | `[primary, counterfactual]` |
| Relações cíclicas | 0 | 0 |
| Registros indesejados | 0 | 0 |
| Identificadores de piloto | 0 | 0 |
| Assinatura dos registros anteriores | `5cbe217edb134cf2b02352cd7910f9ed` | `5cbe217edb134cf2b02352cd7910f9ed` |

A assinatura idêntica compara integralmente os registros e vínculos anteriores excluídos do escopo da carga `0007`. Nenhum deles foi modificado.

## Contagens agregadas do banco

| Estrutura | Antes | Depois |
| --- | ---: | ---: |
| `sources` | 4 | 4 |
| `content_items` | 9 | 11 |
| `observations` | 9 | 14 |
| `evidence` | 9 | 14 |
| `events` | 8 | 11 |
| `event_evidence` | 10 | 15 |
| `metric_definitions` | 3 | 4 |
| `metric_values` | 6 | 8 |
| `organizations` | 4 | 4 |
| `event_organizations` | 10 | 13 |
| `content_item_relations` | 1 | 1 |
| `metric_value_resolutions` | 1 | 1 |
| `metric_value_status_transitions` | 2 | 2 |
| `metric_methodology_versions` | 0 | 2 |
| `metric_methodology_components` | 0 | 10 |
| `metric_methodology_evidence` | 0 | 6 |
| `metric_methodology_relations` | 0 | 1 |
| `metric_value_methodology_assignments` | 0 | 2 |

O histórico permaneceu com `17` migrations, pois a carga inseriu dados e não alterou o schema.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, política ou permissão foi criada ou alterada;
- a fonte, a organização e a publicação do anúncio foram reutilizadas sem modificação;
- nenhum registro anterior foi alterado;
- nenhum identificador de piloto foi persistido;
- nenhum valor anual de 2024 ou resultado de 2026 foi adicionado;
- `3946` não foi criado como valor métrico;
- nenhum valor calculado ou derivado pelo ChargeBR foi criado;
- nenhuma resolução, transição de situação ou relação de correção foi introduzida;
- nenhuma data inicial foi inventada para o critério anterior;
- cada registro e vínculo da carga `0007` aparece na quantidade esperada.

## Saltos nos identificadores internos

Os identificadores internos não são necessariamente consecutivos. Sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e também podem avançar em tentativas idempotentes.

Os ensaios descartáveis anteriores não deixaram linhas no banco, mas consumiram valores das sequências. Esses saltos não representam dados de teste persistidos, duplicatas ou registros apagados.

## Conclusão

A carga canônica `0007` foi persistida com sucesso. O banco preserva uma única métrica conceitual, as metodologias anterior e vigente, a composição de cada uma, a relação temporal entre elas e os papéis distintos dos dois valores publicados. O ChargeBR pode apresentar `12556` como resultado principal de janeiro de 2025 e manter `16502` como comparação pelo critério anterior sem apagar a história, inventar conflito factual ou tratar vigência metodológica como situação do valor.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com commits e hashes documentados?
2. Os registros persistidos correspondem às quantidades, identificadores e operações descritos?
3. Está correto manter `12556` e `16502` como `validated`, com os papéis `primary` e `counterfactual` respectivamente?
4. Está correto ligar os dois valores à mesma definição conceitual, mas a versões metodológicas diferentes?
5. Os dez componentes preservam corretamente a mudança do tratamento de MHEV entre os dois critérios?
6. A relação `supersedes` em 1º de janeiro de 2025 determina a vigência sem invalidar o critério anterior?
7. `3946` permanece corretamente como contexto documental e não como terceiro valor da métrica?
8. Os seis vínculos de evidência metodológica permitem reconstruir anúncio, definição, contexto e confirmação posterior?
9. A assinatura idêntica, a ausência de ciclos, zero registros indesejados e zero identificadores de piloto demonstram que o conteúdo anterior permaneceu íntegro?
10. Está documentado que nenhuma migration, alteração de schema, número excluído, cálculo derivado ou confirmação independente foi introduzida?
11. O conjunto de verificações permite considerar a persistência da carga canônica `0007` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o resultado da execução e não solicitou correções. O PR está liberado para merge. Depois do merge, o sétimo ciclo poderá ser concluído formalmente.
