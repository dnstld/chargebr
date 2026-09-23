# Desenho — shell do back office

## Context

Ver `proposal.md` — Why, e `specs/` para as exigências. O que restringe este
desenho, e já está provado no repositório:

- A bancada (camada 1) executa `packages/ui/src/**/*.stories.tsx` em navegador
  real, nos dois temas, com axe em modo de reprovação. Ela não alcança nada
  fora de `packages/ui`.
- A camada 2 — o documento emitido por `next build` — foi medida em
  `docs/decisao-prova-de-comportamento-de-aplicacao.md`: documento completo por
  rota estática, atributos do elemento raiz saindo como declarados, scripts de
  hidratação todos `async`, 8,8 segundos de construção num aplicativo mínimo.
- A camada 3 não existe. Nenhuma exigência deste ciclo depende dela.
- O tema já é resolvido em CSS por `@chargebr/tokens`: `:root` claro,
  `@media (prefers-color-scheme: dark)` e `:root[data-theme="dark"]`, com as
  quatro combinações exercitadas em `theme.test.ts`.
- `pnpm verify` tem quatro estágios e a raiz já descobre `apps/*` no workspace,
  no Vitest e no Biome.

## Goals / Non-Goals

**Goals**

- Que cada exigência do shell caia na camada onde é realmente observável, e em
  nenhuma outra.
- Que a aplicação seja composição: o comportamento provável mora na biblioteca,
  onde a bancada alcança.
- Que o perímetro de verificação feche junto com o nascimento de `apps/`, no
  mesmo ciclo.

**Non-Goals**

- Segunda bancada, segundo executor de teste, estágio novo, servidor.
- Abstração de layout para telas que ainda não existem.
- Qualquer decisão sobre onde a busca de dado vai morar quando existir.

## Decisions

### A moldura vive em `@chargebr/ui/shell`, não na aplicação

A bancada só enxerga `packages/ui`. Um componente de moldura escrito dentro de
`apps/backoffice` não teria camada 1 — e como a camada 3 não existe, ele não
teria prova nenhuma além do que o documento emitido mostra, que é estrutura, não
comportamento. Foco que se move ao acionar o salto, cor resolvida por tema e
família tipográfica computada só são observáveis em navegador, e o navegador que
este repositório tem é o da bancada.

A alternativa recusada foi montar uma segunda bancada dentro da aplicação: custa
um segundo executor e um estágio, para provar em outro lugar exatamente o que a
bancada já prova.

Consequência: `apps/backoffice` é composição. Layout raiz, página da rota raiz,
folha global e testes do documento emitido — nada além disso.

### Um componente de moldura, não três

`AppFrame` renderiza o salto, o cabeçalho e o conteúdo principal, e recebe
`productName`, `skipLabel` e `children`.

A garantia que importa é uma relação entre as três partes: o salto é o primeiro
focalizável **e** seu destino é a região de conteúdo. Partidos em três
componentes, a relação vira responsabilidade de quem compõe — isto é, da
aplicação, que é justamente o lugar sem bancada. Num componente só, a relação é
exercitada por uma história.

### O salto move o foco sem script

O link de salto é uma âncora para o fragmento da região de conteúdo, e a região
de conteúdo declara `tabIndex={-1}`. O navegador move o foco para o alvo de um
fragmento quando ele é focalizável; nenhum manipulador de evento participa.

Em consequência, nenhum componente da moldura declara `"use client"`: não há
estado de cliente e não há React Aria envolvida. A moldura inteira é componente
de servidor, e a aplicação não emite script próprio nenhum — o que torna a
exigência "nenhum artefato emitido menciona o atributo de tema" verdadeira por
construção, e não por vigilância.

A alternativa recusada foi um manipulador que chama `focus()`: acrescentaria um
componente de cliente e um script à aplicação para reproduzir o que o navegador
já faz.

### O tema não tem código

Decisão fechada por resposta, não por suposição (ver `proposal.md`): o shell não
oferece escolha explícita de tema. O layout raiz importa a folha publicada por
`@chargebr/tokens` e nada mais. Não há provedor, não há resolvedor, não há
atributo no elemento raiz e não há script — a preferência do sistema resolve, em
CSS, como já resolve na bancada.

`data-theme` continua existindo e continua exercitado: é a bancada que o usa,
para forçar cada história nos dois temas. O que este ciclo decide é que a
aplicação não o usa.

### A camada 2 constrói uma vez por execução, e nunca reaproveita artefato velho

A construção roda uma vez por execução da verificação, antes das afirmações
sobre o documento; as afirmações leem o que ela emitiu. Não é estágio novo:
acontece dentro do estágio de testes, como a bancada acontece.

Reaproveitar um artefato já presente na árvore foi recusado: um documento velho
que ainda satisfaz as afirmações faz a prova mentir sobre a árvore corrente, que
é exatamente o modo de falhar que `docs/decisao-prova-de-comportamento-de-aplicacao.md`
proíbe. Construir por afirmação também foi recusado: multiplica 8,8 segundos sem
acrescentar garantia, já que todas leem a mesma saída.

Ausência do artefato **reprova**, com o caminho procurado na mensagem. Nenhuma
afirmação sobre o documento pula, em nenhuma circunstância.

### O conjunto de rotas emitidas é declarado, e a declaração vem de observação

A verificação compara o conjunto de documentos emitidos com um conjunto
declarado. O conteúdo dessa declaração não é suposto aqui: a primeira tarefa do
grupo da camada 2 é executar a construção, registrar o que ela emitiu — caminho
exato de cada documento — e declarar o que foi observado. O mapeamento de rota
aninhada para arquivo continua aberto, como a decisão registrou, e este ciclo
não o toca porque emite uma rota só.

### O documento é lido por um DOM, não por expressão regular

As afirmações da camada 2 rodam em Node e analisam o HTML emitido com
`happy-dom`, que `packages/tokens` já usa em `theme.test.ts`. "Primeiro elemento
focalizável na ordem do documento" e "região identificável pelo papel" são
perguntas sobre uma árvore; respondê-las por expressão regular sobre texto
produz prova frágil que passa a depender da formatação do emissor.

O estilo entregue é seguido a partir do documento — pela referência que ele
carrega ou pelo estilo embutido nele, o que existir. As duas formas são saída; o
que a afirmação não pode fazer é ler a fonte da folha em vez do que foi entregue.

### A aplicação não tem diretório `src/`

`app/` fica na raiz do pacote da aplicação. A razão é a lista de importações
proibidas abaixo, que barra `**/src/**` para impedir que a aplicação alcance a
árvore herdada de coleta; sem `src/` próprio, essa proibição não tem como
colidir com um caminho legítimo da própria aplicação.

### A checagem de tipos não depende de construção anterior

`verify:types` executa `tsc --noEmit` por pacote e não pode exigir que uma
construção tenha rodado antes. Em consequência, a aplicação não liga rotas
tipadas — o recurso gera tipos dentro do diretório de artefatos, e o estágio de
tipos passaria a depender do estágio de testes.

### A lista de importações proibidas para `apps/**`

Não é cópia da lista de `packages/**`. Cada item, e a razão dele:

| Proibido em `apps/**` | Razão |
| --- | --- |
| `**/apps/**`, e os caminhos relativos que escapam da aplicação (`../../**` e mais fundos) | Uma aplicação nunca alcança arquivo de outra. O que for comum entre duas aplicações é publicado por um pacote, com mapa de exportações e verificação próprios. Hoje há uma aplicação só: a regra entra antes da segunda, que é quando ela deixa de ser barata. Os caminhos relativos entraram na implementação e não estavam nesta tabela: a regra casa com o texto da importação, e de `apps/backoffice/app/` um arquivo de outra aplicação se escreve `../../outra/...`, que nunca soletra `apps/`. Sem eles a proibição não pega o caso que a motiva. O preço é que uma rota aninhada em `app/a/b/` passaria a precisar de `../../` para alcançar a própria aplicação, e reprovaria: hoje não existe rota aninhada — o conjunto de rotas emitidas é declarado, e declarar uma segunda é ato deliberado —, e o ciclo que trouxer a primeira reabre esta linha. |
| `@chargebr/*/src/**`, `**/packages/**` | O mapa de exportações do pacote é o contrato. Caminho interno transforma arquivo de implementação em interface pública sem que ninguém tenha decidido isso, e congela a estrutura interna do pacote no consumidor. |
| `**/queries/**`, `**/supabase/**`, `**/data/canonical/**`, `**/src/**`, `**/tests/**` | Árvore herdada, fora do workspace e fora do perímetro, com destino não decidido. Uma aplicação que a alcance por caminho relativo amarra a interface à forma do coletor e fura o requisito "Perímetro isolado", que promete que esses diretórios não são lidos pela verificação. |
| Clientes de dado: `@supabase/*`, `pg`, `postgres`, `kysely`, `drizzle-orm`, `@prisma/client`, `swr`, `@tanstack/react-query`, `@tanstack/query-core`, `@apollo/client`, `urql`, `graphql-request` | Este ciclo não busca dado. A regra é o que torna a exclusão verificável em vez de combinada. **É a única da lista com data para reabrir:** o ciclo que trouxer o contrato de leitura decide onde a busca mora, e reescreve esta linha. |
| Clientes de rede: `axios`, `ky`, `got`, `node-fetch`, `undici`, `http`, `https`, `net`, `dns`, `node:http`, `node:https`, `node:net`, `node:dns` | Mesma razão, pelo outro caminho: sem ela, a proibição anterior se contorna com uma chamada direta. |
| Globais de rede: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` | Mesma razão, pelo terceiro caminho — o que não precisa de importação nenhuma. |

**Permitido, e é a diferença que justifica a lista existir:** `next` e `next/**`.
A aplicação é quem tem rota, servidor e convenção de página; proibir o framework
nela seria copiar a lista da biblioteca sem lê-la.

### O perímetro dos guardiões

`tools/checks/style-literals.test.ts` passa a varrer `packages/` e `apps/`. A
isenção continua sendo o pacote de tokens, e continua sendo por nome de pacote,
não por posição na lista de áreas.

`tools/checks/domain-vocabulary.test.ts` é generalizado, e renomeado para
`tools/checks/component-vocabulary.test.ts`. A checagem em si não muda: ela já
lê pela árvore sintática e já distingue identificador de rótulo. O que muda é o
sujeito — de "primitiva de domínio" para "componente que exibe texto" — e, em
consequência, o perímetro, que passa a ser dois, nomeados um a um: o diretório
das primitivas de domínio e o diretório da moldura. O cabeçalho do arquivo é
reescrito para dizer isso.

A alternativa recusada foi só estender o perímetro, mantendo nome e cabeçalho.
O guardião passaria a reprovar código que não é de domínio sob um nome que diz
que é, e a primeira pessoa a ler a mensagem de reprovação procuraria a regra no
lugar errado. A outra alternativa recusada foi um segundo guardião para a
moldura: a regra é a mesma, e duplicá-la cria duas cópias que divergem no dia em
que uma delas receber um caso novo.

O perímetro continua sendo lista fechada e nomeada, e não `packages/ui/src`
inteiro: história, fixture e arquivo de checagem de tipos exibem dado e prova,
não declaram vocabulário, e continuam fora.

`tools/checks/type-suppression.test.ts` muda só no que a construção obrigou: o
perímetro e a lógica ficam como estavam — já declarava `PERIMETER = ["packages",
"apps"]` e já tratava o diretório inexistente —, e o diretório de artefatos
entra na lista de diretórios pulados. A razão apareceu na implementação: o
framework gera dentro dele um arquivo com supressão de tipo sem justificativa, e
sem a exclusão o guardião reprova o que a própria verificação acabou de gerar —
o mesmo motivo pelo qual esse diretório já fica fora da formatação e do lint.

### A moldura entra na cobertura de histórias que já existe

O contrato de estados usado por átomos, primitivas e formas de gráfico —
`defineContract(camada, …)` — serve à moldura sem alteração. A lista de
contratos da cobertura ganha a moldura; estado sem história continua reprovando
pelo mesmo teste.

Estados: **repouso** e **salto focado**. Carregamento, vazio e erro não são
declarados, e a razão está no requisito.

### A superfície do documento

A folha global da aplicação declara a superfície e a cor de texto no corpo do
documento, consumindo token e nada além — o mesmo que `preview.css` faz na
bancada, e pela mesma razão: sem ela, o que estiver fora da caixa da moldura
fica branco no tema escuro. Sob o perímetro estendido, essa folha é varrida pelo
guardião de literais como qualquer arquivo de `packages/`.

## Risks / Trade-offs

- **O caminho do artefato emitido é interno ao framework** (R1 da decisão) → a
  ausência reprova, nunca pula, e o caminho observado fica registrado no corpo
  do PR, para que uma atualização de versão que o mova seja diagnosticável em
  vez de misteriosa.
- **Uma rota que deixe de ser estática para de emitir** (R2) → mesma mitigação:
  a comparação com o conjunto declarado reprova nos dois sentidos.
- **A construção dentro do estágio de testes custa tempo** (R3) → aceito, uma
  construção por execução. Se incomodar, a discussão é reaproveitamento de
  construção, nunca troca da observação da saída pela leitura da fonte.
- **A camada 2 pode ser lida como prova de experiência** (R4) → nenhuma
  exigência deste ciclo menciona pintura, e o requisito de tema diz o que diz
  sobre o documento entregue, não sobre o que a pessoa vê primeiro.
- **O estilo pode passar a ser embutido no documento em vez de referenciado** →
  a afirmação aceita as duas formas, porque as duas são saída entregue.
- **A moldura renderizada dentro da bancada pode disparar regra de axe sobre
  aninhamento de regiões** → a história renderiza a moldura como raiz da
  história; se ainda assim uma regra disparar, a correção é na estrutura da
  história, nunca rebaixar a regra.
- **Proibir cliente de dado em `apps/**` será sentido como prematuro no ciclo
  seguinte** → é deliberado e datado: a linha tem dono e momento para ser
  reescrita, e até lá a exclusão do ciclo é verificável.
