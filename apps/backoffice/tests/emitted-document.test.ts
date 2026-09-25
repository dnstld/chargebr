import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";
import { expect, test } from "vitest";

const APP_ROOT = fileURLToPath(new URL("../", import.meta.url));
const BUILD_DIR = join(APP_ROOT, ".next");

// Como a construção entrega uma rota. Pré-renderizada: a resposta é produzida
// durante a construção, e a rota lista os documentos que emite — nenhum, quando
// a resposta não é documento, como a de uma rota de metadados. Resolvida por
// requisição: a construção não produz resposta, e a rota não tem lista de
// documentos — a camada 2 não alcança o que ela entrega, e declarar a forma é
// declarar essa lacuna.
type Form = "prerendered" | "on-demand";
type Delivery =
  | { form: "prerendered"; documents: readonly string[] }
  | { form: "on-demand" };

const FORMS: readonly Form[] = ["prerendered", "on-demand"];
const FORM_LABEL: Readonly<Record<Form, string>> = {
  prerendered: "pré-renderizada",
  "on-demand": "resolvida por requisição",
};

// As rotas que a construção produz pela convenção de rotas da aplicação (App
// Router), cada uma com a forma de entrega e os documentos. Não é suposto: é o
// que a construção registrada no ciclo dynamic-route-readiness observou, rota a
// rota e caminho a caminho. Acrescentar rota é ato deliberado — sem uma linha
// aqui, a verificação reprova, qualquer que seja a forma.
//
// `/_global-error` e `/_not-found` são gerados pelo framework, mas dentro da
// convenção: constam da lista de rotas dela e são pré-renderizados, e entram
// aqui pela mesma razão que as demais. Um filtro é onde uma rota nova se
// esconde.
const DECLARED_ROUTES: Readonly<Record<string, Delivery>> = {
  "/": { form: "prerendered", documents: ["server/app/index.html"] },
  "/_global-error": {
    form: "prerendered",
    documents: ["server/app/_global-error.html"],
  },
  "/_not-found": {
    form: "prerendered",
    documents: ["server/app/_not-found.html"],
  },
  // Rota de prova: exercita a forma resolvida por requisição.
  "/prova/[id]": { form: "on-demand" },
};

// As rotas que o framework gera sozinho fora da convenção, declaradas pelo nome
// e pelos documentos, sem forma: fora do App Router nenhuma fonte única
// classifica a forma. Qualquer outra rota fora da convenção reprova.
const FRAMEWORK_ROUTES: Readonly<Record<string, readonly string[]>> = {
  "/404": ["server/pages/404.html"],
  "/500": ["server/pages/500.html"],
};

// O documento da rota raiz, sobre o qual as afirmações da moldura são feitas.
const ROOT_DOCUMENT = "server/app/index.html";

// Os três artefatos de onde a lista de rotas e a forma são lidas. São internos
// ao framework, como o caminho do documento: por isso a ausência reprova e o
// formato é conferido.
const APP_ROUTES_MANIFEST = "app-path-routes-manifest.json";
const PAGES_MANIFEST = "server/pages-manifest.json";
const PRERENDER_MANIFEST = "prerender-manifest.json";
const PRERENDER_MANIFEST_VERSION = 4;

// O atributo pelo qual a camada de tokens aceita um tema imposto. A aplicação
// não o usa, e nenhum script que ela emite pode conhecê-lo.
const THEME_ATTRIBUTE = "data-theme";

const MAIN_ROLE_TAG = "main";
const BANNER_ROLE_TAG = "header";
const NAVIGATION_ROLE_TAG = "nav";

// O que o navegador põe na ordem de tabulação. `tabindex="-1"` fica fora: é
// focalizável por fragmento, e de propósito não por tabulação.
const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function collectFiles(dir: string, extension: string, found: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectFiles(fullPath, extension, found);
    } else if (fullPath.endsWith(extension)) {
      found.push(fullPath);
    }
  }
}

function emittedPath(fullPath: string): string {
  return relative(BUILD_DIR, fullPath).split(sep).join("/");
}

// Toda leitura de artefato passa por aqui, e a ausência reprova nomeando o
// caminho procurado. Nenhuma afirmação sobre o documento emitido pula, em
// nenhuma circunstância: uma afirmação que pula quando não acha o arquivo
// transforma quebra em silêncio.
function readEmitted(documentPath: string): string {
  const fullPath = join(BUILD_DIR, documentPath);
  if (!existsSync(fullPath)) {
    throw new Error(
      `artefato emitido não encontrado: ${emittedPath(fullPath)} (procurado em ${fullPath})`,
    );
  }
  return readFileSync(fullPath, "utf8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unrecognized(manifestPath: string, detail: string): Error {
  return new Error(`formato não reconhecido em ${manifestPath}: ${detail}`);
}

// Todo manifesto é lido por aqui, sobre `readEmitted`: a ausência reprova
// nomeando o caminho, e nunca vira lista vazia. Uma lista de rotas vazia por
// padrão passaria verde sem rota nenhuma para comparar.
function readManifest(manifestPath: string): unknown {
  const text = readEmitted(manifestPath);
  try {
    return JSON.parse(text);
  } catch {
    throw unrecognized(manifestPath, "o conteúdo não é JSON");
  }
}

// Os manifestos de rota não declaram versão: o formato conferido é a forma do
// valor, um objeto de cadeias.
function readStringMap(manifestPath: string): Readonly<Record<string, string>> {
  const manifest = readManifest(manifestPath);
  if (!isRecord(manifest)) {
    throw unrecognized(manifestPath, "esperado um objeto de cadeias");
  }
  const map: Record<string, string> = {};
  for (const [key, value] of Object.entries(manifest)) {
    if (typeof value !== "string") {
      throw unrecognized(
        manifestPath,
        `esperado um objeto de cadeias; ${key} vale ${JSON.stringify(value)}`,
      );
    }
    map[key] = value;
  }
  return map;
}

// As rotas da convenção de rotas da aplicação, página ou não.
function conventionRoutes(): string[] {
  return Object.values(readStringMap(APP_ROUTES_MANIFEST));
}

// As rotas fora da convenção.
function outsideRoutes(): string[] {
  return Object.keys(readStringMap(PAGES_MANIFEST));
}

interface Prerendered {
  // Rotas que a construção classificou como pré-renderizadas.
  routes: ReadonlySet<string>;
  // Rotas com parâmetro pré-renderizadas para uma lista, com o que a
  // construção faz com o valor fora dela.
  fallbacks: ReadonlyMap<string, unknown>;
}

// A classificação da construção, e a única fonte da forma. Pré-renderizada é
// a rota que aparece como `srcRoute` de uma entrada de `routes`, ou como chave
// de `dynamicRoutes`. Documento nunca entra neste cálculo: uma rota de
// metadados é pré-renderizada e não emite documento.
function readPrerendered(): Prerendered {
  const manifest = readManifest(PRERENDER_MANIFEST);
  if (!isRecord(manifest)) {
    throw unrecognized(PRERENDER_MANIFEST, "esperado um objeto");
  }
  if (manifest.version !== PRERENDER_MANIFEST_VERSION) {
    throw unrecognized(
      PRERENDER_MANIFEST,
      `versão encontrada ${JSON.stringify(manifest.version)}; reconhecida ${PRERENDER_MANIFEST_VERSION}`,
    );
  }
  const { routes, dynamicRoutes } = manifest;
  if (!isRecord(routes) || !isRecord(dynamicRoutes)) {
    throw unrecognized(
      PRERENDER_MANIFEST,
      "esperados os objetos routes e dynamicRoutes",
    );
  }

  // `srcRoute` nulo é o de uma página fora da convenção pré-renderizada por
  // função de dados — observado; ela não tem forma a ler aqui, e a lista de
  // rotas já a reprova.
  const prerendered = new Set<string>();
  for (const [path, entry] of Object.entries(routes)) {
    if (
      !isRecord(entry) ||
      (typeof entry.srcRoute !== "string" && entry.srcRoute !== null)
    ) {
      throw unrecognized(
        PRERENDER_MANIFEST,
        `routes["${path}"] sem srcRoute em cadeia ou nulo`,
      );
    }
    if (entry.srcRoute !== null) prerendered.add(entry.srcRoute);
  }

  const fallbacks = new Map<string, unknown>();
  for (const [route, entry] of Object.entries(dynamicRoutes)) {
    if (!isRecord(entry) || !("fallback" in entry)) {
      throw unrecognized(
        PRERENDER_MANIFEST,
        `dynamicRoutes["${route}"] sem fallback`,
      );
    }
    prerendered.add(route);
    fallbacks.set(route, entry.fallback);
  }

  return { routes: prerendered, fallbacks };
}

function observedForm(route: string, prerendered: Prerendered): Form {
  return prerendered.routes.has(route) ? "prerendered" : "on-demand";
}

function declaredDocuments(): string[] {
  const fromRoutes = Object.values(DECLARED_ROUTES).flatMap((delivery) =>
    delivery.form === "prerendered" ? delivery.documents : [],
  );
  return [...fromRoutes, ...Object.values(FRAMEWORK_ROUTES).flat()];
}

function difference(left: Iterable<string>, right: Iterable<string>): string[] {
  const exclude = new Set(right);
  return [...new Set(left)].filter((item) => !exclude.has(item)).sort();
}

function parse(html: string): Document {
  const window = new Window();
  window.document.write(html);
  return window.document as unknown as Document;
}

function rootDocument(): Document {
  return parse(readEmitted(ROOT_DOCUMENT));
}

function describeElement(element: Element): string {
  const id = element.id === "" ? "" : `#${element.id}`;
  return `<${element.tagName.toLowerCase()}${id}>`;
}

// Rotas construídas são as declaradas — a lista de rotas que a construção
// produz, nos dois sentidos, dentro e fora da convenção. Uma rota fora da
// convenção declarada com forma reprova pelos dois lados: não é produzida pela
// convenção, e fora dela não é das geradas pelo framework.
test("a construção produz exatamente as rotas declaradas", () => {
  const convention = conventionRoutes();
  const outside = outsideRoutes();

  // Os dois sentidos são afirmados sem interromper um ao outro: quando os dois
  // divergem, a falha nomeia os dois lados.
  expect
    .soft(
      difference(convention, Object.keys(DECLARED_ROUTES)),
      "rota produzida e não declarada",
    )
    .toEqual([]);
  expect
    .soft(
      difference(Object.keys(DECLARED_ROUTES), convention),
      "rota declarada e não produzida pela convenção de rotas da aplicação",
    )
    .toEqual([]);
  expect
    .soft(
      difference(outside, Object.keys(FRAMEWORK_ROUTES)),
      "rota fora da convenção de rotas da aplicação que não é das geradas pelo framework",
    )
    .toEqual([]);
  expect
    .soft(
      difference(Object.keys(FRAMEWORK_ROUTES), outside),
      "rota gerada pelo framework declarada e não produzida",
    )
    .toEqual([]);
});

// A forma observada, lida só da classificação da construção, é a declarada.
test("cada rota é entregue na forma declarada", () => {
  const prerendered = readPrerendered();
  const produced = new Set(conventionRoutes());

  // Rota declarada e não produzida não tem forma observada: a lista de rotas já
  // a reprova.
  const divergent = Object.entries(DECLARED_ROUTES)
    .filter(([route]) => produced.has(route))
    .map(([route, delivery]) => ({
      route,
      declared: delivery.form,
      observed: observedForm(route, prerendered),
    }))
    .filter(({ declared, observed }) => declared !== observed)
    .map(
      ({ route, declared, observed }) =>
        `${route}: declarada ${FORM_LABEL[declared]}, observada ${FORM_LABEL[observed]}`,
    );
  expect(divergent, "forma divergente da declarada").toEqual([]);
});

// A forma mista — pré-renderizada para uma lista de valores e resolvida por
// requisição fora dela — reprova, declarada ou não. Observado: lista aberta dá
// `fallback: null`; lista fechada dá `fallback: false`.
test("nenhuma rota com parâmetro é resolvida por requisição fora da lista pré-renderizada", () => {
  const mixed = [...readPrerendered().fallbacks]
    .filter(([, fallback]) => fallback !== false)
    .map(
      ([route, fallback]) => `${route} (fallback ${JSON.stringify(fallback)})`,
    )
    .sort();
  expect(
    mixed,
    "rota pré-renderizada para uma lista e resolvida por requisição fora dela",
  ).toEqual([]);
});

// Documentos emitidos são os declarados — o conjunto de `.html` sob `.next/` e
// a união das listas declaradas, nos dois sentidos, caminho a caminho.
test("a construção emite exatamente os documentos declarados", () => {
  const found: string[] = [];
  collectFiles(BUILD_DIR, ".html", found);
  const emitted = found.map(emittedPath);
  const declared = declaredDocuments();

  // Os dois sentidos são afirmados sem interromper um ao outro.
  expect
    .soft(difference(emitted, declared), "documento emitido e não declarado")
    .toEqual([]);
  expect
    .soft(difference(declared, emitted), "documento declarado e não emitido")
    .toEqual([]);
});

// Cada forma de entrega é exercitada pela árvore.
test("cada forma de entrega tem ao menos uma rota declarada", () => {
  const declaredForms = new Set(
    Object.values(DECLARED_ROUTES).map((delivery) => delivery.form),
  );
  const unexercised = FORMS.filter((form) => !declaredForms.has(form)).map(
    (form) => FORM_LABEL[form],
  );
  expect(unexercised, "forma de entrega sem rota declarada").toEqual([]);
});

// 5.4 — o documento da rota raiz existe, e a ausência reprova com o caminho.
test("a rota raiz emite documento", () => {
  expect(existsSync(join(BUILD_DIR, ROOT_DOCUMENT)), ROOT_DOCUMENT).toBe(true);
  expect(readEmitted(ROOT_DOCUMENT).length).toBeGreaterThan(0);
});

// 5.6 — o idioma declarado no elemento raiz do documento entregue.
test("o elemento raiz do documento emitido declara pt-BR", () => {
  const lang = rootDocument().documentElement.getAttribute("lang");
  expect(lang, `idioma encontrado: ${lang}; exigido: pt-BR`).toBe("pt-BR");
});

// 5.7 — nenhum tema fixado no documento, e nenhum script que conheça o
// atributo. A folha de estilo da camada de tokens fica fora da varredura: as
// regras que ela entrega são o mecanismo do tema, e o requisito seguinte exige
// que elas cheguem.
test("o elemento raiz do documento emitido não declara tema", () => {
  const theme = rootDocument().documentElement.getAttribute(THEME_ATTRIBUTE);
  expect(theme, `tema encontrado no elemento raiz: ${theme}`).toBeNull();
});

test("nenhum script emitido menciona o atributo de tema", () => {
  const scripts: string[] = [];
  collectFiles(BUILD_DIR, ".js", scripts);
  expect(
    scripts.length,
    "nenhum script emitido foi encontrado",
  ).toBeGreaterThan(0);
  const mentioning = scripts
    .filter((file) => readFileSync(file, "utf8").includes(THEME_ATTRIBUTE))
    .map(emittedPath);
  expect(mentioning).toEqual([]);
});

// 5.8 — as regras dos dois temas chegam no estilo que o documento entrega,
// seguidas pela referência que ele carrega ou pelo estilo embutido nele.
function deliveredStyle(document: Document): string {
  const embedded = [...document.querySelectorAll("style")]
    .map((element) => element.textContent ?? "")
    .join("\n");
  const referenced = [
    ...document.querySelectorAll('link[rel="stylesheet"]'),
  ].map((element) => {
    const href = element.getAttribute("href") ?? "";
    // O caminho é servido a partir de `.next/`: `/_next/x` é `x` no artefato.
    return readEmitted(href.replace(/^\/_next\//, ""));
  });
  return [embedded, ...referenced].join("\n");
}

test("o estilo entregue contém as regras dos dois temas", () => {
  const style = deliveredStyle(rootDocument());
  const light = /:root\s*\{/.test(style);
  const dark = /prefers-color-scheme\s*:\s*dark/.test(style);
  expect(light, "regra do tema claro (:root) no estilo entregue").toBe(true);
  expect(
    dark,
    "regra do tema escuro (prefers-color-scheme: dark) no estilo entregue",
  ).toBe(true);
});

// 5.9 — as regiões da moldura, e a que não pode existir.
test("o documento emitido contém as duas regiões e nenhuma navegação", () => {
  const document = rootDocument();

  const banner = document.querySelector(BANNER_ROLE_TAG);
  expect(banner, "região de cabeçalho").not.toBeNull();
  expect(banner?.textContent).toContain("ChargeBR");

  const main = document.querySelector(MAIN_ROLE_TAG);
  expect(main, "região de conteúdo principal").not.toBeNull();

  const navigation = document.querySelector(NAVIGATION_ROLE_TAG);
  expect(
    navigation === null,
    navigation === null
      ? "sem região de navegação"
      : `região de navegação encontrada: ${describeElement(navigation)}`,
  ).toBe(true);
});

// 5.10 — o salto é o primeiro focalizável, e seu destino é a região de
// conteúdo presente no mesmo documento.
test("o primeiro focalizável do documento emitido é o salto para o conteúdo", () => {
  const document = rootDocument();
  const focusable = [...document.querySelectorAll(FOCUSABLE)];
  const first = focusable[0];
  expect(first, "a moldura não tem elemento focalizável").toBeDefined();
  if (first === undefined) return;

  expect(
    first.tagName.toLowerCase(),
    `${describeElement(first)} precede o salto`,
  ).toBe("a");

  const target = first.getAttribute("href") ?? "";
  expect(target.startsWith("#"), `destino do salto: ${target}`).toBe(true);

  const main = document.querySelector(MAIN_ROLE_TAG);
  expect(main, "região de conteúdo principal").not.toBeNull();
  expect(
    main?.id,
    `destino do salto ${target} e região de conteúdo #${main?.id}`,
  ).toBe(target.slice(1));
});
