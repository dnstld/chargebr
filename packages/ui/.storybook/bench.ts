import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import type { Preview } from "@storybook/react-vite";
import { afterEach, expect } from "vitest";
import previewAnnotations from "./preview";
import { THEME_LABEL, type Theme } from "./theme";

// Cada projeto do Vitest é um tema. A história é a mesma; o que muda é o valor
// inicial do global `theme`, que o decorador de preview.tsx aplica na raiz do
// documento antes de renderizar. A chamada a setProjectAnnotations fica nos
// arquivos vitest.setup.*.ts, dentro deste diretório, porque é assim que o
// complemento de Vitest reconhece que as anotações são declaradas à mão e não
// as provisiona por cima.
export function benchAnnotations(theme: Theme): Preview[] {
  return [
    a11yAddonAnnotations,
    previewAnnotations,
    {
      initialGlobals: { theme },
      beforeEach: async (context) => {
        // Contraste depende de fonte e cor resolvidas no momento da medição.
        await document.fonts.ready;

        // Exceção declarada: a história rebaixou o modo de reprovação. A
        // verificação passa, mas a exceção fica visível na saída.
        const mode = context.parameters.a11y?.test;
        if (mode !== "error") {
          console.warn(
            `[a11y] exceção declarada: ${context.title} › ${context.name} ` +
              `(modo "${mode}", tema ${THEME_LABEL[theme]})`,
          );
        }
      },
    },
  ];
}

// O projeto confere que a história rodou de fato no tema que o nomeia: sem
// isto, um erro de configuração faria os dois projetos medirem o mesmo tema.
export function guardTheme(theme: Theme): void {
  afterEach(() => {
    expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
  });
}
