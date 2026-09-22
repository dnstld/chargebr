// Usos que o tipo recusa nas primitivas de domínio. Como o arquivo homônimo
// dos átomos: não é executado, entra em `verify:types`, e cada supressão só
// compila enquanto o erro que ela anuncia existir. Se a proveniência ou a
// razão virarem opcionais, a supressão sobra e a verificação reprova.
import { BlockedProjection } from "./blocked-projection/blocked-projection";
import { StatusPanel } from "./status-panel/status-panel";
import { ValueWithProvenance } from "./value-with-provenance/value-with-provenance";

export const valueWithoutProvenance = (
  // @ts-expect-error a proveniência é obrigatória no tipo: número sem caminho até a evidência não compila
  <ValueWithProvenance primary={{ value: 12556 }} />
);

export const counterfactualWithoutProvenance = (
  <ValueWithProvenance
    primary={{ value: 12556, evidence: { href: "#e", label: "Evidência" } }}
    // @ts-expect-error a proveniência é obrigatória em toda posição, não só na principal
    counterfactual={{ value: 16502 }}
  />
);

export const blockedWithoutReason = (
  // @ts-expect-error a razão é obrigatória no tipo: bloqueio sem razão não compila
  <BlockedProjection />
);

export const blockedWithEmptyReasons = (
  // @ts-expect-error lista vazia de razões também não compila: ao menos uma razão
  <BlockedProjection reasons={[]} />
);

export const panelWithoutAnAxis = (
  <StatusPanel
    // @ts-expect-error os três eixos são obrigatórios no tipo: eixo omitido não compila; sem valor é null, dito
    statuses={{ verification_level: "confirmed", workflow_status: "accepted" }}
  />
);

export const panelWithStatusOfAnotherAxis = (
  <StatusPanel
    statuses={{
      verification_level: "confirmed",
      workflow_status: "accepted",
      // @ts-expect-error o estado precisa pertencer ao eixo
      normalization_status: "confirmed",
    }}
  />
);
