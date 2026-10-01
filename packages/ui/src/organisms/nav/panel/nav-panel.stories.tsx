import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut } from "lucide-react";
import { expect, userEvent } from "storybook/test";
import { Button } from "../../../atoms/button/button";
import { EXAMPLE_TREE } from "../tree/fixtures/example-tree";
import { NavPanel } from "./nav-panel";

const meta = {
  title: "Organismos/Navegação/Painel",
  component: NavPanel,
  args: {
    label: "Navegação principal",
    heading: "Fontes",
    tree: EXAMPLE_TREE,
    footer: <Button icon={LogOut}>Sair</Button>,
  },
} satisfies Meta<typeof NavPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// Prova direta do requisito "Foco preso só no modo sobreposto", cenário 1:
// do último elemento focalizável, um Tab a mais continua dentro do painel —
// FocusScope com `contain` volta para o primeiro, nunca escapa.
export const FocoNaoEscapaDoPainelSobreposto: Story = {
  name: "Foco não escapa do painel sobreposto",
  args: { mode: "overlay" },
  play: async ({ canvas }) => {
    const primeiraFolha = canvas.getByRole("link", { name: "Visão geral" });
    const ultimoFocalizavel = canvas.getByRole("button", { name: "Sair" });
    ultimoFocalizavel.focus();
    await expect(document.activeElement).toBe(ultimoFocalizavel);
    await userEvent.tab();
    await expect(document.activeElement).toBe(primeiraFolha);
  },
};

export const RenderizaArvoreSemSecoes: Story = {
  name: "Renderiza a árvore, não seções planas",
  args: { mode: "persistent" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Fontes")).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: "ABVE — Associação Brasileira do Veículo Elétrico 14",
      }),
    ).toBeInTheDocument();
    await expect(canvas.queryByText("Configurações")).toBeNull();
  },
};

// Cenário 2 do mesmo requisito: em modo persistente, o mesmo Tab a mais sai
// do painel para o próximo elemento focalizável do documento.
export const FocoAtravessaOPainelPersistenteLivremente: Story = {
  name: "Foco atravessa o painel persistente livremente",
  args: { mode: "persistent" },
  render: (args) => (
    <>
      <NavPanel {...args} />
      <button type="button">Depois do painel</button>
    </>
  ),
  play: async ({ canvas }) => {
    const ultimoFocalizavel = canvas.getByRole("button", { name: "Sair" });
    const depois = canvas.getByRole("button", { name: "Depois do painel" });
    ultimoFocalizavel.focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(depois);
  },
};
