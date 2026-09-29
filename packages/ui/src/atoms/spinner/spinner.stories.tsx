import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Spinner } from "./spinner";

const meta = {
  title: "Átomos/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// Identificável como indicador de progresso pelo papel `status`, sem exigir
// nome acessível próprio — `getByRole("status")` acha o elemento sem passar
// `name`, e a checagem de acessibilidade da bancada não reprova a ausência.
export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas }) => {
    const spinner = canvas.getByRole("status");
    await expect(spinner).toBeVisible();
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
  play: async ({ canvas }) => {
    const spinner = canvas.getByRole("status");
    await expect(getComputedStyle(spinner).animationName).not.toBe("none");
  },
};
