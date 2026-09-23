import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { Theme } from "../../.storybook/theme";
import { resolveColor } from "../bench/computed";
import { AppFrame, MAIN_CONTENT_ID } from "./app-frame";

// A moldura é a raiz da história: aninhá-la dentro de outra região faria a
// checagem de acessibilidade medir uma estrutura que a aplicação não entrega.
const meta = {
  title: "Moldura/Moldura da aplicação",
  component: AppFrame,
  args: {
    productName: "ChargeBR",
    skipLabel: "Ir para o conteúdo",
    children: <p>Conteúdo da rota</p>,
  },
} satisfies Meta<typeof AppFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

// O que o navegador põe na ordem de tabulação. O destino do salto declara
// `tabindex="-1"`: é focalizável por fragmento, e de propósito fora daqui.
const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function frameOf(canvasElement: HTMLElement): HTMLElement {
  const frame = canvasElement.querySelector<HTMLElement>('[data-frame="app"]');
  if (frame === null) throw new Error("moldura não renderizada");
  return frame;
}

function describeElement(element: Element): string {
  const id = element.id === "" ? "" : `#${element.id}`;
  return `<${element.tagName.toLowerCase()}${id}>`;
}

// O salto é o primeiro focalizável da moldura. A afirmação nomeia quem passou
// à frente: sem isso, a reprovação diria apenas que a ordem mudou.
async function expectSkipIsFirstFocusable(frame: HTMLElement): Promise<void> {
  const focusable = [...frame.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusable[0];
  await expect(first, "a moldura não tem elemento focalizável").toBeDefined();
  await expect(
    first === frame.querySelector(`a[href="#${MAIN_CONTENT_ID}"]`),
    first === undefined
      ? "sem elemento focalizável"
      : `${describeElement(first)} precede o salto`,
  ).toBe(true);
}

// A família e as cores vêm da camada de tokens, resolvidas no tema corrente.
// A comparação é com o valor do token, nunca com um literal escrito aqui.
async function expectThemeSurface(
  frame: HTMLElement,
  theme: Theme,
): Promise<void> {
  const computed = getComputedStyle(frame);
  await expect(computed.backgroundColor).toBe(
    resolveColor(tokens["color-surface-base"][theme]),
  );
  await expect(computed.color).toBe(
    resolveColor(tokens["color-text-primary"][theme]),
  );
  await expect(computed.fontFamily).toBe(tokens["text-body-family"][theme]);
}

export const EmRepouso: Story = {
  name: "Em repouso",
  tags: ["state:idle"],
  play: async ({ canvas, canvasElement, args, globals }) => {
    const theme = globals.theme as Theme;
    const frame = frameOf(canvasElement);

    // As duas regiões são alcançáveis pelo papel, e o nome do produto está
    // dentro do cabeçalho — não em qualquer lugar do documento.
    const banner = canvas.getByRole("banner");
    await expect(
      within(banner).getByText(args.productName),
    ).toBeInTheDocument();
    const main = canvas.getByRole("main");
    await expect(main.id).toBe(MAIN_CONTENT_ID);

    // A moldura não declara região de navegação: não existe rota de negócio
    // para listar, e região vazia anuncia destino que não existe.
    await expect(canvas.queryByRole("navigation")).toBeNull();

    // O salto está presente, aponta para a região de conteúdo e não tem foco.
    const skip = canvas.getByRole("link", { name: args.skipLabel });
    await expect(skip.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
    await expect(document.activeElement).not.toBe(skip);

    await expectSkipIsFirstFocusable(frame);
    await expectThemeSurface(frame, theme);
    // O cabeçalho aplica a família declarada, e não a do navegador.
    await expect(getComputedStyle(banner).fontFamily).toBe(
      tokens["text-heading-family"][theme],
    );
  },
};

// Uma tabulação a partir da página chega ao salto, e o foco vindo do teclado
// aparece com o anel de foco dos tokens.
export const ComSaltoFocado: Story = {
  name: "Com salto focado",
  tags: ["state:skip-focused"],
  play: async ({ canvas, canvasElement, args, globals }) => {
    const theme = globals.theme as Theme;
    const frame = frameOf(canvasElement);
    const skip = canvas.getByRole("link", { name: args.skipLabel });

    await expectSkipIsFirstFocusable(frame);
    await userEvent.tab();
    await expect(document.activeElement).toBe(skip);

    // O anel de foco só aparece depois do render que a interação disparou: a
    // leitura é repetida até o estilo chegar, em vez de feita uma vez só.
    await waitFor(() => {
      expect(getComputedStyle(skip).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
      expect(getComputedStyle(skip).outlineStyle).toBe("solid");
    });
  },
};

// O salto leva ao conteúdo: o teclado chega ao link, o link aponta para o
// fragmento da região de conteúdo, e navegar até esse fragmento move o foco
// para lá. Nenhum manipulador de evento participa — é o navegador que foca o
// alvo do fragmento, porque a região declara `tabIndex={-1}`.
//
// A navegação é feita pelo fragmento, e não acionando a âncora: acionar uma
// âncora dentro da bancada derruba a conexão do executor com a página
// (VITEST_BROWSER_CONNECTION_CLOSED), por teclado, por clique e por clique
// programático. O que a âncora acrescentaria à afirmação é que ela navega para
// o próprio href, e o href é afirmado aqui mesmo, logo acima.
//
// Esta história não declara estado: o estado declarado é o do salto em foco, e
// aqui o foco já saiu dele.
export const SaltoLevaAoConteudo: Story = {
  name: "Salto leva ao conteúdo",
  play: async ({ canvas, args }) => {
    const skip = canvas.getByRole("link", { name: args.skipLabel });
    const main = canvas.getByRole("main");

    await userEvent.tab();
    await expect(document.activeElement).toBe(skip);
    await expect(skip.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);

    window.location.hash = `#${MAIN_CONTENT_ID}`;
    await waitFor(() => {
      expect(document.activeElement).toBe(main);
    });
  },
};
