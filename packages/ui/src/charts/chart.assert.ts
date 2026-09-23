import { expect } from "storybook/test";
import { accessibleNameFromContent } from "../bench/accessible-name";
import type { ChartSeries } from "./series";
import { hasValue } from "./series";

// As provas das restrições de domínio no desenho, executadas em história e
// portanto nos dois temas. Ficam aqui, e não em cada arquivo de história,
// porque a restrição é a mesma em toda forma: o que muda é o desenho, não o
// que ele não pode afirmar.

const LOCALE = "pt-BR";

export function chartOf(canvasElement: HTMLElement): HTMLElement {
  const chart = canvasElement.querySelector<HTMLElement>("[data-chart]");
  if (chart === null) throw new Error("gráfico não renderizado");
  return chart;
}

function all(root: Element, selector: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)];
}

function markOf(
  chart: HTMLElement,
  series: string,
  category: string,
): HTMLElement | null {
  return chart.querySelector<HTMLElement>(
    `[data-mark][data-series="${series}"][data-category="${category}"]`,
  );
}

function segmentsTouching(
  chart: HTMLElement,
  series: string,
  category: string,
): HTMLElement[] {
  return all(chart, `[data-segment][data-series="${series}"]`).filter(
    (segment) =>
      segment.getAttribute("data-from") === category ||
      segment.getAttribute("data-to") === category,
  );
}

// A superfície de gráfico hospeda apenas o desenho — marca, eixo e grade — e
// nenhum texto interativo. É por isso que o piso que vale contra ela, para as
// séries, é o de objeto gráfico e não o de texto: nome do gráfico, legenda,
// ausências declaradas e representação em texto ficam na superfície da página.
// Esta afirmação é o que impede que essa premissa decaia sem ser notada.
//
// O que é observável na árvore renderizada: elemento alcançável por foco e
// manipulador de ponteiro escrito como atributo. Um manipulador ligado por
// propriedade do React não aparece no DOM — ele é delegado na raiz —, e é por
// isso que o desenho fica fora da árvore de acessibilidade e sem nada
// focalizável: sem alvo de foco não há caminho de teclado até um manipulador.
const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "details",
  "iframe",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(", ");

const POINTER_ATTRIBUTES = [
  "onclick",
  "ondblclick",
  "onmousedown",
  "onmouseup",
  "onmouseenter",
  "onmouseleave",
  "onmouseover",
  "onmouseout",
  "onpointerdown",
  "onpointerup",
  "onpointerenter",
  "onpointerleave",
  "onpointerover",
  "onpointerout",
  "ontouchstart",
  "ontouchend",
] as const;

function describeElement(element: Element): string {
  const attributes = [...element.attributes]
    .map((attribute) =>
      attribute.value.length > 24
        ? `${attribute.name}="…"`
        : `${attribute.name}="${attribute.value}"`,
    )
    .join(" ");
  const tag = element.tagName.toLowerCase();
  return attributes.length > 0 ? `<${tag} ${attributes}>` : `<${tag}>`;
}

function withSelf(root: Element): Element[] {
  return [root, ...root.querySelectorAll("*")];
}

async function expectNoInteractiveWithin(
  root: Element,
  where: string,
): Promise<void> {
  await expect(
    withSelf(root)
      .filter((element) => element.matches(FOCUSABLE))
      .map(describeElement),
    `elemento alcançável por foco em ${where}`,
  ).toEqual([]);

  await expect(
    withSelf(root)
      .filter((element) =>
        POINTER_ATTRIBUTES.some((attribute) => element.hasAttribute(attribute)),
      )
      .map(describeElement),
    `manipulador de ponteiro em ${where}`,
  ).toEqual([]);
}

// Dentro de `[data-plot]` não há elemento alcançável por foco nem manipulador
// de ponteiro. Roda em toda história de gráfico, e portanto nos dois temas.
export async function expectNoInteractiveInPlot(
  canvasElement: HTMLElement,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const plots = [...chart.querySelectorAll("[data-plot]")];
  for (const plot of plots) {
    await expectNoInteractiveWithin(plot, "[data-plot]");
  }
}

// Projeção bloqueada substitui o gráfico. Nem eixo, nem grade, nem rótulo de
// escala, nem tabela de valores: eixo vazio comunica intervalo e ordem de
// grandeza, e isso é informação sobre um dado que a metodologia mandou não
// exibir.
export async function expectBlockedReplacesChart(
  canvasElement: HTMLElement,
  reasons: readonly string[],
): Promise<void> {
  const chart = chartOf(canvasElement);
  await expect(chart.hasAttribute("data-blocked")).toBe(true);

  for (const absent of [
    "[data-plot]",
    "[data-axis]",
    "[data-grid]",
    "[data-scale-label]",
    "[data-value-table]",
    "[data-legend]",
    "[data-mark]",
  ]) {
    await expect(all(chart, absent), `${absent} num gráfico bloqueado`).toEqual(
      [],
    );
  }

  const blocked = chart.querySelector('[data-primitive="blocked-projection"]');
  await expect(blocked).not.toBeNull();

  // A proibição de interativo vale também no caminho em que o desenho é
  // substituído: sem superfície de gráfico, e com a primitiva que ocupou o
  // lugar dela igualmente sem foco nem ponteiro.
  await expectNoInteractiveInPlot(canvasElement);
  if (blocked !== null)
    await expectNoInteractiveWithin(blocked, "projeção bloqueada");
  for (const reason of reasons) {
    await expect(
      chart.querySelector(`[data-reason="${reason}"]`),
      `razão ${reason}`,
    ).not.toBeNull();
  }

  // Nada que se leia como valor: nem número exibido, nem número parcial.
  await expect(accessibleNameFromContent(chart)).not.toMatch(/\d/);
}

// Não resolvido nunca é ligado a resolvido, e sua marca sai hachurada.
export async function expectUnresolvedHatchedAndDetached(
  canvasElement: HTMLElement,
  series: string,
  category: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const mark = markOf(chart, series, category);
  await expect(mark, `marca de ${series} em ${category}`).not.toBeNull();
  await expect(mark?.getAttribute("data-kind")).toBe("unresolved");

  // Preenchimento por padrão de hachura, e não por cor sólida.
  await expect(mark?.getAttribute("fill")).toMatch(/^url\(#/);

  await expect(
    segmentsTouching(chart, series, category).map((segment) => [
      segment.getAttribute("data-from"),
      segment.getAttribute("data-to"),
    ]),
    "segmentos ligando um ponto não resolvido",
  ).toEqual([]);
}

// Numa forma que liga pontos, os vizinhos resolvidos de um ponto não resolvido
// também não se ligam entre si: pular o ponto seria afirmar a continuidade que
// a interrupção existe para negar.
export async function expectNoSegmentAcross(
  canvasElement: HTMLElement,
  series: string,
  before: string,
  after: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const across = all(chart, `[data-segment][data-series="${series}"]`).filter(
    (segment) =>
      segment.getAttribute("data-from") === before &&
      segment.getAttribute("data-to") === after,
  );
  await expect(across, `segmento saltando de ${before} para ${after}`).toEqual(
    [],
  );
}

// Ausência nunca é zero: sem marca, sem segmento atravessando, e dita.
export async function expectMissingDeclared(
  canvasElement: HTMLElement,
  series: string,
  category: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  await expect(
    markOf(chart, series, category),
    `marca desenhada num ponto ausente (${series}, ${category})`,
  ).toBeNull();
  await expect(
    segmentsTouching(chart, series, category),
    "segmento atravessando um ponto ausente",
  ).toEqual([]);

  const declared = chart.querySelector<HTMLElement>(
    `[data-absences] [data-series="${series}"][data-category="${category}"]`,
  );
  await expect(declared, "ausência declarada").not.toBeNull();
  await expect(
    accessibleNameFromContent(declared as Element).length,
  ).toBeGreaterThan(0);
}

// Legenda a partir de duas séries, alcançável na leitura assistida, e com um
// canal que não é a cor.
export async function expectLegendNamesSeries(
  canvasElement: HTMLElement,
  names: readonly string[],
): Promise<void> {
  const chart = chartOf(canvasElement);
  const legend = chart.querySelector<HTMLElement>("[data-legend]");
  await expect(legend, "legenda").not.toBeNull();

  const readable = accessibleNameFromContent(legend as Element);
  for (const name of names) {
    await expect(
      readable,
      `nome da série ${name} na leitura assistida`,
    ).toContain(name);
  }

  // A amostra de cada série carrega uma forma própria: duas séries nunca são
  // distinguíveis só por cor.
  const symbols = all(legend as Element, "[data-symbol]").map((swatch) =>
    swatch.getAttribute("data-symbol"),
  );
  await expect(symbols).toHaveLength(names.length);
  await expect(new Set(symbols).size, "formas repetidas entre séries").toBe(
    names.length,
  );
}

export async function expectNoLegend(
  canvasElement: HTMLElement,
): Promise<void> {
  const chart = chartOf(canvasElement);
  await expect(chart.querySelector("[data-legend]")).toBeNull();
}

// Representação equivalente em texto: todo valor alcançável sem a visão, e o
// caminho até a evidência de cada um junto dele.
export async function expectTextEquivalent(
  canvasElement: HTMLElement,
  series: readonly ChartSeries[],
  format?: Intl.NumberFormatOptions,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const table = chart.querySelector<HTMLElement>("[data-value-table]");
  await expect(table, "representação em texto").not.toBeNull();

  for (const one of series) {
    for (const point of one.points) {
      const row = (table as Element).querySelector<HTMLElement>(
        `tr[data-series="${one.name}"][data-category="${point.category}"]`,
      );
      await expect(
        row,
        `linha de ${one.name} em ${point.category}`,
      ).not.toBeNull();
      const text = accessibleNameFromContent(row as Element);

      if (hasValue(point)) {
        await expect(
          text,
          `valor de ${one.name} em ${point.category}`,
        ).toContain(new Intl.NumberFormat(LOCALE, format).format(point.value));

        // O caminho até a evidência sai ao lado do valor, não numa nota de
        // rodapé: é a linha do valor que carrega a proveniência.
        const anchor = (row as Element).querySelector<HTMLAnchorElement>(
          `a[href="${point.evidence.href}"]`,
        );
        await expect(
          anchor,
          `caminho até a evidência de ${one.name}`,
        ).not.toBeNull();
        await expect(text).toContain(point.evidence.label);
      } else {
        await expect(row?.getAttribute("data-kind")).toBe("missing");
        await expect(text, "ausência lida como zero").not.toMatch(/\b0\b/);
      }
    }
  }
}

// Numa forma que empilha, a marca não resolvida fica fora da pilha: acima do
// topo dos resolvidos e separada por um vão. A altura de uma pilha é lida como
// soma, e somar um não resolvido a resolvidos é a agregação que a restrição
// proíbe — aqui ela apareceria como um retângulo a mais na mesma coluna.
export async function expectUnresolvedOutsideStack(
  canvasElement: HTMLElement,
  category: string,
  unresolvedSeries: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const inCategory = all(chart, `[data-mark][data-category="${category}"]`);
  const edge = (mark: HTMLElement, attribute: string): number =>
    Number(mark.getAttribute(attribute) ?? Number.NaN);

  const resolved = inCategory.filter(
    (mark) => mark.getAttribute("data-kind") === "resolved",
  );
  const unresolved = inCategory.filter(
    (mark) =>
      mark.getAttribute("data-kind") === "unresolved" &&
      mark.getAttribute("data-series") === unresolvedSeries,
  );
  await expect(resolved.length, "resolvidos empilhados").toBeGreaterThan(0);
  await expect(unresolved).toHaveLength(1);

  // No SVG o eixo vertical cresce para baixo: o topo da pilha é o menor `y`, e
  // a base da marca não resolvida precisa estar acima dele.
  const stackTop = Math.min(...resolved.map((mark) => edge(mark, "y")));
  const bottom = unresolved.map(
    (mark) => edge(mark, "y") + edge(mark, "height"),
  );
  await expect(
    bottom[0] ?? Number.NaN,
    "marca não resolvida encostada na pilha",
  ).toBeLessThan(stackTop);
}
