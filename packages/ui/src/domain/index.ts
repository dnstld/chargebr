import { BlockedProjectionPrimitive } from "./blocked-projection/blocked-projection";
import type { PrimitiveContract } from "./contract";
import { StatusPanelPrimitive } from "./status-panel/status-panel";
import { ValueWithProvenancePrimitive } from "./value-with-provenance/value-with-provenance";

export { BLOCK_REASONS, type BlockReason } from "./block-reason";
export {
  BlockedProjection,
  BlockedProjectionPrimitive,
  type BlockedProjectionProps,
} from "./blocked-projection/blocked-projection";
export { definePrimitive, type PrimitiveContract } from "./contract";
export {
  type AxisStatuses,
  STATUS_PANEL_STATES,
  StatusPanel,
  StatusPanelPrimitive,
  type StatusPanelProps,
  type StatusPanelState,
} from "./status-panel/status-panel";
export {
  type EvidencePath,
  type ProvenancedNumber,
  type ProvenancedText,
  VALUE_WITH_PROVENANCE_STATES,
  ValueWithProvenance,
  ValueWithProvenancePrimitive,
  type ValueWithProvenanceProps,
} from "./value-with-provenance/value-with-provenance";

// Todas as primitivas publicadas, na ordem das restrições que as exigem. A
// verificação de cobertura de histórias lê esta lista junto com ATOMS.
export const PRIMITIVES: readonly PrimitiveContract[] = [
  ValueWithProvenancePrimitive,
  BlockedProjectionPrimitive,
  StatusPanelPrimitive,
];
