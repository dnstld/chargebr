import { DeclaredAbsence } from "../../atoms/declared-absence/declared-absence";
import {
  resolveTerms,
  type VocabularyOverrides,
} from "../../vocabulary/vocabulary";
import { BLOCK_REASONS, type BlockReason } from "../block-reason";
import { definePrimitive } from "../contract";
import styles from "./blocked-projection.module.css";

export interface BlockedProjectionProps {
  /**
   * Razões do bloqueio, ao menos uma. Obrigatório no tipo: bloqueio sem razão
   * não compila, e lista vazia também não.
   */
  reasons: readonly [BlockReason, ...BlockReason[]];
  /** Sobrescrita termo a termo do vocabulário. */
  terms?: VocabularyOverrides;
}

// Projeção bloqueada. Ocupa o lugar do resultado e diz por que ele não está
// ali: o termo do bloqueio e uma ausência declarada por razão. Não recebe
// número, nem parcial, nem valor de referência — a forma de entrada não tem
// campo para isso, e o conteúdo acessível não contém dígito.
export function BlockedProjection({ reasons, terms }: BlockedProjectionProps) {
  const vocabulary = resolveTerms(terms);
  return (
    <div className={styles.blocked} data-primitive="blocked-projection">
      <p className={styles.lead}>{vocabulary.absence.blockedProjection}</p>
      <ul className={styles.reasons}>
        {reasons.map((reason) => (
          <li key={reason} data-reason={reason}>
            <DeclaredAbsence
              kind="blocked"
              reason={vocabulary.blockReason[reason]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export const BlockedProjectionPrimitive = definePrimitive({
  name: "BlockedProjection",
  component: BlockedProjection,
  states: BLOCK_REASONS,
});
