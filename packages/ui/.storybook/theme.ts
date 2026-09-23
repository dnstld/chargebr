// Os temas são os dois estados que @chargebr/tokens resolve pelo atributo
// `data-theme` na raiz do documento. A bancada só alterna o atributo; os
// valores vêm inteiros do tokens.css publicado.
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABEL: Record<Theme, string> = {
  light: "Claro",
  dark: "Escuro",
};

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}
