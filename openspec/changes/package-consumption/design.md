# Design

## Context

Ver `proposal.md`, seção Why, para os dois defeitos e a lacuna que os explica.
Aqui ficam as medições e o que cada uma decide.

Todas as medições foram feitas nesta branch, por protótipo descartável, com
`apps/backoffice` construído de verdade (`next build`, Next.js 16.3.6,
Turbopack), com `pnpm -r exec tsc --noEmit`, com `biome`, e com os testes do
projeto `documento emitido` e da bancada de `packages/ui` executados contra o
resultado. Nenhum protótipo ficou na árvore: ao fim das medições
`git diff --stat main` voltou vazio, e nenhuma linha de código entra neste PR.

Restrições que moldam o que pode ser escrito:

- `docs/decisao-identidade-visual.md`, D7, escolheu asset externo para a marca
  justamente para o componente não declarar cor, e `style-literals` segue
  valendo. **Reescrever o desenho como marcação dentro do componente está
  descartado antes de medir.**
- `next-env.d.ts` é ignorado pelo versionamento e está fora da checagem de tipos
  da aplicação, por decisão registrada em `workspace-verification`, "Artefato de
  construção não é conteúdo verificado". É ele que declara o que um import de
  imagem devolve sob o empacotador da aplicação — então a aplicação precisa
  declarar isso em arquivo versionado próprio.
- `apps/backoffice/tests/build.setup.ts` já executa a construção uma vez por
  execução da verificação, antes de qualquer afirmação. A máquina da prova existe.
- A lista declarada de rotas de `apps/backoffice/tests/emitted-document.test.ts`
  é travada nos dois sentidos: rota nova sem linha na lista reprova.

## Goals / Non-Goals

**Goals:**

- Decidir a forma da prova de consumo por medição, e descartar a perdedora por
  escrito.
- Decidir como a marca referencia o arquivo, dentro da restrição de D7 da decisão
  de identidade visual, por medição.
- Deixar registrado por que o conserto de especificadores é mínimo, com a linha
  que define o mínimo.
- Deixar o custo da prova sobre o documento entregue medido e visível, em vez de
  descoberto depois por quem revisa.

**Non-Goals:**

- Mecanizar a proibição de um pacote declarar tipos do empacotador de quem o
  consome. Ver D2, "o que fica sem prova própria".
- Fazer a aplicação **usar** o que ela importa para provar consumo.
- Resolver `color-scheme` (D8).

## Decisions

### D1. A prova é a construção de verdade, não uma verificação de resolução

**Decisão:** o consumo é provado pela construção da aplicação, executada sobre
uma árvore em que um arquivo alcançável pela construção importa todo subpath
publicado. Verificação de resolução está descartada.

**Medido, sobre a mesma árvore, com o defeito presente:**

| Verificação | Veredito | O que ela erra |
| --- | --- | --- |
| Resolução pelo mapa de exportações, a partir da aplicação | **8 de 8 resolvidos, verde** | não segue o grafo: o subpath resolve, o que ele importa não |
| Importação em Node sob `tsx` | **2 de 8 importados** | 6 falsos negativos (`Unknown file extension ".css"`); e os 2 que passam são `@chargebr/tokens` e `@chargebr/tokens/palette` — exatamente os dois que a construção reprova, porque `tsx` resolve `.js` para `.ts` e o empacotador não |
| `pnpm -r exec tsc --noEmit` | **passa** | resolve pelas regras de TypeScript, não pelas do empacotador |
| `next build` da aplicação | **reprova**, nomeando `../generated/tokens.js`, `./hatch.js` e `./source.js` | — |

A importação em Node é o caso mais instrutivo: ela erra **nos dois sentidos na
mesma execução**. Reprova seis subpaths por uma razão que não tem nada a ver com
o defeito, e aprova os dois únicos que o defeito atinge.

**O que faria mudar de ideia:** uma verificação que use a resolução do próprio
empacotador da aplicação sem construir. Não achei: o empacotador não é exposto
fora da construção.

### D2. A URL do arquivo de marca chega por propriedade

**Decisão:** `Logo` recebe a URL por propriedade e não importa arquivo de marca.
`AppFrame` e `NavRail` repassam. Os dois SVGs passam a ser publicados em
`exports` para que a aplicação possa referenciá-los sem alcançar caminho interno
do pacote — o que a verificação já proíbe.

**A medição que decide, e não é custo nem gosto:** a diretiva de referência de
tipos do empacotador que o componente declarava (`/// <reference
types="vite/client" />`) está num arquivo alcançável por subpath publicado, e por
isso entra no **programa de tipos de todo consumidor**. Removendo-a de
`logo.tsx`, a checagem de tipos da **aplicação** passa a reprovar:
`app/page.tsx: Cannot find module '@chargebr/ui/brand/logo-horizontal.svg'`. Era
essa declaração ambiente — `*.svg` é cadeia — que deixava a atribuição de um
objeto de imagem a uma referência de imagem compilar. **O pacote não só adivinhou
o empacotador do consumidor: impôs a adivinhação ao sistema de tipos dele, e foi
isso que escondeu o defeito do `tsc`.**

**As duas opções, medidas:**

| | Por propriedade | Normalizar no pacote |
| --- | --- | --- |
| `src` emitido | URL real, arquivo existe em `.next/static/media/` | URL real, mesmo arquivo |
| arquivos tocados | **13** | **1** |
| diretiva de tipos do empacotador no grafo publicado | **sai** | **fica** |
| mentira de tipo no consumidor | **acaba** | continua, para todo consumidor |
| bancada | 53 arquivos, 181 testes, verdes nos dois temas | verde (não muda) |
| tipos / lint | verdes | verdes |
| modo de falha residual | nenhum conhecido | forma diferente do objeto → referência ausente, calada |

A forma descartada é `typeof x === "string" ? x : x.src`. Ela funciona — medido:
o documento passa a entregar a URL correta com um arquivo alterado. **Foi
descartada porque conserta o sintoma e mantém a causa:** o pacote continua
afirmando, no programa de tipos de quem o consome, o que o empacotador de quem o
consome devolve. A asserção de forma é cega — um terceiro empacotador que devolva
um objeto com outro nome de campo produz referência ausente, e ausente é calado.

**A cascata, medida e enumerada pelo `tsc`:** `packages/ui/package.json`,
`logo.tsx`, a história de `Logo`, o módulo de URLs da bancada,
`app-frame.tsx`, a história e o arquivo de checagem de tipos da moldura, o teste
de largura de janela da moldura, `nav-rail.tsx`, a história e o arquivo de
checagem de tipos da trilha, `app/layout.tsx` e o arquivo de declaração da
aplicação. Treze arquivos, nenhum deles descoberto na implementação: o `tsc`
nomeou cada uso que faltava a propriedade.

**Onde a afirmação sobre o empacotador passa a morar, dos dois lados:** na
bancada, num módulo que só as histórias importam — a bancada **é** um consumidor
Vite, e ali a afirmação é verdadeira; na aplicação, num arquivo de declaração
versionado que referencia os tipos de imagem do próprio framework. Cada
consumidor declara o seu, e nenhum declara pelo outro.

**O que fica sem prova própria, dito por escrito:** a proibição de um pacote
declarar tipos do empacotador de quem o consome **não** ganha verificação neste
ciclo. O que ganha prova é a consequência observável — a referência renderizada
tem de ser a URL recebida (bancada) e a referência do documento tem de apontar
para um arquivo emitido (documento). As duas juntas reprovam toda forma
**quebrada**; a forma que funciona mantendo a mentira de tipo (normalizar no
pacote) não é reprovada por elas, é recusada por esta decisão. Mecanizar isso
exigiria varrer o grafo publicado procurando diretiva de tipos, e este ciclo não
cria perímetro de guardião novo.

### D3. O arquivo de consumo é um manipulador de rota na aplicação, e o custo está medido

**Decisão:** o arquivo que importa todo subpath publicado é um manipulador de
rota em `apps/backoffice/app/prova/subpaths/route.ts` — não uma página, não uma
aplicação nova.

**Medido, sobre o documento que a aplicação entrega:**

| Onde os oito subpaths são importados | Folhas de estilo entregues | Bytes de CSS entregues |
| --- | --- | --- |
| Nenhum (árvore da `main`) | 1 | 14.580 crus / 2.796 comprimidos |
| Manipulador de rota (`route.ts`) | 2 | 21.619 crus (cerca de +1,5 KB comprimido) |
| Página (`app/prova/[id]/page.tsx`) | 3 | mais que o manipulador |

Importação estática e importação dinâmica dentro do manipulador custam **o
mesmo** — medido: os dois produzem documento de 7.317 bytes, idêntico. Então a
forma escolhida é a estática, que é a que um consumidor escreve.

**O custo é aceito, e é o que o manipulador de rota minimiza:** nenhum documento
novo é emitido (a rota é resolvida por requisição), nenhum script de navegador
novo entra, e o acréscimo é a folha com os módulos de estilo dos componentes que
a aplicação ainda não renderiza. Três razões para aceitar: o acréscimo é de
cerca de 1,5 KB comprimido; os subpaths existem para ser consumidos pelo produto,
e o gráfico é a razão de ser dele; e a alternativa custa mais.

**Alternativa descartada por escrito — uma segunda aplicação no workspace, só
para hospedar a prova.** Ela mantém o documento do produto intacto, e é a única
com essa propriedade. Foi descartada pelo custo medido: cinco arquivos novos de
andaime, uma segunda construção dentro da verificação, e — o que pesa mais —
`apps/backoffice/tests/type-stage-inputs.test.ts` deriva de `apps/` os artefatos
que exige e passa a reprovar nomeando os artefatos da aplicação nova, porque
nenhum preparo a constrói. Aquele teste registra, no próprio comentário, que "o
ciclo que trouxer a segunda decide onde a prova mora": trazer a segunda aplicação
abriria essa decisão dentro de um ciclo que existe para fechar duas outras. O
gatilho para reabrir esta alternativa é o custo em bytes crescer — se a prova
passar a arrastar peso que o produto não vai usar, a aplicação dedicada volta.

**Alternativa descartada — importar os subpaths na rota raiz ou na rota de prova
existente.** Medido pior: três folhas em vez de duas, porque uma página arrasta
também o que vai para o navegador.

**Consequência registrada:** a rota nova entra na lista declarada de rotas.
**Medido:** sem a linha, a trava reprova com `rota produzida e não declarada:
['/prova/subpaths']`, e os outros 14 testes passam. É o comportamento desenhado —
"acrescentar rota é ato deliberado".

### D4. O conserto de especificadores é mínimo, e o mínimo tem uma linha

**Decisão:** cinco ocorrências, em dois arquivos — `packages/tokens/src/index.ts`
(três) e `packages/tokens/src/palette.ts` (duas) —, passam a nomear os arquivos
que existem. `allowImportingTsExtensions` entra nas configurações de tipos de
`packages/tokens` e de `apps/backoffice`.

**A linha que define o mínimo:** são exatamente os especificadores **alcançáveis a
partir de um subpath publicado**. `index.ts` é o subpath `.`; `palette.ts` é o
subpath `./palette`; `hatch.ts`, `source.ts` e o módulo gerado não têm importação
relativa própria, então o fecho transitivo termina ali. Medido pela construção:
com os cinco, uma construção que importa os oito subpaths conclui, `pnpm -r exec
tsc --noEmit` passa, a árvore de rotas não muda e os 15 testes da aplicação
passam.

**O levantamento anterior dizia três, em um arquivo, e estava incompleto** porque
media só o barril de átomos. `@chargebr/tokens/palette` é subpath publicado
também, e alcança `./source.js` — a terceira reprovação da construção.

**Por que os outros dezesseis especificadores relativos de `packages/tokens/src`
ficam como estão:** nenhum é alcançável por subpath publicado — são o
construtor de tokens, a validação e os relatórios, que rodam sob Node. Mudá-los
seria mexer no que medição nenhuma deste ciclo toca. **E a inconsistência deixa de
ser risco silencioso por causa da obrigação central:** se alguém tornar um deles
alcançável, a construção reprova nomeando o especificador. A linha não depende de
ninguém lembrar dela.

**Alternativa descartada:** uniformizar os vinte e um. Descartada pelo mesmo
argumento, invertido — alteração sem defeito medido, num pacote cuja geração é
garantida determinística por `design-tokens`.

### D5. Os SVGs passam a ser publicados, e cada consumidor declara o seu empacotador

**Decisão:** `@chargebr/ui` publica os dois arquivos de marca em `exports`, com
chaves que não expõem caminho interno. A aplicação importa o subpath publicado e
declara, em arquivo versionado próprio, o que o empacotador dela devolve num
import de imagem.

**Por quê:** sem subpath publicado, a aplicação só alcançaria o arquivo por
caminho interno do pacote, que `workspace-verification`, "Fronteira da
aplicação", reprova. **Medido:** com o subpath publicado, a importação da
aplicação passa pelo lint de perímetro e pela checagem de tipos, e a construção
emite o arquivo com nome versionado por conteúdo.

A declaração versionada na aplicação é necessária porque `next-env.d.ts` — que é
quem declara isso hoje — é ignorado pelo versionamento e está fora da checagem de
tipos da aplicação, por decisão anterior. **Medido:** sem a declaração, a
checagem de tipos da aplicação reprova no import do arquivo de marca; com ela,
passa. O arquivo referencia os tipos de imagem do framework e nada mais — não
alcança artefato de construção, que é o que motivou a exclusão original.

**Efeito colateral bem-vindo:** `@chargebr/ui` passa de quatro para seis
subpaths, e a prova deste ciclo cobre os dois novos **sem ninguém editar o
teste** — é a lista descoberta fazendo o trabalho que ela existe para fazer.

### D6. `variant` permanece, e o risco está registrado

**Decisão:** `Logo` mantém `variant`, que declara a forma da marca e é o que o
atributo de forma carrega. A URL e a forma entram como propriedades
independentes.

**Por quê:** a trilha usa o selo isolado e a moldura usa o horizontal, e o
atributo de forma é o que a bancada lê para distinguir os dois. Remover `variant`
tiraria essa distinção do elemento renderizado sem nada em troca.

**Risco registrado:** nada impede quem compõe de passar a URL de uma forma com a
declaração da outra. O componente não tem como conferir — não lê o arquivo. O
efeito é um atributo de forma que mente, sem consequência visual. **O que faria
mudar de ideia:** um consumidor em que o atributo de forma passe a decidir estilo;
aí a divergência vira defeito visível e o par precisa entrar junto.

### D7. O que este ciclo não mecaniza, e por quê

Três obrigações ficam aplicadas por revisão, e estão aqui para não parecerem
esquecimento:

- **Pacote não declara tipos do empacotador de quem o consome** — ver D2, "o que
  fica sem prova própria".
- **A aplicação não precisa usar o que importa para provar consumo.** Importar é
  o que a construção precisa; usar é decisão de produto. O requisito diz isso
  explicitamente, para que ninguém leia a rota de prova como promessa de produto.
- **A rota de prova não é rota de negócio.** Segue o precedente de `/prova/[id]`,
  que existe para exercitar a forma resolvida por requisição e está declarada
  como prova no próprio arquivo.

### D8. O ponto aberto que este ciclo registra

**Decisão:** o arquivamento registra em `docs/pontos-abertos.md`: **`color-scheme`
não é declarado em lugar nenhum da camada de tokens**, e a consequência — barra de
rolagem e controle nativo pintados pelo navegador contra o tema — já existe hoje no
tema escuro resolvido pela preferência do sistema. **Gatilho:** o próximo ciclo da
camada de tokens.

**Medido:** varredura por `color-scheme` em
`packages/tokens/generated/tokens.css`, `packages/tokens/src/build.ts` e
`apps/backoffice/app/global.css` volta vazia; `docs/maquete-navegacao.html`, que é
o alvo visual, o declara.

**Por que registrar e não consertar:** não foi criado por este ciclo, não bloqueia
nada, e declarar `color-scheme` é mudança na camada de tokens — outra capacidade,
outro ciclo.

## Risks / Trade-offs

- **O documento entregue passa de uma para duas folhas de estilo, por causa da
  rota de prova** → medido em cerca de +1,5 KB comprimido, com as duas
  alternativas comparadas em D3 e o gatilho de reabertura escrito.
- **A cascata de treze arquivos torna a mudança larga para dois defeitos** →
  aceito; a largura é a propagação de uma propriedade por três componentes e seus
  arquivos de prova, não lógica nova. O `tsc` enumerou cada ponto.
- **A aplicação passa a ter um arquivo de declaração de tipos que duplica parte do
  que `next-env.d.ts` declara** → aceito e registrado em D5: a alternativa é
  reverter a exclusão de um arquivo que o versionamento ignora, contra requisito
  vigente.
- **A rota `/prova/subpaths` é um endpoint público que existe só para a prova** →
  mesmo precedente de `/prova/[id]`, declarada como prova no arquivo e na lista de
  rotas; responde texto e não lê dado nenhum.
- **`packages/tokens/src` fica com dois estilos de especificador relativo** →
  aceito, com a linha de D4 escrita e guardada pela obrigação central.
- **A mentira de tipo pode voltar sem reprovar, se vier junto com uma forma que
  funciona** → dito por escrito em D2; o que reprova é toda forma quebrada.
- **O ciclo `theme-choice` fica com design desatualizado** → registrado na
  proposta: o conserto de resolução sai do design dele (D8 de lá) e entra neste, e
  o número muda — três especificadores para cinco. A dependência `lucide-react`
  continua sendo dele. A emenda é do ciclo dele, quando voltar.
