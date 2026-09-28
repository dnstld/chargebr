// Usos que o tipo recusa. Este arquivo não é executado: entra em
// `verify:types`, e cada supressão abaixo só compila enquanto o erro que ela
// anuncia continuar existindo. Se um contrato afrouxar — eixo opcional, razão
// opcional — a supressão fica sem erro para suprimir e a verificação reprova.
import { DeclaredAbsence } from "./declared-absence/declared-absence";
import { NumericValue } from "./numeric-value/numeric-value";
import { StatusMarker } from "./status-marker/status-marker";
import { Text } from "./text/text";

export const markerWithoutAxis = (
  // @ts-expect-error o eixo é obrigatório no tipo: marcador sem eixo não compila
  <StatusMarker status="confirmed" axisLabel="Verificação" label="Confirmado" />
);

export const markerWithStatusOfAnotherAxis = (
  <StatusMarker
    axis="workflow_status"
    // @ts-expect-error o estado precisa pertencer ao eixo declarado
    status="unresolved"
    axisLabel="Fluxo"
    label="Não resolvido"
  />
);

export const absenceWithoutReason = (
  // @ts-expect-error a razão é obrigatória no tipo: ausência sem razão não compila
  <DeclaredAbsence kind="blocked" />
);

// `valueRole` migrou para `weight`/`emphasis`
// (docs/decisao-biblioteca-de-componentes.md): o prop antigo não existe mais
// no tipo, e um átomo genérico não pode voltar a aceitar papel de domínio
// pela porta dos fundos de um prop solto.
export const textWithOldValueRole = (
  // @ts-expect-error valueRole não existe mais: migrado para weight/emphasis
  <Text valueRole="primary">Frota eletrificada</Text>
);

export const numericValueWithOldValueRole = (
  // @ts-expect-error valueRole não existe mais: migrado para weight/emphasis
  <NumericValue value={12345} valueRole="primary" />
);
