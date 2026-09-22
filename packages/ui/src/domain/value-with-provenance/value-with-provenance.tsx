import { EvidenceAnchor } from "../../atoms/evidence-anchor/evidence-anchor";
import { NumericValue } from "../../atoms/numeric-value/numeric-value";
import { Text } from "../../atoms/text/text";
import { VALUE_ROLES, type ValueRole } from "../../atoms/value-role";
import { VisuallyHidden } from "../../utilities/visually-hidden";
import {
  resolveTerms,
  type VocabularyOverrides,
} from "../../vocabulary/vocabulary";
import { definePrimitive } from "../contract";
import styles from "./value-with-provenance.module.css";

// Caminho até a evidência de um valor. É a forma da biblioteca: um destino e
// um nome que o identifica, e nada do contrato de leitura.
export interface EvidencePath {
  /** Destino do caminho. */
  href: string;
  /** Nome acessível do caminho: identifica a evidência a que leva. */
  label: string;
}

/** Número com proveniência. A proveniência é obrigatória no tipo. */
export interface ProvenancedNumber {
  value: number;
  evidence: EvidencePath;
  /** Opções de formatação; o padrão é a de pt-BR sem casa forçada. */
  format?: Intl.NumberFormatOptions;
}

/** Redação com proveniência: contexto documental, na redação original. */
export interface ProvenancedText {
  text: string;
  evidence: EvidencePath;
}

export interface ValueWithProvenanceProps {
  /** O resultado principal. Obrigatório: sem ele não há o que exibir. */
  primary: ProvenancedNumber;
  /** Comparação contrafactual publicada junto do principal. */
  counterfactual?: ProvenancedNumber;
  /**
   * Contexto documental que acompanha o resultado. É redação, não número: o
   * contrato de leitura entrega contexto como observação textual, e
   * extrair um número dela seria calcular o que a fonte não publicou como
   * valor.
   */
  context?: ProvenancedText;
  /** Sobrescrita termo a termo do vocabulário. */
  terms?: VocabularyOverrides;
}

// Valor com proveniência. Cada papel tem posição própria e fixa — principal
// acima, contrafactual e contexto abaixo — e cada número sai ao lado do
// caminho até sua evidência. O papel entra no nome acessível como texto
// visualmente oculto, pelo mesmo motivo do eixo no marcador: quem ouve
// precisa saber qual número é o principal.
export function ValueWithProvenance({
  primary,
  counterfactual,
  context,
  terms,
}: ValueWithProvenanceProps) {
  const vocabulary = resolveTerms(terms);
  return (
    <div className={styles.value} data-primitive="value-with-provenance">
      <div className={styles.primary} data-slot="primary">
        <VisuallyHidden>{vocabulary.valueRole.primary}: </VisuallyHidden>
        <NumericValue
          value={primary.value}
          valueRole="primary"
          {...(primary.format ? { format: primary.format } : {})}
        />
        <EvidenceAnchor
          href={primary.evidence.href}
          label={primary.evidence.label}
        />
      </div>
      {counterfactual ? (
        <div className={styles.counterfactual} data-slot="counterfactual">
          <VisuallyHidden>
            {vocabulary.valueRole.counterfactual}:{" "}
          </VisuallyHidden>
          <NumericValue
            value={counterfactual.value}
            valueRole="counterfactual"
            {...(counterfactual.format
              ? { format: counterfactual.format }
              : {})}
          />
          <EvidenceAnchor
            href={counterfactual.evidence.href}
            label={counterfactual.evidence.label}
          />
        </div>
      ) : null}
      {context ? (
        <div className={styles.context} data-slot="context">
          <VisuallyHidden>{vocabulary.valueRole.context}: </VisuallyHidden>
          <Text valueRole="context">{context.text}</Text>
          <EvidenceAnchor
            href={context.evidence.href}
            label={context.evidence.label}
          />
        </div>
      ) : null}
    </div>
  );
}

// Os estados da primitiva são os papéis que ela pode exibir: cada um tem
// posição própria e história própria.
export const VALUE_WITH_PROVENANCE_STATES: readonly ValueRole[] = VALUE_ROLES;

export const ValueWithProvenancePrimitive = definePrimitive({
  name: "ValueWithProvenance",
  component: ValueWithProvenance,
  states: VALUE_WITH_PROVENANCE_STATES,
});
