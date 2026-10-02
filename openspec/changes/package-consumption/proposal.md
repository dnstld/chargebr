# Proposal

## Why

Dois defeitos medidos na `main`, e uma lacuna de verificação que explica por que
nenhum dos dois foi pego.

**Defeito 1 — a marca não carrega na aplicação construída.** Três documentos
emitidos entregam `<img src="[object Object]" alt="ChargeBR"
data-variant="horizontal"/>`: `server/app/index.html`,
`server/app/_not-found.html` e `server/pages/404.html`. A causa é uma suposição
sobre o empacotador de quem consome: `packages/ui/src/atoms/logo/logo.tsx`
declara `/// <reference types="vite/client" />` e importa o SVG como asset do
Vite, que devolve **cadeia**; o Next devolve **objeto de imagem estática**, e
`src={objeto}` serializa para `[object Object]`.

**Medido, e é mais grave do que parece:** essa diretiva de referência de tipos
não fica no pacote. Removendo-a de `logo.tsx`, a checagem de tipos **da
aplicação** passa a reprovar — `app/page.tsx: Cannot find module
'@chargebr/ui/brand/logo-horizontal.svg'`. Ou seja: a declaração ambiente do
Vite, escrita dentro do grafo publicado, entra no programa de tipos de **todo
consumidor** e tipa todo import de SVG como cadeia. Foi ela que deixou
`src={objeto}` compilar. O pacote não só adivinhou o empacotador do consumidor:
ele impôs essa adivinhação ao sistema de tipos do consumidor.

**E a mentira de tipo não desaparece com o conserto — ela se move para fora do
nosso alcance.** `next/image-types/global.d.ts` declara
`declare module '*.svg' { const content: any; export default content }`, com o
`any` de propósito, pelo comentário do próprio arquivo. Com a URL chegando por
propriedade, a propriedade é tipada como cadeia, mas o que a aplicação tem para
passar nela é `any` — e `any` entra em cadeia calado. Se alguém voltar a passar o
objeto de imagem, **o sistema de tipos não reclama.** Por isso a afirmação sobre a
referência no documento emitido não é reforço: é a **única guarda** desse limite, e
está escrita no requisito com essa razão ao lado — senão um ciclo futuro olha a
propriedade tipada, conclui que a afirmação é redundante e a afrouxa, que é
exatamente o movimento que custou a marca quebrada, agora com um argumento de
aparência melhor.

**E a asserção que deveria pegar foi afrouxada de propósito.** O requisito
"Regiões da moldura no documento entregue" diz, no `**Por quê:**`, que "nome
acessível" cobre "as duas formas que o nome do produto pode assumir no cabeçalho
— texto visível ou `alt`/rótulo do `Logo` — sem prescrever qual delas a
implementação escolhe"; por isso a afirmação confere `alt` e nada mais. Afrouxar
para não prescrever implementação é o que deixou passar `src` quebrado. A
correção entra como **obrigação**, não como conserto silencioso: a prova da marca
confere referência de asset resolvível, e tem de ser vista reprovar com o `src`
de hoje plantado de volta.

**Defeito 2 — `@chargebr/ui/atoms` não resolve na construção da aplicação.** O
barril de átomos arrasta `@chargebr/tokens`, cujo `src/index.ts` importa
`../generated/tokens.js` onde o arquivo é `.ts`. A construção falha com `Module
not found`. **Medido agora, e maior do que o levantamento anterior:** importando
os oito subpaths publicados, a construção reprova com **três** especificadores,
não um — `../generated/tokens.js`, `./hatch.js` e `./source.js`, o último
alcançado só por `@chargebr/tokens/palette`.

**A lacuna que explica os dois.** Dos oito subpaths publicados hoje, a aplicação
consome **dois**: `@chargebr/tokens/tokens.css` e `@chargebr/ui/shell`, os dois em
`app/layout.tsx`. Os outros seis não têm consumidor de aplicação nenhum — são
verificados apenas pela bancada, que é um consumidor Vite. E a bancada **passa**:
as histórias de `Logo` conferem `image.complete` e `naturalWidth > 0`, e passam,
porque sob Vite o import devolve a cadeia que o componente espera. Os dois
defeitos moram exatamente no espaço entre "a bancada prova" e "a aplicação
consome".

## What Changes

- **A prova da marca deixa de ser só o nome acessível.** O documento emitido passa
  a ser afirmado também pela referência do arquivo de marca: a `src` da imagem
  resolve para um asset que a construção emitiu. **Medido:** com a forma de hoje,
  `src="[object Object]"`, nenhum arquivo existe no caminho — a afirmação reprova;
  com a URL correta, `src="/_next/static/media/logo-charge-br-horizontal.05-4l5-vpji1h.svg"`,
  o arquivo existe em `.next/static/media/`.

- **A URL do arquivo de marca passa a chegar por propriedade.** `Logo` recebe a
  URL de quem compõe, e não importa mais asset nem declara tipos do empacotador
  de ninguém. A aplicação sabe como o próprio empacotador produz URL; o pacote
  para de adivinhar. `AppFrame` e `NavRail` repassam a URL, que entra por
  propriedade como já entra todo texto que eles exibem.

- **Os dois SVGs de marca passam a ser publicados em `exports`.** É o que permite
  a aplicação referenciá-los sem alcançar caminho interno do pacote — o que a
  verificação já proíbe. `@chargebr/ui` passa de quatro para seis subpaths, e a
  prova nova deste ciclo cobre os dois novos sem ninguém editar o teste.

- **A obrigação central: todo subpath publicado em `exports` é provado sob a
  construção da aplicação, não só sob a bancada.** A lista de entrada da prova sai
  do `exports` de cada pacote sob `packages/`, **descoberta, nunca escrita à
  mão** — a regra que entrou em `proof-falsifiability`, com alvo real: subpath
  novo passa a ser coberto sem edição de teste. A prova tem as duas metades que a
  regra exige: **cobertura**, comparando o conjunto descoberto contra o conjunto
  importado pelo arquivo de consumo declarado, nos dois sentidos; e
  **correspondência**, que é a construção de verdade — o subpath não só resolve,
  ele compila.

- **A proibição que fecha a classe inteira ganha prova mecânica: nenhum arquivo
  alcançável a partir de `exports` declara diretiva de referência.** Diretiva de
  referência num arquivo do grafo publicado entra no programa de tipos de **todo
  consumidor**. **Medido:** com a diretiva presente, a listagem dos arquivos do
  programa de tipos de `apps/backoffice` contém `vite/client.d.ts`, que declara
  `declare module '*.svg' { const src: string; export default src }`. A checagem de
  tipos da aplicação não foi enganada — foi **informada**, pelo pacote, de uma
  coisa falsa sobre o empacotador dela, e foi essa certificação que entregou a
  marca quebrada. A varredura é uma asserção dentro do arquivo de prova que este
  ciclo já escreve, sobre a mesma lista descoberta e a mesma linha de alcance dos
  especificadores. **Plantio:** a diretiva devolvida ao arquivo de `Logo`, e a
  prova reprova nomeando arquivo e linha. **Medido:** hoje exatamente um arquivo
  alcançável a declara — o de `Logo`; as outras três ocorrências do perímetro são
  de prova da bancada e da aplicação, e ficam fora do alcance.

- **O custo do documento passa a ser afirmado, não só registrado: a contagem de
  folhas de estilo de cada documento emitido é declarada.** Registrar não impede
  crescer — sem afirmação, o próximo ciclo que acrescentar um subpath à prova sobe
  a contagem e ninguém vê. É a mesma figura da contagem declarada do guardião do
  arquivo de regras: declarada, obriga quem a muda a dizer isso na mesma mudança;
  derivada do documento lido, nunca reprovaria. **Contagem, e não bytes** — byte
  varia com minificação e vira ruído. **Medido, por documento:**
  `app/index.html`, `app/_not-found.html` e `pages/404.html` passam de 1 para 2
  folhas; `app/_global-error.html` e `pages/500.html` continuam em 0, e entram na
  declaração com zero para que uma folha nova neles também reprove.

- **A verificação é contra construção de verdade, e a alternativa está medida e
  descartada.** Resolver não é compilar. Com o defeito presente: resolução pura
  pelo mapa de `exports` devolve **8 de 8 resolvidos, verde**; importação em Node
  sob `tsx` erra nos dois sentidos — 6 falsos negativos por `.css` e 2 falsos
  positivos exatamente nos subpaths que a construção reprova; `pnpm -r exec tsc
  --noEmit` passa **verde**. Só `next build` reprova. `design.md`, D1, tem a
  tabela.

- **O conserto de resolução é cinco especificadores em dois arquivos**, e o design
  registra por que é mínimo: são exatamente os alcançáveis a partir de um subpath
  publicado. Os outros dezesseis de `packages/tokens/src` não são alcançáveis por
  consumidor nenhum, e a obrigação nova é o que guarda essa linha — se alguém os
  tornar alcançáveis, a construção reprova. `allowImportingTsExtensions` entra nas
  configurações de tipos de `packages/tokens` e de `apps/backoffice`.

- **Um ponto aberto novo**, com gatilho: `color-scheme` não é declarado em lugar
  nenhum da camada de tokens, e a consequência — barra de rolagem e controle
  nativo pintados pelo navegador contra o tema — já existe hoje no escuro. Não foi
  criado por este ciclo e não bloqueia nada. **Gatilho:** o próximo ciclo da
  camada de tokens.

## What This Does Not Do

- **Não toca tema.** Nada sobre `data-theme`, escolha de tema, script de tema ou o
  requisito "Tema sem script". O ciclo `theme-choice` fica parado e sem merge até
  este fechar, e este não mexe nele. **Consequência registrada:** o design de
  `theme-choice` reivindicava o conserto de resolução de importação (D8 dele); o
  conserto passa a ser deste ciclo, e aquele design precisa de emenda quando
  voltar — inclusive no número, que lá estava três especificadores e aqui são
  cinco. A dependência `lucide-react` (D9 dele) continua sendo dele: este ciclo
  não traz ícone nenhum.
- **Não toca navegação.** `NavRail` muda só no que o repasse da URL da marca
  exige; nenhum comportamento de navegação, nenhuma rota, nenhum slot.
- **Não amplia perímetro de guardião nenhum.** As listas de `tools/checks/` ficam
  como estão — `style-literals`, `component-vocabulary`, `fixture-origin`,
  `type-suppression`, `change-lifecycle`, `nav-pair-adjacency` e `config-rules`
  não ganham entrada nem perdem, e `git diff main -- tools/` fica vazio. Em
  particular, o ponto 21 continua aberto e intocado: este ciclo não toca
  `interface-charts`. **A varredura de diretiva de referência não é perímetro
  novo:** é uma asserção dentro do arquivo de prova deste ciclo, em
  `apps/backoffice/tests/`, sobre a lista descoberta do `exports` — não há lista
  de perímetro a manter.
- **Não reescreve o desenho da marca como marcação dentro do componente.**
  Descartado **antes** de medir: `docs/decisao-identidade-visual.md`, D7, escolheu
  asset externo justamente para o componente não declarar cor, e `style-literals`
  segue valendo.
- **Não reescreve os outros dezesseis especificadores relativos de
  `packages/tokens/src`.** Eles não são alcançáveis a partir de subpath publicado.
- **Não cria aplicação nova no workspace.** A alternativa de uma segunda aplicação
  só para hospedar a prova está medida e descartada em `design.md`, D3.
- **Não resolve `color-scheme`.** Registra o ponto, com gatilho.
- **Não muda o que a bancada prova.** As histórias continuam exercitando a marca
  nos dois temas; o que muda é de onde a URL vem. **Medido:** a bancada inteira
  passa com a URL por propriedade — 53 arquivos, 181 testes, nos dois temas.
- **Não declara `exports` novo em `@chargebr/tokens`.** Os quatro de hoje
  continuam os quatro.
- **Não prova que o asset é visualmente a marca.** A afirmação é que a referência
  resolve para um arquivo emitido. Que o arquivo seja o desenho certo continua
  sendo o que a bancada mostra, nos dois temas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `shell-components`: o requisito de `Logo` passa a obrigar que a URL do arquivo
  de marca chegue por propriedade, e que o componente não importe asset nem
  declare tipos do empacotador de quem o consome. A proibição de literal de cor
  continua inteira.
- `backoffice-shell`: o requisito das regiões da moldura passa a obrigar que a
  referência do arquivo de marca no documento emitido resolva para um asset
  emitido — a cláusula que o `**Por quê:**` atual afrouxa —, e que a moldura
  receba a URL da marca por propriedade. A capacidade recebe também um requisito
  novo: a contagem de folhas de estilo de cada documento emitido é declarada, e
  divergência reprova nomeando o documento, o esperado e o lido.
- `workspace-verification`: dois requisitos novos. O primeiro — todo subpath
  publicado em `exports` por pacote sob `packages/` é provado sob a construção da
  aplicação, com a lista de entrada descoberta do próprio `exports` e com as duas
  provas que lista declarada exige. O segundo — nenhum arquivo alcançável a partir
  de `exports` declara diretiva de referência, porque diretiva no grafo publicado
  entra no programa de tipos de todo consumidor.

## Impact

- `packages/ui/package.json`: dois subpaths novos, para os dois arquivos de marca.
- `packages/ui/src/atoms/logo/logo.tsx`: a URL entra por propriedade; saem os dois
  imports de asset e a diretiva de tipos do Vite.
- `packages/ui/src/organisms/app-frame/app-frame.tsx` e
  `packages/ui/src/organisms/nav/rail/nav-rail.tsx`: repassam a URL da marca.
- Histórias, arquivos de checagem de tipos e o teste de largura de janela dos três
  componentes acima: passam a fornecer a URL. **Medido:** a cascata é de treze
  arquivos, enumerada em `design.md`, D2.
- `apps/backoffice/app/layout.tsx`: importa o subpath publicado do arquivo de
  marca e passa a URL.
- `apps/backoffice`, arquivo de declaração versionado: declara o que o empacotador
  da aplicação devolve num import de imagem. É necessário porque `next-env.d.ts`
  é ignorado pelo versionamento e está fora da checagem de tipos da aplicação por
  decisão anterior (`workspace-verification`, "Artefato de construção não é
  conteúdo verificado").
- `packages/tokens/src/index.ts` e `packages/tokens/src/palette.ts`: cinco
  especificadores; `packages/tokens/tsconfig.json` e
  `apps/backoffice/tsconfig.json`: `allowImportingTsExtensions`.
- `apps/backoffice/app/prova/subpaths/route.ts`: o arquivo de consumo declarado,
  que importa todo subpath publicado. É manipulador de rota, não página: não emite
  documento. **Custo medido, aceito e afirmado:** o documento entregue
  passa de uma para duas folhas de estilo, de 14.580 para 21.619 bytes crus (cerca
  de +1,5 KB comprimido). `design.md`, D3, compara com as alternativas, e a
  contagem de folhas passa a ser declarada e afirmada por documento — crescer de
  novo exige dizer isso na mesma mudança.
- `apps/backoffice/tests/`: a afirmação da marca no documento emitido, a
  afirmação da contagem de folhas de estilo por documento, e o teste de cobertura
  dos subpaths publicados — que é também onde mora a asserção da varredura de
  diretiva de referência, sobre os arquivos alcançáveis a partir do `exports`. A
  lista declarada de rotas ganha `/prova/subpaths` — **medido:** sem a linha, a
  trava de rotas reprova com `rota produzida e não declarada:
  ['/prova/subpaths']`, e os outros 14 testes passam. A declaração de documentos
  ganha a contagem de folhas de cada um.
- `docs/pontos-abertos.md`: no arquivamento, o ponto novo de `color-scheme` com o
  gatilho, e o cabeçalho que todo ciclo atualiza.
- Nada fora de `apps/`, `packages/`, `openspec/` e `docs/`. Nenhum script da raiz
  é alterado.
