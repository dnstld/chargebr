import { defineAtom } from "../contract";
import { VisuallyHidden } from "../../utilities/visually-hidden";
import { Hatch } from "../hatch/hatch";
import styles from "./status-marker.module.css";

// Os três eixos de estado e os valores de cada um, conferidos contra
// supabase/migrations/. São independentes: um marcador exibe um valor de um
// eixo, e nunca um selo que resuma os três.
export const STATUS_AXES = {
  verification_level: ["confirmed", "corroborated", "unverified"],
  workflow_status: ["accepted", "under_review", "candidate"],
  normalization_status: ["normalized", "not_attempted", "unresolved"],
} as const;

export type StatusAxis = keyof typeof STATUS_AXES;
export type Status<Axis extends StatusAxis = StatusAxis> =
  (typeof STATUS_AXES)[Axis][number];

// Todos os estados, achatados: é o que o contrato enumera e o que a cobertura
// de histórias confere. Os nomes são únicos entre os eixos.
export const STATUSES: readonly Status[] = Object.values(STATUS_AXES).flat();

// O único estado sem preenchimento sólido. Não é ausência de resultado: é um
// resultado legítimo, que permanece visível e nunca é agregado aos resolvidos.
export const UNRESOLVED = "unresolved" satisfies Status<"normalization_status">;

export interface StatusMarkerProps<Axis extends StatusAxis> {
  /** Eixo a que o estado pertence. Obrigatório no tipo: sem ele não compila. */
  axis: Axis;
  /** Estado, restrito aos valores do eixo declarado. */
  status: Status<Axis>;
  /** Nome visível do eixo, em PT-BR. Conteúdo: decidido por quem compõe. */
  axisLabel: string;
  /** Nome visível do estado, em PT-BR. Conteúdo: decidido por quem compõe. */
  label: string;
}

// Marcador de estado. O eixo integra o nome acessível — "Normalização: Não
// resolvido" — para que leitor de tela não colapse os três eixos num só, que é
// o que a restrição de domínio proíbe. O nome sai do próprio conteúdo, sem
// ARIA: o estado é texto visível e o eixo é texto visualmente oculto, na
// mesma ordem em que seriam lidos.
export function StatusMarker<Axis extends StatusAxis>({
  axis,
  status,
  axisLabel,
  label,
}: StatusMarkerProps<Axis>) {
  const hatched = status === UNRESOLVED;
  return (
    <span className={styles.marker} data-axis={axis} data-status={status}>
      <span
        className={`${styles.fill} ${hatched ? styles.hatched : styles.solid}`}
        data-fill={hatched ? "hatch" : "solid"}
      >
        {hatched ? <Hatch /> : null}
      </span>
      <VisuallyHidden>{axisLabel}: </VisuallyHidden>
      <span>{label}</span>
    </span>
  );
}

export const StatusMarkerAtom = defineAtom({
  name: "StatusMarker",
  component: StatusMarker,
  states: STATUSES,
});
