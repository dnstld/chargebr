# Desenho — o que quebra na primeira rota dinâmica

## Context

Ver `proposal.md` — Why, e `specs/` para as exigências. O que restringe este
desenho, e já está provado ou foi medido:

- A camada 2 roda dentro do estágio de testes: `apps/backoffice/tests/build.setup.ts`
  apaga `.next/` e executa `next build` uma vez por execução;
  `emitted-document.test.ts` lê o que foi emitido. Toda leitura de artefato
  passa por `readEmitted`, que reprova com o caminho quando o arquivo não existe.
- A trava atual é `DECLARED_DOCUMENTS`: cinco caminhos de documento, comparados
  nos dois sentidos com todo `.html` sob `.next/`.
- A camada 3 não existe (ponto 1). Nenhuma decisão abaixo depende dela.
- As medições da proposta foram feitas numa worktree descartável de `main`, com
  as versões fixadas do repositório: Biome 2.5.14, Next.js 16.3.6 (Turbopack),
  TypeScript 5.9.3. A worktree foi removida; nada dela entra em PR.

## Goals / Non-Goals

**Goals**

- Que nenhuma rota entre na aplicação sem que a verificação a veja, qualquer que
  seja a forma de entrega.
- Que o que a camada 2 não alcança fique **declarado**, rota a rota, e não
  implícito.
- Que a correção do falso positivo não abra passagem nova para outra aplicação.

**Non-Goals**

- Provar conteúdo de rota resolvida por requisição.
- Fixar regra de mapeamento de rota para caminho de documento.
- Decidir o modelo de entrega das telas de dado.

## Decisions

### A camada 2 afirma sobre a lista de rotas, e cada rota declara sua forma

A alternativa de exigir pré-renderização e a de declarar fora do alcance estão
discutidas em `proposal.md`. Aqui, o que decide a forma do código:

A declaração passa de uma lista de documentos a dois mapas de rotas — um para
a convenção de rotas da aplicação, com forma, e um para as rotas que o
framework gera sozinho fora dela, sem forma:

```ts
type Delivery =
  | { form: "prerendered"; documents: readonly string[] }
  | { form: "on-demand" };

const DECLARED_ROUTES: Readonly<Record<string, Delivery>> = {
  "/": { form: "prerendered", documents: ["server/app/index.html"] },
  // …
  "/prova/[id]": { form: "on-demand" },
};

const FRAMEWORK_ROUTES: Readonly<Record<string, readonly string[]>> = {
  "/404": ["server/pages/404.html"],
  "/500": ["server/pages/500.html"],
};
```

A forma `on-demand` não tem campo `documents`: não é lista vazia, é ausência de
lista. O tipo impede declarar documento para rota resolvida por requisição, e a
spec exige que ela declare nenhum. A forma `prerendered` admite lista vazia: é o
caso de uma rota de metadados, pré-renderizada e sem documento.

O conteúdo inicial dos mapas **não é suposto aqui**. A primeira tarefa da
aplicação executa a construção e registra cada rota e cada documento; os mapas
são escritos a partir desse registro. A tabela da proposta é a expectativa, não
a fonte.

### De onde vem a lista de rotas, e de onde vem a forma

Observado na construção:

| Artefato em `.next/` | O que contém | Uso |
| --- | --- | --- |
| `app-path-routes-manifest.json` | toda rota da convenção da aplicação (App Router), página ou não, inclusive a `ƒ`: `{"/page": "/", "/veiculos/[id]/page": "/veiculos/[id]", "/icon.svg/route": "/icon.svg", …}` | valores = rotas da convenção |
| `server/pages-manifest.json` | as rotas fora dela (Pages Router); numa árvore sem `pages/`, `{"/404": …, "/500": …}` | chaves = rotas fora da convenção |
| `prerender-manifest.json` (`version: 4`) | `routes` — cada caminho pré-renderizado com seu `srcRoute`; `dynamicRoutes` — cada rota com parâmetro pré-renderizada, com `fallback` | **a única fonte da forma** |

- **A lista de rotas é a união dos dois primeiros.** O Pages Router entra na
  lista porque uma página dele resolvida por requisição também não emite
  documento, e ficaria fora de uma lista feita só do App Router — o mesmo ponto
  cego, por outra porta.
- **A forma vem só de `prerender-manifest.json`, e só para rotas da
  convenção.** **Pré-renderizada** é a rota que aparece como `srcRoute` de ao
  menos uma entrada de `routes`, ou como chave de `dynamicRoutes`.
  **Resolvida por requisição** é a rota da convenção que não aparece em nenhum
  dos dois. Documento nunca entra nesse cálculo.
- **Forma mista** é a rota presente em `dynamicRoutes` com `fallback` diferente
  de `false`. Observado: lista aberta dá `fallback: null`; lista fechada com
  `dynamicParams = false` dá `fallback: false`.
- **Formato:** `prerender-manifest.json` declara `version`; a verificação
  confere `4` e reprova nomeando o encontrado. Os outros dois não declaram
  versão; a conferência deles é a forma do valor — objeto de cadeias —, e
  qualquer outra coisa reprova nomeando o arquivo.

**Por que a forma não é lida do documento.** A primeira versão desta proposta
definia as formas por "emite documento" na spec e por `prerender-manifest.json`
no design, e as duas leituras discordam — apontado na revisão e medido:
`app/icon.svg` e `app/sitemap.ts` produzem `/icon.svg` e `/sitemap.xml` na lista
de rotas, saem `○ (Static)` na classificação da construção, constam de
`routes` em `prerender-manifest.json` com `srcRoute` igual à própria rota e
`dataRoute: null`, e emitem `server/app/icon.svg.body` e `.meta` — nenhum
`.html`. Pela classificação são pré-renderizadas; pelo documento seriam
resolvidas por requisição. A classificação é a fonte porque diz o que a
construção produziu; o documento é uma das formas que a resposta produzida pode
ter, e fica na trava de documentos, que é exigência separada.

**Por que fora da convenção não há forma, e só entra o que o framework gera.**
Medido com uma pasta `pages/` plantada ao lado de `app/`:

| Página no Pages Router | Classificação | `pages-manifest.json` | Em `prerender-manifest.json` `routes` | `.html` |
| --- | --- | --- | --- | --- |
| `/estatica`, sem função de dados | `○` | `pages/estatica.html` | não | sim |
| `/ssg`, com `getStaticProps` | `●` | `pages/ssg.js` | sim | sim |
| `/ssr`, com `getServerSideProps` | `ƒ` | `pages/ssr.js` | não | não |

Nenhum artefato sozinho separa as três: `prerender-manifest.json` perde a
estática, e `pages-manifest.json` não distingue `/ssg` de `/ssr`. Classificar o
Pages Router exigiria combinar duas fontes — exatamente o que a revisão
mostrou ser frágil. A aplicação é fixada em App Router — decisão D1 de
`docs/decisao-configuracao-inicial-do-workspace.md`, repetida na stack de
`openspec/config.yaml` —, e a regra passa a ser essa: nenhuma rota fora da convenção, exceto as
que o framework gera sozinho numa árvore sem `pages/` — `/404` e `/500`,
declaradas pelo nome com seus documentos, sem forma.

A mesma medição mostrou que a presença de `pages/` muda o que o framework gera:
entram `/_app`, `/_document` e `/_error` no manifesto, `/500` sai dele e
`server/pages/500.html` continua emitido. As duas travas pegam isso — rota fora
da convenção não declarada, e documento emitido que nenhuma rota declara —, e
nenhum caso passa calado.

**Descartados:**

- *`routes-manifest.json`* — a separação `staticRoutes`/`dynamicRoutes` dele é
  pela forma do **caminho**, não da entrega: observado, `/frotas/[id]`
  pré-renderizada aparece em `dynamicRoutes`. Serviria para a lista, não para a
  forma, e a lista já vem de dois artefatos mais diretos.
- *A tabela impressa por `next build`* — é a mesma classificação, mas exigiria
  capturar a saída no `globalSetup`, e é texto de terminal: mais instável que um
  JSON.
- *Os arquivos `page.tsx` e `route.ts` da fonte* — é ler implementação, e
  exigiria reimplementar as convenções de roteamento do framework (grupos,
  pastas privadas, segmentos paralelos, arquivos de metadados) para saber o que
  vira rota. A construção já sabe.
- *Presença de `.html` como sinal de forma* — descartado pela medição acima.

Os três artefatos usados são internos ao Next, como o caminho do documento já
era. A mitigação é a mesma de R1: toda leitura passa por um leitor que reprova
nomeando o caminho quando o arquivo não existe, e nunca devolve lista vazia
como padrão.

### Documentos declarados por caminho literal, nunca derivados

Cada rota pré-renderizada lista seus documentos pelo caminho observado. Nenhuma
função converte rota em caminho. A trava de documentos compara todo `.html` sob
`.next/` com a união das listas declaradas, nos dois sentidos, como hoje.

É isso que fecha o ponto 2 sem supor regra. Os casos observados —
`/sobre` → `server/app/sobre.html`, `/sobre/equipe` →
`server/app/sobre/equipe.html`, `/frotas/alfa` → `server/app/frotas/alfa.html`
— seguem o mesmo desenho, e três casos continuam não sendo regra. Quando a
próxima rota aninhada entrar, a trava reprova nomeando o caminho emitido, e é
esse caminho que se declara. Se uma versão do Next mover o caminho, a trava
nomeia os dois lados.

### A rota de prova é `/prova/[id]`, e não exibe dado

`apps/backoffice/app/prova/[id]/page.tsx`, profundidade 2 sob `app/`. Não lê o
parâmetro: observado, uma página com segmento dinâmico sai `ƒ` mesmo sem ler
`params`, e ler o parâmetro seria exibir entrada de URL sem necessidade.

Ela exibe o mesmo aviso que a rota raiz já exibe — o back office não tem tela de
produto, em nenhuma rota. O aviso sai de `page.tsx` para
`apps/backoffice/app/_components/no-product-notice.tsx`, e as duas rotas o
importam: a raiz por `./_components/no-product-notice`, a rota de prova por
`@/app/_components/no-product-notice`. A pasta `_components` é privada por
convenção do framework e não vira rota — observado na lista de rotas da
construção.

Essa importação é deliberada. O apelido só funciona se três ferramentas
concordarem sobre ele — o Biome casa o texto, o `tsc` resolve por `paths`, o
`next build` resolve pela leitura que faz do tsconfig —, e uma importação viva
na árvore exercita as três a cada `pnpm verify`. Um plantio exercitaria uma vez.

**Sem fixture.** A rota não exibe dado, então não há o que alimentar. O
guardião `fixture-origin` varre só `packages/ui/src`; isso fica registrado como
ponto aberto, com gatilho na primeira fixture sob `apps/`.

**Sem história.** O aviso é componente privado da aplicação, e a bancada não
alcança `apps/` — decisão do ciclo 8. Extraí-lo não muda a saída da rota raiz,
e a prova disso é a camada 2 inteira continuar passando sem alteração nas
afirmações sobre o documento da raiz.

### O apelido: `"@/*": ["./*"]`, por `paths`, sem `baseUrl`

Medido com TypeScript 5.9.3: `paths` sozinho resolve relativo ao tsconfig que o
declara. Um `@/app/_components/inexistente` plantado reprova com TS2307 — a
resolução é real, não um `any` silencioso. `next build` compilou com o apelido e
**não reescreveu** o tsconfig. `baseUrl` não entra: é peso morto aqui, e versões
futuras do TypeScript o recusam.

O apelido aponta para a raiz da aplicação, não para `app/`: `@/app/...`,
`@/tests/...`. É o mesmo desenho que o ponto 3 registrou, e não esconde qual
diretório está sendo alcançado.

Os testes da camada 2 não importam fonte da aplicação — leem a saída —, então o
projeto Vitest da aplicação não precisa de apelido.

### A regra de importação em três grupos, cada um com a mensagem verdadeira

Hoje um grupo só, com uma mensagem só, cobre `**/apps/**` e os relativos
`../../**` em diante. A mensagem acusa alcance de outra aplicação mesmo quando o
caminho fica dentro da própria. Passa a ser:

| Grupo | Padrões | Mensagem (sentido) |
| --- | --- | --- |
| Outra aplicação | `**/apps/**` | Uma aplicação não alcança arquivo de outra; o comum entre duas é publicado por pacote. (inalterada) |
| Travessia pelo apelido | `@/../**`, `@/**/../**` | O apelido parte da raiz da aplicação e não atravessa para cima: escreva o caminho a partir dela. |
| Travessia relativa | `../../**`, `../../../**`, `../../../../**` | A partir de dois níveis, travessia relativa não se distingue de alcançar outra aplicação: importe o interior da própria aplicação pelo apelido `@/`. |

Medido numa página em profundidade 2 — com a regra atual, e com `@/../**` e
`@/**/../**` acrescentados ao grupo atual. A repartição em três grupos muda só
a mensagem, e a tarefa 2.4 reconfirma cada linha com ela:

| Especificador | Resultado |
| --- | --- |
| `../../_components/painel` | reprova — o falso positivo |
| `@/app/_components/painel` | passa |
| `../../../outra/app/x` | reprova |
| `../../../../apps/outra/app/y` | reprova |
| `@/../outra/app/z` | reprova — **passava** com a regra atual |
| `@/../../apps/outra/app/w` | reprova |
| `@/app/../../outra/app/v` | reprova |
| `@/app/_components/../../../outra/app/u` | reprova |

`@/**/../**` também reprova `@/app/veiculos/[id]/../../_components/painel`, que
não sai da aplicação. É preço aceito: todo caminho pelo apelido tem forma sem
`..`, e a regra fica "o apelido não contém `..`", sem exceção para julgar.

`../../**` continua proibido: é o que pega a aplicação irmã escrita
`../../outra/...`. O que muda é a mensagem, que agora aponta a saída.

O bloco de `packages/**` não muda.

### `workspace-verification` não é tocada

O requisito "Fronteira da aplicação" proíbe o que lista; o interior da própria
aplicação não está na lista. A regra reprovava além do requisito, e a correção
é conformidade. O escape pelo apelido já violava o cenário "Importação de outra
aplicação reprova"; fechá-lo mantém o cenário verdadeiro. A linha que muda é a
da tabela de importações proibidas do design do ciclo 8, que já dizia que o
ciclo da primeira rota aninhada a reabriria. Por não tocar a capacidade, o
gatilho do ponto 4 não dispara.

### Onde mora o código novo da camada 2

No mesmo `emitted-document.test.ts`: ele já tem `BUILD_DIR`, `readEmitted` e a
coleta de `.html`. O leitor de manifesto é uma função ao lado de `readEmitted`,
com a mesma regra — ausência reprova com o caminho. Nenhum arquivo de teste
novo, nenhuma construção a mais, nenhum estágio novo.

### Os registros mudam no PR de código

`docs/pontos-abertos.md` e `docs/decisao-prova-de-comportamento-de-aplicacao.md`
não entram neste PR de proposta, que só contém `openspec/changes/`. Entram no PR
de `feat/dynamic-route-readiness`:

- pontos 2 e 3 saem, citando este ciclo;
- o ponto 1 ganha, na consequência, que rota resolvida por requisição não tem
  documento e nada sobre o conteúdo dela é provável até a camada 3;
- entram dois pontos novos, cada um com gatilho: a forma mista recusada, e o
  perímetro do guardião de fixture que não cobre `apps/`;
- a decisão da camada 2 ganha seção datada de atualização: o mapeamento
  observado, e R2 com a mitigação nova — a ausência de documento não pega rota
  que nunca teve documento; a lista de rotas pega.

## Risks / Trade-offs

- **Os três manifestos são internos ao Next** → ausência reprova com o caminho;
  formato conferido pela versão de `prerender-manifest.json` e pela forma dos
  outros dois. Uma atualização que os mova ou reformate reprova com diagnóstico,
  nunca passa.
- **A semântica de `fallback` pode mudar entre versões** → se mudar, a forma
  observada diverge da declarada e a verificação reprova nomeando rota, forma
  declarada e forma observada. O erro é barulhento, não silencioso.
- **As três ferramentas podem discordar sobre o apelido** → a importação viva na
  rota de prova exercita Biome, `tsc` e `next build` a cada execução.
- **`@/**/../**` recusa travessia inofensiva dentro da aplicação** → aceito;
  existe sempre a forma sem `..`.
- **A rota de prova responde em tempo de execução** em `/prova/<qualquer>` →
  exibe a moldura e o aviso de que não há tela de produto, que é verdade. Não
  há hospedagem nem domínio decididos.
- **O conteúdo de rota resolvida por requisição fica sem prova** → declarado por
  rota, registrado no ponto 1, com o gatilho da camada 3.
- **Recusar o Pages Router pode ser lido como decisão nova** → é a D1 de
  `docs/decisao-configuracao-inicial-do-workspace.md`, e é também a primeira vez
  que ela vincula: até aqui era descritiva. O `Por quê:` do requisito cita as
  duas origens, para que quem esbarrar na reprovação ache a razão a partir da
  spec, e não só na linha de contexto. O que este ciclo acrescenta é torná-la
  verificável, porque sem isso a forma de uma página
  fora da convenção não tem fonte única. Um ciclo que precise do Pages Router
  reabre esta regra com proposta.
- **A declaração fica mais longa** → cada rota ganha forma e documentos. É o
  preço de a lacuna ser visível em vez de implícita.
