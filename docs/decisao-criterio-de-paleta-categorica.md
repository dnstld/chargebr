# Decisão: critério de paleta categórica

## Estado

`PROPOSTA PARA REVISÃO`

## Escopo

Este documento define o critério pelo qual uma paleta categórica de gráfico é
aprovada ou reprovada no ChargeBR: quais checagens existem, quais são os
limiares, em que escala e sob qual modelo de simulação.

Ele é a fonte de verdade que a implementação cita. Não altera nenhum valor de
paleta, não decide forma de gráfico e não toca a identidade visual registrada em
`decisao-identidade-visual.md`.

## Contexto

A decisão de configuração inicial afirmava que a paleta categórica havia sido
"validada nos seis testes". Uma varredura do histórico completo mostrou que
esses testes nunca foram definidos em documento algum: a expressão aparecia em
três arquivos revertidos, sempre se referindo a um critério inexistente.

O ciclo 2 substituiu a afirmação por seis checagens executáveis, implementadas em
`packages/tokens/src/palette.ts`. Faltava o passo que este documento dá: a
implementação precisa citar um critério que viva no repositório, e não uma
referência externa que ninguém consegue auditar depois.

## As seis checagens

Uma paleta categórica é aprovada somente quando todas passam, em ambos os temas.

| # | Checagem | Limiar | Natureza |
| --- | --- | --- | --- |
| 1 | Âncoras de matiz em ordem fixa | ordem nunca muda; slots atribuídos em sequência, nunca ciclados | estrutural |
| 2 | Banda de luminosidade por tema | OKLCH L entre 0,43 e 0,77 no claro; entre 0,48 e 0,67 no escuro | medida |
| 3 | Piso de croma | OKLCH C ≥ 0,10 | medida |
| 4 | Separação sob daltonismo | ΔE ≥ 6 obrigatório; ≥ 8 é o alvo, registrado quando não atingido | medida |
| 5 | Piso de separação para visão normal | ΔE ≥ 15, sem exceção | medida |
| 6 | Contraste contra a superfície do tema | ≥ 3:1 para marcas | medida |

A checagem 1 é estrutural: não se mede, se respeita. As demais são executadas por
script e reprovam a verificação.

## Escala e modelo

**Espaço de cor:** OKLab, e OKLCH para luminosidade e croma. Definidos por Björn
Ottosson em 2020.

**Distância:** distância euclidiana em OKLab, multiplicada por 100. Todos os
limiares acima estão nessa escala. A multiplicação é explícita porque a distância
crua em OKLab fica na casa dos centésimos, e um limiar de 15 lido contra um valor
de 0,142 parece reprovação quando é aprovação com folga.

**Simulação de daltonismo:** modelo de Machado, Oliveira e Fernandes (2009), a
severidade 1,0, sob protanopia e deuteranopia. Os limiares da checagem 4 são
calibrados para esse modelo: o modelo faz parte do critério, não do detalhe de
implementação. Trocar de modelo ou de severidade exige rever os limiares neste
documento, não apenas a biblioteca.

**Contraste:** razão de contraste da WCAG entre a cor e a superfície declarada do
tema.

## Proveniência dos limiares

Os espaços de cor, o modelo de simulação e a razão de contraste têm origem
publicada e verificável. **Os limiares numéricos não.** Eles vêm de um método de
design de visualização usado durante o ciclo 2, que não é padrão público nem
documento deste projeto.

Fica registrado assim, e não como se fossem consequência dos trabalhos citados. A
partir deste documento os limiares são do ChargeBR: revisáveis por decisão
própria, com a justificativa que esta decisão puder dar e não por autoridade
emprestada.

## Escopo do critério

Vale para **paleta categórica** — identidade de série. Não julga cor de status
isolada, cor de texto, nem rampa sequencial ou divergente, que têm critérios
próprios e entram quando os gráficos existirem.

O teste de pares tem duas formas: apenas pares adjacentes, para barras, linhas e
pilhas, onde só vizinhos se tocam; e todos os pares, para dispersão, bolha, mapa
e pequenos múltiplos, onde qualquer marca pode encostar em qualquer outra. A
segunda é estritamente mais dura e limita quantas séries essas formas comportam.

## Registro corrente

Paleta de três séries, medida em ΔEok ×100.

| Tema | Superfície | Visão normal | Protanopia | Deuteranopia | Menor contraste |
| --- | --- | --- | --- | --- | --- |
| claro | `#ffffff` | 25,4 | 20,3 | 19,9 | 3,13:1 |
| escuro | `#18181d` | 20,8 | 14,2 | 24,3 | 3,15:1 |

Todos acima dos limiares. Pior par: 19,9 no claro, sob deuteranopia; 14,2 no
escuro, sob protanopia.

## Limitações conhecidas

- **Tritanopia não é medida.** As checagens se ancoram em protanopia e
  deuteranopia, as prevalentes. A separação sob tritanopia no tema claro é baixa
  nos valores atuais. Fica registrado, não corrigido.
- **Margem de contraste estreita.** 3,13:1 e 3,15:1 contra um piso de 3:1.
  Qualquer alteração nas superfícies derruba um dos dois, e a checagem acusa.
- **Duas implementações do mesmo método divergem.** Medições feitas com
  implementações diferentes do modelo divergiram em cerca de dois pontos na
  escala ×100. É a razão de o modelo e a escala estarem fixados aqui.

## Perguntas para revisão

1. Está correto registrar que os limiares não vêm dos trabalhos citados, e assumi-los como decisão do projeto?
2. Os seis limiares estão nos valores certos para um produto que exibe dado verificável?
3. Está correto medir apenas protanopia e deuteranopia, registrando tritanopia como limitação?
4. Está correto aceitar margens de contraste de 3,13:1 e 3,15:1, sabendo que qualquer ajuste de superfície as derruba?
5. O critério deve mesmo excluir cor de status, cor de texto e rampas sequenciais?

Se todas forem `sim`, registre `ACCEPTED`.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | |
| Data da revisão | |
| Resultado | |
