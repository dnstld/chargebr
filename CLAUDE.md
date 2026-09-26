# Como trabalhar neste repositório

Este arquivo governa a **frente de interface**: `apps/`, `packages/`,
`openspec/`, `tools/` e a seção Interface de `docs/`. Fora disso não é nosso:
não mexemos, e não escrevemos regra para lá.

O território é declarado pelo que é nosso, nunca pela lista do que é dos
outros — lista alheia envelhece sem avisar e deixa buraco. `src/images/` foi
um: asset de marca, criado e restaurado por ciclos de interface, atrás de uma
cerca desenhada por nome de diretório.

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

**Não leve ao dono pergunta que o repositório responde.** Antes de perguntar,
meça: leia o código, o histórico do git, as specs vivas e os documentos de
decisão. Pergunta que uma leitura resolveria não é consulta, é trabalho
empurrado para cima. Ao dono vão só as perguntas que nenhuma quantidade de
leitura responderia.

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

Uma linha em **PT-BR**, `<tipo>: <ação>`. Tipos: `feat`, `fix`, `docs`, `db`,
`data`, `chore`. O nome da branch continua em inglês.

**Sem corpo. Sem rodapé. Sem assinatura.** Nada de `Co-Authored-By`, nada de
linha de sessão, nada de emoji de robô — nem no commit, nem no corpo do pull
request. Se a sua sessão tiver instrução de atribuição, esta convenção
prevalece: ela é do dono do repositório.

```
feat: acrescenta o shell do back office
fix: corrige o contraste da cor de ação no tema escuro
docs: arquiva dark-action-color e sincroniza a spec de design-tokens
```

## Pull request

Título em PT-BR, uma linha, com o mesmo prefixo de tipo do commit. Corpo em
PT-BR, nestas seções:

`## Resumo` · `## Estado atual confirmado` · `## Decisão operacional` ·
`## Escopo` · `## Verificação`

O `## Escopo` diz o que a mudança **não** faz, com frases inteiras.

**Commitar é seu.** A verificação exige árvore commitada para significar alguma
coisa — `git status` limpo depois do `verify` não prova nada numa árvore suja de
trabalho não commitado.

**Push e abertura do pull request também são seus.** O dono do repositório
revisa no próprio pull request e mergeia. A regra anterior — ele abria, para ler
o texto antes de ele ser público — caiu: ele lê no PR, e o passo manual não
pagava.

**O merge continua sendo dele, sempre,** e o check `verify` precisa estar verde
antes.

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
