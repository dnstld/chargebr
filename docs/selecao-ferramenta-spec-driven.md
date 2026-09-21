# Seleção da ferramenta de desenvolvimento spec-driven

## Estado

`PROPOSTA PARA REVISÃO`

## Escopo

Este documento compara as ferramentas candidatas a governar o ciclo de
desenvolvimento da fase de interface e registra uma recomendação. Ele não
instala nada, não altera o repositório e não fecha a decisão — a decisão é da
pessoa revisora.

A decisão `D6` de `decisao-configuracao-inicial-do-workspace.md` depende deste
documento e fica aberta até ele ser aceito.

## Método

Cada candidata foi instalada num diretório descartável e inspecionada por
execução: `--help`, `init` e a árvore de arquivos resultante. As duas
distribuídas por repositório foram clonadas e lidas em código — gabaritos,
motor, exemplos e licença. O que está abaixo vem dessas execuções e dessas
leituras, não de artigos de comparação.

Uma exceção declarada: **Tessl** não foi executada. É produto comercial, sem
repositório público e sem licença aberta (`SEE LICENSE.md`); as linhas sobre ela
são do registro npm apenas e estão marcadas como não verificadas.

Números de download não entram: a API de estatísticas do npm e do PyPI não
respondeu nesta sessão, e adoção estimada de memória não é evidência.

## Candidatas

| Ferramenta | Pacote | Versão | Publicada | Cadeia | Licença |
| --- | --- | --- | --- | --- | --- |
| GitHub Spec Kit | `specify-cli` (PyPI) | 1.0.8 | 17/09/2026 | Python ≥ 3.11 | aberta |
| OpenSpec | `@fission-ai/openspec` (npm) | 1.13.1 | 17/09/2026 | Node | MIT |
| BMAD-METHOD | `bmad-method` (npm) | 6.12.0 | 04/09/2026 | Node | MIT |
| Tessl | `tessl` (npm) | 0.109.0 | 15/09/2026 | Node | comercial |
| onp-spec-driven | `@onovoprogramador/onp-spec` (npm) | 0.9.0 | 01/08/2026 | Node ≥ 18, zero dependências | MIT |

Descartadas sem análise profunda: `@opengsd/gsd-core`, `cc-sdd`,
`@pimzino/spec-workflow-mcp` e o restante da cauda longa do npm — nenhuma
oferece algo que as quatro acima não ofereçam, e cauda longa em ferramenta de
processo é risco de abandono.

Kiro, da AWS, ficou fora por não ser CLI nem pacote: é um IDE. Adotá-la
significaria trocar de ambiente de trabalho, não de processo.

## O que cada uma instala

### GitHub Spec Kit

```text
.claude/skills/speckit-*/SKILL.md      dez skills
.specify/memory/constitution.md        constituição (gabarito com placeholders)
.specify/templates/                    spec, plan, tasks, checklist, constitution
.specify/scripts/bash/                 create-new-feature, setup-plan, setup-tasks…
.specify/workflows/speckit/workflow.yml
```

Fluxo: `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement` → `/speckit-converge`. Opcionais:
`clarify`, `checklist`, `analyze`, `taskstoissues`.

Artefatos por funcionalidade, em `specs/001-slug/`. Branch gerada pelo script:
`001-workspace-foundation`.

### OpenSpec

```text
.claude/commands/opsx/*.md             seis comandos
.claude/skills/openspec-*/SKILL.md     seis skills
openspec/config.yaml                   schema, contexto e regras por artefato
openspec/specs/                        especificações vivas
openspec/changes/archive/              histórico de mudanças aplicadas
```

Fluxo: `/opsx:propose` → `/opsx:apply` → `/opsx:archive`, com `explore`,
`update` e `sync` em volta. Mais seis workflows opcionais
(`new`, `continue`, `ff`, `bulk-archive`, `verify`, `onboard`).

O modelo é **delta**: uma mudança é proposta com `proposal.md`, um recorte de
spec, `design.md` e `tasks.md`; ao ser arquivada, ela atualiza a spec viva em
`openspec/specs/`. A verdade corrente fica num lugar só, e o histórico fica no
arquivo.

### BMAD-METHOD

CLI `bmad` com `install`, `status`, `uninstall`, organizada em módulos
instaláveis, com canais `stable` e `next` e pinagem por tag. O modelo é de
**personas**: analista, gerente de produto, arquiteto, scrum master,
desenvolvedor e QA, cada uma com seus artefatos.

### Tessl

Não verificada. CLI proprietária com registro de specs próprio.

### onp-spec-driven

```text
.spec/constituicao.md                  princípios verificáveis (P-xxx)
.spec/features/<nome>/spec.md          histórias (US) e critérios de aceite (AC)
.spec/features/<nome>/tasks.md         tarefas (T-xxx)
.spec/verification/<nome>.json         resultado da auditoria, por critério
.claude/skills/onp-spec-driven/        skill com o motor embarcado
onpspec.config.json
```

Instalação: `npx @onovoprogramador/onp-spec init --agents claude`.

Fluxo: Especificar → Projetar → Tarefas → Plano → Executar → **Auditar**.

A diferença de categoria: as outras são *spec-first* — a spec gera o código e
depois envelhece. Esta é *spec-anchored*. Cada critério de aceite vira um teste
anotado (`@spec:AC-001`), cada princípio da constituição vira um teste anotado
(`@principle:P-001`), o motor lê a saída TAP e emite um JSON com o veredito por
critério e um código de saída. Critério sem teste, teste órfão e código órfão
são detectados por execução, não por leitura.

Suposições (`ASM-xxx`) e perguntas em aberto (`Q-xxx`) são artefatos de primeira
classe, não comentários.

## Um caso à parte: a coleção do Matt Pocock

`github.com/mattpocock/skills`, MIT, último commit em 18/09/2026, distribuída
como plugin do Claude Code (`claude plugins install mattpocock-skills`) ou por
`npx skills@latest add mattpocock/skills`.

**Não é candidata a esta seleção.** Não define artefato de spec versionado no
repositório nem ciclo com portões: é uma coleção de vinte e sete skills de
ofício — `grilling` e `grill-me` para furar um plano por interrogatório, `tdd`,
`code-review`, `domain-modeling`, `diagnosing-bugs`, `handoff`,
`writing-for-agents`. As que chegam perto de spec (`to-spec`, `to-tickets`,
`wayfinder`) trabalham contra o rastreador de issues do GitHub, não contra
arquivos do repositório.

Ela ocupa outra camada e **não conflita** com nenhuma candidata. Vale como
complemento, não como escolha: `grilling` antes de fechar uma spec e
`code-review` no portão de implementação cobrem lacunas que nenhuma das
ferramentas de SDD preenche.

## Comparação

| Critério | Spec Kit | OpenSpec | onp-spec | BMAD | Tessl |
| --- | --- | --- | --- | --- | --- |
| Cadeia de ferramentas | Python num repo Node | Node, igual ao repo | Node, zero dependências | Node | Node |
| Artefatos em PT-BR | sem suporte; gabaritos em inglês | `--language pt-BR` grava a instrução no `config.yaml` | nativo: a ferramenta inteira é em PT-BR | `--document-output-language` | não verificado |
| Integração com Claude Code | skills | comandos e skills | skill | skills | não verificado |
| Forma do artefato | pasta por funcionalidade, acumulativa | delta com spec viva e arquivo | pasta por feature + veredito versionado | documentos por persona | registro proprietário |
| Peso do processo | seis passos obrigatórios | três passos, seis opcionais | seis passos, dois condicionais | pesado, por papéis | não verificado |
| Onde entram as regras do projeto | `constitution.md` | `config.yaml` com `context` e `rules` por artefato | `constituicao.md`, com princípios testáveis | configuração de módulo | não verificado |
| Testes por padrão | não — `OPTIONAL - only if tests requested` | não verificado | **obrigatórios**: critério sem teste reprova | não verificado | não verificado |
| A spec continua verdadeira | por disciplina | por disciplina, com spec viva | por auditoria mecânica, com código de saída | por disciplina | não verificado |
| Colisão com a convenção de branch | sim, gera `001-slug` | não impõe nome de branch | usa worktrees no modo paralelo; sequencial não impõe | não verificado | não verificado |
| Licença e governança | aberta, mantida pelo GitHub | MIT, repositório público | MIT, autor único | MIT, repositório público | comercial, fechada |
| Risco principal | segunda cadeia e gabaritos em inglês | projeto novo, pouco material de referência | v0.9.0, autor único, sem commit desde 01/08/2026 | reintroduz time de papéis | dependência de fornecedor |

## Correção de método

A primeira versão desta recomendação justificava a escolha com os cinco
princípios de `empresa-e-visao.md` — rastreabilidade, confiabilidade,
profundidade, histórico, clareza. **Isso estava errado.**

Aqueles princípios governam o dado e a inteligência produzida: que afirmação
publicada se liga a evidência, que incerteza aparece explícita, que mudança de
informação permanece auditável. Eles dizem respeito ao que o ChargeBR publica,
não a como o código do ChargeBR é escrito.

Usá-los para escolher ferramenta de desenvolvimento é retórica com aparência de
fundamento. É também o mesmo movimento da constituição revertida, que declarava
que os princípios valiam "para todos, não só para a documentação" — e foi
revertida.

A recomendação abaixo foi refeita apenas com critérios de engenharia.

## Recomendação

**OpenSpec.**

**1. Risco de manutenção.** OpenSpec 1.13.1, publicada em 17/09/2026.
`onp-spec` 0.9.0, publicada em 01/08/2026, autor único, sem commit desde então.
Ferramenta de processo abandonada custa mais caro que ferramenta de processo
imperfeita: ela é o trilho por onde todo trabalho passa, e trocá-la no meio de
uma fase para tudo.

**2. Ajuste ao trabalho desta fase.** Os ciclos 1 a 3 são configuração —
workspace, tokens, bancada de verificação. Não são funcionalidade com usuário e
história. O modelo do `onp-spec` é história → critério de aceite → tarefa →
teste, desenhado para feature de produto; forçar "como desenvolvedor, quero um
comando de verificação" é preencher formulário. O modelo delta do OpenSpec —
propõe mudança, aplica, arquiva — descreve mudança de configuração sem
distorção.

**3. Peso.** OpenSpec tem três comandos no caminho padrão. `onp-spec` tem seis
passos, orquestração de git worktrees, relatório periódico no chat, e arquivos
`SKILL.md` de 329 a 385 linhas consumindo contexto em toda sessão. Para um time
de uma pessoa, o mais leve ganha — e o processo pesado já foi revertido uma vez
neste repositório.

**4. Cadeia de ferramentas.** Empate entre OpenSpec e `onp-spec`, ambos Node
por `npx`. O Spec Kit perde por trazer Python ≥ 3.11 e `uv` para um repositório
que não tem nenhum dos dois.

**5. Idioma.** `onp-spec` ganha: é escrita em PT-BR, não adaptada. OpenSpec
resolve por opção (`--language pt-BR`), com cabeçalhos estruturais em inglês.
Spec Kit não resolve. Este é o único critério em que o `onp-spec` vence, e não
carrega os outros quatro.

**6. Custo de saída.** Empate: markdown em ambas, migração barata.

### A ideia do onp-spec que vale adotar sem adotar a ferramenta

A auditoria mecânica — cada critério de aceite ligado a um teste nomeado,
conferido por código de saída — é boa prática de engenharia por mérito próprio,
independente de quem a implementa. Ela não exige uma dependência 0.9.0.

O `openspec/config.yaml` tem `rules` por artefato. A regra cabe ali:

```yaml
rules:
  spec:
    - Todo critério de aceite nomeia o teste que o prova
  tasks:
    - Tarefa sem teste correspondente não é considerada pronta
```

A verificação roda no `pnpm verify`, que já é o portão da D3. Adota-se a
prática, não o risco.

### Se a auditoria mecânica for prioridade acima do resto

Aí a escolha é `onp-spec`, e a troca precisa ser aceita com os olhos abertos:
uma ferramenta 0.9.0 de autor único vira dependência do processo inteiro. A
mitigação é real mas trabalhosa — MIT, zero dependências, motor de cerca de
quinze arquivos JavaScript legíveis, `vendoring` viável se o projeto parar.

### O benchmark do próprio autor não conta

O repositório do `onp-spec` traz `benchmark/RESULTS.md` com 100% para si, 11%
para OpenSpec e 0% para o Spec Kit. Descarte o placar: os nove cenários são a
taxonomia de defeitos da própria ferramenta, e as concorrentes não afirmam
cobrir nenhum deles. É demonstração, não comparação.

### Complemento, em qualquer cenário

As skills do Matt Pocock entram em outra camada e não competem com a escolha:
`grilling` para furar uma spec antes de fechá-la, `code-review` no portão de
implementação, `handoff` entre sessões. Instaláveis como plugin, MIT, ativas.
Ficam como sugestão, não como parte desta seleção.

### Por que não BMAD

BMAD organiza o trabalho por personas — analista, PM, arquiteto, scrum master,
dev, QA. É a forma que o commit `4fa8c4b` reverteu neste repositório, com dez
agentes. Reintroduzi-la embalada em ferramenta de terceiro não muda o custo: é
cerimônia de time para um time de uma pessoa.

### Por que não Tessl

Licença comercial, sem repositório público, versão 0.109.0. O processo de
desenvolvimento do ChargeBR não deve depender de fornecedor fechado antes de o
produto existir.

## Perguntas para revisão

1. A correção de método está certa — princípios de produto não governam escolha de ferramenta de desenvolvimento?
2. O método — instalar, clonar e inspecionar, em vez de ler comparações — é suficiente?
3. O risco de manutenção deve mesmo pesar mais que a auditoria mecânica?
4. O modelo delta descreve melhor um ciclo de configuração que o modelo história → critério de aceite?
5. A regra de auditoria em `rules` substitui satisfatoriamente o motor do `onp-spec`?
6. Está correto descartar o benchmark do próprio autor?
7. Está correto tratar a coleção do Matt Pocock como complemento e não candidata?
8. Está correto recusar BMAD por reintroduzir o modelo de personas já revertido?
9. Está correto recusar Tessl por ser fechada, e Kiro por ser IDE?
10. Falta alguma candidata que deveria ter sido avaliada?

Se todas forem `sim`, registre `ACCEPTED` e a `D6` passa a nomear o OpenSpec.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 21 de setembro de 2026 |
| Resultado | `ACCEPTED` |
