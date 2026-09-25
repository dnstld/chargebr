# Tarefas — o que quebra na primeira rota dinâmica

Ordem: observar antes de declarar (ponto 2). Depois o apelido e a regra de
importação, porque a rota de prova depende deles. Depois a rota de prova,
**antes** da camada 2 nova, para que o Defeito B fique registrado contra a trava
antiga. Por último a camada 2, que afirma sobre o que a construção produz.

## 1. Observação, antes de qualquer declaração

- [ ] 1.1 Plantar, numa só construção, uma rota estática em profundidade 1, uma estática aninhada em profundidade 2, uma rota com segmento dinâmico sem lista de valores, uma com lista aberta, uma com lista fechada (`dynamicParams = false`), um ícone e um mapa do site da aplicação; executar `next build` e registrar no corpo do PR a tabela de rotas impressa pela construção, o caminho exato de cada `.html` emitido, o conteúdo de `app-path-routes-manifest.json` e de `server/pages-manifest.json`, e as entradas `routes` e `dynamicRoutes` (com `fallback`) de `prerender-manifest.json`; pronto quando o registro existe com os sete casos, e mostra para o ícone e o mapa do site a classificação `○`, a entrada em `routes` de `prerender-manifest.json` e a ausência de `.html`, e os plantios estão revertidos com `git status` limpo
- [ ] 1.2 Plantar uma pasta `pages/` com uma página estática, uma com `getStaticProps` e uma com `getServerSideProps`; executar `next build` e registrar no corpo do PR a classificação de cada uma, as chaves e valores de `server/pages-manifest.json`, as entradas de `prerender-manifest.json` e os `.html` emitidos; pronto quando o registro mostra que nenhum artefato sozinho separa as três formas, ou, se mostrar o contrário, a tarefa para e a decisão sobre o roteador de páginas volta à proposta antes de 4.9; plantio revertido com `git status` limpo

## 2. Apelido e regra de importação (ponto 3)

- [ ] 2.1 Acrescentar `"paths": { "@/*": ["./*"] }` a `apps/backoffice/tsconfig.json`, sem `baseUrl`; pronto quando `verify:types` passa, uma importação de `@/app/_components/inexistente` plantada faz `verify:types` falhar nomeando o especificador, o plantio é revertido, e `grep baseUrl apps/backoffice/tsconfig.json` não encontra nada
- [ ] 2.2 Repartir o primeiro grupo de `noRestrictedImports` do bloco de `apps/**` em `biome.json` nos três grupos da tabela do design, cada um com sua mensagem; pronto quando `verify:lint` passa na árvore corrente e `git diff biome.json` não mostra nenhuma linha alterada no bloco de `packages/**`
- [ ] 2.3 Plantar, numa página em profundidade 2, a importação relativa `../../_components/...` do interior da própria aplicação; pronto quando `verify:lint` falha com a mensagem de travessia relativa, que aponta o apelido, e não com a de outra aplicação, plantio revertido
- [ ] 2.4 Plantar os dois especificadores relativos para outra aplicação e as cinco formas de travessia pelo apelido — as quatro da tabela do design e `@/app/veiculos/[id]/../../_components/painel`, que não sai da aplicação; pronto quando `verify:lint` falha em cada um dos sete nomeando o especificador, `@/../outra/app/z` incluído, e o corpo do PR registra qual mensagem o Biome deu em cada caso, plantios revertidos
- [ ] 2.5 Extrair o aviso da rota raiz para `apps/backoffice/app/_components/no-product-notice.tsx` e fazer `app/page.tsx` importá-lo, sem `"use client"` e sem literal de estilo; pronto quando todas as afirmações existentes sobre o documento da rota raiz passam sem alteração, e `style-literals` e `verify:lint` passam

## 3. A rota de prova

- [ ] 3.1 Criar `apps/backoffice/app/prova/[id]/page.tsx`, que exibe o aviso importado por `@/app/_components/no-product-notice`, sem ler o parâmetro, sem dado e sem `"use client"`; pronto quando `verify:types` e `verify:lint` passam e a construção classifica `/prova/[id]` como `ƒ (Dynamic)`
- [ ] 3.2 Com a rota de prova presente e a trava antiga ainda intacta, executar o teste do documento emitido; pronto quando o corpo do PR registra que ele passa verde com a rota não declarada — é o Defeito B reproduzido na árvore real, e o antes da tarefa 4.3

## 4. Camada 2 sobre rotas

- [ ] 4.1 Escrever o leitor de manifesto ao lado de `readEmitted`, com a mesma regra: artefato ausente reprova nomeando o caminho, nunca devolve vazio; pronto quando cada um dos três manifestos, removido antes da execução, faz a verificação falhar nomeando o caminho, sem nenhuma afirmação reportada como pulada, remoção revertida
- [ ] 4.2 Conferir o formato: `version` de `prerender-manifest.json` igual a `4`, e os outros dois como objeto de cadeias; pronto quando uma versão alterada depois da construção faz a verificação falhar nomeando a versão encontrada e a reconhecida, e um valor de forma inesperada num dos outros dois falha nomeando o arquivo, alterações revertidas
- [ ] 4.3 Substituir `DECLARED_DOCUMENTS` pelo mapa de rotas do design, escrito a partir do registro de 1.1, e travar a lista de rotas nos dois sentidos; pronto quando o teste passa na árvore corrente, a rota de prova plantada fora da declaração faz a verificação falhar nomeando `/prova/[id]`, uma rota estática aninhada plantada sem declaração falha nomeando-a, uma rota de metadados e um manipulador de rota plantados sem declaração falham cada um nomeando a rota, e uma rota declarada sem página falha nomeando-a, plantios revertidos
- [ ] 4.4 Afirmar a forma observada de cada rota contra a declarada; pronto quando a rota de prova tornada pré-renderizada por lista fechada falha nomeando rota, forma declarada e forma observada, e a rota raiz tornada resolvida por requisição falha da mesma forma, plantios revertidos
- [ ] 4.5 Recusar a forma mista; pronto quando uma rota com lista aberta de valores, plantada e declarada como pré-renderizada com os documentos que emite, faz a verificação falhar nomeando a rota, plantio revertido
- [ ] 4.6 Travar os documentos contra a união das listas declaradas; pronto quando uma rota estática aninhada plantada e declarada sem documento falha nomeando o caminho emitido — e esse caminho coincide com o registrado em 1.1 —, e um caminho divergente plantado na declaração da raiz falha nomeando o caminho ausente, plantios revertidos
- [ ] 4.7 Afirmar que cada forma aceita tem ao menos uma rota declarada; pronto quando a rota de prova removida e retirada da declaração faz a verificação falhar nomeando a forma resolvida por requisição, plantio revertido
- [ ] 4.8 Afirmar que a forma é lida só da classificação da construção; pronto quando um ícone plantado e declarado como pré-renderizado sem documento passa, e o mesmo ícone declarado como resolvido por requisição falha nomeando a rota, a forma declarada e a observada, plantio revertido
- [ ] 4.9 Travar as rotas fora da convenção contra o mapa das rotas geradas pelo framework, escrito a partir do registro de 1.1; pronto quando o teste passa na árvore corrente, e uma página plantada numa pasta `pages/` falha nomeando a rota — sem declaração, e também declarada no mapa de rotas da convenção com uma forma —, plantio revertido
- [ ] 4.10 Reescrever os comentários de `emitted-document.test.ts` e de `app/page.tsx` que afirmam haver uma rota só; pronto quando `grep -n "única" apps/backoffice/app apps/backoffice/tests` não encontra afirmação de rota única

## 5. Registros

- [ ] 5.1 Atualizar `docs/pontos-abertos.md`: pontos 2 e 3 saem citando este ciclo; o ponto 1 ganha, na consequência, que rota resolvida por requisição não tem documento; entram o ponto da forma mista recusada e o do perímetro do guardião de fixture, cada um com gatilho; cabeçalho com data e contagens atualizadas; pronto quando o diff mostra as quatro mudanças e todo ponto presente tem gatilho
- [ ] 5.2 Acrescentar a `docs/decisao-prova-de-comportamento-de-aplicacao.md` uma seção datada de atualização com o mapeamento observado e a mitigação nova de R2, sem reescrever o texto original; pronto quando a seção cita este ciclo e a tabela de caminhos é a registrada em 1.1

## 6. Fechamento

- [ ] 6.1 Executar `pnpm verify` inteiro; pronto quando os quatro estágios passam, a lista de estágios é a mesma de antes, e o tempo do estágio de testes antes e depois está registrado no corpo do PR
- [ ] 6.2 Executar a verificação duas vezes seguidas sobre a mesma árvore; pronto quando o resultado de cada estágio é idêntico nas duas e `git status` sai limpo depois das duas
- [ ] 6.3 Registrar no corpo do PR que nenhum componente de `packages/ui` mudou, e portanto não há história nova nem afirmação de acessibilidade a sustentar com axe; pronto quando `git diff --stat main` não lista nada sob `packages/` e o registro existe
- [ ] 6.4 Registrar no corpo do PR o que continua em aberto: a camada 3 não existe e o conteúdo de rota resolvida por requisição não tem prova; a forma mista está recusada; o guardião de fixture não cobre `apps/`; pronto quando cada lacuna está no registro com o gatilho que a reabre
