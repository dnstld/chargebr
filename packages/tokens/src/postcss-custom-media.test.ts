import { existsSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import postcss from "postcss";
import { expect, test } from "vitest";
import postcssConfig from "../../../postcss.config.mjs";

// Tarefa 3.3 — a configuração raiz resolve `@media (--screen-md)` a partir da
// declaração `@custom-media` de `tokens.media.css` (tarefa 3.2), sem que o
// arquivo que consome precise redeclarar nada — é essa a travessia entre
// arquivos que a medição de D6 (planta na mesma origem que consome) não
// cobria.
test("postcss.config.mjs da raiz resolve @media (--screen-md) para min-width: 768px", async () => {
  const input = "@media (--screen-md) {\n  .probe { color: red; }\n}\n";
  const result = await postcss(postcssConfig.plugins).process(input, {
    from: undefined,
  });
  expect(result.css.replace(/\s+/g, "")).toBe(
    "@media(min-width:768px){.probe{color:red;}}",
  );
});

const WORKSPACE_ROOT = fileURLToPath(new NodeURL("../../../", import.meta.url));

// A razão de D6 para a Opção B ser "sem buraco": uma configuração só, na
// raiz, para as duas bancadas. Um `postcss.config` próprio em qualquer um
// dos dois pacotes reabriria a sincronização que a decisão recusou.
test("apps/backoffice e packages/ui não têm postcss.config próprio", () => {
  for (const candidate of [
    "apps/backoffice/postcss.config.mjs",
    "apps/backoffice/postcss.config.js",
    "apps/backoffice/postcss.config.cjs",
    "packages/ui/postcss.config.mjs",
    "packages/ui/postcss.config.js",
    "packages/ui/postcss.config.cjs",
  ]) {
    expect(existsSync(`${WORKSPACE_ROOT}${candidate}`), candidate).toBe(false);
  }
});
