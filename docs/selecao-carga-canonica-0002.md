# Seleção da carga canônica `0002`

## Estado

`PROPOSTA — AGUARDANDO REVISÃO`

Este documento propõe o acontecimento e as duas linhagens que poderão compor a carga `0002`. Ele não cria a carga, não altera o schema e não modifica dados no Supabase.

## Identificação

| Campo | Valor |
| --- | --- |
| Ciclo | Segundo ciclo do fluxo de inteligência |
| Carga futura | `0002` |
| Data da seleção | 4 de setembro de 2026 |
| Decisão aplicável | [Segundo ciclo do fluxo de inteligência](decisao-segundo-ciclo-fluxo-inteligencia.md) |
| Objetivo específico | Testar um acontecimento `corroborated` sustentado por duas linhagens independentes |

## Acontecimento proposto

O acontecimento proposto é a **apresentação do BMW iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, no Autódromo de Interlagos, em São Paulo**. O evento abriu ao público em 27 de agosto de 2026.

A futura carga deverá representar um único acontecimento de `product_service`, na fase `occurrence`, com data precisa, relação explícita com o Brasil e a BMW como organização central.

### Núcleo factual comum

As duas publicações sustentam em conjunto somente que:

- o Festival Interlagos Carros 2026 abriu ao público em 27 de agosto de 2026;
- o evento ocorreu no Autódromo de Interlagos, em São Paulo;
- a BMW apresentou o iX3, um veículo elétrico, ao público brasileiro durante o Festival.

A data canônica proposta é `2026-08-27`: o início do período público do Festival, que se estendeu até 30 de agosto. A cobertura contemporânea registra naquela data a abertura ao público e o iX3 como lançamento da BMW no local; o comunicado posterior confirma que a apresentação aconteceu durante o evento. A futura redação deverá preservar essa distinção e não afirmar que uma apresentação isolada ocorreu somente no dia 27.

O qualificativo **“primeira aparição pública no Brasil”** aparece de forma explícita no material da BMW, mas não integrará o núcleo corroborado. A redação canônica usará apenas “apresentou ao público brasileiro”, que é sustentado pelas duas linhagens.

## Linhagem 1 — fonte primária

| Campo | Valor |
| --- | --- |
| Fonte | BMW Group PressClub Brasil |
| Controle | BMW Group |
| Tipo de fonte proposto | `company` |
| Título | “Novo BMW iX3 fez primeira aparição ao público no Brasil e foi destaque da BMW no Festival Interlagos Carros 2026” |
| Autoria | Fabiano Severo, BMW Group |
| Data da publicação | 3 de setembro de 2026 |
| URL | [Publicação oficial da BMW](https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026) |
| Natureza | Comunicado original e retrospectivo do sujeito do acontecimento |

A publicação informa que o Festival ocorreu de 27 a 30 de agosto de 2026 e que o iX3 fez uma aparição pública no Brasil durante o evento. Por ser uma publicação oficial do próprio sujeito, ela constitui a confirmação primária, mas não é independente.

## Linhagem 2 — fonte adicional

| Campo | Valor |
| --- | --- |
| Fonte | Diário do Grande ABC |
| Controle | Diário do Grande ABC |
| Tipo de fonte proposto | `news_journalism` |
| Título | “Festival Interlagos 2026 tem enxurrada de estreias no país” |
| Autoria | Vagner Aquino |
| Data e hora da publicação | 27 de agosto de 2026, 21h06 |
| URL | [Reportagem do Diário do Grande ABC](https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais) |
| Natureza | Reportagem original e contemporânea ao acontecimento |

A reportagem registra que o Festival abriu ao público naquele dia no Autódromo de Interlagos e identifica o iX3 como o principal lançamento da BMW. A cobertura é assinada, contém fotografia creditada ao próprio repórter e descreve no local as apresentações de várias marcas.

## Avaliação da independência

| Teste | Avaliação |
| --- | --- |
| Controles distintos | BMW Group e Diário do Grande ABC possuem controles institucionais distintos. |
| Independência do sujeito | O Diário do Grande ABC não pertence à BMW. |
| Independência entre publicações | A reportagem foi publicada em 27/08, sete dias antes do comunicado retrospectivo da BMW de 03/09; portanto, não pode ser derivada dessa publicação primária. |
| Base positiva da segunda linhagem | Reportagem contemporânea ao evento, assinada e acompanhada de fotografia própria, descrevendo a abertura ao público e os lançamentos observados. |
| Atribuição do núcleo | A existência do evento aberto e a apresentação do iX3 não são atribuídas exclusivamente ao comunicado da BMW. |
| Mesmo núcleo factual | Ambas sustentam a apresentação pública do iX3 pela BMW no Festival Interlagos, em São Paulo. |
| Conflito material | Não foi identificado conflito sobre o núcleo delimitado. |
| Classificação proposta | `independent`, exclusivamente para o núcleo factual delimitado. |

A classificação não transforma toda a reportagem em confirmação independente de toda alegação da BMW. Especificações e avaliações que dependem da fabricante permanecem fora do núcleo, mesmo quando aparecem nas duas páginas.

## Limite da futura carga

A carga deverá estruturar somente:

- as duas fontes;
- as duas publicações;
- uma observação e uma evidência separadas para cada publicação;
- um único acontecimento sobre a apresentação pública do iX3;
- a BMW como organização central do acontecimento;
- dois vínculos `supports`, um para cada linhagem;
- `verification_level = 'corroborated'` e `workflow_status = 'accepted'`, se o pacote completo for aceito.

Não serão estruturados:

- preço, condições comerciais, pré-venda ou chegada às concessionárias;
- autonomia, potência, torque, aceleração, velocidade ou arquitetura elétrica;
- disponibilidade ou experiência de test-drive;
- alegações de maior alcance, importância histórica, inovação ou interesse do público;
- a afirmação de que essa foi a primeira aparição pública do modelo no Brasil;
- outros veículos, marcas, atrações ou números do Festival;
- expectativas, lançamentos futuros ou desempenho comercial.

Essas exclusões impedem que uma afirmação sustentada apenas pela BMW seja promovida silenciosamente a `corroborated`.

## Candidatos comparados

| Candidato | Fonte primária | Fonte adicional examinada | Relação avaliada | Decisão |
| --- | --- | --- | --- | --- |
| Apresentação pública do BMW iX3 no Festival Interlagos | BMW Group PressClub Brasil | Diário do Grande ABC | `independent` para o núcleo delimitado | Selecionado |
| Inauguração de ponto de recarga GreenV/Porsche em Joinville | GreenV | AutoData | `unresolved` | Não selecionado |
| Integração da rede EletroGraal ao aplicativo My GWM | GWM Brasil | CNN Brasil | `derived` | Não selecionado |

### GreenV/Porsche em Joinville

A [GreenV](https://www.greenv.com.br/blog/highway-charging-chega-a-joinville/) afirma que o ponto foi inaugurado em 30 de julho e já estava em operação. A [AutoData](https://www.autodata.com.br/mobility/2026/08/12/porsche-e-greenv-inauguram-hub-de-recarga-rapida-em-joinville/132454/) publica o mesmo anúncio em 12 de agosto, com autoria identificada e declarações dos executivos das empresas.

Entretanto, a segunda publicação não informa observação no local, teste do carregador, documento próprio ou outra base independente para confirmar a inauguração. A autoria editorial, sozinha, não demonstra uma segunda linhagem factual. A relação permanece `unresolved` e não conta para `corroborated`.

### Integração EletroGraal ao My GWM

A [GWM Brasil](https://www.gwmmotors.com.br/pt/media-center/news/2026/gwm-amplia-ecossistema-de-recarga-com-integracao-da-rede-graal-ao-aplicativo-my-gwm) anunciou a integração em 11 de agosto. A [CNN Brasil](https://www.cnnbrasil.com.br/auto/gwm-expande-ecossistema-de-recarga-e-integra-estradas-ao-app-my-gwm/) publicou no mesmo dia, mas apresenta como origem o anúncio da GWM e usa imagens de divulgação da empresa, sem registrar teste próprio do aplicativo ou confirmação pela operadora.

Para o núcleo considerado, a segunda publicação depende do anúncio empresarial; por isso, a relação foi classificada como `derived` e não conta como confirmação independente.

## Adequação ao segundo ciclo

| Critério | Avaliação |
| --- | --- |
| Não usado nos pilotos nem na carga `0001` | Atendido |
| Publicações recentes | Atendido: 27/08 e 03/09, dentro dos 30 dias anteriores à seleção |
| Relação material com mobilidade elétrica no Brasil | Atendido: apresentação pública de veículo elétrico no país |
| Fonte primária acessível | Atendido |
| Fonte adicional acessível | Atendido |
| Controles institucionais distintos | Atendido |
| Base positiva para independência | Atendido para o núcleo delimitado |
| Um acontecimento realizado | Atendido: apresentação durante o Festival iniciado em 27/08 |
| Mesmo núcleo e sem conflito material | Atendido |
| Sem cálculo ou reconciliação quantitativa | Atendido |
| Sem cadeia regulatória | Atendido |
| Compatível com o schema aprovado | Atendido, sem alteração estrutural |

## O que a revisão deve examinar

Nesta etapa, a revisão é feita neste documento e nas duas publicações originais. Não há carga para executar nem registros novos para consultar no Supabase.

### Perguntas factuais

1. As duas publicações estão acessíveis e seus títulos, autores, datas e URLs foram registrados corretamente?
2. Ambas sustentam o núcleo restrito: a BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos, em São Paulo, cujo período público começou em 27 de agosto de 2026?
3. As exclusões impedem que especificações, superlativos ou a alegação de “primeira aparição” sejam tratadas como corroboradas?

### Perguntas metodológicas

4. A reportagem do Diário do Grande ABC possui base positiva suficiente para ser `independent` quanto ao núcleo restrito, considerando a cobertura contemporânea, a autoria, a fotografia própria e o controle editorial distinto?
5. A cronologia demonstra que a reportagem não deriva do comunicado retrospectivo da BMW publicado sete dias depois?
6. Está correto reservar `corroborated` ao núcleo comum e manter fora dele as afirmações cuja origem independente não foi demonstrada?

### Perguntas operacionais

7. Está correto representar somente um acontecimento e duas linhagens separadas, sem alterar o schema nem tocar no Supabase nesta etapa?
8. As classificações `unresolved` e `derived` justificam adequadamente a exclusão dos outros dois candidatos?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.

## Próxima etapa depois do aceite e do merge

Preparar, em uma nova branch:

- `data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.sql`;
- `docs/revisao-carga-canonica-0002.md`;
- a validação transacional descartável e a proteção da carga `0001` exigidas pela decisão do ciclo.

Nenhuma carga será executada ou persistida antes da revisão e do merge desse próximo pacote.
