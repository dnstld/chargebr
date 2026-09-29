import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut, Menu } from "lucide-react";
import type { PressEvent } from "react-aria-components";
import { expect, userEvent, waitFor } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { resolveColor } from "../../bench/computed";
import { Button } from "./button";

const meta = {
  title: "Átomos/Botão",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// Botão com rótulo, sem ícone: a forma mais comum de ação de texto.
export const EmRepouso: Story = {
  name: "Em repouso",
  args: { children: "Confirmar" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(button.hasAttribute("data-focus-visible")).toBe(false);
  },
};

// Alcançável por teclado: um Tab a partir da página chega ao botão, e o foco
// vindo do teclado aparece com o anel de foco dos tokens.
export const ComFocoPeloTeclado: Story = {
  name: "Com foco pelo teclado",
  args: { children: "Confirmar" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await userEvent.tab();
    await expect(document.activeElement).toBe(button);
    await waitFor(() => {
      expect(button.hasAttribute("data-focus-visible")).toBe(true);
      expect(getComputedStyle(button).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
      expect(getComputedStyle(button).outlineStyle).toBe("solid");
    });
  },
};

// Ícone ao lado do rótulo: a forma que a ação "Deslogar" usa no rodapé de
// NavPanel.
export const ComIconeERotulo: Story = {
  name: "Com ícone e rótulo",
  args: { children: "Sair", icon: LogOut },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Sair" });
    await expect(button.querySelector("svg")).not.toBeNull();
  },
};

// Ícone só, sem rótulo visível: a forma que o gatilho do hambúrguer usa. O
// nome acessível vem de `aria-label`, nunca do ícone — Icon nunca declara um
// nome próprio.
export const IconeSoh: Story = {
  name: "Ícone só",
  args: { icon: Menu, "aria-label": "Abrir menu" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Abrir menu" });
    await expect(button.querySelector("svg")).not.toBeNull();
    await expect(button.textContent?.trim()).toBe("");
  },
};

// Cada tamanho resolve para o `font-size` do seu próprio degrau
// (`component/button.json`) — nunca um valor fora dos três tokens.
export const TamanhoPequeno: Story = {
  name: "Tamanho pequeno",
  args: { children: "Confirmar", size: "sm" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-sm-font-size"][theme],
    );
  },
};

export const TamanhoMedio: Story = {
  name: "Tamanho médio",
  args: { children: "Confirmar", size: "md" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-md-font-size"][theme],
    );
  },
};

export const TamanhoGrande: Story = {
  name: "Tamanho grande",
  args: { children: "Confirmar", size: "lg" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-lg-font-size"][theme],
    );
  },
};

// Sem `size`, o botão resolve para o mesmo `font-size` do degrau médio — a
// aparência de antes desta variante existir não muda.
export const TamanhoNaoEspecificado: Story = {
  name: "Tamanho não especificado usa o médio",
  args: { children: "Confirmar" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-md-font-size"][theme],
    );
  },
};

// Os três atributos de controle que a primitiva já suporta e o wrapper
// anterior bloqueava — consumidor nomeado: a tarefa 7.3 de
// `interface-atomic-structure` (o gatilho do hambúrguer).
export const AtributosDeControle: Story = {
  name: "Atributos de controle",
  args: {
    children: "Abrir menu",
    "aria-expanded": true,
    "aria-controls": "painel-de-navegacao",
    "aria-describedby": "texto-de-apoio",
  },
  // `aria-controls`/`aria-describedby` referenciam elementos que precisam
  // existir na árvore — sem eles a checagem de acessibilidade reprova por
  // referência inválida, não pelos atributos em si.
  render: (args) => (
    <>
      <Button {...args} />
      <div id="painel-de-navegacao">Painel de navegação</div>
      <p id="texto-de-apoio">Abre o painel lateral de navegação.</p>
    </>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Abrir menu" });
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(button).toHaveAttribute(
      "aria-controls",
      "painel-de-navegacao",
    );
    await expect(button).toHaveAttribute("aria-describedby", "texto-de-apoio");
  },
};

// `onPress` recebe o evento de ativação completo da primitiva — não uma
// função sem argumento (BREAKING, proposal.md).
const eventosCapturados: PressEvent[] = [];

export const EventoDeAtivacao: Story = {
  name: "Evento de ativação",
  args: {
    children: "Confirmar",
    onPress: (e: PressEvent) => {
      eventosCapturados.push(e);
    },
  },
  play: async ({ canvas }) => {
    eventosCapturados.length = 0;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(eventosCapturados).toHaveLength(2);
    await expect(eventosCapturados[0]?.type).toBe("press");
    await expect(eventosCapturados[0]?.pointerType).toBe("mouse");
    await expect(eventosCapturados[1]?.type).toBe("press");
    await expect(eventosCapturados[1]?.pointerType).toBe("keyboard");
  },
};

// Pendente, com rótulo de texto: o conteúdo normal permanece renderizado —
// react-aria-components nunca troca `children` sozinho, é o próprio consumidor
// quem decide — e o `Spinner` entra ao lado. O nome acessível vem do próprio
// texto, e continua o mesmo durante a pendência: nem clique nem teclado
// disparam `onPress`, e o botão continua alcançável por Tab.
export const Pendente: Story = {
  name: "Pendente",
  args: {
    children: "Confirmar",
    isPending: true,
    onPress: () => {
      throw new Error("onPress não deveria disparar com o botão pendente");
    },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await userEvent.tab();
    await expect(document.activeElement).toBe(button);
    await expect(button.textContent).toContain("Confirmar");
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
  },
};

// Pendente, ícone só: o mesmo estado, sobre o botão sem rótulo visível — o
// nome acessível vem de `aria-label`, como em qualquer outro caso ícone-só.
export const PendenteIconeSoh: Story = {
  name: "Pendente, ícone só",
  args: {
    icon: Menu,
    "aria-label": "Abrir menu",
    isPending: true,
    onPress: () => {
      throw new Error("onPress não deveria disparar com o botão pendente");
    },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Abrir menu" });
    await userEvent.tab();
    await expect(document.activeElement).toBe(button);
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
  },
};

// Desabilitado: nem clique nem teclado disparam `onPress`, o estado é exposto
// a tecnologia assistiva pelo atributo nativo, e a aparência resolve pelos
// tokens de `disabled` nos dois temas.
export const Desabilitado: Story = {
  name: "Desabilitado",
  args: {
    children: "Confirmar",
    isDisabled: true,
    onPress: () => {
      throw new Error("onPress não deveria disparar com o botão desabilitado");
    },
  },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(button.hasAttribute("data-disabled")).toBe(true);
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(getComputedStyle(button).backgroundColor).toBe(
      resolveColor(tokens["button-disabled-background"][theme]),
    );
    await expect(getComputedStyle(button).color).toBe(
      resolveColor(tokens["button-disabled-text"][theme]),
    );
  },
};
