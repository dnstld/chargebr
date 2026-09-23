const TRACKING_PARAMETERS = new Set(["fbclid", "gclid"]);

interface RawQueryParameter {
  readonly raw: string;
  readonly name: string;
  readonly value: string;
  readonly index: number;
}

export function canonicalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("canonical_url_invalid");
  }

  if (url.protocol.toLowerCase() !== "https:") {
    throw new Error("canonical_url_requires_https");
  }
  if (url.username !== "" || url.password !== "") {
    throw new Error("canonical_url_userinfo_not_allowed");
  }

  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase();
  if (url.port === "443") {
    url.port = "";
  }
  url.hash = "";
  if (url.pathname === "") {
    url.pathname = "/";
  } else if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  const rawQuery = url.search.slice(1);
  const parameters = rawQuery
    .split("&")
    .filter((part) => part !== "")
    .map(parseRawParameter)
    .filter(({ name }) => {
      const normalizedName = name.toLowerCase();
      return !normalizedName.startsWith("utm_") && !TRACKING_PARAMETERS.has(normalizedName);
    })
    .sort((left, right) =>
      compare(left.name, right.name) || compare(left.value, right.value) || left.index - right.index,
    );

  url.search = "";
  const base = url.toString();
  return parameters.length === 0 ? base : `${base}?${parameters.map(({ raw }) => raw).join("&")}`;
}

function parseRawParameter(raw: string, index: number): RawQueryParameter {
  const equals = raw.indexOf("=");
  const rawName = equals < 0 ? raw : raw.slice(0, equals);
  const rawValue = equals < 0 ? "" : raw.slice(equals + 1);
  return {
    raw,
    name: decodeQueryComponent(rawName),
    value: decodeQueryComponent(rawValue),
    index,
  };
}

function decodeQueryComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/gu, " ")).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
