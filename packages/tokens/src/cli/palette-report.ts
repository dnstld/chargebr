import { tokens } from "../../generated/tokens.js";
import {
  checkPalette,
  DISTANCE_SCALE,
  paletteFailures,
  paletteInput,
  SIMULATION,
  THRESHOLDS,
} from "../palette.js";
import { THEMES } from "../source.js";

// Entrada de `pnpm --filter @chargebr/tokens palette:report`: executa as seis
// checagens sobre a paleta corrente e registra, por tema, o resultado de cada
// uma e o pior par com sua distância.
console.log(
  `Simulação: ${SIMULATION.model} via ${SIMULATION.library}, severidade ${SIMULATION.severity}`,
);
console.log(
  `Distâncias em ΔEok ×${DISTANCE_SCALE} (euclidiana em OKLab, multiplicada por ${DISTANCE_SCALE})`,
);
console.log(`Limiares: ${JSON.stringify(THRESHOLDS)}`);

let failed = false;
for (const theme of THEMES) {
  const input = paletteInput(theme, tokens);
  const report = checkPalette(input);
  console.log(
    `\n[${theme}] superfície ${input.surface ?? "(ausente)"}; séries ${input.series.map((s) => `${s.name}=${s.value}`).join(", ")}`,
  );
  for (const result of report.results) {
    const status = result.failures.length === 0 ? "passa" : "reprova";
    const worst = result.worst
      ? ` — pior par ${result.worst.pair.join(" × ")} = ${result.worst.distance.toFixed(1)}${result.detail ? ` (${result.detail})` : ""}`
      : result.detail
        ? ` — ${result.detail}`
        : "";
    console.log(`  ${status}: ${result.check}${worst}`);
  }
  if (report.worstPair) {
    console.log(
      `  pior par do tema: ${report.worstPair.pair.join(" × ")} = ${report.worstPair.distance.toFixed(1)} (${report.worstPair.check}, ΔEok ×${DISTANCE_SCALE})`,
    );
  }
  for (const failure of paletteFailures(report)) console.log(`  ✗ ${failure}`);
  failed ||= !report.passed;
}
process.exit(failed ? 1 : 0);
