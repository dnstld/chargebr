# Decisão: terceiro ciclo do fluxo de inteligência

## Estado

`EM REVISÃO`

Este documento define o objetivo e os controles do terceiro ciclo. Ele não seleciona fonte, publicação, acontecimento ou número, não cria a carga `0003`, não altera o schema e não modifica dados no Supabase.

## Contexto

O [primeiro ciclo](conclusao-primeiro-ciclo-fluxo-inteligencia.md) validou um acontecimento simples sustentado por uma fonte primária. O [segundo ciclo](conclusao-segundo-ciclo-fluxo-inteligencia.md) validou `corroborated` para um núcleo factual comum sustentado por duas linhagens independentes e consolidou uma consulta reutilizável para proteger cargas anteriores.

As cargas `0001` e `0002` exercitaram fonte, publicação, observação, evidência, acontecimento, organização e seus vínculos. Elas não persistiram definições ou valores de métricas. Essa é a próxima dimensão da fundação que precisa ser comprovada em uso canônico, sem acrescentar simultaneamente conflito quantitativo, cálculo derivado ou automação.

## Decisão proposta

O terceiro ciclo produzirá **um único acontecimento `market_data` ligado a uma definição aprovada e a um valor canônico de métrica**.

O objetivo é demonstrar que um número explicitamente publicado pode ser transformado em dado consultável sem perder:

- a publicação e a observação de origem;
- o termo usado pela fonte;
- o valor numérico;
- a unidade;
- o período de referência;
- a geografia;
- o estado do valor;
- o nível de verificação do acontecimento.

O ciclo continuará manual. A dificuldade nova será a normalização quantitativa, não a independência entre fontes, a reconciliação de números ou o aumento de volume.

## Separações obrigatórias

### Afirmação da fonte

`observations.source_claim` preserva o número e seu significado conforme apresentados na publicação. `observations.source_term` registra a expressão usada para denominar a unidade ou o objeto contado quando ela for relevante para compreender a normalização.

A observação não deve substituir o texto da fonte por uma categoria mais ampla, combinar números distintos ou acrescentar período e geografia que não possam ser sustentados pela publicação.

### Normalização do ChargeBR

`observations.normalized_claim` e `metric_values` representam a interpretação estruturada aceita pelo ChargeBR. A normalização só é defensável quando valor, unidade, período e geografia podem ser mapeados sem alteração material de sentido.

São permitidas operações sem perda, como interpretar separadores numéricos de acordo com o idioma da publicação e armazenar `25.429` como `25429` quando o texto significa exatamente vinte e cinco mil quatrocentos e vinte e nove. Não são permitidos:

- estimar um valor exato a partir de expressão arredondada, como “25,4 mil”;
- calcular percentuais, variações, médias, totais ou proporções;
- converter unidades quando a equivalência depender de hipótese não documentada;
- escolher silenciosamente entre termos ou números incompatíveis;
- preencher início ou fim de período por convenção não sustentada.

Se a normalização não for inequívoca, o candidato não atende ao objetivo deste ciclo.

### Verificação do acontecimento

Uma fonte primária apropriada poderá sustentar `events.verification_level = 'confirmed'`. Isso confirma que a publicação oficial sustenta o acontecimento; não significa corroboração independente.

Uma fonte adicional não é requisito. Se for usada para elevar o nível a `corroborated`, sua independência e seu suporte ao mesmo núcleo e ao mesmo valor precisarão satisfazer novamente os controles do segundo ciclo. A mera repetição do número não aumenta o nível de verificação.

### Estado do valor

`metric_values.value_status` descreve o estado do valor normalizado, enquanto `events.verification_level` descreve o suporte ao acontecimento. Os campos não são equivalentes.

Neste ciclo:

- `validated` significa que a revisão confirmou a transcrição, o mapeamento para a métrica, a unidade, o período, a geografia e a proveniência;
- `validated` não afirma que houve auditoria independente da metodologia da fonte nem que o valor nunca será corrigido;
- `provisional` só será usado quando a própria publicação apresentar o número como preliminar, provisório, sujeito a revisão ou equivalente;
- estimativas, projeções e intervalos ficam fora do ciclo, mesmo que a fonte os publique oficialmente;
- `superseded` e `rejected` não serão usados na carga inicial.

## Requisitos do candidato

O acontecimento selecionado deverá:

- não ter sido usado nos pilotos nem nas cargas `0001` e `0002`;
- ter sido publicado, preferencialmente, nos 30 dias anteriores à seleção;
- possuir relação material e explícita com a mobilidade elétrica no Brasil;
- representar a publicação de um único valor quantitativo já realizado ou medido;
- possuir uma fonte primária apropriada, acessível e identificável;
- permitir identificar diretamente o valor, a unidade, o período e a geografia;
- permitir uma normalização exata, sem arredondamento, derivação ou conversão discutível;
- não apresentar conflito conhecido com outro valor para a mesma métrica, período e geografia;
- caber no schema aprovado sem contornar relação estrutural indispensável por texto livre.

Outros números podem permanecer na publicação original, mas o documento de seleção deverá explicar por que somente um pertence ao recorte. O recorte não pode omitir um segundo valor quando isso tornar o primeiro enganoso ou incompleto.

## Definição da métrica

O ciclo criará exatamente uma linha em `metric_definitions`. A seleção deverá propor e justificar:

- `metric_key` estável e específico;
- nome e descrição que delimitem o que é medido;
- domínio;
- tipo do valor;
- unidade canônica;
- regra de agregação;
- granularidade temporal;
- granularidade geográfica;
- notas metodológicas necessárias.

A definição receberá `status = 'approved'` somente depois da revisão humana e do merge do pacote da carga. A aprovação vale para a semântica delimitada no documento; ela não autoriza importar outros valores históricos nem combinar séries que apenas pareçam semelhantes.

Se já existir uma definição semanticamente equivalente no banco, ela deverá ser reutilizada somente após correspondência integral. Uma definição homônima, mais ampla, mais estreita ou divergente interrompe a preparação para decisão própria.

## Representação mínima esperada

A carga `0003` deverá conter somente os registros e vínculos necessários:

1. uma fonte primária;
2. uma publicação;
3. uma observação do tipo `quantity`;
4. uma evidência com origem identificada;
5. um acontecimento `market_data` com fase `publication`;
6. uma definição aprovada de métrica;
7. um valor ligado à observação e à definição;
8. uma organização central e seu vínculo, quando aplicável ao acontecimento;
9. um vínculo `supports` entre a evidência e o acontecimento.

A data do acontecimento será a data da publicação. O período medido será registrado em `metric_values.period_start` e `period_end`; essas datas não devem ser confundidas.

O acontecimento deverá ficar `accepted` e, com uma única fonte primária apropriada, `confirmed`. A evidência deverá preservar sua linhagem até a publicação de origem.

## Fluxo aprovado

### 1. Seleção

Pesquisar poucos candidatos recentes e escolher um único número com semântica, período, geografia e origem claros. O documento de seleção deverá comparar os candidatos e propor a definição completa da métrica.

Nenhum SQL de carga será preparado durante a seleção.

### 2. Avaliação semântica

Antes da estruturação, responder separadamente:

- o que a fonte afirma;
- qual objeto ou fenômeno o número mede;
- qual é a unidade;
- a qual período o valor se refere;
- qual é a geografia;
- se o valor é definitivo ou provisório segundo a fonte;
- quais outros números da publicação ficam fora e por quê;
- se existe conflito conhecido que impeça o recorte simples.

### 3. Preparação reproduzível

Depois do merge da seleção, criar:

- `data/canonical/0003_<identificador>.sql`;
- `data/canonical/0003_<identificador>.verify.sql`;
- `docs/revisao-carga-canonica-0003.md`.

A carga deverá ser idempotente e interromper diante de registros homônimos divergentes. Ela não será migration nem seed.

### 4. Proteção das cargas anteriores

A consulta reutilizável deverá produzir assinaturas integrais das cargas `0001` e `0002` e confirmar que ambas permanecem inalteradas antes e depois da validação e da persistência.

Uma fonte ou organização existente só poderá ser reutilizada mediante correspondência exata. A carga `0003` não poderá recriar nem modificar silenciosamente registros canônicos anteriores.

### 5. Validação descartável

Executar a carga duas vezes dentro da mesma transação e revertê-la. A consulta deverá:

- contar cada registro e vínculo da carga `0003`;
- reconstruir a cadeia entre fonte, publicação, observação, evidência e acontecimento;
- reconstruir o caminho entre observação, valor e definição da métrica;
- confirmar valor, unidade, período, geografia e estados aprovados;
- detectar identificadores duplicados;
- verificar as assinaturas das cargas `0001` e `0002`;
- confirmar, depois do `rollback`, que nenhum registro da carga `0003` permaneceu.

Os saltos esperados em sequências de identidade deverão ser tratados como detalhe operacional, não como falha ou motivo para reiniciar sequências.

### 6. Revisão humana

O pacote separará as perguntas em três grupos:

- **factuais:** o número, a unidade, o período, a geografia e o estado conforme a fonte;
- **metodológicas:** a definição da métrica, a normalização e a força da evidência;
- **operacionais:** a minimalidade, a idempotência, as contagens e a preservação das cargas anteriores.

O PR só poderá ser incorporado depois de `ACCEPTED` expresso.

### 7. Persistência e resultado

Depois do aceite e do merge, executar no Supabase exatamente a carga aprovada entre `BEGIN` e `COMMIT`. A consulta reutilizada deverá demonstrar:

- um acontecimento `accepted` com nível de verificação adequado;
- uma definição de métrica `approved`;
- um único valor com número, período, geografia e estado aprovados;
- proveniência completa até a publicação e a fonte;
- ausência de duplicatas;
- invariância das cargas `0001` e `0002`;
- nenhuma alteração de schema ou dado de teste.

O resultado será documentado em `docs/resultado-carga-canonica-0003.md`, em PR separado e sujeito a nova revisão.

## Interrupções obrigatórias

O ciclo para antes da persistência quando:

- valor, unidade, período ou geografia permanecerem ambíguos;
- a normalização exigir arredondamento, estimativa, cálculo ou conversão discutível;
- houver conflito conhecido para a mesma métrica, período e geografia;
- mais de um valor for indispensável para representar o recorte sem distorção;
- a fonte não for primária ou não sustentar diretamente o número;
- a definição da métrica não puder ser delimitada com precisão;
- um registro canônico existente tiver semântica divergente;
- o schema não representar uma distinção necessária;
- a carga alterar ou duplicar registros das cargas anteriores.

Uma interrupção não autoriza ocultar o conflito, reduzir a precisão da definição, usar texto livre no lugar de relação estrutural ou adotar uma tolerância apenas para concluir o ciclo.

## Critérios de sucesso

O terceiro ciclo será concluído quando:

1. uma pessoa revisora confirmar a afirmação da fonte, o valor, a unidade, o período e a geografia;
2. a definição da métrica e a normalização forem aceitas antes da persistência;
3. a carga aprovada estiver na `main` antes da execução;
4. um único acontecimento `market_data` estiver ligado a uma evidência apropriada;
5. um único valor estiver ligado à sua observação e à definição aprovada;
6. a cadeia completa puder ser reconstruída até a fonte e a publicação;
7. as cargas `0001` e `0002` permanecerem inalteradas;
8. não houver duplicatas, dados de teste, cálculo derivado ou alteração de schema;
9. a mesma consulta funcionar antes e depois da persistência;
10. a execução e suas contagens forem documentadas e aceitas.

## Fora do escopo

- mais de um acontecimento ou mais de uma métrica nova;
- estimativa, projeção, intervalo ou valor arredondado;
- cálculo de crescimento, participação, média, soma, razão ou cobertura;
- conversão de unidade que dependa de hipótese;
- conflito quantitativo ou reconciliação entre publicações;
- regra de tolerância, inclusive a proposta `P03-MET-01`;
- atualização, correção ou substituição de carga existente;
- automação de descoberta, captura, normalização ou verificação;
- coleta em lote ou recorrente;
- história, análise, alerta, interface pública ou produto pago;
- importação histórica ou migração do Notion;
- alteração de schema sem lacuna e decisão próprias.

## Próxima etapa após esta decisão

Depois do merge desta decisão, pesquisar poucos candidatos e preparar `docs/selecao-carga-canonica-0003.md`. Nenhum arquivo de carga e nenhuma alteração no Supabase serão realizados durante a seleção.

## Perguntas para revisão

1. O objetivo do terceiro ciclo introduz somente a normalização quantitativa como dificuldade nova?
2. A separação entre afirmação da fonte, normalização, verificação do acontecimento e estado do valor está clara?
3. Os limites da normalização distinguem corretamente interpretação sem perda de cálculo ou estimativa?
4. O significado proposto para `validated` evita confundi-lo com auditoria ou corroboração independente?
5. Os requisitos impedem selecionar um número ambíguo, conflitante ou enganoso fora de seu contexto?
6. A definição da métrica exige semântica, unidade, agregação e granularidades suficientes?
7. A representação mínima liga corretamente valor, observação, métrica, acontecimento e proveniência?
8. A validação protege adequadamente as cargas `0001` e `0002`?
9. As interrupções impedem cálculo, tolerância ou simplificação silenciosa para concluir o ciclo?
10. Os dez critérios de sucesso demonstram o resultado esperado do terceiro ciclo?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.
