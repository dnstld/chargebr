import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const APP_ROOT = fileURLToPath(new URL("../", import.meta.url));
const BUILD_DIR = fileURLToPath(new URL("../.next", import.meta.url));
const NEXT_BIN = fileURLToPath(
  new URL("../node_modules/.bin/next", import.meta.url),
);

// A construção roda uma vez por execução da verificação, e o diretório de
// artefatos anterior é removido antes: reaproveitar o que já estava na árvore
// faria um documento velho — que ainda satisfaz as afirmações — provar sobre
// uma árvore que não é a corrente.
export default function setup(): void {
  rmSync(BUILD_DIR, { recursive: true, force: true });
  execFileSync(NEXT_BIN, ["build"], { cwd: APP_ROOT, stdio: "inherit" });
}
