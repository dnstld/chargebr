# Seleção da carga canônica `0005`

## Estado

`PROPOSTA — EM REVISÃO`

Este documento reconstrói o conflito quantitativo definido para o [quinto ciclo](decisao-quinto-ciclo-fluxo-inteligencia.md) e propõe seu recorte canônico. Ele não cria a carga `0005`, não altera o schema e não modifica dados no Supabase.

## Parâmetros da pesquisa

| Campo | Valor |
| --- | --- |
| Data da pesquisa | 8 de setembro de 2026 |
| Tema | Base nacional de pontos públicos e semipúblicos de recarga |
| Período investigado | Fevereiro de 2026 |
| Publicações necessárias | Atualização original e referência retrospectiva da mesma série |
| Fonte de publicação | Site oficial da ABVE |
| Participantes declarados | ABVE e Tupi Mobilidade |
| Dificuldade exclusiva | Dois valores para a mesma métrica, período e geografia |
| Exclusões | Escolha de vencedor, tolerância, correção presumida, média, arredondamento e cálculo derivado persistido |

As publicações foram reabertas e avaliadas como fontes atuais. Os registros descartáveis do `PILOT-03` foram consultados somente depois da reconstrução factual, para comparar decisões de representação; eles não foram tratados como autoridade para o conteúdo das fontes.

## Conjunto selecionado

| Publicação | Afirmação selecionada | Valor normalizado | Papel no conflito |
| --- | --- | ---: | --- |
| [ABVE, 4/3/2026](https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/) | “O Brasil tem 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos”, na atualização da base nacional até fevereiro | `21061` | Valor originalmente publicado para fevereiro |
| [ABVE, 22/6/2026](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/) | O último levantamento, de fevereiro de 2026, possuía `21.060` pontos | `21060` | Referência retrospectiva conflitante na atualização até maio |

As duas páginas identificam título, publicador, data e URL. Ambas permaneciam acessíveis na data da pesquisa. Nenhuma errata ou explicação oficial para a diferença foi localizada no site da ABVE ou no site institucional da Tupi.

## Publicações primárias

### Publicação de março

| Campo | Valor proposto |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Recarga pública rápida cresce 167% em um ano e chega a 31% dos 21 mil eletropostos da rede |
| Data de publicação | 4 de março de 2026 |
| URL | <https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/> |
| Participação declarada | Base apurada pela ABVE e Tupi Mobilidade |
| Idioma | `pt-BR` |
| Natureza | `original` |
| Tipo proposto | `dataset_release` |
| Retenção proposta | `external_reference` |

A página apresenta `21.061` três vezes no núcleo relevante: como total de pontos públicos e semipúblicos, como denominador de uma relação editorial e como total de pontos de recarga. Ela também publica `6.479` pontos rápidos e ultrarrápidos e `14.582` lentos para fevereiro; essas duas parcelas são compatíveis com o total `21.061`.

### Publicação de junho

| Campo | Valor proposto |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Recarga rápida (DC) cresce 33% em três meses e puxa a expansão da rede |
| Data de publicação | 22 de junho de 2026 |
| URL | <https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/> |
| Participação declarada | Atualização apresentada pela ABVE e Tupi |
| Idioma | `pt-BR` |
| Natureza | `original` |
| Tipo proposto | `dataset_release` |
| Retenção proposta | `external_reference` |

A página apresenta `21.060` no parágrafo que compara maio com o último levantamento de fevereiro e repete `21.060` na linha de total da tabela regional. Ela não usa linguagem de errata, correção, revisão ou substituição do valor publicado em março.

Os metadados públicos do site registram que a página foi modificada em 8 de julho de 2026, mas não oferecem histórico das alterações. O conteúdo atual continua exibindo `21.060`; a existência dessa modificação não será interpretada como errata nem como confirmação do número.

## Demonstração de que o conflito é real

| Dimensão | Publicação de março | Publicação de junho | Avaliação |
| --- | --- | --- | --- |
| Entidade | Pontos públicos e semipúblicos de recarga; também chamados de eletropostos e carregadores | Pontos públicos e semipúblicos de recarga; tabela denominada “Carregadores/Região” | Mesmo objeto no recorte |
| Cobertura | Rede pública e semipública | Rede pública e semipública | Mesma cobertura declarada |
| Geografia | Base nacional, Brasil | Base nacional, Brasil | Mesma geografia |
| Referência temporal | Base atualizada até fevereiro de 2026 | Último levantamento, de fevereiro de 2026 | Mesmo mês de referência |
| Participantes | ABVE e Tupi Mobilidade | ABVE e Tupi | Mesma série institucional declarada |
| Total publicado | `21.061` | `21.060` | Divergência de uma unidade |

Não foi identificada mudança declarada de metodologia, cobertura ou unidade entre as duas referências a fevereiro. A atualização de junho usa o número de fevereiro como base de comparação para maio, o que sustenta que ela pretende referir-se ao mesmo levantamento anterior.

Assim, a diferença não pode ser explicada como outro período, outra região ou outra categoria. O conjunto atende à condição do quinto ciclo para representar um conflito quantitativo real.

## Irregularidade interna da publicação de junho

A publicação de junho contém uma inconsistência além do conflito entre páginas:

- apresenta `14.582` pontos AC para fevereiro;
- apresenta `6.479` pontos DC para fevereiro;
- essas parcelas somam `21.061`, não `21.060`;
- os cinco totais regionais de fevereiro publicados na mesma página também somam `21.061`;
- apesar disso, o texto comparativo e a linha de total da tabela imprimem `21.060`.

Essa conferência aritmética serve apenas para documentar a irregularidade. A carga não armazenará `21.061` como um valor derivado da publicação de junho, não corrigirá a linha de total e não concluirá que `21.060` é um erro tipográfico.

O conteúdo atual da página ainda exibe `21.060`. A ausência de uma explicação oficial impede tratar a aritmética como autorização para escolher ou corrigir um dos valores.

## Núcleo factual selecionado

O núcleo conterá somente:

- a publicação de março do total `21.061` para a base nacional até fevereiro de 2026;
- a referência retrospectiva de junho ao total `21.060` para fevereiro de 2026;
- o objeto comum: pontos públicos e semipúblicos de recarga de veículos elétricos;
- a geografia Brasil;
- a participação institucional declarada da ABVE e da Tupi;
- o fato de que a diferença de uma unidade permanece sem explicação oficial localizada.

Os acontecimentos canônicos serão as duas publicações dos resultados, não a instalação individual dos pontos nem a ocorrência de um crescimento da rede.

## Limites do recorte

### Incluído

- somente `21.061` e `21.060`;
- somente o total público e semipúblico atribuído a fevereiro de 2026;
- somente o recorte nacional brasileiro;
- somente as duas publicações oficiais necessárias para reconstruir a divergência;
- os termos originais indispensáveis para avaliar a unidade comum.

### Excluído

- `25.429`, referente à atualização até maio de 2026;
- totais AC e DC como valores métricos próprios;
- valores e percentuais por região;
- números de municípios;
- frota de veículos plug-in;
- relações de veículos por ponto de recarga;
- crescimento mensal, trimestral ou anual;
- percentuais de cobertura ou participação;
- interpretações sobre escala, liderança ou efeito de legislação;
- qualquer número de publicação secundária;
- qualquer regra de tolerância.

Os componentes AC, DC e regionais aparecem neste documento apenas para tornar a irregularidade visível. Eles não serão observações, evidências, acontecimentos ou valores da carga.

## Fonte reutilizada

A carga deverá reutilizar exatamente a fonte criada pela carga `0003`:

| Campo | Valor existente obrigatório |
| --- | --- |
| Nome | ABVE |
| `slug` | `abve` |
| Página inicial | `https://abve.org.br` |
| Tipo | `industry_association` |
| Situação | `approved` |
| País | `BR` |
| Idiomas | `pt-BR` |
| Fonte primária | `true` |
| Grupo publicador | Associação Brasileira do Veículo Elétrico |
| Notas | Canal institucional da ABVE e de seu produto de dados ABVE Data. |

As duas publicações estão hospedadas no canal institucional da ABVE. A Tupi participa da apuração e da atualização, mas não será criada como fonte de publicação porque nenhuma segunda publicação hospedada em canal próprio foi selecionada.

## Organizações propostas

### ABVE reutilizada

A carga deverá reutilizar integralmente `organizations.slug = 'abve'`, criado na carga `0003`. A ABVE será ligada como `subject` aos dois acontecimentos por ser a organização que publica as páginas em seu canal institucional e participa da produção declarada dos dados.

### Tupi Mobilidade

| Campo | Valor proposto |
| --- | --- |
| Nome | Tupi Mobilidade |
| Nome legal | `NULL` — não afirmado pelas páginas selecionadas |
| `slug` | `tupi-mobilidade` |
| Tipo | `company` |
| Situação | `approved` depois da revisão |
| País | `BR` |
| Página inicial | `https://tupimob.com` |
| Descrição | Plataforma brasileira de mobilidade elétrica apresentada pela ABVE como participante da apuração e da atualização da base nacional de recarga. |
| Notas | O registro identifica a marca institucional usada nas fontes; não presume razão social. |

A Tupi será ligada como `subject` aos dois acontecimentos. A página de março atribui a apuração à ABVE e à Tupi Mobilidade; a página de junho afirma que as duas apresentam a atualização.

## Definição de métrica proposta

| Campo | Valor proposto |
| --- | --- |
| `metric_key` | `public-semi-public-charging-points-brazil` |
| Nome | Pontos públicos e semipúblicos de recarga no Brasil |
| Descrição | Quantidade consolidada de pontos públicos e semipúblicos de recarga de veículos elétricos disponíveis no Brasil ao fim de um mês de referência. |
| Domínio | `charging_infrastructure` |
| Tipo do valor | `integer` |
| Unidade canônica | `charging_point` |
| Agregação | `latest` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `national` |
| Situação | `approved` depois da revisão |

Notas metodológicas propostas:

- a métrica representa uma fotografia consolidada da rede até o mês de referência, não pontos instalados somente durante o mês;
- a cobertura inclui pontos públicos e semipúblicos e exclui qualquer infraestrutura privada não abrangida pela base;
- neste recorte, “pontos de recarga”, “eletropostos” e “carregadores” são usados pelas publicações para a mesma unidade total;
- a definição não presume que um ponto corresponda a um local físico, estabelecimento ou estação inteira;
- valores conflitantes da mesma série permanecem separados por observação e provisórios até resolução documentada;
- `latest` descreve uma fotografia do total para cada referência temporal e não autoriza sobrescrever valores anteriores.

A chave difere da usada no piloto para tornar explícita a geografia nacional. Nenhum registro do piloto foi persistido, portanto não existe definição anterior a migrar ou renomear.

## Observações propostas

### Valor publicado em março

| Campo | Valor proposto |
| --- | --- |
| Tipo | `quantity` |
| Afirmação da fonte | O Brasil tem 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos. |
| Afirmação normalizada | Brasil: 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026. |
| Estado da normalização | `normalized` |
| Data da observação | `NULL` |
| Geografia | Brasil |
| Método | `manual` |
| Termo da fonte | `pontos públicos e semipúblicos de recarga de veículos elétricos` |
| Identificador proposto | `canonical-0005-abve-21061-fevereiro-2026` |

### Valor referenciado em junho

| Campo | Valor proposto |
| --- | --- |
| Tipo | `quantity` |
| Afirmação da fonte | Último levantamento, de fevereiro de 2026: 21.060. |
| Afirmação normalizada | Brasil: 21.060 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026. |
| Estado da normalização | `normalized` |
| Data da observação | `NULL` |
| Geografia | Brasil |
| Método | `manual` |
| Termo da fonte | `último levantamento` e `total da rede` |
| Identificador proposto | `canonical-0005-abve-21060-fevereiro-2026` |

`observation_date` permanecerá `NULL` porque as afirmações possuem referência mensal, não uma data diária de medição. O mês será representado nos valores métricos.

## Valores métricos propostos

| Origem | Valor | Início | Fim | Geografia | Estado |
| --- | ---: | --- | --- | --- | --- |
| Publicação de março | `21061` | `2026-02-01` | `2026-02-28` | Brasil | `provisional` |
| Publicação de junho | `21060` | `2026-02-01` | `2026-02-28` | Brasil | `provisional` |

O período representa a fotografia da base até fevereiro, não instalações ocorridas entre 1º e 28 de fevereiro. Usar o mês completo preserva a granularidade declarada sem inventar o dia exato de fechamento da base.

Ambos os valores permanecerão `provisional` mesmo depois do aceite. O aceite validará a transcrição, o escopo e a proveniência do conflito; não validará um número como verdadeiro ou preferencial.

## Evidências propostas

Cada observação terá uma evidência ligada à sua própria publicação de origem. As duas evidências usarão `lineage_status = 'likely_shared'` porque as páginas pertencem à mesma série ABVE/Tupi e a atualização de junho referencia o levantamento anterior.

| Observação | Origem | Linhagem proposta |
| --- | --- | --- |
| `21061` | Publicação de 4 de março | `canonical-0005-abve-tupi-base-nacional-fevereiro-2026` |
| `21060` | Publicação de 22 de junho | `canonical-0005-abve-tupi-base-nacional-fevereiro-2026` |

`likely_shared` não torna a origem documental desconhecida: cada publicação exata estará registrada em `origin_content_item_id`. A chave compartilhada e o estado informam que as duas páginas provavelmente derivam da mesma base subjacente e não são confirmações independentes.

## Acontecimentos propostos

| Campo | Publicação de março | Publicação de junho |
| --- | --- | --- |
| Título | ABVE e Tupi publicam 21.061 pontos públicos e semipúblicos para fevereiro de 2026 | Atualização da ABVE e Tupi referencia 21.060 como total de fevereiro de 2026 |
| Tipo | `market_data` | `market_data` |
| Fase | `publication` | `publication` |
| Data | `2026-03-04` | `2026-06-22` |
| Precisão | `day` | `day` |
| Geografia | Brasil | Brasil |
| Verificação | `confirmed` | `confirmed` |
| Situação | `accepted` depois da revisão | `accepted` depois da revisão |
| Identificador | `canonical-0005-abve-tupi-publicam-21061-fevereiro-2026-2026-03-04` | `canonical-0005-abve-tupi-referenciam-21060-fevereiro-2026-2026-06-22` |

`confirmed` significa que as publicações oficiais sustentam aquilo que foi publicado. Não significa que o total subjacente foi auditado, que os dois números se corroboram ou que um deles foi confirmado como correto.

Cada acontecimento terá um vínculo `supports` com sua evidência e dois vínculos `subject`, um para a ABVE e outro para a Tupi Mobilidade.

## Registros mínimos esperados

| Entidade ou vínculo | Criados | Reutilizados |
| --- | ---: | ---: |
| Fonte ABVE | 0 | 1 |
| Publicações | 2 | 0 |
| Observações | 2 | 0 |
| Evidências | 2 | 0 |
| Acontecimentos | 2 | 0 |
| Organização ABVE | 0 | 1 |
| Organização Tupi Mobilidade | 1 | 0 |
| Definição de métrica | 1 | 0 |
| Valores métricos | 2 | 0 |
| Vínculos acontecimento–evidência | 2 | 0 |
| Vínculos acontecimento–organização | 4 | 0 |

Esses identificadores e contagens são propostas para o pacote seguinte. Nenhum registro foi inserido durante a seleção.

## Ausência de resolução

A seleção não encontrou base para:

- atribuir a diferença a erro de digitação;
- interpretar a modificação posterior da página de junho como errata;
- concluir que `21.060` substitui `21.061`;
- elevar `21.061` por coincidir com as somas de componentes;
- rejeitar `21.060` por divergir dessas somas;
- considerar uma unidade de diferença irrelevante;
- aplicar a margem de cinco discutida no piloto.

O resultado selecionado é, portanto, o **conflito não resolvido**, não um dos dois números.

## Adequação ao quinto ciclo

| Requisito | Avaliação |
| --- | --- |
| Duas publicações oficiais acessíveis | Atendido |
| Dois valores exatos | Atendido: `21061` e `21060` |
| Mesma entidade e cobertura | Atendido, sujeito à revisão |
| Mesmo período e geografia | Atendido, sujeito à revisão |
| Ausência de correção oficial localizada | Atendido, sujeito à revisão |
| Uma definição compartilhada | Proposta |
| Proveniência separada | Proposta |
| Ambos os valores provisórios | Proposto |
| Nenhuma tolerância ou escolha de vencedor | Atendido |
| Schema atual suficiente | Atendido, sujeito à validação descartável |
| Independência da carga `0004` | Atendida |

## Próxima etapa condicionada

Depois do `ACCEPTED` e do merge desta seleção, a etapa seguinte poderá criar:

- `data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.sql`;
- `data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.verify.sql`;
- `docs/revisao-carga-canonica-0005.md`.

Nenhum registro será persistido antes da preparação, da validação descartável, da revisão e do merge desse próximo pacote.

## Perguntas para revisão

### Factuais

1. A publicação de março sustenta diretamente `21.061` pontos públicos e semipúblicos na base nacional até fevereiro de 2026?
2. A publicação de junho referencia diretamente `21.060` como o total do levantamento anterior de fevereiro de 2026?
3. As duas publicações tratam da mesma base, entidade, cobertura, geografia e referência temporal?
4. Está correto registrar que não foi localizada errata ou explicação oficial para a diferença?
5. A irregularidade interna da página de junho está descrita corretamente, inclusive que suas parcelas AC/DC e regionais somam `21.061` enquanto o total impresso é `21.060`?

### Metodológicas

6. Está correto usar uma definição comum com unidade `charging_point`, sem afirmar que cada unidade corresponde a um local ou estação inteira?
7. O período de 1º a 28 de fevereiro representa adequadamente uma fotografia consolidada até o mês, e não instalações ocorridas durante o mês?
8. Está correto manter os dois valores `provisional`, mesmo depois do aceite, sem escolher vencedor nem aplicar tolerância?
9. `likely_shared` preserva corretamente que as duas publicações possuem origens documentais distintas, mas provavelmente a mesma base subjacente?
10. Está correto usar `confirmed` para os acontecimentos sem alegar auditoria, corroboração do valor ou independência entre as páginas?

### Operacionais

11. A fonte e a organização ABVE podem ser reutilizadas integralmente da carga `0003`?
12. A Tupi deve ser criada apenas como organização e ligada como `subject` aos dois acontecimentos, sem criar uma segunda fonte de publicação?
13. As contagens e os registros mínimos propostos são suficientes para reconstruir separadamente os dois valores conflitantes?
14. O conjunto atende à decisão do quinto ciclo e pode avançar para o pacote reproduzível da carga `0005`, independentemente da ausência da `0004`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |
