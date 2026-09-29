# Proposal

## Why

`docs/pontos-abertos.md` registra oito pontos abertos. Cinco têm o que
precisam para fechar por trabalho; três nunca foram dívida de interface e
foram registrados no arquivo errado. O objetivo deste ciclo é zerar o
arquivo — não zerar por decreto, mas porque cada ponto que sai tem, atrás de
si, ou um guardião novo, ou um requisito novo, ou uma medição que a proposta
anterior não tinha.

**Ponto 5 já está fechado, e o registro não sabe disso.** Medido nesta
proposta: o ciclo `tokens-obligation-form`
(`openspec/changes/archive/2026-09-26-tokens-obligation-form/`) reescreveu os
três requisitos de `design-tokens` — corpo só com obrigação, razão em
`**Por quê:**`, as quatro frases que decidiam sem `SHALL` viraram obrigação
explícita — e a própria proposta daquele ciclo termina com "Fecha o ponto 5
de `docs/pontos-abertos.md`". O histórico do arquivo
(`git log -- docs/pontos-abertos.md`) não tem nenhum commit do arquivamento
de `tokens-obligation-form` tocando nele: só o de `verification-coverage`,
arquivado no mesmo dia. A spec viva de `design-tokens`, lida agora, confirma
o texto do delta daquele ciclo, requisito por requisito. Não há frase sem
`SHALL` decidindo piso nos três requisitos — a única lead-in sem `SHALL`
("Não há mecanismo de isenção:") é seguida, no mesmo parágrafo, pela
obrigação que a decide, e a proposta de `tokens-obligation-form` já revisou
essa frase por frase e decidiu não reescrevê-la. Este ciclo não teria o que
fazer de novo sem reescrever conteúdo normativo que ninguém pediu para
reabrir — o que o ponto 5 original já registrava como o risco a evitar. O
trabalho deste ciclo para o ponto 5 é só a baixa no registro: mover o ponto
5 para "Fechados", citando `tokens-obligation-form`.

**Ponto 19 foi remedido, e a medição nova diverge da anterior.** O registro
diz que nem `parameters.viewport` nem `page.viewport()` de
`@vitest/browser/context` têm efeito, e atribui isso ao complemento do
Storybook rodar num "browser pool" próprio, fora do modo nativo de navegador
do Vitest. Uma sonda desta proposta isolou a variável: um projeto do Vitest
novo, sem `storybookTest`, com `browser.enabled: true` e
`@vitest/browser-playwright` — modo nativo, sem o complemento — ainda assim
lança o mesmo erro ao importar `@vitest/browser/context`. A causa não é o
"browser pool": é o especificador de importação. O próprio arquivo que
lança o erro contém o comentário "Vitest resolves 'vitest/browser' as a
virtual module instead" — `@vitest/browser/context` é o pacote publicado,
com stub estático para análise de tipos; `vitest/browser` é o especificador
que o Vitest substitui de verdade em tempo de execução, e só existe sob
`test.browser.enabled`. Trocando o import, a mesma sonda — moldura montada
direto, `nav` preenchido, `page.viewport()` chamado duas vezes — mede
`offsetParent` do gatilho `true` a 600px e `false` a 1024px: o breakpoint de
768px provado por largura real, nos dois lados. A sonda foi revertida por
inteiro; nada dela chega a este PR. O que fica é a medição, no design.

**Pontos 17 e 20 são a mesma ausência.** Nada verifica o estado das pastas
de `openspec/changes/`. Uma mudança ativa pode não ter `design.md` nem
`tasks.md` e `openspec validate --strict` aprova assim mesmo (ponto 17,
lacuna de ferramenta de terceiro, fora do nosso alcance consertar). Uma
mudança com todas as tarefas concluídas pode ficar parada em `changes/`
sem que nada reclame — foi o que aconteceu com `button-variants`, entre o
merge do código e o arquivamento (ponto 20). As duas lacunas se fecham com
um guardião só, no formato dos quatro que já existem em `tools/checks/`.

**Ponto 16 pede um requisito que provavelmente não tem prova mecânica.**
Medido em `button-variants`: cinco histórias/testes que provam uma garantia
escolheram argumentos, estado de ambiente ou localizador sob os quais a
asserção passa independentemente de o comportamento existir. "Os argumentos
desta história tornam a afirmação vazia" não é uma propriedade que um
guardião estático alcance — é uma propriedade do desenho do teste contra o
espaço de mutações do comportamento que ele alega provar, e depende de saber
o que o teste quis provar, não só o que ele executa. Este ciclo escreve o
requisito como critério de revisão. É a forma final, registrada como tal no
design — não uma promessa de mecanizar depois.

## What Changes

- **Guardião novo, `tools/checks/change-lifecycle.test.ts`**, com três
  checagens. Duas para os pontos 17 e 20: toda mudança ativa em
  `openspec/changes/` (fora de `archive/`) tem `proposal.md`, `design.md`
  e `tasks.md`; nenhuma mudança ativa tem 100% das tarefas de `tasks.md`
  marcadas. A terceira, acrescentada depois de revisão do dono do
  repositório: uma mudança arquivada cujo `proposal.md` declare fechar um
  ponto de `docs/pontos-abertos.md` reprova se esse número ainda constar
  como aberto no registro — o próprio defeito que o achado do ponto 5
  expôs, agora coberto (`design.md` tem o padrão textual medido nas 14
  mudanças arquivadas e o desenho da comparação). `archive/` é ignorado
  pelas duas primeiras checagens, e é exatamente o que a terceira varre.
- **`workspace-verification` — "Perímetro isolado" se inverte.** O texto
  hoje ("SHALL cobrir exclusivamente `apps/*` e `packages/*`") descreve
  uma inclusão que nada aplica — os quatro guardiões existentes montam
  caminho a partir da raiz e escolhem seu próprio perímetro, sem mecanismo
  estrutural algum restringindo a `apps/*`/`packages/*`. O único cenário
  do requisito sempre protegeu outra coisa: a árvore herdada da frente de
  coleta. O requisito passa a dizer só isso — exclusão nomeada de `src/`,
  `tests/`, `data/`, `queries/`, `supabase/` —, e `openspec/changes/` deixa
  de ser assunto dele por nunca ter sido proibido, não por uma lista de
  permissão alargada. Nenhum dos quatro guardiões existentes muda de
  alcance.
- **`verification-bench` ganha "Asserção prova o comportamento, não o
  ambiente"** (ponto 16): toda história ou teste que alega provar uma
  garantia é revisado contra mutação do comportamento que alega provar — se
  a asserção passa com o comportamento quebrado, ela não prova nada. Prova
  por revisão nomeada, não por execução; o design registra por que.
- **`backoffice-shell` ganha um cenário novo** no requisito "Moldura expõe
  um gatilho de navegação opaco, sem estado próprio" (ponto 19): o gatilho
  é alcançável abaixo do breakpoint declarado e deixa de ser acima dele,
  provado por um projeto do Vitest em modo nativo de navegador que
  redimensiona a janela de verdade. A regra CSS não muda; ela ganha a
  prova que não tinha.
- **Reclassificação, sem trabalho de engenharia:** os pontos 1 (camada 3 de
  prova), 10 (forma mista de renderização) e 18 (NavPanel sem rota) saem de
  `docs/pontos-abertos.md` e entram em `docs/forma-do-produto.md`, texto e
  gatilho preservados. Não são dívida de interface — são o produto ainda
  não decidido, e `forma-do-produto.md` existe exatamente para isso.
- **`docs/pontos-abertos.md` fica sem ponto aberto**, cabeçalho refletindo
  isso. Esta edição, como a de `forma-do-produto.md`, acontece no
  arquivamento (`docs/archive-close-open-points`), não nesta proposta —
  mesmo padrão de `verification-coverage` e `button-variants`: o registro
  se atualiza quando o trabalho que o fecha está mergeado, não antes.

## O que esta mudança não faz

- **Não reescreve nenhum requisito de `design-tokens`.** O ponto 5 já foi
  reescrito por `tokens-obligation-form`; esta mudança só corrige o
  registro. Nenhum piso, superfície ou token muda.
- **Não corrige as ocorrências 3, 4 e 5 do ponto 16** (`contrast.test.ts`,
  `Desabilitado`, `AtributosDeControle`) — o requisito novo as nomeia como
  evidência que motivou o requisito; reescrevê-las é trabalho à parte, não
  pedido aqui, e mudaria comportamento de teste sem revisão própria.
- **Não liga `--strict` nem qualquer outra correção em
  `@fission-ai/openspec`** — é ferramenta de terceiro (ponto 17 permanece
  registrado nesse sentido: o guardião novo é nosso substituto, não um
  patch na ferramenta).
- **Não decide o eixo de separação de aplicações**, nem cria rota de
  negócio, nem liga `NavPanel` a `apps/backoffice` — é exatamente o
  trabalho que os pontos 1, 10 e 18 continuam esperando, agora em
  `forma-do-produto.md`.
- **Não altera nenhum componente visual nem token.** O único componente
  tocado (`AppFrame`) ganha uma prova nova sobre comportamento que a regra
  CSS já tem; nenhum arquivo `.tsx` ou `.module.css` de produção muda.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workspace-verification`: "Perímetro isolado" se inverte (exclusão
  nomeada da árvore herdada, não inclusão de `apps/*`/`packages/*`); três
  requisitos novos para o guardião do ciclo de vida de mudanças OpenSpec.
- `verification-bench`: um requisito novo, "Asserção prova o comportamento,
  não o ambiente".
- `backoffice-shell`: o requisito "Moldura expõe um gatilho de navegação
  opaco, sem estado próprio" ganha um cenário novo.

## Impact

- **Código:** `tools/checks/change-lifecycle.test.ts` (novo). Um projeto de
  Vitest novo em `packages/ui/vitest.config.ts`, fora do `storybookTest`, e
  um arquivo de teste de viewport em
  `packages/ui/src/organisms/app-frame/`. `packages/ui/package.json` ganha
  `@vitest/browser@5.0.1` como dependência explícita — o pnpm estrito não
  expõe pacote transitivo, e `vitest/browser` precisa dele resolvido a
  partir do próprio pacote.
- **Specs vivas:** `workspace-verification`, `verification-bench`,
  `backoffice-shell` sincronizadas no arquivamento.
- **Registros:** `docs/pontos-abertos.md` fica sem ponto aberto;
  `docs/forma-do-produto.md` ganha três itens, com o texto e o gatilho de
  cada um preservados do registro anterior.
- **Intocados:** `@chargebr/tokens` inteiro; todo componente visual de
  `@chargebr/ui`; os quatro guardiões existentes, sem mudança de alcance;
  `src/`, `tests/`, `data/`, `queries/`, `supabase/`.
- **Condicional, registrado no design:** o cenário novo de
  `backoffice-shell` e o requisito de `verification-bench` sobre viewport
  real só entram se a sonda desta proposta se confirmar na aplicação, sob
  as mesmas versões de `vitest`/`@vitest/browser-playwright`/`vite` já
  fixadas no workspace. Se algo divergir na aplicação, o ponto 19
  permanece aberto com a medição nova, e a spec delta correspondente sai
  do change antes do PR de aplicação — não fica meio aplicada.
