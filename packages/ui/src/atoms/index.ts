import type { AtomContract } from "./contract";
import { DeclaredAbsenceAtom } from "./declared-absence/declared-absence";
import { EvidenceAnchorAtom } from "./evidence-anchor/evidence-anchor";
import { HatchAtom } from "./hatch/hatch";
import { NumericValueAtom } from "./numeric-value/numeric-value";
import { StatusMarkerAtom } from "./status-marker/status-marker";
import { TextAtom } from "./text/text";

export {
  type AtomContract,
  type AtomState,
  STATE_TAG_PREFIX,
  stateTag,
} from "./contract";
export {
  ABSENCE_KINDS,
  type AbsenceKind,
  DeclaredAbsence,
  DeclaredAbsenceAtom,
  type DeclaredAbsenceProps,
} from "./declared-absence/declared-absence";
export {
  EVIDENCE_ANCHOR_STATES,
  EvidenceAnchor,
  EvidenceAnchorAtom,
  type EvidenceAnchorProps,
  type EvidenceAnchorState,
} from "./evidence-anchor/evidence-anchor";
export {
  HATCH_MIN_SIZE,
  HATCH_PERIOD,
  Hatch,
  HatchAtom,
  type HatchProps,
} from "./hatch/hatch";
export {
  NumericValue,
  NumericValueAtom,
  type NumericValueProps,
} from "./numeric-value/numeric-value";
export {
  STATUS_AXES,
  STATUSES,
  type Status,
  type StatusAxis,
  StatusMarker,
  StatusMarkerAtom,
  type StatusMarkerProps,
  UNRESOLVED,
} from "./status-marker/status-marker";
export { Text, TextAtom, type TextProps } from "./text/text";
export { VALUE_ROLES, type ValueRole } from "./value-role";

// Todos os átomos publicados, na ordem em que foram derivados das restrições
// de domínio. A verificação de cobertura de histórias parte desta lista.
export const ATOMS: readonly AtomContract[] = [
  TextAtom,
  NumericValueAtom,
  HatchAtom,
  StatusMarkerAtom,
  DeclaredAbsenceAtom,
  EvidenceAnchorAtom,
];
