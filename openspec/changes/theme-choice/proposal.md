# Proposal

## Why

O dono decidiu que o botão de claro/escuro vai para o cabeçalho do conteúdo, como
em `docs/maquete-navegacao.html`. Isso **reverte uma decisão registrada em dois
lugares**, e os dois são tratados aqui: o requisito "Tema sem script" de
`openspec/specs/backoffice-shell/spec.md` e o comentário de
`apps/backoffice/app/layout.tsx`, que diz "Nenhum atributo de tema, e nenhum
script de tema". Revogar só um deixaria a instrução viva a um salto de distância
— o erro consertado em setembro com a seção de domínio de `openspec/config.yaml`,
onde a regra saiu de um lugar e continuou valendo no outro.

O próprio requisito antigo já nomeia o que este ciclo deve entregar, no bloco
`**Por quê:**`: "o dia em que o shell a oferecer, este requisito muda e o script
que a implemente passa a precisar de **exigência própria sobre a posição dele no
documento entregue**". Essa é a obrigação central do ciclo, não um detalhe: um
script de tema que roda depois da primeira pintura entrega flash do tema errado a
quem escolheu claro. A posição é a garantia, e é observável no documento emitido.

**Estado atual, medido nesta proposta, não lido de memória:**

- `apps/backoffice/tests/emitted-document.test.ts` tem 12 testes e 21 asserções.
  A construção da aplicação é pré-renderizada: `/`, `/_global-error` e
  `/_not-found` emitem documento; `/prova/[id]` é resolvida por requisição.
- A varredura "nenhum script emitido menciona o atributo de tema" **já alcança um
  script inline do documento**, porque a fonte do script viaja no artefato de
  servidor do layout. Medido: com o script plantado em `app/layout.tsx`, a
  varredura reprovou nomeando `server/chunks/ssr/_0qy5_a1._.js`. O alvo da
  varredura não precisa mudar; só o número esperado.
- O requisito vivo obriga "O documento emitido SHALL NOT **mencionar** o atributo
  de tema", e **nenhum cenário prova essa cláusula**: os dois cenários de tema
  leem o atributo do elemento raiz e varrem os artefatos de script. A cláusula
  cai neste ciclo, e o que entra no lugar dela é afirmado por cenário próprio.
- `apps/backoffice` **não consegue importar `@chargebr/ui/atoms` hoje**. Medido:
  a construção falha com `Module not found: Can't resolve
  '../generated/tokens.js'` — o barril de átomos arrasta `hatch.tsx` e
  `hatch-pattern.tsx`, que importam `@chargebr/tokens`, cujo `src/index.ts`
  referencia o módulo gerado pela extensão `.js` que o empacotador da aplicação
  não resolve (o arquivo é `tokens.ts`). Nada no portão reprova por isso, porque
  nenhum arquivo da aplicação importa o subpath.

## What Changes

- **O requisito "Tema sem script" é MODIFICADO, nunca removido.** Três das quatro
  obrigações continuam valendo: a construção não fixa tema, a folha de tokens
  segue fora da varredura, e a moldura segue exercitada nos dois temas. Muda
  uma: um script emitido pode conhecer o atributo de tema — **exatamente um** —, e
  esse script passa a ter **exigência própria de posição** no documento entregue.
  O requisito também é renomeado, porque "sem script" deixa de descrever o que
  ele obriga.

- **A escolha é de quem lê, com três estados e um botão.** Ausência de atributo é
  "segue o sistema", e é o estado inicial — a camada de tokens já entrega isso em
  CSS puro. O botão alterna claro e escuro, e a escolha passa a valer e sobrevive
  a uma visita posterior. "Seguir o sistema" é o padrão, não uma terceira posição
  de controle: a maquete tem um botão, e expor três exigiria um grupo.

- **O mecanismo é script inline no `<head>`, e a alternativa foi medida e
  descartada por escrito.** Medido nesta proposta, com protótipo descartável:
  lendo a escolha de um cookie no servidor, a rota raiz **deixa de ser
  pré-renderizada** — `/` e `/_not-found` saem do manifesto de pré-renderização,
  os documentos emitidos caem de cinco para dois, `server/app/index.html` deixa de
  existir e **10 dos 12 testes** de `emitted-document.test.ts` reprovam, sete
  deles por falta do documento. Com o script inline, a árvore de rotas não muda e
  **11 dos 12 testes continuam passando** — reprova só o da varredura de tema, que
  é exatamente o que este ciclo altera. `design.md`, D1, tem a medição completa.

- **`AppFrame` ganha um slot de ação no cabeçalho**, `action`, opaco como `nav` e
  `rail` já são, sem exigir nenhuma outra propriedade e sem `"use client"`. Quem
  passa o slot entrega um componente de cliente já pronto, o mesmo padrão do slot
  de navegação. O slot **não** altera a forma da moldura: `data-shape="shell"`
  continua condicionado a `rail` ou `nav`, e não a `action`.

- **O controle é montado na aplicação**, em `apps/backoffice/app/_components/`,
  com o `Button` e o `Icon` que já existem. O mecanismo toca `document`,
  armazenamento e renderização no servidor: é fiação de aplicação, não inventário
  genérico. Se um segundo aplicativo duplicar, aí é o gatilho para promover.

- **Todo texto do controle entra por propriedade individual:** o rótulo para ir ao
  claro, o rótulo para ir ao escuro e o nome acessível do controle.

- **Um único lugar conhece o atributo de tema.** O script inline é o dono do
  atributo e da chave de armazenamento, e instala o aplicador que o controle
  chama; o controle nunca escreve o atributo. **Medido:** com o controle
  escrevendo o atributo por conta própria, **três** artefatos de script emitidos
  passam a mencioná-lo (dois de servidor e um de navegador); com o controle
  chamando o aplicador, **exatamente um** o menciona.

- **A resolução de importação é consertada no mínimo necessário.** Três
  especificadores em `packages/tokens/src/index.ts` passam a nomear o arquivo
  TypeScript que existe, e `allowImportingTsExtensions` entra nas configurações de
  tipos de `packages/tokens` e de `apps/backoffice`. Medido: com isso a construção
  da aplicação passa a resolver `@chargebr/ui/atoms` e `pnpm -r exec tsc --noEmit`
  segue verde. `lucide-react` entra como dependência de `apps/backoffice`, porque
  o ícone do controle é decisão da aplicação e `Button` o recebe por propriedade.

- **As provas são duas, e as duas têm plantio.** A posição do script é afirmada
  sobre o documento emitido e tem de ser vista reprovar: movido para o corpo, a
  afirmação falha nomeando onde o script foi encontrado. A varredura dos scripts
  emitidos continua afirmando que achou script, e passa a exigir que exatamente um
  conheça o atributo: plantando um segundo, reprova nomeando os que mencionam.

- **Um ponto aberto novo**, com gatilho: nada prova que um subpath publicado por um
  pacote **resolve** na construção da aplicação enquanto ninguém o importar. Este
  ciclo conserta a ocorrência que encontrou e não generaliza a prova.

## What This Does Not Do

- **Não cria componente novo em `@chargebr/ui`.** A única mudança no pacote é o
  slot `action` em `AppFrame`. Nenhum átomo, nenhuma molécula, nenhum organismo
  novo, e nenhum token novo.
- **Não expõe "seguir o sistema" como posição de controle.** O botão tem duas
  posições; o terceiro estado é a ausência de escolha, e volta a valer só se a
  escolha guardada for apagada por fora.
- **Não troca o ícone do controle por tema.** O controle mostra um ícone estável, e
  a direção da ação é anunciada pelo nome acessível. As duas alternativas — ícone
  resolvido por script depois da montagem, e ícone escolhido por CSS — estão
  descartadas por escrito em `design.md`, D4: a primeira troca o ícone depois da
  primeira pintura, que é o defeito que este ciclo existe para recusar; a segunda
  repetiria na aplicação as duas condições de tema que a camada de tokens possui,
  e a defasagem dessa cópia não tem como ser vista reprovar.
- **Não lê tema no servidor, e não introduz cookie.** A rota raiz continua
  pré-renderizada.
- **Não toca `prefers-reduced-motion`.** O ponto 15 de `docs/pontos-abertos.md`
  recusou a prova, sem gatilho de reabertura, e este ciclo não a reabre.
- **Não declara `color-scheme`.** A camada de tokens não o declara hoje — medido
  por varredura em `packages/tokens/generated/tokens.css`,
  `packages/tokens/src/build.ts` e `apps/backoffice/app/global.css` — e a
  consequência (barra de rolagem e controle nativo pintados pelo padrão do
  navegador, não pelo tema) **já existe** no tema escuro resolvido pela
  preferência do sistema. Não é defeito criado por este ciclo, e decidir sobre
  `color-scheme` é mudança na camada de tokens, não aqui.
- **Não liga `nav` nem `rail` a `apps/backoffice`.** Continua sem região de
  navegação, pela razão que o requisito "Regiões da moldura no documento entregue"
  já registra: não existe rota de negócio para listar.
- **Não generaliza a prova de resolução de subpath publicado.** Conserta a
  ocorrência medida e registra o ponto aberto com gatilho.
- **Não reescreve os outros 18 especificadores relativos de
  `packages/tokens/src`.** Só os três que a construção da aplicação alcança,
  porque mudar os outros é mexer no que nenhuma medição deste ciclo toca.
- **Não corrige o `src` da imagem de marca no documento emitido.** Medido na
  árvore da main, antes de qualquer sonda: o cabeçalho emite
  `<img src="[object Object]" alt="ChargeBR">`. É defeito anterior a este ciclo,
  que nenhuma asserção pega porque a afirmação existente lê o nome acessível;
  consertá-lo é outro ciclo.
- **Não cria história para o controle.** A bancada do Storybook enxerga
  `packages/ui/src/**/*.stories.tsx`, e o controle vive na aplicação. O slot, que
  vive no pacote, ganha história; o controle é provado por execução nos testes da
  aplicação e pelo documento emitido. `design.md`, D6, registra isso e o que o
  mudaria.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `backoffice-shell`: o requisito "Tema sem script" é modificado e renomeado — um
  script emitido pode conhecer o atributo de tema, exatamente um, com exigência
  própria de posição no documento entregue; as outras três obrigações
  permanecem. A capacidade recebe também dois requisitos novos: o slot de ação
  opaco no cabeçalho da moldura, e a escolha explícita de tema com os três
  estados e o texto por propriedade individual.

Nenhuma outra capacidade recebe delta. Em particular:

- **`shell-components` não muda.** O slot é uma propriedade de `AppFrame`, cujas
  obrigações moram em `backoffice-shell` — é lá que vive o slot de navegação
  opaco, pela mesma razão.
- **`workspace-verification` não muda** por causa do conserto de resolução. O que
  quebra sem o conserto já reprova hoje: a construção da aplicação roda dentro de
  `verify:test`, e importação que não resolve derruba a construção, nomeando o
  especificador. Um requisito novo não acrescentaria nada que o portão já não
  prove assim que o primeiro arquivo importar o subpath — e é essa dependência de
  "assim que alguém importar" que o ponto aberto registra.
- **`design-tokens` não muda.** O conserto troca a forma de escrever o
  especificador de um módulo, não o que a camada de tokens garante.

## Impact

- `openspec/specs/backoffice-shell/spec.md`: um requisito modificado e renomeado,
  dois requisitos novos. Aplicado no arquivamento (PR 3).
- `packages/ui/src/organisms/app-frame/app-frame.tsx` e
  `app-frame.module.css`: a propriedade `action` e o lugar dela no cabeçalho.
  `app-frame.stories.tsx` e `app-frame.typecheck.tsx` recebem o que prova o slot.
- `apps/backoffice/app/layout.tsx`: o comentário que proíbe script de tema é
  substituído pelo que passa a valer, o script entra no `<head>` e o controle
  entra pelo slot `action`.
- `apps/backoffice/app/_components/`: o módulo com a fonte do script e o contrato
  do aplicador, e o controle de cliente.
- `apps/backoffice/tests/`: `emitted-document.test.ts` muda a asserção da
  varredura e ganha as afirmações de posição e de presença do controle; dois
  arquivos de teste novos provam o script e o controle por execução.
- `apps/backoffice/vitest.config.ts` e `apps/backoffice/tsconfig.json`: a inclusão
  de teste passa a alcançar `.tsx`, para que o teste do controle seja escrito em
  JSX e seja lido pela checagem de tipos.
- `packages/tokens/src/index.ts`, `packages/tokens/tsconfig.json` e
  `apps/backoffice/tsconfig.json`: o conserto de resolução.
- `apps/backoffice/package.json`: `lucide-react` entra em `dependencies`.
- `docs/pontos-abertos.md`: no arquivamento, o ponto novo da resolução de subpath
  publicado, com gatilho, e o cabeçalho que todo ciclo atualiza.
- Nada fora de `apps/`, `packages/`, `openspec/` e `docs/`. Nenhum script da raiz
  é alterado.
