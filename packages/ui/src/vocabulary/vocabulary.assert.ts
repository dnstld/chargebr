import { expect } from "storybook/test";
import { VOCABULARY, type VocabularyOverrides } from "./vocabulary";

// Prova, em história, que todo termo exibido por uma primitiva sai do
// vocabulário: cada termo é sobrescrito com uma marca, a primitiva é
// renderizada com essa sobrescrita, e todo texto que aparece — visível ou
// só na árvore de acessibilidade — precisa ou carregar a marca ou ser dado
// recebido por propriedade. Um rótulo declarado dentro da primitiva não
// carregaria a marca e reprovaria.
export const TERM_MARK = "«termo» ";

export function markEveryTerm(): VocabularyOverrides {
  const marked: Record<string, Record<string, string>> = {};
  for (const [group, terms] of Object.entries(VOCABULARY)) {
    marked[group] = Object.fromEntries(
      Object.entries(terms).map(([term, text]) => [
        term,
        `${TERM_MARK}${text}`,
      ]),
    );
  }
  return marked as VocabularyOverrides;
}

// Nós de texto que entram na árvore de acessibilidade, um a um: mesmo
// critério do nome acessível (pula aria-hidden, display: none e
// visibility: hidden), sem juntá-los, para que cada texto seja julgado só.
function accessibleTextNodes(root: Element): string[] {
  const texts: string[] = [];
  const visit = (node: Node): void => {
    if (node instanceof Text) {
      const text = node.data.trim();
      if (text.length > 0) texts.push(text);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.getAttribute("aria-hidden") === "true") return;
    const computed = getComputedStyle(node);
    if (computed.display === "none" || computed.visibility === "hidden") return;
    for (const child of node.childNodes) visit(child);
  };
  visit(root);
  return texts;
}

export async function expectEveryTermFromVocabulary(
  root: Element,
  /** Textos que a primitiva recebeu por propriedade e por isso exibe sem marca. */
  suppliedByProps: readonly string[],
): Promise<void> {
  const supplied = new Set(suppliedByProps);
  const texts = accessibleTextNodes(root);
  const unmarked = texts.filter(
    (text) =>
      /\p{L}/u.test(text) && !text.startsWith(TERM_MARK) && !supplied.has(text),
  );
  await expect(
    unmarked,
    "texto exibido que não veio do vocabulário nem de propriedade",
  ).toEqual([]);
  await expect(texts.some((text) => text.startsWith(TERM_MARK))).toBe(true);
}
