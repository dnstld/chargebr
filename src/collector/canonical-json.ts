export type JsonPrimitive = null | boolean | number | string;
export type CanonicalJsonValue =
  | JsonPrimitive
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

export function canonicalJson(value: unknown): string {
  return serialize(value, new WeakSet<object>());
}

function serialize(value: unknown, ancestors: WeakSet<object>): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON accepts finite numbers only");
    }
    return JSON.stringify(value);
  }

  if (typeof value !== "object") {
    throw new TypeError(`Canonical JSON does not accept ${typeof value}`);
  }

  if (ancestors.has(value)) {
    throw new TypeError("Canonical JSON does not accept cyclic references");
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const entries: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new TypeError("Canonical JSON does not accept sparse arrays");
        }
        entries.push(serialize(value[index], ancestors));
      }
      return `[${entries.join(",")}]`;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical JSON accepts plain objects only");
    }

    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError("Canonical JSON does not accept symbol keys");
    }

    const objectValue = value as Record<string, unknown>;
    const entries = Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${serialize(objectValue[key], ancestors)}`);
    return `{${entries.join(",")}}`;
  } finally {
    ancestors.delete(value);
  }
}
