import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { EXAMPLE_TREE } from "./fixtures/example-tree";
import { NavTree, type NavTreeNode } from "./nav-tree";

const meta = {
  title: "Organismos/Navegação/Árvore",
  component: NavTree,
  args: { tree: EXAMPLE_TREE },
} satisfies Meta<typeof NavTree>;

export default meta;
type Story = StoryObj<typeof meta>;

function expandNode(node: NavTreeNode): NavTreeNode {
  return node.kind === "folder"
    ? {
        ...node,
        isExpandedByDefault: true,
        children: [
          expandNode(node.children[0]),
          ...node.children.slice(1).map(expandNode),
        ],
      }
    : node;
}

const ALL_EXPANDED_TREE: readonly [NavTreeNode, ...NavTreeNode[]] = [
  expandNode(EXAMPLE_TREE[0]),
  ...EXAMPLE_TREE.slice(1).map(expandNode),
];

export const HierarquiaSemPapelDeArvore: Story = {
  name: "Hierarquia sem papel de árvore",
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("tree")).toBeNull();
    await expect(canvas.queryByRole("treeitem")).toBeNull();
    await expect(canvasElement.querySelector('[role="group"]')).toBeNull();
    await expect(
      canvas.getByRole("link", {
        name: "ABVE — Associação Brasileira do Veículo Elétrico 14",
      }),
    ).toBeInTheDocument();
  },
};

export const TodosOsDestinosVisiveisSaoTabulaveis: Story = {
  name: "Toda pasta e folha visível é alcançável por Tab",
  args: { tree: ALL_EXPANDED_TREE },
  play: async ({ canvasElement }) => {
    const interactive = [
      ...canvasElement.querySelectorAll<HTMLElement>("a[href], button"),
    ];
    for (const element of interactive) {
      await userEvent.tab();
      await expect(document.activeElement).toBe(element);
    }
  },
};

export const PastaAlternaFilhos: Story = {
  name: "Pasta alterna estado e filhos",
  play: async ({ canvas }) => {
    const folder = canvas.getByRole("button", { name: "Concessionárias" });
    const controlled = document.getElementById(
      folder.getAttribute("aria-controls") ?? "",
    );
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await expect(controlled).toHaveAttribute("hidden");
    await userEvent.click(folder);
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await expect(controlled).not.toHaveAttribute("hidden");
    await userEvent.click(folder);
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await expect(controlled).toHaveAttribute("hidden");
  },
};

const CURRENT_KINDS: readonly [NavTreeNode, ...NavTreeNode[]] = [
  {
    kind: "folder",
    id: "current-folder",
    label: "Pasta corrente",
    isCurrent: true,
    isExpandedByDefault: true,
    children: [
      {
        kind: "page",
        id: "current-page",
        label: "Folha corrente",
        href: "#current-page",
        isCurrent: true,
      },
    ],
  },
];

export const PastaEFolhaCorrentes: Story = {
  name: "Pasta e folha correntes têm o mesmo tratamento",
  args: { tree: CURRENT_KINDS },
  play: async ({ canvas }) => {
    const folder = canvas.getByRole("button", { name: "Pasta corrente" });
    const leaf = canvas.getByRole("link", { name: "Folha corrente" });
    await expect(folder).toHaveAttribute("aria-current", "page");
    await expect(leaf).toHaveAttribute("aria-current", "page");
    await expect(getComputedStyle(folder).backgroundColor).toBe(
      getComputedStyle(leaf).backgroundColor,
    );
    await expect(getComputedStyle(folder).fontWeight).toBe(
      getComputedStyle(leaf).fontWeight,
    );
  },
};

const ALTERNATIVE_TREE: readonly [NavTreeNode, ...NavTreeNode[]] = [
  { kind: "page", id: "only", label: "Destino alternativo", href: "#only" },
];

export const DadoControlaAEstrutura: Story = {
  name: "Dado hierárquico controla a estrutura",
  args: { tree: ALTERNATIVE_TREE },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Destino alternativo" }),
    ).toBeInTheDocument();
    await expect(canvas.queryByText("Associações do setor")).toBeNull();
  },
};

// Borda esquerda do texto de um controle, medida sobre o próprio nó de texto:
// é a posição do rótulo que se vê, não a da caixa que o contém — a caixa da
// pasta e a da folha têm preenchimentos diferentes, e comparar caixas não
// provaria alinhamento nenhum.
function labelLeft(control: HTMLElement): number {
  const text = [...control.childNodes].find(
    (node) =>
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent ?? "").trim() !== "",
  );
  const target =
    text ??
    [...control.querySelectorAll("span")]
      .flatMap((span) => [...span.childNodes])
      .find(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? "").trim() !== "",
      );
  if (target === undefined) {
    throw new Error(`sem nó de texto em ${control.tagName.toLowerCase()}`);
  }
  const range = document.createRange();
  range.selectNodeContents(target);
  return range.getBoundingClientRect().left;
}

// A página de primeiro nível alinha com os rótulos das pastas irmãs: as duas
// começam depois do mesmo vão, porque a folha sem marcador reserva a largura do
// chevron. Sem esse vão o rótulo da página encosta no preenchimento e fica 21px
// à esquerda do das pastas — é essa diferença que esta história mede.
export const PaginaDePrimeiroNivelAlinhaComPastas: Story = {
  name: "Página de primeiro nível alinha com os rótulos de pasta",
  play: async ({ canvas }) => {
    const pagina = canvas.getByRole("link", { name: "Visão geral" });
    const pasta = canvas.getByRole("button", { name: "Associações do setor" });
    expect(labelLeft(pagina)).toBeCloseTo(labelLeft(pasta), 0);
  },
};

// A folha aninhada não alinha com a de primeiro nível, e não deve: ela está
// dentro do grupo recuado, e é esse recuo que mostra a hierarquia. A asserção
// existe para que o vão da página de primeiro nível não seja confundido com
// "todas as folhas no mesmo lugar".
export const FolhaAninhadaRecuaAlemDaPagina: Story = {
  name: "Folha aninhada recua além da página de primeiro nível",
  play: async ({ canvas }) => {
    const pagina = canvas.getByRole("link", { name: "Visão geral" });
    const aninhada = canvas.getByRole("link", {
      name: "ABVE — Associação Brasileira do Veículo Elétrico 14",
    });
    expect(labelLeft(aninhada)).toBeGreaterThan(labelLeft(pagina));
  },
};
