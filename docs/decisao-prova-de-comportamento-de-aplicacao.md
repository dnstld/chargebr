# Decisão: como este repositório prova comportamento de aplicação

**Data:** 22 de setembro de 2026
**Estado:** decidida
**Origem:** bloqueio registrado na proposta do shell do back office, ciclo 7

## A pergunta

A bancada de provas do projeto é o Storybook, rodando em navegador real sob
Vitest, com axe em modo de reprovação nos dois temas. Ela alcança componentes.

O shell do back office não é um componente. Três dos seus entregáveis são
comportamento de aplicação, e dois foram definidos como valendo "a um documento
real, e não a uma história isolada". Reformulá-los para caber numa história é
transformá-los naquilo que o ciclo exclui.

A saída óbvia — ler o código-fonte do layout e afirmar sobre o que ele declara —
é proibida pela regra de spec do projeto: critério de aceite descreve
comportamento observável, nunca implementação.

Daí o bloqueio: **como este repositório prova comportamento de aplicação?**

## O que a bancada alcança, e o que não alcança

**Alcança:** qualquer coisa que seja um componente com estados declarados.
Renderização em navegador real, os dois temas, axe, afirmações sobre a árvore
renderizada. Sete ciclos de átomos, primitivas de domínio e gráficos vivem aí.

**Não alcança:** o documento que o servidor entrega. A bancada monta um
componente dentro de uma página que ela mesma construiu. Ela nunca observa o
HTML que uma pessoa recebe ao pedir uma rota — e é exatamente sobre esse
documento que as exigências do shell falam.

## O que eu testei antes de decidir

Montei um aplicativo Next.js 16 App Router mínimo, fora deste repositório, com
um layout que declara `lang` e `data-theme` no elemento raiz e um script
síncrono no `head`. Rodei `next build` e inspecionei o que foi emitido.

**Resultado:**

- O build emite `.next/server/app/index.html` — um documento HTML completo — para
  toda rota estaticamente pré-renderizada. A rota foi classificada como
  `○ (Static)`.
- O elemento raiz sai como foi declarado:
  `<html lang="pt-BR" data-theme="light">`. O atributo de tema **está no
  documento entregue**, antes de qualquer script.
- Os quatro scripts de hidratação saem todos com `async`, nas posições 249 a 469
  do documento.
- O script síncrono declarado no `head` sai na posição 559, sem `async` e sem
  `defer`, antes da abertura de `<body>`, que fica na posição 701.
- Tempo do build, num aplicativo mínimo: 8,8 segundos.

## A decisão

**Este repositório prova comportamento de aplicação em três camadas, e só as
duas primeiras existem hoje.**

### Camada 1 — a bancada

O que já existe. Componentes e seus estados, em navegador real, nos dois temas,
com axe em modo de reprovação. Inalterada.

### Camada 2 — o documento emitido

Nova. O `next build` produz um documento HTML por rota estática. Uma afirmação
sobre esse documento é afirmação sobre **saída**, não sobre código.

A distinção que separa esta camada de "ler o código-fonte" é uma só, e é
operacional: **a afirmação sobrevive a uma reescrita da fonte que preserve a
saída?** Um teste que lê `layout.tsx` e procura um atributo morre quando o
atributo passa a vir de uma função — descreve implementação. Um teste que lê o
HTML emitido e procura o atributo no elemento raiz continua valendo — descreve
comportamento.

Esta camada prova, entre outras coisas:

- que o elemento raiz do documento entregue carrega o atributo de tema;
- que o script capaz de alterá-lo é síncrono e precede `<body>`;
- que as regiões que o layout promete estão no documento;
- que algo que não deve existir no documento entregue não existe.

Ela roda no estágio de testes que já existe. Não acrescenta estágio a
`pnpm verify`, não acrescenta servidor e não acrescenta segundo executor.

### Camada 3 — a aplicação em execução

Adiada. Um navegador dirigido contra um servidor iniciado. É o que faz falta
para navegação entre rotas e para comportamento que só existe depois da
hidratação.

**Gatilho:** a primeira exigência que fale de navegação entre rotas, ou de
comportamento que só passe a existir após a hidratação. Enquanto nenhuma existir,
a camada 3 não é construída — e o custo dela (servidor, segundo executor,
provavelmente um estágio novo) é a razão de não a construir antes.

## O que a camada 2 não prova, e isto não pode ser suavizado

Um script síncrono **posicionado** antes de `<body>` não é prova de que ele
**executou** antes da primeira pintura. A camada 2 prova a condição necessária,
nunca a suficiente.

Em consequência, uma exigência do shell **não pode** ser redigida como "o tema
correto aparece antes da hidratação". Ela precisa ser redigida como a
propriedade observável: o documento entregue carrega o tema no elemento raiz, e
nada que possa alterá-lo depende de script adiado. Quem quiser a afirmação sobre
a pintura precisa da camada 3, e precisa dizer isso.

## Riscos

**R1 — o caminho do artefato é interno ao Next.** `.next/server/app/*.html` não
é interface pública. Uma atualização de versão pode movê-lo.
*Mitigação:* o teste **reprova quando o artefato não existe**, jamais pula. Um
teste que pula quando não acha o arquivo transforma uma quebra em silêncio, e é
assim que uma prova morre sem ninguém saber.

**R2 — só rota estaticamente pré-renderizada emite HTML.** Uma rota que passe a
ser dinâmica deixa de emitir, e a prova perde o objeto.
*Mitigação:* a mesma de R1. A ausência reprova.

**R3 — o build dentro do estágio de testes custa tempo.** 8,8 segundos num
aplicativo mínimo, mais num real. Não é estágio novo, mas é teste lento.
*Aceito:* é o preço de observar a saída em vez do código. Se o tempo incomodar,
a discussão é sobre reaproveitar um build já feito, nunca sobre trocar a
observação da saída pela leitura da fonte.

**R4 — a camada 2 pode ser confundida com prova de experiência.** Ver a seção
acima. A redação das exigências é onde isso se controla.

## Decisões em aberto

- **O mapeamento de rota para arquivo em rotas aninhadas** não foi verificado.
  Testei apenas a rota raiz. O ciclo que primeiro usar a camada 2 com rota
  aninhada precisa fixá-lo e registrar o que observou.
- **Se a camada 3 chegará a ser necessária** depende de exigências que ainda não
  existem. O gatilho está escrito acima; enquanto ele não disparar, a pergunta
  fica aberta de propósito.

## Consequência para o ciclo 8

O shell deixa de estar bloqueado. As exigências sobre o documento entregue —
tema, regiões, tipografia aplicada a um documento real — são redigíveis como
comportamento observável e provadas pela camada 2. As exigências sobre
componentes do shell continuam na camada 1.

Nenhuma exigência do ciclo 8 pode depender da camada 3. Se alguma precisar,
registra-se a lacuna e para-se, como foi feito aqui.

## Atualização de 25 de setembro de 2026 — ciclo `dynamic-route-readiness`

O texto acima fica como foi decidido. Esta seção registra o que a primeira rota
dinâmica mostrou, e o que mudou por causa disso.

### O mapeamento observado

A "decisão em aberto" sobre rota aninhada foi observada numa construção com
Next.js 16.3.6 (Turbopack), com rotas plantadas e revertidas:

| Rota | Classificação | Documento emitido |
| --- | --- | --- |
| `/` | `○` | `server/app/index.html` |
| `/sobre` | `○` | `server/app/sobre.html` |
| `/sobre/equipe` | `○` | `server/app/sobre/equipe.html` |
| `/frotas/[id]`, lista aberta, valor `alfa` | `●` | `server/app/frotas/alfa.html` |
| `/modelos/[id]`, lista fechada, valor `beta` | `●` | `server/app/modelos/beta.html` |
| `/veiculos/[id]`, sem lista | `ƒ` | nenhum |
| `/icon.svg` (metadados) | `○` | nenhum — `server/app/icon.svg.body` e `.meta` |
| `/sitemap.xml` (metadados) | `○` | nenhum — `server/app/sitemap.xml.body` e `.meta` |

Os casos seguem o mesmo desenho, e mesmo assim **não viraram regra**: cada
documento é declarado pelo caminho exato em que foi observado, e a verificação
compara o conjunto emitido com o declarado nos dois sentidos. Quando uma rota
entra, ou uma versão do Next move um caminho, a verificação nomeia o caminho.

### R2, revisto

R2 dizia que uma rota que passe a ser dinâmica deixa de emitir documento, e
tinha como mitigação a mesma de R1: a ausência reprova. A mitigação só cobre a
rota que **tinha** documento declarado. Uma rota que nasce resolvida por
requisição nunca teve documento, e nenhuma ausência a denuncia — medido: com
`/prova/[id]` plantada e sem declaração, a trava de documentos passou verde.

**Mitigação nova:** a camada 2 afirma sobre a **lista de rotas** que a
construção produz — `app-path-routes-manifest.json` e
`server/pages-manifest.json` —, e cada rota declara sua forma de entrega,
lida só da classificação da construção em `prerender-manifest.json`. Rota
produzida e não declarada reprova, qualquer que seja a forma; rota cuja forma
observada diverge da declarada reprova nomeando as duas. A ausência de
documento continua reprovando para as rotas que o declaram.

O que a camada 2 continua não provando: o conteúdo de uma rota resolvida por
requisição. Declarar a forma é declarar essa lacuna, rota a rota; ela está no
ponto 1 de `docs/pontos-abertos.md`.
