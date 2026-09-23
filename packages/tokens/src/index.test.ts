import { expect, test } from "vitest";
import { cssVar, tokens } from "./index.js";

// Tarefa 6.1 — acesso tipado: nome inexistente falha na checagem de tipos.
test("cssVar devolve a custom property de um token existente", () => {
  expect(cssVar("color-surface-base")).toBe("var(--color-surface-base)");
  expect(tokens["color-surface-base"].css).toBe("var(--color-surface-base)");
});

test("nome de token inexistente é erro de tipo, não de execução", () => {
  // @ts-expect-error nome de token inexistente precisa reprovar em verify:types
  const missing: unknown = tokens["color-surface-nope"];
  expect(missing).toBeUndefined();
});
