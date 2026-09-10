# Seleção da revisão metodológica `0007`

## Estado

`PROPOSTA — EM REVISÃO`

Este documento seleciona um caso real para o [sétimo ciclo do fluxo de inteligência](decisao-setimo-ciclo-fluxo-inteligencia.md): a mudança da classificação usada pela ABVE Data para o total mensal de veículos leves eletrificados no Brasil a partir de janeiro de 2025.

O caso permitirá decidir como o ChargeBR deve preservar valores produzidos por metodologias anteriores, identificar a metodologia vigente e apresentar uma série comparável sem confundir valor publicado pela fonte com valor calculado pelo próprio ChargeBR.

Esta etapa não decide a estrutura do banco, não cria SQL e não consulta nem modifica o Supabase.

## Resultado da seleção

A fonte primária selecionada publica dois valores para o mesmo recorte de janeiro de 2025:

| Versão metodológica | Tecnologias incluídas no total | Valor | Papel documental |
| --- | --- | ---: | --- |
| Critério anterior | BEV, PHEV, HEV, HEV Flex e MHEV | `16.502` | Total que seria obtido pelo critério anterior |
| Critério vigente desde janeiro de 2025 | BEV, PHEV, HEV e HEV Flex | `12.556` | Resultado principal da série nova |

A diferença de `3.946` corresponde ao total de MHEV publicado para o mesmo mês: `2.883` MHEV de 12 V e `1.063` MHEV de 48 V.

Os dois valores possuem a mesma:

- pergunta conceitual geral: quantos emplacamentos de veículos leves pertencem ao agregado chamado de eletrificados pela ABVE;
- unidade: emplacamentos de veículos leves;
- geografia: Brasil;
- referência temporal: janeiro de 2025;
- autoridade: ABVE Data;
- base factual mensal.

O que muda é a definição operacional do agregado: os MHEV deixam de integrar o total principal.

## Parâmetros do caso

| Campo | Valor selecionado |
| --- | --- |
| Data da pesquisa | 9 de setembro de 2026 |
| Métrica conceitual | Emplacamentos mensais de veículos leves classificados como eletrificados pela ABVE Data |
| Período medido | 1º a 31 de janeiro de 2025 |
| Unidade | Emplacamento de veículo leve |
| Geografia | Brasil |
| Valor sob o critério anterior | `16502` |
| Valor sob o critério vigente | `12556` |
| Diferença explicada pela fonte | `3946` MHEV |
| Tipo de mudança | Revisão metodológica de classificação |
| Aplicação declarada | Prospectiva, a partir de janeiro de 2025 |
| Autoridade | ABVE Data |
| Dificuldade exclusiva | Separar validade factual, versão metodológica, vigência e papel do valor |

## Fonte primária selecionada

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Produto de dados | ABVE Data |
| Título | ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números |
| Data exibida | 10 de fevereiro de 2025 |
| URL | <https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/> |
| Idioma | `pt-BR` |
| Natureza | Publicação institucional da mantenedora da série |
| Acessibilidade | Página acessível na data da pesquisa |

A publicação declara que:

- o Brasil vendeu `12.556` veículos leves eletrificados em janeiro segundo a classificação nova;
- o total novo é a soma de BEV, PHEV, HEV e HEV Flex;
- MHEV não integram mais o total principal para o acompanhamento da eletromobilidade;
- pelo critério anterior, incluindo MHEV, o total seria `16.502`;
- os MHEV somaram `3.946` no mês;
- os MHEV continuariam contabilizados e publicados em quadros separados;
- a série histórica sob a classificação nova se inicia em janeiro de 2025.

A própria mantenedora fornece os dois resultados e explica a diferença. O ChargeBR não precisa escolher um valor por preferência nem calcular o par selecionado.

## Fontes primárias de contexto

### Anúncio da mudança

| Campo | Valor observado |
| --- | --- |
| Título | Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024 |
| Data exibida | 6 de janeiro de 2025 |
| URL | <https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/> |
| Papel | Anuncia requisitos técnicos novos para os números a partir de janeiro de 2025 |

Essa publicação demonstra que a mudança foi anunciada antes da divulgação do resultado de janeiro. A ABVE informa que passaria a considerar requisitos como voltagem da bateria, tração elétrica, potência da bateria e contribuição à redução de emissões, mantendo as demais categorias híbridas em tabelas separadas.

### Continuidade da classificação nova

| Campo | Valor observado |
| --- | --- |
| Título | Eletrificados leves atingem 15% de participação de mercado em janeiro |
| Data exibida | 9 de fevereiro de 2026 |
| URL | <https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/> |
| Papel | Reutiliza `12.556` como referência de janeiro de 2025 e reafirma a classificação vigente |

A publicação compara janeiro de 2026 com janeiro de 2025 usando `12.556`. Também reafirma que os critérios vigentes desde janeiro de 2025 incluem BEV, PHEV, HEV e HEV Flex e excluem MHEV do total principal.

Essa continuidade permite identificar `12.556` como valor da série sob a metodologia atual, e não apenas como escolha editorial isolada da primeira publicação.

## Duas dimensões que o modelo deverá separar

O caso demonstra que validade factual e vigência metodológica não são a mesma coisa.

| Dimensão | Pergunta | Resultado no caso |
| --- | --- | --- |
| Validade factual | O número foi publicado corretamente para o método ao qual está ligado? | `16.502` e `12.556` foram publicados pela ABVE para seus respectivos critérios |
| Vigência metodológica | Qual critério orienta a série principal a partir de janeiro de 2025? | O critério que exclui MHEV |
| Papel documental | O valor foi o resultado corrente, uma comparação ou um cálculo do ChargeBR? | `12.556` é corrente; `16.502` é comparação contrafactual publicada pela fonte |
| Comparabilidade | Os valores respondem à mesma pergunta operacional? | Não sem identificar a versão metodológica |

Um valor não se torna falso porque a classificação deixa de ser vigente. Da mesma forma, um valor calculado sob um critério anterior não deve ser apresentado como se tivesse sido o resultado corrente da série.

## Tratamento proposto para os valores

### `12.556`

- valor diretamente publicado pela ABVE;
- resultado principal para janeiro de 2025;
- ligado à metodologia vigente a partir daquele mês;
- candidato a `validated` depois da revisão humana;
- candidato a valor exibido por padrão quando o usuário escolher a metodologia atual da ABVE.

### `16.502`

- valor diretamente publicado pela ABVE;
- produzido pela aplicação do critério anterior ao mesmo conjunto mensal;
- formulado pela fonte como o total que seria obtido pelo critério anterior;
- candidato a `validated` quanto à transcrição e à aplicação declarada desse critério;
- não deve ser marcado como `rejected`;
- não deve ser descrito como resultado corrente anterior de janeiro de 2025;
- não deve receber `superseded` apenas por usar a metodologia antiga.

O caso sugere que `superseded` pertence primeiro à **vigência da versão metodológica**, não à veracidade do valor. A decisão de modelagem deverá verificar se o estado de um valor e o estado de uma metodologia precisam ser estruturas separadas.

## Por que o caso é elegível sem inventar uma substituição

O objetivo do sétimo ciclo não é obrigar todo caso de mudança metodológica a terminar com um valor `superseded`. A decisão aceita determina que o estado deve ser consequência da evidência e admite que os valores permaneçam válidos sob definições diferentes.

Neste caso:

- a revisão metodológica é explícita e autoritativa;
- os dois critérios são identificáveis;
- os dois valores são publicados pela própria mantenedora;
- período, unidade e geografia são iguais;
- o valor corrente sob a metodologia nova é identificável;
- a classificação anterior deixa de orientar o total principal;
- a fonte preserva MHEV como série separada;
- não existe erro material declarado.

A particularidade é que `16.502` não foi publicado anteriormente como resultado corrente. Ele aparece como comparação contrafactual na mesma publicação que divulga `12.556`. Essa característica não invalida o caso metodológico; ela impede somente uma falsa transição histórica do valor para `superseded`.

O caso é selecionado para revelar como representar versões metodológicas e papéis documentais sem usar um único estado para significados diferentes.

## Papel analítico do ChargeBR

O ChargeBR não deve depender de a mantenedora republicar toda a série histórica sempre que uma metodologia mudar. Quando houver dados de entrada suficientes, o ChargeBR poderá produzir uma visão comparável segundo a metodologia atual.

Essa capacidade deverá obedecer a controles mínimos:

1. preservar o valor exatamente como publicado pela fonte;
2. preservar a metodologia que produziu o valor original;
3. registrar separadamente qualquer valor recalculado pelo ChargeBR;
4. identificar a metodologia aplicada ao recálculo;
5. armazenar fórmula, entradas, unidades e proveniência;
6. registrar quem revisou e quando aceitou o cálculo;
7. nunca atribuir o valor derivado à fonte como se ela o tivesse publicado;
8. impedir o recálculo quando as entradas ou as regras forem ambíguas;
9. permitir reconstruir o resultado sem depender apenas de texto livre;
10. manter disponíveis tanto a visão comparável quanto a história publicada.

Portanto, “apresentar os dados pela metodologia atual” não significa sobrescrever números antigos. Significa criar uma projeção analítica versionada sobre a história preservada.

## Comunicação ao usuário final

Para janeiro de 2025, a apresentação poderá distinguir:

> **Metodologia vigente da ABVE:** 12.556 emplacamentos de veículos leves eletrificados no Brasil. Inclui BEV, PHEV, HEV e HEV Flex; não inclui MHEV.

E, na comparação metodológica:

> **Pelo critério anterior:** o mesmo mês teria 16.502 emplacamentos classificados como eletrificados. A diferença de 3.946 corresponde aos MHEV publicados separadamente pela ABVE.

A interface futura deverá permitir pelo menos:

- visão pela metodologia vigente;
- visão “como publicado”;
- comparação entre versões metodológicas;
- identificação de valores publicados pela fonte;
- identificação inequívoca de valores calculados pelo ChargeBR;
- acesso à fórmula, aos componentes e às limitações de cada recálculo.

Expressões como “a ABVE corrigiu o total de `16.502` para `12.556`” ou “o valor antigo estava errado” seriam imprecisas e não deverão ser usadas.

## Limite revelado pelo ano de 2024

O balanço anual de 2024 é útil como teste negativo, mas não integra o par canônico desta seleção.

A ABVE publica:

- total anual de `177.358`;
- total de `173.530` após excluir `3.828` micro-híbridos de 12 V recém-lançados;
- `16.185` MHEV no quadro anual por tecnologia;
- valores separados para BEV, PHEV, HEV e HEV Flex.

Aplicar a classificação nova ao ano inteiro gera uma ambiguidade de uma unidade:

- somar BEV, PHEV, HEV e HEV Flex resulta em `161.172`;
- subtrair os `16.185` MHEV do total `177.358` resulta em `161.173`.

A fonte não publica nenhum desses dois resultados como total anual revisado. Por isso, o ChargeBR não deverá escolher silenciosamente um deles nem apresentar `173.530` como aplicação integral da metodologia nova.

Quando um recálculo não for unívoco, a comunicação correta será informar que o valor comparável pela metodologia atual está indisponível ou permanece em conflito, preservando os componentes e a razão da ambiguidade.

Esse limite confirma por que valores publicados e derivados precisam de papéis diferentes no modelo.

## Recorte canônico

### Incluído

- uma métrica conceitual: emplacamentos mensais classificados como eletrificados pela ABVE Data;
- janeiro de 2025;
- Brasil;
- unidade `vehicle_registration`;
- `16.502` sob o critério anterior;
- `12.556` sob o critério vigente;
- `3.946` MHEV como explicação publicada da diferença;
- as duas versões de classificação;
- a natureza contrafactual do valor sob o critério anterior;
- a continuidade posterior de `12.556` na série nova.

### Excluído

- valores anuais de 2024 como observações canônicas da carga `0007`;
- `177.358`, `173.530`, `161.172` e `161.173` como valores da métrica selecionada;
- todos os demais meses;
- valores individuais de BEV, PHEV, HEV e HEV Flex;
- participação de mercado;
- percentuais de crescimento;
- projeções de vendas;
- julgamento técnico próprio sobre quais veículos deveriam ser chamados de eletrificados;
- qualquer recálculo do ChargeBR nesta etapa;
- correções materiais ou conflitos de outras cargas.

O valor `3.946` será contexto metodológico indispensável para explicar o par, não uma segunda métrica independente do ciclo.

## Requisitos revelados para a decisão de modelagem

A próxima etapa deverá avaliar como representar estruturalmente:

1. uma métrica conceitual estável;
2. versões distintas da metodologia dessa métrica;
3. vigência inicial e final de cada versão;
4. a ligação de cada valor à versão aplicada;
5. o papel do valor: corrente, contrafactual publicado ou derivado pelo ChargeBR;
6. validade factual separada de vigência metodológica;
7. a metodologia atual sem apagar a anterior;
8. séries mantidas em paralelo, como os MHEV separados;
9. fórmula e linhagem de futuros recálculos;
10. impossibilidade documentada de recálculo quando houver ambiguidade;
11. consulta padrão pela metodologia atual;
12. consulta histórica “como publicado”.

A decisão deverá comparar esses requisitos com `metric_definitions`, `metric_values`, `content_items`, `observations`, `evidence`, resoluções e transições já existentes. Não deverá presumir que `methodology_notes` em texto livre seja suficiente.

## Adequação ao sétimo ciclo

| Requisito | Avaliação |
| --- | --- |
| Uma única métrica, unidade, geografia e referência temporal | Atendido |
| Dois valores sob critérios distintos | Atendido: `16.502` e `12.556` |
| Mudança metodológica declarada | Atendida pela ABVE Data |
| Autoridade sobre a série | Atendida pela mantenedora |
| Métodos identificáveis | Atendidos pela inclusão ou exclusão de MHEV |
| Valor corrente identificável | `12.556` sob a metodologia vigente |
| Valor anterior preservável | `16.502`, com papel contrafactual explícito |
| Ausência de erro material declarado | Atendida |
| `superseded` decidido pela evidência | Não aplicável ao valor; candidato à vigência da metodologia anterior |
| Necessidade de modelagem demonstrada | Dois eixos de estado, versões e papéis de valor ainda precisam ser avaliados |
| Elegibilidade para carga imediata | Não; exige decisão de modelagem e eventual mudança estrutural |

O aceite desta seleção autorizará somente a preparação da decisão de modelagem.

## Efeito sobre o repositório e o banco

Esta etapa acrescenta apenas a documentação da seleção e seu vínculo no índice.

Não serão criados nesta etapa:

- migration ou alteração de schema;
- arquivo SQL da carga `0007`;
- consulta de verificação;
- fonte, publicação, observação, evidência, acontecimento ou valor métrico;
- resolução ou transição de estado;
- valor derivado;
- alteração no seed.

O Supabase não foi consultado nem modificado. Todas as cargas anteriores permanecem inalteradas.

## Próxima etapa condicionada

Depois de `ACCEPTED` e do merge desta seleção, preparar uma decisão separada que compare o caso com o schema atual e proponha a menor representação capaz de separar:

- conceito da métrica;
- versão metodológica;
- vigência da metodologia;
- validade do valor;
- papel documental do valor;
- linhagem de cálculos do ChargeBR.

A decisão de modelagem deverá definir também como a consulta futura escolherá a metodologia atual e como preservará a visualização “como publicado”. Nenhuma carga será preparada antes dessa decisão e de qualquer mudança estrutural necessária.

## Perguntas para revisão

### Factuais

1. A publicação de 10 de fevereiro de 2025 apresenta `12.556` pela classificação nova, `16.502` pelo critério anterior e `3.946` MHEV para janeiro de 2025?
2. A ABVE declara que o critério novo inclui BEV, PHEV, HEV e HEV Flex e exclui MHEV do total principal?
3. Está claro que período, unidade e geografia são iguais nos dois valores e que a diferença decorre da classificação?
4. A publicação de fevereiro de 2026 reutiliza `12.556` como referência de janeiro de 2025 e confirma a continuidade do critério novo?

### Metodológicas

5. Está correto selecionar o caso mesmo que `16.502` seja uma comparação contrafactual publicada pela fonte, e não um resultado corrente anterior?
6. Está correto preservar os dois valores como factualmente válidos sob seus critérios, sem marcar `16.502` como `rejected` ou `superseded`?
7. Está correto tratar a metodologia anterior — e não automaticamente o valor — como candidata a `superseded` quanto à sua vigência?
8. Está correto permitir futuros recálculos pelo ChargeBR somente quando método, entradas, fórmula e resultado forem auditáveis?
9. Está correto exigir que um valor derivado seja identificado como cálculo do ChargeBR e nunca atribuído à fonte?
10. Está correto não escolher um valor recalculado para 2024 enquanto a diferença de uma unidade permanecer sem resolução?

### Produto e operação

11. Está correto planejar uma visão padrão pela metodologia atual e uma visão separada “como publicado”?
12. Os doze requisitos revelados são suficientes para orientar a decisão de modelagem sem escolher antecipadamente o schema?
13. Está correto avançar, depois do aceite e do merge, somente para a decisão de modelagem, sem preparar ainda a carga `0007`?
14. Está correto manter SQL, schema e Supabase inalterados nesta etapa?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 10 de setembro de 2026 |
| Resultado | `ACCEPTED` |
