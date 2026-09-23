# Desenho — gráficos de domínio v1

## Context

Ver `proposal.md` — Why. A paleta categórica foi validada no ciclo 2 contra o
critério de `docs/decisao-criterio-de-paleta-categorica.md`; a hachura existe como
átomo desde o ciclo 4, em DOM; as primitivas de domínio e o vocabulário existem
desde o ciclo 5. A bancada executa cada história nos dois temas.

## Goals / Non-Goals

**Goals**

- Uma hachura só, entre gráfico e fora dele.
- Checagens de paleta aplicadas com a lista de pares que cada forma exige.
- Restrições de domínio impostas onde são mais fáceis de violar sem perceber.

**Non-Goals**

- Rampa sequencial, divergente ou paleta de status.
- Exportação de imagem, impressão, animação.
- Painel, tela ou rota.

## Decisions

**visx 4.0.0.** Fixada na decisão de configuração inicial e confirmada agora:
declara `react ^18.0.0 || ^19.0.0`, compatível com o React 19 do ciclo 3. Dá
primitivas componíveis sobre D3 em vez de gráficos prontos, que é o que permite
impor as regras de domínio no desenho da marca em vez de contorná-las.

**A hachura do gráfico é a mesma, por construção.** O átomo do ciclo 4 desenha em
DOM; o gráfico precisa de um padrão SVG. São mecanismos diferentes, e é exatamente
aí que nascem duas hachuras parecidas porém diferentes — o risco que o desenho do
ciclo 4 nomeou ao fazer a hachura ser átomo próprio.

A decisão: ângulo, espaçamento e espessura vivem numa definição compartilhada, e
as duas implementações derivam dela. O requisito de hachura única é verificado por
execução, comparando as duas definições.

**A lista de pares é propriedade da forma, não escolha de quem usa.** Barra,
linha e pilha só encostam vizinhos: pares adjacentes. Dispersão, bolha, mapa e
pequenos múltiplos podem encostar qualquer marca em qualquer outra: todos os
pares. A forma declara qual lista usa, e a checagem obedece.

**O limite de séries é consequência, não configuração.** A paleta validada sustenta
três séries na checagem de todos os pares. Uma quarta série numa forma dessas não
é problema de paleta — nenhuma reordenação resolve —, é limite da forma. O tipo
recusa, e quem precisa de mais séries agrupa em "outras" ou usa pequenos múltiplos.

**Bloqueio substitui o gráfico inteiro.** Nem eixo, nem grade, nem escala. Eixos
vazios comunicam intervalo e ordem de grandeza, e isso é informação sobre um dado
que a metodologia mandou não exibir. A alternativa de manter o enquadramento para
o painel não "saltar" foi recusada: estabilidade de layout não justifica vazar
escala.

**Linha interrompida no não resolvido.** Ligar um ponto resolvido a um não
resolvido afirma continuidade que o dado não sustenta — é a agregação silenciosa
que a restrição proíbe, na forma de um segmento. A marca recebe hachura; a linha
não a atravessa.

**Fixtures sintéticas são declaradas no próprio arquivo.** Esta mudança entrega
mais formas do que o contrato produz dado para exercitar. A distinção que
autoriza: fixture sintética num gráfico afirma capacidade de renderização, não
estado do domínio. A trava é a declaração explícita, para que nenhuma fixture
sintética possa ser lida depois como derivada do contrato.

## Risks / Trade-offs

- Duas implementações de hachura podem divergir com o tempo → definição
  compartilhada e checagem por execução; divergir reprova.
- O limite de três séries pode parecer arbitrário para quem chegar depois →
  ele é consequência do critério documentado, e a mensagem de reprovação nomeia a
  forma e o limite.
- Representação equivalente em texto dobra a superfície de cada gráfico → é o que
  torna os valores alcançáveis sem a visão e, de quebra, o que carrega a
  proveniência, que nenhum pixel carrega.
- Variedade de formas sem dado real que as exercite → mitigada pela declaração de
  fixture sintética, não eliminada; formas que nunca ganharem dado real são
  candidatas a remoção num ciclo futuro.

## Migration Plan

Aditiva. Reversão é o revert do commit, exceto pela definição compartilhada da
hachura, que passa a ser consumida também pelo átomo do ciclo 4.

## Open Questions

Nenhuma.
