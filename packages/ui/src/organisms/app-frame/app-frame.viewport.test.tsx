import { page } from "vitest/browser";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { EXAMPLE_SECTIONS } from "../nav/panel/fixtures/example-sections";
import { NavPanel } from "../nav/panel/nav-panel";
import { AppFrame } from "./app-frame";

// Ponto 19 (docs/pontos-abertos.md): a regra CSS do gatilho
// (`app-frame.module.css`, `@media (--screen-md)`) nunca tinha prova de
// efeito por largura real de janela — só o comportamento independente de
// largura (aria-expanded/aria-controls, história `ComGatilhoDeNavegacao`)
// era provado. Este projeto roda em modo nativo de navegador do Vitest,
// fora do `storybookTest`, onde `page.viewport()` de `"vitest/browser"` tem
// efeito de verdade (ver design de `close-open-points`).
//
// A largura de teste fica a 1px de cada lado do breakpoint, não em cima
// dele: medido que `getByRole` reprova por timeout exatamente em 768px, o
// próprio limiar de `min-width: 768px` — risco de arredondamento de
// viewport real que não é o que este cenário prova. 767/769 prova o mesmo
// comportamento sem depender do valor exato do limiar.
const BREAKPOINT = 768; // `tokens.media.css`, `@custom-media --screen-md`

function ViewportProbe() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <AppFrame
      productName="ChargeBR"
      skipLabel="Ir para o conteúdo"
      nav={
        <NavPanel
          label="Navegação principal"
          mode="overlay"
          sections={EXAMPLE_SECTIONS}
        />
      }
      navToggleLabel="Abrir menu"
      navOpen={navOpen}
      onNavToggle={() => setNavOpen((open) => !open)}
    >
      <p>Conteúdo da rota</p>
    </AppFrame>
  );
}

// Localizado por papel e nome acessível — `getByRole` é sensível à árvore
// de acessibilidade: um botão dentro de um ancestral `display: none` não é
// encontrado por ele, o mesmo que um leitor de tela veria. Isso prova
// alcançabilidade de verdade, não presença no DOM.
function triggerIsReachable(): boolean {
  try {
    page.getByRole("button", { name: "Abrir menu" }).element();
    return true;
  } catch {
    return false;
  }
}

test("o gatilho é alcançável abaixo do breakpoint e deixa de ser a partir dele", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<ViewportProbe />);

  await page.viewport(BREAKPOINT - 1, 800);
  await expect.poll(async () => triggerIsReachable()).toBe(true);

  await page.viewport(BREAKPOINT + 1, 800);
  await expect.poll(async () => triggerIsReachable()).toBe(false);

  root.unmount();
  container.remove();
});
