# Processo de desenvolvimento — spec-driven

## Princípio

Nenhum código é escrito antes de uma especificação aceita. A especificação, e
não o código, é a fonte de verdade sobre o comportamento pretendido. Quando as
duas divergem, a especificação é corrigida por decisão própria ou o código é
corrigido — nunca se deixa a divergência em silêncio.

Especificação vaga é a primeira causa de falha em sistema de agentes: papéis se
sobrepõem, trabalho é duplicado e ninguém percebe que o resultado está errado.
O antídoto é especificidade verificável, não volume de texto.

## Onde as coisas vivem

| Camada | Local | Quem escreve |
| --- | --- | --- |
| Constituição | `CLAUDE.md` | Só a pessoa supervisora aprova |
| Estatutos | `.claude/agents/*.md` | Só a pessoa supervisora aprova |
| Decisões e conclusões | `docs/` | Escriba consolida |
| Especificações de ciclo | `specs/NNNN-nome/` | Gerente de produto |
| Memória de ofício | `.claude/agent-memory/<agente>/` | O próprio agente |
| Código | `packages/` | Engenheiros |

## O ciclo, em seis portões

Cada portão só abre com o anterior fechado. Um portão fechado por aceite humano
não reabre sem nova decisão.

### 1. Especificação — `gerente-de-produto`

Produz `specs/NNNN-nome/spec.md`. Define o problema e o comportamento
observável. Não define implementação, biblioteca, nome de arquivo ou estrutura
de código.

**Portão:** aceite da pessoa supervisora.

### 2. Desenho — `arquiteto-de-design-system`

Produz `specs/NNNN-nome/desenho.md`. Define o contrato: API do componente,
tokens consumidos, camada atômica, estados, composição permitida e impacto sobre
o que já existe. Quando o objeto é um gráfico, o desenho é do
`especialista-em-visualizacao`. Quando é ferramenta, build ou pipeline, é do
`engenheiro-de-plataforma`.

**Portão:** aceite da pessoa supervisora.

### 3. Plano de tarefas — `gerente-de-produto`

Produz `specs/NNNN-nome/tarefas.md`. Quebra o desenho em tarefas pequenas, cada
uma com **um dono único**, entradas, saída esperada e critério de pronto
verificável. Uma tarefa que precisa de dois donos está mal quebrada.

**Portão:** aceite da pessoa supervisora.

### 4. Implementação — engenheiro correspondente

Executa uma tarefa por vez. Entrega código, história no Storybook e teste
juntos, no mesmo PR. Não julga o próprio trabalho e não implementa tarefa de
outro dono.

**Portão:** a tarefa atende ao seu critério de pronto.

### 5. Verificação tripla — independente e paralela

Três pareceres, de três agentes que **não possuem ferramenta de escrita**:

- `revisor-de-codigo` — correção, legibilidade, manutenibilidade, aderência ao
  contrato do desenho;
- `especialista-em-acessibilidade` — teclado, foco, nome acessível, papel,
  estado, contraste, leitor de tela;
- `engenheiro-de-qualidade` — cobertura de estados, determinismo, regressão.

Cada parecer é `aprova`, `reprova` ou `não demonstrado`, sempre com evidência.
`não demonstrado` bloqueia como reprovação. Nenhum deles corrige o que aponta;
quem escreveu corrige e submete de novo.

**Portão:** os três aprovam.

### 6. Aceite e conclusão

A pessoa supervisora aceita e faz merge. O `escriba-do-projeto` registra a
conclusão do ciclo em `docs/`, no rito do projeto, e atualiza o índice.

## Modelo de especificação

```markdown
# Spec NNNN — <nome>

## Estado
`PROPOSTA PARA REVISÃO` | `ACEITA` | `SUPERADA POR <spec>`

## Problema
O que não é possível hoje, e para quem. Uma frase de contexto, não um discurso.

## Quem usa
O papel concreto que exerce este comportamento.

## Comportamento observável
O que acontece, em termos verificáveis de fora. Sem implementação.

## Critérios de aceite
1. Numerados, verificáveis por teste ou inspeção, sem adjetivo subjetivo.
2. "Rápido", "bonito" e "intuitivo" não são critérios.

## Estados obrigatórios
Vazio, carregando, erro, limite superior, limite inferior, `unresolved`,
`blocked` — quando aplicáveis. Declare explicitamente os não aplicáveis.

## Regras de domínio envolvidas
Quais regras da constituição este comportamento precisa preservar.

## Acessibilidade
Operação por teclado esperada, nome acessível, papel, anúncio de mudança.

## Fora de escopo
O que esta spec deliberadamente não resolve.

## Decisões em aberto
O que falta decidir, e por quem. Nunca preencher por suposição.

## Perguntas para revisão
Numeradas. Se todas forem `sim`, registre `ACEITA`.

## Resultado da revisão
| Campo | Resultado |
| --- | --- |
| Pessoa revisora | |
| Data | |
| Resultado | |
```

## Envelope de handoff

Todo agente encerra sua vez com este bloco quando o próximo passo é de outro
agente. É o formato fixo que impede handoff ambíguo.

```markdown
## Handoff

- **De:** <agente de origem>
- **Para:** <agente de destino>
- **Objetivo:** uma frase, o resultado esperado
- **Entradas:** arquivos, specs e decisões que o destino deve ler
- **Saída esperada:** o artefato concreto, com formato
- **Fronteiras:** o que o destino não deve tocar
- **Critérios de aceite:** como saber que ficou pronto
- **Não foi feito:** o que ficou deliberadamente por fazer
- **Bloqueios:** lacunas e decisões em aberto encontradas
```

## Fronteiras em três níveis

Todo estatuto expressa suas fronteiras assim, e não como lista plana de
proibições:

- **Sempre faça** — sem pedir autorização;
- **Pergunte antes** — impacto alto ou irreversível;
- **Nunca faça** — parada dura, mesmo com pedido explícito.

## Definição de pronto de um componente

1. Tipos estritos, sem `any`.
2. Nenhum valor literal de estilo; só token.
3. História no Storybook cobrindo todos os estados declarados na spec.
4. Teste de interação.
5. Teste de acessibilidade passando na suíte, não apenas no painel.
6. Tema claro e escuro verificados.
7. Documentação em PT-BR do propósito e de quando **não** usar.
8. Os três pareceres da verificação tripla aprovados.

## Regras de sessão

- Um ciclo por vez. Não abra o ciclo seguinte com o anterior em verificação.
- Um agente por vez em cada artefato.
- Nenhum agente invoca outro agente. O roteamento é humano.
- Uma sessão que atinge a condição de parada do seu agente encerra com o
  envelope de handoff, não com uma tentativa de contornar a parada.
