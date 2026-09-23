import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";
import { expect, test } from "vitest";

const APP_ROOT = fileURLToPath(new URL("../", import.meta.url));
const BUILD_DIR = join(APP_ROOT, ".next");

// O conjunto de documentos que a construção emite. Não é suposto: é o que a
// execução registrada na tarefa 5.2 observou, caminho a caminho. Acrescentar
// rota passa a ser ato deliberado — sem uma linha aqui, a verificação reprova.
//
// Os quatro que não são a rota raiz são documentos de erro do próprio
// framework, e entram na declaração pela mesma razão que a rota raiz: o que a
// construção emite é o que a declaração precisa cobrir, senão a comparação
// precisaria de um filtro, e um filtro é onde uma rota nova se esconde.
const DECLARED_DOCUMENTS: readonly string[] = [
  "server/app/index.html",
  "server/app/_global-error.html",
  "server/app/_not-found.html",
  "server/pages/404.html",
  "server/pages/500.html",
];

// O documento da rota raiz, que é a única rota desta aplicação.
const ROOT_DOCUMENT = "server/app/index.html";

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

// 5.3 — o conjunto emitido e o declarado são o mesmo, nos dois sentidos.
test("a construção emite exatamente os documentos declarados", () => {
  const found: string[] = [];
  collectFiles(BUILD_DIR, ".html", found);
  const emitted = found.map(emittedPath).sort();
  const declared = [...DECLARED_DOCUMENTS].sort();

  const undeclared = emitted.filter((path) => !declared.includes(path));
  expect(undeclared, "documento emitido e não declarado").toEqual([]);

  const missing = declared.filter((path) => !emitted.includes(path));
  expect(missing, "documento declarado e não emitido").toEqual([]);
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
