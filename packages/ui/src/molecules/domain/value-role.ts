// Papéis que um valor exibido pode ocupar. Vêm da restrição de domínio "valor
// principal, contrafactual e contexto são visualmente distintos", e nomeiam
// as três posições que ValueWithProvenance compõe. A distinção em si é
// expressa pelas variantes genéricas de peso e destaque dos átomos Texto e
// Número (`weight`/`emphasis`), mais o tamanho e a cor que o papel de
// contexto aplica na própria composição — ver
// value-with-provenance.module.css.
export const VALUE_ROLES = ["primary", "counterfactual", "context"] as const;
export type ValueRole = (typeof VALUE_ROLES)[number];
