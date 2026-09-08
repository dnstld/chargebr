# Resultado da carga canônica `0005`

## Estado

`EXECUTADA E ACEITA — AGUARDANDO MERGE`

Este documento registra a persistência do primeiro conflito quantitativo canônico do ChargeBR no Supabase. A execução ocorreu somente depois do `ACCEPTED` da pessoa revisora e do merge do [pacote de revisão](revisao-carga-canonica-0005.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0005_abve-tupi-pontos-recarga-fevereiro-2026.sql`](../data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.sql) |
| Verificação | [`0005_abve-tupi-pontos-recarga-fevereiro-2026.verify.sql`](../data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.verify.sql) |
| Resultado medido | Totais conflitantes de `21.061` e `21.060` pontos públicos e semipúblicos de recarga no Brasil até fevereiro de 2026 |
| Data da execução | 8 de setembro de 2026 |
| Autorização | Merge do PR #63 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `4af65de` |
| Commit da `main` usado | `9caa118` |
| SHA-256 da carga | `49cd23f619d81c47b804796b603b068073fa2c3c75e8b11dd66c27650f11b288` |
| SHA-256 da verificação | `d3922b9734bacee70ae4711cd1ee8b6136f3381440a23058b3d165c5615edf1b` |
| Resultado | `SUCCESS` |

Os dois arquivos da `main` eram byte a byte idênticos aos arquivos aceitos no commit `4af65de`. Nenhuma correção, transformação ou cópia manual da consulta foi aplicada durante a execução.

## Procedimento

1. O merge do PR #63 foi confirmado no GitHub.
2. A `main` foi sincronizada no commit `9caa118`.
3. A identidade dos dois arquivos foi confirmada contra o commit aceito e registrada por SHA-256.
4. A consulta reutilizável confirmou `load_0005_state = 'absent'`, ausência da carga `0004`, zero identificadores de piloto e a assinatura esperada das cargas `0001`–`0003`.
5. O arquivo da carga foi executado integralmente uma única vez entre `BEGIN` e `COMMIT`, com limite local de 30 segundos por instrução.
6. Todas as verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
7. O arquivo de verificação foi executado novamente sem modificação e retornou `load_0005_state = 'complete'`.
8. Uma consulta adicional reconstruiu os identificadores internos, valores, estados, origens e totais agregados persistidos.
9. O histórico de migrations, os acontecimentos aceitos e a ausência de identificadores de piloto foram conferidos.

## Registros persistidos e reutilizados

| Registro | Identificador interno | Identificador estável | Operação |
| --- | ---: | --- | --- |
| Fonte ABVE | 39 | `abve` | Reutilizada |
| Publicação de março | 64 | `canonical-0005-abve-rede-recarga-fevereiro-2026-2026-03-04` | Criada |
| Publicação de junho | 65 | `canonical-0005-abve-rede-recarga-maio-2026-2026-06-22` | Criada |
| Observação `21.061` | 85 | `canonical-0005-abve-21061-fevereiro-2026` | Criada |
| Observação `21.060` | 86 | `canonical-0005-abve-21060-fevereiro-2026` | Criada |
| Evidência de março | 85 | `canonical-0005-abve-tupi-base-nacional-fevereiro-2026` | Criada |
| Evidência de junho | 86 | `canonical-0005-abve-tupi-base-nacional-fevereiro-2026` | Criada |
| Acontecimento de março | 100 | `canonical-0005-abve-tupi-publicam-21061-fevereiro-2026-2026-03-04` | Criado |
| Acontecimento de junho | 101 | `canonical-0005-abve-tupi-referenciam-21060-fevereiro-2026-2026-06-22` | Criado |
| Organização ABVE | 34 | `abve` | Reutilizada |
| Organização Tupi Mobilidade | 39 | `tupi-mobilidade` | Criada |
| Definição da métrica | 13 | `public-semi-public-charging-points-brazil` | Criada |
| Valor `21.061` | 22 | Definição 13 + observação 85 + fevereiro de 2026 + Brasil | Criado |
| Valor `21.060` | 23 | Definição 13 + observação 86 + fevereiro de 2026 + Brasil | Criado |

Os identificadores internos foram gerados pelo banco. As duas evidências compartilham deliberadamente a chave de linhagem, mas possuem observações e publicações de origem diferentes.

## Valores quantitativos

| Campo | Publicação de março | Publicação de junho |
| --- | --- | --- |
| Valor numérico | `21061` | `21060` |
| Unidade canônica | `charging_point` | `charging_point` |
| Início do período | `2026-02-01` | `2026-02-01` |
| Fim do período | `2026-02-28` | `2026-02-28` |
| Geografia | Brasil | Brasil |
| Situação | `provisional` | `provisional` |
| Observação de origem | 85 | 86 |

O período representa uma fotografia consolidada da rede até fevereiro de 2026, não pontos instalados somente entre 1º e 28 de fevereiro.

`21.061` permanece documentado como o valor com suporte interno mais forte, pois coincide com as parcelas AC/DC e regionais publicadas. Essa avaliação não alterou seu estado e não criou precedência, substituição ou rejeição. `21.060` continua preservado como afirmação da publicação oficial de junho.

## Cadeias verificadas

### Cadeia de março

```text
fonte ABVE (39)
  → publicação de março (64)
  → observação 21.061 (85)
  → evidência likely_shared (85)
  → vínculo supports
  → acontecimento de março (100)
  ↘ valor provisional 21.061 (22)
  ↘ definição charging_point (13)
```

### Cadeia de junho

```text
fonte ABVE (39)
  → publicação de junho (65)
  → observação 21.060 (86)
  → evidência likely_shared (86)
  → vínculo supports
  → acontecimento de junho (101)
  ↘ valor provisional 21.060 (23)
  ↘ definição charging_point (13)
```

As cadeias compartilham a fonte, a definição da métrica, o período, a geografia e a chave de linhagem. Elas não compartilham publicação, observação, evidência, acontecimento ou valor.

## Organizações e vínculos

Cada acontecimento possui dois vínculos `subject`:

- ABVE, organização 34;
- Tupi Mobilidade, organização 39.

Foram persistidos quatro vínculos acontecimento–organização e dois vínculos acontecimento–evidência. A Tupi não foi criada como fonte porque o recorte não contém publicação hospedada em canal próprio da empresa.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0005` | `absent` | `complete` |
| Fonte ABVE reutilizada | 1 | 1 |
| Organização ABVE reutilizada | 1 | 1 |
| Publicações | 0 | 2 |
| Observações | 0 | 2 |
| Evidências | 0 | 2 |
| Acontecimentos | 0 | 2 |
| Organização Tupi Mobilidade | 0 | 1 |
| Definições de métrica | 0 | 1 |
| Valores de métrica | 0 | 2 |
| Vínculos acontecimento–evidência | 0 | 2 |
| Vínculos acontecimento–organização | 0 | 4 |
| Cadeias completas | 0 | 2 |
| Evidências `likely_shared` | 0 | 2 |
| Valores provisórios no mesmo escopo | 0 | 2 |
| Acontecimentos `accepted` e `confirmed` | 0 | 2 |
| Valores exatos | `NULL` | `[21060, 21061]` |
| Vínculos `subject` esperados | 0 | 4 |
| Registros da carga `0004` | 0 | 0 |
| Identificadores de piloto | 0 | 0 |
| Assinatura das cargas `0001`–`0003` | `7a4781c6bd808c7cc21da14ea88a1a09` | `7a4781c6bd808c7cc21da14ea88a1a09` |

A igualdade da assinatura compara integralmente os registros e vínculos das três cargas anteriores, incluindo identificadores internos e datas de controle. Nenhum deles foi modificado.

## Estado agregado do banco

| Verificação | Resultado |
| --- | ---: |
| Acontecimentos canônicos `accepted` | 5 |
| Acontecimentos `corroborated` | 1 |
| Migrations no histórico | 15 |
| Registros da carga `0004` | 0 |
| Identificadores de piloto | 0 |

Os cinco acontecimentos aceitos correspondem a um da carga `0001`, um da `0002`, um da `0003` e dois da `0005`. O único acontecimento `corroborated` continua sendo o da carga `0002`; os dois novos acontecimentos são `confirmed`.

## Ausência de alterações indevidas

- nenhuma migration foi aplicada;
- nenhuma tabela, coluna, índice, função, política ou permissão foi criada ou alterada;
- nenhuma linha das cargas `0001`, `0002` ou `0003` foi modificada;
- a carga `0004` permaneceu ausente;
- nenhum identificador de piloto foi persistido;
- não foram carregados `25.429`, componentes AC/DC, totais regionais, percentuais, tolerâncias ou publicações secundárias;
- nenhum valor foi elevado a `validated`, `superseded` ou `rejected`;
- cada registro e vínculo da carga `0005` aparece na quantidade esperada.

## Saltos nos identificadores internos

Os identificadores internos não são necessariamente consecutivos. Sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e podem consumir valores em tentativas de `INSERT ... ON CONFLICT DO NOTHING`.

As validações descartáveis anteriores não deixaram linhas no banco, mas consumiram valores das sequências. Esses saltos não representam registros apagados, duplicatas ou dados de teste persistidos e não afetam os identificadores estáveis.

## Conclusão

A carga canônica `0005` foi persistida com sucesso. O banco contém dois valores distintos e provisórios para a mesma métrica, período e geografia, cada um reconstruível até sua publicação oficial. A maior consistência documental de `21.061` foi preservada sem resolver artificialmente o conflito. As cargas anteriores permaneceram inalteradas, a carga `0004` continuou ausente e o schema não mudou.

O resultado deve ser revisado e incorporado à `main` antes da conclusão formal do quinto ciclo.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com commits e hashes documentados?
2. Os registros persistidos correspondem às quantidades, identificadores e operações descritos?
3. Os valores são exatamente `21061` e `21060`, ambos com unidade `charging_point`, período de fevereiro de 2026, geografia Brasil e situação `provisional`?
4. Está claro que o período representa a base consolidada até fevereiro, e não instalações ocorridas somente durante o mês?
5. As duas cadeias preservam publicações, observações, evidências, acontecimentos e valores próprios sob uma definição e uma linhagem compartilhadas?
6. `likely_shared`, `confirmed`, `accepted` e `provisional` mantiveram os sentidos aprovados, sem alegar corroboração independente ou escolher um vencedor?
7. A fonte ABVE e a organização ABVE foram reutilizadas corretamente, enquanto a Tupi foi criada apenas como organização?
8. A assinatura idêntica demonstra que as cargas `0001`, `0002` e `0003` permaneceram inalteradas?
9. Está documentado que a carga `0004` permaneceu ausente e que nenhum dado de piloto, número excluído ou alteração de schema foi introduzido?
10. O conjunto de verificações permite considerar a persistência da carga canônica `0005` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 8 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o resultado da execução e não solicitou correções. O PR está liberado para merge. Depois do merge, o quinto ciclo poderá ser concluído formalmente.
