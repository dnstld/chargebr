import { expect } from "storybook/test";
import { accessibleNameFromContent } from "../../bench/accessible-name";
import type { ChartSeries } from "./series";
import { hasValue } from "./series";

// As provas de garantia de desenho, executadas em história e portanto nos
// dois temas. Ficam aqui, e não em cada arquivo de história, porque a
// garantia é a mesma em toda forma: o que muda é o desenho, não o que ele não
// pode afirmar.

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
// séries, é o de objeto gráfico e não o de texto: nome do gráfico, legenda e
// representação em texto ficam na superfície da página. Esta afirmação é o
// que impede que essa premissa decaia sem ser notada.
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

// Referência do que "sem fundo próprio" significa no motor atual: o valor
// computado de um elemento com `background-color: transparent`, obtido em
// tempo de execução, e não uma string escrita à mão — a comparação não pode
// depender de como o motor formata a cor.
function noBackgroundColor(): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = "transparent";
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

// A superfície de gráfico é identificada pela cor computada que ela pinta, e
// não pelo atributo que a marca hoje: se a forma de marcar a superfície
// mudar sem nenhum elemento se mover, esta afirmação não pode reprovar por
// isso.
function chartSurfaceColor(chart: HTMLElement): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = "var(--color-chart-surface)";
  chart.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

// De que superfície um elemento está pintado: sobe os ancestrais sem sair do
// gráfico até achar o primeiro fundo próprio. A busca nunca sai de `chart` —
// é esse limite, e não o valor da cor, que distingue "pintado pela página" de
// "pintado pelo gráfico" mesmo quando os dois coincidem (hoje, no tema claro,
// `color.chart.surface` e `color.surface.base` resolvem para o mesmo valor).
function paintedColor(
  element: Element,
  boundary: Element,
  noBackground: string,
): string {
  let node: Element | null = element;
  while (node !== null) {
    const background = getComputedStyle(node).backgroundColor;
    if (background !== noBackground) return background;
    if (node === boundary) break;
    node = node.parentElement;
  }
  return noBackground;
}

// Nome do gráfico, legenda e representação em texto ficam na superfície da
// página: nenhum deles é pintado pela cor da superfície de gráfico. Roda em
// toda história de gráfico, e portanto nos dois temas; elemento ausente
// (legenda de uma série só) é ignorado, e não conta como violação.
export async function expectTextOutsideChartSurface(
  canvasElement: HTMLElement,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const noBackground = noBackgroundColor();
  const surface = chartSurfaceColor(chart);
  const parts: [string, Element | null][] = [
    ["nome do gráfico", chart.querySelector(":scope > figcaption")],
    ["legenda", chart.querySelector("[data-legend]")],
    ["representação em texto", chart.querySelector("[data-value-table]")],
  ];
  const violations = parts
    .filter((part): part is [string, Element] => part[1] !== null)
    .filter(
      ([, element]) => paintedColor(element, chart, noBackground) === surface,
    )
    .map(([label]) => label);
  await expect(
    violations,
    "elemento de texto pintado pela cor da superfície de gráfico",
  ).toEqual([]);
}

// Um ponto com `fill: "textured"` recebe hachura no preenchimento, e não cor
// sólida.
export async function expectTexturedFill(
  canvasElement: HTMLElement,
  series: string,
  category: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  const mark = markOf(chart, series, category);
  await expect(mark, `marca de ${series} em ${category}`).not.toBeNull();
  await expect(mark?.getAttribute("data-fill")).toBe("textured");
  await expect(mark?.getAttribute("fill")).toMatch(/^url\(#/);
}

// Numa forma que liga pontos, os vizinhos com valor de um ponto sem valor
// também não se ligam entre si: pular o ponto seria afirmar a continuidade
// que a interrupção existe para negar.
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

// Ponto sem valor: sem marca, sem segmento atravessando.
export async function expectNoMarkForMissingValue(
  canvasElement: HTMLElement,
  series: string,
  category: string,
): Promise<void> {
  const chart = chartOf(canvasElement);
  await expect(
    markOf(chart, series, category),
    `marca desenhada num ponto sem valor (${series}, ${category})`,
  ).toBeNull();
  await expect(
    segmentsTouching(chart, series, category),
    "segmento atravessando um ponto sem valor",
  ).toEqual([]);
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
  // distinguíveis só por cor. Achado da varredura de localizador por data-*
  // (design.md, D8): comparar só o valor de `data-symbol` não prova a forma
  // desenhada — o rótulo (`ChartLegend`) e o elemento SVG (`Swatch`) vêm de
  // duas chamadas independentes a `seriesSymbol(index)`, e uma pode divergir
  // da outra sem que a comparação de rótulos perceba (medido plantando a
  // divergência: as três amostras desenhando o mesmo círculo passavam com o
  // rótulo ainda dizendo "circle"/"square"/"triangle"). A prova é o elemento
  // que o SVG de fato desenhou, não o nome que a amostra carrega dele.
  const symbols = all(legend as Element, "[data-symbol]");
  await expect(symbols).toHaveLength(names.length);
  const shapes = symbols.map((swatch) => swatch.firstElementChild?.tagName);
  await expect(
    new Set(shapes).size,
    "formas desenhadas repetidas entre séries",
  ).toBe(names.length);
}

export async function expectNoLegend(
  canvasElement: HTMLElement,
): Promise<void> {
  const chart = chartOf(canvasElement);
  await expect(chart.querySelector("[data-legend]")).toBeNull();
}

// Representação equivalente em texto: todo valor alcançável sem a visão.
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
      } else {
        await expect(text, "ausência lida como zero").not.toMatch(/\b0\b/);
      }
    }
  }
}
