# Revisão independente de `PILOT-03`

## Estado

`CONCLUIDA — CORRECTION_REQUIRED`

Este documento congela a versão avaliada, descreve como reproduzir os registros e indica onde encontrar as evidências necessárias. A revisão foi concluída por Denis Toledo em 2 de setembro de 2026; o [resultado completo](resultado-revisao-pilot-03.md) foi `CORRECTION_REQUIRED`.

A identidade, os resultados dos itens e a conclusão refletem as decisões expressamente fornecidas pela pessoa revisora. A pessoa que preparou os registros somente transcreveu essas decisões e a verificação técnica já documentada, sem decidir o resultado.

## Identificação do objeto revisado

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-03` |
| Versão dos registros | Commit [`ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0`](https://github.com/dnstld/chargebr/commit/ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `fb3c1a08aeec702e4d3d192bdb613b29e6dcefe46c6cbb14458eec0eb437321b` |
| Fonte de março | [Publicação da ABVE de 4 de março de 2026](https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/) |
| Fonte de junho | [Publicação da ABVE de 22 de junho de 2026](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/) |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 2 de setembro de 2026 |
| Revisão anterior | `N/A` |

O commit acima é a versão imutável dos registros. O merge na `main` ocorreu depois, sem modificar o conteúdo do arquivo.

## Condições de independência

Antes de avaliar o caso, a pessoa revisora deve confirmar no registro da revisão que:

- não preparou os registros avaliados;
- não recebeu explicações verbais necessárias para interpretá-los;
- não modificou os registros durante a avaliação;
- registrou qualquer indisponibilidade ou limitação das fontes;
- verificou o commit e o SHA-256 informados acima.

Se alguma condição não puder ser confirmada, o impedimento deve permanecer explícito e o resultado não pode ser `ACCEPTED`.

## Como conduzir a revisão

1. Abrir as duas fontes e inspecionar o recorte de `PILOT-03` no `seed.sql`.
2. Usar o [checklist canônico](checklist-de-revisao-do-piloto.md) e responder `PASS`, `FAIL` ou `N/A` para cada item.
3. Justificar todo `N/A` e registrar cada lacuna, inclusive uma limitação de acesso.
4. Reconstruir, sem ajuda da pessoa que preparou os registros, o que cada publicação afirma e o que permanece desconhecido.
5. Decidir expressamente se a ausência de `metric_values` é um limite correto dos registros atuais ou uma lacuna bloqueante da fundação.
6. Selecionar exatamente um resultado final permitido pelo checklist.

A pessoa revisora pode responder às perguntas em etapas. O resultado somente deve ser fechado depois que todos os itens aplicáveis, as lacunas e a síntese reconstruída estiverem registrados em um documento separado.

## Reprodução em ambiente local descartável

O caminho preferencial usa uma instância local do Supabase. Ele exige a Supabase CLI e um runtime compatível com Docker.

1. Obter uma cópia limpa do repositório e selecionar o commit congelado.
2. Conferir o SHA-256 de `supabase/seed.sql`.
3. Executar `supabase init` para gerar uma configuração local, caso ela ainda não exista.
4. Iniciar o ambiente local e executar `supabase db reset --local`.
5. Confirmar que todas as migrações foram aplicadas antes do `seed.sql` e consultar os identificadores descritos abaixo.
6. Descartar o ambiente ao terminar.

Não usar `--linked`, não executar o seed no projeto remoto persistente e não transformar os registros do piloto em dados de produção. Se a reprodução local não for possível, a limitação deve ser registrada; a inspeção somente do SQL não equivale automaticamente à execução bem-sucedida.

## Índice dos registros

Os identificadores estáveis abaixo permitem localizar o caso sem depender dos IDs numéricos gerados durante a carga.

| Entidade | Identificador estável | Papel no caso |
| --- | --- | --- |
| Fonte | `sources.slug = 'abve'` | Publicadora das duas atualizações |
| Organização | `organizations.slug = 'abve'` | Publicadora e sujeito dos dois eventos |
| Organização | `organizations.slug = 'tupi-mobilidade'` | Participante da apuração e sujeito dos dois eventos |
| Publicação de março | `content_items.content_fingerprint = 'pilot-03-abve-2026-03-04'` | Publicação que informa 21.061 |
| Publicação de junho | `content_items.content_fingerprint = 'pilot-03-abve-2026-06-22'` | Publicação que referencia 21.060 |
| Observação de março | `observations.observation_fingerprint = 'pilot-03-abve-21061-fevereiro-2026'` | Afirmação de 21.061 para fevereiro |
| Observação de junho | `observations.observation_fingerprint = 'pilot-03-abve-21060-fevereiro-2026'` | Referência posterior a 21.060 para fevereiro |
| Evidências | `evidence.lineage_key = 'pilot-03-abve-tupi-base-nacional-fevereiro-2026'` | Duas evidências de linhagem provavelmente compartilhada |
| Evento de março | `events.event_fingerprint = 'pilot-03-abve-21061-publicacao-2026-03-04'` | Publicação do valor 21.061 |
| Evento de junho | `events.event_fingerprint = 'pilot-03-abve-21060-referencia-2026-06-22'` | Publicação posterior que referencia 21.060 |

Cada evento deve possuir exatamente um vínculo `supports` com sua evidência correspondente. Cada evento também deve possuir dois vínculos `subject`: um com a ABVE e outro com a Tupi Mobilidade.

## Mapa de evidências para o checklist

Este mapa indica onde inspecionar; ele não atribui `PASS`, `FAIL` ou `N/A`.

| Seção | Onde verificar |
| --- | --- |
| Escopo e relevância | Recorte de `PILOT-03` em [Casos do piloto](casos-do-piloto.md); URLs, geografia e limites no `seed.sql` |
| Proveniência | `sources`, `content_items`, `observations`, `evidence` e os dois vínculos em `event_evidence` |
| Separação semântica | Duas publicações, duas observações, duas evidências e dois eventos; `source_claim`, `normalized_claim`, `normalization_status` e `notes` |
| Tempo e histórico | `published_on`, `collected_at`, `observation_date`, `event_date` e o período mensal preservado nas notas |
| Valores e métricas | Valores e termos em `source_claim` e `source_term`; ausência deliberada de registros em `metric_definitions` e `metric_values` para o caso |
| Organizações | Registros canônicos em `organizations` e quatro vínculos `subject` em `event_organizations` |
| Instrumentos regulatórios | Ausência de instrumento regulatório neste caso de métrica; a pessoa revisora decide e justifica a aplicabilidade dos itens |
| Incerteza e reconstrução | `normalization_status = 'unresolved'`, `normalized_claim` nulo, `lineage_status = 'likely_shared'` e notas sobre a diferença de uma unidade |
| Verificações de `PILOT-03` | Dois fingerprints de observação, termos preservados, nenhuma unidade canônica e nenhuma métrica derivada |

## Limites deliberadamente preservados

O conjunto congelado:

- mantém 21.061 e 21.060 como observações distintas;
- preserva os termos usados nas publicações, inclusive pontos de recarga, eletropostos, carregadores e total da rede;
- registra fevereiro de 2026 como período de referência sem inventar uma data diária para a observação;
- usa 4 de março e 22 de junho como datas dos respectivos eventos de publicação;
- trata as duas evidências como uma linhagem provavelmente compartilhada, e não como confirmações independentes;
- não escolhe uma unidade canônica nem preenche `normalized_claim`;
- não cria `metric_definitions` nem `metric_values` para o caso;
- não calcula crescimento, cobertura, proporções ou qualquer outra métrica derivada;
- não incorpora o total corrente de junho ou outros valores fora do recorte aprovado.

Esses limites tornam a incerteza observável, mas não determinam se a fundação é suficiente. Essa conclusão pertence à revisão independente.

## Decisão central sobre a fundação

O modelo atual contém dois requisitos relevantes:

- `metric_definitions.canonical_unit` é obrigatório e representa a unidade técnica usada para armazenar e comparar valores;
- todo `metric_values.numeric_value` deve apontar para uma definição de métrica e, portanto, para uma unidade canônica.

A versão avaliada preserva os dois valores brutos e trata a unidade como ambígua, mas a camada de métricas não representa esses valores sem uma unidade canônica. A questão submetida à pessoa revisora foi:

> O caso é aceitável sem `metric_values`, porque as observações preservam fielmente valores ainda não normalizados, ou a impossibilidade de representar uma medição quantitativa não resolvida na camada de métricas revela uma lacuna bloqueante da fundação?

O resultado independente concluiu que as publicações oferecem base defensável para uma unidade canônica. Como a estrutura atual já comporta essa representação, a ausência de `metric_values` foi classificada como lacuna de registro, e não como lacuna da fundação.

## Registro produzido pela pessoa revisora

O [resultado independente de `PILOT-03`](resultado-revisao-pilot-03.md) foi registrado em um documento separado e contém:

1. a identificação completa da revisão e a versão congelada acima;
2. um resultado individual para todos os itens de independência e todos os itens aplicáveis;
3. `N/A` acompanhado de justificativa sempre que um item não se aplicar;
4. uma linha por lacuna encontrada, inclusive limitações de acesso às fontes;
5. a síntese do caso reconstruída sem ajuda da pessoa que preparou os registros;
6. a decisão expressa sobre a ausência de `metric_values`;
7. exatamente um resultado final permitido pelo checklist.

O resultado selecionado foi `CORRECTION_REQUIRED`: a fundação parece suficiente, mas os registros precisam de correção e nova revisão.

Os resultados permitidos eram:

- `ACCEPTED`, se todos os itens aplicáveis passarem e não existir lacuna bloqueante;
- `CORRECTION_REQUIRED`, se a fundação for suficiente, mas os registros precisarem de correção;
- `FOUNDATION_REVIEW_REQUIRED`, se uma lacuna bloqueante de restrição, modelo ou metodologia impedir a aceitação;
- `INCONCLUSIVE`, se uma limitação de fonte impedir a conclusão.

## Regra para avançar

`PILOT-03` recebeu `CORRECTION_REQUIRED`. Os registros devem ser corrigidos com a estrutura existente e submetidos a nova revisão. `PILOT-01` só poderá começar quando a versão corrigida receber `ACCEPTED`.
