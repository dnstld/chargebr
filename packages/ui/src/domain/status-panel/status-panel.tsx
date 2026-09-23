import { DeclaredAbsence } from "../../atoms/declared-absence/declared-absence";
import {
  STATUS_AXES,
  type Status,
  type StatusAxis,
  StatusMarker,
} from "../../atoms/status-marker/status-marker";
import { VisuallyHidden } from "../../utilities/visually-hidden";
import {
  resolveTerms,
  type Terms,
  type VocabularyOverrides,
} from "../../vocabulary/vocabulary";
import { definePrimitive } from "../contract";
import styles from "./status-panel.module.css";

// Um valor para cada eixo, ou null quando o eixo não tem valor. As três
// chaves são obrigatórias no tipo: omitir um eixo não compila, e "sem valor"
// é dito, nunca subentendido.
export type AxisStatuses = {
  readonly [Axis in StatusAxis]: Status<Axis> | null;
};

export interface StatusPanelProps {
  statuses: AxisStatuses;
  /** Sobrescrita termo a termo do vocabulário. */
  terms?: VocabularyOverrides;
}

// Os estados da primitiva: todos os eixos com valor, ou ao menos um sem.
export const STATUS_PANEL_STATES = ["all_valued", "axis_unvalued"] as const;
export type StatusPanelState = (typeof STATUS_PANEL_STATES)[number];

const AXES = Object.keys(STATUS_AXES) as readonly StatusAxis[];

// Um item por eixo. Com valor, é o marcador do ciclo 4, que já põe o eixo no
// nome acessível; sem valor, é uma ausência declarada precedida do eixo, pelo
// mesmo mecanismo, para que o item continue identificável pelo eixo.
function AxisItem<Axis extends StatusAxis>({
  axis,
  status,
  vocabulary,
}: {
  axis: Axis;
  status: Status<Axis> | null;
  vocabulary: Terms;
}) {
  return (
    <li
      className={styles.item}
      data-axis={axis}
      data-valued={status === null ? "false" : "true"}
    >
      {status === null ? (
        <>
          <VisuallyHidden>{vocabulary.axis[axis]}: </VisuallyHidden>
          <DeclaredAbsence
            kind="unknown"
            reason={vocabulary.absence.statusMissing}
          />
        </>
      ) : (
        <StatusMarker
          axis={axis}
          status={status}
          axisLabel={vocabulary.axis[axis]}
          label={vocabulary.status[status]}
        />
      )}
    </li>
  );
}

// Painel de estados: os três eixos, sempre três itens, cada um nomeado pelo
// seu eixo. Não existe resumo, selo ou cor que combine dois eixos: o painel
// compõe o marcador, não o reinterpreta.
export function StatusPanel({ statuses, terms }: StatusPanelProps) {
  const vocabulary = resolveTerms(terms);
  return (
    <ul className={styles.panel} data-primitive="status-panel">
      {AXES.map((axis) => (
        <AxisItem
          key={axis}
          axis={axis}
          status={statuses[axis]}
          vocabulary={vocabulary}
        />
      ))}
    </ul>
  );
}

export const StatusPanelPrimitive = definePrimitive({
  name: "StatusPanel",
  component: StatusPanel,
  states: STATUS_PANEL_STATES,
});
