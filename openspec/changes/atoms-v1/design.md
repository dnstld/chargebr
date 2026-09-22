# Desenho — átomos v1

## Context

Ver `proposal.md` — Why. `@chargebr/tokens` publica três camadas e dois temas
desde o ciclo 2. A bancada do ciclo 3 executa cada história nos dois temas, com a
checagem de acessibilidade em modo de reprovação por padrão. `packages/ui` publica
uma única história de superfície.

## Derivação

Cada átomo existe porque uma restrição de domínio o exige. Nenhum entra por
convenção de biblioteca.

| Restrição | O que a primitiva do ciclo 5 precisa fazer | Átomo |
| --- | --- | --- |
| Valor principal, contrafactual e contexto são visualmente distintos | dizer qual papel cada valor ocupa | Texto, com papéis |
| Redação original ao lado da normalizada, nunca no lugar | exibir duas redações sem hierarquia que sugira substituição | Texto, com papéis |
| Todo número exibido alinha e é comparável | renderizar número tabular, em três papéis | Número |
| Os três eixos são independentes e nenhum componente os colapsa | exibir vários estados lado a lado, cada um dizendo a que eixo pertence | Marcador de estado |
| `unresolved` permanece visível e nunca recebe preenchimento sólido | distinguir não resolvido sem usar cor como único sinal | Hachura |
| `projection_status = blocked` não exibe número; ausência nunca é zero | ocupar o lugar do número sem nada que possa ser lido como valor | Ausência declarada |
| Todo número carrega caminho até sua evidência | oferecer o caminho, de forma alcançável por teclado e leitor de tela | Âncora de evidência |

## Goals / Non-Goals

**Goals**

- Seis átomos, cada um rastreável à restrição que o exige.
- Regras que não dependem de disciplina: estado sem história reprova, ausência sem
  razão não compila, marcador sem eixo não compila.
- Distinção perceptível sem cor, porque cor é o canal que falha primeiro.

**Non-Goals**

- Botão, campo, cartão, modal, menu. Nenhuma restrição os exige hoje.
- Composição de primitivas de domínio, que é o ciclo 5.
- Qualquer gráfico, que é o ciclo 6.

## Decisions

**A hachura é átomo, não detalhe de outro átomo.** Ela é exigida pelo marcador
agora e será exigida pelos gráficos no ciclo 6. Nascer como peça própria evita
que a versão do gráfico seja uma segunda hachura, parecida mas diferente — o que
quebraria a leitura de "não resolvido" justamente quando ela mais importa.

**Eixo e razão são obrigatórios no tipo, não validados em execução.** Um marcador
sem eixo e uma ausência sem razão reprovam na checagem de tipos, antes de existir
render. Validar em execução transferiria o erro para quem lê a tela.

**O eixo integra o nome acessível.** Não basta o marcador exibir o eixo
visualmente: quem usa leitor de tela precisa ouvir a que eixo aquele estado
pertence, senão os três eixos independentes colapsam num só na leitura — que é
exatamente o que a restrição proíbe, só que numa modalidade diferente. O nome
sai do próprio conteúdo, sem ARIA: o estado é texto visível e o eixo é texto
visualmente oculto, porque um marcador de estado não é imagem e
`aria-roledescription` tem suporte irregular — onde falta, o rótulo some.

**Distinção por propriedade não cromática, verificada por leitura de estilo
computado.** Os três papéis diferem em peso, tamanho ou textura, e o teste lê as
propriedades computadas e compara as não cromáticas. A alternativa — inspecionar
o código — afirmaria sem executar.

**Estado sem história reprova por enumeração, não por convenção.** A verificação
compara os estados declarados no contrato de cada átomo com as histórias
existentes. Sem isso, "todo estado tem história" é promessa que decai no terceiro
átomo.

**Primitivas de comportamento acessível só onde há interação.** Dos seis, apenas a
âncora de evidência tem comportamento. Os outros cinco são apresentação e não
precisam de biblioteca de comportamento — trazê-la para todos custaria peso sem
entregar acessibilidade.

## Risks / Trade-offs

- Hachura pode ficar invisível em tamanho pequeno → o átomo declara o tamanho
  mínimo em que a textura é perceptível, e a história exercita esse limite.
- Ler estilo computado para provar distinção não cromática é frágil se a fonte não
  estiver carregada → a bancada já garante fontes e tokens resolvidos antes de
  medir, pelo requisito de determinismo do ciclo 3.
- Seis átomos de uma vez é bastante superfície para um ciclo → eles são pequenos e
  interdependentes; separar em dois ciclos entregaria metade sem consumidor.
- A enumeração de estados depende de o contrato declará-los de forma legível →
  decisão registrada: o contrato de cada átomo expõe seus estados como valor
  enumerável, não como união implícita em comentário.

## Migration Plan

Aditiva. `packages/ui` publica hoje apenas uma história de superfície, que
permanece. Reversão é o revert do commit.

## Open Questions

Nenhuma. Os nomes visíveis em PT-BR de cada estado e de cada razão de ausência são
conteúdo, decididos no ciclo 5 junto com as primitivas que os exibem; os átomos
recebem esse texto por propriedade.
