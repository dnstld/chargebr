# Pontos abertos

**Atualizado em:** 25 de setembro de 2026, no arquivamento do ciclo
`dynamic-route-readiness`
**Estado do repositório:** 7 capacidades vivas, 72 requisitos, 9 ciclos
arquivados, nenhum change ativo; piloto do extrator ABVE v1 validado. 8 pontos
abertos; o ciclo `dynamic-route-readiness` fechou 3 e abriu 2

## O que este arquivo é

O registro dos pontos que os ciclos deixaram em aberto **de propósito**. Nenhum
é bloqueio, nenhum foi preenchido por suposição, e cada um tem um gatilho: a
condição que obriga a retomá-lo.

Um ponto sai daqui quando um ciclo o fecha, e o ciclo que o fecha cita o número.
Um ponto novo entra com gatilho — sem gatilho, não é ponto aberto, é esquecimento
com nome bonito.

Quatro deles (1, 4, 10 e 11) atingem o próximo ciclo que criar rota de negócio.
Vale ler os quatro antes de propor esse ciclo.

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

## 4. `next-env.d.ts` fica fora de `.next/`

**O que é:** o requisito de `workspace-verification` fala do diretório de
artefatos de construção. `next-env.d.ts` é gerado pela construção, importa
`./.next/types/routes.d.ts`, e mora fora de `.next/`. A redação não o cobre
literalmente.

**O que já está feito:** o arquivo está no `.gitignore` e no `exclude` do
`tsconfig.json` da aplicação — e o `exclude` faz trabalho real, porque o
`include` tem `"*.ts"`, que casa com um `.d.ts`. `verify:types` passa numa árvore
sem `.next` porque o `tsc` não lê o arquivo, não porque uma bandeira esconde o
erro.

**O que continua aberto:** a redação do requisito é mais estreita que a intenção,
que é *o estágio de tipos não depende do que a construção gera*. Do jeito que
está, o próximo arquivo gerado fora de `.next/` passa despercebido.

**Gatilho:** o próximo arquivo gerado fora de `.next/`, ou o próximo ciclo que
tocar `workspace-verification`. Entra como requisito MODIFICADO, com proposta —
não como edição de spec.

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

## 8. O extrator ABVE cobre somente um caso vivo

**O que é:** o extrator ABVE v1 foi validado com o item WordPress `19617`, uma
afirmação mensal de emplacamentos BEV já representada pela carga canônica `0003`.
Ele não demonstrou generalização para outra estrutura editorial, sujeito,
unidade, período, geografia ou resultado de revisão.

**Por que ficou aberto:** um único resultado correto prova o piloto, não uma
gramática geral das publicações ABVE. Ampliar a regra agora transformaria
hipóteses em contrato.

**Gatilho:** uma necessidade concreta de extrair outro item ABVE. O novo ciclo
deverá selecionar casos antes de implementar e demonstrar ao menos um resultado
positivo e um `no_candidates` vivo, sem reduzir as garantias do piloto.

**Onde está registrado:**
`docs/decisao-pos-ensaio-extrator-abve-v1.md`.

---

## 9. Persistência de candidatos ainda não tem caso que a exija

**O que é:** candidatos e revisão existem apenas como artefatos locais privados.
Não há tabela para candidato, decisão humana ou histórico de correção.

**Por que ficou aberto:** o único ensaio vivo terminou em `link_existing`. Nada
novo precisava ser persistido, e os estados `accept_new`, `correct` e `reject`
ainda não foram exercitados num caso real. Modelar agora exigiria supor autoria,
transições, retenção, concorrência e relação com o canônico.

**Gatilho:** o primeiro candidato vivo cuja decisão ou histórico não possa ser
preservado com segurança em artefato local privado. A modelagem deverá começar
pelo caso e separar candidato de dado canônico antes de qualquer migration.

**Onde está registrado:**
`docs/decisao-pos-ensaio-extrator-abve-v1.md`.

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

## 11. O guardião de fixture não cobre `apps/`

**O que é:** `tools/checks/fixture-origin.test.ts` varre só `packages/ui/src`.
Uma fixture criada sob `apps/` nasceria fora do guardião, sem que a falta de
origem declarada reprovasse.

**Por que ficou aberto:** nenhuma fixture existe sob `apps/`. A rota de prova
`/prova/[id]` não exibe dado, e por isso não tem fixture; estender o perímetro
sem caso a verificar seria guardião sem objeto.

**Gatilho:** a primeira fixture sob `apps/`. O ciclo que a criar estende o
perímetro do guardião no mesmo PR.

**Onde está registrado:** proposta do ciclo `dynamic-route-readiness`, em
"Lacunas registradas".

---

## Fechados

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
