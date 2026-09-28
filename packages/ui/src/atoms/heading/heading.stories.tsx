import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { Heading } from "./heading";

const meta = {
  title: "Átomos/Título",
  component: Heading,
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

// O maior nível: título de página, um só por tela. Localizado pela tag
// nativa (h1), não pelo número do nível — o nível escolhe a tag mais rasa
// para o maior tamanho (heading.tsx, TAG_BY_LEVEL), então os dois números
// não coincidem, e a prova localiza pelo que o navegador de fato desenhou.
export const Nivel7: Story = {
  name: "Nível 7",
  tags: ["state:level:7"],
  args: { level: 7, children: "Frota elétrica no Brasil" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h1");
    if (heading === null) throw new Error("tag h1 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-7"][theme],
    );
  },
};

export const Nivel6: Story = {
  name: "Nível 6",
  tags: ["state:level:6"],
  args: { level: 6, children: "Frota elétrica no Brasil" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h2");
    if (heading === null) throw new Error("tag h2 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-6"][theme],
    );
  },
};

// O tamanho de título de seção mais comum — o mesmo grau de
// `text.heading.size`.
export const Nivel5: Story = {
  name: "Nível 5",
  tags: ["state:level:5"],
  args: { level: 5, children: "Frota elétrica no Brasil" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h3");
    if (heading === null) throw new Error("tag h3 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-5"][theme],
    );
  },
};

export const Nivel4: Story = {
  name: "Nível 4",
  tags: ["state:level:4"],
  args: { level: 4, children: "Frota elétrica no Brasil" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h4");
    if (heading === null) throw new Error("tag h4 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-4"][theme],
    );
  },
};

// Padrão de subtítulo: duas chamadas de Heading, a segunda com nível
// menor — este nível é o que a segunda chamada usaria ao lado de um
// Nível 5 ou 6 (design.md, D3). "Subtítulo" não é prop: é este padrão de
// uso.
export const Nivel3: Story = {
  name: "Nível 3",
  tags: ["state:level:3"],
  args: { level: 3, children: "Boletim ABVE, janeiro de 2025" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h5");
    if (heading === null) throw new Error("tag h5 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-3"][theme],
    );
  },
};

// Níveis 1 e 2 compartilham a tag mais funda (h6, heading.tsx): o que os
// distingue é só o tamanho, provado direto contra o token de cada um.
export const Nivel2: Story = {
  name: "Nível 2",
  tags: ["state:level:2"],
  args: { level: 2, children: "Boletim ABVE, janeiro de 2025" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h6");
    if (heading === null) throw new Error("tag h6 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-2"][theme],
    );
  },
};

export const Nivel1: Story = {
  name: "Nível 1",
  tags: ["state:level:1"],
  args: { level: 1, children: "Boletim ABVE, janeiro de 2025" },
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const heading = canvasElement.querySelector("h6");
    if (heading === null) throw new Error("tag h6 não renderizada");
    await expect(getComputedStyle(heading).fontSize).toBe(
      tokens["font-size-1"][theme],
    );
  },
};
