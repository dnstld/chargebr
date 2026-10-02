import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo
// (apps/backoffice/tests/).
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const PACKAGES_AREA = "packages";

// O arquivo da aplicação que importa todo subpath publicado. Ele existe para que
// a construção alcance cada um: resolver não é compilar, e a construção é o único
// oráculo — medido com o defeito que este ciclo conserta presente, a resolução
// pelo mapa de exportações devolvia 8 de 8 resolvidos, a importação em Node sob
// `tsx` errava nos dois sentidos, `tsc` passava, e só `next build` reprovava.
//
// Este teste roda no projeto que constrói, e é por isso que ele mora aqui: a
// construção já aconteceu no preparo (tests/build.setup.ts), de modo que um
// subpath que não resolva derruba a verificação antes de qualquer afirmação.
const CONSUMPTION_FILE = "apps/backoffice/app/prova/subpaths/route.ts";

// O que conta como módulo na travessia. Folha de estilo, imagem e módulo de
// estilo entram no conjunto alcançável como folha: são alvo legítimo de
// exportação, e não abrem caminho para seguir.
const MODULE_EXTENSIONS = [".ts", ".tsx"];

// Pacote do repositório. Especificador de outro pacote não é seguido na
// travessia: o `exports` dele já é percorrido por conta própria, e segui-lo aqui
// contaria o mesmo arquivo duas vezes.
const WORKSPACE_SCOPE = "@chargebr/";

// Sufixos de arquivo de prova: nenhum deles pode ser alcançável a partir de um
// alvo de exportação.
const BENCH_SUFFIXES = [
  ".stories.tsx",
  ".typecheck.tsx",
  ".test.ts",
  ".test.tsx",
];

interface Published {
  /** O especificador que um consumidor escreve. */
  specifier: string;
  /** O arquivo que o mapa de exportações aponta, relativo à raiz. */
  target: string;
  /** O pacote que publica. */
  pkg: string;
}

function workspacePackages(): string[] {
  let entries: string[];
  try {
    entries = readdirSync(join(ROOT, PACKAGES_AREA));
  } catch {
    return [];
  }
  return entries
    .filter((entry) =>
      existsSync(join(ROOT, PACKAGES_AREA, entry, "package.json")),
    )
    .map((entry) => `${PACKAGES_AREA}/${entry}`)
    .sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface Discovery {
  subpaths: Published[];
  problems: string[];
}

// O conjunto de subpaths publicados sai do mapa de exportações de cada pacote, e
// nunca de lista escrita à mão: subpath novo entra aqui sem ninguém editar este
// arquivo, e é a comparação com o que a aplicação importa que nomeia o que ficou
// sem prova. Pacote sem mapa de exportações, ou com mapa em formato não
// reconhecido, reprova nomeando o pacote — ausência não vira conjunto vazio.
function discover(): Discovery {
  const subpaths: Published[] = [];
  const problems: string[] = [];
  for (const pkg of workspacePackages()) {
    const manifestPath = join(ROOT, pkg, "package.json");
    let manifest: unknown;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      problems.push(`${pkg} — package.json não é JSON`);
      continue;
    }
    if (!isRecord(manifest) || typeof manifest.name !== "string") {
      problems.push(`${pkg} — package.json sem nome em cadeia`);
      continue;
    }
    const { exports: map, name } = manifest;
    if (!isRecord(map)) {
      problems.push(`${pkg} — sem mapa de exportações`);
      continue;
    }
    const keys = Object.keys(map);
    if (keys.length === 0) {
      problems.push(`${pkg} — mapa de exportações vazio`);
      continue;
    }
    for (const key of keys) {
      const target = map[key];
      if (typeof target !== "string") {
        problems.push(
          `${pkg} — alvo de ${key} não é cadeia: ${JSON.stringify(target)}`,
        );
        continue;
      }
      subpaths.push({
        specifier: key === "." ? name : `${name}${key.slice(1)}`,
        target: `${pkg}/${target.replace(/^\.\//, "")}`,
        pkg,
      });
    }
  }
  return { subpaths, problems };
}

function isModule(file: string): boolean {
  return MODULE_EXTENSIONS.some((extension) => file.endsWith(extension));
}

// Resolve um especificador relativo como o empacotador resolveria, inclusive a
// forma de módulo ES que nomeia `.js` para um arquivo `.ts` — a mesma forma que
// a construção da aplicação **não** resolve quando o arquivo não existe, e que foi
// o defeito deste ciclo.
function resolveRelative(fromFile: string, specifier: string): string | null {
  const base = resolve(dirname(join(ROOT, fromFile)), specifier);
  const candidates = [
    base,
    base.replace(/\.js$/, ".ts"),
    base.replace(/\.jsx$/, ".tsx"),
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return relative(ROOT, candidate).split(sep).join("/");
    }
  }
  return null;
}

interface Directive {
  file: string;
  line: number;
  text: string;
}

interface Reachable {
  files: Set<string>;
  directives: Directive[];
  unresolved: string[];
}

function lineOf(text: string, position: number): number {
  return text.slice(0, position).split("\n").length;
}

// Os arquivos alcançáveis a partir de um alvo de exportação, seguindo as
// importações relativas. É a mesma linha de alcance que define quais
// especificadores o ciclo consertou: um `exports` é a única porta de entrada que
// um consumidor tem, e o que ela alcança é o grafo publicado.
function walk(entry: Published, state: Reachable): void {
  const target = entry.target;
  if (!existsSync(join(ROOT, target))) {
    state.unresolved.push(`${entry.specifier} → ${target}`);
    return;
  }
  if (state.files.has(target)) return;
  state.files.add(target);
  if (!isModule(target)) return; // folha: estilo, imagem, módulo de estilo

  const text = readFileSync(join(ROOT, target), "utf8");
  const info = ts.preProcessFile(text, true, true);
  for (const reference of [
    ...info.typeReferenceDirectives,
    ...info.libReferenceDirectives,
    ...info.referencedFiles,
  ]) {
    state.directives.push({
      file: target,
      line: lineOf(text, reference.pos),
      text: reference.fileName,
    });
  }
  for (const imported of info.importedFiles) {
    const specifier = imported.fileName;
    if (!specifier.startsWith(".")) continue;
    const next = resolveRelative(target, specifier);
    if (next === null) {
      state.unresolved.push(`${target} → ${specifier}`);
      continue;
    }
    walk({ specifier: entry.specifier, target: next, pkg: entry.pkg }, state);
  }
}

function reachable(subpaths: Published[]): Reachable {
  const state: Reachable = {
    files: new Set(),
    directives: [],
    unresolved: [],
  };
  for (const entry of subpaths) walk(entry, state);
  return state;
}

// Os especificadores de pacote do repositório que o arquivo de consumo importa,
// lidos pela árvore sintática e não por expressão regular.
function consumedSpecifiers(): string[] {
  const text = readFileSync(join(ROOT, CONSUMPTION_FILE), "utf8");
  const info = ts.preProcessFile(text, true, true);
  return [
    ...new Set(
      info.importedFiles
        .map((imported) => imported.fileName)
        .filter((specifier) => specifier.startsWith(WORKSPACE_SCOPE)),
    ),
  ].sort();
}

function difference(left: Iterable<string>, right: Iterable<string>): string[] {
  const exclude = new Set(right);
  return [...new Set(left)].filter((item) => !exclude.has(item)).sort();
}

test("todo pacote sob packages/ publica um mapa de exportações reconhecido", () => {
  const { problems, subpaths } = discover();
  expect(problems, "pacote sem mapa de exportações utilizável").toEqual([]);
  // Conjunto vazio passa calado: sem esta afirmação, a comparação dos dois
  // sentidos ficaria verde sem ter olhado subpath nenhum.
  expect(
    subpaths.length,
    "nenhum subpath publicado foi descoberto",
  ).toBeGreaterThan(0);
  console.log(
    `subpaths publicados descobertos: ${subpaths.length} (${subpaths
      .map((entry) => entry.specifier)
      .sort()
      .join(", ")})`,
  );
});

test("o arquivo de consumo importa exatamente os subpaths publicados", () => {
  const published = discover().subpaths.map((entry) => entry.specifier);
  const consumed = consumedSpecifiers();

  // Os dois sentidos são afirmados sem interromper um ao outro: quando os dois
  // divergem, a falha nomeia os dois lados.
  expect
    .soft(
      difference(published, consumed),
      "subpath publicado que o arquivo de consumo não importa",
    )
    .toEqual([]);
  expect
    .soft(
      difference(consumed, published),
      "subpath importado pelo arquivo de consumo que nenhum pacote publica",
    )
    .toEqual([]);
});

test("a travessia do grafo publicado alcança arquivo em todo pacote", () => {
  const { subpaths } = discover();
  const state = reachable(subpaths);

  expect(
    state.unresolved,
    "alvo de exportação ou importação relativa que não resolve",
  ).toEqual([]);
  expect(
    state.files.size,
    "conjunto alcançável vazio: a travessia não olhou arquivo nenhum",
  ).toBeGreaterThan(0);

  const empty = workspacePackages().filter(
    (pkg) => ![...state.files].some((file) => file.startsWith(`${pkg}/`)),
  );
  expect(empty, "pacote com conjunto alcançável vazio").toEqual([]);

  // O conjunto tem de cumprir o papel que o nome dele anuncia: grafo publicado, e
  // não bancada. Arquivo de história, de checagem de tipos ou de teste alcançável
  // a partir do `exports` significaria que um barril exporta prova — e aí a
  // proibição de diretiva passaria a cobrar da bancada, onde a afirmação sobre o
  // empacotador é verdadeira.
  const bench = [...state.files]
    .filter((file) => BENCH_SUFFIXES.some((suffix) => file.endsWith(suffix)))
    .sort();
  expect(bench, "arquivo de prova alcançável a partir do exports").toEqual([]);
  console.log(`arquivos alcançáveis a partir do exports: ${state.files.size}`);
});

// Nenhum arquivo alcançável declara diretiva de referência.
//
// O escopo é o **alcançável**, e não um diretório ou um nome de pacote, porque é
// isso que separa a afirmação verdadeira da afirmação que atravessa: diretiva num
// arquivo que um `exports` alcança entra no programa de tipos de **todo
// consumidor**. Medido: `/// <reference types="vite/client" />` em `logo.tsx`
// punha `vite/client.d.ts` no programa de tipos de `apps/backoffice`, e aquele
// arquivo declara `*.svg` como cadeia — foi essa declaração que certificou a
// atribuição de um objeto a uma referência de imagem e entregou a marca quebrada
// em três documentos. A mesma diretiva em `bench/optimize-deps.test.ts` não
// reprova aqui, e está certa onde está: a bancada **é** um consumidor Vite.
//
// Com a URL da marca chegando por propriedade, o `any` que o framework declara
// para `*.svg` sai do pacote — onde era afirmação sobre o empacotador de terceiros
// — e fica na aplicação, onde é afirmação dela sobre o próprio empacotador. É
// confinamento, não eliminação: a guarda do limite continua sendo a afirmação
// sobre a referência da marca em tests/emitted-document.test.ts.
//
// A proibição é de **qualquer** diretiva de referência, e não só da de tipos de
// empacotador: `lib` e `path` chegam ao programa do consumidor pelo mesmo
// caminho. Simplificar esta regra para "proíbe vite/client" perderia as duas.
test("nenhum arquivo alcançável pelo exports declara diretiva de referência", () => {
  const state = reachable(discover().subpaths);
  const declared = state.directives.map(
    ({ file, line, text }) => `${file}:${line} — referência a ${text}`,
  );
  expect(
    declared,
    "diretiva de referência em arquivo alcançável a partir do exports",
  ).toEqual([]);
});
