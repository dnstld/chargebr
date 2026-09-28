# Spec Delta

## MODIFIED Requirements

### Requirement: Papéis não são intercambiáveis

A primitiva de valor SHALL declarar qual papel cada item ocupa — principal,
contrafactual ou contexto — e SHALL renderizá-los em posições distintas, de modo
que um contrafactual nunca ocupe o lugar do principal.

Os três papéis SHALL diferir entre si em ao menos uma propriedade que não seja
cor.

**Por quê:** este requisito absorve o conteúdo normativo de "Distinção não
depende só de cor", removido de `interface-atoms` nesta mesma mudança — ver
`specs/interface-atoms/spec.md` desta mudança. A garantia observável não muda:
os três papéis sempre diferiram por posição e por propriedade não cromática.
O que muda é onde a garantia é declarada — aqui, na camada que ainda sabe o
que "principal", "contrafactual" e "contexto" significam, depois que `Text` e
`NumericValue` deixam de exigir `valueRole` e passam a expor `weight`/
`emphasis` como variantes genéricas.

#### Scenario: Contrafactual não ocupa a posição do principal

- **WHEN** um valor principal e um contrafactual são renderizados juntos
- **THEN** eles ocupam posições distintas e diferem em ao menos uma propriedade não cromática
- **Prova:** teste que renderiza ambos e compara posição e propriedades computadas

#### Scenario: Papéis permanecem distinguíveis sem cor

- **WHEN** os três papéis — principal, contrafactual e contexto — são renderizados
- **THEN** eles diferem entre si em ao menos uma propriedade além da cor
- **Prova:** teste que lê as propriedades computadas dos três e compara as não cromáticas
