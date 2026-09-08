# Resultado da carga canônica `0006`

## Estado

`EXECUTADA — PROPOSTA PARA REVISÃO`

Este documento registra a persistência da primeira resolução quantitativa canônica do ChargeBR no Supabase. A execução ocorreu somente depois do `ACCEPTED` de Denis Toledo e do merge do [pacote de revisão](revisao-carga-canonica-0006.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0006_abve-correcao-emplacamentos-sao-paulo-2024.sql`](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.sql) |
| Verificação | [`0006_abve-correcao-emplacamentos-sao-paulo-2024.verify.sql`](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.verify.sql) |
| Resultado medido | Correção dos emplacamentos de veículos leves eletrificados no Estado de São Paulo em 2024 |
| Data da execução | 8 de setembro de 2026 |
| Autorização | Merge do PR #71 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `4830a85` |
| Commit da `main` usado | `9ffd2ed` |
| SHA-256 da carga | `4ee538dfb46013ccf5b81f6ba2cc1f966b14dfd511d54d8434fdb0dcbd187abb` |
| SHA-256 da verificação | `4e73d195348c2eeae18586fea9ac8a85e96fc05a66bfadc99ffa61227bc50e6d` |
| Resultado | `SUCCESS` |

Os dois arquivos da `main` eram byte a byte idênticos aos arquivos aceitos. Nenhuma correção, transformação ou cópia manual do SQL foi feita durante a execução.

## Procedimento

1. O merge do PR #71 foi confirmado e a `main` foi sincronizada no commit `9ffd2ed`.
2. Os hashes dos arquivos foram comparados com os registrados no pacote aceito.
3. O changelog atual e as orientações de transações e inserções idempotentes do Supabase foram conferidos; nenhuma mudança relevante afetava o procedimento.
4. A consulta reutilizável confirmou `load_0006_state = 'absent'`, assinatura anterior `55c6b481a8022792824e9e1de0240c70`, carga `0004` ausente e nenhum identificador de piloto.
5. O arquivo aceito foi executado integralmente uma única vez entre `BEGIN` e `COMMIT`.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
7. A consulta reutilizável foi executada novamente sem modificação e retornou `load_0006_state = 'complete'`.
8. Uma consulta adicional reconstruiu identificadores, valores, situações, relação, resolução, transições e contagens persistidas.

## Registros persistidos e reutilizados

| Registro | Identificador interno | Identificador estável | Operação |
| --- | ---: | --- | --- |
| Fonte ABVE | 39 | `abve` | Reutilizada |
| Organização ABVE | 34 | `abve` | Reutilizada |
| Definição da métrica | 16 | `annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification` | Criada |
| Primeira edição reconstruída | 70 | `canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao` | Criada |
| Edição corrigida | 71 | `canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida` | Criada |
| Observação `24.435` | 91 | `canonical-0006-abve-sp-24435-primeira-edicao` | Criada |
| Observação `56.819` | 92 | `canonical-0006-abve-sp-56819-edicao-corrigida` | Criada |
| Evidência da primeira atribuição | 91 | `canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024` | Criada |
| Evidência da correção | 92 | `canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024` | Criada |
| Valor `24.435` | 28 | Definição 16 + observação 91 + Estado de São Paulo + 2024 | Criado |
| Valor `56.819` | 29 | Definição 16 + observação 92 + Estado de São Paulo + 2024 | Criado |
| Acontecimento da publicação | 106 | `canonical-0006-abve-publica-24435-estado-sp-2025-01-06` | Criado |
| Acontecimento da correção | 107 | `canonical-0006-abve-corrige-56819-estado-sp-2025-01-07` | Criado |
| Resolução | 3 | `canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024` | Criada |
| Transição de `24.435` | 5 | `canonical-0006-abve-sp-24435-provisional-rejected` | Criada |
| Transição de `56.819` | 6 | `canonical-0006-abve-sp-56819-provisional-validated` | Criada |

Os identificadores internos foram gerados pelo banco. As duas evidências possuem a mesma chave de linhagem porque pertencem à mesma correção oficial, mas continuam ligadas a observações distintas.

## Valores e situações persistidas

| Campo | Primeira edição | Edição corrigida |
| --- | --- | --- |
| Valor numérico | `24435` | `56819` |
| Unidade | `vehicle_registration` | `vehicle_registration` |
| Período inicial | `2024-01-01` | `2024-01-01` |
| Período final | `2024-12-31` | `2024-12-31` |
| Geografia | Estado de São Paulo, Brasil | Estado de São Paulo, Brasil |
| Situação atual | `rejected` | `validated` |

`24435` foi rejeitado somente como valor estadual. O número continua correto para a cidade de São Paulo segundo a própria correção, mas o recorte municipal não foi persistido.

`56819` foi validado como o valor atribuído pela ABVE ao Estado de São Paulo no balanço de 2024. Isso registra a correção da publicadora; não afirma auditoria independente da base de emplacamentos.

## Relação entre as versões

A relação persistida contém:

| Campo | Valor |
| --- | --- |
| Versão anterior | Conteúdo 70 |
| Versão posterior | Conteúdo 71 |
| Tipo | `corrects` |
| Data | `2025-01-07` |
| Evidência | 92 |

As duas versões compartilham fonte, URL, título e data editorial de 6 de janeiro de 2025. A relação e o acontecimento 107 preservam o momento posterior da correção. A verificação confirmou que não existe ciclo entre versões.

A primeira edição permanece `metadata_only`, sem trecho ou captura atribuída artificialmente. Sua observação e sua evidência declaram que `24.435` foi reconstruído da nota oficial atualmente acessível. As duas evidências apontam para o conteúdo corrigido 71 como origem documental conhecida.

## Resolução e transições

A resolução 3 possui tipo `material_correction` e aponta para o acontecimento 107, ocorrido em 7 de janeiro de 2025. Ela registra separadamente:

- a correção publicada pela ABVE em 2025;
- o aceite da representação pelo ChargeBR, feito por Denis Toledo em 8 de setembro de 2026;
- a referência documental `docs/revisao-carga-canonica-0006.md`.

As transições persistidas são:

```text
valor 24.435 (28)
  provisional → rejected
  substituto: valor 56.819 (29)

valor 56.819 (29)
  provisional → validated
  substituto: nenhum
```

A consulta confirmou que a situação atual de cada valor coincide com o destino de sua transição mais recente.

## Cadeias verificadas

### Primeira edição

```text
fonte ABVE (39)
  → conteúdo histórico reconstruído (70)
  → observação 24.435 (91)
  → evidência com origem no conteúdo corrigido (91)
  → acontecimento da publicação (106)
  ↘ valor estadual rejected (28)
     → transição 5
     → substituto 56.819 (29)
```

### Correção

```text
fonte ABVE (39)
  → conteúdo corrigido (71)
  → observação 56.819 (92)
  → evidência da correção (92)
  → acontecimento da correção (107)
  → resolução material_correction (3)
  ↘ valor estadual validated (29)
     → transição 6
```

O acontecimento da correção também recebe a evidência inicial como `contextualizes`, para explicar qual erro foi corrigido. A ABVE, organização 34, é o sujeito dos dois acontecimentos.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0006` | `absent` | `complete` |
| Fonte ABVE reutilizada | 1 | 1 |
| Organização ABVE reutilizada | 1 | 1 |
| Versões de conteúdo | 0 | 2 |
| Observações | 0 | 2 |
| Evidências | 0 | 2 |
| Acontecimentos | 0 | 2 |
| Definições de métrica | 0 | 1 |
| Valores métricos | 0 | 2 |
| Vínculos acontecimento–evidência | 0 | 3 |
| Vínculos acontecimento–organização | 0 | 2 |
| Relações entre versões | 0 | 1 |
| Resoluções | 0 | 1 |
| Transições | 0 | 2 |
| Valores exatos | `NULL` | `[24435, 56819]` |
| Situações atuais | `NULL` | `[rejected, validated]` |
| Rejeição com substituto | 0 | 1 |
| Validação sem substituto | 0 | 1 |
| Relações cíclicas | 0 | 0 |
| Registros da carga `0004` | 0 | 0 |
| Identificadores de piloto | 0 | 0 |
| Assinatura dos registros anteriores | `55c6b481a8022792824e9e1de0240c70` | `55c6b481a8022792824e9e1de0240c70` |

A assinatura idêntica compara integralmente os registros e vínculos anteriores excluídos do escopo da carga `0006`. Nenhum deles foi modificado.

## Contagens agregadas do banco

| Estrutura | Antes | Depois |
| --- | ---: | ---: |
| `sources` | 4 | 4 |
| `content_items` | 6 | 8 |
| `observations` | 6 | 8 |
| `evidence` | 6 | 8 |
| `events` | 5 | 7 |
| `event_evidence` | 6 | 9 |
| `metric_definitions` | 2 | 3 |
| `metric_values` | 3 | 5 |
| `organizations` | 4 | 4 |
| `event_organizations` | 7 | 9 |
| `content_item_relations` | 0 | 1 |
| `metric_value_resolutions` | 0 | 1 |
| `metric_value_status_transitions` | 0 | 2 |

O banco passou a ter sete acontecimentos `accepted`: seis `confirmed` e um `corroborated`. O histórico permanece com 16 migrations, pois a carga inseriu dados e não alterou o schema.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, política ou permissão foi criada ou alterada;
- a fonte e a organização ABVE foram reutilizadas sem modificação;
- nenhum registro anterior foi alterado;
- a carga `0004` permaneceu ausente;
- nenhum identificador de piloto foi persistido;
- o valor municipal não foi criado como métrica;
- demais estados, municípios, totais nacionais, percentuais e tecnologias ficaram fora;
- nenhuma reprodução secundária foi adicionada;
- o conflito `0005` não foi resolvido ou modificado;
- cada registro e vínculo da carga `0006` aparece na quantidade esperada.

## Saltos nos identificadores internos

Os identificadores internos não são necessariamente consecutivos. Sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e também podem avançar em tentativas idempotentes.

Os ensaios descartáveis anteriores não deixaram linhas no banco, mas consumiram valores das sequências. Esses saltos não representam dados de teste persistidos, duplicatas ou registros apagados.

## Conclusão

A carga canônica `0006` foi persistida com sucesso. O banco preserva a versão inicial reconstruída, a edição corrigida, a relação explícita entre elas, os dois valores estaduais, a decisão de resolução e as duas transições de situação. A limitação documental da primeira edição continua visível, o valor municipal não foi importado e os registros anteriores permaneceram inalterados.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com commits e hashes documentados?
2. Os registros persistidos correspondem às quantidades, identificadores e operações descritos?
3. Está correto manter duas versões da mesma página, com data editorial de 6/1/2025 e relação `corrects` datada de 7/1/2025?
4. A ausência de captura integral da primeira edição e a reconstrução de `24.435` pela nota oficial continuam declaradas com clareza?
5. Os valores possuem exatamente a mesma métrica, período, unidade e geografia estadual, com `24435` em `rejected` e `56819` em `validated`?
6. A transição do valor rejeitado aponta corretamente para `56819`, enquanto a transição do valor validado não possui substituto?
7. A resolução separa corretamente a correção da ABVE em 2025 do aceite de Denis Toledo em 2026?
8. A assinatura idêntica, a ausência da carga `0004` e zero identificadores de piloto demonstram que o conteúdo anterior permaneceu íntegro?
9. Está documentado que nenhum schema, migration, fonte, organização, número excluído ou fonte secundária foi introduzido indevidamente?
10. O conjunto de verificações permite considerar a persistência da carga canônica `0006` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | — |
