# Revisão da implementação do acesso do collector à ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este pacote implementa exclusivamente as cinco policies aprovadas na
[decisão de acesso mínimo do collector à
ANEEL](decisao-acesso-collector-aneel.md). A migration ainda não foi aplicada
ao Supabase remoto.

## Arquivos executáveis

- [migration `extend_collector_access_to_aneel`](../supabase/migrations/20260929214528_extend_collector_access_to_aneel.sql);
- [teste pgTAP do acesso ANEEL](../supabase/tests/collector_aneel_access_v1_test.sql).

Hashes SHA-256 revisados:

```text
e91c31e784d50836c7ec6229f46a27ed467f0454f7e4d2e36019b55f43a3a760  20260929214528_extend_collector_access_to_aneel.sql
168a14fa2d0d50e889679fefe99944e05be5c0f837eaa141a93dff3cb081f141  collector_aneel_access_v1_test.sql
```

## Mudança proposta

A migration foi criada pelo Supabase CLI e acrescenta somente estas policies
permissivas para `chargebr_collector_0001`:

1. `sources_collector_aneel_select`;
2. `source_endpoints_collector_aneel_select`;
3. `collection_runs_collector_aneel_select`;
4. `collection_runs_collector_aneel_insert`;
5. `collection_runs_collector_aneel_update`.

Todas exigem o par exato `sources.slug = 'aneel'` e
`source_endpoints.endpoint_key = 'aneel-board-meetings-index'`. O insert de
run exige ainda `status = 'running'` e `trigger_kind = 'manual_local'`.

Não há criação ou alteração de role, senha, grant, tabela, coluna, índice,
trigger, constraint ou dado. As cinco policies ABVE permanecem inalteradas.

## Validação descartável

Em 30 de setembro de 2026, todas as 21 migrations da `main` e deste pacote
foram aplicadas do zero em PostgreSQL 17.6, dentro de um contêiner local
descartável. A lista de migrations ficou integralmente alinhada e o lint do
schema `public` terminou com `No schema errors found`.

O teste pgTAP executou 16 asserções e terminou com `Result: PASS`. Ele prova:

- presença exata das cinco policies novas;
- preservação dos atributos restritos da role;
- visibilidade somente das sources e endpoints ABVE e ANEEL aprovados;
- manutenção do bloqueio às demais colunas de `sources`;
- invisibilidade de runs pertencentes a endpoint não aprovado;
- insert de run ANEEL em `running/manual_local`;
- leitura e heartbeat do run ANEEL criado;
- rejeição de insert para endpoint não aprovado;
- rejeição de `DELETE` em `collection_runs`;
- rejeição de insert em `sources`;
- rejeição de update em `source_endpoints`;
- rejeição de leitura em `content_items`.

Fixtures, grants auxiliares do executor de teste e runs existiram somente na
transação revertida e no contêiner descartável. Nenhum deles pertence à
migration.

## Verificação do repositório

`pnpm verify` passou integralmente com:

- tipos, formatação e lint sem erro;
- 197 testes do collector e extractor aprovados;
- 58 arquivos e 226 testes Vitest aprovados.

`git diff --check` também passou. Nenhuma migration anterior foi modificada.

## Estado remoto

O projeto Supabase `chargebr` não foi alterado durante a preparação ou a
validação deste pacote. A role remota continua sem policies ANEEL e nenhum run
ANEEL foi criado. A aplicação remota fica bloqueada até o aceite, merge e nova
conferência do hash incorporado à `main`.

## Fora de escopo

- aplicar a migration no Supabase remoto;
- alterar ou rotacionar a senha técnica;
- implementar ou habilitar `pnpm collect aneel`;
- fazer request HTTP à ANEEL;
- persistir runs, manifests, PDFs ou conteúdo canônico;
- alterar o contrato do endpoint ou qualquer policy ABVE.

## Perguntas para revisão

1. As cinco policies correspondem exatamente à decisão aceita?
2. Está correto reutilizar a role e os grants atuais, sem alterar senha?
3. Os 16 testes positivos e negativos demonstram a fronteira mínima esperada?
4. Está correto manter a aplicação remota bloqueada até o merge deste pacote?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta
for `não`, indique o número e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 30 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as quatro decisões e não solicitou
correções. O pacote está liberado para commit e abertura de PR. A aplicação da
migration no Supabase remoto permanece bloqueada até o merge.

## Próxima etapa depois da confirmação e do merge

Sincronizar a `main`, confirmar os dois hashes aceitos, reconfirmar o estado
remoto e aplicar exatamente a migration incorporada pelo mecanismo de
migrations do Supabase. Em seguida, auditar as policies e os diagnósticos,
executar um ensaio mínimo com a identidade real e documentar o resultado em PR
separado antes de implementar o adapter ANEEL.
