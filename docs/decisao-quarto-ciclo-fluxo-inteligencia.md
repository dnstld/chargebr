# Decisão: quarto ciclo do fluxo de inteligência

## Estado

`AGUARDANDO REVISÃO`

Este documento define o objetivo e os controles do quarto ciclo. Ele não seleciona publicação, mês ou número, não cria a carga `0004`, não altera o schema e não modifica dados no Supabase.

## Contexto

O [terceiro ciclo](conclusao-terceiro-ciclo-fluxo-inteligencia.md) validou o fluxo manual para criar uma definição canônica de métrica e persistir um valor quantitativo exato ligado à sua proveniência.

A carga `0003` criou a definição `monthly-light-bev-registrations-brazil` e registrou `25782` emplacamentos de veículos leves BEV no Brasil durante julho de 2026. Esse primeiro ponto demonstra a representação de um valor mensal, mas ainda não demonstra como acrescentar outro período sem duplicar, alterar ou reinterpretar o que já foi aceito.

O quarto ciclo introduzirá somente essa dificuldade: **reutilização canônica para estender a série por um período**. Ele não testará correção, conflito quantitativo, cálculo derivado, automação ou aumento de volume.

## Decisão proposta

O quarto ciclo produzirá **um único novo acontecimento `market_data` e um único novo valor mensal ligados à definição aprovada `monthly-light-bev-registrations-brazil`**.

O novo valor deverá:

- referir-se a um mês civil diferente de julho de 2026;
- medir emplacamentos de veículos leves 100% elétricos classificados como BEV;
- usar a unidade `vehicle_registration`;
- possuir geografia nacional brasileira;
- ser sustentado diretamente por uma publicação primária apropriada;
- ser armazenado sem modificar o valor, a observação ou a publicação da carga `0003`.

O ciclo continuará manual. A dificuldade nova será a reutilização segura da definição e, quando aplicável, da fonte e da organização existentes.

## O que continuidade significa neste ciclo

Depois da carga `0004`, a definição poderá possuir dois valores de meses diferentes. Isso demonstrará que o modelo consegue armazenar mais de um período sob a mesma semântica aprovada.

Esse resultado não autorizará automaticamente:

- somar os dois valores;
- calcular crescimento mensal ou anual;
- interpretar tendência;
- preencher meses ausentes;
- afirmar que toda a metodologia da fonte permaneceu estável;
- tratar dois pontos como uma série suficiente para análise.

A continuidade validada será estrutural e metodologicamente limitada: dois valores distintos, cada um com sua própria observação e proveniência, ligados à mesma definição depois de revisão humana.

## Definição que deverá ser reutilizada

O ciclo não criará outra linha em `metric_definitions`. Antes da preparação da carga, a seleção deverá confirmar que a definição existente preserva exatamente:

| Campo | Valor obrigatório |
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

A correspondência precisa incluir a descrição e as notas metodológicas aprovadas na carga `0003`, não apenas os campos resumidos da tabela.

Se o novo número exigir uma definição mais ampla, mais estreita ou diferente, o ciclo deverá parar. A definição existente não poderá ser atualizada e uma nova definição não poderá ser criada dentro deste ciclo.

## Publicação candidata

A pesquisa deverá preferir uma publicação posterior da mesma série da ABVE Data. Ela não poderá usar automaticamente um número apenas porque foi publicado pela mesma instituição.

A publicação candidata deverá:

- ter sido publicada, preferencialmente, nos 30 dias anteriores à seleção;
- identificar claramente publicador, título, data e URL;
- declarar um total mensal realizado de emplacamentos BEV;
- tornar explícitos o mês, o país, a tecnologia e a natureza do número;
- permitir converter a grafia publicada em inteiro sem cálculo ou arredondamento;
- não revisar nem substituir o valor de julho da carga `0003`;
- não apresentar conflito conhecido para o novo mês;
- permitir excluir comparações e outros números sem tornar o recorte enganoso.

Se uma publicação posterior da mesma série não estiver disponível ou não atender aos requisitos, a seleção deverá parar. O ciclo não deverá trocar de métrica ou escolher uma fonte semanticamente diferente apenas para produzir a carga `0004`.

## Reutilização de fonte e organização

Se a publicação candidata pertencer à ABVE Data, a carga deverá reutilizar:

- `sources.slug = 'abve'` como o canal institucional;
- `organizations.slug = 'abve'` como a organização publicadora.

Antes de reutilizá-los, o SQL deverá comparar integralmente seus campos com os registros aceitos na carga `0003`. A correspondência do `slug` ou do nome, isoladamente, não é suficiente.

O ciclo não criará uma segunda fonte ou organização ABVE, não atualizará esses registros e não usará texto livre para esconder uma divergência. Qualquer incompatibilidade interrompe a carga para decisão própria.

## Representação mínima esperada

A carga `0004` deverá reutilizar exatamente:

1. uma definição aprovada de métrica;
2. uma fonte existente;
3. uma organização existente.

Ela deverá criar somente:

1. uma nova publicação;
2. uma nova observação do tipo `quantity`;
3. uma nova evidência com origem estabelecida;
4. um novo acontecimento `market_data` com fase `publication`;
5. um novo valor mensal ligado à observação e à definição existente;
6. um vínculo `supports` entre a evidência e o acontecimento;
7. um vínculo `subject` entre o acontecimento e a organização existente.

O novo acontecimento ficará `accepted` e, com uma única fonte primária apropriada, `confirmed`. O novo valor ficará `validated` somente depois da revisão humana e do merge do pacote.

Não será criada relação direta entre os dois valores. A definição compartilhada e os períodos distintos serão suficientes para agrupá-los sem inventar uma relação de crescimento ou sucessão.

## Separações obrigatórias

### Período medido e data de publicação

O mês medido será registrado em `metric_values.period_start` e `period_end`. A data da nova publicação será registrada no acontecimento.

Essas datas não são intercambiáveis. A publicação poderá ocorrer em mês diferente daquele que o valor mede.

### Valor novo e valor existente

O valor de julho permanecerá com:

- número `25782`;
- período de `2026-07-01` a `2026-07-31`;
- geografia Brasil;
- estado `validated`;
- observação e proveniência da carga `0003`.

O novo valor deverá ter outra observação e outro período. `ON CONFLICT` não poderá ser usado para atualizar julho nem para substituir silenciosamente qualquer campo existente.

### Afirmação publicada e comparação editorial

A observação preservará apenas a afirmação sobre o novo total mensal. Percentuais e comparações publicados ao redor do número ficarão fora do recorte.

Mesmo que a fonte declare crescimento sobre julho, o ChargeBR não recalculará, validará nem persistirá esse percentual neste ciclo.

## Fluxo aprovado

### 1. Seleção

Pesquisar publicações recentes da mesma série e preparar `docs/selecao-carga-canonica-0004.md`. A seleção deverá confirmar:

- identidade da publicação;
- valor e grafia original;
- objeto contado;
- mês civil completo;
- geografia;
- caráter realizado ou medido do número;
- compatibilidade integral com a definição existente;
- compatibilidade integral da fonte e da organização;
- ausência de revisão de julho e de conflito para o novo mês;
- números e interpretações que ficarão excluídos.

Nenhum SQL será criado durante a seleção.

### 2. Preparação reproduzível

Depois do aceite e do merge da seleção, criar:

- `data/canonical/0004_<identificador>.sql`;
- `data/canonical/0004_<identificador>.verify.sql`;
- `docs/revisao-carga-canonica-0004.md`.

A carga será idempotente, reutilizará os três registros aprovados e interromperá diante de conteúdo divergente. Ela não será migration nem seed.

### 3. Proteção das cargas anteriores

A consulta reutilizável deverá produzir uma assinatura integral das cargas `0001`, `0002` e `0003` antes e depois da validação e da persistência.

A proteção da carga `0003` deverá incluir explicitamente:

- fonte e organização ABVE;
- publicação, observação, evidência e acontecimento;
- definição `monthly-light-bev-registrations-brazil`;
- valor de julho e seus campos de escopo;
- vínculos `supports` e `subject`.

Qualquer mudança na assinatura interrompe a execução.

### 4. Validação descartável

Executar a carga duas vezes na mesma transação e aplicar `ROLLBACK`. A consulta deverá demonstrar:

- ausência da carga `0004` antes da validação;
- criação de uma publicação, observação, evidência, acontecimento, valor e dois vínculos;
- reutilização, sem duplicação, de fonte, organização e definição;
- reconstrução da cadeia factual do novo acontecimento;
- reconstrução dos dois valores ligados à mesma definição;
- períodos distintos e ausência de atualização de julho;
- identidade das cargas `0001`, `0002` e `0003`;
- ausência de identificadores de piloto;
- estado novamente `absent` depois do `ROLLBACK`.

### 5. Revisão humana

O pacote separará perguntas factuais, metodológicas e operacionais. A pessoa revisora deverá confirmar tanto o novo valor quanto a legitimidade da reutilização dos registros existentes.

O PR só poderá ser incorporado depois de `ACCEPTED` expresso.

### 6. Persistência e resultado

Depois do aceite e do merge, executar no Supabase exatamente a carga aprovada entre `BEGIN` e `COMMIT`. A mesma consulta deverá demonstrar:

- novo acontecimento `accepted` e `confirmed`;
- novo valor mensal `validated`;
- exatamente dois valores de períodos distintos ligados à definição;
- proveniência própria para cada valor;
- reutilização sem duplicação de fonte, organização e definição;
- invariância das cargas `0001`, `0002` e `0003`;
- nenhuma alteração de schema ou dado de piloto.

O resultado será documentado em `docs/resultado-carga-canonica-0004.md`, em PR separado e sujeito a nova revisão.

## Interrupções obrigatórias

O ciclo para antes da persistência quando:

- o valor não representar um mês civil completo;
- objeto, tecnologia, unidade ou geografia não corresponderem à definição existente;
- houver mudança conhecida de método ou cobertura que impeça a correspondência integral;
- a publicação revisar, corrigir ou substituir julho de 2026;
- houver dois valores conflitantes para o novo mês;
- o número for acumulado, estimado, projetado, arredondado ou derivado;
- a fonte ou a organização existente possuir conteúdo divergente;
- a definição existente tiver sido alterada ou não estiver `approved`;
- a carga depender de atualizar um registro existente;
- o schema não representar uma distinção indispensável.

Uma interrupção não autoriza criar outra métrica, escolher um número menos adequado, introduzir tolerância, atualizar julho ou omitir a incompatibilidade.

## Critérios de sucesso

O quarto ciclo será concluído quando:

1. uma pessoa revisora confirmar o novo valor, a unidade, o período, a geografia e a publicação;
2. a correspondência integral com a definição, a fonte e a organização existentes for aceita;
3. a carga aprovada estiver na `main` antes da execução;
4. um novo acontecimento `market_data` estiver ligado à sua própria evidência;
5. um novo valor estiver ligado à sua própria observação e à definição existente;
6. os valores de julho e do novo mês puderem ser reconstruídos separadamente;
7. a carga `0003` e seu valor de julho permanecerem integralmente inalterados;
8. as cargas `0001` e `0002` também permanecerem inalteradas;
9. não houver duplicata de fonte, organização ou definição, dado de piloto, cálculo derivado ou alteração de schema;
10. a mesma consulta funcionar antes e depois da persistência;
11. a execução e suas contagens forem documentadas e aceitas.

## Fora do escopo

- correção, rejeição, substituição ou supersessão de valor existente;
- conflito quantitativo ou reconciliação entre publicações;
- tolerância entre valores, inclusive a proposta `P03-MET-01`;
- crescimento mensal ou anual;
- soma, acumulado, participação, média, razão, cobertura ou tendência;
- mais de um novo mês, valor ou acontecimento;
- criação ou alteração de definição de métrica;
- nova fonte ou organização para contornar incompatibilidade;
- cadeia regulatória canônica;
- coleta recorrente, monitoramento ou automação;
- interface pública, newsletter, alerta, história, análise ou produto pago;
- importação histórica ou migração do Notion;
- alteração de schema sem lacuna documentada e decisão própria.

## Próxima etapa após esta decisão

Depois do merge desta decisão, pesquisar publicações candidatas e preparar `docs/selecao-carga-canonica-0004.md`. Nenhum arquivo de carga e nenhuma alteração no Supabase serão realizados durante a seleção.

## Perguntas para revisão

1. O objetivo do quarto ciclo introduz somente continuidade e reutilização canônica como dificuldade nova?
2. Está claro que dois valores ligados à mesma definição não autorizam automaticamente soma, crescimento ou análise de tendência?
3. Os requisitos de correspondência integral protegem adequadamente a definição, a fonte e a organização existentes?
4. A representação mínima cria apenas a nova publicação, observação, evidência, acontecimento, valor e dois vínculos necessários?
5. A separação entre o novo período e julho impede atualização ou substituição silenciosa do valor `25782`?
6. A validação demonstra suficientemente reutilização sem duplicação e dois valores reconstruíveis sob a mesma definição?
7. A assinatura proposta protege integralmente as cargas `0001`, `0002` e `0003`?
8. As interrupções impedem avançar diante de revisão de julho, conflito, mudança semântica ou incompatibilidade metodológica?
9. Os onze critérios de sucesso representam o resultado esperado do quarto ciclo?
10. Está correto manter correção, conflito, cálculo derivado, tolerância, escala, automação e produto público fora deste ciclo?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
