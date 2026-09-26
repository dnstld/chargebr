# Pontos abertos

**Atualizado em:** 26 de setembro de 2026, no PR que arrumou a verificação
**Estado do repositório:** 7 capacidades vivas, 73 requisitos, 10 ciclos
arquivados, nenhum change ativo. **4 pontos abertos**

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

## 7. "Uma escala por gráfico" abrange o canal de tamanho?

**O que é:** o ciclo 6 não construiu as formas bolha e mapa. Mapa não era exigido
por requisito nenhum. Bolha é diferente: ela codifica uma segunda magnitude no
**tamanho da marca**, e isso colide com o requisito de uma escala por gráfico.

**Por que ficou aberto:** construir bolha exige decidir antes se "escala" abrange
o canal de tamanho ou só o canal de valor. Essa decisão não existe e não foi
suposta.

**Gatilho:** a primeira exigência que peça bolha, ou qualquer forma que codifique
uma segunda magnitude num canal que não seja a posição.

**Nota:** a classe todos-contra-todos da verificação de paleta já está coberta
por dot e small-multiples, então não há lacuna de cobertura — só de forma.

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
