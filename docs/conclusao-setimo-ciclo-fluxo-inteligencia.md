# Conclusão do sétimo ciclo do fluxo de inteligência

## Estado

`PROPOSTA — EM REVISÃO`

Este documento avalia o sétimo ciclo depois da seleção do caso, da mudança estrutural, da persistência, da revisão e do merge da carga canônica `0007`. Ele não cria outra carga, não altera o schema e não modifica dados no Supabase.

## Resultado geral

O sétimo ciclo atingiu seu objetivo: o ChargeBR consegue preservar uma mudança de classificação quantitativa, identificar qual metodologia orienta o resultado principal e manter consultável uma comparação produzida pela própria fonte segundo o critério anterior.

Para janeiro de 2025 no Brasil, o banco preserva:

| Papel | Valor | Metodologia | Situação |
| --- | ---: | --- | --- |
| Resultado principal | `12556` | Classificação vigente sem MHEV no total principal | `validated` |
| Comparação contrafactual | `16502` | Critério anterior com MHEV no total principal | `validated` |

A observação contextual de `3946` MHEV explica a diferença entre os totais. A fonte publicou os dois números; nenhum deles foi calculado pelo ChargeBR.

O resultado permite considerar **validado o fluxo manual mínimo para versionar metodologias, ligar valores aos métodos correspondentes e distinguir vigência metodológica de validade factual**.

## O aprendizado que alterou a hipótese inicial

A decisão do sétimo ciclo tratou `superseded` como candidato quando um valor historicamente válido deixasse de representar a série corrente depois de uma revisão metodológica. O caso selecionado revelou uma situação diferente e mais precisa:

- `16502` não era um valor corrente anterior de janeiro de 2025 posteriormente substituído;
- a ABVE publicou `12556` e `16502` na mesma página;
- `12556` era o resultado principal pela classificação vigente;
- `16502` era o total que seria obtido pelo critério anterior;
- o que deixou de ser vigente foi a metodologia anterior, não a validade documental do valor contrafactual.

Por isso, nenhuma transição de valor foi criada. A relação `supersedes` liga a metodologia anterior à vigente, enquanto os papéis `primary` e `counterfactual` distinguem os valores.

Esse desvio em relação à hipótese inicial é um resultado positivo do método: o estado não foi imposto para completar o ciclo. A evidência determinou a representação.

## Trilha completa do ciclo

O ciclo foi dividido em etapas independentes e revisáveis:

1. a [decisão do sétimo ciclo](decisao-setimo-ciclo-fluxo-inteligencia.md) definiu a pergunta entre erro, substituição metodológica e séries paralelas;
2. a [seleção do caso `0007`](selecao-revisao-metodologica-0007.md) confirmou a mudança prospectiva da classificação da ABVE e os dois totais publicados para janeiro de 2025;
3. a [decisão de modelagem](decisao-modelagem-revisao-metodologica-0007.md) demonstrou que texto livre e situação do valor não representavam versões metodológicas;
4. a migration `metric_methodology_history` criou cinco estruturas aditivas;
5. o [resultado da aplicação estrutural](resultado-aplicacao-historico-metodologias-metricas.md) confirmou a segurança da mudança;
6. o [pacote da carga `0007`](revisao-carga-canonica-0007.md) foi executado duas vezes em transação descartável e aceito;
7. a [carga canônica executada](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql) persistiu exatamente o pacote incorporado à `main`;
8. a [consulta reutilizável](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.verify.sql) confirmou o estado `complete`;
9. o [resultado da persistência](resultado-carga-canonica-0007.md) foi aceito e incorporado pelo PR #84.

Nenhuma etapa posterior antecipou o aceite da etapa anterior.

## Mudança estrutural validada

O caso demonstrou a necessidade e a utilidade de cinco tabelas:

| Estrutura | Pergunta respondida |
| --- | --- |
| `metric_methodology_versions` | Quais versões metodológicas existem para a métrica? |
| `metric_methodology_components` | Como cada versão trata cada categoria? |
| `metric_methodology_evidence` | Quais evidências anunciam, definem, confirmam ou contextualizam a versão? |
| `metric_methodology_relations` | Quando uma metodologia substitui outra como referência? |
| `metric_value_methodology_assignments` | Qual metodologia produziu o valor e qual papel ele exerce? |

As tabelas foram acrescentadas sem substituir estruturas existentes. A definição da métrica continua representando a pergunta conceitual; a versão metodológica representa as regras; o valor representa número, período, unidade, geografia e situação; a atribuição une valor, método, origem e papel.

Não foi necessário criar função privilegiada, gatilho, view pública ou política de leitura para provar essa capacidade inicial.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Revisão metodológica relevante e autoritativa | A ABVE anunciou e aplicou novos requisitos técnicos à classificação mensal | Atendido |
| Mesmo período, unidade, geografia e pergunta conceitual | Os dois totais tratam de emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025 | Atendido |
| Versões ligadas aos valores | Cada valor possui atribuição à metodologia correspondente | Atendido |
| Autoridade e cronologia reconstruíveis | Anúncio, publicação inicial e confirmação posterior possuem evidências e acontecimentos próprios | Atendido |
| Alcance temporal documentado | A mudança é prospectiva a partir de janeiro de 2025; não houve recálculo anual inventado | Atendido |
| Estados definidos pela evidência | Os dois valores ficaram `validated`; os papéis, e não uma rejeição ou substituição, expressam a diferença | Atendido |
| Critério anterior consultável | A metodologia anterior, seus componentes e `16502` permanecem preservados | Atendido |
| Resultado corrente identificável | `12556` está ligado à metodologia vigente e ao papel `primary` | Atendido |
| Lacuna estrutural resolvida antes da carga | Migration, aplicação e resultado foram revisados em etapas próprias | Atendido |
| Execução e resultado aceitos | A carga ficou `complete` e o resultado foi incorporado pelo PR #84 | Atendido |

Os dez critérios do sétimo ciclo foram atendidos. O sexto critério foi satisfeito sem usar `superseded`, possibilidade que a própria decisão havia preservado.

## O que foi validado

O sétimo ciclo acrescenta às capacidades anteriores:

1. manter uma única definição conceitual para resultados produzidos sob classificações diferentes;
2. criar versões metodológicas imutáveis sem editar a versão anterior;
3. representar componentes incluídos e publicados separadamente;
4. ligar anúncio, definição, contexto e confirmação posterior às versões correspondentes;
5. relacionar metodologias por `supersedes` com data de vigência;
6. derivar a metodologia vigente sem coluna `is_current`;
7. ligar cada valor à metodologia que o produziu;
8. distinguir resultado principal de comparação contrafactual publicada;
9. manter dois valores `validated` sem criar conflito ou resolução artificiais;
10. preservar contexto quantitativo sem transformá-lo automaticamente em outra métrica;
11. diferenciar valores publicados pela fonte de futuros valores derivados pelo ChargeBR;
12. proteger todas as cargas anteriores por assinatura integral;
13. executar de forma idempotente no ensaio e exatamente uma vez na persistência definitiva.

Essas regras validam o caso observado. Elas não autorizam aplicar automaticamente a mesma classificação a outras séries ou períodos.

## Significado dos estados e relações

| Estado, papel ou relação | Significado neste caso | O que não significa |
| --- | --- | --- |
| Evidência `established` | A origem documental utilizada é conhecida | Que a base de emplacamentos foi auditada independentemente |
| Acontecimento `confirmed` | A publicação oficial sustenta o registro do que a ABVE afirmou | Que os dados subjacentes foram corroborados por outra instituição |
| Valor `validated` | A representação corresponde ao número e ao papel publicados | Que ambas as metodologias estão vigentes |
| Papel `primary` | O valor é o resultado principal segundo a classificação vigente | Que o ChargeBR o calculou ou auditou |
| Papel `counterfactual` | A fonte informou qual seria o total sob outro critério | Que esse era o resultado corrente anterior ou um erro corrigido |
| Relação `supersedes` | A metodologia nova substitui a anterior como referência a partir da data indicada | Que todos os valores da metodologia anterior sejam falsos ou `superseded` |
| Componente `reported_separately` | A categoria não integra o total principal, mas continua publicada | Que a categoria seja irrelevante ou inexistente |

Validade do valor e vigência da metodologia permanecem dimensões distintas.

## Aprendizados metodológicos

### `supersedes` pode pertencer ao método, não ao valor

Uma nova metodologia não produz automaticamente uma transição de situação em todos os valores associados ao método anterior. Primeiro é preciso saber se o valor antigo foi resultado corrente, comparação, série paralela ou recálculo.

No caso `0007`, usar `metric_value_status_transitions` teria inventado uma história que a fonte não publicou. A relação metodológica expressa a mudança sem alterar artificialmente a situação dos valores.

### A mesma pergunta conceitual pode ter definições operacionais versionadas

Os dois valores tratam do agregado que a ABVE denomina veículos leves eletrificados. O tratamento de MHEV mudou, mas período, unidade, geografia e pergunta geral permaneceram reconhecíveis.

Criar duas métricas independentes esconderia essa continuidade. Fixar a composição na definição da métrica esconderia a mudança. A separação entre definição conceitual e metodologia preserva as duas dimensões.

### Um valor contrafactual publicado não é cálculo do ChargeBR

`16502` foi informado diretamente pela ABVE. Sua origem é `source_published`, mesmo que seu papel seja contrafactual. A igualdade entre `12556`, `3946` e `16502` pode ser verificada, mas não é usada para reivindicar autoria do número.

Um futuro cálculo próprio precisará de identidade, fórmula, entradas, metodologia aplicada, precisão, resultado ou motivo de bloqueio e revisão humana. Essa capacidade não foi antecipada.

### A ausência de recálculo também é informação

O balanço anual de 2024 permite combinações plausíveis que divergem em uma unidade, mas a ABVE não publicou um total anual integralmente recalculado pela nova metodologia. O ChargeBR preservou a ambiguidade e não escolheu um resultado por aritmética.

Não produzir um número quando fórmula ou entradas não são unívocas é parte da qualidade do produto.

## Como o caso pode ser comunicado

O modelo agora sustenta três apresentações diferentes.

### Pela metodologia vigente

> **Metodologia vigente da ABVE:** 12.556 emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025. Inclui BEV, PHEV, HEV e HEV Flex; MHEV são publicados separadamente.

### Como publicado

> **Resultado principal:** 12.556 pela classificação vigente. **Comparação publicada pela ABVE:** pelo critério anterior, incluindo MHEV, o total seria 16.502.

### Comparação metodológica

| Critério | Total | Tratamento de MHEV |
| --- | ---: | --- |
| Vigente desde janeiro de 2025 | `12556` | Publicado separadamente |
| Anterior | `16502` | Incluído no total |

A comunicação não deve dizer que a ABVE “corrigiu `16502` para `12556`”, que o valor anterior estava errado ou que o ChargeBR recalculou qualquer dos dois números.

## Aprendizados operacionais

### Uma cadeia metodológica pode permanecer imutável

Cada mudança futura deverá criar nova versão e nova relação. Não é necessário marcar a versão anterior com `is_current` nem editar suas regras para indicar o sucessor.

A metodologia vigente pode ser derivada pelas relações e datas. Essa abordagem reduz estados duplicados, mas ainda precisa ser exercitada em uma consulta de apresentação reutilizável.

### Papéis estruturados evitam decisões editoriais ocultas

Sem `primary` e `counterfactual`, uma consulta poderia retornar dois valores igualmente `validated` sem explicar qual deve orientar a visão corrente. O papel faz parte do dado e não fica dependente de redação manual posterior.

### Identificadores estáveis continuam sendo o controle de identidade

Os ensaios descartáveis consumiram números de sequências sem deixar linhas. Chaves metodológicas, impressões digitais, restrições, contagens e assinaturas permitiram verificar o pacote independentemente das lacunas nos identificadores internos.

## Simplificações que funcionaram

- uma definição conceitual foi suficiente para os dois valores;
- duas versões metodológicas representaram a mudança sem backfill das cargas anteriores;
- cinco componentes por versão tornaram consultável a diferença crítica;
- uma relação `supersedes` representou a vigência sem editar o passado;
- dois papéis distinguiram o resultado principal da comparação;
- `3946` permaneceu contexto, evitando criar uma métrica fora do recorte;
- três publicações separaram anúncio, aplicação e confirmação posterior;
- a consulta reutilizável representou `absent` antes e `complete` depois;
- o ensaio com duas execuções e `ROLLBACK` comprovou idempotência;
- a aplicação definitiva executou o mesmo arquivo uma vez entre `BEGIN` e `COMMIT`.

Essas simplificações devem ser mantidas enquanto casos reais não demonstrarem necessidade adicional.

## Limites do que foi provado

O ciclo ainda não validou:

- um valor que realmente passe para `superseded`;
- recálculo retroativo de uma série histórica pela fonte;
- valor derivado pelo ChargeBR;
- fórmula e entradas estruturadas;
- cálculo bloqueado por dados ambíguos ou insuficientes;
- metodologia com mais de um sucessor;
- metodologias paralelas sem relação de substituição;
- cadeias com três ou mais versões;
- revisão aplicável a múltiplos períodos;
- backfill metodológico das cargas `0001` a `0006`;
- consulta ou view reutilizável para a metodologia vigente;
- contrato de apresentação “como publicado”;
- API, política pública ou interface para expor a história metodológica;
- auditoria independente da base da ABVE;
- resolução do conflito `21061` versus `21060` da carga `0005`;
- retomada da carga `0004`;
- automação, escala, alerta ou produto público.

Uma única relação metodológica bem representada não prova que qualquer cadeia futura possa ser exposta corretamente sem novos controles.

## Próxima capacidade proposta

O oitavo ciclo deverá testar **uma projeção de leitura segura e reproduzível para comunicar dados canônicos sem perder metodologia, papel, proveniência e incerteza**.

O primeiro caso deverá reutilizar exclusivamente a carga `0007` e produzir três saídas:

1. visão pela metodologia vigente;
2. visão completa “como publicado”;
3. comparação entre versões metodológicas.

O objetivo não será construir ainda uma interface pública. Será definir e validar o contrato de leitura que uma futura interface, API, análise ou texto editorial poderá consumir.

A decisão do oitavo ciclo deverá estabelecer:

- como selecionar a metodologia vigente para uma data sem `is_current`;
- como escolher o valor `primary` sem ocultar valores `counterfactual`;
- quais campos de período, unidade, geografia, situação, fonte e verificação são obrigatórios na saída;
- como apresentar componentes incluídos ou publicados separadamente;
- como expor anúncio, definição e confirmação da metodologia;
- como impedir que o texto atribua cálculos do ChargeBR à fonte;
- como responder quando não houver atribuição metodológica revisada;
- se uma consulta SQL reutilizável é suficiente ou se uma view exige decisão estrutural e de segurança própria.

Esse passo transforma a estrutura já validada em um contrato de comunicação verificável, sem antecipar cálculo derivado ou produto público.

## Interrupções necessárias no próximo ciclo

O oitavo ciclo deverá parar quando:

- a saída depender de escolher silenciosamente entre dois valores sem papel estruturado;
- não for possível determinar a metodologia vigente pelas relações e datas;
- a consulta precisar inferir informação ausente a partir de texto livre;
- um valor `counterfactual` puder aparecer como resultado principal;
- a saída ocultar período, unidade, geografia, situação ou fonte;
- a redação puder confundir publicação da fonte com cálculo do ChargeBR;
- a exposição pública exigir permissões, RLS ou view ainda não decididas;
- o teste introduzir nova carga, fonte ou cálculo próprio sem decisão anterior;
- a consulta precisar modificar dados;
- qualquer resultado anterior deixar de permanecer integralmente protegido.

Uma interrupção deverá produzir uma decisão explícita, não uma correção silenciosa na camada de apresentação.

## O que permanece fora da próxima etapa

- interface pública completa;
- API aberta;
- autenticação ou contas de usuário;
- newsletter, alerta ou produto pago;
- valor calculado pelo ChargeBR;
- recálculo histórico;
- fórmula e entradas derivadas;
- nova carga canônica;
- backfill das cargas anteriores;
- resolução do conflito da carga `0005`;
- retomada forçada da carga `0004`;
- automação de redação ou seleção metodológica;
- migração do Notion.

## Perguntas para revisão

1. Os dez critérios de sucesso do sétimo ciclo foram atendidos?
2. Está correto concluir que a evidência substituiu a metodologia anterior, mas não demonstrou uma transição `superseded` entre valores?
3. Está correto manter `12556` e `16502` como `validated`, diferenciados por metodologia e pelos papéis `primary` e `counterfactual`?
4. A separação entre definição conceitual, metodologia, valor e atribuição preserva adequadamente o significado de cada elemento?
5. Os componentes e os vínculos de evidência tornam a diferença metodológica reconstruível sem depender apenas de texto livre?
6. Está claro que `16502` foi publicado pela fonte como contrafactual e não calculado pelo ChargeBR?
7. A conclusão preserva corretamente a ambiguidade anual de 2024 sem escolher um valor derivado?
8. As três formas de comunicação evitam chamar a mudança metodológica de correção de erro?
9. Os limites reconhecem adequadamente que ainda não foram validados cálculo próprio, `superseded`, cadeias longas, view ou exposição pública?
10. Uma projeção de leitura segura para metodologia vigente, história publicada e comparação metodológica é a próxima capacidade adequada?
11. Está correto reutilizar somente a carga `0007` nesse teste, sem introduzir nova fonte, carga ou cálculo?
12. As interrupções e exclusões impedem que a camada de apresentação invente decisões que os dados não sustentam?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |

