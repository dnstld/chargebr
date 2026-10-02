# Design

## Context

Ver `proposal.md`, seção Why, para a motivação e o estado atual medido. O que
importa aqui é o que as sondas deste ciclo mediram, e o que cada medição decide.

Todas as medições abaixo foram feitas na árvore da branch deste PR, por protótipo
descartável, com `apps/backoffice` construído de verdade
(`next build`, Next.js 16.3.6, Turbopack) e com os testes do projeto
`documento emitido` executados contra a construção. Nenhum protótipo ficou na
árvore: ao fim das medições a árvore voltou a ser idêntica à `main`
(`git diff --stat main` vazio) e nenhuma linha de código entra neste PR.

Três restrições do repositório moldam o que pode ser escrito:

- A camada de tokens resolve claro e escuro **em CSS**, por
  `@media (prefers-color-scheme: dark)` sobre `:root:not([data-theme="light"])` e
  por `:root[data-theme="dark"]`. Ausência de atributo é "segue o sistema", e é de
  graça. O atributo `data-theme` é o contrato publicado por essa camada.
- `apps/backoffice/tests/emitted-document.test.ts` prova a aplicação pelo
  **documento que a construção emite**, em 12 testes e 21 asserções, e todas elas
  dependem de a rota raiz ser pré-renderizada.
- A bancada do Storybook enxerga `packages/ui/src/**/*.stories.tsx`. Componente da
  aplicação não tem história — o que está em `apps/` é provado pelo documento
  emitido e pelos testes do projeto da aplicação.

## Goals / Non-Goals

**Goals:**

- Decidir o mecanismo da escolha de tema por medição, não por inclinação, e
  registrar a descartada por escrito.
- Deixar a posição do script no documento entregue como obrigação observável, com
  plantio que a faz reprovar.
- Deixar um dono só do atributo de tema, e medir que é um só.
- Deixar o ciclo implementável: nomear o obstáculo de importação que a decisão do
  dono encontra, e o conserto mínimo medido para ele.

**Non-Goals:**

- Promover o controle de tema a componente de `@chargebr/ui`. O gatilho é um
  segundo aplicativo duplicando o mecanismo.
- Resolver `color-scheme`, que a camada de tokens não declara hoje e cuja
  consequência é anterior a este ciclo.
- Generalizar a prova de que subpath publicado resolve na construção da aplicação.

## Decisions

### D1. Script inline no `<head>`, não cookie lido no servidor

**Decisão:** a escolha é guardada no armazenamento do navegador e aplicada por um
script inline no `<head>` do documento. O layout raiz continua estático.

**Medição da alternativa descartada — cookie lido no servidor.** Protótipo: o
layout raiz passa a `async` e lê a escolha de um cookie, declarando `data-theme` no
elemento raiz quando ela existe. Resultado da construção:

| O que | Antes | Com cookie no servidor |
| --- | --- | --- |
| Rotas pré-renderizadas | `/`, `/_global-error`, `/_not-found` | só `/_global-error` |
| Documentos emitidos | 5 | 2 |
| `server/app/index.html` | existe | **não existe** |
| `/404` fora da convenção | produzida | **não produzida** |
| Testes de `emitted-document.test.ts` | 12 passando | **10 reprovando**, 2 passando |

Sete das dez reprovações são a mesma: `artefato emitido não encontrado:
server/app/index.html`. A leitura de cookie no layout raiz torna **toda** a árvore
resolvida por requisição — inclusive `/_not-found` — e a camada 2 perde o objeto
dela. Não é custo de escrever alguns testes de novo: é a capacidade
`backoffice-shell` inteira ficando sem o documento sobre o qual ela afirma.

**Medição da escolhida.** Com o script inline no `<head>` e o controle montado no
cabeçalho pelo slot `action`: a árvore de rotas não muda (`/` segue
pré-renderizada, `/prova/[id]` segue resolvida por requisição), os cinco documentos
continuam sendo emitidos, e **11 dos 12 testes continuam passando** — reprova só
`nenhum script emitido menciona o atributo de tema`, que é a asserção que este
ciclo altera.

**O que faria mudar de ideia:** uma forma de ler a escolha no servidor sem tornar a
rota dinâmica. Não existe hoje: a leitura de cookie é o que marca a rota, e o
framework propaga a marca para a árvore.

### D2. A fonte do script vai no corpo do elemento, não por `dangerouslySetInnerHTML`

**Decisão:** o script é escrito como `<script>{THEME_SCRIPT}</script>`, com a fonte
como conteúdo de texto do elemento.

**Medido:** com `dangerouslySetInnerHTML`, `biome lint` reprova —
`lint/security/noDangerouslySetInnerHtml`, em `apps/backoffice/app/layout.tsx` —, e
contornar exigiria a **primeira supressão de lint do repositório** (`grep` por
`biome-ignore` em `apps/`, `packages/`, `tools/` e `biome.json` volta vazio). Com a
fonte como conteúdo de texto, `biome lint` e `biome format` passam, a checagem de
tipos passa, e o React 19 emite o texto **cru**: medido com uma fonte contendo `<`,
`>` e `&&`, os três chegaram ao documento sem escapar.

**Consequência registrada:** porque o texto é emitido cru, a fonte do script não
pode conter a sequência que fecha o elemento. É restrição de escrita da fonte, não
de comportamento, e cabe no comentário do módulo que a carrega.

**Alternativa considerada:** `next/script` com execução antes da interação.
Descartada sem protótipo próprio: ela resolve o mesmo problema que
`<script>{...}</script>` resolve, acrescentando dependência de um comportamento do
framework sobre onde o script é injetado — e é exatamente a posição que este ciclo
precisa afirmar sobre o documento. O que a reabriria é a forma escolhida parar de
emitir o script dentro do `<head>`.

### D3. Um dono só do atributo: o script instala o aplicador, o controle o chama

**Decisão:** o script inline é o único lugar que conhece o atributo de tema e a
chave de armazenamento. Ele instala, no documento vivo, um aplicador com duas
operações — aplicar uma escolha e dizer qual é o tema resolvido —, e o controle
chama esse aplicador. O controle nunca escreve o atributo.

**Medido, sobre os artefatos de script emitidos pela construção:**

| Protótipo | Artefatos que mencionam o atributo |
| --- | --- |
| Controle escreve o atributo por conta própria | **3** — dois de servidor e um de navegador |
| Controle chama o aplicador instalado pelo script | **1** — o artefato de servidor que carrega a fonte do script |

A varredura de hoje já alcança o script inline porque a fonte dele viaja no
artefato de servidor do layout. Por isso a obrigação "exatamente um" é verificável
sem mudar o alvo da varredura, e a decisão de ter um dono só é o que a torna
satisfazível.

**Alternativa considerada:** o controle escreve o atributo, e a obrigação passa a
ser "no máximo três, estes três". Descartada por duas razões medidas: o conjunto
esperado passaria a depender de como o empacotador fatia os artefatos, que muda sem
aviso; e três lugares que escrevem o mesmo atributo são três decisões sobre o mesmo
estado, que é o defeito que a obrigação existe para recusar.

**Alternativa considerada:** o controle escrever por `dataset.theme` em vez do nome
do atributo. **Descartada, e é importante dizer por quê:** a varredura passaria,
porque a fonte não conteria a cadeia procurada — e o controle continuaria
escrevendo o atributo. Seria a prova passando pela razão errada, o caso 1 de
`proof-falsifiability` na forma de cadeia de texto.

**O que faria mudar de ideia:** uma forma de o controle aplicar a escolha sem
conhecer nem o atributo nem um nome instalado pelo script. Não achei: o atributo
está no elemento raiz, fora da árvore que o React da aplicação controla.

### D4. O ícone do controle não muda por tema

**Decisão:** o controle mostra um ícone estável, decorativo, e a direção da ação é
anunciada pelo nome acessível (D5). O ícone não é escolhido por tema.

Isto **se afasta do alvo visual**: `docs/maquete-navegacao.html` troca sol por lua
conforme o tema corrente. A decisão é tomada aqui, por escrito, para que o dono a
reverta no PR da proposta se quiser o contrário — e não escondida numa
implementação.

**Alternativa 1: ícone resolvido por script depois da montagem.** Descartada. O
documento é pintado com o tema correto, porque o atributo é declarado antes da
primeira pintura; o ícone, não — ele é decidido na renderização do servidor, que não
tem como saber o tema, e só seria corrigido na hidratação. O resultado é uma troca
visível de ícone depois da primeira pintura, que é a mesma família de defeito que
este ciclo existe para recusar, só que no ícone em vez de na superfície.

**Alternativa 2: ícone escolhido por CSS, com os dois ícones renderizados.**
Descartada, e não por gosto: a regra precisaria repetir, na aplicação, as **duas
condições de tema** que a camada de tokens possui — a de preferência do sistema e a
do atributo. A cópia fica defasada em silêncio se a camada de tokens mudar o
mecanismo, e **não há como ver essa defasagem reprovar**: o controle vive na
aplicação, que não tem bancada de navegador, e condição de mídia não é avaliada no
ambiente de teste da aplicação. Prova que não pode ser vista reprovar não é prova
(`openspec/config.yaml`, `rules.specs`).

**O que faria mudar de ideia:** a camada de tokens publicar um sinal que a aplicação
possa consumir sem repetir as condições — e aí o dono da condição continuaria sendo
quem já é —, ou uma bancada de navegador para a aplicação, que este ciclo não cria.

### D5. O nome acessível é genérico antes da resolução e direcional depois

**Decisão:** o controle recebe três textos por propriedade — o rótulo para ir ao
claro, o rótulo para ir ao escuro e o seu nome acessível. No documento emitido,
antes de o script ter sido executado no navegador, o controle anuncia o nome
acessível declarado; depois de o tema corrente ser resolvido, anuncia o rótulo da
direção que a ativação produz.

**Por quê:** a direção depende do tema corrente, e o tema corrente não é conhecido
na renderização do servidor — nem pela preferência do sistema, que é do navegador,
nem pela escolha guardada, que é do navegador também. Anunciar "ir para o escuro" a
quem já está no escuro é pior do que anunciar a ação genérica. Os três textos
existem por isso, e cada um tem um estado em que é o correto.

**Consequência aceita:** o nome acessível muda uma vez, depois da hidratação. É
mudança no documento vivo, não no emitido, e não é flash visual — o ícone é
estável (D4).

**Alternativa considerada:** nome acessível fixo, com a direção só no ícone.
Descartada: o ícone é decorativo e não é anunciado, então a direção deixaria de
existir para quem usa leitura assistida.

### D6. O controle vive na aplicação, e a prova dele também

**Decisão:** o controle fica em `apps/backoffice/app/_components/`, com o `Button` e
o `Icon` que já existem. `@chargebr/ui` recebe só o slot.

**De onde vem a prova, já que a bancada não alcança a aplicação:**

- **A fonte do script** é um módulo da aplicação, e o teste **executa essa fonte**
  num documento de teste: sem escolha guardada, com cada uma das duas escolhas, com
  valor inválido guardado, e com o acesso ao armazenamento lançando erro. O objeto
  da prova é a cadeia que vai para o documento, não uma reimplementação dela.
- **O controle** é montado e acionado no mesmo projeto de testes da aplicação.
  **Medido:** com `react-dom/client` e `act`, em `happy-dom`, um evento de clique
  comum dispara o `onPress` do `Button` de `react-aria-components` — o teste da
  sonda passou. Não é preciso bancada de navegador nem dependência nova para
  provar a ativação.
- **A presença e o nome acessível** no cabeçalho são afirmados sobre o documento
  emitido, que é onde eles importam.

**O que faria mudar de ideia sobre o lugar do controle:** um segundo aplicativo
duplicando o mecanismo — o gatilho que o dono já nomeou.

**Limite registrado:** `tools/checks/component-vocabulary.test.ts` tem perímetro
fechado, todo sob `packages/ui/src`, e **não alcança a aplicação — e não deve**: a
aplicação é quem declara o texto dela, como `no-product-notice.tsx` já faz. O que
obriga o controle a receber texto por propriedade é o tipo: as três propriedades são
exigidas, e um uso sem elas não compila. É essa a prova nomeada no cenário.

### D7. `action` não entra na condição da forma da moldura

**Decisão:** `AppFrame` continua condicionando `data-shape="shell"` à presença de
`rail` ou de `nav`. `action` fica fora dessa condição.

**Por quê:** `apps/backoffice` **passa** `action` e não passa `rail` nem `nav`. Se
`action` entrasse na condição, a aplicação receberia a grade da maquete — trilha,
painel e barra de conteúdo — sem ter trilha nem painel, e o documento emitido
mudaria de regiões e de ordem de foco por causa de um botão. **Medido:** com
`action` fora da condição e o controle passado pela aplicação, as onze outras
afirmações do documento emitido continuaram passando.

**Prova de que a decisão é sustentada, e não combinada:** o cenário planta `action`
na condição da forma e a história só com `action` reprova nomeando o atributo de
forma encontrado.

### D8. O conserto de resolução é o mínimo que a medição exige

**Decisão:** três especificadores de `packages/tokens/src/index.ts` passam a nomear
o arquivo TypeScript que existe, e `allowImportingTsExtensions` entra nas
configurações de tipos de `packages/tokens` e de `apps/backoffice`.

**O obstáculo, medido:** `apps/backoffice` não consegue importar
`@chargebr/ui/atoms`. O barril de átomos exporta `Hatch` e `HatchPattern`, que
importam `@chargebr/tokens`, cujo `src/index.ts` referencia
`../generated/tokens.js` e `./hatch.js` — especificadores corretos para a resolução
que o pacote usa, e que o empacotador da aplicação não resolve, porque os arquivos
são `.ts`. A construção falha com `Module not found: Can't resolve
'../generated/tokens.js'`. Hoje nada reprova por isso: nenhum arquivo da aplicação
importa o subpath.

**Medido, do conserto:** com os três especificadores e a bandeira nas duas
configurações, a construção da aplicação passa, `pnpm -r exec tsc --noEmit` passa, e
a árvore de rotas não muda.

**Alternativas consideradas:**

1. **Reescrever os 21 especificadores relativos de `packages/tokens/src`.**
   Descartada: 18 deles não são alcançados por nenhuma importação da aplicação, e
   mudá-los é mexer no que medição nenhuma deste ciclo toca. O preço é a
   inconsistência dentro do pacote, registrada em Risks.
2. **Publicar um subpath estreito em `@chargebr/ui` só para o `Button`.**
   Descartada: fragmenta o contrato do pacote, que hoje publica por camada
   (`.`, `/atoms`, `/charts`, `/shell`), e deixaria o barril de átomos continuando
   sem resolver para a aplicação — o obstáculo ficaria de pé, escondido.
3. **Gerar um módulo JavaScript ao lado do TypeScript gerado.** Descartada: o
   pacote passaria a publicar dois artefatos do mesmo conteúdo, e a geração é
   justamente o que a capacidade `design-tokens` garante determinística.

### D9. `lucide-react` entra como dependência da aplicação

**Decisão:** `lucide-react` entra em `dependencies` de `apps/backoffice`, na mesma
versão que `@chargebr/ui` fixa.

**Por quê:** `Button` recebe o ícone **por propriedade**, e `Icon` nunca nomeia um
ícone específico — é a regra do pacote. Quem nomeia o ícone é quem compõe, e aqui
quem compõe é a aplicação. **Medido:** sem a dependência, a checagem de tipos da
aplicação reprova com `Cannot find module 'lucide-react'`. Não há como a aplicação
escolher um ícone sem poder nomeá-lo.

### D10. A inclusão de teste da aplicação passa a alcançar `.tsx`

**Decisão:** `apps/backoffice/vitest.config.ts` e `apps/backoffice/tsconfig.json`
passam a incluir arquivo de teste `.tsx`.

**Por quê:** o teste que monta o controle é um teste de React, e escrevê-lo sem JSX
— com chamadas de criação de elemento — é menos legível sem ganhar nada. As duas
listas são declaradas à mão e precisam ser mudadas juntas: só na de testes, a
checagem de tipos não leria o arquivo e um erro de tipo nele passaria calado; só na
de tipos, o teste não seria coletado. `apps/backoffice/tests/type-stage-inputs.test.ts`
já afirma sobre o que a etapa de tipos lê, derivando a lista do `tsc`, e continua
valendo sem edição.

### D11. A posição exigida é "dentro do `<head>`", e não "antes do estilo"

**Decisão:** a obrigação de posição é estar dentro do `<head>`, com a fonte no
corpo do elemento. O requisito **não** exige preceder a referência de estilo.

**Medido:** a aplicação não escolhe a posição dentro do `<head>`. Com o script
renderizado como único filho de `<head>`, o documento emitido o põe depois da
referência de estilo que o framework injeta e depois dos cinco scripts assíncronos
de carregamento — a referência de estilo cai no começo do `<head>` em qualquer
caso. Exigir "antes do estilo" seria escrever obrigação que a aplicação não tem
como cumprir.

**E não há defeito a perseguir ali**, pelo comportamento do navegador e não por
medição nesta árvore — está dito assim de propósito: folha de estilo referenciada
no `<head>` bloqueia a pintura, de modo que nenhuma pintura acontece antes de ela
carregar, e o script inline é executado antes de o corpo ser lido nas duas ordens.
O que separa
"sem flash" de "com flash" é estar no `<head>` ou no corpo — e é essa a fronteira
que o plantio atravessa. **Medido:** com o script movido para o corpo, o documento
emitido o entrega depois do fim do `<head>`, e uma afirmação de posição distingue os
dois casos.

**Esta é a única decisão deste design que se afasta da forma pedida na instrução do
dono** ("move ele para depois do estilo ou para o corpo e a prova falha"): a metade
"para o corpo" é exigida e provada; a metade "depois do estilo" não é exigida,
porque é onde o framework já o põe. **O que me faria mudar de ideia:** uma medição
de pintura, em navegador real, mostrando flash com o script depois da referência de
estilo e sem flash antes dela. Não a fiz, e não sei como fazê-la sem bancada de
navegador na aplicação.

### D12. O ponto aberto que este ciclo registra

**Decisão:** o arquivamento registra um ponto aberto novo em
`docs/pontos-abertos.md`: **nada prova que um subpath publicado por um pacote
resolve na construção da aplicação enquanto nenhum arquivo da aplicação o
importar.** **Gatilho:** o próximo ciclo que publicar subpath novo em um pacote, ou
que importar de uma aplicação um subpath que nenhuma aplicação importava.

**Por quê registrar em vez de consertar:** a prova geral seria enumerar os subpaths
do mapa de exportações de cada pacote e exigir que cada um resolva na construção —
uma prova de cobertura de lista descoberta, não declarada. É trabalho de ciclo
próprio, e fazê-lo aqui ampliaria este ciclo para dentro da capacidade de
verificação. O que não pode ficar sem registro é o aviso: o defeito que este ciclo
encontrou estava de pé desde que o subpath foi publicado, e passou calado porque
nenhum arquivo da aplicação o importava.

## Risks / Trade-offs

- **O script inline é fonte JavaScript escrita como cadeia de texto, fora da
  checagem de tipos** → mitigado por o teste **executar essa cadeia** nos quatro
  casos do requisito, em vez de testar uma reimplementação dela; se a cadeia
  quebrar, o teste reprova.
- **A fonte do script não pode conter a sequência que fecha o elemento** (D2) →
  registrado no comentário do módulo que a carrega; o teste que executa a fonte
  reprovaria com erro de sintaxe se alguém a quebrasse.
- **Um nome instalado no documento vivo é contrato implícito entre o script e o
  controle** → mitigado pelo tipo declarado no módulo do script, que o controle
  consome; o preço de não ter esse nome é três scripts conhecendo o atributo (D3).
- **`packages/tokens/src` fica com dois estilos de especificador relativo** — três
  com extensão do arquivo real e 18 com a extensão de módulo — → aceito e
  registrado. O próximo arquivo do pacote que a aplicação alcançar vai falhar do
  mesmo jeito, e o ponto aberto de D12 é o aviso. Uniformizar agora é mudança no
  pacote de tokens que nenhuma medição deste ciclo pede.
- **O ícone estável se afasta da maquete** (D4) → decidido por escrito, com as duas
  alternativas e as medições, para que a reversão seja do dono e no PR da proposta.
- **O nome acessível muda uma vez depois da hidratação** (D5) → aceito; a
  alternativa é anunciar uma direção que pode estar errada.
- **A escolha vive no armazenamento do navegador e não acompanha quem lê entre
  dispositivos** → aceito. Escolha por pessoa exige identidade, que não existe
  nesta fase, e cookie lido no servidor custa a capacidade inteira (D1).
- **`action` é a quinta propriedade de conteúdo de `AppFrame`** (`children`, `nav`,
  `rail`, `action`, mais o texto) → aceito; ela nasce separada de `nav` pela mesma
  razão que `rail` nasceu, e não exige nenhuma outra propriedade.
