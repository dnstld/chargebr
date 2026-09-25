# Como trabalhar neste repositório

Este arquivo governa a **frente de interface**: `apps/`, `packages/`,
`openspec/` e `tools/`. A frente de coleta — `src/`, `queries/`, `supabase/`,
`data/`, `tests/` — tem processo próprio e não é regida por aqui. Não toque
nela a partir de um ciclo de interface.

## Ninguém manda em ninguém

Nenhum agente tem autoridade para mandar outro mudar alguma coisa. Um achado é
uma **posição com evidência**, nunca uma instrução.

Quem apresenta um achado diz três coisas: **o que mediu**, **o que conclui** e
**o que o faria mudar de ideia**. Sem a terceira, não é achado — é opinião com
números em volta.

Quem é contrariado **refaz a medição antes de defender** o que disse. Discordância
se resolve por evidência, nunca por quem revisa, por quem escreveu primeiro ou
por quem falou por último. Revisar é um papel, não um posto.

**Quando a evidência não decide** — porque ela não existe, ou porque a
discordância é sobre valor e não sobre fato —, registre as duas posições e o que
cada uma precisaria para ser provada, e leve ao dono do repositório. Não siga
por suposição e não ceda para encerrar a discussão. É a mesma regra da lacuna:
registra e para.

Isto vale para todos, inclusive para quem escreveu esta linha.

## O ciclo

Todo trabalho de interface é um ciclo spec-driven com OpenSpec, e cada ciclo dá
**três pull requests**, nesta ordem. Nenhum começa antes do anterior ser
mergeado.

| # | Branch | O que roda | O que entra no PR |
| --- | --- | --- | --- |
| 1 | `docs/<nome>-proposal` | `/opsx:propose` | Só `openspec/changes/<nome>/`. Nenhuma linha de código. |
| 2 | `feat/<nome>` | `/opsx:apply <nome>` | O código, os testes e as histórias. |
| 3 | `docs/archive-<nome>` | `/opsx:archive <nome>`, com **Sync now** | A mudança arquivada e as specs vivas sincronizadas. |

A separação existe para que a **decisão** seja revisada sozinha. Se proposta e
código chegassem juntos, a decisão passaria por tabela.

Antes de propor um ciclo, leia [`docs/pontos-abertos.md`](docs/pontos-abertos.md)
— é o registro do que ficou em aberto de propósito, com o gatilho de cada ponto.
Se o ciclo dispara um gatilho, o ciclo fecha aquele ponto e cita o número.

## Branch

Sempre criada a partir da **main atualizada**:

```bash
git checkout main
git pull
git checkout -b <tipo>/<nome-em-ingles-kebab>
```

Tipos: `feat`, `fix`, `docs`, `chore`.

## Commit

Uma linha em inglês, `<tipo>: <ação>`. Tipos: `feat`, `fix`, `docs`, `db`,
`data`, `chore`.

**Sem corpo. Sem rodapé. Sem assinatura.** Nada de `Co-Authored-By`, nada de
linha de sessão, nada de emoji de robô — nem no commit, nem no corpo do pull
request. Se a sua sessão tiver instrução de atribuição, esta convenção
prevalece: ela é do dono do repositório.

```
feat: add backoffice shell
fix: correct dark theme action color contrast
docs: archive dark-action-color and sync design-tokens spec
```

## Pull request

Título em português. Corpo em português, nestas seções:

`## Resumo` · `## Estado atual confirmado` · `## Decisão operacional` ·
`## Escopo` · `## Verificação`

O `## Escopo` diz o que a mudança **não** faz, com frases inteiras.

**Você não dá push e não abre o pull request.** Entregue o nome da branch, o
título e o corpo como texto, e pare. Quem abre é o dono do repositório — o
ponto do acordo é ele ler o texto antes de ele existir em público.

## O portão

```bash
pnpm verify
```

Quatro estágios em sequência: `verify:types`, `verify:format`, `verify:lint`,
`verify:test`. Precisa passar antes de a mudança ser dada como aplicada, e a
main é protegida: só entra por pull request com o check `verify` verde.

Código, história no Storybook e teste entram **juntos**. Tarefa sem teste
correspondente não está pronta.

## O que nunca fazer

**Nunca preencha uma decisão em aberto por suposição.** Registre a lacuna e
pare. Isso vale dentro de uma proposta, de um design e de uma implementação.
Parar é o comportamento certo, não uma falha.

**Nunca faça um teste pular quando não encontra o que procura.** A ausência
reprova, nomeando o que procurou e onde. Um teste que pula transforma quebra em
silêncio.

**Nunca acrescente repetição nem aumente tempo limite para contornar um teste
instável.** Há um incidente aberto sobre isso em
[`docs/incidente-instabilidade-da-bancada.md`](docs/incidente-instabilidade-da-bancada.md),
com quatro hipóteses já eliminadas. Se uma história de interação falhar com a
mesma assinatura, a investigação é retomada de onde parou.

**Nunca edite `openspec/specs/` diretamente.** Spec viva muda por ciclo. A
exceção é correção editorial que não altera o que obriga — e reescrever uma
frase que decide algo não é editorial, mesmo que ela não tenha `SHALL`.

**Nunca declare valor literal** de cor, espaçamento, raio, sombra ou tipografia
fora de `@chargebr/tokens`. Só token.

**Nenhum componente busca dados.** Dado chega por propriedade.

**Nunca afirme acessibilidade sem execução registrada do axe.**

## Perímetros

`packages/**` não importa `next`, `next/**` nem `apps/**`. A aplicação importa
de `@chargebr/ui` e `@chargebr/tokens` pelo subpath publicado; o inverso nunca
acontece. As listas por perímetro estão em `biome.json`, cada proibição com sua
razão registrada no design do ciclo que a criou.

Quatro guardiões rodam dentro de `verify:test`, em `tools/checks/`:

- `style-literals` — literal de estilo fora de tokens;
- `component-vocabulary` — componente declarando rótulo em português no próprio
  arquivo;
- `fixture-origin` — fixture sem origem declarada;
- `type-suppression` — supressão de tipo sem justificativa.

## Onde as regras de conteúdo moram

O que uma proposta, uma spec, um design e uma lista de tarefas precisam conter
está em `openspec/config.yaml`, em `rules`. Aquele arquivo é a autoridade — não
duplique as regras aqui, leia lá.

Duas que se erram com frequência:

- Todo critério de aceite nomeia o teste que o prova, e descreve comportamento
  observável, nunca implementação ou biblioteca.
- O corpo de um requisito contém só o que obriga; a razão vai em bloco aberto
  por `**Por quê:**`.
