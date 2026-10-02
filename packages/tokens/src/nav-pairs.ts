// Os pares do conjunto que não varia por tema — a moldura de navegação —, e o
// papel de cada token dele. Mora em arquivo próprio porque duas checagens leem
// a mesma declaração: `nav-contrast.test.ts` mede os pares, e o guardião
// `tools/checks/nav-pair-adjacency.test.ts` confere que cada fundo declarado é
// mesmo pintado como fundo em algum componente.
//
// **Par declarado é adjacência que existe na tela.** A primeira versão desta
// lista declarava `color.nav.edge` como superfície, e ele nunca foi fundo de
// nada: os cinco usos dele são borda. Os números saíam certos porque `edge` e
// `hover` são o mesmo cinza — a matriz ficava numericamente certa e
// estruturalmente errada, e o par que de fato limita a moldura
// (`glyph × hover`) não estava declarado. Desacoplar os dois tons amanhã teria
// deixado a checagem verde medindo a borda enquanto a adjacência real deixava
// de ser medida.

/** Fundo de um par: token que algum componente pinta como `background`. */
export const NAV_SURFACES = [
  "color-nav-rail",
  "color-nav-panel",
  "color-nav-hover",
  "color-nav-current",
] as const;

/**
 * Primeiro plano de texto, ao piso de 4,5:1, com os fundos sobre os quais ele
 * de fato aparece.
 */
export const NAV_TEXT_PAIRS: readonly (readonly [string, readonly string[]])[] =
  [
    // Rótulo da folha, rótulo do painel e corpo da árvore, sobre o painel; e a
    // contagem (`nav-leaf.meta`, que não tem variante de hover) sobre o fundo
    // de interação.
    ["color-nav-text", ["color-nav-panel", "color-nav-hover"]],
    // Texto do estado sobre o ponteiro, nos três controles; e o rótulo do
    // destino corrente da trilha, que fica forte sobre a própria trilha.
    ["color-nav-text-strong", ["color-nav-hover", "color-nav-rail"]],
    // Reserva: nenhum componente consome este tom hoje (ver a `$description`
    // dele em semantic/shared.json). Os fundos declarados são onde um texto
    // apagado cairia — painel e fundo de interação —, e é contra eles que o
    // piso precisa valer antes de alguém adotá-lo.
    ["color-nav-text-muted", ["color-nav-panel", "color-nav-hover"]],
    // Rótulo e contagem da entrada corrente, sobre a pílula.
    ["color-nav-current-text", ["color-nav-current"]],
  ];

/**
 * Primeiro plano de objeto gráfico, ao piso de 3:1, com os fundos sobre os
 * quais ele de fato aparece.
 */
export const NAV_GRAPHIC_PAIRS: readonly (readonly [
  string,
  readonly string[],
])[] = [
  // Chevron da pasta, marcador da folha e ícone da trilha. Nenhum dos três tem
  // variante de hover, e os três controles trocam o fundo nesse estado: o
  // par `glyph × hover` é o mais apertado da moldura, com 0,045 de margem.
  ["color-nav-glyph", ["color-nav-panel", "color-nav-rail", "color-nav-hover"]],
  // Barra de acento da trilha (sobre a trilha), marcador da folha corrente
  // (sobre a pílula) e anel de foco (sobre o painel).
  [
    "color-nav-accent",
    ["color-nav-rail", "color-nav-current", "color-nav-panel"],
  ],
];

/**
 * Token do conjunto que não entra em par porque não é primeiro plano nem
 * fundo. A isenção é declarada com o motivo, nunca obtida por acidente de
 * tipagem: um token sem par e sem isenção reprova a cobertura.
 */
export const NAV_EXEMPT: Readonly<Record<string, string>> = {
  "color-nav-edge":
    "divisor decorativo — WCAG 1.4.11 exige 3:1 de conteúdo não textual só quando ele é necessário para entender o conteúdo, e a hierarquia da árvore, do painel e da trilha é legível sem as linhas. Medido: 1,242:1 contra o painel e 1,333:1 contra a trilha. É borda em todos os cinco usos, nunca fundo, e por isso também não é superfície de par nenhum.",
};
