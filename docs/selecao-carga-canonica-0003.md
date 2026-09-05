# Seleção da carga canônica `0003`

## Estado

`EM REVISÃO`

Este documento compara candidatos e propõe o recorte do terceiro ciclo do fluxo de inteligência. Ele não cria a carga `0003`, não altera o schema e não modifica dados no Supabase.

## Parâmetros da pesquisa

| Campo | Valor |
| --- | --- |
| Data da pesquisa | 5 de setembro de 2026 |
| Janela preferencial | 6 de agosto a 5 de setembro de 2026 |
| Tema | Dado quantitativo materialmente relacionado à mobilidade elétrica no Brasil |
| Fonte exigida | Fonte primária apropriada e acessível |
| Recorte máximo | Um acontecimento, uma definição de métrica e um valor |
| Exclusões | Estimativa, projeção, arredondamento, cálculo derivado, conflito quantitativo e conversão discutível |

A pesquisa priorizou publicações oficiais de associações setoriais e órgãos públicos. Publicações secundárias foram consultadas somente para procurar possíveis conflitos; elas não contam como confirmação independente e não serão incorporadas à carga.

## Candidatos comparados

| Candidato | Publicação primária | Valor considerado | Resultado | Motivo |
| --- | --- | ---: | --- | --- |
| Emplacamentos mensais de BEV | [ABVE, 11/08/2026](https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/) | 25.782 | **Selecionado** | Valor exato, repetido na publicação, com categoria, mês, país e natureza de emplacamento explícitos. |
| Veículos elétricos no PBE Veicular | [Inmetro, 14/08/2026](https://www.gov.br/inmetro/pt-br/centrais-de-conteudo/noticias/tabela-pbe-veicular-2026-e-atualizada-com-novos-modelos-e-versoes) | 185 | Não selecionado | A página fala em 185 “veículos elétricos”, enquanto apresenta a tabela como conjunto de modelos e versões; a unidade canônica exigiria interpretação adicional. |
| Preços de ônibus elétricos | [Prefeitura de São Paulo, 01/09/2026](https://prefeitura.sp.gov.br/web/mobilidade/w/pre%C3%A7os-de-ve%C3%ADculos-el%C3%A9tricos-informados-pelos-fornecedores) | Vários | Não selecionado | A publicação encaminha a uma relação de preços por fornecedor e veículo; mais de um valor e seus contextos seriam indispensáveis. |
| Consumo nacional de eletricidade | [EPE, 31/08/2026](https://www.epe.gov.br/pt/imprensa/noticias/consumo-de-eletricidade-continua-a-crescer-em-julho-de-2026-residencias-e-comercio-lideram-alta) | 46.841 GWh | Não selecionado | O dado é nacional e exato, mas a publicação não demonstra relação material específica com recarga ou mobilidade elétrica. |

O candidato da ABVE introduz somente a dificuldade aprovada para o terceiro ciclo. Os demais exigiriam resolver uma unidade ambígua, representar vários preços ou inferir uma relação temática não sustentada.

## Candidato selecionado

### Acontecimento

Em 11 de agosto de 2026, a ABVE publicou que foram emplacados 25.782 veículos leves 100% elétricos, classificados como BEV, no Brasil durante julho de 2026.

O acontecimento canônico será a **publicação desse resultado mensal pela ABVE Data**, não cada emplacamento individual, uma tendência de crescimento nem uma projeção para o restante do ano.

### Publicação primária

| Campo | Valor proposto |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Produto de dados | ABVE Data |
| Título | Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026 |
| Data de publicação | 11 de agosto de 2026 |
| URL | <https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/> |
| Autoria pessoal | Não identificada na página |
| Idioma | `pt-BR` |
| Natureza | `original` |
| Tipo proposto | `dataset_release` |
| Retenção proposta | `external_reference` |

A própria página identifica “ABVE Data” como fonte dos dados e define os eletrificados leves como BEV, PHEV, HEV e HEV Flex, excluindo MHEV. No recorte de BEV, ela usa “100% elétricos” e “emplacamentos”.

## Núcleo factual

O núcleo factual proposto contém somente:

- quantidade: `25.782`;
- objeto: emplacamentos de veículos leves 100% elétricos — BEV;
- período: julho de 2026;
- geografia: Brasil;
- ação: publicação do resultado pela ABVE Data em 11 de agosto de 2026.

A publicação apresenta `25.782` duas vezes no trecho dedicado aos elétricos plug-in: primeiro ao distribuir os emplacamentos entre BEV e PHEV e depois ao descrever a evolução dos emplacamentos de veículos 100% elétricos. Não foi encontrado outro valor para BEV no Brasil em julho de 2026 dentro da publicação.

Publicações secundárias localizadas repetem `25.782` e atribuem o dado à ABVE. Elas não fornecem uma linhagem adicional e não serão usadas para elevar o acontecimento a `corroborated`.

## Limites do recorte

### Incluído

- somente o valor `25.782`;
- somente BEV ou veículos leves 100% elétricos;
- somente os 25.782 emplacamentos de veículos leves BEV registrados durante o mês de julho de 2026;
- somente o recorte nacional brasileiro;
- somente a publicação do resultado pela ABVE Data.

### Excluído

- total de 56.074 veículos leves eletrificados;
- 20.500 PHEV e os valores de HEV, HEV Flex e MHEV;
- participação de 46% dos BEV e qualquer outro percentual;
- valores de junho de 2026 ou julho de 2025;
- acumulado de janeiro a julho de 2026;
- projeções de 400 mil ou 450 mil unidades para 2026;
- participação de mercado dos eletrificados;
- 25.429 pontos de recarga;
- rankings por estado, marca ou modelo;
- conclusões sobre recorde, liderança, confiança do consumidor ou tendência de mercado.

Essas exclusões não alteram o significado do valor selecionado. A categoria BEV, o mês, o país e o total de emplacamentos aparecem de forma autônoma. Nenhum dos números excluídos é necessário para identificar o que os `25.782` representam.

## Irregularidades fora do recorte

A publicação contém trechos editoriais que não devem ser transportados para a carga:

- a seção de projeção inclui uma referência monetária incompatível com o contexto de quantidade de veículos;
- há uma tabela posterior com rótulo temporal e valores que não serão usados neste recorte;
- uma [publicação secundária consultada](https://amp.dol.com.br/noticias/auto-dicas/959497/confira-os-carros-eletricos-e-hibridos-mais-vendidos-do-brasil-em-julho-de-2026?_=amp) repete `25.782`, mas diverge da página primária em números de junho e do acumulado anual, que não pertencem ao recorte.

Essas irregularidades justificam limitar estritamente a evidência ao valor `25.782`, que aparece duas vezes com o mesmo significado na publicação primária. Elas não serão corrigidas, explicadas ou reconciliadas pelo ChargeBR. Se a revisão encontrar conflito específico para BEV, Brasil e julho de 2026, a seleção deverá ser interrompida.

## Fonte e organização propostas

### Fonte

| Campo | Valor proposto |
| --- | --- |
| Nome | ABVE |
| `slug` | `abve` |
| Página inicial | `https://abve.org.br` |
| Tipo | `industry_association` |
| Situação | `approved` |
| País | `BR` |
| Idiomas | `pt-BR` |
| Fonte primária | `true` para dados publicados pela própria ABVE Data |
| Grupo publicador | Associação Brasileira do Veículo Elétrico |

O mesmo `slug` apareceu em registros descartáveis do `PILOT-03`, mas nenhum desses registros foi persistido. A carga `0003` deverá criar um registro canônico novo e revisado, sem copiar automaticamente o fixture do piloto.

### Organização

| Campo | Valor proposto |
| --- | --- |
| Nome | Associação Brasileira do Veículo Elétrico |
| Nome curto | ABVE |
| `slug` | `abve` |
| Tipo | `industry_association` |
| Situação | `approved` |
| País | `BR` |
| Página inicial | `https://abve.org.br` |
| Papel no acontecimento | `subject` — organização que publicou o resultado por meio da ABVE Data |

Fonte e organização representam papéis diferentes mesmo quando se referem à mesma instituição: a fonte identifica o canal de publicação; a organização identifica o sujeito institucional do acontecimento.

## Observação e evidência propostas

### Observação

| Campo | Valor proposto |
| --- | --- |
| Tipo | `quantity` |
| Afirmação da fonte | Em julho de 2026, foram emplacados 25.782 veículos leves 100% elétricos — BEV — no Brasil. |
| Afirmação normalizada | Brasil: 25.782 emplacamentos de veículos leves BEV em julho de 2026. |
| Estado da normalização | `normalized` |
| Data da observação | `NULL` |
| Geografia | Brasil |
| Método de extração | `manual` |
| Termo da fonte | `emplacamentos de veículos 100% elétricos` |
| Identificador proposto | `canonical-0003-abve-bev-emplacamentos-julho-2026` |

`observation_date` permanece `NULL` porque o valor se refere a um mês, não a um dia específico. O período mensal será representado estruturalmente em `metric_values`.

### Evidência

| Campo | Valor proposto |
| --- | --- |
| Origem | Publicação da ABVE de 11 de agosto de 2026 |
| Linhagem | `canonical-0003-abve-data-bev-julho-2026` |
| Estado da linhagem | `established` |
| Vínculo com o acontecimento | `supports` |

A evidência demonstra o que a ABVE Data publicou. Ela não representa auditoria externa dos registros nem confirmação por outra instituição.

## Definição da métrica proposta

| Campo | Valor proposto |
| --- | --- |
| `metric_key` | `monthly-light-bev-registrations-brazil` |
| Nome | Emplacamentos mensais de veículos leves BEV no Brasil |
| Descrição | Quantidade de veículos leves 100% elétricos, classificados como BEV, emplacados no Brasil durante um mês civil. |
| Domínio | `vehicle_market` |
| Tipo do valor | `integer` |
| Unidade canônica | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `national` |
| Situação | `approved` depois do aceite e do merge |

Notas metodológicas propostas:

- BEV significa veículo elétrico a bateria ou veículo 100% elétrico;
- a métrica exclui PHEV, HEV, HEV Flex e MHEV;
- cada unidade representa um emplacamento, não necessariamente um veículo único em toda a sua vida útil;
- a definição não incorpora participação de mercado, variação ou acumulado;
- valores de outros períodos exigirão suas próprias observações e cargas futuras.

`count` descreve a natureza da medida como contagem de emplacamentos. Ele não autoriza somar automaticamente períodos ou geografias sem verificar cobertura, duplicidade e comparabilidade.

## Valor métrico proposto

| Campo | Valor proposto |
| --- | --- |
| Valor numérico | `25782` |
| Unidade | `vehicle_registration` pela definição da métrica |
| Início do período | `2026-07-01` |
| Fim do período | `2026-07-31` |
| Geografia | Brasil |
| Estado | `validated` depois da revisão |
| Observação de origem | `canonical-0003-abve-bev-emplacamentos-julho-2026` |

Converter a grafia brasileira `25.782` para o número inteiro `25782` é interpretação sem perda do separador de milhar. Nenhum cálculo, arredondamento ou conversão de unidade é realizado.

`validated` indicará que a transcrição, a definição, a unidade, o período, a geografia e a proveniência foram revisados. Não indicará auditoria independente da base da ABVE nem impedirá uma correção futura.

## Acontecimento proposto

| Campo | Valor proposto |
| --- | --- |
| Título | ABVE Data publica 25.782 emplacamentos de veículos leves BEV em julho de 2026 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-08-11` |
| Precisão | `day` |
| Geografia | Brasil |
| Relevância | O valor mede a adoção mensal de veículos leves 100% elétricos no mercado brasileiro. |
| Verificação | `confirmed` |
| Situação | `accepted` depois da revisão e do merge |
| Identificador proposto | `canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11` |

A data do acontecimento é a data de publicação. Julho de 2026 é o período medido e permanece em `metric_values`; as duas referências temporais não são intercambiáveis.

## Registros mínimos esperados

| Entidade ou vínculo | Quantidade | Identificador ou relação |
| --- | ---: | --- |
| Fonte | 1 | `abve` |
| Publicação | 1 | `canonical-0003-abve-data-bev-julho-2026-2026-08-11` |
| Observação | 1 | `canonical-0003-abve-bev-emplacamentos-julho-2026` |
| Evidência | 1 | `canonical-0003-abve-data-bev-julho-2026` |
| Acontecimento | 1 | `canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11` |
| Organização | 1 | `abve` |
| Definição de métrica | 1 | `monthly-light-bev-registrations-brazil` |
| Valor de métrica | 1 | observação + definição + julho de 2026 + Brasil |
| Acontecimento–evidência | 1 | `supports` |
| Acontecimento–organização | 1 | `subject` |

Os identificadores são propostas para o pacote seguinte. Nenhum deles foi inserido no banco durante esta seleção.

## Adequação ao terceiro ciclo

| Requisito | Avaliação |
| --- | --- |
| Acontecimento e publicação não usados nos pilotos | Atendido |
| Publicação dentro da janela preferencial | Atendido |
| Relação material com o Brasil | Atendido |
| Um único valor realizado ou medido | Atendido |
| Fonte primária acessível | Atendido |
| Valor, unidade, período e geografia explícitos | Atendido |
| Normalização exata | Atendido |
| Ausência de conflito conhecido no núcleo | Atendido, sujeito à revisão |
| Uma definição e um valor | Atendido |
| Schema atual suficiente | Atendido, sujeito à validação descartável |

## Próxima etapa condicionada

Depois do `ACCEPTED` e do merge desta seleção, a etapa seguinte poderá criar:

- `data/canonical/0003_abve-bev-emplacamentos-julho-2026.sql`;
- `data/canonical/0003_abve-bev-emplacamentos-julho-2026.verify.sql`;
- `docs/revisao-carga-canonica-0003.md`.

Nenhum registro será persistido antes da preparação, da validação descartável, da revisão e do merge desse próximo pacote.

## Perguntas para revisão

### Factuais

1. A publicação da ABVE identifica claramente título, data, publicador e URL?
2. A publicação sustenta exatamente 25.782 emplacamentos de veículos leves 100% elétricos — BEV — no Brasil em julho de 2026?
3. O mesmo valor aparece duas vezes com o mesmo significado e sem conflito específico dentro da publicação?
4. As irregularidades editoriais conhecidas estão fora do núcleo e foram documentadas sem serem corrigidas pelo ChargeBR?

### Metodológicas

5. O recorte pode excluir totais, outras tecnologias, percentuais, comparações, acumulados e projeções sem distorcer o significado de 25.782?
6. A definição `monthly-light-bev-registrations-brazil` delimita corretamente objeto, unidade, mês, país e tecnologias excluídas?
7. Interpretar `25.782` como `25782` é uma normalização exata e sem cálculo derivado?
8. `validated` para o valor e `confirmed` para o acontecimento preservam corretamente a diferença entre revisão do dado e corroboração independente?

### Operacionais

9. A data de publicação em `events` e o mês medido em `metric_values` estão corretamente separados?
10. Os registros e identificadores mínimos propostos são suficientes sem reutilizar automaticamente os fixtures do piloto?
11. Não existe lacuna de schema ou conflito conhecido que exija interromper a seleção antes da preparação da carga?
12. O recorte atende à decisão do terceiro ciclo e pode avançar para o pacote reproduzível da carga `0003`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.
