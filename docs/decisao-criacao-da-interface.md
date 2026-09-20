# Decisão: Criação da interface

## Estado e escopo

`ACEITA — AGUARDANDO MERGE`

Este documento abre a fase **Criação da interface** e define quem a constrói e
como. Ele estabelece o time de agentes, o processo de desenvolvimento e a
sequência de ciclos. Não escreve código, não instala dependência, não cria
pacote e não altera schema, Supabase ou dados.

Uma exceção deliberada ao rito: esta decisão e sua implementação — `CLAUDE.md`,
`docs/processo-de-desenvolvimento-sdd.md` e `.claude/agents/` — chegam juntas.
É o ato fundador do time, e um time não pode revisar sua própria constituição
antes de existir. A partir do ciclo 01, o rito vale integralmente: decisão e
implementação em PRs separados.

## Contexto

A fase collection-first foi concluída. A próxima capacidade não é mais coleta:
é uma interface capaz de expressar, sem trair, o que a metodologia já sabe
representar.

A ordem escolhida é biblioteca antes de aplicação. Uma biblioteca de interface
tem fronteiras naturalmente nítidas — um componente tem contrato, estados e
critério de pronto verificável — e por isso é o melhor terreno para estrear um
time de agentes. Aplicação vem depois, quando o time já tiver histórico.

## Princípio central

Um agente é um escopo, não uma pessoa. Times humanos toleram sobreposição
porque pessoas negociam; agentes não negociam, duplicam ou se calam. Daí a
regra que atravessa todo este documento: **um dono por artefato, e quem julga
não corrige**.

## Evidência externa considerada

O desenho abaixo responde às três categorias de falha documentadas em sistemas
multiagente: falha de especificação e desenho, desalinhamento entre agentes, e
ausência de verificação e de condição de parada.

| Falha documentada | Resposta adotada |
| --- | --- |
| Papéis ambíguos, escopo sobreposto | Escopo exclusivo por estatuto, um dono por artefato |
| Instrução vaga ao subagente | Todo estatuto declara objetivo, entradas, saída, fronteiras e parada |
| Handoff sem formato, trabalho duplicado | Envelope de handoff fixo e obrigatório |
| Ninguém verifica o resultado | Verificação tripla, independente, sem ferramenta de escrita |
| Ninguém sabe quando parar | Condição de parada declarada em todo estatuto |
| Excesso de instrução simultânea | Contexto modular: constituição curta, estatuto por ofício |
| Lista plana de proibições | Fronteiras em três níveis: sempre, pergunte antes, nunca |

## Como o time compartilha a visão

Agentes começam cada invocação com contexto zero. Não têm esforço discricionário
nem lembrança do que fizeram. O que substitui o senso de dono é mecânico:

1. **Constituição carregada automaticamente.** `CLAUDE.md` é o único contexto
   garantidamente compartilhado por todos.
2. **Mesmo preâmbulo, traduzido por ofício.** Todo estatuto abre com a mesma
   visão, dita no vocabulário daquele papel, como critério e não como retórica.
3. **Mesma definição de pronto.** Os cinco princípios do ChargeBR valem para
   todos, não só para a documentação.
4. **Direito e dever de objeção.** Qualquer agente pode *parar* um trabalho que
   fira um princípio, mesmo fora do seu escopo. Pode parar; nunca pode agir
   fora do escopo. É a única travessia de fronteira permitida, e é sempre freio.
5. **Memória de ofício versionada.** `.claude/agent-memory/<agente>/`, no Git, é
   o substituto de tempo de casa.

## O time inicial

Dez agentes. Oito ativos no ciclo de desenvolvimento, dois de parecer pontual.

| Agente | Dono de | Nunca faz |
| --- | --- | --- |
| `gerente-de-produto` | Spec, plano de tarefas, prioridade, critérios de aceite | Código, biblioteca, contrato de componente |
| `arquiteto-de-design-system` | Tokens, contrato de componente, camada atômica | Implementação, encoding de gráfico, parecer de a11y |
| `engenheiro-de-plataforma` | Monorepo, build, tipos, Prettier, ESLint, Vitest, Storybook, CI | Componente, token, framework de aplicação |
| `engenheiro-de-componentes` | Componentes e suas histórias | Token, contrato, encoding, julgar o próprio trabalho |
| `especialista-em-visualizacao` | Forma, encoding, escalas, paleta, `@chargebr/charts` | Interface fora de charts, parecer de a11y |
| `especialista-em-acessibilidade` | Parecer de acessibilidade | Editar arquivo, parecer de código |
| `revisor-de-codigo` | Parecer de correção e manutenibilidade | Editar arquivo, parecer de a11y ou segurança |
| `engenheiro-de-qualidade` | Testes, cobertura, regressão, parecer de qualidade | Editar componente para um teste passar |
| `guardiao-da-visao` | Parecer de coerência com a visão | Editar arquivo, dirigir, priorizar |
| `escriba-do-projeto` | `docs/`, índice, rastreabilidade | Decidir conteúdo técnico |

Desligados nesta fase, por não haver superfície que defendam: `oficial-de-seguranca`,
`engenheiro-backend`, `guardiao-do-modelo-canonico`, `editor-de-inteligencia`.
Eles entram quando o back office começar.

### Três separações deliberadas

- **Revisão de código e acessibilidade são agentes distintos.** O sinal de
  correção é mais rápido que o de acessibilidade; um agente com os dois chapéus
  sempre sacrifica o segundo.
- **Quem julga não tem ferramenta de escrita.** `revisor-de-codigo`,
  `especialista-em-acessibilidade` e `guardiao-da-visao` recebem apenas
  ferramentas de leitura. É impossível, não apenas proibido, que corrijam o que
  apontam.
- **Nenhum agente invoca outro.** Nenhum estatuto recebe a ferramenta de
  delegação. O roteamento é humano, na sessão principal. Custa atrito e compra
  supervisão real.

## O processo

Definido em `docs/processo-de-desenvolvimento-sdd.md`. Seis portões, cada um
aberto apenas com o anterior fechado:

especificação → desenho → plano de tarefas → implementação → verificação tripla
→ aceite humano e conclusão

Nenhum código é escrito antes de uma especificação aceita. A especificação, e
não o código, é a fonte de verdade sobre o comportamento pretendido.

## Sequência de ciclos

Cada ciclo é um PR pequeno e revisável, com sua própria spec.

| Ciclo | Objeto | Dono do desenho |
| --- | --- | --- |
| 01 | Fundação do workspace: monorepo, tipos, Prettier, ESLint, Vitest, CI | `engenheiro-de-plataforma` |
| 02 | Seleção e prova das bibliotecas, com matriz e ensaios reproduzíveis | `arquiteto-de-design-system` |
| 03 | Tokens v1: DTCG, três camadas, tema claro e escuro | `arquiteto-de-design-system` |
| 04 | Bancada de verificação: Storybook, teste de componente, a11y na suíte, validador de paleta no CI | `engenheiro-de-plataforma` |
| 05 | Átomos v1 | `arquiteto-de-design-system` |
| 06 | Primitivas de domínio v1 | `arquiteto-de-design-system` |
| 07 | Moléculas e organismos v1 | `arquiteto-de-design-system` |
| 08 | Gráficos v1 | `especialista-em-visualizacao` |

As primitivas de domínio vêm antes de moléculas e organismos genéricos de
propósito. Elas são o valor real da biblioteca e são o que mais pressiona a
camada de tokens; descobrir cedo que a camada não as sustenta é mais barato do
que descobrir tarde.

O ciclo 02 pode reverter a stack registrada na constituição. Um ensaio que
reprove uma biblioteca é resultado válido do ciclo, não fracasso dele.

## Decisões em aberto herdadas

1. Qual cor é `brand.primary` — `#302681` não aparece no logo.
2. Qual a família de texto com algarismos tabulares.
3. Variantes do logo: monocromática, fundo escuro, símbolo isolado, área de
   proteção e tamanho mínimo.
4. Framework da aplicação, adiado deliberadamente.

As três primeiras precisam ser fechadas antes do ciclo 03. A quarta permanece
fora desta fase.

## Critérios de sucesso da fase

1. Todo componente publicado tem spec aceita, desenho aceito e os três pareceres
   aprovados.
2. Nenhum valor literal de estilo em código de componente.
3. Todo estado declarado em spec tem história e teste.
4. Acessibilidade verificada por execução, não por inspeção de código.
5. Toda paleta aprovada por script nos dois modos.
6. As regras de domínio da constituição são expressáveis pela biblioteca.
7. Nenhum agente produziu artefato fora do seu escopo.
8. Todo handoff usou o envelope.
9. Cada ciclo tem conclusão registrada em `docs/` e listada no índice.
10. Nenhuma decisão em aberto foi preenchida por suposição.

## Interrupções obrigatórias

A fase deve parar quando:

- um componente só funcionar escondendo incerteza, colapsando eixos de estado ou
  exibindo número sem proveniência;
- uma paleta não passar nos seis testes e for adotada assim mesmo;
- um parecer `não demonstrado` for tratado como aprovação;
- um agente que julga precisar editar arquivo para concluir;
- um agente precisar de escopo de outro para entregar;
- uma decisão em aberto for preenchida por suposição;
- a verificação tripla for reduzida para acelerar entrega;
- um código for escrito sem spec aceita;
- uma dependência entrar sem decisão registrada.

Uma interrupção resulta em lacuna documentada. Ela não autoriza ampliar escopo.

## O que permanece fora desta fase

Back office, produto público, framework de aplicação, rotas, autenticação, API,
estado de servidor, schema, migrations, deploy, hospedagem, conteúdo editorial e
migração do Notion.

## Perguntas para revisão

1. Está correto construir a biblioteca de interface antes da aplicação?
2. O time de dez agentes cobre a fase sem sobreposição de escopo?
3. Está correto manter segurança, backend e modelo canônico desligados nesta
   fase?
4. Está correto separar revisão de código de parecer de acessibilidade?
5. Está correto negar ferramenta de escrita a quem emite parecer?
6. Está correto impedir que agentes se invoquem, concentrando o roteamento na
   pessoa supervisora?
7. O processo de seis portões impede código sem especificação aceita?
8. A verificação tripla e o tratamento de `não demonstrado` são suficientes?
9. A sequência de ciclos está na ordem certa, com primitivas de domínio antes de
   componentes genéricos?
10. Está correto permitir que o ciclo 02 reverta a stack registrada?
11. As três decisões de marca devem mesmo bloquear o ciclo 03?
12. As interrupções impedem que a interface trai a metodologia?
13. A exceção de rito no ato fundador está justificada e limitada?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma for `não`,
indique o número e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 20 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O
PR está liberado para merge. O ciclo 01 só poderá começar depois que esta versão
aceita estiver incorporada à `main`.
