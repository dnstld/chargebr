# ChargeBR

Plataforma de inteligência sobre mobilidade elétrica no Brasil.

## Estrutura

| Diretório | O que é |
| --- | --- |
| `apps/backoffice/` | Aplicação Next.js do back office. |
| `packages/tokens/` | `@chargebr/tokens` — fonte DTCG, critérios de paleta e de contraste, geração das custom properties. |
| `packages/ui/` | `@chargebr/ui` — átomos, primitivas de domínio, formas de gráfico e a moldura, com a bancada do Storybook. |
| `openspec/` | Specs vivas, propostas em andamento e ciclos arquivados. |
| `tools/checks/` | Guardiões que rodam com os testes: literal de estilo, vocabulário, origem de fixture, supressão de tipo. |
| `docs/` | Decisões, incidentes e os pontos abertos. Comece por [`docs/README.md`](docs/README.md). |
| `src/`, `queries/`, `supabase/`, `data/`, `tests/` | Frente de coleta. Ver abaixo. |

## Como começar

Requisitos: **Node 24.21.0** (há um `.nvmrc`) e **pnpm 10.34.5** (fixado em `packageManager`).

```bash
git clone git@github.com:dnstld/chargebr.git
cd chargebr
pnpm install

# As histórias rodam num navegador real. Instale o binário uma vez.
pnpm --filter @chargebr/ui exec playwright install chromium

# Confirme que a árvore está sã antes de mexer em qualquer coisa.
pnpm verify
```

`pnpm verify` é o portão do projeto, e são quatro estágios em sequência:

| Estágio | O que faz |
| --- | --- |
| `verify:types` | `tsc --noEmit` em cada pacote. Restrições que viraram tipo reprovam aqui. |
| `verify:format` | Formatação, via Biome. |
| `verify:lint` | Regras de lint e as proibições de importação por perímetro. |
| `verify:test` | Testes, guardiões de `tools/checks/` e as histórias do Storybook num navegador real, com axe em modo de reprovação nos dois temas. |

Cada estágio também roda como passo separado no CI, para que o pull request mostre qual dos quatro falhou.

## Como rodar cada coisa

```bash
# A bancada: histórias, os dois temas, axe.
pnpm --filter @chargebr/ui storybook

# O back office, em desenvolvimento.
pnpm --filter @chargebr/backoffice dev

# Relatórios de cor, quando quiser ver os números por trás dos critérios.
pnpm --filter @chargebr/tokens palette:report
pnpm --filter @chargebr/tokens contrast:report
```

## Como trabalhar neste repositório

O trabalho de interface acontece em ciclos spec-driven com OpenSpec: a decisão é
escrita e revisada **antes** do código, e o código só é dado como pronto quando
uma execução o prova.

### O fluxo

Uma conversa, com os papéis se revezando nela. O dono do repositório é tocado em
três pontos, e só neles: as perguntas que só ele responde, um impasse real entre
agentes, e o pull request.

| | passo | quem |
| --- | --- | --- |
| 1 | **refinar** — afiar a intenção e perguntar ao dono o que só ele responde | `/opsx:explore` |
| 2 | **levantar** — apurar o que existe. Fato, um agente só, sem debate | skill `code-analyst` |
| 3 | **confrontar** — nas decisões caras de reverter, dois agentes independentes: um propõe o melhor caminho, outro procura onde aquilo quebra | briefing por questão |
| 4 | **convergir** — o gerente põe os dois lado a lado; impasse que a medição não resolve sobe para o dono | gerente |
| 5 | **propor** — o ciclo nasce do que convergiu | `/opsx:propose` |
| 6 | **revisar** — quem revisa não escreveu o que revisa, e mede por conta própria | skill `independent-review` |
| 7 | **pull request** — o dono revisa e mergeia | dono |

Depois vêm a implementação (`/opsx:apply`), nova revisão, e o arquivamento
(`/opsx:archive`).

**Fato tem um agente. Decisão cara de reverter tem o par.** Sem esse corte, tudo
custa o dobro sem ganhar nada.

### A regra que vale acima de tudo

Nenhum agente manda em outro. Um achado é **posição com evidência**, nunca
instrução, e traz sempre três partes: o que se mediu, o que se conclui, e o que
faria mudar de ideia. Discordância se resolve por medição; quando a medição não
decide, registram-se as duas posições e leva-se ao dono.

Está por extenso em [`CLAUDE.md`](CLAUDE.md), que é o passo a passo operacional
— ciclo, convenções de branch, commit e pull request, e o que nunca fazer. Está
lá, e não aqui, porque agentes leem aquele arquivo sozinhos a cada sessão.

Os papéis vivem em `.claude/skills/`, versionados junto do código. Papel novo só
existe quando aparece necessidade concreta — mesma regra que o projeto usa para
código.

### Antes de propor qualquer coisa

- **[`docs/pontos-abertos.md`](docs/pontos-abertos.md)** — o que ficou em aberto
  de propósito, com o gatilho de cada ponto.
- **[`docs/forma-do-produto.md`](docs/forma-do-produto.md)** — o que do produto
  está resolvido e o que não está. Muita pergunta de arquitetura é derivada de
  uma que está em aberto ali.

## A frente de coleta

`src/`, `queries/`, `supabase/`, `data/` e `tests/` são da coleta de dados, que
tem processo, vocabulário e ciclo próprios — piloto, carga canônica, fluxo de
inteligência. Nada disso está descrito aqui.

Os documentos dessa frente estão indexados em
[`docs/README.md`](docs/README.md), nas seções de Fundação e Validação.

> Esta seção é um ponteiro, não uma descrição. Quem trabalha na coleta deve
> substituí-la pelo passo a passo real dela.
