import { expect } from "storybook/test";
import { VALUE_ROLES, type ValueRole } from "./value-role";

// Propriedades computadas que não são cor. Dois papéis distinguíveis só por
// cor teriam estes valores iguais — e é isso que a restrição proíbe.
const NON_CHROMATIC = [
  "fontWeight",
  "fontStyle",
  "fontSize",
  "textDecorationLine",
  "textTransform",
  "letterSpacing",
] as const;

function nonChromatic(element: HTMLElement): Record<string, string> {
  const computed = getComputedStyle(element);
  return Object.fromEntries(
    NON_CHROMATIC.map((property) => [property, computed[property]]),
  );
}

// Afirma, lendo estilo computado, que cada par de papéis difere em ao menos
// uma propriedade não cromática. Lê o resultado renderizado: inspecionar o CSS
// afirmaria sem executar.
export async function expectRolesDistinctWithoutColor(
  byRole: Record<ValueRole, HTMLElement>,
): Promise<void> {
  const styles = VALUE_ROLES.map((role) => ({
    role,
    ...nonChromatic(byRole[role]),
  }));
  for (const [index, left] of styles.entries()) {
    for (const right of styles.slice(index + 1)) {
      const { role: leftRole, ...leftStyle } = left;
      const { role: rightRole, ...rightStyle } = right;
      await expect(
        leftStyle,
        `${leftRole} e ${rightRole} só diferem em cor`,
      ).not.toEqual(rightStyle);
    }
  }
}
