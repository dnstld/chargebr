# Segunda revisão independente de `PILOT-03`

## Estado

`CONCLUIDA — ACCEPTED`

Este documento congelou a primeira versão corrigida dos registros de `PILOT-03` para sua segunda revisão independente. A revisão foi concluída com resultado [`ACCEPTED`](resultado-revisao-pilot-03-correcao-01.md).

## Identificação do objeto a revisar

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-03` |
| Revisão | Segunda revisão — correção 01 |
| Versão corrigida | Commit [`f31bc6b599859fa114b54bf18219f65fbd91844c`](https://github.com/dnstld/chargebr/commit/f31bc6b599859fa114b54bf18219f65fbd91844c) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `49bac2db8d4b94a18be86ad3908b030661746327ea874779f9ad3c081270485d` |
| Versão anterior | Commit [`ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0`](https://github.com/dnstld/chargebr/commit/ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0) |
| Resultado anterior | [`CORRECTION_REQUIRED`](resultado-revisao-pilot-03.md) |
| Lacuna a verificar | `P03-REG-01` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 2 de setembro de 2026 |
| Resultado | [`ACCEPTED`](resultado-revisao-pilot-03-correcao-01.md) |

O commit da versão corrigida é a referência imutável desta revisão. O merge na `main` ocorreu depois, sem modificar o conteúdo do seed.

## Fontes do caso

- [Publicação da ABVE de 4 de março de 2026](https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/)
- [Publicação da ABVE de 22 de junho de 2026](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/)

## Condições de independência

Antes de avaliar a correção, a pessoa revisora deve confirmar que:

- não preparou nem modificou a versão corrigida;
- não depende de explicações verbais para interpretá-la;
- consegue acessar as duas publicações necessárias;
- verificou o commit e o SHA-256 acima;
- registrará qualquer limitação nova encontrada.

Uma condição não confirmada deve permanecer explícita e impede o resultado `ACCEPTED`.

## O que motivou a correção

A primeira revisão concluiu que as publicações oferecem base defensável para tratar pontos de recarga, eletropostos e carregadores como a mesma unidade neste recorte. A versão anterior, porém:

- marcava as duas observações como `unresolved`;
- deixava `normalized_claim` vazio;
- não criava uma definição de métrica;
- não criava valores em `metric_values`.

Essa divergência foi registrada como `P03-REG-01`, uma lacuna bloqueante de registro. A fundação foi considerada suficiente, portanto nenhuma migration ou restrição do schema foi modificada.

## Correções submetidas à revisão

| Item anterior | Correção proposta | Onde verificar |
| --- | --- | --- |
| `M-03` | As duas observações agora usam `normalization_status = 'normalized'` e possuem `normalized_claim`. | `observations` no recorte de `PILOT-03` |
| `Q-03` | Foi criada uma métrica candidata com unidade canônica `charging_point`. | `metric_definitions.metric_key = 'public-semi-public-charging-points'` |
| `R-06` | Foram criados dois valores estruturados e ligados às observações de origem. | `metric_values` ligados aos dois fingerprints de observação |
| `P03-REG-01` | A normalização foi acrescentada sem escolher entre os valores conflitantes. | Observações, definição da métrica e valores |

## Índice dos registros corrigidos

| Entidade | Identificador estável | Estado esperado |
| --- | --- | --- |
| Métrica | `metric_definitions.metric_key = 'public-semi-public-charging-points'` | Candidata, inteira, mensal e nacional |
| Unidade | `metric_definitions.canonical_unit = 'charging_point'` | Unidade comum aos termos do recorte |
| Observação de março | `observations.observation_fingerprint = 'pilot-03-abve-21061-fevereiro-2026'` | Normalizada, sem perder a afirmação original |
| Observação de junho | `observations.observation_fingerprint = 'pilot-03-abve-21060-fevereiro-2026'` | Normalizada, sem perder a afirmação original |
| Valor de março | Métrica ligada à observação de 21.061 | `21061`, fevereiro de 2026, Brasil, provisório |
| Valor de junho | Métrica ligada à observação de 21.060 | `21060`, fevereiro de 2026, Brasil, provisório |

Os dois valores devem usar a mesma definição de métrica, o mesmo período e a mesma geografia. Eles devem permanecer em registros distintos, ambos provisórios, porque a origem não explica a diferença de uma unidade.

## Elementos que não deveriam ter mudado

A segunda revisão também deve confirmar que a correção:

- preserva as afirmações e os termos originais nas observações;
- mantém 21.061 e 21.060 separados e rastreáveis;
- não escolhe qual valor deve prevalecer;
- não transforma as duas publicações em confirmações independentes;
- mantém fevereiro de 2026 separado das datas de publicação;
- conserva dois vínculos `supports` e quatro vínculos `subject`;
- não incorpora 25.429, crescimento, cobertura ou proporções como registros estruturados;
- não altera schema, migrations ou políticas de acesso.

## Reprodução em ambiente local descartável

O caminho preferencial usa uma instância local do Supabase e um runtime compatível com Docker.

1. Obter uma cópia limpa do repositório e selecionar o commit corrigido.
2. Conferir o SHA-256 de `supabase/seed.sql`.
3. Iniciar o ambiente local e executar `supabase db reset --local`.
4. Consultar os identificadores estáveis e os estados esperados acima.
5. Descartar o ambiente ao terminar.

Não usar `--linked` nem executar o seed no projeto remoto persistente. Se a reprodução local não for possível, registrar a limitação; a inspeção somente do SQL não equivale automaticamente à execução bem-sucedida.

## Verificação técnica já executada

Antes deste pacote, a versão corrigida foi executada em uma única transação contra o schema aprovado. Foram confirmados:

- uma fonte, duas organizações e duas publicações;
- duas observações normalizadas;
- uma definição de métrica candidata;
- dois valores mensais provisórios, exatamente 21.060 e 21.061;
- duas evidências, dois eventos, dois vínculos `supports` e quatro vínculos `subject`.

A transação foi revertida. Uma consulta posterior confirmou que nenhum registro dos pilotos permaneceu no banco persistente.

## Como conduzir a segunda revisão

1. Reavaliar todos os itens do [checklist canônico](checklist-de-revisao-do-piloto.md), não apenas os três itens que falharam.
2. Comparar a versão anterior e a corrigida somente quando isso ajudar a verificar `P03-REG-01`.
3. Decidir se a unidade canônica representa fielmente os termos das fontes.
4. Confirmar que a normalização não resolveu silenciosamente a divergência dos valores.
5. Registrar qualquer regressão ou nova lacuna.
6. Produzir uma nova síntese independente e selecionar exatamente um resultado final permitido.

## Registro produzido pela pessoa revisora

O [resultado da segunda revisão](resultado-revisao-pilot-03-correcao-01.md) ficou em documento separado e contém:

- identificação da versão corrigida e referência ao resultado anterior;
- `PASS`, `FAIL` ou `N/A` para todos os itens do checklist;
- decisão expressa sobre `M-03`, `Q-03`, `R-06` e `P03-REG-01`;
- uma linha por lacuna nova ou ainda aberta;
- síntese reconstruída sem ajuda da pessoa que preparou a correção;
- exatamente um resultado final.

Os resultados permitidos continuam sendo `ACCEPTED`, `CORRECTION_REQUIRED`, `FOUNDATION_REVIEW_REQUIRED` e `INCONCLUSIVE`.

## Regra para avançar

A versão corrigida de `PILOT-03` recebeu `ACCEPTED`. O caso está concluído, e `PILOT-01` pode começar depois do merge do resultado da revisão na `main`.
