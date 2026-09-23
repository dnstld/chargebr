// Nome acessível calculado a partir do conteúdo, como o algoritmo de nome
// acessível faz para elementos que nomeiam pelo que contêm: percorre os nós
// de texto, pula o que está fora da árvore de acessibilidade (aria-hidden,
// display: none, visibility: hidden) e normaliza o espaço. Texto visualmente
// oculto por posição e recorte continua dentro, como continua para o leitor
// de tela.
export function accessibleNameFromContent(root: Element): string {
  const parts: string[] = [];
  const visit = (node: Node): void => {
    if (node instanceof Text) {
      parts.push(node.data);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.getAttribute("aria-hidden") === "true") return;
    const computed = getComputedStyle(node);
    if (computed.display === "none" || computed.visibility === "hidden") return;
    for (const child of node.childNodes) visit(child);
  };
  visit(root);
  return parts.join("").replace(/\s+/g, " ").trim();
}
