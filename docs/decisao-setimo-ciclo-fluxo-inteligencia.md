# Decisão: sétimo ciclo do fluxo de inteligência

## Estado

`PROPOSTA PARA REVISÃO`

Este documento propõe o objetivo e os controles do sétimo ciclo. Ele não seleciona uma publicação, não escolhe valores, não cria SQL, não altera o schema e não modifica dados no Supabase.

## Contexto

O [sexto ciclo](conclusao-sexto-ciclo-fluxo-inteligencia.md) validou uma correção material. A ABVE declarou que dois números haviam sido atribuídos às geografias erradas; por isso, o valor estadual incorreto passou de `provisional` para `rejected` e o valor estadual corrigido passou de `provisional` para `validated`.

Esse caso demonstrou como rejeitar uma afirmação que a própria fonte reconheceu como inválida para o escopo. Ainda não demonstrou o que fazer quando o número anterior era defensável sob um método antigo e deixa de ser corrente porque a fonte altera classificação, cálculo ou regra de apuração.

O sétimo ciclo introduzirá somente essa dificuldade: **representar manualmente uma revisão metodológica quantitativa e decidir, a partir do caso, quando o valor anterior deve ser `superseded` em vez de `rejected`**.

## Por que essa capacidade importa ao ChargeBR

O ChargeBR acompanhará séries de mercado, infraestrutura, energia e regulação que podem mudar de metodologia. Sem distinguir erro de revisão metodológica, o sistema poderá:

- chamar de falso um valor que era válido quando foi publicado;
- comparar números calculados com classificações incompatíveis;
- produzir crescimento artificial ao ligar duas versões diferentes de uma série;
- esconder quando uma organização recalculou um período anterior;
- apresentar como atual um valor que a própria mantenedora substituiu metodologicamente.

O objetivo não é arquivar toda a história metodológica de uma organização. Uma mudança só pertence ao ChargeBR quando for necessária para interpretar uma métrica material ao mercado brasileiro acompanhado e para explicar a relação entre valores canônicos.

## Decisão proposta

O sétimo ciclo pesquisará um único caso em que a autoridade responsável por uma série quantitativa:

1. tenha publicado um valor para uma métrica relevante ao ChargeBR;
2. posteriormente declare mudança de método, classificação ou regra de cálculo;
3. publique um novo valor para o mesmo período e escopo conceitual, ou forneça informação suficiente para ligar o valor revisado ao anterior;
4. não declare que o valor anterior era um erro material;
5. identifique qual versão metodológica passa a orientar a série corrente;
6. preserve evidência suficiente para reconstruir as duas versões e a razão da mudança.

A seleção deverá limitar-se a:

- uma métrica conceitual;
- um período de referência;
- uma unidade numérica;
- uma geografia;
- um valor sob o método anterior;
- um valor sob o método revisado;
- uma revisão metodológica autoritativa.

O ciclo não presumirá antecipadamente que `superseded` é sempre o estado correto. Primeiro, o caso deverá demonstrar que a fonte substituiu a versão anterior como representação corrente. Se a fonte mantiver as duas séries em paralelo, pode ser necessário conservar ambos os valores como válidos sob definições diferentes.

## Pergunta central

O caso selecionado deverá permitir responder:

> O valor anterior deixou de ser corrente porque estava errado ou porque a fonte passou a medir a mesma questão conceitual com outro método?

| Situação documental | Interpretação candidata |
| --- | --- |
| A fonte declara erro no valor anterior | `material_correction`; candidato a `rejected`, fora da dificuldade deste ciclo |
| A fonte altera o método e substitui a série anterior | `methodology_revision`; candidato a `superseded` |
| A fonte mantém séries antiga e nova paralelamente | Podem existir dois valores válidos sob definições metodológicas distintas |
| A fonte incorpora registros atrasados sem mudar o método | `coverage_update`, fora da dificuldade deste ciclo |
| A fonte publica outro período | Nova medição, não resolução |
| A publicação posterior apenas apresenta outro número | Conflito não resolvido; seleção inelegível |

O estado será consequência da evidência e da modelagem, não uma condição imposta para aprovar o caso.

## Significado pretendido de `superseded`

Para este ciclo, `superseded` será candidato quando todos os pontos seguintes estiverem sustentados:

- o valor anterior foi publicado legitimamente segundo um método identificável;
- a fonte não o declara incorreto dentro daquele método;
- uma revisão metodológica posterior produz ou estabelece outro valor para o mesmo período e escopo conceitual;
- a fonte passa a usar a metodologia revisada como referência corrente;
- o valor anterior permanece necessário para reconstruir a série histórica publicada;
- existe relação explícita ou documentalmente inequívoca entre as duas versões.

`superseded` não significará “menos confiável”, “mais antigo” ou “numericamente diferente”. Também não será usado apenas porque uma publicação recente prefere outro método.

## Comparabilidade exigida

Uma revisão metodológica pode alterar a definição operacional sem eliminar a identidade conceitual da métrica. Por isso, a seleção deverá comparar separadamente:

| Dimensão | Exigência |
| --- | --- |
| Pergunta conceitual | Deve permanecer materialmente a mesma |
| Período | Deve ser o mesmo período de referência |
| Unidade | Deve permitir comparação direta, sem conversão inventada |
| Geografia | Deve ser a mesma |
| Cobertura populacional | Qualquer mudança deve ser descrita como parte do método, não ocultada |
| Classificação | A versão anterior e a revisada devem ser identificáveis |
| Agregação | A regra anterior e a revisada devem ser conhecidas quando afetarem o total |
| Autoridade | A revisão deve vir de quem mantém ou controla a série |

Se a mudança transformar a pergunta conceitual em outra métrica, não haverá um valor anterior substituído. Haverá duas métricas diferentes, e o caso não atenderá ao objetivo desta etapa.

## Evidência autoritativa mínima

A seleção precisará de fonte primária que demonstre a revisão, como:

- nota metodológica oficial;
- errata que declare revisão de método, e não erro material;
- publicação da mantenedora com tabela de valores antigos e recalculados;
- documento de versão da série;
- comunicado que identifique a classificação anterior, a nova e seu efeito quantitativo.

A fonte deverá permitir determinar:

1. quem mantém a série;
2. qual método ou classificação mudou;
3. quando a revisão foi publicada;
4. a partir de quando ela é aplicada;
5. se alcança períodos anteriores;
6. qual valor representa cada versão no recorte selecionado;
7. se a série anterior foi substituída, mantida em paralelo ou declarada incorreta.

Uma análise secundária poderá ajudar na descoberta, mas não resolverá a classificação canônica nem substituirá a documentação da autoridade da série.

## Quatro tempos que não devem ser confundidos

O caso poderá conter até quatro datas diferentes:

| Tempo | Pergunta |
| --- | --- |
| Período medido | A qual intervalo o valor se refere? |
| Publicação original | Quando o valor anterior foi publicado? |
| Publicação da revisão | Quando a mudança metodológica foi anunciada ou aplicada ao dado? |
| Revisão do ChargeBR | Quando a pessoa revisora aceitou a representação canônica? |

Se a fonte também declarar uma data de vigência metodológica diferente da publicação, ela deverá permanecer separada. Nenhuma dessas datas poderá ser inferida a partir das demais.

## Relação com o modelo atual

O schema já possui elementos potencialmente reutilizáveis:

- `content_items` para publicações ou versões documentais;
- `content_item_relations.relationship_type = 'revises'`;
- `metric_value_resolutions.resolution_type = 'methodology_revision'`;
- `metric_value_status_transitions` para registrar `provisional` ou `validated` até `superseded`;
- `replacement_metric_value_id` para apontar o valor que passa a representar a série corrente;
- `metric_definitions.methodology_notes` para descrever limites metodológicos.

Entretanto, o modelo ainda não demonstrou como identificar estruturalmente:

- versões de uma metodologia;
- qual metodologia produziu cada valor;
- se duas definições representam versões da mesma métrica conceitual;
- o período de validade de uma metodologia;
- séries paralelas mantidas pela fonte;
- diferença entre uma mudança prospectiva e um recálculo retroativo.

A seleção do caso deverá revelar se essas distinções podem ser representadas com o schema atual sem depender apenas de texto livre. Se não puderem, o ciclo será interrompido para uma decisão de modelagem e eventual migration em etapas próprias.

Este documento não aprova tabela de metodologias, coluna adicional, relação entre definições ou qualquer outra estrutura.

## Preservação histórica obrigatória

Uma revisão metodológica aceita deverá manter consultáveis:

1. a publicação do valor anterior;
2. o valor exato conforme originalmente publicado;
3. a metodologia ou classificação anterior;
4. o documento que introduziu a revisão;
5. o valor recalculado ou reclassificado;
6. a metodologia revisada;
7. a relação entre as versões documentais;
8. a decisão sobre o estado de cada valor;
9. a pessoa e a data da revisão do ChargeBR;
10. as limitações que impeçam comparação direta com outros períodos.

Nenhum valor será reescrito para parecer calculado desde o início pela metodologia nova. O histórico deverá explicar tanto o que a fonte publicou originalmente quanto o que ela passou a reconhecer depois.

## Fluxo proposto

### 1. Seleção do caso

Pesquisar fontes primárias diretamente relacionadas à mobilidade elétrica brasileira e preparar `docs/selecao-revisao-metodologica-0007.md` com:

- a métrica e sua relevância ao ChargeBR;
- os valores anterior e revisado;
- o período, unidade e geografia;
- as duas versões metodológicas;
- a autoridade e os documentos da revisão;
- a cronologia completa;
- a avaliação entre `superseded`, `rejected`, séries paralelas e caso inelegível;
- tudo que foi excluído do recorte;
- as possíveis lacunas de modelagem.

Nenhum SQL será criado nessa etapa.

### 2. Decisão de modelagem

Depois do aceite e do merge da seleção, comparar o caso com o schema existente. A decisão deverá mostrar campo a campo:

- quais estruturas podem ser reutilizadas;
- onde a versão metodológica fica identificada;
- como cada valor se liga ao método correspondente;
- como a relação entre as séries é reconstruída;
- se `superseded` é realmente defensável;
- quais limitações permanecem.

Se houver lacuna, a decisão proporá a menor mudança estrutural necessária. Se não houver, explicará por que o texto livre existente não é a única fonte da distinção crítica.

### 3. Mudança estrutural, se necessária

Qualquer migration deverá ter PR próprio, validação descartável, RLS e privilégios coerentes, proteção de todos os dados existentes, aplicação somente depois de merge e resultado documentado separadamente.

### 4. Preparação da carga `0007`

Somente com o modelo necessário disponível, preparar carga idempotente, consulta reutilizável e pacote de revisão. A carga deverá interromper diante de estado inesperado e preservar integralmente as cargas anteriores.

### 5. Validação e revisão

Executar duas vezes em transação descartável, verificar ausência de duplicações e aplicar `ROLLBACK`. A consulta deverá reconstruir as versões metodológicas, os valores, a resolução e as transições propostas.

### 6. Persistência e resultado

Depois de `ACCEPTED` e merge do pacote, executar exatamente o SQL incorporado à `main` uma vez entre `BEGIN` e `COMMIT`. Em seguida, executar a consulta aceita e documentar o resultado em PR separado.

## Interrupções obrigatórias

O sétimo ciclo deverá parar quando:

- não houver valor quantitativo anterior e revisado para o mesmo recorte;
- a mudança afetar apenas períodos futuros e não revisar o valor selecionado;
- a fonte declarar erro material, caso já validado no sexto ciclo;
- a diferença decorrer somente de registros atrasados ou cobertura ampliada sem método alterado;
- a publicação nova medir outro período, unidade, geografia ou pergunta conceitual;
- a metodologia anterior ou a revisada não puder ser identificada;
- não estiver claro se a série antiga foi substituída ou mantida em paralelo;
- a autoridade da revisão sobre a série não estiver demonstrada;
- a decisão depender de recência, preferência, aritmética, tolerância ou fonte secundária;
- o caso exigir mais de uma métrica ou mais de uma revisão independente;
- a representação crítica depender somente de `notes`;
- uma mudança de schema for necessária e ainda não tiver decisão, revisão, aplicação e resultado próprios;
- qualquer carga anterior deixar de permanecer integralmente protegida.

Uma interrupção não autoriza converter a revisão em correção material nem marcar o valor anterior como `superseded` apenas para concluir o ciclo.

## Critérios de sucesso

O sétimo ciclo será concluído quando:

1. uma revisão metodológica quantitativa relevante ao ChargeBR for confirmada por fonte primária e revisão humana;
2. os valores anterior e revisado se referirem ao mesmo período, unidade, geografia e pergunta conceitual;
3. as versões metodológicas forem identificáveis e ligadas aos respectivos valores;
4. a autoridade e a cronologia da revisão forem reconstruíveis;
5. estiver documentado se a revisão é retroativa, prospectiva ou ambas;
6. `superseded`, `rejected`, `validated` ou séries paralelas forem distinguidos pela evidência, não por preferência;
7. o valor anterior permanecer consultável com seu significado histórico;
8. o valor corrente puder ser identificado sem apagar a versão anterior;
9. qualquer lacuna estrutural for resolvida antes da carga e todas as cargas anteriores permanecerem protegidas;
10. a execução e seu resultado forem documentados e aceitos.

## Fora do escopo

- correção material igual à já validada no sexto ciclo;
- simples atualização de cobertura;
- nova medição de período posterior;
- previsão comparada com resultado realizado;
- escolha do número mais recente ou mais plausível;
- resolução automática ou em lote;
- regra geral para todas as metodologias futuras;
- mais de uma métrica ou revisão;
- solução antecipada para o conflito da carga `0005`;
- retomada forçada da carga `0004`;
- auditoria da base primária da organização;
- cálculo de crescimento, tendência ou indicador derivado;
- coleta recorrente, captura automática de versões ou classificação automática;
- interface pública, alerta, newsletter ou produto pago;
- importação histórica ou migração do Notion.

## Próxima etapa após esta decisão

Depois do aceite e do merge, pesquisar um único caso quantitativo com revisão metodológica documentada e preparar `docs/selecao-revisao-metodologica-0007.md`.

Uma mudança prospectiva poderá ser avaliada durante a pesquisa, mas só será elegível se também existir um valor revisado para o mesmo período escolhido. Se o caso apenas iniciar uma nova série sem recalcular ou substituir o valor anterior, ele deverá ser descartado para este ciclo.

Nenhuma migration, carga canônica ou alteração no Supabase será realizada durante a seleção.

## Perguntas para revisão

1. Está correto limitar o sétimo ciclo a uma única revisão metodológica quantitativa relevante ao ChargeBR?
2. Está correto tratar `superseded` como candidato somente quando o valor anterior era válido sob o método antigo e foi substituído como representação corrente?
3. A decisão distingue adequadamente revisão metodológica, correção material, atualização de cobertura, nova medição e séries paralelas?
4. Está correto não exigir antecipadamente `superseded`, permitindo que o caso revele outro estado ou seja rejeitado?
5. As exigências de comparabilidade preservam a mesma pergunta conceitual, período, unidade e geografia sem ocultar a mudança de método?
6. Está correto exigir fonte primária da mantenedora da série e não aceitar publicação secundária como autoridade da revisão?
7. A separação entre período medido, publicação original, publicação ou vigência da revisão e aceite do ChargeBR está suficientemente clara?
8. Está correto avaliar a modelagem somente depois da seleção, sem presumir que `methodology_notes` seja suficiente ou que uma nova tabela seja necessária?
9. As interrupções impedem classificar como revisão metodológica uma diferença causada por erro, cobertura, novo período, preferência ou simples recência?
10. Os critérios de sucesso protegem os dois valores, as duas metodologias, o estado corrente e todas as cargas anteriores?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | — |
