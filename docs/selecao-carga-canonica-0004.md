# Seleção da carga canônica `0004`

## Estado

`PROPOSTA — EM REVISÃO`

Este documento retoma a seleção interrompida em 5 de setembro de 2026. Em 9 de setembro de 2026, a ABVE publicou um novo resultado mensal compatível com a definição `monthly-light-bev-registrations-brazil`: **27.166 emplacamentos de veículos leves 100% elétricos — BEV — no Brasil durante agosto de 2026**.

A nova evidência satisfaz as condições de retomada da [decisão do quarto ciclo](decisao-quarto-ciclo-fluxo-inteligencia.md). Esta etapa apenas substitui a interrupção por uma seleção factual. Ela não cria a carga `0004`, não altera o schema e não consulta nem modifica o Supabase.

## Resultado da seleção

| Campo | Valor selecionado |
| --- | --- |
| Métrica existente | `monthly-light-bev-registrations-brazil` |
| Valor publicado | `27.166` |
| Valor normalizado | `27166` |
| Objeto | Emplacamentos de veículos leves 100% elétricos — BEV |
| Período medido | 1º a 31 de agosto de 2026 |
| Geografia | Brasil |
| Unidade | `vehicle_registration` |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Produto de dados | ABVE Data |
| Data da publicação | 9 de setembro de 2026 |
| Resultado | **Selecionado para a futura carga `0004`** |

O valor é mensal, realizado, nacional, inteiro e diretamente publicado. Ele acrescenta agosto de 2026 à mesma métrica que já contém `25.782` para julho de 2026, sem alterar o valor anterior.

## Publicação primária selecionada

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Produto de dados | ABVE Data |
| Título | Com 57 mil emplacamentos em agosto, eletrificados abrem a corrida para o milhão em setembro |
| Data exibida | 9 de setembro de 2026 |
| URL | <https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/> |
| Autoria pessoal | Não identificada na página |
| Idioma | `pt-BR` |
| Natureza | `original` |
| Tipo proposto | `dataset_release` |
| Retenção proposta | `external_reference` |

A página identifica a ABVE Data como fonte dos números e apresenta os resultados de agosto por tecnologia. No núcleo selecionado, ela declara que os BEV alcançaram `27.166` emplacamentos no mês e repete o mesmo valor na relação “Veículos leves eletrificados por tecnologia no Brasil em agosto de 2026”.

O dado aparece duas vezes com o mesmo significado:

1. no texto dedicado aos elétricos plug-in, como novo recorde mensal dos BEV;
2. na tabela por tecnologia, como `BEV: 27.166` para o Brasil em agosto de 2026.

A repetição permite conferir a transcrição dentro da própria fonte. Ela não constitui confirmação independente dos dados subjacentes.

## Núcleo factual

O núcleo factual proposto contém somente:

- quantidade: `27.166`;
- objeto: emplacamentos de veículos leves 100% elétricos — BEV;
- período: agosto de 2026;
- geografia: Brasil;
- ação: publicação do resultado pela ABVE Data em 9 de setembro de 2026.

Afirmação da fonte:

> Em agosto de 2026, os BEV alcançaram 27.166 emplacamentos no Brasil.

Afirmação normalizada:

> Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026.

A formulação normalizada apenas torna explícitos objeto, período e geografia já presentes na seção e na tabela da publicação. Ela não converte o número em acumulado, não calcula crescimento e não amplia a categoria tecnológica.

## Distinções essenciais

### Resultado mensal e acumulado

`27.166` representa somente os emplacamentos de BEV ocorridos durante agosto de 2026. Não representa:

- o acumulado de janeiro a agosto de 2026;
- a frota de BEV em circulação;
- o total histórico desde 2012;
- o total de todas as tecnologias eletrificadas.

A publicação apresenta outros acumulados e totais no entorno do dado. Nenhum deles é necessário para interpretar `27.166` e nenhum será transportado para a carga.

### Período medido e data de publicação

Agosto de 2026 é o mês medido e será representado em `metric_values.period_start` e `metric_values.period_end`. O dia 9 de setembro de 2026 é a data de publicação e será representado no acontecimento.

Essas datas não são intercambiáveis. A publicação em setembro descreve emplacamentos ocorridos no mês civil anterior.

### BEV e demais tecnologias

A publicação define os eletrificados leves como BEV, PHEV, HEV e HEV Flex e exclui MHEV. Dentro desse conjunto, ela separa explicitamente:

- BEV: `27.166`;
- PHEV: `20.535`;
- HEV: `4.445`;
- HEV Flex: `5.240`.

Somente BEV pertence ao recorte. A carga não combinará as categorias nem usará o total de eletrificados como substituto do valor selecionado.

## Compatibilidade com a carga `0003`

| Dimensão | Julho de 2026 — carga `0003` | Agosto de 2026 — seleção `0004` | Avaliação |
| --- | --- | --- | --- |
| Métrica | Emplacamentos mensais de veículos leves BEV | Emplacamentos mensais de veículos leves BEV | Igual |
| Tecnologia | BEV, veículos 100% elétricos | BEV, modelos 100% elétricos | Igual |
| Unidade | Emplacamento de veículo leve | Emplacamento de veículo leve | Igual |
| Geografia | Brasil | Brasil | Igual |
| Granularidade temporal | Mês civil | Mês civil | Igual |
| Publicador | ABVE | ABVE | Igual |
| Produto de dados | ABVE Data | ABVE Data | Igual |
| Classificação dos eletrificados | BEV, PHEV, HEV e HEV Flex; exclui MHEV | BEV, PHEV, HEV e HEV Flex; exclui MHEV | Igual |
| Valor | `25.782` | `27.166` | Diferente porque mede outro mês |
| Período | Julho de 2026 | Agosto de 2026 | Diferente como exigido |

A publicação de agosto também cita `25.782` como resultado de julho ao informar uma alta de 5,4%. Essa referência coincide com o valor persistido pela carga `0003` e não o corrige, revisa ou substitui.

O percentual de 5,4% é uma comparação editorial da fonte. Ele ficará fora da carga `0004`; a coincidência de julho será usada apenas para verificar que não existe revisão conhecida do valor anterior.

## Reutilização canônica proposta

A futura carga deverá reutilizar, sem atualização ou duplicação:

### Fonte

| Campo | Registro existente |
| --- | --- |
| Nome | ABVE |
| `slug` | `abve` |
| Página inicial | `https://abve.org.br` |
| Tipo | `industry_association` |
| Situação | `approved` |
| País | `BR` |
| Idiomas | `pt-BR` |
| Fonte primária | `true` para dados publicados pela própria ABVE Data |

### Organização

| Campo | Registro existente |
| --- | --- |
| Nome | Associação Brasileira do Veículo Elétrico |
| Nome curto | ABVE |
| `slug` | `abve` |
| Tipo | `industry_association` |
| Situação | `approved` |
| País | `BR` |
| Página inicial | `https://abve.org.br` |

### Definição da métrica

| Campo | Registro existente |
| --- | --- |
| `metric_key` | `monthly-light-bev-registrations-brazil` |
| Nome | Emplacamentos mensais de veículos leves BEV no Brasil |
| Domínio | `vehicle_market` |
| Tipo do valor | `integer` |
| Unidade canônica | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `national` |
| Situação | `approved` |

A compatibilidade documental autoriza propor a reutilização. O SQL da etapa seguinte ainda deverá comparar integralmente os registros existentes e interromper diante de qualquer divergência.

## Observação, evidência e acontecimento propostos

### Observação

| Campo | Valor proposto |
| --- | --- |
| Tipo | `quantity` |
| Afirmação da fonte | Em agosto de 2026, os BEV alcançaram 27.166 emplacamentos no Brasil. |
| Afirmação normalizada | Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026. |
| Estado da normalização | `normalized` |
| Data da observação | `NULL` |
| Geografia | Brasil |
| Método de extração | `manual` |
| Termo da fonte | `BEV` e `modelos 100% elétricos` |
| Identificador proposto | `canonical-0004-abve-bev-emplacamentos-agosto-2026` |

`observation_date` permanece `NULL` porque o dado cobre um mês civil. O período será representado estruturalmente no valor métrico.

### Evidência

| Campo | Valor proposto |
| --- | --- |
| Origem | Publicação da ABVE de 9 de setembro de 2026 |
| Linhagem | `canonical-0004-abve-data-bev-agosto-2026` |
| Estado da linhagem | `established` |
| Vínculo com o acontecimento | `supports` |

A evidência demonstra o que a ABVE Data publicou. Ela não representa auditoria externa da base nem confirmação independente.

### Acontecimento

| Campo | Valor proposto |
| --- | --- |
| Título | ABVE Data publica 27.166 emplacamentos de veículos leves BEV em agosto de 2026 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-09-09` |
| Precisão | `day` |
| Geografia | Brasil |
| Relevância | O valor acrescenta um segundo mês à métrica canônica de emplacamentos de veículos leves BEV. |
| Verificação | `confirmed` |
| Situação | `accepted` depois da revisão e do merge |
| Identificador proposto | `canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09` |

Com uma única fonte primária apropriada, `confirmed` indica confirmação documental suficiente do que a ABVE publicou. Não indica corroboração independente dos emplacamentos.

## Valor métrico proposto

| Campo | Valor proposto |
| --- | --- |
| Definição reutilizada | `monthly-light-bev-registrations-brazil` |
| Valor numérico | `27166` |
| Unidade | `vehicle_registration` pela definição da métrica |
| Início do período | `2026-08-01` |
| Fim do período | `2026-08-31` |
| Geografia | Brasil |
| Estado | `validated` depois da revisão |
| Observação de origem | `canonical-0004-abve-bev-emplacamentos-agosto-2026` |

Converter a grafia brasileira `27.166` para o inteiro `27166` é uma normalização exata do separador de milhar. Nenhum cálculo, arredondamento ou conversão de unidade é realizado.

## Registros mínimos esperados

### Reutilizados

| Entidade | Quantidade | Identificador |
| --- | ---: | --- |
| Fonte | 1 | `abve` |
| Organização | 1 | `abve` |
| Definição de métrica | 1 | `monthly-light-bev-registrations-brazil` |

### Criados pela futura carga

| Entidade ou vínculo | Quantidade | Identificador ou relação |
| --- | ---: | --- |
| Publicação | 1 | `canonical-0004-abve-data-bev-agosto-2026-2026-09-09` |
| Observação | 1 | `canonical-0004-abve-bev-emplacamentos-agosto-2026` |
| Evidência | 1 | `canonical-0004-abve-data-bev-agosto-2026` |
| Acontecimento | 1 | `canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09` |
| Valor de métrica | 1 | observação + definição + agosto de 2026 + Brasil |
| Acontecimento–evidência | 1 | `supports` |
| Acontecimento–organização | 1 | `subject` |

Os identificadores são propostas para o pacote reproduzível seguinte. Nenhum registro foi criado durante esta seleção.

## Limites do recorte

### Incluído

- somente `27.166`;
- somente BEV ou veículos leves 100% elétricos;
- somente os emplacamentos ocorridos durante agosto de 2026;
- somente o recorte nacional brasileiro;
- somente a publicação do resultado pela ABVE Data;
- somente um novo acontecimento e um novo valor ligados à definição existente.

### Excluído

- `57.386` eletrificados leves em agosto;
- `47.701` veículos plug-in;
- `20.535` PHEV, `4.445` HEV e `5.240` HEV Flex;
- `6.669` MHEV e o total de `64.055` quando somados aos eletrificados;
- participação de `47,3%` dos BEV;
- crescimento de `5,4%` sobre julho e de `256%` sobre agosto de 2025;
- `25.782` de julho de 2026 e `7.624` de agosto de 2025 como novos valores;
- acumulados, frota circulante e expectativa de um milhão de eletrificados;
- participação de mercado, resultados estaduais, municipais ou regionais;
- projeção de aproximadamente 450 mil eletrificados em 2026;
- interpretações sobre recorde, liderança, tendência ou competitividade;
- MHEV e qualquer discussão metodológica do ciclo `0007`;
- cálculo derivado ou relação direta entre os valores de julho e agosto.

As exclusões não distorcem o núcleo. O valor `27.166`, a tecnologia BEV, o mês de agosto, a geografia brasileira e a natureza de emplacamento aparecem juntos e de forma autônoma na publicação.

## Verificação de conflito

A pesquisa por referências ao mesmo resultado encontrou publicações secundárias que repetem `27.166` para BEV em agosto de 2026. Elas não foram incorporadas porque aparentam reproduzir ou comentar os dados da ABVE e não oferecem linhagem independente.

Não foi localizado outro valor para o mesmo recorte na publicação primária nem conflito específico conhecido para BEV, Brasil e agosto de 2026. Se a revisão identificar uma divergência, a seleção deverá parar antes da preparação da carga.

## Adequação ao quarto ciclo

| Requisito | Avaliação |
| --- | --- |
| Publicação posterior à usada na carga `0003` | Atendido: 9 de setembro de 2026 |
| Mês civil diferente de julho | Atendido: agosto de 2026 |
| Total mensal realizado | Atendido |
| Veículos leves 100% elétricos — BEV | Atendido |
| Unidade de emplacamentos | Atendida |
| Geografia nacional brasileira | Atendida |
| Valor exato diretamente publicado | Atendido: `27.166` |
| Mesma série ABVE Data | Atendida |
| Metodologia compatível | Atendida no recorte selecionado |
| Valor de julho preservado | Atendido; a fonte repete `25.782` sem revisão |
| Ausência de conflito conhecido | Atendida, sujeita à revisão humana |
| Schema atual suficiente | Atendido em princípio, sujeito à validação descartável |

## Efeito sobre o repositório e o banco

Esta etapa altera somente este documento e sua descrição no índice da documentação.

Não serão criados nesta etapa:

- arquivo SQL da carga `0004`;
- consulta de verificação;
- pacote de revisão da carga;
- publicação, observação, evidência, acontecimento ou valor métrico;
- nova fonte, organização ou definição;
- migration, seed ou alteração de schema.

O Supabase não foi consultado nem modificado. As cargas persistidas `0001`, `0002`, `0003`, `0005` e `0006`, inclusive o valor de julho da carga `0003`, permanecem inalteradas. A carga `0004` continua ausente.

## Próxima etapa condicionada

Depois de `ACCEPTED` e do merge desta seleção, preparar em PR separado:

- `data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql`;
- `data/canonical/0004_abve-bev-emplacamentos-agosto-2026.verify.sql`;
- `docs/revisao-carga-canonica-0004.md`.

O pacote deverá reutilizar fonte, organização e definição, proteger integralmente as cargas anteriores e ser validado duas vezes numa transação descartável. Nenhum dado será persistido no Supabase antes da revisão e do merge desse pacote.

## Perguntas para revisão

### Factuais

1. A publicação identifica claramente ABVE, título, data e URL?
2. Ela sustenta exatamente `27.166` emplacamentos de veículos leves 100% elétricos — BEV — no Brasil durante agosto de 2026?
3. Está claro que `27.166` é o resultado somente de agosto, e não o acumulado do ano, a frota circulante ou o total de eletrificados?
4. O valor aparece no texto e na tabela por tecnologia com o mesmo significado?
5. A publicação repete `25.782` como resultado de julho sem corrigi-lo ou substituí-lo?

### Metodológicas

6. Objeto, unidade, período, geografia, classificação e fonte são integralmente compatíveis com `monthly-light-bev-registrations-brazil`?
7. Está correto normalizar `27.166` para o inteiro `27166` sem tratar isso como cálculo derivado?
8. Os números, percentuais, acumulados, comparações e interpretações excluídos podem ficar fora da carga sem distorcer o núcleo?
9. Está correto usar a referência de julho apenas para verificar continuidade, sem persistir o crescimento de 5,4% nem criar relação direta entre os valores?
10. A ausência de conflito conhecido é suficiente para avançar à preparação, mantendo a obrigação de interromper caso a revisão encontre divergência?

### Operacionais

11. Está correto reutilizar fonte, organização e definição existentes, criando somente uma publicação, observação, evidência, acontecimento, valor e dois vínculos?
12. A data de publicação em setembro e o período medido em agosto estão separados corretamente?
13. Os identificadores propostos são claros e suficientes para o pacote reproduzível?
14. Está correto manter SQL, schema e Supabase inalterados nesta etapa?
15. Depois do aceite e do merge, a seleção pode avançar para o pacote reproduzível da carga `0004`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
