# Pontos abertos

**Atualizado em:** 29 de setembro de 2026, no arquivamento de
`button-variants`
**Estado do repositório:** 7 capacidades vivas, 14 ciclos arquivados,
nenhum change ativo. **8 pontos abertos**

## O que este arquivo é

O registro dos pontos que os ciclos deixaram em aberto **de propósito**. Nenhum
é bloqueio, nenhum foi preenchido por suposição, e cada um tem um gatilho: a
condição que obriga a retomá-lo.

Este registro cobre **a frente de interface e nada mais**. A frente de coleta tem
processo próprio e os pontos dela não moram aqui.

Um ponto sai daqui quando um ciclo o fecha, e o ciclo que o fecha cita o número.
Um ponto novo entra com gatilho — sem gatilho, não é ponto aberto, é esquecimento
com nome bonito.

Dois deles (1 e 10) atingem o próximo ciclo que criar rota de negócio. Vale ler
os dois antes de propor esse ciclo.

Os números não são reaproveitados: um ponto fechado deixa o seu vago, e a lista
de fechados, no fim, diz qual ciclo o fechou.

---

## 1. A camada 3 não existe

**O que é:** o repositório prova comportamento de aplicação em duas camadas — a
bancada, para componentes, e o documento emitido pela construção, para o
documento. A terceira camada, um navegador dirigido contra um servidor iniciado,
nunca foi construída.

**Por que ficou aberto:** nenhuma exigência precisou dela até aqui, e o custo é
alto: servidor, segundo executor, provavelmente um estágio novo em
`pnpm verify`.

**Gatilho:** a primeira exigência que fale de navegação entre rotas, ou de
comportamento que só exista depois da hidratação.

**Consequência enquanto não existe:** nenhuma exigência pode ser redigida como
"antes da primeira pintura". A camada 2 prova a condição necessária — um script
síncrono posicionado antes de `<body>` —, nunca a suficiente.

E uma rota resolvida por requisição não tem documento emitido: a camada 2 prova
que ela existe e está declarada com essa forma, e nada sobre o conteúdo dela é
provável até a camada 3. Hoje é o caso de `/prova/[id]`, que existe só para
exercitar essa forma; cada rota de negócio declarada assim herda a mesma lacuna.

**Onde está registrado:** `docs/decisao-prova-de-comportamento-de-aplicacao.md`.

---

## 5. Três requisitos de `design-tokens` misturam obrigação e razão

**O que é:** medindo os requisitos vivos, a mediana do corpo é de **4 linhas** e
o maior fora do ciclo 7 tem **10**. Três requisitos tocados pelo ciclo 7 têm
**22, 30 e 38**. Neles, frases normativas e justificativa convivem no mesmo
parágrafo, e o leitor não distingue o que obriga do que explica.

**O que já está feito:** a regra está em `rules.specs` de `openspec/config.yaml`
desde o ciclo 7 — o corpo de um requisito contém só o que obriga, e a razão vai
em bloco aberto por `**Por quê:**`. O ciclo 8 já a cumpriu.

**Por que o retrofit não foi feito junto:** não é editorial. Pelo menos três
frases precisam ser reescritas **como obrigação** — há frases sem `SHALL` que
decidem qual piso se aplica. Reescrever conteúdo normativo é mudança, com
proposta e revisão; fazê-lo sob o rótulo de "arrumar a redação" é como conteúdo
normativo passa sem ser olhado.

**Gatilho:** o próximo ciclo que tocar `design-tokens` pelas suas próprias
razões.

**Nota:** fechar este ponto **não** cala os avisos INFO de
`openspec validate`. Aquele aviso é heurística de comprimento; foi o sintoma que
levou ao problema, não o problema.

---

## 10. A forma mista é recusada, não resolvida

**O que é:** uma rota com parâmetro pré-renderizada para uma lista de valores e
resolvida por requisição para valor fora dela — lista aberta, `fallback: null`
em `prerender-manifest.json` — reprova na camada 2, declarada ou não. Só a
lista fechada (`dynamicParams = false`) é aceita como pré-renderizada.

**Por que ficou aberto:** a parte resolvida por requisição é o mesmo ponto cego
que o ciclo `dynamic-route-readiness` fechou, e aceitá-la exigiria uma terceira
forma de declaração que nenhum ciclo precisou. Recusar é o que não supõe.

**Gatilho:** a primeira exigência que precise de uma rota pré-renderizada para
uma lista e resolvida por requisição fora dela. O ciclo que a trouxer propõe a
forma de declaração, com o que a camada 2 afirma sobre cada parte.

**Onde está registrado:** requisito "Rotas construídas são as declaradas" de
`backoffice-shell`; design do ciclo `dynamic-route-readiness`.

---

## 16. Histórias que provam garantia com asserção tautológica

**O que é:** medido em `button-variants` — cinco histórias/testes que
provam uma garantia escolheram argumentos (valores de prop, estado de
ambiente, ou o elemento consultado) sob os quais a asserção é verdadeira
**independentemente** de o comportamento provado existir ou estar correto.
Nenhuma tem erro de sintaxe nem falta asserção; cada uma roda, passa, e
aparenta provar a garantia nomeada — só não prova.

As cinco, nomeadas:

1. `button.stories.tsx`, história `Pendente` (versão original). Args:
   `icon={Menu}` + `aria-label`. A asserção de nome acessível passa tanto se
   `Button` preserva o conteúdo durante a pendência quanto se o substitui
   inteiramente — `aria-label` é atributo do elemento, independente do que
   `children` renderiza. Este era um bug real, medido ao vivo (a história
   corrigida, com `children` de texto, reprovou contra o componente antes da
   correção) e já corrigido no mesmo ciclo.
2. `spinner.stories.tsx`, história `SemMovimentoReduzido`. Roda sob o padrão
   do Chromium headless, que não declara `prefers-reduced-motion`. A
   asserção "animação presente" é verdadeira tanto se `spinner.module.css`
   tiver a regra que desliga a animação sob a preferência quanto se nunca a
   tivesse tido — o ramo que a regra desliga nunca é exercitado por este
   estado de ambiente.
3. `contrast.test.ts`, teste "remover um par de ação da fonte o remove da
   checagem". Usa os tokens correntes reais, que nunca tiveram o par
   plantado. A asserção de ausência é verdadeira tanto se a enumeração
   funciona corretamente (e por isso não encontra o que não existe) quanto
   se estivesse inteiramente quebrada (sempre vazia, sem nunca enumerar
   nada). Só o teste irmão, que planta o par e confere presença, prova a
   enumeração.
4. `button.stories.tsx`, história `Desabilitado`, as asserções de clique e
   teclado. O navegador bloqueia o clique no nível **nativo** (atributo
   `disabled`), independente de qualquer lógica de `Button` acima dele — a
   asserção passa mesmo que a ligação de `isDisabled` a outros efeitos
   estivesse desconexa da que desliga o clique.
5. `button.stories.tsx`, história `AtributosDeControle`. Testa só
   `aria-expanded={true}` — um booleano, só um dos dois valores possíveis. A
   asserção passa tanto se `Button` repassa o valor recebido quanto se
   tivesse `"true"` fixo embutido por engano.

**Confiança:** as três primeiras são inequívocas — a mutação que cada uma
deixa passar é concreta, e a primeira foi medida ao vivo. As duas últimas
seguem o mesmo formato, com severidade menor; ficam para quem retomar este
ponto confirmar se contam como a mesma classe de defeito.

**Por que ficou aberto:** o requisito correspondente pertence à capacidade
`verification-bench`, que já existe e já é viva (`openspec/specs/
verification-bench/spec.md`) — mudar uma spec viva é ciclo próprio, com
proposta, design e tarefas, não uma linha solta encaixada em outro change. Um
rascunho de proposta chegou a ser aberto em `openspec/changes/
verification-bench-non-tautological-assertion/` durante a aplicação de
`button-variants` e foi removido de lá por decisão do dono: o achado fica
registrado aqui, não meio-proposto num PR de código.

**Nota:** este requisito, quando escrito, não terá prova automatizável no
formato que os demais requisitos de `verification-bench` usam (plantio de
defeito, execução, reprovação nomeada) — é uma propriedade do desenho do
teste, não do comportamento renderizado, verificável por revisão, no mesmo
formato que `openspec/config.yaml` (`rules.specs`) já usa para "todo critério
de aceite nomeia o teste que o prova". Como mecanizar isso, se for possível,
é decisão do ciclo que escrever o requisito.

**Gatilho:** o próximo ciclo que tocar `verification-bench` por suas
próprias razões — é lá que a proposta se escreve inteira, com design e
tarefas.

---

## 17. `openspec validate --strict` aprova mudança sem `design.md` nem `tasks.md`

**O que é:** o schema `spec-driven` declara `design` e `tasks` como
artefatos de planejamento exigidos antes de aplicar (`applyRequires:
["tasks"]`), mas `openspec validate` não os exige para considerar a mudança
válida. **Medido nesta branch** (`button-variants`), sobre um change com só
`proposal.md` e uma spec delta, sem `design.md` nem `tasks.md`:

```
$ npx openspec validate <nome> --strict --json
{
  "items": [{ "id": "<nome>", "type": "change", "valid": true, "issues": [] }],
  "summary": { "totals": { "items": 1, "passed": 1, "failed": 0 } }
}
```

`--strict` não muda o resultado. `valid: true`, zero `issues`, para uma
mudança que ninguém poderia aplicar como está (falta o "como" e o "em que
passos").

**Por que ficou aberto:** `openspec` (`@fission-ai/openspec`) é ferramenta de
terceiro, não deste repositório — não é nosso lugar consertar o
comportamento do `validate`. O registro existe para que "`validate` passou"
nunca seja lido como "mudança completa" por quem revisar um proposal daqui
em diante; os dois fatos já divergiram uma vez sem estarem escritos em
lugar nenhum.

**Gatilho:** uma versão de `@fission-ai/openspec` que passe a considerar
artefatos de planejamento ausentes na checagem de validade, ou a primeira
vez que essa lacuna causar um problema real (uma mudança revisada ou
aplicada como se completa por engano, apoiada só em `validate` verde).

---

## 18. `NavPanel` construído, sem rota de negócio para religar

**O que é:** `NavPanel`, `NavSection` e `NavItem` existem como componentes de
`@chargebr/ui`, exercitados na bancada (Storybook), e `AppFrame` ganhou um
slot de navegação (`nav`, `navToggleLabel`, `navOpen`, `onNavToggle`) e o
gatilho do hambúrguer que o abre e fecha — mas nenhum dos dois está ligado a
`apps/backoffice`. O requisito "Regiões da moldura no documento entregue"
(`backoffice-shell`) continua proibindo região de navegação no documento
emitido, porque não existe rota de negócio real para listar (decisão do
dono, `design.md` D5 de `interface-atomic-structure`).

**Por que ficou aberto:** popular `nav` com destinos de mentira reproduziria
exatamente o defeito que aquele requisito foi escrito para impedir — uma
região de navegação vazia (ou fictícia) anuncia um destino que não existe.

**Gatilho:** a primeira rota de negócio real — o ciclo que a trouxer decide
a forma final de `nav` em `apps/backoffice` e revisa o requisito "Regiões da
moldura no documento entregue" em conjunto.

---

## 19. O harness de viewport da bancada não redimensiona de verdade

**O que é:** nenhuma forma testada de controlar a largura real da janela
dentro de uma história (`play`) tem efeito em `packages/ui`, sob
`@storybook/addon-vitest@10.6.0` + `vitest@5.0.1`. Medido, três tentativas:

1. `parameters.viewport.defaultViewport` / `globals.viewport.value` — a
   largura real medida (`window.innerWidth`) ficou em 414×896
   independentemente do valor declarado.
2. `page.viewport(width, height)` de `@vitest/browser/context`, importado
   estático no topo do arquivo de história — lança
   `vitest/browser can be imported only inside the Browser Mode. Your test
   is running in browser pool.`
3. O mesmo import, dinâmico, dentro do `play` — o mesmo erro, no mesmo lugar.

O próprio código-fonte de `@vitest/browser/context` (versão instalada)
confirma: fora do modo nativo de navegador do Vitest, o pacote serve um
arquivo de _stub_ que sempre lança — "Vitest resolves 'vitest/browser' as a
virtual module instead". `@storybook/addon-vitest` roda sob um pool próprio
("browser pool", via `storybookTest()`), não sob `test.browser.enabled` do
próprio Vitest, e por isso nunca aciona a substituição do módulo virtual. O
código-fonte do complemento confirma o mesmo efeito por dentro: sua função
`setViewport` importa `@vitest/browser/context` dentro de um `try/catch` que
vira no-op silencioso quando a importação lança — a mesma causa, sem erro
visível para quem só lê o resultado do parâmetro.

**Por que ficou aberto:** bate com um par de peer dependency já registrado e
aceito neste repositório — `@storybook/addon-vitest@10.6.0` declara par com
`vitest@"^3.0.0 || ^4.0.0"` e `@vitest/browser-playwright@^4.0.0`; este
repositório roda `vitest@5.0.1` de propósito (D4, `lucide-react`). Consertar
isso é mudar a versão de uma dependência de teste em todo o pacote, risco
maior que o de uma tarefa que só precisava de uma história a mais — não é
decisão para um ciclo que só precisa mostrar um gatilho atrás de um
breakpoint.

**Consequência medida:** `interface-atomic-structure`, tarefa 7.3, prova o
gatilho do hambúrguer por comportamento verificável sem largura real —
`aria-controls`, `aria-expanded` alternando pelo clique, `nav` aparecendo e
sumindo da árvore de acessibilidade — mas não prova visibilidade do gatilho
nos dois lados do breakpoint em janela real. A regra CSS
(`app-frame.module.css`, `@media (--screen-md)`) continua escrita.

**Gatilho:** o par de `@storybook/addon-vitest` e `vitest` alinhado (para
cima ou para baixo), ou outro mecanismo de redimensionamento real de
viewport dentro de uma história provado por execução — não por leitura de
documentação —, o que vier primeiro.

---

## 20. Ciclo aplicado sem arquivamento não é pego por nada hoje

**O que é:** medido em `button-variants` — 22/22 tarefas feitas e código
mergeado (PR #184), e a mudança continuou em `openspec/changes/` como ativa,
sem ser arquivada, até este ciclo (`docs/archive-button-variants`) a
fechar. Os dois spec deltas (`interface-atoms`, `design-tokens`) nunca
chegaram às specs vivas nesse intervalo: `interface-atoms` viva tinha três
requisitos, nenhum sobre desabilitado, tamanho, pendência ou `Spinner`;
`design-tokens` viva não mencionava `text.control` nem
`color.action.disabled` — apesar do código já usar os dois há dias.

**Por que ficou aberto:** `openspec validate` e `openspec list` não
reclamam de uma mudança com todas as tarefas concluídas parada em
`changes/`. Não há verificação, em `pnpm verify` ou no próprio `openspec`,
que note a divergência entre "tarefas 100% feitas" e "specs vivas
desatualizadas" — a lacuna só apareceu porque alguém foi procurar; sem
isso, código e documentação viva divergem em silêncio por tempo
indefinido.

**Gatilho:** o próximo ciclo, qualquer um, como item de fechamento
obrigatório — antes de propor uma mudança nova, confirmar que a anterior
com tarefas completas já foi arquivada; se não foi, arquivar antes de
propor.

---

## Fechados

- **12. Dois guardiões leem `next-env.d.ts`** — fechado pelo PR que arrumou a
  verificação. `style-literals` e `type-suppression` deixaram de pular
  diretório de artefato pelo nome e passaram a filtrar pelo que o versionamento
  ignora, a mesma fonte que as etapas de formatação e de lint já usavam, em
  `tools/checks/versioning.ts`. `git check-ignore` sem responder reprova, em vez
  de o silêncio ser lido como "nada ignorado".
- **13. A prova da etapa de tipos acompanha a construção de `apps/backoffice`** —
  fechado pelo mesmo PR, sem esperar a segunda aplicação, pela mesma razão que
  fechou o ponto 11: o gatilho dependia de alguém lembrar. Os artefatos exigidos
  passaram a ser derivados de `apps/` em vez de lista fixa, então a segunda
  aplicação faz a prova reprovar nomeando o artefato que falta. Onde a prova
  mora com duas aplicações continua sendo decisão do ciclo que trouxer a
  segunda; o que não depende de memória é o aviso.
- **14. O portão pode aprovar tendo rodado menos testes do que existe** —
  fechado pelo mesmo PR. `--passWithNoTests` saiu de `verify:test`: nenhum
  projeto do Vitest dependia da bandeira, e sem ela arquivo que colete zero
  teste e projeto que colete zero arquivo reprovam. **Medição:** `pnpm verify`
  passa inteiro sem a bandeira.
- **2. Mapeamento de rota aninhada para arquivo emitido** — fechado pelo ciclo
  `dynamic-route-readiness`. Não virou regra: cada documento é declarado pelo
  caminho exato em que a construção o emite, e a trava de documentos nomeia o
  caminho quando uma rota entra ou uma versão do Next o move. O mapeamento
  observado está em `docs/decisao-prova-de-comportamento-de-aplicacao.md`.
- **3. Falso positivo da regra de importação, a partir de profundidade 2** —
  fechado pelo ciclo `dynamic-route-readiness`. `apps/backoffice` ganhou o
  apelido `@/*` por `paths`, sem `baseUrl`; a regra de `apps/**` foi repartida
  em três grupos, a travessia relativa a partir de dois níveis passou a apontar
  o apelido, e o apelido passou a ser proibido de conter `..` — o que fechou
  `@/../outra/app/z`, que passava.
- **4. `next-env.d.ts` fica fora de `.next/`** — fechado pelo ciclo
  `verification-coverage`. O requisito "Artefato de construção não é conteúdo
  verificado" deixou de falar só do diretório de artefatos: as etapas de tipos,
  de formatação e de lint não leem arquivo que o versionamento ignora, dentro
  ou fora de `.next/`. Formatação e lint passaram a usar o ignore do
  versionamento no Biome, e `next-env.d.ts` saiu das duas. A checagem de tipos
  ganhou prova sobre o que lê, em `apps/backoffice/tests/type-stage-inputs.test.ts`.
  **Correção medida:** o texto deste ponto dizia que o `exclude` "faz trabalho
  real" e que `verify:types` passa "não porque uma bandeira esconde o erro". A
  primeira frase vale para o que a etapa lê: sem o `exclude`, a checagem de
  `apps/backoffice` lê `next-env.d.ts`, `.next/types/routes.d.ts` e
  `.next/types/root-params.d.ts`. A segunda não vale para o veredito: sem o
  `exclude`, o `tsc` passa com ou sem `.next`, porque duas configurações
  escondem o erro — importação de efeito colateral sem
  `noUncheckedSideEffectImports`, e `skipLibCheck`.
- **6. Um anel de foco deve ser a cor de ação?** — fechado pelo ciclo
  `dynamic-route-readiness`, por medição e não por decisão de gosto. A objeção
  era que um anel no mesmo matiz do texto que ele cerca se distingue só pela
  forma. Ela partia de uma premissa falsa: o anel nunca é adjacente ao texto.
  `outline-offset` vale `--space-1`, 2px, e a âncora não tem fundo próprio, de
  modo que entre texto e anel há 2px de superfície. O anel contra a superfície —
  sua única cor adjacente — dá 6,316:1 no tema escuro e 12,210:1 no claro,
  contra piso de 3:1 de objeto gráfico. A separação é feita pela lacuna, não
  pela cor do anel. A leitura foi confirmada na bancada pelo dono do
  repositório, nos dois temas: anel e texto lêem como duas coisas.
  **Reabre se** `outline-offset` for removido ou passar a `--space-0` em
  qualquer uso do anel — aí texto e anel ficam adjacentes a 1,380:1 e a objeção
  volta a valer. Nenhuma checagem cobre isso hoje.
- **11. O guardião de fixture não cobre `apps/`** — fechado pelo ciclo
  `verification-coverage`, sem esperar a primeira fixture: o gatilho deixava a
  cobertura dependendo de alguém lembrar de estender o guardião no PR dela.
  `tools/checks/fixture-origin.test.ts` varre `apps/*` e `packages/*` inteiros
  e pula `.next`, como os outros guardiões de perímetro. A regra que ele aplica
  passou a requisito vivo: "Fixture com origem declarada em todo o perímetro",
  em `workspace-verification`.
- **7. "Uma escala por gráfico" abrange o canal de tamanho?** — perdido por
  construção, fechado por `remove-domain-capabilities`. **Não é resposta à
  pergunta original:** o canal de tamanho continua sem decisão, e bolha
  continua sem construir. O que fechou o ponto foi a forma nova do ponto do
  gráfico, `{ category, value, fill? }` — sem `measure` por série, não há mais
  como uma série declarar uma segunda escala, e o requisito em que a pergunta
  se apoiava ("Uma escala por gráfico") deixou de ter o que provar, em
  qualquer capacidade. Se uma forma "bolha" um dia precisar de uma segunda
  magnitude codificada em tamanho, a pergunta volta, presa a um requisito
  novo e específico daquela forma — não a este, que não existe mais.
- **15. A bancada não emula `prefers-reduced-motion` no navegador** —
  fechado por decisão do dono, na aplicação de `button-variants`. **Recusado,
  não adiado: sem gatilho de reabertura.** O requisito "Spinner respeita
  preferência de movimento reduzido" foi removido do delta de
  `interface-atoms` — a bancada não prova o caso "com a preferência" (ver a
  medição que motivou o registro original deste ponto, abaixo), e o dono
  decidiu não perseguir a prova, não adiá-la para um gatilho. A regra CSS
  (`@media (prefers-reduced-motion: reduce)` em `spinner.module.css`)
  **permanece** — é comportamento correto, e a ausência de requisito que a
  cubra não é indício de código órfão. **Medição que motivou o registro
  original:** importar `@vitest/browser/context` dentro de `play`, nesta
  bancada, reprova com "vitest/browser can be imported only inside the
  Browser Mode" — `@storybook/addon-vitest@10.6.0` declara peer
  `vitest@^3.0.0 || ^4.0.0`, e o repositório fixa `vitest@5.0.1`.
