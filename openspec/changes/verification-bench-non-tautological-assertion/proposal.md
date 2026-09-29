# Proposal

## Why

Medido em `button-variants`: cinco histórias/testes que provam uma garantia
escolheram argumentos — valores de prop, estado de ambiente, ou o próprio
elemento consultado — sob os quais a asserção é verdadeira **independentemente**
de o comportamento provado existir ou estar correto. Nenhum dos cinco é erro de
sintaxe nem falta de asserção: cada um roda, passa, e aparenta provar a
garantia nomeada — só não prova, porque a escolha do argumento não distingue o
comportamento correto de uma quebra plausível dele.

As cinco ocorrências, nomeadas:

1. **`button.stories.tsx`, história `Pendente` (versão original, antes da
   correção).** Args: `icon={Menu}` + `aria-label="Abrir menu"`. Asserção:
   `canvas.getByRole("button", { name: "Abrir menu" })` resolve. `aria-label`
   é atributo do elemento nativo, independente do que `children` renderiza —
   a asserção passa tanto se `Button` preserva o conteúdo normal durante a
   pendência quanto se o substitui inteiramente pelo `Spinner` (o bug real,
   medido depois). Corrigida: a história agora usa `children` de texto, sem
   `aria-label`, e passou a reprovar antes da correção do componente.

2. **`spinner.stories.tsx`, história `SemMovimentoReduzido`.** Roda sob o
   estado padrão do Chromium headless da bancada, que não declara
   `prefers-reduced-motion`. Asserção: `animationName !== "none"`. A garantia
   nomeada é "Spinner respeita a preferência de movimento reduzido" — mas sob
   "sem preferência", a asserção é verdadeira tanto se `spinner.module.css`
   tiver a regra `@media (prefers-reduced-motion: reduce)` quanto se nunca a
   tivesse tido: o ramo que a regra desliga nunca é exercitado por este
   estado de ambiente. A história prova "o Spinner anima por padrão", não
   "o Spinner respeita a preferência".

3. **`contrast.test.ts`, teste "remover um par de ação da fonte o remove da
   checagem".** Usa os tokens correntes reais (`current()`), que nunca
   tiveram um `color-action-tertiary`. Asserção:
   `pairs.some(p => p.pair[0] === "color.action.tertiary")` é `false`. Essa
   asserção é verdadeira tanto se a enumeração de `extraActions` funciona
   corretamente (e por isso não encontra o que não existe) quanto se
   estivesse inteiramente quebrada (retornando sempre um array vazio, sem
   nunca enumerar nada). Só o teste irmão ("par de ação novo entra...", que
   planta o par e confere presença) prova a enumeração; este, sozinho, não
   prova a remoção — prova só a ausência de um plantio que nunca aconteceu.

4. **`button.stories.tsx`, história `Desabilitado`, as asserções de clique e
   teclado.** `userEvent.click(button)` e `userEvent.keyboard("{Enter}")`
   sobre um botão com o atributo nativo `disabled` presente. O navegador
   bloqueia o clique **no nível nativo**, independente de qualquer lógica de
   `Button` acima dele — a asserção "onPress não dispara" passa mesmo que a
   ligação de `isDisabled` a outros efeitos (`data-disabled`, os tokens de
   cor) estivesse desconexa da que desliga o clique, contanto que o atributo
   `disabled` nativo chegue lá por algum caminho. A história testa o
   navegador, não especificamente a ligação de `Button`.

5. **`button.stories.tsx`, história `AtributosDeControle`.** Testa
   `aria-expanded={true}` — um valor booleano, só um dos dois possíveis. A
   asserção `toHaveAttribute("aria-expanded", "true")` passa tanto se
   `Button` repassa o valor recebido quanto se tivesse um valor fixo
   `"true"` embutido por engano. `aria-controls`/`aria-describedby` escapam
   dessa crítica porque são strings arbitrárias improváveis de coincidir por
   acidente; o booleano de dois valores não tem essa proteção.

**Confiança:** as três primeiras são inequívocas — a mutação que cada uma
deixa passar é concreta e foi, no caso da primeira, medida ao vivo (a história
corrigida reprovou contra o componente com o bug). As duas últimas seguem o
mesmo formato, com severidade menor; ficam para o dono confirmar se contam
como a mesma classe de defeito ou como um caso mais brando.

## What Changes

- Um requisito novo em `verification-bench`: toda história que prova uma
  garantia SHALL escolher argumentos sob os quais a asserção seria falsa se o
  comportamento provado estivesse quebrado de uma forma plausível — nunca um
  argumento que a torna verdadeira não importa o que o comportamento faça.
- **Este requisito não tem prova automatizável no formato que os outros
  requisitos de `verification-bench` usam** (plantio de defeito, execução,
  reprovação nomeada). É uma propriedade do desenho do teste, não do
  comportamento renderizado — a mesma classe de regra que
  `openspec/config.yaml` (`rules.specs`) já aplica por revisão, não por
  script ("todo critério de aceite nomeia o teste que o prova"). Como
  verificar isto na prática (checklist de revisão? uma pergunta que
  `independent-review` passa a fazer? algo mecanizável que este proposal não
  enxergou?) é uma decisão em aberto para quem retomar este proposal — não
  resolvida aqui.

**O que esta mudança não faz:** não corrige as cinco ocorrências nomeadas
acima — a primeira já foi corrigida em `button-variants`; as outras quatro
ficam para quem revisar este proposal decidir se merecem correção própria,
e onde.

## Capabilities

### Modified Capabilities

- `verification-bench`: requisito novo sobre o desenho da asserção de uma
  história, sem mudar nada do que já é observável na bancada hoje.

## Impact

- `openspec/specs/verification-bench/spec.md` (via arquivamento futuro deste
  change)
- Nenhum código: este proposal não tem `design.md` nem `tasks.md` completos —
  é um rascunho para o dono decidir se e como aplicar. Faltam, deliberadamente:
  a decisão de mecanismo de verificação (D-algo em design.md) e as tarefas de
  aplicação.
