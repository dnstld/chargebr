import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Text } from "./text";
import styles from "./text.stories.module.css";
import { useFormattedNumber } from "./use-formatted-number";

const meta = {
  title: "Átomos/Texto",
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

// Peso e destaque no padrão: o corpo de texto comum, sem variante aplicada.
export const Padrao: Story = {
  name: "Padrão",
  args: { children: "Frota eletrificada em janeiro de 2025" },
};

// Peso médio: usado quando um trecho precisa de destaque sem chegar ao
// peso mais forte.
export const PesoMedio: Story = {
  name: "Peso médio",
  args: {
    weight: "medium",
    children: "Frota eletrificada em janeiro de 2025",
  },
};

// Peso semibold: quem compõe usa este peso para o valor que deve pesar mais
// que os outros ao lado dele.
export const PesoSemibold: Story = {
  name: "Peso semibold",
  args: {
    weight: "semibold",
    children: "Frota eletrificada em janeiro de 2025",
  },
};

// Itálico: quem compõe usa este destaque para um valor que precisa se
// distinguir de outro sem depender só de cor.
export const Italico: Story = {
  name: "Itálico",
  args: {
    emphasis: "italic",
    children: "Frota que existiria sem o incentivo",
  },
};

// Redação original e redação normalizada, lado a lado, com o mesmo peso e o
// mesmo destaque: o átomo não introduz diferença entre as duas — hierarquia
// entre redação original e normalizada, se existir, é decisão de quem compõe.
export const RedacoesLadoALado: Story = {
  name: "Redações lado a lado",
  args: { children: "" },
  render: () => (
    <p>
      <Text>veículos elétricos leves (BEV + PHEV)</Text>{" "}
      <Text>Eletrificados leves</Text>
    </p>
  ),
  play: async ({ canvas }) => {
    const original = canvas.getByText("veículos elétricos leves (BEV + PHEV)");
    const normalized = canvas.getByText("Eletrificados leves");
    await expect(getComputedStyle(original).fontWeight).toBe(
      getComputedStyle(normalized).fontWeight,
    );
    await expect(getComputedStyle(original).fontSize).toBe(
      getComputedStyle(normalized).fontSize,
    );
  },
};

// Largura de cada dígito de um elemento, medida pelo navegador. Um dígito por
// intervalo, para que a medida seja do glifo e não da soma.
function digitWidths(element: HTMLElement): number[] {
  const widths: number[] = [];
  for (const node of element.childNodes) {
    if (!(node instanceof globalThis.Text)) continue;
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

function FormattedNumber({ value }: { value: number }) {
  return <Text tabular>{useFormattedNumber(value)}</Text>;
}

function StackedNumbers() {
  return (
    <div className={styles.column}>
      {STACKED.map((value) => (
        <FormattedNumber key={value} value={value} />
      ))}
    </div>
  );
}

// Números de quantidades diferentes de dígitos, empilhados, na variante
// tabular: os algarismos tabulares fazem cada dígito ocupar a mesma largura,
// e a coluna alinha.
export const ColunaAlinhada: Story = {
  name: "Coluna alinhada",
  args: { children: "" },
  render: () => <StackedNumbers />,
  play: async ({ canvasElement }) => {
    const numbers = [
      ...canvasElement.querySelectorAll<HTMLElement>("[data-tabular]"),
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
