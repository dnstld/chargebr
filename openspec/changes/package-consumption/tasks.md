# Tasks

**Ordem obrigatória.** O grupo 1 vem antes de todos: sem o conserto de resolução,
nenhum arquivo da aplicação consegue importar os barris, e a construção reprova
antes de qualquer outra tarefa poder ser verificada (`design.md`, D4). O grupo 5
vem por último entre os de código, porque a prova de cobertura compara contra o
`exports` já na forma final — com os dois subpaths de marca do grupo 2 dentro.

**O que conta como verificação aqui.** Toda tarefa é conferida por execução, e
toda tarefa cujo teste existe para **recusar** algo traz o plantio registrado: o
que foi plantado, a reprovação observada com o que ela nomeou, e a reversão
(`openspec/config.yaml`, `rules.specs`). As execuções dos plantios vão para o
corpo do pull request, na seção `## Verificação`.

**Medido antes de escrever estas tarefas, e é o que define a ordem de 1.1:** com
os oito subpaths importados, a construção reprova com três especificadores —
`../generated/tokens.js`, `./hatch.js` e `./source.js` —, e os dois primeiros
estão em `src/index.ts` e o terceiro em `src/palette.ts`.

## 1. Resolução dos subpaths de `@chargebr/tokens`

- [ ] 1.1 Trocar os cinco especificadores alcançáveis por subpath publicado pelos
  nomes dos arquivos que existem: três em `packages/tokens/src/index.ts`
  (`../generated/tokens.ts` duas vezes, `./hatch.ts`) e dois em
  `packages/tokens/src/palette.ts` (`./source.ts` duas vezes). Verificar com
  `git diff packages/tokens/src` mostrando exatamente cinco linhas alteradas e
  nenhuma outra.
- [ ] 1.2 Acrescentar `allowImportingTsExtensions` às opções de compilação de
  `packages/tokens/tsconfig.json` e de `apps/backoffice/tsconfig.json`. Verificar
  com `pnpm -r exec tsc --noEmit` passando; sem a bandeira na segunda, a checagem
  da aplicação reprova com `TS5097` ao seguir para dentro do pacote, e é essa
  reprovação que justifica a linha.
- [ ] 1.3 Confirmar que nenhum dos outros dezesseis especificadores relativos de
  `packages/tokens/src` foi tocado. Verificar com
  `grep -rn 'from "\./\|from "\.\./' packages/tokens/src` e a lista conferida
  contra `git diff`.
- [ ] 1.4 Confirmar que os dois subpaths de módulo de `@chargebr/tokens` passam a
  resolver sob a construção. Verificar com um arquivo da aplicação importando
  `@chargebr/tokens` e `@chargebr/tokens/palette` e
  `pnpm --filter @chargebr/backoffice build` concluindo — antes desta tarefa a
  mesma construção reprova nomeando os especificadores. Transcrever as duas
  saídas.

## 2. Os arquivos de marca publicados, e quem declara o empacotador

- [ ] 2.1 Publicar os dois arquivos de marca em `exports` de
  `packages/ui/package.json`, com chaves que não exponham caminho interno do
  pacote. Verificar com `node --input-type=module` resolvendo os dois subpaths a
  partir de `apps/backoffice` e com `biome lint` passando sobre a aplicação que os
  importa — o perímetro proíbe caminho interno, e a chave publicada é o que o
  torna legal.
- [ ] 2.2 Criar na aplicação o arquivo de declaração versionado que diz o que o
  empacotador dela devolve num import de imagem, referenciando os tipos de imagem
  do próprio framework e nada além. Verificar com `pnpm verify:types` passando
  com a aplicação importando o subpath de marca, e com
  `git check-ignore` confirmando que o arquivo **não** é ignorado pelo
  versionamento — ao contrário de `next-env.d.ts`, que é.
- [ ] 2.3 **Plantio da declaração:** remover o arquivo de declaração e confirmar
  que `pnpm verify:types` reprova nomeando o import do arquivo de marca.
  Transcrever a mensagem, restaurar o arquivo e confirmar os tipos verdes.
- [ ] 2.4 Criar o módulo da bancada que carrega as URLs dos dois arquivos de marca
  para as histórias, com a diretiva de tipos do empacotador **da bancada** nele, e
  não em componente nenhum. Verificar com `pnpm -r exec tsc --noEmit` passando e
  com o módulo não sendo exportado por nenhum subpath publicado — conferido pela
  prova de cobertura do grupo 5.

## 3. A URL da marca por propriedade

- [ ] 3.1 Fazer `Logo` receber a URL do arquivo de marca por propriedade e remover
  do arquivo os dois imports de asset e a diretiva de referência de tipos do
  Vite. `variant` continua declarando a forma (`design.md`, D6). Verificar com
  `pnpm -r exec tsc --noEmit` passando e com a história do grupo 3.5 conferindo a
  referência renderizada.
- [ ] 3.2 Fazer `AppFrame` receber a URL da marca por propriedade e repassá-la a
  `Logo`. Verificar com a história da moldura e o teste do documento emitido do
  grupo 4 passando.
- [ ] 3.3 Fazer `NavRail` receber a URL da marca por propriedade e repassá-la a
  `Logo`, com a variante do selo. Verificar com a história da trilha conferindo a
  referência e a forma, nos dois temas.
- [ ] 3.4 Passar a URL nos usos restantes que a checagem de tipos nomear: arquivos
  de checagem de tipos da moldura e da trilha, o teste de largura de janela da
  moldura, e as histórias. Verificar com `pnpm -r exec tsc --noEmit` passando sem
  nenhum erro `TS2741`/`TS2322` sobre a propriedade da URL.
- [ ] 3.5 Fazer a história de `Logo` conferir que **a referência renderizada é a
  URL passada**, nas duas variantes, além de o arquivo terminar de carregar com
  dimensão própria maior que zero. Verificar com a história passando nos dois
  projetos de tema.
- [ ] 3.6 **Plantio da resolução própria:** fazer `Logo` resolver a marca por
  conta própria, ignorando a propriedade, e confirmar que a história de 3.5
  reprova nomeando a referência encontrada e a esperada. Transcrever a mensagem,
  reverter o plantio e confirmar a história verde de novo.
- [ ] 3.7 **Plantio do texto por propriedade:** plantar um uso de `Logo` sem a URL
  e um uso de `NavRail` sem a URL em arquivo de checagem de tipos, e confirmar que
  `pnpm verify:types` reprova nomeando cada uso. Transcrever as mensagens, deixar
  nos arquivos apenas os usos completos e confirmar os tipos verdes.
- [ ] 3.8 Confirmar que a bancada inteira continua passando nos dois temas, com a
  checagem de acessibilidade executada. Verificar pela saída de `vitest run` em
  `packages/ui` — antes desta mudança eram 53 arquivos e 181 testes; registrar a
  contagem depois.

## 4. A prova da marca no documento emitido

- [ ] 4.1 Ligar a URL da marca em `apps/backoffice/app/layout.tsx`, importando o
  subpath publicado do arquivo horizontal e passando a URL à moldura. Verificar
  com a construção concluindo e com a afirmação de 4.2 passando.
- [ ] 4.2 Acrescentar a `apps/backoffice/tests/emitted-document.test.ts` a
  afirmação de que a referência da imagem de marca do cabeçalho corresponde a um
  artefato existente entre os emitidos, com a falha nomeando a referência
  encontrada e o caminho procurado. Verificar com o teste passando sobre a
  construção corrente e a referência impressa na saída.
- [ ] 4.3 **Plantio da forma anterior:** devolver `Logo` à forma de hoje — import
  de asset dentro do componente e atribuição do objeto à referência — e confirmar
  que 4.2 reprova nomeando `[object Object]` e o caminho procurado. Transcrever a
  mensagem, reverter o plantio e confirmar o teste verde de novo.
- [ ] 4.4 Confirmar que os três documentos que hoje entregam a referência quebrada
  passam a entregar a URL correta: a rota raiz, a rota não encontrada da convenção
  e a rota 404 fora dela. Verificar lendo a imagem de marca em cada um dos três
  artefatos emitidos e transcrevendo as três referências.
- [ ] 4.5 Confirmar que o nome acessível continua afirmado como antes, e que a
  afirmação nova não o substituiu. Verificar pela presença das duas afirmações no
  arquivo de teste e pelas duas passando.

## 5. A prova de consumo dos subpaths publicados

- [ ] 5.1 Criar `apps/backoffice/app/prova/subpaths/route.ts`, manipulador de rota
  que importa **todo** subpath publicado por pacote sob `packages/`, com
  importação estática, e que declara no próprio comentário que existe para a
  prova e não é rota de negócio. Verificar com
  `pnpm --filter @chargebr/backoffice build` concluindo e a rota aparecendo como
  resolvida por requisição na saída.
- [ ] 5.2 Declarar a rota nova na lista de rotas de `emitted-document.test.ts`,
  como resolvida por requisição e sem documento. Verificar com os testes de rotas
  e de documentos passando — **medido antes:** sem a linha, a trava reprova com
  `rota produzida e não declarada: ['/prova/subpaths']`.
- [ ] 5.3 Escrever o teste de cobertura em `apps/backoffice/tests/`: descobre o
  conjunto de subpaths publicados lendo o mapa de exportações de cada pacote sob
  `packages/`, descobre o conjunto importado pelo arquivo de consumo, e compara os
  dois **nos dois sentidos**, nomeando o subpath que está num e não no outro.
  Reprova também quando o conjunto descoberto é vazio ou quando um pacote não tem
  mapa de exportações. Verificar com o teste passando e a contagem de subpaths
  descobertos impressa — dez, depois do grupo 2.
- [ ] 5.4 **Plantio da cobertura, sentido descoberto:** acrescentar um subpath ao
  mapa de exportações de um dos pacotes sem importá-lo no arquivo de consumo, e
  confirmar que 5.3 reprova nomeando o subpath. Transcrever a mensagem, reverter o
  plantio e confirmar o teste verde.
- [ ] 5.5 **Plantio da cobertura, sentido importado:** importar no arquivo de
  consumo um subpath que nenhum mapa publica, e confirmar que 5.3 reprova
  nomeando-o. Transcrever a mensagem, reverter o plantio e confirmar o teste
  verde.
- [ ] 5.6 **Plantio do conjunto vazio:** remover o mapa de exportações de um dos
  pacotes e confirmar que 5.3 reprova nomeando o pacote sem mapa. Transcrever a
  mensagem, reverter o plantio e confirmar o teste verde.
- [ ] 5.7 **Plantio da construção:** plantar um especificador de módulo
  inexistente num arquivo alcançável por subpath publicado e confirmar que a
  construção dentro do preparo da verificação reprova nomeando o especificador, e
  que a reprovação derruba o projeto da aplicação em vez de passar calada.
  Transcrever a mensagem, reverter o plantio e confirmar a verificação verde.
- [ ] 5.8 Registrar no corpo do pull request o custo medido do arquivo de consumo
  sobre o documento entregue: folhas de estilo e bytes de CSS entregues, antes e
  depois. Verificar lendo as referências de estilo do documento emitido e os
  tamanhos dos artefatos correspondentes — medido na proposta em uma folha e 14.580
  bytes antes, duas folhas e 21.619 bytes depois. A contagem de folhas deixa de ser
  só registro e passa a ser afirmada em 5.13; os bytes ficam só no registro, de
  propósito (`design.md`, D10).

- [ ] 5.9 Escrever, no mesmo arquivo de prova, a travessia do grafo publicado: a
  partir de cada alvo de `exports` que é módulo TypeScript, seguir as importações
  relativas resolvendo `.js`, `.ts` e extensão ausente para o arquivo que existe, e
  parar nas folhas que não são módulo. Verificar com a contagem de arquivos
  alcançáveis impressa na execução e com `logo.tsx`, `app-frame.tsx`,
  `nav-rail.tsx` e `packages/tokens/src/source.ts` entre eles — e nenhum arquivo de
  história, de checagem de tipos ou de teste.
- [ ] 5.10 Acrescentar a asserção da proibição: nenhum arquivo alcançável declara
  diretiva de referência, e a falha nomeia arquivo e linha. Verificar com a
  asserção passando sobre a árvore corrente, e com as três ocorrências legítimas do
  perímetro (`bench/optimize-deps.test.ts`, `tokens/src/theme.test.ts`,
  `apps/backoffice/next-env.d.ts`) **fora** do conjunto alcançável — conferido pela
  listagem de 5.9.
- [ ] 5.11 **Plantio da proibição:** devolver `/// <reference types="vite/client" />`
  ao arquivo de `Logo` e confirmar que 5.10 reprova nomeando o arquivo e a linha.
  Transcrever a mensagem, reverter o plantio e confirmar a asserção verde de novo.
- [ ] 5.12 **Plantio do conjunto alcançável vazio:** apontar por plantio os alvos
  de `exports` para arquivo inexistente e confirmar que a travessia reprova dizendo
  que o conjunto ficou vazio, em vez de passar verde sem ter olhado nada.
  Transcrever a mensagem, reverter o plantio e confirmar verde.
- [ ] 5.13 Declarar, em `emitted-document.test.ts`, a contagem de folhas de estilo
  de cada documento emitido, e afirmar a contagem lida contra a declarada, com a
  falha nomeando o documento, o esperado e o lido. O conjunto de documentos com
  contagem é comparado nos dois sentidos com o conjunto que as rotas declaram.
  Verificar com o teste passando e as contagens lidas impressas — medido na
  proposta: 2 para `app/index.html`, `app/_not-found.html` e `pages/404.html`, e 0
  para `app/_global-error.html` e `pages/500.html`.
- [ ] 5.14 **Plantio da contagem:** acrescentar uma importação de estilo ao arquivo
  de consumo e confirmar que 5.13 reprova nomeando o documento, a contagem
  declarada e a lida. Transcrever a mensagem, reverter o plantio e confirmar o
  teste verde de novo.
- [ ] 5.15 **Plantio da cobertura da contagem:** remover a contagem declarada de um
  dos documentos e confirmar que 5.13 reprova nomeando o documento sem contagem.
  Transcrever a mensagem, reverter o plantio e confirmar o teste verde.

## 6. Portão e perímetro

- [ ] 6.1 Executar `pnpm verify` e confirmar os quatro estágios verdes, com os
  testes novos entre os coletados. Verificar pela saída do comando, código de
  saída zero, e a contagem de arquivos de teste registrada antes e depois —
  73 antes.
- [ ] 6.2 Confirmar que nenhum perímetro de guardião mudou, e que as duas
  asserções novas não criaram lista de perímetro nenhuma. Verificar com
  `git diff main -- tools/` vazio e por leitura do arquivo de prova: nenhuma lista
  de diretório escrita à mão, só o conjunto descoberto do `exports`.
- [ ] 6.3 Confirmar que nada de tema e nada de navegação mudou além do repasse da
  URL da marca. Verificar com `git diff main` sobre
  `packages/ui/src/organisms/nav` mostrando apenas as linhas da URL, e `grep` por
  `data-theme` em `git diff main` voltando vazio.
- [ ] 6.4 Confirmar que nenhum script da raiz foi alterado — em particular
  `collect`, `extract` e `test`, que não são nossos. Verificar com
  `git diff main -- package.json` mostrando nenhuma mudança em `scripts`.
- [ ] 6.5 Confirmar que nenhum arquivo sob `openspec/specs/` muda neste PR — o
  delta só é aplicado no arquivamento. Verificar com
  `git diff main -- openspec/specs` vazio.
- [ ] 6.6 Confirmar que a contagem declarada em `config-rules` não precisou mudar:
  este ciclo não acrescenta nem remove regra de `openspec/config.yaml`. Verificar
  com o guardião passando e `git diff main -- openspec/config.yaml` vazio.

## 7. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova mudança ativa com todas as
tarefas marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 7.1 Arquivar a mudança **com sincronização das specs vivas**: mover
  `openspec/changes/package-consumption/` para
  `openspec/changes/archive/<data>-package-consumption/` e aplicar os três deltas
  em `openspec/specs/`. Verificar com `npx openspec validate --specs --strict`
  passando nas sete capacidades, os dois requisitos modificados presentes com
  todos os cenários deles — seis em `backoffice-shell`, cinco em
  `shell-components` —, e os quatro requisitos novos presentes: a contagem de
  folhas (três cenários), o repasse da URL da marca (dois), a prova de consumo
  (cinco) e a proibição de diretiva de referência (três).
- [ ] 7.2 Confirmar que a cláusula afrouxada não sobreviveu na spec viva.
  Verificar com `grep -n "sem prescrever qual delas a implementação escolhe"` em
  `openspec/specs/` voltando vazio.
- [ ] 7.3 Registrar em `docs/pontos-abertos.md`, **no mesmo commit** do movimento
  para `archive/`, o ponto aberto novo de `design.md`, D8 — `color-scheme` não
  declarado na camada de tokens —, com o gatilho, e atualizar o cabeçalho do
  arquivo: data, estado do repositório e contagem de ciclos arquivados, de 18 para
  19. Verificar com `tools/checks/change-lifecycle.test.ts` passando.
- [ ] 7.4 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro
  estágios verdes. Verificar pela saída do comando, código de saída zero.
