import { createHash } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { buildTokens, GENERATED_FILES, renderTokens } from "./build.js";
import { GENERATED_DIR, TOKENS_DIR } from "./source.js";

const temporary: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "chargebr-tokens-"));
  temporary.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of temporary.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

// Tarefa 1.2 — um valor alterado na fonte aparece nas duas saídas.
test("alterar um token na fonte altera a saída CSS e a saída TypeScript", async () => {
  const fixture = tempDir();
  cpSync(TOKENS_DIR, fixture, { recursive: true });

  const colorFile = join(fixture, "primitive", "color.json");
  const color = JSON.parse(readFileSync(colorFile, "utf8"));
  // #112233 = rgb(17, 34, 51)
  color.color.indigo["700"].$value = {
    colorSpace: "srgb",
    components: [17 / 255, 34 / 255, 51 / 255],
    hex: "#112233",
  };
  writeFileSync(colorFile, JSON.stringify(color));

  const { files } = await renderTokens(fixture);
  expect(files["tokens.css"]).toContain("--color-indigo-700: #112233;");
  expect(files["tokens.ts"]).toContain(
    '"color-indigo-700": {\n    css: "var(--color-indigo-700)",\n    light: "#112233",',
  );
  // A camada semântica que referencia o primitivo acompanha, resolvida.
  expect(files["tokens.ts"]).toContain(
    '"color-action-primary": {\n    css: "var(--color-action-primary)",\n    light: "#112233",',
  );
});

// Tarefa 1.3 — duas gerações consecutivas produzem arquivos idênticos.
test("duas gerações sobre a mesma fonte produzem arquivos com o mesmo hash", async () => {
  const first = tempDir();
  const second = tempDir();
  await buildTokens({ outDir: first });
  await buildTokens({ outDir: second });
  for (const name of GENERATED_FILES) {
    expect(sha256(readFileSync(join(first, name), "utf8")), name).toBe(
      sha256(readFileSync(join(second, name), "utf8")),
    );
  }
});

// Tarefa 1.4 — arquivo gerado editado à mão deixa de corresponder à fonte.
test("os arquivos em generated/ correspondem exatamente ao que a fonte gera", async () => {
  const { files } = await renderTokens();
  for (const name of GENERATED_FILES) {
    const committed = readFileSync(join(GENERATED_DIR, name), "utf8");
    expect(
      sha256(committed),
      `generated/${name} não corresponde à fonte; rode pnpm --filter @chargebr/tokens build`,
    ).toBe(sha256(files[name]));
  }
});
