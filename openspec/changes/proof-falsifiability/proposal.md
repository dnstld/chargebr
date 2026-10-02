# Proposal

## Why

`rules.specs` de `openspec/config.yaml` exige hoje que **todo critério de aceite
nomeie o teste que o prova** (linha 58). Nomear e medir são coisas diferentes:
nada na regra exige que o teste nomeado seja **capaz de reprovar**. Um critério
pode citar um teste que passa por coincidência — porque o localizador acha o
elemento pelo próprio sinal que a asserção lê, porque o valor esperado é o
padrão do navegador, porque os argumentos escolhidos tornam a asserção vazia, ou
porque a lista de entrada que o teste varre está vazia. Em todos esses casos a
regra atual está cumprida, e a prova não prova nada.

A segunda metade do problema é a **lista escrita à mão**. Par de contraste, alvo
de varredura, superfície, perímetro de guardião: toda lista de entrada declarada
à mão é uma afirmação sobre o código, e `rules.specs` não pede prova nenhuma
sobre ela. Lista que declara de menos passa calada — a varredura roda, mede o
que foi declarado e fica verde. Item que não cumpre no código o papel que o nome
dele anuncia na lista também passa calado, e pior: produz número certo pela
razão errada.

**Cinco casos medidos neste repositório**, nenhum hipotético. Esta proposta os
cita; o registro de cada um está no lugar indicado e não é recontado aqui:

1. **Localizador circular** — a única prova de um acoplamento localizava o
   elemento pelo mesmo atributo `data-*` que a asserção lia; a asserção passava
   com o acoplamento quebrado. Medido no design de `interface-atomic-structure`
   (D8), registrado no requisito "Localizador independente do que se afirma" de
   `openspec/specs/verification-bench/spec.md`.
2. **Valor esperado igual ao padrão do navegador** — asserção de estilo
   computado contra um valor que é também o valor inicial da propriedade CSS:
   passaria sem o código. Mesma varredura, mesmo requisito, cenário próprio.
3. **Argumentos de história escolhidos de modo que a asserção não pudesse
   falhar** — `aria-label` independente de `children`, uma das cinco ocorrências
   de `button-variants` nomeadas no ponto 16 de `docs/pontos-abertos.md`.
4. **`nav-frame-contrast`, primeira versão** — a checagem montava a entrada de
   texto com `surfaces: []` (introduzido em `bcffd54`, removido em `d837c94`), e
   quatro cores — `color.nav.text`, `text-strong`, `text-muted` e `hover` —
   ficaram declaradas sem nenhum par medido.
5. **`nav-frame-contrast`, revisão do PR 2** — `color.nav.edge` declarado como
   superfície sendo **borda nos cinco usos**. O número saía certo porque `edge`
   e `hover` são o mesmo cinza: a matriz ficava numericamente certa e
   estruturalmente errada, e o par que de fato limitava a moldura — objeto
   gráfico apagado sobre o fundo de interação, 0,045 de margem — não estava
   declarado. Corrigido em `36a850b`.

O caso 5 é o que obriga as duas regras a serem **duas, e não uma**: ali havia
plantio, o plantio reprovava, e ainda assim a lista descrevia adjacência que não
existe na tela. **Plantio prova que o teste roda; não prova que ele mede a coisa
certa.**

**Sexto caso, medido na emenda desta proposta, e o mais grave: a própria lista de
regras não tem prova nenhuma.** `openspec/config.yaml` pode ficar sintaticamente
inválido — aspa não fechada, parser levanta erro — e os comandos que este
repositório de fato executa não reclamam:

| Comando | Saída | Código |
| --- | --- | --- |
| `openspec validate --specs --strict` | `Totals: 7 passed, 0 failed` | 0 |
| `openspec list` | `No active changes found` | 0 |

Nenhum aviso em nenhum dos dois. E **nada no repositório lê o arquivo**: `grep`
por `config.yaml` em `tools/`, `package.json` e `biome.json` volta vazio, e os
quatro estágios de `pnpm verify` são `tsc`, `biome format`, `biome lint` e
`vitest` — nenhum olha YAML. **As oito regras do projeto podem desaparecer
inteiras com o portão verde.**

Isso obriga este ciclo, e não um ciclo à parte: a lista de regras **é ela mesma
uma lista de entrada declarada à mão**, e a regra 2 que este ciclo escreve exige
prova de cobertura para lista declarada à mão. O ciclo que escreve a regra não
deixa sem prova a lista mais importante do repositório. Não é escopo novo — é a
regra aplicada a si mesma, e é esse argumento que justifica o guardião nascer
aqui.

## What Changes

Duas entradas novas em `rules.specs` de `openspec/config.yaml`, e o guardião que
impede essa lista de desaparecer em silêncio.

- **Regra do plantio.** Critério de aceite cujo teste existe para **recusar**
  algo só está provado com o plantio registrado: o que foi plantado, a
  reprovação observada com o que ela nomeou, e a reversão do plantio. Prova que
  nunca foi vista reprovar não é prova, é coincidência registrada.

- **Regra da lista declarada à mão.** Lista de entrada escrita à mão é
  afirmação sobre o código e precisa de **duas provas próprias**: **cobertura**,
  comparando a lista contra o conjunto descoberto da fonte, e
  **correspondência**, conferindo que cada item cumpre no código o papel que o
  nome dele anuncia na lista. Sem a primeira, lista vazia passa; sem a segunda,
  item que não existe no papel declarado passa.

- **Guardião novo, o sétimo: `tools/checks/config-rules.test.ts`.** Ele afirma
  três coisas sobre `openspec/config.yaml`: que o arquivo **parseia**; que as
  seções `rules.proposal`, `rules.specs`, `rules.design` e `rules.tasks`
  **existem e nenhuma está vazia**; e que a **contagem por seção bate com a
  declarada** no próprio guardião. As quatro seções declaradas são conferidas
  contra as seções **descobertas** sob `rules:` no arquivo — é a prova de
  cobertura da regra 2 aplicada à lista do próprio guardião, para que uma seção
  nova de regras não entre sem ser coberta.
- **O inventário de guardiões de `CLAUDE.md` passa de seis para sete**, com a
  linha do guardião novo no formato das outras.
- **`yaml` entra como dependência de desenvolvimento na raiz.** Medido:
  `yaml@2.9.1` existe no armazenamento do pnpm como dependência transitiva de
  `@fission-ai/openspec`, e **não resolve da raiz** —
  `import("yaml")` falha com `ERR_MODULE_NOT_FOUND`. Sem parser não há como
  afirmar "o arquivo parseia" sem escrever um parser de YAML à mão, que seria
  pior do que o problema.

**O limite entre as duas é decidido nesta proposta, não deixado em aberto.** O
plantio vale para o critério cujo teste **recusa** algo — piso, proibição,
fronteira, guardião. Um critério que apenas **registra uma medição** — a matriz
afirmando um valor — não planta, e cai na segunda regra, que é onde ele pode
errar. Sem esse limite a primeira regra viraria cerimônia em cima de toda
asserção do repositório, e cerimônia é exatamente o que os ciclos de setembro
tiraram daqui (`remove-domain-capabilities`).

As duas regras são redigidas para serem **aplicáveis sem leitura de contexto**:
quem ler `rules.specs` num ciclo futuro decide sozinho se o critério dele pede
plantio, pela pergunta "este teste existe para recusar algo?". Redação que
dependa de lembrar da conversa que a originou está errada e é refeita.

## What This Does Not Do

- **Não exige plantio em asserção de tipo.** Checagem de tipo reprova na
  compilação, não por execução plantada, e a regra não a alcança.
- **Não mecaniza as duas regras.** O guardião novo não lê o **conteúdo** de
  nenhuma regra, não julga critério de aceite e não sabe o que um teste alega
  provar. Ele prova que a lista de regras **está lá e está cheia** — nada além.
  As duas regras continuam aplicadas na revisão, como as seis atuais.
- **Não revisa ciclo arquivado.** Os dezessete ciclos em
  `openspec/changes/archive/` não são reabertos nem reauditados contra as regras
  novas. As regras valem para o que for escrito a partir do merge deste ciclo.
- **Não cria ponto aberto.** `docs/pontos-abertos.md` não muda: o ponto 21
  continua aberto, com o gatilho que já tem, e este ciclo não toca
  `interface-charts`.
- **Não altera nenhum requisito de spec viva existente.** O ciclo acrescenta um
  requisito a `workspace-verification` — o do guardião novo — e não toca nenhum
  dos que já existem. Em particular, não mexe nos dois requisitos de
  `verification-bench` que tratam do mesmo defeito por outro lado
  — "Localizador independente do que se afirma" e "Asserção prova o
  comportamento, não o ambiente" —, nem no requisito de `design-tokens` que
  `nav-frame-contrast` deixou com as três obrigações de cobertura, piso do papel
  e adjacência real.
- **Não escreve componente, história nem estilo.** O único código do ciclo é o
  guardião, em `tools/checks/`. Nada sob `apps/` ou `packages/` muda.
- **O guardião não verifica a redação das regras.** Regra mal escrita, ambígua
  ou contraditória passa por ele. Cobertura e preenchimento não são qualidade,
  e o guardião não finge que são.
- **Não toca `rules.proposal`, `rules.design`, `rules.tasks`, `context` nem
  `operations`.** A mudança é confinada à lista `rules.specs`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workspace-verification`: acrescenta o requisito do guardião novo — o arquivo
  de regras do projeto, `openspec/config.yaml`, passa a ter integridade
  verificada pelo portão: parseia, as quatro seções de `rules` existem e nenhuma
  está vazia, e a contagem por seção bate com a declarada. Hoje a capacidade
  cobre literal de estilo, supressão de tipo, origem de fixture e ciclo de vida
  de mudança OpenSpec, e **não cobre o arquivo que carrega as regras do próprio
  processo** — é essa a ausência que o requisito nomeia.

**Por que há delta, embora as duas regras em si não produzam nenhum.** As duas
regras continuam sem delta pela razão de `design.md`, D1: elas governam o que um
artefato de planejamento contém, e a autoridade sobre isso é `rules` em
`openspec/config.yaml`, que `CLAUDE.md` proíbe duplicar em spec viva. O delta não
é delas — é do **guardião**, que muda comportamento observável do portão.
**Medido:** os seis guardiões de hoje têm, cada um, requisito vivo que descreve o
que eles reprovam (`style-literals` e `fixture-origin` em
`workspace-verification`, nomeados; `type-suppression` e os três de
`change-lifecycle` em `workspace-verification`, pelo comportamento;
`component-vocabulary` em `shell-components`; `nav-pair-adjacency` em
`design-tokens`). Um sétimo guardião sem requisito seria o primeiro, e deixaria
uma reprovação nova do portão sem nenhum registro — exatamente o tipo de silêncio
que este ciclo existe para fechar.

## Impact

- `openspec/config.yaml`, seção `rules.specs`: duas entradas novas, de seis para
  oito. Nenhuma entrada existente é alterada ou removida.
- `tools/checks/config-rules.test.ts`: guardião novo, o sétimo.
- `CLAUDE.md`, seção "Perímetros": o inventário de guardiões passa de seis para
  sete.
- `package.json` da raiz: `yaml` entra em `devDependencies`. Nenhum script é
  alterado — em particular, `collect`, `extract` e `test`, que não são nossos,
  ficam intactos.
- `openspec/specs/workspace-verification/spec.md`: um requisito novo, aplicado no
  arquivamento (PR 3).
- Nenhum arquivo sob `apps/`, `packages/` ou `docs/` muda, com a exceção do
  cabeçalho de `docs/pontos-abertos.md` no arquivamento, que todo ciclo atualiza.
- Efeito sobre o processo: o próximo ciclo que escrever critério de aceite com
  teste que recusa algo, ou que declarar lista de entrada à mão, passa a ter duas
  obrigações a mais na revisão da proposta. Efeito sobre o portão: `pnpm verify`
  passa a reprovar quando o arquivo de regras fica ilegível ou perde uma seção.
