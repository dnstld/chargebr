import {
  describeValue,
  type Layer,
  literalLeaves,
  referencesIn,
  type SourceToken,
  THEMES,
  type Theme,
  tokensForTheme,
} from "./source.js";

// Regras entre camadas e entre temas, conferidas sobre a fonte carregada.
// Cada função retorna a lista de violações, vazia quando a regra passa. As
// mensagens nomeiam o token e o que foi violado, porque são elas que aparecem
// quando `pnpm verify` reprova.

// Cada camada só pode referenciar a camada imediatamente abaixo.
const ALLOWED_TARGET: Record<Layer, Layer | null> = {
  primitive: null,
  semantic: "primitive",
  component: "semantic",
};

function label(token: SourceToken): string {
  return token.theme ? `${token.path} [${token.theme}]` : token.path;
}

function indexByPath(
  tokens: SourceToken[],
  violations: string[],
): Map<string, SourceToken> {
  const byPath = new Map<string, SourceToken>();
  for (const token of tokens) {
    const existing = byPath.get(token.path);
    if (existing) {
      violations.push(
        `${token.path} definido em ${existing.file} e em ${token.file}`,
      );
      continue;
    }
    byPath.set(token.path, token);
  }
  return byPath;
}

// Referência dirigida: primitiva não referencia nada; semântica só referencia
// primitiva; componente só referencia semântica. Referência a token inexistente
// também reprova, porque a geração não teria como resolvê-la.
export function checkReferences(tokens: SourceToken[]): string[] {
  const violations: string[] = [];
  for (const theme of THEMES) {
    const visible = tokensForTheme(tokens, theme);
    const byPath = indexByPath(visible, theme === THEMES[0] ? violations : []);
    for (const token of visible) {
      if (token.theme !== null && token.theme !== theme) continue;
      for (const target of referencesIn(token.value)) {
        const referenced = byPath.get(target);
        if (!referenced) {
          violations.push(
            `${label(token)} (${token.layer}) referencia {${target}}, que não existe`,
          );
          continue;
        }
        const allowed = ALLOWED_TARGET[token.layer];
        if (referenced.layer !== allowed) {
          violations.push(
            `${label(token)} (${token.layer}) referencia {${target}} (${referenced.layer}); ` +
              (allowed
                ? `${token.layer} só pode referenciar ${allowed}`
                : "primitive não referencia nada"),
          );
        }
      }
    }
  }
  // O mesmo token pode aparecer nos dois temas; a violação é uma só.
  return [...new Set(violations)];
}

// Valor literal só existe na camada primitiva.
export function checkLiterals(tokens: SourceToken[]): string[] {
  const violations: string[] = [];
  for (const token of tokens) {
    if (token.layer === "primitive") continue;
    if (literalLeaves(token.value).length > 0) {
      violations.push(
        `${label(token)} (${token.layer}) tem valor literal: ${describeValue(token.value)}`,
      );
    }
  }
  return violations;
}

// Todo token com tema precisa existir nos dois temas.
export function checkThemeCompleteness(tokens: SourceToken[]): string[] {
  const violations: string[] = [];
  const themed = new Map<Theme, Set<string>>(
    THEMES.map((theme) => [theme, new Set<string>()]),
  );
  for (const token of tokens) {
    if (token.theme) themed.get(token.theme)?.add(token.path);
  }
  for (const theme of THEMES) {
    for (const other of THEMES) {
      if (other === theme) continue;
      for (const path of themed.get(theme) ?? []) {
        if (!themed.get(other)?.has(path)) {
          violations.push(`${path} definido em ${theme} e ausente em ${other}`);
        }
      }
    }
  }
  return violations;
}

// A família tipográfica é declarada uma vez, na camada primitiva. Fora dela,
// um token de família só pode referenciar. Nenhuma referência a Alumni Sans
// pode permanecer (docs/decisao-identidade-visual.md).
export function checkFontFamily(tokens: SourceToken[]): string[] {
  const violations: string[] = [];
  const declared: SourceToken[] = [];
  for (const token of tokens) {
    const families = fontFamilyLeaves(token);
    if (families.length === 0) continue;
    if (token.layer !== "primitive") {
      violations.push(
        `${label(token)} (${token.layer}) declara família tipográfica: ${describeValue(token.value)}`,
      );
      continue;
    }
    declared.push(token);
    for (const family of families) {
      if (/alumni/i.test(family))
        violations.push(`${token.path} referencia Alumni Sans`);
    }
  }
  if (declared.length !== 1) {
    violations.push(
      `a camada primitiva precisa declarar exatamente uma família tipográfica; encontradas ${declared.length}: ${declared.map((t) => t.path).join(", ") || "nenhuma"}`,
    );
  }
  return violations;
}

// Folhas literais de família: o valor de um token `fontFamily`, ou o campo
// `fontFamily` de um token `typography`.
function fontFamilyLeaves(token: SourceToken): string[] {
  let value: unknown;
  if (token.type === "fontFamily") value = token.value;
  else if (
    token.type === "typography" &&
    typeof token.value === "object" &&
    token.value !== null
  ) {
    value = (token.value as Record<string, unknown>).fontFamily;
  }
  return literalLeaves(value).filter(
    (leaf): leaf is string => typeof leaf === "string",
  );
}
