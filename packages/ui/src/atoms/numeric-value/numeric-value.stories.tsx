import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { NumericValue } from "./numeric-value";
import styles from "./numeric-value.stories.module.css";

const meta = {
  title: "Átomos/Número",
  component: NumericValue,
} satisfies Meta<typeof NumericValue>;

export default meta;

type Story = StoryObj<typeof meta>;

// Peso e destaque no padrão: o número comum, sem variante aplicada.
export const Padrao: Story = {
  name: "Padrão",
  args: { value: 12345 },
};

export const PesoMedio: Story = {
  name: "Peso médio",
  args: { value: 12345, weight: "medium" },
};

export const PesoSemibold: Story = {
  name: "Peso semibold",
  args: { value: 12345, weight: "semibold" },
};

export const Italico: Story = {
  name: "Itálico",
  args: { value: 9870, emphasis: "italic" },
};

// Largura de cada dígito de um elemento, medida pelo navegador. Um dígito por
// intervalo, para que a medida seja do glifo e não da soma.
function digitWidths(element: HTMLElement): number[] {
  const widths: number[] = [];
  for (const node of element.childNodes) {
    if (!(node instanceof Text)) continue;
    for (let index = 0; index < node.length; index += 1) {
      if (!/\d/.test(node.data.charAt(index))) continue;
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      widths.push(range.getBoundingClientRect().width);
    }
  }
  return widths;
}

const STACKED = [7, 1234, 98765.4];

// Números de quantidades diferentes de dígitos, empilhados: os algarismos
// tabulares fazem cada dígito ocupar a mesma largura, e a coluna alinha.
export const ColunaAlinhada: Story = {
  name: "Coluna alinhada",
  args: { value: 0 },
  render: () => (
    <div className={styles.column}>
      {STACKED.map((value) => (
        <NumericValue key={value} value={value} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const numbers = [
      ...canvasElement.querySelectorAll<HTMLElement>("[data-weight]"),
    ];
    await expect(numbers).toHaveLength(STACKED.length);

    // A prova é a medida: cada dígito, em qualquer dos números, tem a mesma
    // largura, e as bordas direitas coincidem.
    const widths = numbers.flatMap(digitWidths);
    const [reference = 0] = widths;
    for (const width of widths) {
      await expect(Math.abs(width - reference)).toBeLessThan(0.05);
    }

    const rightEdges = numbers.map(
      (number) => number.getBoundingClientRect().right,
    );
    const [edge = 0] = rightEdges;
    for (const right of rightEdges) {
      await expect(Math.abs(right - edge)).toBeLessThan(0.05);
    }

    // E a causa: o token de dado numérico está aplicado.
    for (const number of numbers) {
      await expect(getComputedStyle(number).fontVariantNumeric).toContain(
        "tabular-nums",
      );
    }
  },
};
