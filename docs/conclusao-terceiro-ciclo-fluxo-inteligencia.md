# Conclusão do terceiro ciclo do fluxo de inteligência

## Estado

`AGUARDANDO REVISÃO`

Este documento avalia o terceiro ciclo operacional do fluxo de inteligência depois da persistência, da revisão e do merge da carga canônica `0003`. Ele não cria outra carga, não altera o schema, não modifica dados no Supabase e não autoriza automação.

## Resultado geral

O terceiro ciclo atingiu seu objetivo: um número publicado foi representado simultaneamente como afirmação observada, valor normalizado de uma métrica e acontecimento canônico, sem perder unidade, período, geografia ou proveniência.

O banco contém um único valor `25782`, com unidade canônica `vehicle_registration`, período de 1º a 31 de julho de 2026, geografia Brasil e situação `validated`. A publicação da ABVE Data, a observação, a evidência, o acontecimento e a organização permanecem reconstruíveis a partir desse valor.

O resultado permite considerar **validado o fluxo manual mínimo para criar uma definição canônica de métrica e persistir um valor quantitativo exato ligado à sua proveniência**. Ele não demonstra ainda continuidade de série, comparabilidade entre períodos, atualização de valores existentes, tratamento de conflito quantitativo ou cálculo de indicadores derivados.

## Resultado produzido

| Campo | Resultado |
| --- | --- |
| Carga | `0003` |
| Acontecimento | Publicação dos emplacamentos mensais de veículos leves BEV pela ABVE Data |
| Data da publicação | 11 de agosto de 2026 |
| Tipo e fase | `market_data` / `publication` |
| Verificação | `confirmed` |
| Situação | `accepted` |
| Métrica | `monthly-light-bev-registrations-brazil` |
| Valor | `25782` |
| Unidade | `vehicle_registration` |
| Período medido | 1º a 31 de julho de 2026 |
| Geografia | Brasil |
| Situação do valor | `validated` |
| Fonte e organização | ABVE |

A [seleção](selecao-carga-canonica-0003.md), o [pacote aceito](revisao-carga-canonica-0003.md), a [carga executada](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.sql), a [consulta reutilizável](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.verify.sql) e o [resultado aceito](resultado-carga-canonica-0003.md) preservam a trilha completa do ciclo.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Revisão humana da afirmação, do valor, da unidade, do período e da geografia | Denis Toledo registrou `ACCEPTED` na seleção, no pacote e no resultado | Atendido |
| Definição e normalização aceitas antes da persistência | O PR #56 continha a definição completa e foi incorporado antes da execução | Atendido |
| Arquivo aprovado na `main` antes da execução | Os arquivos executados no commit `6603b1f` eram idênticos aos aceitos | Atendido |
| Um acontecimento `market_data` ligado à evidência | O acontecimento 91 possui fase `publication`, estado `accepted` e vínculo `supports` | Atendido |
| Um valor ligado à observação e à definição | O valor 13 liga a observação 76 à definição 8 | Atendido |
| Cadeia completa reconstruída | A consulta alcançou fonte, publicação, observação, evidência, acontecimento, organização, definição e valor | Atendido |
| Preservação das cargas anteriores | A assinatura conjunta de `0001` e `0002` permaneceu `7cc4c60de77d59f68fa621f522f776e4` | Atendido |
| Ausência de duplicata, piloto, derivação ou mudança estrutural | Todos os registros apareceram uma vez, não houve identificadores de piloto e permaneceram 15 migrations | Atendido |
| Mesma consulta antes e depois | O arquivo reutilizável retornou `absent` antes e `complete` depois do `COMMIT` | Atendido |
| Execução documentada e aceita | O resultado recebeu `ACCEPTED` e foi incorporado pelo PR #57 | Atendido |

Os dez critérios da [decisão do terceiro ciclo](decisao-terceiro-ciclo-fluxo-inteligencia.md) foram atendidos.

## O que foi validado

O terceiro ciclo acrescenta às capacidades dos ciclos anteriores:

1. criar uma definição de métrica com chave, semântica, domínio, tipo, unidade, agregação e granularidades explícitas;
2. preservar separadamente o termo usado pela fonte e a afirmação normalizada;
3. transformar a grafia brasileira `25.782` no inteiro `25782` sem cálculo ou perda de significado;
4. representar um mês civil por `period_start` e `period_end`, mantendo `observation_date = NULL` quando nenhum dia de medição é afirmado;
5. distinguir a data da publicação no acontecimento do período medido no valor;
6. ligar o mesmo núcleo observado a uma cadeia factual e a uma cadeia métrica;
7. usar `established`, `confirmed` e `validated` para decisões diferentes de proveniência, suporte do acontecimento e revisão do valor;
8. proteger duas cargas anteriores por uma assinatura conjunta durante uma nova persistência;
9. verificar definição, valor e vínculos com a mesma consulta antes e depois da carga;
10. manter fora do banco todos os números e interpretações que não pertencem ao recorte aceito.

Essas regras complementam o fluxo manual já validado. Elas não autorizam importar automaticamente outros números presentes na mesma publicação.

## Significado dos estados usados

O ciclo confirmou que três estados semelhantes na aparência respondem a perguntas diferentes:

| Estado | Pergunta respondida | O que não significa |
| --- | --- | --- |
| Evidência `established` | A origem exata da observação é conhecida? | Que uma segunda instituição confirmou o número |
| Acontecimento `confirmed` | Uma fonte primária apropriada sustenta o acontecimento registrado? | Que o dado foi auditado ou corroborado independentemente |
| Valor `validated` | Valor, unidade, período, geografia e proveniência foram revisados? | Que a base subjacente da fonte foi auditada |

Essa separação deve permanecer em futuros valores. Elevar um desses estados não eleva automaticamente os demais.

## Aprendizados metodológicos

### Um valor precisa de um recorte completo

`25782` isoladamente não é um dado canônico suficiente. O significado depende de:

- emplacamentos, e não estoque de veículos;
- veículos leves BEV, e não todos os eletrificados;
- Brasil, e não uma seleção de estados ou municípios;
- julho de 2026, e não o acumulado de janeiro a julho;
- contagem publicada pela ABVE Data, e não cálculo do ChargeBR.

A definição e o valor estruturam essas dimensões, enquanto a observação e a evidência preservam a origem da interpretação.

### `count` não autoriza soma automática

`aggregation_type = 'count'` descreve a natureza de cada medição mensal. Ele não prova que dois períodos podem ser somados, que as categorias permaneceram estáveis ou que não há duplicidade entre recortes.

Qualquer agregação entre valores futuros exigirá primeiro comparabilidade de cobertura, método, unidade e período. O terceiro ciclo não realizou nem aprovou esse cálculo.

### Fonte e organização continuam distintas

ABVE aparece como fonte e como organização com o mesmo `slug`, mas em tabelas e papéis diferentes. A fonte identifica o canal institucional da publicação; a organização identifica o sujeito que publicou o resultado por meio da ABVE Data.

A reutilização futura de qualquer um desses registros exige correspondência integral. A semelhança do nome não basta para atualizar ou substituir o cadastro existente.

## Simplificações que funcionaram

A consulta reutilizável passou a reconstruir também a cadeia entre observação, definição e valor, além da cadeia factual já exercitada nos ciclos anteriores. Ela retornou uma linha única com estado agregado, contagens, assinatura das cargas anteriores e ausência de registros de piloto.

O pacote de revisão tornou explícita a diferença entre valor mensal e acumulado antes da persistência. Essa formulação respondeu à dúvida concreta da revisão e foi mantida no SQL, na documentação e na verificação.

Os hashes continuaram garantindo que a execução utilizasse exatamente os arquivos aceitos e incorporados à `main`. A combinação de consulta reutilizável, perguntas separadas e identidade por hash deve permanecer nos próximos ciclos.

## Aprendizado operacional

As duas execuções descartáveis confirmaram a idempotência, mas consumiram valores das sequências de identidade. Por isso os identificadores internos da carga `0003` apresentam saltos sem que existam linhas residuais.

O comportamento já observado no segundo ciclo se repetiu e confirma que:

- identificadores internos não são identificadores de negócio;
- lacunas nas sequências não indicam dados apagados ou duplicados;
- identificadores estáveis e restrições únicas devem orientar a reconstrução;
- sequências não devem ser reiniciadas para produzir uma aparência consecutiva.

## Limites do que foi provado

Os três ciclos concluídos ainda não validaram:

- reutilização de uma definição aprovada para um segundo período;
- continuidade de uma série com dois ou mais valores canônicos;
- comparabilidade de método, cobertura e categoria ao longo do tempo;
- revisão, correção, rejeição ou substituição de um valor já aceito;
- conflito quantitativo entre fontes ou versões de uma publicação;
- transição de valor `provisional` para `validated` ou `superseded`;
- cálculo de crescimento, participação, acumulado, média, razão ou tendência;
- regra de tolerância entre valores;
- cadeia regulatória canônica no banco persistente;
- vários acontecimentos ou métricas em uma mesma carga;
- coleta recorrente, monitoramento, escala ou automação;
- geração de história, análise, alerta ou produto público.

Um único ponto quantitativo demonstra a representação do valor, mas não constitui uma série temporal.

## Próxima capacidade proposta

O quarto ciclo deverá testar **a inclusão de um segundo período na métrica canônica já aprovada**, sem modificar o valor de julho de 2026.

O objetivo será demonstrar que o ChargeBR consegue estender uma série de forma controlada, reutilizando uma definição existente somente quando sua semântica for integralmente compatível com o novo valor.

O ciclo deverá preferir uma publicação posterior da mesma série, sem fixar antecipadamente mês, valor ou URL. A seleção terá de confirmar novamente que objeto, tecnologia, unidade, período, geografia e método são compatíveis com `monthly-light-bev-registrations-brazil`.

O quarto ciclo deverá:

- continuar manual e limitar-se a uma nova publicação, um novo acontecimento e um novo valor;
- usar um período diferente de julho de 2026;
- reutilizar a definição `monthly-light-bev-registrations-brazil` somente após correspondência integral de semântica, unidade e granularidades;
- reutilizar fonte e organização existentes somente se o publicador e seus papéis forem os mesmos;
- criar nova observação e nova evidência para preservar a proveniência do novo valor;
- manter o valor de julho e todos os registros da carga `0003` integralmente inalterados;
- impedir que a chave única do valor seja usada como substituição silenciosa de outro período;
- verificar os dois valores separadamente e demonstrar que ambos apontam para a mesma definição aprovada;
- não calcular crescimento, acumulado ou tendência entre os dois meses;
- proteger integralmente as cargas `0001`, `0002` e `0003` antes e depois da validação e da persistência;
- permanecer dentro do schema atual; qualquer incompatibilidade ou lacuna interrompe o ciclo para decisão própria.

A seleção e os critérios detalhados da carga `0004` deverão ser objeto de uma nova decisão. Esta conclusão não escolhe antecipadamente uma publicação, um mês ou um número.

## Interrupções necessárias no próximo ciclo

O quarto ciclo deverá parar antes de preparar a carga quando:

- a publicação revisar ou substituir o valor de julho de 2026;
- o novo número usar categoria, unidade, cobertura ou geografia incompatível com a definição existente;
- o período for acumulado, móvel ou ambíguo em vez de um mês civil;
- a fonte apresentar números conflitantes para o mesmo recorte;
- a comparação entre meses depender de cálculo ou hipótese não incluída no recorte;
- a fonte ou organização existente tiver conteúdo divergente;
- o schema atual não representar uma distinção necessária.

Uma interrupção não autoriza alterar a definição aprovada, atualizar julho, introduzir tolerância ou esconder a diferença em notas livres.

## O que permanece fora da próxima etapa

- correção, substituição ou supersessão do valor de julho de 2026;
- cálculo de crescimento mensal ou anual;
- soma ou acumulado entre períodos;
- participação de mercado, média, razão, cobertura ou tendência;
- conflito quantitativo e reconciliação entre fontes;
- margem fixa de tolerância, inclusive a proposta `P03-MET-01`;
- mais de um novo período, acontecimento ou valor;
- nova definição de métrica;
- cadeia regulatória canônica;
- automação de descoberta, captura, normalização ou verificação;
- coleta em lote ou recorrente;
- interface pública, newsletter, alertas ou produto pago;
- importação histórica ou migração do Notion;
- alteração de schema sem lacuna documentada e decisão própria.

## Perguntas para revisão

1. Os dez critérios de sucesso do terceiro ciclo foram atendidos?
2. A conclusão limita corretamente o que foi validado à criação manual de uma definição e de um valor quantitativo exato com proveniência?
3. A separação entre `established`, `confirmed` e `validated` preserva corretamente o significado de cada estado?
4. Está claro que `count` descreve a medição mensal, mas não autoriza somar períodos automaticamente?
5. A consulta métrica reutilizável, a distinção entre mensal e acumulado e os hashes são controles que devem permanecer?
6. Um segundo período ligado à mesma definição é a próxima capacidade adequada para testar continuidade e reutilização canônica?
7. As correspondências integrais e as interrupções impedem reutilizar a métrica, a fonte ou a organização quando houver incompatibilidade?
8. Está correto manter correções, conflitos, cálculos derivados, tolerância, escala, automação e produto público fora do quarto ciclo?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
