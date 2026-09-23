import type { FixtureOrigin } from "../../fixture-origin";
import type { AxisStatuses } from "../status-panel/status-panel";
import type {
  EvidencePath,
  ValueWithProvenanceProps,
} from "../value-with-provenance/value-with-provenance";
import type { BlockedProjectionProps } from "../blocked-projection/blocked-projection";

// Fixtures das histórias das primitivas, derivadas da saída real do contrato
// de leitura `chargebr-methodology-reading-v1` para a carga canônica 0007
// (ABVE, veículos leves eletrificados, janeiro de 2025). Nada aqui foi
// inventado: cada campo diz de onde veio, na forma
// `<projeção>.<caminho no payload>`, e o valor é o que o contrato lê de
// data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql.
//
// A saída de referência está registrada em docs/revisao-contrato-leitura-0001.md
// (execução de 11 de setembro de 2026: três projeções `complete`) e a consulta
// em queries/0001_abve-eletrificados-janeiro-2025.read.sql. Este arquivo copia
// valores; não importa nada dali — a forma é a da biblioteca.
//
// Onde o contrato NÃO produz um campo, a fixture não o inventa: diz que ele
// não vem do contrato e de onde a variante que o traz o tirou.

export const FIXTURE_ORIGIN: FixtureOrigin = "contract";
export const FIXTURE_ORIGIN_NOTE =
  "Saída do contrato de leitura chargebr-methodology-reading-v1 para a carga canônica 0007, registrada em docs/revisao-contrato-leitura-0001.md; STATUSES_FROM_LOAD e os ensaios de bloqueio anotam sua própria origem no ponto em que são declarados.";

// as_published.values[*].evidence[0].publication.url — a mesma publicação
// sustenta o principal, o contrafactual e o contexto (evidências
// canonical-0007-abve-resultado-metodologia-vigente,
// canonical-0007-abve-contrafactual-criterio-anterior e
// canonical-0007-abve-contexto-mhev-janeiro-2025 apontam para o mesmo
// content_item). O nome do caminho é composto por quem consome a partir de
// evidence[0].source.name, evidence[0].publication.published_on e
// evidence[0].publication.title; a composição abaixo é a escolha da bancada.
const RESULT_PUBLICATION: EvidencePath = {
  href: "https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/",
  label:
    "ABVE, 10 de fevereiro de 2025: ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números",
};

// Projeção `as_published`, que preserva os três papéis publicados.
export const AS_PUBLISHED: ValueWithProvenanceProps = {
  // as_published.values[value_role = primary].value = 12556
  // (metric_values, observação canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente)
  primary: { value: 12556, evidence: RESULT_PUBLICATION },
  // as_published.values[value_role = counterfactual].value = 16502
  // (metric_values, observação canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior)
  counterfactual: { value: 16502, evidence: RESULT_PUBLICATION },
  // as_published.documentary_context[0].source_claim — o contexto MHEV é
  // observação com is_metric_value = false: o contrato entrega a redação e
  // nenhum campo numérico, e por isso a primitiva o recebe como texto. A
  // redação original (source_claim) é a usada, nunca a normalizada no lugar.
  context: {
    text: "Os MHEV totalizaram 3.946 unidades em janeiro de 2025, sendo 2.883 MHEV de 12 V e 1.063 MHEV de 48 V.",
    evidence: RESULT_PUBLICATION,
  },
};

// Projeção `current_methodology`: só o resultado principal pela metodologia
// vigente. current_methodology.value.value = 12556, mesma evidência.
export const CURRENT_METHODOLOGY: ValueWithProvenanceProps = {
  primary: AS_PUBLISHED.primary,
};

// Estados dos três eixos, tal como o contrato os projeta para o valor
// principal.
// - verification_level: as_published.values[primary].evidence[0].events[0].verification_level
//   = confirmed (evento canonical-0007-abve-publica-eletrificados-janeiro-2025-2025-02-10)
// - workflow_status: o mesmo evento, workflow_status = accepted
// - normalization_status: o contrato não projeta este campo — `observation`
//   carrega source_claim, normalized_claim, observation_date, geography e
//   source_term, e nenhum estado de normalização. Derivada da saída do
//   contrato, a fixture o declara sem valor.
export const STATUSES_FROM_CONTRACT: AxisStatuses = {
  verification_level: "confirmed",
  workflow_status: "accepted",
  normalization_status: null,
};

// A mesma leitura completada pela carga, não pelo contrato: a observação
// canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente é
// gravada com normalization_status = normalized em
// data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql.
// Serve à história em que os três eixos têm valor; a origem é a carga.
export const STATUSES_FROM_LOAD: AxisStatuses = {
  ...STATUSES_FROM_CONTRACT,
  normalization_status: "normalized",
};

// Bloqueios registrados. Para a carga 0007 o contrato não bloqueia; os
// ensaios de bloqueio em docs/revisao-contrato-leitura-0001.md variaram a
// própria consulta, sem escrita, e registraram a linha `control` com
// projection_status = blocked, payload null e estes `blockers`. Os códigos
// do contrato estão traduzidos para as razões da biblioteca, em minúsculas.
export const BLOCKED_TRIALS: Record<
  "provenanceIncomplete" | "metricNotFound" | "ambiguousCurrentMethodology",
  BlockedProjectionProps
> = {
  // Ensaio "Proveniência incompleta": blockers = [PROVENANCE_INCOMPLETE]
  provenanceIncomplete: { reasons: ["provenance_incomplete"] },
  // Ensaio "Métrica ausente": blockers = [CURRENT_METHODOLOGY_NOT_UNIQUE,
  // METRIC_NOT_FOUND, PRIMARY_VALUE_NOT_UNIQUE, UNEXPECTED_CARDINALITY]
  metricNotFound: {
    reasons: [
      "current_methodology_not_unique",
      "metric_not_found",
      "primary_value_not_unique",
      "unexpected_cardinality",
    ],
  },
  // Ensaio "Metodologia vigente ambígua": blockers = [COMPONENTS_INCOMPLETE,
  // CURRENT_METHODOLOGY_NOT_UNIQUE, PROVENANCE_INCOMPLETE, UNEXPECTED_CARDINALITY]
  ambiguousCurrentMethodology: {
    reasons: [
      "components_incomplete",
      "current_methodology_not_unique",
      "provenance_incomplete",
      "unexpected_cardinality",
    ],
  },
};
