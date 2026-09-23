# Pontos abertos

**Atualizado em:** 23 de setembro de 2026, ao fim do primeiro objetivo
**Estado do repositório:** 7 capacidades vivas, 70 requisitos, 8 ciclos
arquivados, nenhum change ativo

## O que este arquivo é

O registro dos pontos que os oito primeiros ciclos deixaram em aberto **de
propósito**. Nenhum é bloqueio, nenhum foi preenchido por suposição, e cada um
tem um gatilho: a condição que obriga a retomá-lo.

Um ponto sai daqui quando um ciclo o fecha, e o ciclo que o fecha cita o número.
Um ponto novo entra com gatilho — sem gatilho, não é ponto aberto, é esquecimento
com nome bonito.

Quatro deles (1, 2, 3 e 4) atingem o próximo ciclo que criar rota de negócio.
Vale ler os quatro antes de propor esse ciclo.

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

**Onde está registrado:** `docs/decisao-prova-de-comportamento-de-aplicacao.md`.

---

## 2. Mapeamento de rota aninhada para arquivo emitido

**O que é:** a camada 2 lê o HTML que `next build` emite. O caminho desse arquivo
para a rota raiz foi observado e registrado. Para rota aninhada, não.

**Por que ficou aberto:** o ciclo 8 emitiu uma rota só. Declarar o padrão a
partir de um caso seria supor.

**Gatilho:** a primeira rota aninhada. O ciclo que a criar observa o caminho
emitido e o registra antes de declarar qualquer coisa sobre ele.

**Risco associado:** `.next/server/app/*.html` é caminho interno ao Next e pode
mudar de versão. A mitigação já está no código: o teste **reprova** quando o
artefato não existe, nunca pula — ver
`apps/backoffice/tests/emitted-document.test.ts`, função `readEmitted`.

---

## 3. Falso positivo da regra de importação, a partir de profundidade 2

**O que é:** o bloco `apps/**` de `biome.json` bane o grupo
`["**/apps/**", "../../**", "../../../**", "../../../../**"]`. Os padrões
relativos existem porque `**/apps/**` nunca dispara de dentro de uma aplicação —
uma irmã se escreve `../../outra/...`.

O efeito colateral: um arquivo em `app/a/b/` alcança a raiz do próprio app com
`../../`, e isso está banido. A reprovação indevida começa em **profundidade 2**.

**Por que importa mais do que parece:** `app/<rota>/[id]/page.tsx` já é
profundidade 2, e um back office é feito de páginas `[id]`. Não é a primeira
rota aninhada que dispara — é o primeiro segmento dinâmico. E é um falso
positivo que **bloqueia código legítimo**, o que se lê como "o lint está
quebrado" em vez de "a regra está dizendo algo".

**A saída, quando chegar:** apelido de caminho, não afrouxamento. O
`tsconfig.json` de `apps/backoffice` não tem `paths`; acrescentar
`"@/*": ["./*"]` faz a aplicação importar o próprio interior sem travessia
relativa, e o falso positivo deixa de existir com a regra intacta.

**Gatilho:** o primeiro segmento dinâmico ou qualquer arquivo em profundidade 2
sob `app/`.

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

## 6. Um anel de foco deve ser a cor de ação?

**O que é:** o ciclo 7 fixou, por requisito, que `color.focus.ring` resolve para
o mesmo primitivo de `color.action.primary` em cada tema. A razão foi **negativa**:
deixar o anel em `indigo.400` em volta de texto `indigo.300` produziria dois
índigos a **1,380:1** um do outro, diferença que se lê como falha de renderização
e não como escolha.

**O que continua aberto:** isso justifica preservar o invariante; não o eleva a
princípio. Um indicador de foco no mesmo matiz do texto que ele cerca é mais
fraco que um que contrasta com ele — um anel `indigo.300` em volta de texto
`indigo.300` só se distingue pela forma, nunca pela cor.

**Por que não foi respondido:** responder exige um componente com foco visível
para medir, e o ciclo 7 não criou nenhum.

**O que a resposta mudaria:** trocar o requisito de invariante por um requisito
de contraste entre anel e conteúdo. Aí o valor de `focus.ring` deixa de ser
consequência de `action.primary` e passa a ser decisão própria — e o piso de 3:1
de objeto gráfico, que hoje não pode reprovar sozinho, vira restrição viva.

**Onde está registrado:** Open Questions em
`openspec/changes/archive/2026-09-22-dark-action-color/design.md`.

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
