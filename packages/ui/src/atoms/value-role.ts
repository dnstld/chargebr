// Papéis que um valor exibido pode ocupar. Vêm da restrição de domínio "valor
// principal, contrafactual e contexto são visualmente distintos", e são
// compartilhados por Texto e Número para que a distinção seja a mesma nos dois.
export const VALUE_ROLES = ["primary", "counterfactual", "context"] as const;
export type ValueRole = (typeof VALUE_ROLES)[number];
