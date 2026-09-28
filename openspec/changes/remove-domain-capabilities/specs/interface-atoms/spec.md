# Spec Delta

## MODIFIED Requirements

### Requirement: Número alinha em coluna

A variante tabular do átomo de texto genérico SHALL consumir os tokens de
dado numérico, de modo que números de quantidades diferentes de dígitos
alinhem pela mesma posição quando empilhados.

**Por quê:** o átomo de número próprio é dissolvido nesta mudança — decisão
do dono, ver design.md. A garantia observável não muda: números continuam
alinhando em coluna quando empilhados. O que muda é o componente que a
sustenta.

#### Scenario: Números de larguras diferentes alinham

- **WHEN** dois números com quantidades diferentes de dígitos são renderizados um sobre o outro, pela variante tabular do átomo de texto
- **THEN** seus dígitos ocupam a mesma largura e a coluna alinha
- **Prova:** teste que renderiza os dois e compara a largura medida de cada dígito

## REMOVED Requirements

### Requirement: Marcador de estado nomeia seu eixo

O átomo de marcador de estado SHALL declarar a que eixo o estado pertence, e
SHALL NOT ser renderizável sem essa declaração.

#### Scenario: Marcador sem eixo reprova

- **WHEN** um marcador de estado é usado sem declarar o eixo
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem eixo plantado, `verify:types` falhando, plantio revertido

#### Scenario: Eixo alcançável por leitor de tela

- **WHEN** um marcador de estado é renderizado
- **THEN** o eixo integra o nome acessível do marcador, e não apenas sua aparência
- **Prova:** teste que lê o nome acessível do marcador renderizado

**Reason**: o eixo que este requisito nomeia — `verification_level`,
`workflow_status`, `normalization_status` — é a própria metodologia da frente
de coleta, cravada no tipo do átomo (`StatusAxis`). Não é preferência de
interface derivável do que está construído; é a mesma origem que `bdde87e`
já revogou em `openspec/config.yaml`. O átomo de marcador de estado sai do
pacote.

**Migration**: não há. Nenhum consumidor construído resta para o marcador de
estado depois que `StatusPanel` e a coluna de "não resolvido" de
`ChartValueTable` saem nesta mesma mudança.

### Requirement: Estado não resolvido é hachurado

Um marcador cujo estado seja não resolvido SHALL usar a hachura, e SHALL NOT usar
preenchimento sólido.

#### Scenario: Não resolvido não recebe preenchimento sólido

- **WHEN** um marcador é renderizado em estado não resolvido
- **THEN** seu preenchimento é a hachura, e não uma cor sólida
- **Prova:** teste que renderiza e verifica o preenchimento aplicado

#### Scenario: Preenchimento sólido em não resolvido reprova

- **WHEN** um marcador em estado não resolvido é declarado com preenchimento sólido
- **THEN** a verificação falha, nomeando o uso
- **Prova:** uso plantado, verificação falhando, plantio revertido

**Reason**: "não resolvido" é estado da metodologia
(`normalization_status = unresolved`), e o marcador que o exibia sai junto
nesta mudança (ver "Marcador de estado nomeia seu eixo", acima).

**Migration**: não há garantia equivalente. A hachura em si continua
exportada, com história própria — decisão do dono, ver design.md —, mas
deixa de ter significado de estado atribuído a ela: é textura disponível,
sem consumidor.

### Requirement: Distinção não depende só de cor

Papéis de valor distintos — principal, contrafactual e contexto — SHALL diferir
em ao menos uma propriedade que não seja cor.

#### Scenario: Papéis permanecem distinguíveis sem cor

- **WHEN** os três papéis são renderizados
- **THEN** eles diferem entre si em ao menos uma propriedade além da cor
- **Prova:** teste que lê as propriedades computadas dos três e compara as não cromáticas

**Reason**: "principal", "contrafactual" e "contexto" são os três papéis de
`ValueWithProvenance`, que sai nesta mudança junto de toda a capacidade
`domain-primitives`. Esta mesma remoção já estava proposta, com migração
para `domain-primitives`, na mudança aberta `interface-atomic-structure`
(ainda não arquivada) — ver proposal.md, seção Impact, sobre a sobreposição
entre as duas mudanças.

**Migration**: nenhuma. A mudança `interface-atomic-structure` propunha
migrar o conteúdo normativo para o requisito "Papéis não são
intercambiáveis" de `domain-primitives`; esta proposta retira
`domain-primitives` inteira, então não existe destino para migrar.
