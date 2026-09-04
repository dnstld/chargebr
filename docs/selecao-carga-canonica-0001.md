# Seleção da carga canônica `0001`

## Estado

`SELECIONADA — AGUARDANDO PREPARACAO`

Este documento registra a escolha do primeiro acontecimento do fluxo de inteligência. A seleção não cria nem autoriza ainda uma carga no Supabase.

## Identificação

| Campo | Valor |
| --- | --- |
| Ciclo | Primeiro ciclo do fluxo de inteligência |
| Carga futura | `0001` |
| Pessoa responsável pela escolha | Denis Toledo |
| Data da escolha | 4 de setembro de 2026 |
| Decisão aplicável | [Primeiro ciclo do fluxo de inteligência](decisao-primeiro-ciclo-fluxo-inteligencia.md) |

## Publicação escolhida

| Campo | Valor |
| --- | --- |
| Fonte primária | Jeep no portal oficial Stellantis Media |
| Título original | “Chegou o Novo Jeep Avenger! Inovador, tecnológico e sofisticado, modelo representa a essência da marca para conquistar novos territórios no Brasil” |
| Data da publicação | 13 de agosto de 2026 |
| URL | [Publicação oficial da Jeep](https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil) |
| Natureza | Comunicado de imprensa original da empresa |

## Acontecimento delimitado

O acontecimento proposto é o **lançamento comercial do Jeep Avenger híbrido MHEV no Brasil em 13 de agosto de 2026**.

A publicação afirma que:

- o Novo Jeep Avenger chegou ao mercado brasileiro;
- o modelo foi apresentado nas versões Altitude, Longitude e Limited;
- todas as versões possuem motorização híbrida MHEV de 12 V;
- as três versões podiam ser reservadas nas concessionárias Jeep a partir da data da publicação.

Essas afirmações descrevem um único lançamento de produto. A abertura de reservas ajuda a distinguir o lançamento realizado de uma expectativa futura de disponibilidade.

## Limite da carga

A carga deverá estruturar somente o necessário para representar o lançamento:

- a fonte oficial;
- a publicação de 13/08/2026;
- uma observação fiel sobre o lançamento e a motorização híbrida;
- uma evidência derivada dessa observação;
- um acontecimento de `product_service`, com data precisa e relação explícita com o Brasil;
- a marca Jeep como organização do tipo `other` e sujeito central do acontecimento;
- o vínculo `supports` entre acontecimento e evidência.

Não serão estruturados nesta carga:

- preço ou condições comerciais;
- lista de equipamentos e especificações detalhadas;
- autonomia, potência, dimensões ou desempenho;
- alegações promocionais sobre inovação, sofisticação ou liderança;
- prêmios, histórico internacional ou comparações com concorrentes;
- produção industrial, empregos ou investimentos da Stellantis;
- disponibilidade futura que não esteja materializada pela abertura de reservas;
- a participação da Mopar, que pertence a outro candidato e não a esta publicação.

## Proveniência e nível de confirmação

A fonte é primária e apropriada para confirmar que a própria Jeep lançou e abriu reservas do produto no Brasil. Ela não constitui confirmação independente das avaliações promocionais da empresa nem de eventual desempenho comercial futuro.

O acontecimento poderá usar `verification_level = 'confirmed'`, mas não `corroborated`. A redação deverá permanecer limitada ao lançamento declarado pela empresa.

Jeep é uma marca da Stellantis, não uma pessoa jurídica independente. Por isso, o registro não deverá classificá-la como `company`: usará `organization_type = 'other'`, com a natureza de marca explicada sem atribuir personalidade jurídica. A relação corporativa com a Stellantis não é indispensável para representar este lançamento e ficará fora da carga. Se hierarquias entre marcas e empresas se tornarem necessárias em casos futuros, deverão gerar uma decisão própria.

## Adequação ao primeiro ciclo

| Critério | Avaliação |
| --- | --- |
| Não usado nos pilotos | Atendido |
| Publicado nos 30 dias anteriores à seleção | Atendido |
| Relação material com o Brasil | Atendido: lançamento nacional de veículo híbrido |
| Fonte primária acessível | Atendido |
| Um acontecimento realizado | Atendido: lançamento com reservas abertas |
| Sem cálculo ou reconciliação quantitativa | Atendido |
| Sem cadeia regulatória | Atendido |
| Compatível com o schema aprovado | Atendido, sem nova tabela ou relação |

## Alternativas não escolhidas

| Alternativa | Motivo para não usar na carga `0001` |
| --- | --- |
| Lançamento do adaptador V2L da Leapmotor | Também era simples e elegível, mas possui relevância material menor para inaugurar o fluxo canônico. |
| Financiamento da Prefeitura de São Paulo com o BIRD | É muito relevante, mas envolve mutuário, financiador, garantidora, valores e estimativas; excede a complexidade aprovada para o primeiro ciclo. |

As alternativas podem voltar a ser avaliadas em ciclos futuros. A seleção atual não as rejeita como possíveis acontecimentos do ChargeBR.

## Próxima etapa

Depois do merge desta seleção, preparar em uma nova branch:

- `data/canonical/0001_jeep-avenger-lancamento-brasil.sql`;
- `docs/revisao-carga-canonica-0001.md`;
- a validação transacional descartável exigida pela decisão do ciclo.

Nenhum registro será persistido antes da revisão e do merge dessa próxima etapa.
