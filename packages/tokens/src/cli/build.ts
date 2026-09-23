import { buildTokens } from "../build.js";
import { validateSource } from "../validate.js";

// Entrada de `pnpm --filter @chargebr/tokens build`: confere a fonte antes de
// gerar, para que uma fonte inválida nunca produza saída.
const problems = validateSource();
if (problems.length > 0) {
  console.error("Fonte de tokens inválida:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const output = await buildTokens();
for (const name of Object.keys(output.files))
  console.log(`gerado: generated/${name}`);
