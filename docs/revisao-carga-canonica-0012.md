# Revisão da carga canônica `0012`

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este pacote implementa exclusivamente a transição confirmada do endpoint
`aneel-board-meetings-index` de `active` para `unavailable`. Nenhuma alteração
foi aplicada ao Supabase remoto.

Arquivos executáveis:

- [carga canônica `0012`](../data/canonical/0012_aneel-board-meetings-index-unavailable.sql);
- [consulta de verificação reutilizável](../data/canonical/0012_aneel-board-meetings-index-unavailable.verify.sql).

## Base incorporada

A branch foi criada a partir da `main` no commit
`74273e242b3e76f3e723debb1eba0bb882dbb874`, merge do PR #197. Nesse estado, a
decisão de indisponibilidade está confirmada e o endpoint remoto ainda deve
permanecer `active` até o aceite, merge e aplicação desta carga.

Uma leitura remota em 1º de outubro de 2026 confirmou exatamente uma linha com:

```text
source: aneel
endpoint_key: aneel-board-meetings-index
status: active
access_reviewed_at: 2026-09-25T05:11:10Z
updated_at: 2026-09-29T21:33:45.213467Z
collection_run_count: 0
```

A consulta foi somente leitura. Nenhuma linha remota foi alterada durante a
preparação ou a validação deste pacote.

## Mudança proposta

A carga altera somente:

| Campo | Antes | Depois |
| --- | --- | --- |
| `status` | `active` | `unavailable` |
| `updated_at` | valor existente | maior valor entre `created_at`, o valor existente e `2026-09-30T16:58:59Z` |

O instante fixo corresponde ao merge da decisão no PR #197. Ele torna a
transição determinística e impede que uma repetição idempotente reescreva o
timestamp.

Todos os demais campos precisam corresponder integralmente ao contrato da carga
`0011` e permanecem inalterados, inclusive:

- identidade, source e endpoint key;
- URL, método, formato e limites HTTP;
- paginação, cursor, identidade nativa e normalização;
- retenção, termos e robots;
- `access_reviewed_at = 2026-09-25T05:11:10Z`;
- notas e timestamps de criação.

`access_reviewed_at` permanece porque nenhuma configuração sensível de acesso
foi modificada. O timestamp continua descrevendo a configuração aprovada, não
uma garantia de disponibilidade atual.

## Proteções operacionais

A carga:

1. exige resolução única de `sources.slug = 'aneel'`;
2. exige exatamente um endpoint com a chave aprovada;
3. aceita somente o estado integral antigo ou o estado integral novo;
4. recusa conteúdo parcialmente alterado ou divergente;
5. permite apenas a transição suportada `active → unavailable`;
6. preserva a quantidade e a assinatura de todas as sources;
7. preserva a quantidade e a assinatura de todos os demais endpoints;
8. preserva identidade e todos os campos não autorizados do target;
9. preserva integralmente `collection_runs`;
10. pode ser executada novamente sem nova alteração;
11. não controla a transação, mantendo validação e persistência explicitamente
    separadas.

A consulta reutilizável retorna:

- `old`: contrato exato ainda em `active`;
- `complete`: contrato exato já em `unavailable` e timestamp válido;
- `unexpected`: resolução, conteúdo ou estado divergente.

## Validação descartável

Em 1º de outubro de 2026, as 21 migrations e o seed da `main` foram aplicados
do zero sobre a imagem oficial
`public.ecr.aws/supabase/postgres:17.6.1.121`. Em seguida, as cargas `0008`,
`0009`, `0010` e `0011` reproduziram o estado canônico anterior.

Antes do ensaio, a consulta `0012` retornou:

```text
load_0012_state: old
aneel_sources: 1
target_endpoints: 1
old_rows: 1
exact_rows: 0
other_source_endpoints: 1
other_source_endpoints_signature: 67ba43e57e82e6c0efb6ea6cacc87af8
collection_runs: 0
collection_runs_signature: d751713988987e9331980363e24189ce
```

Dentro de uma única transação:

1. a carga foi executada;
2. a mesma carga foi executada novamente;
3. a consulta retornou `complete`, um target e uma linha exata;
4. o status ficou `unavailable`;
5. as assinaturas dos demais endpoints e de `collection_runs` permaneceram
   idênticas;
6. a transação terminou com `ROLLBACK`.

Depois do rollback, a consulta voltou a `old` com as mesmas assinaturas.

Um teste negativo adicional alterou apenas as notas do target dentro de outra
transação. A carga interrompeu com:

```text
Carga 0012: o endpoint ANEEL não está em estado OLD nem NEW; recusando alteração parcial.
```

A desconexão reverteu a transação e a verificação seguinte continuou em `old`.
Nenhuma linha do ensaio permaneceu.

Hashes SHA-256 dos arquivos ensaiados:

```text
b8bc4bed3ea5c0db22e53dbb9513e670717516d1473de84b458090425dd1201a  0012_aneel-board-meetings-index-unavailable.sql
46ee2a45bfed9055f5523d2b86d59f07bfb47cd0d917459a15b2ed7c08a44b61  0012_aneel-board-meetings-index-unavailable.verify.sql
```

## Verificação do repositório

`pnpm verify` passou integralmente com:

- tipos, formato e lint sem erro;
- 212 testes do collector e extractor aprovados;
- 58 arquivos e 226 testes Vitest aprovados;
- build de produção concluído.

As verificações de whitespace dos quatro arquivos do pacote também terminaram
sem erros.

## Efeito depois da futura aplicação

Com o endpoint remoto em `unavailable`, o runner ANEEL encerrará antes de fazer
request HTTP e antes de inserir `collection_run`. O adapter, as policies e o
histórico continuarão presentes. ABVE e seus runs não serão alterados.

## Fora de escopo

- executar a carga no Supabase remoto;
- modificar schema, migration, trigger, grant, policy ou credencial;
- criar, alterar ou apagar `collection_runs`;
- remover ou modificar o adapter ANEEL;
- revalidar ou substituir o endpoint;
- alterar ABVE;
- decidir qualquer componente do backend.

## Perguntas para revisão

1. Está correto alterar somente `status` e o piso determinístico de
   `updated_at`?
2. Está correto preservar `access_reviewed_at` porque o contrato sensível não
   mudou?
3. As verificações de estado integral, assinaturas e contagens protegem todas as
   linhas fora do alvo?
4. A execução dupla, o rollback e o teste negativo demonstram idempotência e
   recusa de divergência?
5. Está correto manter aplicação remota e auditoria em etapas posteriores e
   separadas?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta for
`não`, indique o número e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 1º de outubro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as cinco decisões e não solicitou
correções. O pacote está liberado para commit e abertura de PR. A aplicação no
Supabase remoto permanece bloqueada até o merge e uma nova conferência dos
hashes incorporados à `main`.
