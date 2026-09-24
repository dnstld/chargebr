import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { ValidatedAbvePost } from "../../src/collector/abve-post.js";
import type { AbveRefetchResponseEvidence } from "../../src/extractor/abve-refetch.js";
import type { PreparedAbveHandoff } from "../../src/extractor/handoff.js";
import type { AbveExtractionPackageV1 } from "../../src/extractor/package.js";
import {
  ABVE_PILOT_CANONICAL_URL,
  AbvePilotExtractionError,
  createAbvePilotPackage,
  createAbvePilotPayload,
} from "../../src/extractor/pilot.js";

const producedFixture = await loadFixture("abve-package-produced-v1.json");
const noCandidatesFixture = await loadFixture("abve-package-no-candidates-v1.json");

const PILOT_HTML = [
  "<p>Em julho de 2026, o mercado brasileiro de veículos leves manteve sua expansão.</p>",
  "<p><strong>Os BEV lideraram, com 25.782 unidades</strong>, enquanto outras tecnologias tiveram resultados distintos.</p>",
  "<p>Na comparação anual, os emplacamentos de veículos 100% elétricos passaram de 7.010 para 25.782 unidades.</p>",
  "<p>A participação chegou a 21%, o acumulado cresceu e a projeção anual foi revista.</p>",
].join("\n");

function pilotPost(content = PILOT_HTML): ValidatedAbvePost {
  return {
    identity: { id: 19617 },
    canonicalUrl: ABVE_PILOT_CANONICAL_URL,
    normalized: {
      date: "2026-08-11T17:09:21",
      modified: "2026-08-26T14:07:23",
      slug: "eletrificados-conquistam-21-de-participacao-de-mercado-em-julho",
      canonical_url: ABVE_PILOT_CANONICAL_URL,
      title: {
        rendered:
          "Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026",
      },
      excerpt: { rendered: "<p>Resumo público.</p>", protected: false },
      content: { rendered: content, protected: false },
    },
    fingerprint: producedFixture.payload.input.expected_content_fingerprint,
    publicationDateGmt: "2026-08-11T20:09:21",
    publicationInstant: Date.parse("2026-08-11T20:09:21Z"),
  };
}

function pilotHandoff(content = PILOT_HTML): PreparedAbveHandoff {
  return {
    run_key: producedFixture.envelope.run_key,
    extraction_input: producedFixture.payload.input,
    classification: "new",
    post: pilotPost(content),
    response: {
      request_url: `${ABVE_PILOT_CANONICAL_URL}?context=view`,
      attempt_count: 1,
      status_code: 200,
      content_type: "application/json",
      byte_length: 1234,
      response_body_sha256: "c".repeat(64),
    } satisfies AbveRefetchResponseEvidence,
  };
}

test("pilot extraction reproduces the approved deterministic payload", () => {
  const payload = createAbvePilotPayload(pilotHandoff());
  assert.deepEqual(payload, producedFixture.payload);
  assert.equal(payload.observation_candidates.length, 1);
  assert.equal(payload.observation_candidates[0]?.normalized_value, 25_782);
});

test("pilot package builder reproduces the approved package fixture", () => {
  const extractionPackage = createAbvePilotPackage({
    handoff: pilotHandoff(),
    extractor_version: producedFixture.envelope.extractor_version,
    started_at: producedFixture.envelope.started_at,
    duration_ms: producedFixture.envelope.duration_ms,
  });
  assert.deepEqual(extractionPackage, producedFixture);
});

test("the absent claim reproduces the approved no-candidates payload", () => {
  const payload = createAbvePilotPayload(
    pilotHandoff(
      "<p>O ano de 2026 já pode ser considerado como um dos marcos do avanço da eletromobilidade no país.</p>",
    ),
  );
  assert.deepEqual(payload, noCandidatesFixture.payload);
});

test("value, subject, unit, period, and geography evidence are all required", async (context) => {
  const mutations = [
    ["value", ["25.782", "25.783"]],
    ["subject", ["BEV", "PHEV"]],
    ["unit", ["unidades", "registros"]],
    ["period", ["julho de 2026", "agosto de 2026"]],
    ["geography", ["brasileiro", "argentino"]],
    ["vehicle scope", ["veículos leves", "veículos pesados"]],
  ] as const;

  for (const [name, [before, after]] of mutations) {
    await context.test(name, () => {
      const payload = createAbvePilotPayload(pilotHandoff(PILOT_HTML.replaceAll(before, after)));
      assert.equal(payload.observation_candidates.length, 0);
      assert.equal(payload.aggregate_counts.observation_candidates, 0);
      assert.equal(payload.content_item_candidate.evidentiary_excerpt.includes("25.782 unidades"), false);
    });
  }
});

test("percentage, growth, accumulated values, and projections never enter the pilot candidate", () => {
  const candidate = createAbvePilotPayload(pilotHandoff()).observation_candidates[0];
  assert.ok(candidate);
  const serialized = JSON.stringify(candidate);
  for (const excluded of ["21%", "acumulado cresceu", "projeção anual", "450 mil"]) {
    assert.equal(serialized.includes(excluded), false);
  }
});

test("no-candidates preserves only a bounded minimum content excerpt", () => {
  const longSentence = `Sem afirmação quantitativa ${"x".repeat(400)}.`;
  const payload = createAbvePilotPayload(pilotHandoff(`<p>${longSentence}</p>`));
  assert.equal(payload.observation_candidates.length, 0);
  assert.equal([...payload.content_item_candidate.evidentiary_excerpt].length, 320);
  assert.equal(payload.content_item_candidate.evidentiary_excerpt.endsWith("…"), true);
});

test("HTML markup and numeric entities do not change the explicit evidence", () => {
  const handoff = pilotHandoff(PILOT_HTML.replace("25.782", "25&#46;782"));
  const payload = createAbvePilotPayload(handoff);
  assert.equal(payload.observation_candidates.length, 1);
});

test("the rule refuses another item or an unproven fingerprint", () => {
  const otherItem = pilotHandoff();
  const otherPost = { ...otherItem.post, identity: { id: 19618 } };
  assert.throws(
    () => createAbvePilotPayload({ ...otherItem, post: otherPost }),
    (error: unknown) =>
      error instanceof AbvePilotExtractionError && error.code === "pilot_item_mismatch",
  );

  const drifted = pilotHandoff();
  const driftedPost = { ...drifted.post, fingerprint: "b".repeat(64) };
  assert.throws(
    () => createAbvePilotPayload({ ...drifted, post: driftedPost }),
    (error: unknown) =>
      error instanceof AbvePilotExtractionError && error.code === "pilot_item_mismatch",
  );
});

test("protected or empty pilot content blocks instead of emitting a partial candidate", () => {
  const protectedHandoff = pilotHandoff();
  const protectedPost: ValidatedAbvePost = {
    ...protectedHandoff.post,
    normalized: {
      ...protectedHandoff.post.normalized,
      content: { rendered: PILOT_HTML, protected: true },
    },
  };
  for (const handoff of [
    { ...protectedHandoff, post: protectedPost },
    pilotHandoff("<script>hidden()</script>"),
  ]) {
    assert.throws(
      () => createAbvePilotPayload(handoff),
      (error: unknown) =>
        error instanceof AbvePilotExtractionError &&
        error.code === "pilot_content_unavailable",
    );
  }
});

async function loadFixture(name: string): Promise<AbveExtractionPackageV1> {
  return JSON.parse(
    await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"),
  ) as AbveExtractionPackageV1;
}
