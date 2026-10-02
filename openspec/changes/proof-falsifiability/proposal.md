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

## What Changes

Duas entradas novas em `rules.specs` de `openspec/config.yaml`. Nada mais.

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
- **Não cria guardião novo.** `tools/checks/` continua com seis guardiões. As
  duas regras são aplicadas na revisão de proposta e de aplicação, como as
  demais entradas de `rules.specs`, e nenhuma delas tem guardião hoje.
- **Não revisa ciclo arquivado.** Os dezessete ciclos em
  `openspec/changes/archive/` não são reabertos nem reauditados contra as regras
  novas. As regras valem para o que for escrito a partir do merge deste ciclo.
- **Não cria ponto aberto.** `docs/pontos-abertos.md` não muda: o ponto 21
  continua aberto, com o gatilho que já tem, e este ciclo não toca
  `interface-charts`.
- **Não altera nenhum requisito de spec viva.** Em particular, não mexe nos dois
  requisitos de `verification-bench` que tratam do mesmo defeito por outro lado
  — "Localizador independente do que se afirma" e "Asserção prova o
  comportamento, não o ambiente" —, nem no requisito de `design-tokens` que
  `nav-frame-contrast` deixou com as três obrigações de cobertura, piso do papel
  e adjacência real.
- **Não escreve código, teste nem história.** O único arquivo alterado na
  aplicação é `openspec/config.yaml`.
- **Não toca `rules.proposal`, `rules.design`, `rules.tasks`, `context` nem
  `operations`.** A mudança é confinada à lista `rules.specs`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma. Este ciclo não altera comportamento observável de nenhuma capacidade:
ele muda o que um **artefato de planejamento** precisa conter, e a autoridade
sobre isso é `openspec/config.yaml`, em `rules` — não `openspec/specs/`
(`CLAUDE.md`, "Onde as regras de conteúdo moram"). A mudança declara
`skip_specs: true` em `.openspec.yaml`, pelo que `openspec validate` pede de uma
mudança sem delta. A razão está no `design.md`, decisão D1, junto da relação
entre as duas regras novas e os dois requisitos de `verification-bench` que
cobrem o mesmo defeito por outro lado.

## Impact

- `openspec/config.yaml`, seção `rules.specs`: duas entradas novas, de seis para
  oito. Nenhuma entrada existente é alterada ou removida.
- Nenhum arquivo sob `apps/`, `packages/`, `tools/` ou `docs/` muda.
- Nenhum arquivo sob `openspec/specs/` muda.
- Efeito sobre o processo, não sobre a construção: o próximo ciclo que escrever
  critério de aceite com teste que recusa algo, ou que declarar lista de entrada
  à mão, passa a ter duas obrigações a mais na revisão da proposta.
