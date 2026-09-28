import { fileURLToPath } from "node:url";
import postcssGlobalData from "@csstools/postcss-global-data";
import postcssCustomMedia from "postcss-custom-media";

// Caminho absoluto, resolvido a partir deste arquivo — não do cwd de quem
// constrói (`apps/backoffice` para o Next, `packages/ui` para o
// Storybook/Vite) — para que os dois leiam a mesma declaração sem
// `postcss.config` próprio (D6 de
// openspec/changes/interface-atomic-structure/design.md).
const screenTokens = fileURLToPath(
  new URL("./packages/tokens/generated/tokens.media.css", import.meta.url),
);

// `postcss-custom-media@12` não resolve mais `@custom-media` entre arquivos
// (removeu `importFrom`) — cada CSS Module é processado sozinho, sem ver a
// declaração de outro arquivo. `postcss-global-data`, antes dele na cadeia,
// injeta o contexto de `tokens.media.css` em todo arquivo processado, sem
// emitir nada no CSS de saída — é a forma atual, recomendada pelo próprio
// `postcss-custom-media`, de fazer o que a Opção B de D6 precisa: um arquivo
// consome uma declaração de outro sem redeclará-la.
export default {
  plugins: [
    postcssGlobalData({ files: [screenTokens] }),
    postcssCustomMedia(),
  ],
};
