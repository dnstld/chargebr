import { spawnSync } from "node:child_process";
import { relative } from "node:path";

// Arquivo gerado não é conteúdo verificado. Os guardiões pulavam `.next` e
// `storybook-static` pelo nome, o que não alcança arquivo gerado fora deles —
// `apps/backoffice/next-env.d.ts` entrava na varredura dos dois. A fonte da
// verdade aqui é a mesma que as etapas de formatação e de lint passaram a usar:
// o que o versionamento ignora.
//
// `git check-ignore` sai com 0 quando algum caminho é ignorado e com 1 quando
// nenhum é. Qualquer outro código é o git sem responder — repositório ausente,
// caminho fora dele —, e aí a varredura reprova com a saída de erro, em vez de
// ler o silêncio como "nada ignorado" e varrer o que não devia.
export function notIgnoredByVersioning(root: string, files: string[]): string[] {
  if (files.length === 0) return files;
  const paths = files.map((file) => relative(root, file));
  const result = spawnSync("git", ["check-ignore", "--stdin"], {
    cwd: root,
    input: `${paths.join("\n")}\n`,
    encoding: "utf8",
  });
  if (result.error !== undefined) {
    throw new Error(`git check-ignore não executou: ${result.error.message}`);
  }
  if (result.status === 1) return files;
  if (result.status !== 0) {
    throw new Error(
      `git check-ignore saiu com ${result.status}: ${result.stderr.trim()}`,
    );
  }
  const ignored = new Set(
    result.stdout.split("\n").filter((line) => line.length > 0),
  );
  return files.filter((_, index) => !ignored.has(paths[index] ?? ""));
}
