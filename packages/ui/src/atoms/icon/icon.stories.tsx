import { Check, Menu, X } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Icon } from "./icon";
import styles from "./icon.stories.module.css";

const meta = {
  title: "Átomos/Ícone",
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

// O ícone é sempre decoração ao lado de um rótulo — o gatilho do hambúrguer,
// por exemplo, tem o nome acessível vindo de quem compõe (Button), nunca do
// próprio ícone.
export const Padrao: Story = {
  name: "Padrão",
  args: { as: Menu },
};

// O SVG que aparece é o do componente recebido, não um nome de conjunto
// escolhido por string: trocar o componente troca o desenho, não um rótulo.
export const RecebePorPropriedade: Story = {
  name: "Recebe o componente por propriedade",
  args: { as: Check },
  render: () => (
    <div className={styles.row}>
      <Icon as={Check} />
      <Icon as={X} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const check = canvasElement.querySelector("svg.lucide-check");
    const x = canvasElement.querySelector("svg.lucide-x");
    if (check === null || x === null) {
      throw new Error("um dos dois ícones não renderizou");
    }
    await expect(check.querySelector("path")?.getAttribute("d")).not.toBe(
      x.querySelector("path")?.getAttribute("d"),
    );
  },
};

// A cor do traço nunca é declarada pelo ícone — ela segue o `color`
// computado do elemento ao redor, herdada por `currentColor`, o padrão do
// próprio lucide-react.
export const CorSegueOTexto: Story = {
  name: "Cor segue o texto ao redor",
  args: { as: Check },
  render: () => (
    <span className={styles.tinted}>
      <Icon as={Check} />
    </span>
  ),
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector(`.${styles.tinted}`);
    const icon = canvasElement.querySelector("svg.lucide-check");
    if (wrapper === null || icon === null) {
      throw new Error("ícone ou elemento ao redor não renderizado");
    }
    await expect(getComputedStyle(icon).stroke).toBe(
      getComputedStyle(wrapper).color,
    );
  },
};
