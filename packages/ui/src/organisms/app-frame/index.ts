import { AppFrameContract } from "./app-frame";
import type { FrameContract } from "./contract";

export {
  AppFrame,
  AppFrameContract,
  type AppFrameProps,
  MAIN_CONTENT_ID,
} from "./app-frame";
export {
  defineFrame,
  FRAME_STATES,
  type FrameContract,
  type FrameState,
} from "./contract";

// A moldura publicada. A verificação de cobertura de histórias lê esta lista
// junto com ATOMS, PRIMITIVES e CHARTS.
export const FRAMES: readonly FrameContract[] = [AppFrameContract];
