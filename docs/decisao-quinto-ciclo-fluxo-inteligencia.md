# Decisão: quinto ciclo do fluxo de inteligência

## Estado

`PROPOSTA — EM REVISÃO`

Este documento propõe o objetivo e os controles do quinto ciclo. Ele não seleciona publicações para uma carga canônica, não cria SQL, não altera o schema e não modifica dados no Supabase.

## Contexto

O [quarto ciclo](decisao-quarto-ciclo-fluxo-inteligencia.md) foi interrompido corretamente durante a [seleção da carga `0004`](selecao-carga-canonica-0004.md), porque ainda não existe uma publicação posterior elegível para acrescentar outro mês à métrica de emplacamentos BEV. Essa interrupção permanece vigente e não será contornada.

O piloto da fundação, por sua vez, já demonstrou em transação descartável que o schema consegue preservar dois números diferentes publicados para o mesmo recorte. No `PILOT-03`, uma publicação informou `21.061` pontos públicos e semipúblicos de recarga para fevereiro de 2026, enquanto uma publicação posterior da mesma série mencionou `21.060` para esse período. A origem da diferença de uma unidade permaneceu desconhecida, nenhum vencedor foi escolhido e os registros do piloto foram revertidos.

Esse caso permite avançar em uma frente independente: testar o tratamento **canônico e persistente** de um conflito quantitativo conhecido, sem depender da publicação necessária ao quarto ciclo.

## Decisão proposta

O quinto ciclo produzirá uma carga canônica limitada a **dois valores publicados e conflitantes para uma única métrica, o mesmo período e a mesma geografia**.

A dificuldade nova será preservar o desacordo de maneira consultável e rastreável. O ciclo não tentará descobrir a causa da diferença, escolher o número mais provável, aplicar tolerância, calcular uma média, corrigir uma publicação ou transformar um valor no substituto do outro.

Os números conhecidos do piloto poderão orientar a pesquisa, mas não serão copiados automaticamente. A seleção deverá reabrir as fontes oficiais, reconstruir cada afirmação e justificar de novo sua representação.

## Independência em relação ao quarto ciclo

O quinto ciclo não depende da conclusão da carga `0004` porque trata outra definição de métrica, outras publicações e outro problema metodológico.

O identificador `0005` representará a identidade deste ciclo, não uma promessa de ordem cronológica de persistência. A carga `0005` poderá ser preparada e persistida enquanto `0004` permanecer ausente, desde que:

- a ausência de `0004` seja verificada e documentada;
- as cargas canônicas existentes sejam integralmente protegidas;
- qualquer carga que seja incorporada antes da execução também entre na proteção de integridade;
- uma futura carga `0004` proteja a `0005` caso esta já esteja persistida;
- nenhum arquivo, identificador ou registro reservado ao quarto ciclo seja reutilizado.

Essa independência não altera a decisão do quarto ciclo nem libera outro candidato para a métrica de emplacamentos BEV.

## Núcleo quantitativo a ser pesquisado

A seleção deverá verificar, nas publicações oficiais:

- o valor `21.061` atribuído à rede pública e semipública brasileira até fevereiro de 2026;
- o valor `21.060` atribuído posteriormente ao mesmo recorte temporal;
- os termos exatos usados para a entidade contada, inclusive “pontos de recarga”, “eletropostos” ou “carregadores”;
- a participação declarada da ABVE e da Tupi na produção ou publicação dos números;
- se os dois valores realmente descrevem a mesma métrica, período e geografia;
- se existe correção, errata, metodologia ou explicação oficial para a diferença.

Se a pesquisa demonstrar que os números medem objetos, coberturas ou períodos diferentes, não existe o conflito proposto e o ciclo deverá parar para nova decisão. A aparência de diferença numérica não é suficiente.

## Definição única de métrica

A seleção deverá propor uma única definição canônica somente se os dois valores forem semanticamente comparáveis.

A definição precisará explicitar:

- qual entidade é contada;
- se a cobertura inclui pontos públicos e semipúblicos;
- se cada conector, estação, local ou equipamento corresponde a uma unidade;
- a geografia nacional brasileira;
- a natureza de estoque ou fotografia temporal do total;
- a granularidade temporal defensável;
- o significado dos termos originais usados pelas publicações;
- as limitações metodológicas que impedem interpretações mais fortes.

Se as fontes não permitirem escolher uma unidade canônica sem alterar materialmente o sentido, a seleção deverá interromper o ciclo. Texto livre não poderá esconder uma incompatibilidade entre as entidades contadas.

## Representação do conflito

Se o conflito for confirmado, os dois valores deverão:

1. estar ligados à mesma definição de métrica;
2. possuir o mesmo período e a mesma geografia;
3. preservar seus números exatos, `21061` e `21060`;
4. possuir observações, evidências e publicações de origem distintas;
5. permanecer com `value_status = 'provisional'`;
6. ser reconstruíveis separadamente até o texto oficial correspondente;
7. coexistir sem relação de precedência, substituição ou equivalência.

O estado `provisional` indicará que o ChargeBR preservou uma afirmação quantitativa ainda não reconciliada. Ele não significa que a publicação seja falsa nem que o dado não tenha sido revisado quanto à transcrição.

Nenhum dos valores ficará `validated`, `superseded` ou `rejected` neste ciclo. Esses estados exigiriam uma decisão sobre o mérito do conflito que as fontes ainda não sustentam.

## Publicações e acontecimentos

Cada publicação deverá produzir sua própria cadeia factual:

```text
fonte → publicação → observação → evidência → acontecimento
                                  ↘ valor da métrica
```

Os acontecimentos representarão a publicação de cada resultado, não a instalação individual de cada ponto de recarga. A data do acontecimento será a data de publicação; fevereiro de 2026 será o período de referência do valor.

Os acontecimentos poderão ficar `accepted` e `confirmed` depois da revisão humana, porque as fontes sustentam o que publicaram. Eles não ficarão `corroborated`: duas publicações da mesma série que divergem não constituem confirmação independente do mesmo número.

## Fonte e organizações

A seleção deverá comparar integralmente qualquer registro existente antes de reutilizá-lo.

Em particular:

- `sources.slug = 'abve'` e `organizations.slug = 'abve'` somente poderão ser reutilizados se todos os campos corresponderem aos registros aceitos na carga `0003`;
- a participação da Tupi deverá ser representada somente no papel sustentado pelas publicações;
- uma fonte identifica o canal de publicação, enquanto uma organização identifica um participante institucional;
- nenhuma duplicata poderá ser criada para contornar divergência de campos.

A seleção decidirá, com base nas páginas oficiais, se a Tupi exige fonte própria, organização própria, vínculo com os acontecimentos ou apenas registro na proveniência textual. O papel não será presumido a partir do piloto.

## Representação mínima esperada

Se a seleção confirmar o caso, a carga `0005` deverá criar no máximo:

- uma definição de métrica;
- duas publicações;
- duas observações do tipo `quantity`;
- duas evidências com origem estabelecida;
- dois acontecimentos `market_data` com fase `publication`;
- dois valores métricos provisórios;
- dois vínculos `supports` entre acontecimentos e evidências;
- os vínculos institucionais estritamente sustentados pelas fontes.

Ela deverá reutilizar a fonte e a organização ABVE existentes quando houver correspondência integral. A quantidade exata de registros relacionados à Tupi dependerá da seleção e deverá ser aprovada antes da preparação do SQL.

## O que o conflito não autoriza

A diferença conhecida é de uma unidade, mas isso não autoriza:

- considerar os valores equivalentes;
- aplicar a margem de cinco discutida no piloto;
- escolher automaticamente o número mais recente;
- assumir que o número posterior corrige o anterior;
- armazenar `21060,5`, uma média ou um intervalo;
- arredondar ambos para `21 mil`;
- calcular percentuais de crescimento ou cobertura;
- elevar qualquer valor a `validated`;
- criar uma regra global de tolerância.

A proposta `P03-MET-01` continuará não resolvida. Uma tolerância futura exigirá evidência empírica ou documental e decisão própria, separada deste ciclo.

## Fluxo proposto

### 1. Seleção independente

Preparar `docs/selecao-carga-canonica-0005.md` a partir das fontes oficiais atuais. A seleção deverá confirmar ou rejeitar a existência do conflito sem usar os registros descartáveis do piloto como autoridade factual.

Nenhum SQL será criado nessa etapa.

### 2. Preparação reproduzível

Depois do aceite e do merge da seleção, criar:

- `data/canonical/0005_<identificador>.sql`;
- `data/canonical/0005_<identificador>.verify.sql`;
- `docs/revisao-carga-canonica-0005.md`.

A carga será idempotente e interromperá diante de conteúdo preexistente divergente. Ela não será migration nem seed.

### 3. Proteção do estado existente

A consulta deverá assinar integralmente as cargas canônicas persistidas antes e depois da validação e da execução. A proteção incluirá as cargas `0001`, `0002` e `0003` e qualquer outra carga presente no banco no momento da execução.

A ausência ou presença da carga `0004` será informada explicitamente, sem tratá-la como erro e sem criar registros substitutos.

### 4. Validação descartável

Executar a carga duas vezes na mesma transação e aplicar `ROLLBACK`. A consulta deverá demonstrar:

- ausência da carga `0005` antes da validação;
- duas cadeias factuais completas e separadas;
- uma única definição compartilhada;
- dois valores distintos para o mesmo período e a mesma geografia;
- ambos os valores em estado `provisional`;
- nenhuma escolha de vencedor, tolerância ou sobrescrita;
- reutilização sem duplicação dos registros existentes aplicáveis;
- invariância integral das cargas anteriores;
- ausência de identificadores de piloto;
- estado novamente `absent` depois do `ROLLBACK`.

### 5. Revisão humana

A pessoa revisora deverá reconstruir cada valor a partir de sua publicação e confirmar que o conflito é real, não apenas aparente. As perguntas factuais, metodológicas e operacionais ficarão separadas.

O PR só poderá ser incorporado depois de `ACCEPTED` expresso.

### 6. Persistência e resultado

Depois do aceite e do merge do pacote, executar no Supabase exatamente a carga aprovada entre `BEGIN` e `COMMIT`.

O resultado será documentado em `docs/resultado-carga-canonica-0005.md`, em PR separado. Nenhum dos valores poderá mudar de estado durante a documentação do resultado.

## Interrupções obrigatórias

O ciclo para antes da persistência quando:

- os valores não se referirem à mesma entidade contada;
- público e semipúblico não tiverem a mesma cobertura nas duas publicações;
- período ou geografia forem diferentes;
- uma errata ou correção oficial já resolver a divergência;
- a unidade canônica exigir interpretação não sustentada;
- qualquer número for arredondado, estimado, projetado ou derivado;
- houver mais de dois valores indispensáveis ao mesmo conflito;
- a fonte, a organização ou a definição existente possuir conteúdo divergente;
- a carga depender de atualizar ou apagar registro aceito;
- o schema não permitir preservar uma distinção indispensável.

Uma interrupção não autoriza reduzir a definição, esconder a ambiguidade, escolher um vencedor ou introduzir tolerância.

## Critérios de sucesso

O quinto ciclo será concluído quando:

1. uma pessoa revisora confirmar nas fontes os dois valores e seus escopos;
2. o conflito real para a mesma métrica, período e geografia estiver demonstrado;
3. uma única definição canônica representar os dois valores sem perda de sentido;
4. cada valor possuir proveniência própria e reconstruível;
5. ambos permanecerem `provisional` e nenhum vencedor for indicado;
6. os acontecimentos preservarem publicação, período medido e níveis de verificação corretos;
7. fonte e organizações forem reutilizadas ou criadas sem duplicação e com papéis sustentados;
8. todas as cargas anteriores permanecerem inalteradas;
9. não houver tolerância, média, arredondamento, derivação ou alteração de schema;
10. a execução e suas contagens forem documentadas e aceitas.

## Fora do escopo

- descobrir a causa da diferença entre `21.061` e `21.060`;
- escolher ou recomendar um dos valores;
- corrigir, rejeitar, substituir ou superseder uma publicação;
- adotar margem de cinco ou outra tolerância;
- criar regra automática de reconciliação;
- calcular crescimento, cobertura, proporção ou tendência;
- combinar os valores com outras bases de recarga;
- carregar outros números das mesmas publicações;
- resolver a seleção interrompida da carga `0004`;
- coleta recorrente, escala ou automação de ingestão;
- interface pública, newsletter, alerta ou produto pago;
- importação de registros do piloto ou do Notion;
- alteração de schema sem lacuna documentada e decisão própria.

## Próxima etapa após esta decisão

Depois do merge desta decisão, pesquisar novamente as duas publicações oficiais e preparar `docs/selecao-carga-canonica-0005.md`. Nenhum arquivo de carga e nenhuma alteração no Supabase serão realizados durante a seleção.

## Perguntas para revisão

1. Está correto iniciar o quinto ciclo como uma frente independente enquanto a carga `0004` aguarda nova publicação?
2. O ciclo introduz somente o tratamento canônico de um conflito quantitativo como dificuldade nova?
3. Está correto exigir prova de que os dois números representam a mesma entidade, período, cobertura e geografia antes de reconhecer o conflito?
4. A coexistência de `21061` e `21060`, ambos `provisional`, preserva a divergência sem escolher vencedor?
5. Está correto não aplicar a margem de cinco nem outra tolerância neste ciclo?
6. As duas cadeias separadas preservam adequadamente a proveniência de cada valor?
7. Está correto não tratar as duas publicações divergentes como corroboração independente do mesmo número?
8. A regra de proteção cobre adequadamente as cargas existentes mesmo se `0005` for persistida antes de `0004`?
9. As interrupções impedem avançar diante de diferença apenas aparente, unidade ambígua ou correção oficial?
10. Está correto manter reconciliação, correção, cálculo derivado, automação e produto público fora deste ciclo?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |

