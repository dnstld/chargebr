import type { FixtureOrigin } from "../../../../fixture-origin";
import type { NavTreeNode } from "../nav-tree";

export const FIXTURE_ORIGIN: FixtureOrigin = "synthetic";
export const FIXTURE_ORIGIN_NOTE =
  "Hierarquia inventada para reproduzir a maquete de navegação na bancada; nenhum destino declara uma rota real do produto.";

export const EXAMPLE_TREE: readonly [NavTreeNode, ...NavTreeNode[]] = [
  { kind: "page", id: "overview", label: "Visão geral", href: "#overview" },
  {
    kind: "folder",
    id: "associations",
    label: "Associações do setor",
    isExpandedByDefault: true,
    children: [
      {
        kind: "page",
        id: "abve",
        label: "ABVE — Associação Brasileira do Veículo Elétrico",
        href: "#abve",
        meta: "14",
        isCurrent: true,
      },
      {
        kind: "page",
        id: "abrace",
        label: "ABRACE",
        href: "#abrace",
        meta: "6",
      },
    ],
  },
  {
    kind: "folder",
    id: "regulators",
    label: "Reguladores governamentais",
    isExpandedByDefault: true,
    children: [
      { kind: "page", id: "aneel", label: "ANEEL", href: "#aneel", meta: "31" },
      { kind: "page", id: "mme", label: "MME", href: "#mme", meta: "9" },
      { kind: "page", id: "anp", label: "ANP", href: "#anp", meta: "4" },
    ],
  },
  {
    kind: "folder",
    id: "utilities",
    label: "Concessionárias",
    children: [
      {
        kind: "page",
        id: "enel-sp",
        label: "Enel SP",
        href: "#enel-sp",
        meta: "12",
      },
      { kind: "page", id: "cpfl", label: "CPFL", href: "#cpfl", meta: "8" },
    ],
  },
  {
    kind: "folder",
    id: "press",
    label: "Imprensa especializada",
    children: [
      {
        kind: "page",
        id: "canal-energia",
        label: "Canal Energia",
        href: "#canal-energia",
        meta: "22",
      },
    ],
  },
];
