# Pontos abertos

**Atualizado em:** 30 de setembro de 2026, no arquivamento de
`close-open-points`
**Estado do repositório:** 7 capacidades vivas, 15 ciclos arquivados,
nenhum change ativo. **Nenhum ponto aberto**

## O que este arquivo é

O registro dos pontos que os ciclos deixaram em aberto **de propósito**. Nenhum
é bloqueio, nenhum foi preenchido por suposição, e cada um tem um gatilho: a
condição que obriga a retomá-lo.

Este registro cobre **a frente de interface e nada mais**. A frente de coleta tem
processo próprio e os pontos dela não moram aqui.

Um ponto sai daqui quando um ciclo o fecha, e o ciclo que o fecha cita o número,
ou quando um ciclo o reclassifica para fora deste registro — ver
"Reclassificados", abaixo — porque nunca foi dívida de interface. Um ponto novo
entra com gatilho — sem gatilho, não é ponto aberto, é esquecimento com nome
bonito.

Os números não são reaproveitados: um ponto fechado ou reclassificado deixa o
seu vago, e as listas no fim dizem qual ciclo o tirou daqui, e por quê.

`tools/checks/change-lifecycle.test.ts` lê este arquivo contra toda mudança
arquivada que declare fechar um ponto: se este registro ainda listar como
aberto um ponto que uma mudança arquivada já declarou fechado,
`pnpm verify` reprova nomeando os dois (pontos 17 e 20, fechados por
`close-open-points`, abaixo). Por isso o arquivamento de
um ciclo e a atualização deste arquivo para o que esse ciclo fecha
precisam estar no mesmo commit — nunca um antes do outro.

---

## Reclassificados

Os números abaixo não fecharam por trabalho — saíram porque nunca foram
dívida de interface. Continuam vagos, como qualquer ponto fechado.

- **1. A camada 3 não existe** e **10. A forma mista é recusada, não
  resolvida** e **18. `NavPanel` construído, sem rota de negócio para
  religar** — reclassificados por `close-open-points` (arquivado em
  2026-09-30) para `docs/forma-do-produto.md`, seção "Pontos técnicos
  reclassificados". Nenhum dos três foi resolvido, e nenhum ciclo de
  interface os fecha sozinho: cada um depende de uma decisão sobre a
  forma do produto — eixo de separação de aplicações, quando a rota de
  negócio nasce — que só a fase de desenho toma. Texto e gatilho de cada
  um estão preservados por inteiro no arquivo novo.

## Fechados

- **5. Três requisitos de `design-tokens` misturam obrigação e razão** —
  fechado por `tokens-obligation-form` (arquivado em 2026-09-26), não por
  `close-open-points`. Medido na aplicação deste ciclo: o delta de
  `tokens-obligation-form` reescreveu os três requisitos — corpo só com
  obrigação, razão em `**Por quê:**`, as quatro frases que decidiam piso
  sem `SHALL` viradas em obrigação explícita —, e a própria proposta
  daquele ciclo termina com "Fecha o ponto 5 de
  `docs/pontos-abertos.md`". O registro nunca foi atualizado: nenhum
  commit do arquivamento daquele ciclo tocou este arquivo. `close-open-points`
  corrige só o registro, com este parágrafo, fora do padrão do resto
  desta lista (registros mudam no arquivamento do ciclo que fecha o
  ponto): o guardião novo daquele mesmo ciclo
  (`tools/checks/change-lifecycle.test.ts`) lê este arquivo e reprova
  `pnpm verify` enquanto o ponto 5 continuar listado como aberto — a
  correção precisa entrar na aplicação, não pode esperar o arquivamento,
  ou o portão fica vermelho entre os dois PRs.
- **16. Histórias que provam garantia com asserção tautológica** —
  fechado por `close-open-points`, como critério de revisão, sem
  guardião mecânico — a forma final registrada no design daquele ciclo,
  não um adiamento. O requisito "Asserção prova o comportamento, não o
  ambiente" entrou em `verification-bench`: uma asserção que alega
  provar uma garantia é revisada contra mutação mínima do comportamento
  que ela alega provar — se a asserção continuaria passando com o
  comportamento quebrado, ela não prova nada, e a revisão nomeia a
  mutação. As ocorrências 3 (`contrast.test.ts`), 4 (`Desabilitado`) e 5
  (`AtributosDeControle`) continuam sem correção — não fazem parte deste
  fechamento, e ficam como evidência que motivou o requisito, não como
  pendência dele.
- **17. `openspec validate --strict` aprova mudança sem `design.md` nem
  `tasks.md`** — fechado por `close-open-points`.
  `tools/checks/change-lifecycle.test.ts` é o substituto que este
  repositório controla: toda mudança ativa sob `openspec/changes/`, fora
  de `archive/`, precisa ter `proposal.md`, `design.md` e `tasks.md`, e a
  ausência de qualquer um reprova `pnpm verify` nomeando a mudança e o
  artefato que falta. A lacuna na ferramenta de terceiro
  (`@fission-ai/openspec`) continua existindo e não é nosso lugar
  consertar — o que fecha este ponto é ter um guardião próprio que não
  depende dela.
- **19. O harness de viewport da bancada não redimensiona de verdade** —
  fechado por `close-open-points`, por medição nova, não pelo par de
  dependência antes registrado. A causa real nunca foi o "browser pool"
  do complemento do Storybook: era o especificador de importação.
  `@vitest/browser/context` é stub estático fora do modo nativo do
  Vitest; `"vitest/browser"` é o que o Vitest substitui de verdade sob
  `browser.enabled`. Um projeto novo (`viewport`, em
  `packages/ui/vitest.config.ts`), sem `storybookTest`, mede o gatilho
  do `AppFrame` alcançável 1px abaixo do breakpoint e inalcançável 1px
  acima, localizado por papel e nome acessível
  (`page.getByRole("button", { name: "Abrir menu" })`) — testar
  exatamente em cima do valor do breakpoint (768px) reprovou por timeout
  (arredondamento de viewport real), por isso 767/769. Contraprova: com
  a regra CSS do breakpoint removida por plantio, a prova reprova;
  revertida, volta a passar — não é tautológica.
- **20. Ciclo aplicado sem arquivamento não é pego por nada hoje** —
  fechado por `close-open-points`, pela outra metade do mesmo guardião
  do ponto 17: mudança ativa sob `openspec/changes/` com `tasks.md`
  100% marcado reprova `pnpm verify`, nomeando a mudança — a divergência
  que em `button-variants` só apareceu porque alguém foi procurar agora
  reprova sozinha. **Medido no próprio arquivamento deste ciclo:** com
  `close-open-points` já movido para `archive/` e este registro ainda
  não atualizado, uma terceira checagem do mesmo guardião — mudança
  arquivada que declara fechar um ponto, comparada contra o que este
  arquivo ainda lista como aberto — reprovou nomeando o próprio
  `close-open-points` e os pontos 16, 17, 19 e 20 (mensagem exata em
  `openspec/changes/archive/2026-09-30-close-open-points/tasks.md`,
  tarefa 6.6). É a prova de que este ponto morreu de verdade: o primeiro
  ciclo em que o guardião existia para pegá-lo, pegou.
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
