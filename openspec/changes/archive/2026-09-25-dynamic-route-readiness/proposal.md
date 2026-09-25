# O que quebra na primeira rota dinâmica

## Why

Um back office é feito de páginas `[id]`, e a primeira delas quebra duas coisas
que oito ciclos deixaram de pé. As duas foram medidas nesta proposta, com a
configuração real do repositório — Biome 2.5.14, Next.js 16.3.6,
TypeScript 5.9.3 —, numa cópia descartável da árvore:

- **Defeito A — a regra de importação reprova código legítimo (ponto 3).**
  `apps/backoffice/app/veiculos/[id]/page.tsx` importando
  `../../_components/painel` reprova com "Uma aplicação não alcança arquivo de
  outra". O Biome casa o grupo contra o **texto** do especificador, não contra o
  caminho resolvido: profundidade 1 passa, profundidade 2 reprova, e a mensagem
  acusa a pessoa de alcançar outra aplicação quando ela alcançou a própria.
- **Defeito B — rota resolvida por requisição é invisível para a camada 2, e
  passa calada.** Uma rota `[id]` sai classificada como `ƒ (Dynamic)` e não
  emite documento — mesmo sem ler o parâmetro. Com ela plantada e sem
  declaração nenhuma, `apps/backoffice/tests/emitted-document.test.ts` passou
  **8 de 8**. A trava de mão dupla compara documentos; rota que não emite
  documento não aparece em nenhum dos dois lados. O requisito se chama "Rotas
  emitidas são as declaradas" e a checagem entrega documentos.
- **O escape que a saída do Defeito A abriria.** Com o apelido
  `"@/*": ["./*"]` e a regra como está, `@/../outra/app/z` **passa**. O
  apelido, sozinho, reabre pela porta da frente o que a regra fecha pelos
  fundos. Não estava registrado em lugar nenhum.

B é o mais grave dos três: falha em silêncio. E é agora porque o próximo ciclo
que criar rota de negócio vai criar `[id]`, e herdaria os três.

## What Changes

- A camada 2 passa a afirmar sobre a **lista de rotas que a construção
  produz**, e não só sobre os documentos. Cada rota declarada diz como é
  entregue: **pré-renderizada**, com os documentos que emite, ou **resolvida
  por requisição**, sem documento. Rota produzida e não declarada reprova,
  qualquer que seja a forma.
- O requisito "Rotas emitidas são as declaradas" é **renomeado** para "Rotas
  construídas são as declaradas" e reescrito sobre a lista de rotas. A trava
  sobre documentos, que ele carregava, vira requisito próprio: "Documentos
  emitidos são os declarados", com cada documento declarado pelo caminho exato
  em que foi observado.
- A forma observada é lida de **uma fonte só**: a classificação que a própria
  construção dá à rota. Presença de documento não é sinal de forma — uma rota
  de metadados é pré-renderizada e não emite documento.
- Rota com parâmetro pré-renderizada para uma lista e resolvida por requisição
  fora dela **reprova**, declarada ou não.
- Rota fora da convenção de rotas da aplicação (Pages Router) **reprova**,
  exceto `/404` e `/500`, que o framework gera sozinho e são declaradas pelo
  nome, com seus documentos, sem forma.
- Cada forma de entrega aceita passa a ter de ser exercitada por uma rota da
  árvore. A forma pré-renderizada já é, pela rota raiz. A forma resolvida por
  requisição ganha uma **rota de prova**, `/prova/[id]`, que existe para provar
  a verificação e não exibe dado.
- `apps/backoffice/tsconfig.json` ganha o apelido `"@/*": ["./*"]` por `paths`,
  **sem `baseUrl`**.
- A lista de importações proibidas de `apps/**` em `biome.json` é repartida:
  o apelido passa a ser proibido de conter travessia (`..`), e a travessia
  relativa a partir de dois níveis passa a ter mensagem própria, que aponta o
  apelido como saída em vez de acusar alcance de outra aplicação.

## A decisão: como a camada 2 trata rota resolvida por requisição

**Escolhida: a camada 2 afirma sobre a lista de rotas que a construção
produz**, e a declaração de cada rota diz a forma de entrega.

**Por que não exigir pré-renderização de toda rota.** Decidiria o modelo de
entrega do back office pela conveniência do teste. Os `id`s de um back office
vêm do dado; pré-renderizá-los exige buscar dado em tempo de construção, o que
esta fase proíbe, e amarra a forma de entrega a uma decisão que pertence ao
ciclo do contrato de leitura, que não existe. Além disso, a medição mostrou que
`generateStaticParams` sozinho não basta: sem fechar a lista, a rota sai com
`fallback: null`, e todo `id` fora dela é resolvido por requisição — o mesmo
ponto cego, só que menor.

**Por que "declarar fora do alcance" não é alternativa, e sim consequência.**
Reprovar uma rota resolvida por requisição que ninguém declarou exige
enxergá-la, e ela não emite documento. A única saída da construção que a lista
é a lista de rotas. A terceira saída só se implementa sobre a fonte da segunda.
O que ela acrescenta — dizer em voz alta que a camada 2 não alcança aquela
rota — entra na escolha como a forma "resolvida por requisição" da declaração.

**O que a escolha não faz.** Não prova nada sobre o conteúdo de uma rota
resolvida por requisição. Declarar a forma é registrar, de modo revisável, que
a camada 2 não alcança o documento dela; quem precisar de afirmação sobre esse
documento precisa da camada 3 (ponto 1), e nenhuma exigência deste ciclo
depende dela.

## Ponto 2: o mapeamento, observado antes de declarado

Observado na construção com rotas plantadas, antes de qualquer declaração:

| Rota | Classificação da construção | Documento emitido |
| --- | --- | --- |
| `/` | `○ (Static)` | `server/app/index.html` |
| `/sobre` | `○ (Static)` | `server/app/sobre.html` |
| `/sobre/equipe` | `○ (Static)` | `server/app/sobre/equipe.html` |
| `/veiculos/[id]` | `ƒ (Dynamic)` | nenhum |
| `/frotas/[id]` com lista `alfa`, `beta` | `● (SSG)`, `fallback: null` | `server/app/frotas/alfa.html`, `server/app/frotas/beta.html` |
| `/frotas/[id]` com lista fechada | `● (SSG)`, `fallback: false` | `server/app/frotas/alfa.html` |
| `/icon.svg` (`app/icon.svg`) | `○ (Static)` | nenhum — `server/app/icon.svg.body` e `.meta` |
| `/sitemap.xml` (`app/sitemap.ts`) | `○ (Static)` | nenhum — `server/app/sitemap.xml.body` e `.meta` |

**Este ciclo não declara regra de mapeamento.** Cada documento é declarado pelo
caminho exato, rota a rota, e a trava de mão dupla nomeia o caminho emitido
quando uma rota entra sem ele. A próxima rota aninhada — e a próxima versão do
framework que mover um caminho — é observada pela própria verificação, e
nenhuma regra precisa ser suposta a partir de três casos.

## Correção feita na revisão da proposta

A primeira versão definia as formas por "emite documento" na spec e as lia de
`prerender-manifest.json` no design. A revisão mediu que as duas leituras
discordam sobre rota de metadados (as duas últimas linhas da tabela acima): pela
classificação ela é pré-renderizada, pela ausência de `.html` seria resolvida
por requisição. E o requisito não excluía rota que não é página — incluía de
propósito. A spec agora define as formas pelo que a construção produz e manda
ler a forma de uma fonte só, a classificação da construção.

A mesma investigação mostrou que a Open Question que o design deixava sobre
`/404` e `/500` era o mesmo defeito, e não era adiável: no Pages Router nenhuma
fonte sozinha classifica a forma (a medição está no design). A aplicação é
fixada em App Router pela decisão D1 de
`docs/decisao-configuracao-inicial-do-workspace.md`, e este requisito é o
primeiro lugar em que essa decisão obriga — o `Por quê:` cita a origem. A regra
passa a ser essa — nenhuma rota fora da
convenção, exceto as que o framework gera sozinho, declaradas pelo nome.

## Lacunas registradas, e não preenchidas

- **Rota de prova sem fixture.** A orientação do ciclo previa uma fixture de
  origem sintética alimentando a rota. A rota de prova não lê o parâmetro nem
  exibe dado — a forma de entrega não depende disso, como a medição mostrou —,
  e portanto não tem fixture. Uma fixture que nada afirma seria peso morto.
  **Consequência registrada:** `tools/checks/fixture-origin.test.ts` varre só
  `packages/ui/src`. A primeira fixture sob `apps/` nasceria fora do guardião;
  entra em `docs/pontos-abertos.md` com esse gatilho.
- **A forma mista é recusada, não resolvida.** Rota pré-renderizada para uma
  lista e resolvida por requisição fora dela reprova. Aceitá-la exigiria uma
  forma de declaração que nenhum ciclo precisou; entra como ponto aberto, com
  gatilho na primeira exigência que precise dela.
- **O conteúdo de rota resolvida por requisição continua sem prova.** Entra na
  consequência do ponto 1.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `backoffice-shell`: "Rotas emitidas são as declaradas" é renomeado para
  "Rotas construídas são as declaradas" e reescrito sobre a lista de rotas, a
  forma de entrega lida da classificação da construção e a recusa de rota fora
  da convenção da aplicação; entram "Documentos emitidos são os declarados" e "Cada
  forma de entrega é exercitada pela árvore".

**`workspace-verification` não muda, e o ponto 4 não é disparado.** O requisito
"Fronteira da aplicação" proíbe só o que lista, e importar o interior da
própria aplicação não está na lista: a regra reprovava além do que o requisito
obriga, e corrigi-la é conformidade, não mudança de requisito. O escape pelo
apelido já é violação do cenário "Importação de outra aplicação reprova", e
fechá-lo é o que mantém esse cenário verdadeiro. O design do ciclo 8 já
registrava que a linha dos caminhos relativos seria reaberta pelo ciclo da
primeira rota aninhada — é essa linha, de design, que muda.

## Impact

- **Aplicação:** `apps/backoffice/tsconfig.json` (apelido por `paths`);
  `apps/backoffice/app/prova/[id]/page.tsx` (rota de prova, nova);
  `apps/backoffice/app/_components/no-product-notice.tsx` (o aviso que a rota
  raiz já exibe, extraído para que as duas rotas o usem);
  `apps/backoffice/app/page.tsx` (passa a usar o aviso extraído, com a mesma
  saída).
- **Camada 2:** `apps/backoffice/tests/emitted-document.test.ts` — a declaração
  de documentos vira declaração de rotas, com forma e documentos.
- **Configuração:** `biome.json`, somente o bloco de `apps/**`. O bloco de
  `packages/**` não muda.
- **Registros:** `docs/pontos-abertos.md` (fecha os pontos 2 e 3, abre dois,
  atualiza o 1) e `docs/decisao-prova-de-comportamento-de-aplicacao.md`
  (mapeamento observado; mitigação de R2 substituída).
- **Verificação:** os mesmos quatro estágios, a mesma construção única por
  execução. Nenhuma dependência nova.
- **Intocados:** `src/`, `tests/`, `data/`, `queries/`, `supabase/`,
  `packages/` inteiro, os guardiões de `tools/checks/`, e a spec
  `workspace-verification`.

## O que esta mudança não faz

- **Não cria tela de produto, não exibe dado real e não toca em coleta.** A rota
  de prova exibe o mesmo aviso que a rota raiz já exibe.
- **Não cria rota de negócio.** `/prova/[id]` existe para exercitar a forma
  resolvida por requisição, e pode sair no ciclo em que uma rota de negócio com
  essa forma passar a exercitá-la.
- **Não prova o conteúdo de rota resolvida por requisição.** A camada 3
  continua não existindo, e nenhuma exigência deste ciclo depende dela.
- **Não declara regra de mapeamento de rota para arquivo.** Declara caminhos
  observados, um por um.
- **Não exige pré-renderização** e não decide o modelo de entrega das telas de
  dado; isso pertence ao ciclo do contrato de leitura.
- **Não afrouxa a regra de importação.** Todo caminho que ela reprovava para
  outra aplicação continua reprovado, e passa a reprovar também pelo apelido.
- **Não escreve `baseUrl`**, não acrescenta dependência, estágio de
  verificação, servidor nem segundo executor.
- **Não altera `workspace-verification`** nem fecha o ponto 4.
- **Não altera nenhum componente de `packages/ui`**, e portanto não acrescenta
  história nem faz afirmação de acessibilidade.
