# Tasks

## 1. O tom apagado se parte em dois

- [x] 1.1 Em `packages/tokens/tokens/semantic/shared.json`: `color.nav.text-muted` passa a `{color.gray.400}` e nasce `color.nav.glyph` com `{color.gray.500}`, cada um com `$description` dizendo o papel e o piso que ele cumpre. Verificar com `pnpm --filter @chargebr/tokens build` gerando os dois e `rules.test.ts` passando (camadas e temas).
- [x] 1.2 Apontar os três consumidores de objeto gráfico para o token novo: `nav-folder-trigger.muted`, `nav-leaf.dot` e `nav-rail-item.color` passam a `{color.nav.glyph}`. Verificar com `grep` por `color.nav.text-muted` nos arquivos de componente retornando vazio, e as histórias de pasta, folha e trilha passando sem alteração de asserção — a cor na tela é a mesma de hoje.

## 2. A checagem mede cada token, com o piso do papel

- [x] 2.1 Reescrever a montagem dos pares em `packages/tokens/src/nav-contrast.test.ts`: cada cor de texto (`text`, `text-strong`, `text-muted`, `current-text`) contra as superfícies em que aparece, ao piso de 4,5:1; cada objeto gráfico (`glyph`, `accent`) ao piso de 3:1; `hover` entra como superfície do estado sobre ponteiro. Verificar com o arquivo passando e a matriz afirmada valor a valor.
- [x] 2.2 Acrescentar a prova de cobertura: todo `color.nav.*` da fonte resolvida precisa aparecer em algum par declarado, e a falha nomeia o token sem par. Verificar plantando um token novo em `shared.json` sem par correspondente, confirmando que a checagem reprova nomeando-o, e revertendo o plantio.
- [x] 2.3 Confirmar que o plantio de valor continua reprovando com par, razão e piso nomeados, agora também para um par de texto — plantar `color.nav.text-muted` de volta em `{color.gray.500}`, conferir a mensagem com 3,780:1 contra o painel e o piso de 4,5:1, e reverter.
- [x] 2.4 Confirmar que `contrast.test.ts` (por tema) continua passando sem alteração e que nenhum `color.nav.*` aparece nas listas que ela descobre. Verificar executando o pacote de tokens inteiro.

## 3. Os dois ajustes contra a maquete

- [x] 3.1 Em `packages/ui/src/organisms/app-frame/app-frame.module.css`, limitar a altura da marca dentro de `.frame[data-shape="shell"]`, sem tocar nenhuma regra fora desse seletor. Verificar com a história da tela da maquete e com `apps/backoffice/tests/emitted-document.test.ts` continuando verde — a moldura sem trilha nem navegação não muda.
- [x] 3.2 Em `NavLeaf`, a página sem marcador passa a renderizar um vão do tamanho do chevron (`1em`), alinhando o rótulo de primeiro nível com os das pastas irmãs. Verificar com história que compara a posição horizontal do rótulo de uma página de primeiro nível com a de um rótulo de pasta irmã, na mesma árvore.
- [x] 3.3 Conferir as duas correções na bancada contra `docs/maquete-navegacao.html`, nos dois temas, com a checagem de acessibilidade executada e sem violação.

## 4. Portão

- [x] 4.1 Executar `pnpm verify` e confirmar os quatro estágios verdes. Verificar pela saída do comando, código de saída zero.
- [x] 4.2 Conferir que nenhum arquivo sob `apps/` mudou. Verificar com `git diff --stat main -- apps` vazio.

## 5. Correções da revisão do PR 2

Revisão do dono em #205: `color.nav.edge` estava declarado como superfície e é
borda nos cinco usos — par declarado contra adjacência que não existe na tela.
Passou porque `edge` e `hover` são o mesmo cinza, e o par que de fato limita a
moldura ficou sem declaração.

- [x] 5.1 Tirar `edge` das listas de fundo e pôr `hover` onde a adjacência é real; acrescentar `glyph × hover` e `text × hover`. Verificar com a matriz afirmando `glyph × hover = 3.045` e o pior par passando a ser esse, com margem de 0,045.
- [x] 5.2 Declarar o papel de `edge` — divisor decorativo, isento do piso, motivo escrito com a medição (1,242:1 contra o painel, 1,333:1 contra a trilha) e a citação de WCAG 1.4.11. Verificar com a cobertura passando por isenção declarada, e não por o token estar estacionado numa lista.
- [x] 5.3 Acrescentar o guardião de adjacência (`tools/checks/nav-pair-adjacency.test.ts`): fundo de par declarado precisa ser pintado como `background` por algum componente, seguindo a cadeia de repasse de custom property; token isento precisa ser borda em algum lugar e fundo em nenhum. Verificar plantando `edge` de volta como superfície e conferindo a reprovação nomeando as cinco bordas, com plantio revertido.
- [x] 5.4 Registrar na `$description` de `color.nav.text-muted` que ele ficou sem consumidor — reserva do primeiro texto apagado da moldura —, e na de `edge` o papel de divisor isento. Verificar lendo as duas descrições na fonte gerada.
- [x] 5.5 Remover o comentário duplicado de `app-frame.module.css`. Verificar com `biome format` passando e o bloco aparecendo uma vez só.
- [x] 5.6 Acrescentar ao delta a regra checável — par declarado aponta para adjacência que existe no código — com os dois cenários de prova. Verificar com `openspec validate nav-frame-contrast --strict` passando.

## 6. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova uma mudança ativa com todas as
tarefas marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 6.1 Arquivar a mudança com sincronização da spec viva: mover `openspec/changes/nav-frame-contrast/` para `openspec/changes/archive/<data>-nav-frame-contrast/` e aplicar o delta de `design-tokens` em `openspec/specs/`. Verificar com `openspec validate --strict` passando sobre a spec viva e o requisito modificado contendo as duas obrigações novas.
- [ ] 6.2 Atualizar o cabeçalho de `docs/pontos-abertos.md` — data, estado do repositório e contagem de ciclos arquivados — no mesmo commit do movimento para `archive/`. Verificar com `tools/checks/change-lifecycle.test.ts` passando.
- [ ] 6.3 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro estágios verdes. Verificar pela saída do comando, código de saída zero.
