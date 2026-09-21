// @vitest-environment happy-dom
/// <reference lib="dom" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Window as HappyDomWindow } from "happy-dom";
import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import { GENERATED_DIR } from "./source.js";

// Tarefa 3.3 — alternar o tema muda os valores computados sem nova geração.
// O documento carrega o tokens.css gerado uma vez; o que muda entre as leituras
// é só o atributo no elemento raiz.

function computed(name: string): string {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function loadStylesheet(): void {
  const style = document.createElement("style");
  style.textContent = readFileSync(join(GENERATED_DIR, "tokens.css"), "utf8");
  document.head.appendChild(style);
}

test("alternar data-theme troca os valores resolvidos das custom properties", () => {
  loadStylesheet();
  const root = document.documentElement;

  const themed = [
    "--color-surface-base",
    "--color-text-primary",
    "--color-chart-series-1",
  ] as const;
  const unthemed = ["--space-inset-md", "--font-family-sans"] as const;

  root.removeAttribute("data-theme");
  const before = Object.fromEntries(
    [...themed, ...unthemed].map((n) => [n, computed(n)]),
  );

  root.setAttribute("data-theme", "dark");
  const after = Object.fromEntries(
    [...themed, ...unthemed].map((n) => [n, computed(n)]),
  );

  for (const name of themed) {
    expect(before[name], `${name} antes`).toBe(
      tokens[name.slice(2) as keyof typeof tokens].light,
    );
    expect(after[name], `${name} depois`).toBe(
      tokens[name.slice(2) as keyof typeof tokens].dark,
    );
    expect(before[name]).not.toBe(after[name]);
  }
  for (const name of unthemed) {
    expect(before[name]).toBe(after[name]);
  }

  root.setAttribute("data-theme", "light");
  expect(computed("--color-surface-base")).toBe(
    tokens["color-surface-base"].light,
  );
});

// Tarefa 3.1 — a preferência do sistema é o padrão e o atributo no documento
// é o override, nos dois sentidos.
test("a preferência do sistema vale sem atributo e o atributo prevalece sobre ela", () => {
  loadStylesheet();
  const root = document.documentElement;
  const settings = (window as unknown as HappyDomWindow).happyDOM.settings
    .device;

  settings.prefersColorScheme = "dark";
  root.removeAttribute("data-theme");
  expect(computed("--color-surface-base")).toBe(
    tokens["color-surface-base"].dark,
  );

  root.setAttribute("data-theme", "light");
  expect(computed("--color-surface-base")).toBe(
    tokens["color-surface-base"].light,
  );

  settings.prefersColorScheme = "light";
  root.removeAttribute("data-theme");
  expect(computed("--color-surface-base")).toBe(
    tokens["color-surface-base"].light,
  );

  root.setAttribute("data-theme", "dark");
  expect(computed("--color-surface-base")).toBe(
    tokens["color-surface-base"].dark,
  );
});
