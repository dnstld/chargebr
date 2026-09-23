import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { accessibleNameFromContent } from "../../bench/accessible-name";
import { resolveColor } from "../../bench/computed";
import { HATCH_MIN_SIZE } from "../hatch/hatch";
import { type Status, type StatusAxis, StatusMarker } from "./status-marker";
import styles from "./status-marker.stories.module.css";

const meta = {
  title: "Átomos/Marcador de estado",
  component: StatusMarker,
} satisfies Meta<typeof StatusMarker>;

export default meta;

type Story = StoryObj<typeof meta>;

// Nomes visíveis usados só pela bancada. Os nomes de produto são conteúdo do
// ciclo 5; aqui eles existem para que o marcador tenha o que exibir.
const LABELS: {
  [Axis in StatusAxis]: { axis: string; status: Record<Status<Axis>, string> };
} = {
  verification_level: {
    axis: "Verificação",
    status: {
      confirmed: "Confirmado",
      corroborated: "Corroborado",
      unverified: "Não verificado",
    },
  },
  workflow_status: {
    axis: "Fluxo",
    status: {
      accepted: "Aceito",
      under_review: "Em revisão",
      candidate: "Candidato",
    },
  },
  normalization_status: {
    axis: "Normalização",
    status: {
      normalized: "Normalizado",
      not_attempted: "Não tentado",
      unresolved: "Não resolvido",
    },
  },
};

function AxisRow<Axis extends StatusAxis>({ axis }: { axis: Axis }) {
  const labels = LABELS[axis];
  const statuses = Object.keys(labels.status) as Status<Axis>[];
  return (
    <div className={styles.row}>
      {statuses.map((status) => (
        <StatusMarker
          key={status}
          axis={axis}
          status={status}
          axisLabel={labels.axis}
          label={labels.status[status]}
        />
      ))}
    </div>
  );
}

// Localiza um marcador pelo nome acessível calculado a partir do conteúdo,
// "<eixo>: <estado>". Não há ARIA: o nome é o texto, com o eixo visualmente
// oculto mas presente na árvore de acessibilidade.
function markerNamed(canvasElement: HTMLElement, name: string): HTMLElement {
  const markers = [
    ...canvasElement.querySelectorAll<HTMLElement>("[data-axis][data-status]"),
  ];
  const found = markers.filter(
    (marker) => accessibleNameFromContent(marker) === name,
  );
  if (found.length !== 1) {
    throw new Error(
      `esperado um marcador com nome acessível "${name}"; nomes presentes: ${markers
        .map((marker) => `"${accessibleNameFromContent(marker)}"`)
        .join(", ")}`,
    );
  }
  return found[0] as HTMLElement;
}

// O eixo integra o nome acessível: cada marcador é encontrado pelo nome
// "<eixo>: <estado>", e o eixo, embora fora da tela, não está oculto para a
// tecnologia assistiva. Já o texto visível é só o estado.
async function expectAxisInAccessibleName<Axis extends StatusAxis>(
  canvasElement: HTMLElement,
  axis: Axis,
): Promise<void> {
  const labels = LABELS[axis];
  for (const [status, label] of Object.entries(labels.status)) {
    const marker = markerNamed(canvasElement, `${labels.axis}: ${label}`);
    await expect(marker.getAttribute("data-axis")).toBe(axis);
    await expect(marker.getAttribute("data-status")).toBe(status);
    await expect(marker.querySelector("span[aria-hidden]")).toBeNull();
    await expect(marker.getAttribute("role")).toBeNull();

    const visible = [...marker.querySelectorAll<HTMLElement>("span")].filter(
      (span) => span.getBoundingClientRect().width > HATCH_MIN_SIZE,
    );
    await expect(visible.map((span) => span.textContent)).toEqual([label]);
  }
}

export const NivelDeVerificacao: Story = {
  name: "Nível de verificação",
  tags: ["state:confirmed", "state:corroborated", "state:unverified"],
  args: {
    axis: "verification_level",
    status: "confirmed",
    axisLabel: LABELS.verification_level.axis,
    label: LABELS.verification_level.status.confirmed,
  },
  render: () => <AxisRow axis="verification_level" />,
  play: async ({ canvasElement }) => {
    await expectAxisInAccessibleName(canvasElement, "verification_level");
  },
};

export const EstadoDoFluxo: Story = {
  name: "Estado do fluxo",
  tags: ["state:accepted", "state:under_review", "state:candidate"],
  args: {
    axis: "workflow_status",
    status: "accepted",
    axisLabel: LABELS.workflow_status.axis,
    label: LABELS.workflow_status.status.accepted,
  },
  render: () => <AxisRow axis="workflow_status" />,
  play: async ({ canvasElement }) => {
    await expectAxisInAccessibleName(canvasElement, "workflow_status");
  },
};

export const Normalizacao: Story = {
  name: "Normalização",
  tags: ["state:normalized", "state:not_attempted", "state:unresolved"],
  args: {
    axis: "normalization_status",
    status: "normalized",
    axisLabel: LABELS.normalization_status.axis,
    label: LABELS.normalization_status.status.normalized,
  },
  render: () => <AxisRow axis="normalization_status" />,
  play: async ({ canvasElement }) => {
    await expectAxisInAccessibleName(canvasElement, "normalization_status");
  },
};

function fillOf(marker: HTMLElement): HTMLElement {
  const fill = marker.querySelector<HTMLElement>("[data-fill]");
  if (fill === null) throw new Error("marcador sem elemento de preenchimento");
  return fill;
}

// Não resolvido é hachurado; os resolvidos são sólidos. A prova lê o
// preenchimento aplicado, não a classe: um sólido plantado no CSS reprova.
export const NaoResolvido: Story = {
  name: "Não resolvido é hachurado",
  tags: ["state:unresolved", "state:normalized"],
  args: {
    axis: "normalization_status",
    status: "unresolved",
    axisLabel: LABELS.normalization_status.axis,
    label: LABELS.normalization_status.status.unresolved,
  },
  render: () => (
    <div className={styles.row}>
      <StatusMarker
        axis="normalization_status"
        status="normalized"
        axisLabel="Normalização"
        label="Normalizado"
      />
      <StatusMarker
        axis="normalization_status"
        status="unresolved"
        axisLabel="Normalização"
        label="Não resolvido"
      />
    </div>
  ),
  play: async ({ canvasElement, globals }) => {
    const theme = globals.theme as Theme;
    const solidColor = resolveColor(tokens["color-text-secondary"][theme]);
    const transparent = resolveColor("transparent");

    const unresolved = fillOf(
      markerNamed(canvasElement, "Normalização: Não resolvido"),
    );
    await expect(unresolved.getAttribute("data-fill")).toBe("hatch");
    await expect(getComputedStyle(unresolved).backgroundColor).toBe(
      transparent,
    );
    await expect(getComputedStyle(unresolved).backgroundImage).toBe("none");
    await expect(unresolved.querySelector("svg[data-hatch]")).not.toBeNull();
    await expect(
      unresolved.getBoundingClientRect().width,
    ).toBeGreaterThanOrEqual(HATCH_MIN_SIZE);

    const resolved = fillOf(
      markerNamed(canvasElement, "Normalização: Normalizado"),
    );
    await expect(resolved.getAttribute("data-fill")).toBe("solid");
    await expect(getComputedStyle(resolved).backgroundColor).toBe(solidColor);
    await expect(resolved.querySelector("svg")).toBeNull();
  },
};
