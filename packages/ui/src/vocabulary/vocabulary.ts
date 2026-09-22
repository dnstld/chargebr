import type { Status, StatusAxis } from "../atoms/status-marker/status-marker";
import type { ValueRole } from "../atoms/value-role";
import type { BlockReason } from "../domain/block-reason";

// Vocabulário: o único lugar do pacote onde os termos da metodologia viram
// texto de tela. As primitivas de domínio leem daqui por padrão; nenhuma
// declara rótulo em português no próprio arquivo (a verificação em
// tools/checks/domain-vocabulary.test.ts reprova quem declarar). Quem consome
// sobrescreve termo a termo, por propriedade, sem provedor de contexto.
//
// A completude é imposta pelo tipo: cada grupo exige um termo para cada
// valor que a biblioteca conhece — eixos, estados, papéis e razões.
export const VOCABULARY = {
  axis: {
    verification_level: "Verificação",
    workflow_status: "Fluxo",
    normalization_status: "Normalização",
  } satisfies Record<StatusAxis, string>,
  status: {
    confirmed: "Confirmado",
    corroborated: "Corroborado",
    unverified: "Não verificado",
    accepted: "Aceito",
    under_review: "Em revisão",
    candidate: "Candidato",
    normalized: "Normalizado",
    not_attempted: "Não tentado",
    unresolved: "Não resolvido",
  } satisfies Record<Status, string>,
  valueRole: {
    primary: "Principal",
    counterfactual: "Contrafactual",
    context: "Contexto",
  } satisfies Record<ValueRole, string>,
  blockReason: {
    metric_not_found: "Métrica não encontrada",
    scope_mismatch: "Recorte divergente do contrato",
    methodology_missing: "Metodologia ausente",
    methodology_cycle: "Ciclo entre versões da metodologia",
    current_methodology_not_unique: "Metodologia vigente não é única",
    primary_value_not_unique: "Valor principal não é único",
    value_method_mismatch: "Valor sem metodologia correspondente",
    primary_outside_applicability:
      "Valor principal fora da vigência da metodologia",
    provenance_incomplete: "Proveniência incompleta",
    unsupported_value_origin: "Origem do valor não admitida",
    components_incomplete: "Componentes da metodologia incompletos",
    unexpected_cardinality: "Cardinalidade inesperada",
  } satisfies Record<BlockReason, string>,
  absence: {
    blockedProjection: "Projeção bloqueada",
    statusMissing: "Sem valor",
  },
} as const;

export type Vocabulary = typeof VOCABULARY;
export type VocabularyGroup = keyof Vocabulary;

/** Termos resolvidos: a mesma forma do vocabulário, com texto livre. */
export type Terms = {
  readonly [Group in VocabularyGroup]: {
    readonly [Term in keyof Vocabulary[Group]]: string;
  };
};

/** Sobrescrita termo a termo: qualquer subconjunto dos termos, por grupo. */
export type VocabularyOverrides = {
  readonly [Group in VocabularyGroup]?: {
    readonly [Term in keyof Vocabulary[Group]]?: string;
  };
};

const GROUPS = Object.keys(VOCABULARY) as readonly VocabularyGroup[];

// Um termo fornecido substitui o padrão; os demais permanecem. A resolução é
// rasa por grupo e não aceita termo fora do vocabulário: o tipo já o recusa,
// e em execução ele é ignorado.
export function resolveTerms(overrides?: VocabularyOverrides): Terms {
  const resolved: Record<string, Record<string, string>> = {};
  for (const group of GROUPS) {
    const defaults: Record<string, string> = VOCABULARY[group];
    const provided: Record<string, string | undefined> =
      overrides?.[group] ?? {};
    const terms: Record<string, string> = {};
    for (const [term, text] of Object.entries(defaults)) {
      terms[term] = provided[term] ?? text;
    }
    resolved[group] = terms;
  }
  return resolved as Terms;
}
