import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parseAneelIndexPage,
  validateAndNormalizeAneelDetail,
} from "../../src/collector/aneel-html.js";

const BASE_URL = "https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425&page=1";
const DETAIL_PATH = "/aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm";
const PAGE_PATH = "/aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm";

function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}

test("literal ANEEL index fixture preserves identity, date, title, and canonical URL", () => {
  const result = parseAneelIndexPage(
    fixture("aneel-index-final.html"),
    BASE_URL,
    1,
    15,
    "Próximas 15 >>",
    PAGE_PATH,
    DETAIL_PATH,
  );
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error(result.message);
  assert.equal(result.value.nextPageUrl, null);
  assert.deepEqual(result.value.items.map(({ idNoticia, publishedDate }) => ({
    idNoticia,
    publishedDate,
  })), [
    { idNoticia: 14810, publishedDate: "2026-09-22" },
    { idNoticia: 14809, publishedDate: "2026-09-15" },
  ]);
  assert.equal(
    result.value.items[0]?.canonicalUrl,
    "https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm?idAreaNoticia=425&idNoticia=14810",
  );
});

test("non-final literal index fixture must retain the observed 15-item page size", () => {
  const result = parseAneelIndexPage(
    fixture("aneel-index-with-short-next-page.html"),
    BASE_URL,
    1,
    15,
    "Próximas 15 >>",
    PAGE_PATH,
    DETAIL_PATH,
  );
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("negative fixture unexpectedly passed");
  assert.match(result.message, /page size/u);
});

test("literal ANEEL detail fixture excludes volatile regions and sorts approved PDF references", () => {
  const index = parseAneelIndexPage(
    fixture("aneel-index-final.html"),
    BASE_URL,
    1,
    15,
    "Próximas 15 >>",
    PAGE_PATH,
    DETAIL_PATH,
  );
  assert.equal(index.ok, true);
  if (!index.ok || index.value.items[0] === undefined) throw new Error("invalid index fixture");

  const result = validateAndNormalizeAneelDetail(
    fixture("aneel-detail-14810.html"),
    index.value.items[0],
  );
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error(result.message);
  assert.equal(result.value.normalized.editorial_text.includes("Menu variável"), false);
  assert.equal(result.value.normalized.editorial_text.includes("conteudoVolatil"), false);
  assert.deepEqual(result.value.normalized.document_references, [
    "https://biblioteca.aneel.gov.br/documentos/ata-14810.pdf",
    "https://www2.aneel.gov.br/documentos/pauta-14810.pdf",
  ]);
  assert.deepEqual(result.value.identity, { idNoticia: 14810 });
  assert.match(result.value.fingerprint, /^[0-9a-f]{64}$/u);
});

test("detail HTML without the approved editorial region fails closed", () => {
  const index = parseAneelIndexPage(
    fixture("aneel-index-final.html"),
    BASE_URL,
    1,
    15,
    "Próximas 15 >>",
    PAGE_PATH,
    DETAIL_PATH,
  );
  assert.equal(index.ok, true);
  if (!index.ok || index.value.items[0] === undefined) throw new Error("invalid index fixture");
  const result = validateAndNormalizeAneelDetail(
    fixture("aneel-detail-invalid.html"),
    index.value.items[0],
  );
  assert.equal(result.ok, false);
});
