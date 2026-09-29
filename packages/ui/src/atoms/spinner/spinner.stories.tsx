import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Spinner } from "./spinner";

const meta = {
  title: "Átomos/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// Decorativo para tecnologia assistiva — `aria-hidden`, sem papel próprio
// (design.md, D8: `Button.isPending` já anuncia a pendência por conta
// própria; uma região viva sem texto não anunciaria nada). `data-spinner` é
// o gancho de consulta, já que o elemento não aparece na árvore de
// acessibilidade para `getByRole` encontrar.
export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector("[data-spinner]");
    await expect(spinner).not.toBeNull();
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
  },
};

// Sem `prefers-reduced-motion` declarado — o padrão do Chromium headless
// desta bancada —, a rotação contínua está presente.
//
// O caso "com a preferência" fica sem história: emulá-la exigiria o
// navegador real (Playwright `page.emulateMedia`), e a ponte que o Vitest
// expõe para isso a partir de uma história, `@vitest/browser/context`
// (`commands`), lança em runtime sob a combinação de versões que este
// repositório fixa hoje — ponto 15 de `docs/pontos-abertos.md`, com o
// gatilho que reabre esta história.
export const SemMovimentoReduzido: Story = {
  name: "Sem movimento reduzido",
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector("[data-spinner]");
    await expect(spinner).not.toBeNull();
    if (spinner === null) return;
    await expect(getComputedStyle(spinner).animationName).not.toBe("none");
  },
};
