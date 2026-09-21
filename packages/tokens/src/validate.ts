import { validateDtcg } from "./dtcg.js";
import {
  checkFontFamily,
  checkLiterals,
  checkReferences,
  checkThemeCompleteness,
} from "./rules.js";
import { listSourceFiles, loadSource, readJson, TOKENS_DIR } from "./source.js";

// Todas as conferências sobre a fonte, na ordem em que uma depende da anterior:
// formato, depois regras entre camadas e entre temas.
export function validateSource(dir: string = TOKENS_DIR): string[] {
  const problems: string[] = [];
  for (const file of listSourceFiles(dir)) {
    problems.push(...validateDtcg(readJson(file.path), file.file));
  }
  if (problems.length > 0) return problems;

  const tokens = loadSource(dir);
  return [
    ...checkReferences(tokens),
    ...checkLiterals(tokens),
    ...checkThemeCompleteness(tokens),
    ...checkFontFamily(tokens),
  ];
}
