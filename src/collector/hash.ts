import { createHash } from "node:crypto";

import { canonicalJson } from "./canonical-json.js";

export function sha256Bytes(value: NodeJS.ArrayBufferView): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Utf8(value: string): string {
  return sha256Bytes(Buffer.from(value, "utf8"));
}

export function sha256CanonicalJson(value: unknown): string {
  return sha256Utf8(canonicalJson(value));
}
