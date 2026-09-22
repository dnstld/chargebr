import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { expectRolesDistinctWithoutColor } from "../value-role.assert";
import { NumericValue } from "./numeric-value";
import styles from "./numeric-value.stories.module.css";

const meta = {
  title: "Átomos/Número",
  component: NumericValue,
} satisfies Meta<typeof NumericValue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  name: "Principal",
  tags: ["state:primary"],
  args: { value: 12345, valueRole: "primary" },
};

export const Contrafactual: Story = {
  name: "Contrafactual",
  tags: ["state:counterfactual"],
  args: { value: 9870, valueRole: "counterfactual" },
};

export const Contexto: Story = {
  name: "Contexto",
  tags: ["state:context"],
  args: { value: 2025, valueRole: "context", format: { useGrouping: false } },
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
  tags: ["state:primary"],
  args: { value: 0, valueRole: "primary" },
  render: () => (
    <div className={styles.column}>
      {STACKED.map((value) => (
        <NumericValue key={value} value={value} valueRole="primary" />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const numbers = [
      ...canvasElement.querySelectorAll<HTMLElement>("[data-value-role]"),
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

export const PapeisDistintos: Story = {
  name: "Papéis distintos sem cor",
  tags: ["state:primary", "state:counterfactual", "state:context"],
  args: { value: 0, valueRole: "primary" },
  render: () => (
    <p>
      <NumericValue value={12345} valueRole="primary" />{" "}
      <NumericValue value={9870} valueRole="counterfactual" />{" "}
      <NumericValue
        value={2025}
        valueRole="context"
        format={{ useGrouping: false }}
      />
    </p>
  ),
  play: async ({ canvas }) => {
    await expectRolesDistinctWithoutColor({
      primary: canvas.getByText("12.345"),
      counterfactual: canvas.getByText("9.870"),
      context: canvas.getByText("2025"),
    });
  },
};
