import { tokens } from "../../generated/tokens.js";
import {
  CONTRAST_THRESHOLDS,
  type ContrastInput,
  checkContrast,
  contrastInput,
} from "../contrast.js";
import { loadSource, THEMES, type Theme } from "../source.js";

// Entrada de `pnpm --filter @chargebr/tokens contrast:report`: executa as
// checagens de contraste dos pares de ação sobre os tokens correntes e
// registra, por tema, a matriz medida, a razão em repouso, a razão em hover, o
// passo entre elas e a pior margem sobre o piso.
console.log(`Limiares: ${JSON.stringify(CONTRAST_THRESHOLDS)}`);

const source = loadSource();
const byTheme = Object.fromEntries(
  THEMES.map((theme) => [theme, contrastInput(theme, tokens, source)]),
) as Record<Theme, ContrastInput>;

const report = checkContrast(byTheme);

const show = (value: number | null): string =>
  value === null ? "(ausente)" : value.toFixed(3);

for (const theme of THEMES) {
  const measurement = report.byTheme[theme];
  console.log(`\n[${theme}]`);
  for (const pair of measurement.pairs) {
    console.log(
      `  ${pair.pair.join(" × ")} = ${pair.ratio.toFixed(3)}:1 (piso ${pair.floor}:1, margem ${pair.margin.toFixed(3)})`,
    );
  }
  console.log(
    `  repouso ${show(measurement.rest)}:1, hover ${show(measurement.hover)}:1, passo ${show(measurement.step)}`,
  );
  const worst = measurement.worst;
  console.log(
    worst === null
      ? "  pior margem: (nada medido)"
      : `  pior margem sobre o piso: ${worst.margin.toFixed(3)} em ${worst.pair.join(" × ")} (${worst.ratio.toFixed(3)}:1, piso ${worst.floor}:1)`,
  );
}

console.log("");
for (const note of report.notes) console.log(`  · ${note}`);
for (const violation of report.violations) console.log(`  ✗ ${violation}`);

process.exit(report.passed ? 0 : 1);
