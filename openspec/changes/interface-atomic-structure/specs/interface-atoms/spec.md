# Spec Delta

## REMOVED Requirements

### Requirement: Distinção não depende só de cor

Papéis de valor distintos — principal, contrafactual e contexto — SHALL diferir
em ao menos uma propriedade que não seja cor.

#### Scenario: Papéis permanecem distinguíveis sem cor

- **WHEN** os três papéis são renderizados
- **THEN** eles diferem entre si em ao menos uma propriedade além da cor
- **Prova:** teste que lê as propriedades computadas dos três e compara as não cromáticas

**Reason**: este requisito nomeia papel de domínio — principal, contrafactual,
contexto — dentro de uma spec que, sob `docs/decisao-biblioteca-de-componentes.md`,
passa a descrever só a camada genérica de `@chargebr/ui`. `Text` e
`NumericValue` deixam de exigir `valueRole` e passam a expor as variantes
genéricas `weight`/`emphasis`; a primitiva não sabe mais que "principal" e
"contrafactual" existem, então não pode ser ela a garantir que esses papéis
se distinguem. R2 de `docs/decisao-biblioteca-de-componentes.md` já registrava
esta lacuna como pendente do ciclo de migração; esta mudança a fecha.

**Migration**: o conteúdo normativo — os três papéis diferem em ao menos uma
propriedade não cromática — passa a viver em `domain-primitives`, fundido ao
requisito "Papéis não são intercambiáveis", que já garantia posição distinta
para o mesmo trio. Quem hoje depende deste requisito para provar distinção
sem cor depende, depois desta mudança, do requisito equivalente em
`domain-primitives`.
