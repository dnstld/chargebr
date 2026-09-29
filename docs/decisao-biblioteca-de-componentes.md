# Decisão: biblioteca de componentes de UI

**Data:** 26 de setembro de 2026
**Estado:** decidida — direção; três pontos de formato ficam em aberto, cada um com gatilho, nas seções abaixo
**Origem:** decisão de direção do dono do repositório sobre a arquitetura de `@chargebr/ui`

Este documento registra uma decisão de direção já tomada, com as medições que a
sustentam. Não cria token, componente, spec ou dependência, e não altera
código: o que ele fixa é o que a proposta e a implementação do ciclo que migrar
`@chargebr/ui` têm que respeitar.

## A decisão

`@chargebr/ui` deixa de ser uma coleção de átomos desenhados para as restrições
de domínio do ChargeBR e passa a ser uma **biblioteca de UI de primitivas
genéricas com variantes**, no padrão de bibliotecas como o gluestack, construída
sobre `@chargebr/tokens`. Uma primitiva não sabe o que é "principal" ou
"contrafactual" — sabe que existe um peso, um destaque, um tamanho — e o
significado de domínio é composto por cima, em `domain/`.

## As camadas

**`atoms/` — primitiva genérica.** Recebe variantes por propriedade, cada valor
resolvido inteiro por token. Não importa vocabulário, não declara papel de
domínio, não sabe que existe um "principal" ou um "contrafactual" — só que
existe um peso, um destaque, um tamanho.

**`domain/` — significado de domínio composto.** É aqui que "o valor principal
pesa mais e o contrafactual é itálico" vira decisão: a primitiva de domínio
escolhe a combinação de variantes genéricas que expressa o papel, e é ela quem
sabe que esses papéis existem.

### O caso `valueRole`

**O que medi.** `grep` por `valueRole`/`ValueRole`/`VALUE_ROLES` em
`packages/ui/src` encontra 12 arquivos. Cinco usam o tipo como prop ou lógica
funcional — são os citados na tarefa:

| Arquivo | Camada hoje | O que faz com `valueRole` |
| --- | --- | --- |
| `atoms/text/text.tsx` | `atoms/` | `TextProps.valueRole: ValueRole`, obrigatório |
| `atoms/numeric-value/numeric-value.tsx` | `atoms/` | `NumericValueProps.valueRole: ValueRole`, obrigatório |
| `atoms/value-role.assert.ts` | `atoms/` | afirma que os três papéis diferem em propriedade não cromática |
| `charts/value-table.tsx` | `charts/` | usa `valueRole="primary"` fixo, sem expor o papel como escolha |
| `domain/value-with-provenance/value-with-provenance.tsx` | `domain/` | único lugar que de fato varia entre os três papéis, por posição fixa |

Os outros sete são `value-role.ts` (a definição), duas histórias, `atoms/index.ts`
(reexportação) e `vocabulary/vocabulary.ts` mais seu teste — este último declara
o grupo `VOCABULARY.valueRole`, com os rótulos em português "Principal",
"Contrafactual" e "Contexto", e importa `ValueRole` de `atoms/value-role`
(`vocabulary.ts:2`).

O comentário do próprio arquivo já registra a origem: "Papéis que um valor
exibido pode ocupar. Vêm da restrição de domínio 'valor principal,
contrafactual e contexto são visualmente distintos'" (`atoms/value-role.ts:1-3`).
E o CSS confirma que a distinção hoje é feita por propriedade não cromática —
exatamente o que a restrição de domínio exige, não uma decisão de estilo livre:

```css
/* text.module.css e numeric-value.module.css, idênticos nas três classes */
.primary       { font-weight: var(--font-weight-semibold); }
.counterfactual{ font-style:  var(--text-counterfactual-style); }
.context       { font-size:   var(--text-label-size); /* ou --font-size-1 */
                  color:      var(--color-text-secondary); }
```

**O que concluo.** `valueRole` é vocabulário de domínio dentro da camada que
deveria ser genérica. Isso não é só o rótulo em português — `component-vocabulary`
já proíbe isso e nem varre `atoms/`, porque o problema aqui não é a língua do
rótulo, é a forma do prop: um `ValueRole` de três valores nomeados por papel de
domínio, exigido por `Text` e por `NumericValue`, é o mesmo desenho que a
restrição "papéis não são intercambiáveis" descreve — e essa restrição vive na
spec de `domain-primitives`, não na de `interface-atoms`.

Sob a decisão, isso muda: `Text` e `NumericValue` deixam de exigir `valueRole` e
passam a expor as variantes genéricas que hoje o CSS já usa por trás dele —
peso (`weight`) e destaque (`emphasis`), na seção seguinte. `value-role.ts`,
`value-role.assert.ts` e o grupo `VOCABULARY.valueRole` migram para `domain/`:
é lá que "principal pesa mais, contrafactual é itálico, contexto é menor" é
composição, não propriedade do átomo. `value-with-provenance.tsx` passa a
escolher a combinação de variantes por papel; `charts/value-table.tsx` passa a
declarar a combinação diretamente, sem depender de um prop `valueRole` que a
primitiva genérica não tem mais motivo para conhecer.

**O que isso não resolve sozinho, e fica registrado como lacuna.** A spec
`interface-atoms` tem hoje o requisito "Distinção não depende só de cor", que
nomeia os três papéis de domínio dentro de uma spec que passa a descrever só a
camada genérica: "Papéis de valor distintos — principal, contrafactual e
contexto — SHALL diferir em ao menos uma propriedade que não seja cor." Depois
da migração, esse requisito descreve algo que `interface-atoms` não tem mais
vocabulário para dizer sem citar domínio. Não é correção editorial — é
conteúdo normativo que decide o que se aplica a quem, e por isso não o
reescrevo aqui. Registro a lacuna: o ciclo de migração propõe o que acontece
com esse requisito (mover para `domain-primitives`, fundido com "Papéis não são
intercambiáveis", ou reescrito em termos de propriedade genérica), com proposta
e revisão próprias.

## O que os tokens decidem, medido eixo por eixo

A pergunta antes de propor qualquer variante: quantos valores cada eixo pode
ter, segundo o que `@chargebr/tokens` já declara. Medido direto nos quatro
arquivos primitivos:

| Arquivo | Eixo | Valores declarados | Contagem |
| --- | --- | --- | --- |
| `typography.json` | `font.weight` | `regular`, `medium`, `semibold` | **3** |
| `typography.json` | `font.style` | `normal`, `italic` | **2** |
| `typography.json` | `font.size` | `1`…`7` (12–32px) | **7** |
| `typography.json` | `font.line-height` | `tight`, `snug`, `normal` | **3** |
| `typography.json` | `font.numeric` | `data`, `text` | **2** |
| `typography.json` | `font.family` | `sans` | **1** |
| `space.json` | `space` | `0`…`9` (0–64px) | **10** |
| `radius.json` | `radius` | `none`, `sm`, `md`, `lg`, `full` | **5** |
| `shadow.json` | `shadow` | `sm`, `md`, `lg` | **3** |

`font.family` tem cardinalidade 1: uma escolha sem alternativa não é variante,
é constante — confirma `docs/decisao-identidade-visual.md`, que já fixou Inter
como família única. Nenhuma variante de família é proposta.

**A distinção que decide se uma variante se propõe sem invenção.** `font.weight`,
`font.style`, `radius` e `shadow` já vêm **nomeados** no primitivo — as chaves do
JSON (`regular`/`medium`/`semibold`, `normal`/`italic`, `none`/`sm`/`md`/`lg`/`full`,
`sm`/`md`/`lg`) são literalmente os valores que a variante pode usar, sem
inventar rótulo nenhum. `font.size` e `space`, ao contrário, são **escalas
numéricas sem nome** — `1`…`7` e `0`…`9`. Usar o índice como valor da variante
(`size={4}`) não inventa nada; batizar os índices como `xs`/`sm`/`md`/`lg`/`xl`
inventaria uma escala que os tokens não expressam, e essa invenção não é minha
para fazer.

A camada semântica já cura parte disso, mas por propósito, não por tamanho
genérico: `space.inset` (`sm`/`md`/`lg` = `space.3`/`4`/`6`) é preenchimento
interno, `space.gap` (`sm`/`md`/`lg` = `space.2`/`3`/`5`) é distância entre
irmãos, `radius.control`/`surface`/`pill` e `elevation.raised`/`overlay`/`modal`
nomeiam papel de superfície, não posição numa régua. Nenhum desses é um "size"
livre de contexto que uma variante genérica de primitiva possa herdar — cada
um já decide para que serve, o que é decisão de composição, não de primitiva.
**Não existe hoje, em nenhuma camada, uma escala nomeada de tamanho genérico**
(o `xs`/`sm`/`md`/`lg` comum em bibliotecas como o gluestack). Isso é medição,
não opinião: os quatro arquivos primitivos foram lidos por inteiro, e as três
camadas de `semantic/` também.

## O formato de variante

Nomes de propriedade, valores e a origem em token — só o que resolve sem
invenção:

| Propriedade | Valores | Token | Arquivo de origem |
| --- | --- | --- | --- |
| `weight` | `regular` \| `medium` \| `semibold` | `font.weight.*` | `primitive/typography.json` |
| `emphasis` | `normal` \| `italic` | `font.style.*` | `primitive/typography.json` |
| `radius` | `none` \| `sm` \| `md` \| `lg` \| `full` | `radius.*` | `primitive/radius.json` |
| `elevation` | `sm` \| `md` \| `lg` | `shadow.*` | `primitive/shadow.json` |

`weight` e `emphasis` são as duas variantes que `Text` e `NumericValue` já
precisam, porque já são o que as classes `.primary` e `.counterfactual`
aplicam hoje — a migração troca o nome do prop, não o valor. `radius` e
`elevation` não têm primitiva que os consuma ainda (nenhum átomo hoje é uma
superfície); ficam registrados para quando o primeiro existir, com a mesma
regra: valor de token, sem literal.

**Duas propriedades ficam de fora desta lista, e não são decididas aqui — os
tokens não decidem a escala, e inventar uma sem caso é suposição. As opções e
o custo de cada uma ficam registrados para o ciclo que primeiro precisar de
uma delas (R3); hoje nenhuma primitiva precisa:**

- **`size`** (tipografia, `font.size`, 7 valores possíveis) e **`space`**
  (espaçamento entre/dentro de primitivas, `space`, 10 valores possíveis).

| Opção | O que é | Custo |
| --- | --- | --- |
| **A — índice literal** | A variante usa a chave do token como valor (`size="4"`, `space="6"`). Nenhuma camada nova. | API pouco ergonômica: quem compõe precisa saber que `size="4"` é 16px; nada de "pequeno"/"grande". |
| **B — escala nomeada nova** | Cria-se uma família semântica cross-cutting (`scale.sm`/`md`/`lg`, ou mais degraus) mapeando um subconjunto de `font.size` e `space` a nomes de tamanho, compartilhada por toda primitiva que tiver essa variante. | Decisão de design nova (quantos degraus, qual token primitivo cada um usa) — não é o formato dos tokens hoje, é criação de tokens semânticos; ciclo próprio, com proposta e revisão. |

O que provaria a Opção A suficiente: nenhuma primitiva migrada até agora
precisou de mais de um valor de `size`/`space` por vez (verificado: `Text` e
`NumericValue` não variam tamanho hoje, só peso e destaque). O que provaria a
Opção B necessária: uma primitiva com variante de tamanho em uso real, onde o
índice literal se mostrar ilegível na revisão de código ou na história.

**Fora do escopo desta medição:** um eixo `tone`/cor. A tarefa não pediu a
leitura de `color.json`, e a camada semântica já nomeia quatro papéis de cor de
texto (`primary`/`secondary`/`muted`/`on-action`) que não são uma escala, são
papéis — a mesma forma do problema de `size`, mas para cor. Registro como
ponto que o ciclo de migração mede e decide separadamente, não suponho aqui.

## Histórias como critério de aceite

Medido nas duas páginas oficiais do Storybook (busca feita com sucesso; caso
não tivesse sido possível, este documento pararia aqui e avisaria).

De **Writing stories**: uma história é "um objeto com anotações que descrevem
o comportamento e a aparência do componente dado um conjunto de argumentos" —
uma história, um estado, não uma matriz.

De **AI best practices**, duas regras estruturais, citadas:

> "❌ Bad — demonstrates too many concepts at once, making it less clear and
> less useful as a reference for agents."

O exemplo dado é nomeado: uma história `SizesAndVariants` que renderiza
botões pequeno/médio/grande e variantes contorno/texto juntos é marcada como
o antipadrão — exatamente o formato que uma variante de N eixos tentaria criar
por atalho ("uma história com todo mundo").

> "describe *why* you would use whatever is demonstrated" — em vez de "isto é
> um botão primário", a história diz "botões primários são a ação principal de
> uma tela; não deve haver mais de um por tela".

**O que isso obriga, traduzido para este repositório:** nenhuma história cobre
mais de um valor por eixo de propósito — uma história por peso, uma por
destaque, nunca uma `WeightAndEmphasis` que mostra as duas variações ao mesmo
tempo só para economizar arquivo. E a descrição de cada história — o campo que
hoje nenhuma história do pacote preenche de forma consistente — diz por que
compor com aquele valor, não o que a tela mostra.

## Cobertura: quando combinação ganha história

**Posição do gerente, não decisão fechada.** Hoje o requisito vivo é "todo
estado declarado tem história" (`interface-atoms` e, por extensão, `domain-primitives`),
verificado por `stories-coverage.test.ts`. Com um eixo de variante por
propriedade, a combinação explode: duas propriedades de 3 e 2 valores já são
6 combinações, e nenhuma delas precisa de história própria se as duas
propriedades forem de fato independentes.

A regra passa a valer **por variante**: cada valor de cada propriedade aparece
em ao menos uma história — não cada combinação. Combinação só ganha história
dedicada quando a combinação em si é o risco, isto é, quando há razão concreta
para suspeitar que dois valores independentes, corretos sozinhos, quebram
juntos.

**O que eu medi antes de tomar essa posição:** o inventário atual de primitivas
com mais de uma dimensão de estado — `Text`, `NumericValue`,
`ValueWithProvenance` (papel × presença opcional de contrafactual/contexto),
`ChartValueTable` (papel × marcador de não-resolvido lado a lado). Não
encontrei par documentado onde dois valores independentemente corretos
produzem falha só quando combinados; a composição em `ChartValueTable`
(`NumericValue` mais `StatusMarker` de não-resolvido, lado a lado) já é
exercitada pela história existente da própria tabela, então nem conta como
lacuna nova.

**O que me faria mudar de ideia:** um caso concreto — duas variantes
independentes que passam cada uma isoladamente e falham (visualmente ou por
acessibilidade) só quando compostas. Encontrado um, ele entra aqui nomeado, com
a combinação exata, e a regra de cobertura por variante ganha essa exceção
nomeada — não uma exceção geral.

> **Nota de 793d8e2.** O requisito vivo em que esta posição se apoiava —
> "todo estado declarado tem história", verificado por
> `stories-coverage.test.ts` — foi removido: a checagem lia a lista de
> estados que o próprio componente declarava, e declarar menos fazia a prova
> passar. A posição em si continua válida — cobertura por variante, não por
> combinação — agora como critério de revisão, sem guardião automatizado. O
> que caiu foi só a afirmação de que a máquina já a sustentava.

## O que o CI reprova, e o que só a revisão pega

| Regra | Guardião | Situação |
| --- | --- | --- |
| Valor de variante não resolvido inteiro por token (literal de peso, destaque, raio, sombra) | `style-literals` | **Já cobre.** `GUARDED_PROPERTIES` já inclui `font-weight`, `font-style`, `font-size`, `border-radius`, `box-shadow`; a extensão de `valueRole` para `weight`/`emphasis` não pede guardião novo. |
| Todo valor de propriedade declarado tem história | nenhum hoje | **Removido em 793d8e2.** `stories-coverage.test.ts` e `AtomContract.states` não existem mais: a checagem lia a lista de estados que o próprio componente declarava — `Hatch` declarava `[]` e passava. Cobertura por variante é critério de revisão, não de `pnpm verify`; o `addon-vitest` executa toda história que existe, nos dois temas, com `axe`, e é isso que protege. |
| Componente de domínio declara rótulo em português no próprio arquivo | `component-vocabulary` | **Sai com o perímetro de domínio.** `shell/` deixou de ser pasta no PR #177; o guardião sai inteiro no passo seguinte, junto com o perímetro `domain/`. |
| Primitiva genérica não importa de `domain/` | nenhum hoje | **Lacuna nova.** `biome.json` hoje separa perímetro por pacote (`packages/**` vs `apps/**`), não por pasta dentro do mesmo pacote. Nada impede hoje que um arquivo em `atoms/` importe de `domain/`. Regra proponível via `noRestrictedImports` escopado a `packages/ui/src/atoms/**`; fica para a proposta do ciclo de migração — este documento só nomeia a lacuna. |
| Primitiva genérica não tem prop com forma de papel de domínio (`valueRole` e equivalentes futuros) | nenhum | **Só revisão.** Forma de prop não é string nem import — nenhum guardião varre "isto parece modelagem de domínio". Fica como critério de revisão de PR, não de `pnpm verify`. |
| Nova primitiva interativa declara estado de ponteiro (`hover`/`pressed`) verificado por história | nenhum | **Só revisão**, e com precedente de recuo: ver riscos, abaixo. |

## `.storybook/main.ts` e `react-docgen-typescript`

**O que medi.** `packages/ui/.storybook/main.ts` declara
`addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"]`, sem
`typescript.reactDocgen`. `packages/ui/package.json` e o `pnpm-lock.yaml`
inteiro não têm nenhuma ocorrência de `@storybook/addon-docs` nem de
`@storybook/addon-essentials` — não é omissão de configuração, o pacote de
documentação nem está instalado.

**O que concluo.** Sem `typescript: { reactDocgen: "react-docgen-typescript" }`,
o framework `@storybook/react-vite` usa por padrão `react-docgen` (baseado em
Babel), que não lê com confiabilidade comentário JSDoc sobre propriedade de
`interface` TypeScript — exatamente o padrão que este pacote já usa em toda
prop (`/** Papel que o valor ocupa: principal, contrafactual ou contexto. */`
em `TextProps.valueRole`, por exemplo). `react-docgen-typescript` lê pela API
do compilador TS e extrai esse comentário. Uma biblioteca de variantes com N
propriedades por primitiva depende de documentar cada uma perto do tipo — é
onde o "por que usar" das histórias (seção anterior) se ancora quando o valor
em si não é auto-explicativo.

**Isso deve entrar**, e obriga duas coisas: (1) `typescript.reactDocgen` em
`main.ts` aponta para `react-docgen-typescript`; (2) o JSDoc de cada propriedade
de variante nova passa a ser texto voltado a quem lê o painel, não comentário
de implementação — diz de qual token o valor sai e quando escolher cada valor,
não repete o nome do tipo.

**O que não pude confirmar por medição, e registro em vez de afirmar:** sem
`addon-docs` instalado, não verifiquei se o painel de Controls do Storybook 10
já exibe algum tipo de inferência de prop hoje, nem se ligar
`react-docgen-typescript` sozinho (sem instalar `addon-docs`) já basta para o
JSDoc aparecer em algum lugar da bancada. O que me faria confirmar: rodar a
bancada depois de ligar a opção e inspecionar o painel de uma prop existente
com JSDoc, como `TextProps.valueRole`.

## Riscos e decisões em aberto

**R1 — a cicatriz de `docs/incidente-instabilidade-da-bancada.md` volta a valer
para toda primitiva nova que declarar estado de ponteiro.** `react-aria-components`
já é dependência de execução do pacote (usada por `EvidenceAnchor`), e o
incidente aberto ali terminou estacionado, causa desconhecida, com a promessa
retirada do contrato — `hovered` saiu dos estados declarados, não porque o
comportamento tenha sumido, mas porque nenhuma história verde sustentava a
promessa. Uma biblioteca de variantes no padrão gluestack tende a crescer
primitivas interativas (botão, campo, seletor) que precisam de foco, pressão e
hover geridos de forma acessível — o caminho natural continua sendo
`react-aria-components`, a mesma família já usada e já cicatrizada.
*Mitigação:* nenhuma primitiva nova declara `hovered`/`pressed` como estado
coberto por história de interação até o incidente ser retomado pelo gatilho já
registrado nele. Foco por teclado continua provável — foi a história irmã que
nunca falhou.
*Gatilho:* o mesmo do incidente — a primeira história de interação que
reprovar no CI com a mesma assinatura reabre a investigação, não só para
`EvidenceAnchor`.

**R2 — o requisito "Distinção não depende só de cor" de `interface-atoms` fica
com vocabulário de domínio numa spec que deixa de descrevê-lo.** Registrado na
seção `valueRole`, acima. Não decido a reescrita aqui.
*Gatilho:* o ciclo que propuser a migração de `Text`/`NumericValue` propõe
também o que acontece com este requisito — mover, fundir com "Papéis não são
intercambiáveis" ou reescrever em termos genéricos.

**R3 — nome da escala de `size`/`space`.** Registrado na seção de formato de
variante. Índice literal (Opção A) é o que os tokens já expressam sem
invenção; nomear graus (Opção B) é decisão de design nova.
*Gatilho:* a primeira primitiva migrada que precisar variar tamanho ou espaço
força a escolha — hoje nenhuma precisa.

**R4 — perímetro `atoms/` → `domain/` não é verificado.** Registrado na tabela
de guardiões. Hoje nada impede, por importação, que uma primitiva genérica
volte a depender de vocabulário de domínio pela porta dos fundos.
*Gatilho:* a proposta do ciclo de migração decide se essa regra entra como
`noRestrictedImports` escopado a `packages/ui/src/atoms/**` antes ou depois da
primeira violação encontrada.

**R5 — combinação de variantes sem história.** Posição registrada acima:
cobertura por variante, não por combinação, até que uma combinação concreta se
mostre arriscada.
*Gatilho:* o par de variantes independentes encontrado, nomeado, entra aqui.

**R6 — o eixo de cor não foi medido.** A tarefa que originou este documento não
pediu a leitura de `primitive/color.json`, e por isso nenhuma variante de cor é
proposta aqui. É a lacuna mais cara das registradas: cor é onde moram os pisos
de contraste medidos, e uma biblioteca de variantes quase sempre expõe um eixo
de tom. A camada semântica nomeia quatro papéis de cor de texto —
`primary`/`secondary`/`muted`/`on-action` — que são papéis e não escala, a mesma
forma do problema de `size`.
*Gatilho:* antes da primeira primitiva que exiba cor por variante, e em todo
caso antes de o ciclo de migração propor qualquer eixo de tom. A medição é a
mesma feita aqui para os outros eixos: quantos valores cada camada expressa, e
quais deles sustentam os pisos de contraste vivos.

## Consequência para os 16 requisitos vivos de `interface-atoms` e `domain-primitives`

Os 8 de cada spec, medidos um a um contra a decisão:

| Spec | Requisito | O que acontece |
| --- | --- | --- |
| `interface-atoms` | Número alinha em coluna | Inalterado — a variante não toca formatação numérica |
| `interface-atoms` | Ausência nunca é zero | Inalterado — `reason` já é prop genérica, sem papel de domínio |
| `interface-atoms` | Marcador de estado nomeia seu eixo | Inalterado — `axis` já é fornecido por quem compõe |
| `interface-atoms` | Estado não resolvido é hachurado | Inalterado — variante de preenchimento, já genérica |
| `interface-atoms` | **Distinção não depende só de cor** | **Ver R2** — nomeia papel de domínio numa spec que deixa de tê-lo |
| `interface-atoms` | Âncora de evidência tem nome acessível | Inalterado — `href`/`label` já são genéricos |
| `interface-atoms` | Todo estado declarado tem história | Inalterado no texto; cobertura passa a valer por variante (ver seção própria) |
| `interface-atoms` | Átomo recebe tudo por propriedade | Inalterado — reforçado, na verdade: é a mesma regra que tira `valueRole` de dentro do átomo |
| `domain-primitives` | Número sem proveniência não é renderizável | Inalterado |
| `domain-primitives` | **Papéis não são intercambiáveis** | Ganha o conteúdo normativo que hoje está duplicado em `interface-atoms` (ver R2) |
| `domain-primitives` | Projeção bloqueada não exibe número | Inalterado |
| `domain-primitives` | Os três eixos permanecem independentes | Inalterado |
| `domain-primitives` | Eixo sem valor é declarado, nunca omitido | Inalterado |
| `domain-primitives` | Vocabulário vem de um módulo único | Reforçado — `VOCABULARY.valueRole` já vive aqui; migrar `value-role.ts` para `domain/` alinha o tipo à mesma regra |
| `domain-primitives` | Forma de entrada é da biblioteca | Inalterado |
| `domain-primitives` | Cobertura de estados alcança as primitivas | Inalterado no texto; mesma ressalva de cobertura por variante |

Catorze dos dezesseis requisitos atravessam a migração sem mudança de texto.
Os dois que mudam — um em cada spec — são o mesmo requisito visto de dois
lugares, e o ciclo de migração decide onde ele mora, com proposta e revisão
próprias: não é decisão deste documento.

## Decisão de 2026-09-28: teste de componente, e o destino de Hatch, DeclaredAbsence e EvidenceAnchor

**Decidido pelo dono, em conversa que acompanhou a escrita de
`openspec/changes/remove-domain-capabilities/`.** Registrado aqui porque
decisão que existe só em conversa é invisível para todo agente que ler o
repositório depois — foi assim que aquela proposta nasceu com um item em
aberto que já estava decidido.

**O teste de um componente de biblioteca não é o mesmo teste de um
requisito.** `rules.specs` de `openspec/config.yaml` (desde `bdde87e`) exige
que todo requisito nomeie o que quebra sem ele, hoje, no que está
construído — e isso vale para requisito, não para componente. Biblioteca de
UI é inventário: um componente genérico, sem consumidor construído, é
catálogo à espera de uso, não lacuna a fechar. A regra ganhou essa
distinção, explícita, em `openspec/config.yaml`, na mesma data — sem ela, a
regra do requisito vira licença para esvaziar a biblioteca componente por
componente.

**`Hatch` e `ChartHatchPattern` ficam — as duas definições de hachura
continuam existindo, e com elas o requisito que garante que não divergem.**
Pelo teste acima, `Hatch` já ficaria: é genérico. O gráfico também ganha uma
opção de preenchimento por ponto, genérica — cheio ou texturizado —, escolha
visual de quem compõe, sem estado nem significado de negócio atribuído a
ela. Com as duas definições de hachura em uso outra vez, o requisito "A
hachura é uma só" continua tendo o que provar — migra para a capacidade de
gráfico, em vez de sair com o resto da metodologia.

**`DeclaredAbsence` sai — não por falta de consumidor, por não ser
primitiva.** `kind` vale `"blocked"` ou `"unknown"`: são nomes de vocabulário
de domínio (`projection_status = blocked`, `date_precision = unknown`), não
uma variante genérica. Nas palavras do dono: "na minha visão isso é só um
texto" — sem o vocabulário de domínio por trás do `kind`, o que sobra é texto
sem propriedade própria que o distinga de `Text`. Diferente de `Hatch`: o
átomo nasceu para nomear dois estados de domínio, e não há generalização que
sobre sem eles.

**`EvidenceAnchor` vira `Link`, genérico.** `href` e conteúdo, nome acessível
obrigatório, sem depender só de ícone ou posição — a mesma garantia que o
átomo já tinha, menos o nome "evidência" e o vocabulário que vinha junto.
Passa o teste de componente de biblioteca mesmo sem consumidor imediato —
link é primitiva legítima de qualquer biblioteca de UI — e ganha consumidor
real em breve: o grupo 6 de `interface-atomic-structure` constrói `NavItem`,
que é um link.

**Onde isto está aplicado:** `openspec/config.yaml` (`rules.specs`) e
`openspec/changes/archive/2026-09-29-remove-domain-capabilities/` (proposta,
design e specs).

## Decisão de 2026-09-29: estrutura por camada e família, e o destino do componente de domínio

**Decidido pelo dono.**

**Cada componente tem seus próprios tokens.** Tokens de componente não são
compartilhados entre componentes. Componente novo carrega visual próprio, e é
isso que o distingue de uma variante do que já existe: se precisa de tokens
próprios, é componente próprio; se não precisa, é propriedade do componente
existente — não ganha nome novo só para existir.

**O mecanismo, não só o princípio.** Os nomes de token de um componente são a
API pública de tema dele. Um componente de família — que compõe a primitiva
base para um contexto visual específico, como navegação — aplica seus
próprios valores redefinindo esses nomes no próprio seletor, e isso é uso
documentado da API de tema, não travessia:

```css
.navButton {
  --button-primary-background: var(--nav-button-background);
}
```

Isto funciona porque declaração no próprio elemento vence a do ancestral: o
`Button` genérico lê `--button-primary-background` no seu próprio CSS Module,
e o seletor acima, mais específico, redefine essa variável só dentro de
`.navButton`, antes de `Button` a ler. Um valor colocado no invólucro sob um
nome novo — uma variável que `Button` nunca declara nem lê — não funciona: o
componente base não tem como saber que ela existe, e o efeito não aparece em
lugar nenhum, silenciosamente.

**Precedente que já reprovou uma vez, pelo caminho errado.**
`ValueWithProvenance` (D8 de `interface-atomic-structure`) resolveu o mesmo
problema — um componente de composição precisando de um valor visual que a
primitiva base não expõe como variante — alcançando dentro do átomo `Text`
por um seletor, `.context [data-weight]`, usando um atributo que não era
contrato declarado do átomo, em vez de redefinir um token. Funcionou até a
prova ser refeita com o localizador decoplado do mesmo atributo: a afirmação
indireta (comparação entre papéis) passou mesmo com o acoplamento quebrado,
porque os dois átomos comparados já diferiam de tamanho por outro motivo, sem
relação com o que estava sendo provado. O padrão que evita repetir esse
defeito é este: redefinir o nome de token que o componente base já declara,
nunca reaproveitar um atributo que ele não declarou como contrato.
`ValueWithProvenance` saiu do pacote junto com `domain-primitives`
(`remove-domain-capabilities`); o achado sobre a forma certa de compor
sobrevive a ele.

**A regra de camada.** Camada (átomo, molécula, organismo) descreve o que o
componente é para quem consome — um controle indivisível, uma composição
local de poucos controles, uma seção própria da tela —, não se ele compõe
outro componente por dentro. Um controle indivisível para quem usa é átomo
mesmo quando construído, por dentro, sobre outro átomo: `atoms/nav/button`
compõe `atoms/button`, mas continua sendo, para quem usa, um botão só, sem
partes que se manipulem em separado. **Isto é um desvio deliberado do
sentido clássico de átomo, do atomic design (Brad Frost)**, que definia
átomo como o que não renderiza nenhum outro componente nomeado do inventário
como filho estrutural — sem o desvio, o próprio exemplo desta seção
(`atoms/nav/button` compondo `atoms/button`) contradiria essa definição.

**A forma do caminho.** `<camada>/<família>/<componente>` — a primitiva base
fica na raiz da camada (`atoms/button/`) e permanece ali, permanente: o
primeiro componente de família que aparecer nunca realoca a base para dentro
de uma pasta de família. A pasta de família (`atoms/nav/`) só recebe o que é
próprio daquele contexto — o componente de família em si (`atoms/nav/button/`)
—, nunca a primitiva que ele compõe.

**O destino do componente de domínio.** Não existe mais um terceiro eixo
arquitetural chamado "domínio" com perímetro, guardião e pasta própria — isso
saiu inteiro com `domain-primitives` e `domain-charts`
(`remove-domain-capabilities`). O que resta como eixo de variação entre
componentes é camada (átomo, molécula, organismo) × família: uma
especialização visual e de composição, como "nav", sem vocabulário de
negócio e sem status arquitetural privilegiado — um componente de família é
um componente comum, que compõe outro e redefine tokens, nada mais. "Família"
não é "domínio" com nome trocado: nenhum guardião varre `atoms/nav/` do jeito
que `component-vocabulary` varria `molecules/domain/` e `organisms/domain/`,
porque não há vocabulário de negócio para proibir ali — se um dia houver, aí
sim é domínio de novo, e volta pela porta que `docs/decisao-configuracao-inicial-do-workspace.md`
já registrou: quando existir banco e API. Quando esse dia chegar, o
componente que souber vocabulário de negócio de verdade — que leia
`verification_level`, ou qualquer outro nome vindo do contrato de leitura —
não entra em `@chargebr/ui`: vive na pasta de componentes do próprio app que
o consome, como `apps/backoffice/app/_components/` já existe para isso. O
pacote fica genérico; o que sabe domínio mora onde o domínio é consumido.

**Lacuna registrada, não resolvida.** As checagens de contraste e de
legibilidade de `design-tokens` conhecem os conjuntos de token que existem
hoje, enumerados à mão. Com um conjunto de token por componente — não um
conjunto pequeno e fixo por camada semântica —, essas checagens precisam
enumerar os conjuntos automaticamente, ou todo componente novo entra sem
medição de contraste nenhuma. Não resolvo isso aqui: registro a lacuna, com
gatilho. **Gatilho:** o primeiro componente de família com cor própria — que
será `atoms/nav/button` ou `atoms/nav/link`, no grupo 6 de
`interface-atomic-structure`.

*Correção de 29 de setembro de 2026, na aplicação de `button-variants`:
esta lacuna **não** fechou naquele ciclo — a nota anterior aqui afirmava que
sim, "pela mesma causa", e a afirmação era imprecisa. `button-variants`
generaliza `contrast.ts` para descobrir todo `color-action-<estado>` da
camada **semântica** a partir da fonte (requisito "Conjunto de ação e estado
é enumerado, nunca fixo", `design-tokens`) — fecha a leitura fixa por nome
de chave (`color-action-primary`/`color-action-primary-hover`/
`color-text-on-action`), que é uma lacuna real, mas outra: nenhuma checagem
de contraste olha para token de **componente** com cor própria, e
`component/spinner.json` (novo, no mesmo ciclo) não é o caso — seu campo
`color` só referencia `{color.action.primary}`, um semântico que a varredura
já cobre, sem introduzir cor própria nenhuma. O gatilho permanece: o
primeiro componente cujo token de cor não seja referência a um semântico já
coberto — que ainda será `atoms/nav/button` ou `atoms/nav/link`, no grupo 6
de `interface-atomic-structure`.*

## Adenda, 29 de setembro de 2026: token nasce com o componente que o consome

**Decisão do dono.** Token e o componente que o consome nascem na mesma
mudança. Nunca em ciclos separados — token sem componente não é visível, e
aprová-lo sozinho é aprovar abstração; com os dois juntos, mudar o token e ver
o resultado na bancada é o mesmo passo. Registrado em `rules.design` de
`openspec/config.yaml`.

**O caso que provou o contrário, medido.** `component/button.json` nasceu
antes de `Button` existir — o próprio arquivo se descreve assim:
`"$description": "Mínimo da camada de componente: prova a regra de
referência antes de existir componente."` (`component/button.json:3`). Sem
componente para revisar contra ele, o token saiu com um par de cor (`primary`)
e sem os dois eixos que a primeira leitura de referência (MUI, gluestack,
react-aria-components) viria a apontar como convergência das três —
desabilitar e tamanho. Não é defeito do arquivo: é a consequência mecânica de
um token nascer sem o componente que o forçaria a decidir esses eixos na
hora. O ciclo `button-variants` é o primeiro a aplicar a regra nova, com os
dois nascendo juntos — e, de caminho, fecha a lacuna de enumeração registrada
acima, na mesma causa: token e checagem de contraste também nascendo
desalinhados quando nascem em momentos diferentes.
