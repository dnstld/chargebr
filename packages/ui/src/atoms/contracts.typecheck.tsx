// Usos que o tipo recusa. Este arquivo não é executado: entra em
// `verify:types`, e cada supressão abaixo só compila enquanto o erro que ela
// anuncia continuar existindo. Se um contrato afrouxar — eixo opcional, razão
// opcional — a supressão fica sem erro para suprimir e a verificação reprova.
import { DeclaredAbsence } from "./declared-absence/declared-absence";
import { StatusMarker } from "./status-marker/status-marker";

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
