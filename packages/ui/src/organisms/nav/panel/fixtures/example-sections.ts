import type { FixtureOrigin } from "../../../../fixture-origin";
import type { NavSectionProps } from "../../../../molecules/nav/section/nav-section";

// FIXTURE SINTÉTICA. Nada aqui vem de rota real: design.md (D5) decide que
// NavPanel só existe na bancada nesta mudança, sem ligar a apps/backoffice
// enquanto não houver rota de negócio real para popular as folhas.
export const FIXTURE_ORIGIN: FixtureOrigin = "synthetic";
export const FIXTURE_ORIGIN_NOTE =
  "Seções e folhas inventadas para exercitar NavPanel na bancada. Nenhum nome aqui descreve uma tela ou uma rota real do produto.";

export const EXAMPLE_SECTIONS: readonly [
  NavSectionProps,
  ...NavSectionProps[],
] = [
  {
    label: "Fontes",
    items: [
      {
        href: "#abve",
        label: "ABVE — Associação Brasileira do Veículo Elétrico",
        isCurrent: true,
      },
      { href: "#raizen", label: "Raízen" },
      { href: "#vibra", label: "Vibra" },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "#usuarios", label: "Usuários" },
      { href: "#permissoes", label: "Permissões" },
    ],
  },
];
