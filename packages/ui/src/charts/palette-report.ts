import { tokens } from "@chargebr/tokens";
import {
  checkPalette,
  DISTANCE_SCALE,
  paletteFailures,
  paletteInput,
  SIMULATION,
  THEMES,
} from "@chargebr/tokens/palette";
import { CHART_SHAPE_IDS, shapeDefinition } from "./shapes";

// Entrada de `pnpm --filter @chargebr/ui charts:palette-report`: o registro da
// checagem de paleta por forma e por tema. Para cada forma, diz qual lista de
// pares ela declara, quais pares foram comparados e o resultado de cada
// checagem. É o registro que a verificação por forma exige — a execução
// propriamente dita reprova em palette.test.ts.
console.log(
  `Simulação: ${SIMULATION.model} via ${SIMULATION.library}, severidade ${SIMULATION.severity}`,
);
console.log(`Distâncias em ΔEok ×${DISTANCE_SCALE}`);

let failed = false;
for (const shape of CHART_SHAPE_IDS) {
  const scope = shapeDefinition(shape).pairScope;
  console.log(`\n# forma ${shape} — lista de pares: ${scope}`);
  for (const theme of THEMES) {
    const report = checkPalette(paletteInput(theme, tokens, scope));
    console.log(`  [${theme}] ${report.passed ? "passa" : "reprova"}`);
    for (const result of report.results) {
      const compared =
        result.pairs === undefined
          ? ""
          : ` — pares ${result.pairs.map((pair) => pair.join(" × ")).join("; ")}`;
      const worst = result.worst
        ? ` — pior ${result.worst.pair.join(" × ")} = ${result.worst.distance.toFixed(1)}`
        : "";
      console.log(
        `    ${result.failures.length === 0 ? "passa" : "reprova"}: ${result.check}${compared}${worst}`,
      );
    }
    for (const failure of paletteFailures(report)) {
      console.log(`    ✗ ${failure}`);
    }
    failed ||= !report.passed;
  }
}
process.exit(failed ? 1 : 0);
