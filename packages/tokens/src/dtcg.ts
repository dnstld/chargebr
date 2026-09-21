import { referenceTarget } from "./source.js";

// Validador do formato DTCG (Design Tokens Community Group, formato estável de
// 2025) para o subconjunto que este repositório usa. Ele não substitui a
// especificação: confere a estrutura de grupo e token, os tipos e a forma dos
// valores dos tipos em uso, e reprova o que a especificação reprova.

// Tipos definidos pela especificação.
export const DTCG_TYPES = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "strokeStyle",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography",
] as const;

// Tipo de extensão deste repositório. A especificação não cobre variantes
// numéricas de fonte; o valor é o de `font-variant-numeric` em CSS.
export const EXTENSION_TYPES = ["fontVariantNumeric"] as const;

const KNOWN_TYPES: readonly string[] = [...DTCG_TYPES, ...EXTENSION_TYPES];

// Propriedades reservadas pela especificação, em grupo ou em token.
const RESERVED = new Set([
  "$type",
  "$value",
  "$description",
  "$extensions",
  "$deprecated",
]);

const DIMENSION_UNITS = new Set(["px", "rem"]);
const HEX = /^#[0-9A-Fa-f]{6}$/;

type Problem = string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnitInterval(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && value <= 1;
}

function checkColor(value: unknown, where: string, problems: Problem[]): void {
  if (!isRecord(value)) {
    problems.push(
      `${where}: cor precisa ser objeto com colorSpace e components`,
    );
    return;
  }
  if (value.colorSpace !== "srgb") {
    problems.push(`${where}: colorSpace precisa ser "srgb" neste repositório`);
  }
  const components = value.components;
  if (
    !Array.isArray(components) ||
    components.length !== 3 ||
    !components.every(isUnitInterval)
  ) {
    problems.push(`${where}: components precisa ter três números entre 0 e 1`);
    return;
  }
  if ("alpha" in value && !isUnitInterval(value.alpha)) {
    problems.push(`${where}: alpha precisa ser número entre 0 e 1`);
  }
  if ("hex" in value) {
    if (typeof value.hex !== "string" || !HEX.test(value.hex)) {
      problems.push(`${where}: hex precisa ser #RRGGBB`);
      return;
    }
    const fromComponents = `#${components
      .map((c) =>
        Math.round((c as number) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    if (fromComponents.toLowerCase() !== value.hex.toLowerCase()) {
      problems.push(
        `${where}: hex ${value.hex} não corresponde a components (${fromComponents})`,
      );
    }
  }
}

function checkDimension(
  value: unknown,
  where: string,
  problems: Problem[],
): void {
  if (
    !isRecord(value) ||
    typeof value.value !== "number" ||
    !DIMENSION_UNITS.has(value.unit as string)
  ) {
    problems.push(
      `${where}: dimensão precisa ser { value: número, unit: "px" | "rem" }`,
    );
  }
}

function checkShadowLayer(
  value: unknown,
  where: string,
  problems: Problem[],
): void {
  if (!isRecord(value)) {
    problems.push(`${where}: sombra precisa ser objeto`);
    return;
  }
  for (const field of ["color", "offsetX", "offsetY", "blur", "spread"]) {
    if (!(field in value))
      problems.push(`${where}: sombra sem o campo ${field}`);
  }
  if ("color" in value && referenceTarget(value.color) === null) {
    checkColor(value.color, `${where}.color`, problems);
  }
  for (const field of ["offsetX", "offsetY", "blur", "spread"]) {
    if (field in value && referenceTarget(value[field]) === null) {
      checkDimension(value[field], `${where}.${field}`, problems);
    }
  }
  if ("inset" in value && typeof value.inset !== "boolean") {
    problems.push(`${where}: inset precisa ser booleano`);
  }
}

function checkValue(
  type: string,
  value: unknown,
  where: string,
  problems: Problem[],
): void {
  if (typeof value === "string") {
    if (value.includes("{") || value.includes("}")) {
      if (referenceTarget(value) === null) {
        problems.push(`${where}: referência malformada: ${value}`);
      }
      return;
    }
  }
  switch (type) {
    case "color":
      checkColor(value, where, problems);
      return;
    case "dimension":
      checkDimension(value, where, problems);
      return;
    case "fontFamily":
      if (
        typeof value !== "string" &&
        !(Array.isArray(value) && value.every((v) => typeof v === "string"))
      ) {
        problems.push(
          `${where}: fontFamily precisa ser string ou lista de strings`,
        );
      }
      return;
    case "fontWeight":
      if (typeof value !== "number" || value < 1 || value > 1000) {
        problems.push(`${where}: fontWeight precisa ser número entre 1 e 1000`);
      }
      return;
    case "number":
      if (typeof value !== "number")
        problems.push(`${where}: number precisa ser número`);
      return;
    case "shadow":
      if (Array.isArray(value)) {
        value.forEach((layer, i) => {
          checkShadowLayer(layer, `${where}[${i}]`, problems);
        });
      } else {
        checkShadowLayer(value, where, problems);
      }
      return;
    case "fontVariantNumeric":
      if (typeof value !== "string")
        problems.push(`${where}: fontVariantNumeric precisa ser string`);
      return;
    default:
      // Tipo definido pela especificação mas não usado aqui: a forma não é conferida.
      return;
  }
}

function checkNode(
  node: Record<string, unknown>,
  path: string[],
  inheritedType: string | undefined,
  file: string,
  problems: Problem[],
): void {
  const where = `${file} › ${path.join(".") || "(raiz)"}`;

  for (const key of Object.keys(node)) {
    if (key.startsWith("$") && !RESERVED.has(key)) {
      problems.push(`${where}: propriedade reservada desconhecida: ${key}`);
    }
    if (!key.startsWith("$") && /[{}.]/.test(key)) {
      problems.push(`${where}: nome "${key}" não pode conter chaves nem ponto`);
    }
  }
  if ("$description" in node && typeof node.$description !== "string") {
    problems.push(`${where}: $description precisa ser string`);
  }
  if (
    "$type" in node &&
    (typeof node.$type !== "string" || !KNOWN_TYPES.includes(node.$type))
  ) {
    problems.push(
      `${where}: $type desconhecido: ${JSON.stringify(node.$type)}`,
    );
  }
  const type = typeof node.$type === "string" ? node.$type : inheritedType;

  if ("$value" in node) {
    if (path.length === 0)
      problems.push(`${where}: a raiz não pode ser um token`);
    if (type === undefined) {
      problems.push(`${where}: token sem $type próprio nem herdado`);
    } else if (KNOWN_TYPES.includes(type)) {
      checkValue(type, node.$value, where, problems);
    }
    for (const key of Object.keys(node)) {
      if (!key.startsWith("$"))
        problems.push(`${where}: token não pode ter filho "${key}"`);
    }
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (!isRecord(child)) {
      problems.push(`${where}: "${key}" precisa ser grupo ou token`);
      continue;
    }
    checkNode(child, [...path, key], type, file, problems);
  }
}

// Confere um arquivo DTCG já lido. Retorna a lista de problemas; vazia quando
// o arquivo é válido.
export function validateDtcg(root: unknown, file: string): Problem[] {
  const problems: Problem[] = [];
  if (!isRecord(root)) {
    return [`${file}: a raiz precisa ser um objeto`];
  }
  checkNode(root, [], undefined, file, problems);
  return problems;
}
