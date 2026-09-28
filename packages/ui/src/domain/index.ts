import { BlockedProjectionPrimitive } from "../molecules/domain/blocked-projection/blocked-projection";
import { ValueWithProvenancePrimitive } from "../molecules/domain/value-with-provenance/value-with-provenance";
import { StatusPanelPrimitive } from "../organisms/domain/status-panel/status-panel";
import type { PrimitiveContract } from "./contract";

export { BLOCK_REASONS, type BlockReason } from "./block-reason";
export {
  BlockedProjection,
  BlockedProjectionPrimitive,
  type BlockedProjectionProps,
} from "../molecules/domain/blocked-projection/blocked-projection";
export { definePrimitive, type PrimitiveContract } from "./contract";
export {
  type AxisStatuses,
  STATUS_PANEL_STATES,
  StatusPanel,
  StatusPanelPrimitive,
  type StatusPanelProps,
  type StatusPanelState,
} from "../organisms/domain/status-panel/status-panel";
export {
  type EvidencePath,
  type ProvenancedNumber,
  type ProvenancedText,
  VALUE_WITH_PROVENANCE_STATES,
  ValueWithProvenance,
  ValueWithProvenancePrimitive,
  type ValueWithProvenanceProps,
} from "../molecules/domain/value-with-provenance/value-with-provenance";

// Todas as primitivas publicadas, na ordem das restrições que as exigem. A
// verificação de cobertura de histórias lê esta lista junto com ATOMS.
export const PRIMITIVES: readonly PrimitiveContract[] = [
  ValueWithProvenancePrimitive,
  BlockedProjectionPrimitive,
  StatusPanelPrimitive,
];
