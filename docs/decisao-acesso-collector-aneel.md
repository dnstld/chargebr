# Decisão: acesso mínimo do collector ao endpoint ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este documento decide exclusivamente como estender a role técnica existente
`chargebr_collector_0001` para o endpoint
`aneel-board-meetings-index`. Esta etapa não cria migration, não altera o
Supabase, não implementa o adapter e não executa coleta.

## Decisão proposta

1. reutilizar a role `chargebr_collector_0001` e sua credencial atual;
2. manter integralmente os grants por objeto e coluna já existentes;
3. manter integralmente as cinco policies ABVE existentes;
4. adicionar cinco policies permissivas específicas para ANEEL, uma para cada
   operação já autorizada no fluxo ABVE;
5. restringir todas as policies ao par exato `sources.slug = 'aneel'` e
   `source_endpoints.endpoint_key = 'aneel-board-meetings-index'`;
6. continuar exigindo `status = 'running'` e
   `trigger_kind = 'manual_local'` em inserts de `collection_runs`;
7. implementar e aplicar a mudança somente em PRs posteriores e separados.

Não será criada `chargebr_collector_0002`, não haverá policy genérica por tipo
de endpoint e as policies ABVE não serão consolidadas ou reescritas.

## Estado remoto confirmado

Em 29 de setembro de 2026, o catálogo do projeto `chargebr` confirmou:

- a role `chargebr_collector_0001` existe com `LOGIN`, `NOSUPERUSER`,
  `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, `NOBYPASSRLS` e limite de
  duas conexões;
- RLS está habilitado em `sources`, `source_endpoints` e `collection_runs`;
- a role possui cinco policies, todas específicas para ABVE;
- `sources` permite somente `SELECT (id, slug)`;
- `source_endpoints` permite somente `SELECT`;
- `collection_runs` permite `SELECT`, `INSERT` e `UPDATE` nas colunas já
  aprovadas pelo contrato do collector;
- `collection_runs_id_seq` permite somente `USAGE`;
- não há `DELETE`, `TRUNCATE`, ownership, `BYPASSRLS`, `CREATE` no schema ou
  acesso a tabelas canônicas;
- o banco contém um endpoint ABVE e um endpoint ANEEL, ambos ativos;
- o endpoint ANEEL ainda não possui `collection_runs`.

Os grants existentes já atendem ao lifecycle ANEEL. O bloqueio atual é somente
de linha: as policies permitem exclusivamente a source, o endpoint e os runs
ABVE.

## Por que reutilizar a role existente

ABVE e ANEEL serão adapters do mesmo processo local, com o mesmo contrato de
`collection_runs`, o mesmo lifecycle, as mesmas colunas e a mesma fronteira de
segurança. Uma segunda role exigiria outra credencial e duplicaria grants sem
separar runtimes, operadores ou níveis de confiança.

Reutilizar a role não torna suas policies genéricas. A separação permanece
explícita por source e endpoint: o acesso final é a união das cinco policies
ABVE com cinco policies ANEEL. Um terceiro endpoint continuará invisível até
receber decisão e policies próprias.

A credencial atual não será rotacionada nesta etapa porque não houve exposição
ou comprometimento. Rotação permanece um procedimento administrativo
independente e não deve ser usada como efeito colateral de uma ampliação de
RLS.

## Policies propostas

### Source ANEEL

```sql
create policy sources_collector_aneel_select
on public.sources
for select
to chargebr_collector_0001
using (slug = 'aneel');
```

A role continuará vendo somente `id` e `slug`, por causa do grant por coluna.
Ela não receberá homepage, classificação editorial, notas ou timestamps da
source.

### Endpoint ANEEL

```sql
create policy source_endpoints_collector_aneel_select
on public.source_endpoints
for select
to chargebr_collector_0001
using (
  endpoint_key = 'aneel-board-meetings-index'
  and exists (
    select 1
    from public.sources
    where sources.id = source_endpoints.source_id
      and sources.slug = 'aneel'
  )
);
```

A policy não filtra `status`. Isso permite que o collector diferencie endpoint
ausente de endpoint presente porém pausado, indisponível ou aposentado. A
aplicação continua obrigada a exigir `active` antes de criar run ou fazer HTTP.

### Leitura dos runs ANEEL

```sql
create policy collection_runs_collector_aneel_select
on public.collection_runs
for select
to chargebr_collector_0001
using (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
);
```

Essa leitura cobre somente concorrência, stale reconciliation, cursor e
manifest anterior do endpoint ANEEL.

### Criação de runs ANEEL

```sql
create policy collection_runs_collector_aneel_insert
on public.collection_runs
for insert
to chargebr_collector_0001
with check (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
  and status = 'running'
  and trigger_kind = 'manual_local'
);
```

Os grants por coluna continuam impedindo que a criação grave campos terminais,
timestamps gerenciados pelo banco ou qualquer coluna não prevista no contrato.

### Atualização de runs ANEEL

```sql
create policy collection_runs_collector_aneel_update
on public.collection_runs
for update
to chargebr_collector_0001
using (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
)
with check (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
);
```

`USING` e `WITH CHECK` mantêm a linha no mesmo endpoint autorizado. Grants por
coluna, constraints e a trigger existente continuam protegendo identidade,
transições, contagens, cursor e imutabilidade terminal.

## Efeito agregado esperado

Depois da migration, a role poderá:

| Operação | ABVE | ANEEL | Outros registros |
| --- | --- | --- | --- |
| Ler `sources.id, slug` | sim | sim | não |
| Ler contrato de `source_endpoints` | sim | sim | não |
| Ler `collection_runs` | somente do endpoint ABVE | somente do endpoint ANEEL | não |
| Inserir run `running/manual_local` | sim | sim | não |
| Atualizar colunas operacionais de run | sim | sim | não |

Policies permissivas do PostgreSQL são combinadas por `OR`. Essa propriedade é
deliberada: cada conjunto permanece estreito, auditável e independente, e a
união concede exatamente os dois pares aprovados.

## O que não muda

- role, login, limite de conexão ou senha;
- grants de banco, schema, tabela, coluna ou sequence;
- policies ABVE;
- triggers, constraints, índices ou lifecycle de `collection_runs`;
- RLS ou exposição pela Data API;
- capacidade de escrever `sources` ou `source_endpoints`;
- proibição de acesso a conteúdo, observações, evidências, eventos, métricas,
  organizações e instrumentos regulatórios;
- proibição de `DELETE`, `TRUNCATE`, DDL, ownership e `BYPASSRLS`;
- execução manual/local e `trigger_kind = 'manual_local'`.

A mudança de exposição automática de novas tabelas na Data API não altera esta
decisão. O collector usa conexão PostgreSQL direta com uma role própria, e os
grants e as policies são explícitos.

## Implementação futura

Depois do aceite e merge desta decisão, outro PR deverá:

1. criar a migration pelo Supabase CLI, sem inventar timestamp manualmente;
2. adicionar somente as cinco policies descritas acima;
3. preservar byte a byte a migration original da role e as policies ABVE;
4. validar a migration em banco local descartável;
5. provar por `SET ROLE chargebr_collector_0001` que apenas os dois pares
   aprovados são visíveis;
6. provar insert e update ANEEL dentro de transação revertida;
7. provar falha para source/endpoint não autorizados, `DELETE`, escrita em
   `sources`/`source_endpoints` e acesso às tabelas canônicas;
8. provar que os testes ABVE continuam passando;
9. executar `pnpm verify`, validar a migration e revisar os advisors;
10. aplicar a migration remota somente depois do merge e documentar o resultado
    em PR separado.

O ensaio não usará IDs internos fixos. Source e endpoint serão resolvidos por
`slug` e `endpoint_key`; qualquer linha temporária de `collection_runs` será
revertida.

## Fora de escopo

- criar ou aplicar a migration neste PR;
- alterar ou rotacionar senha;
- implementar ou habilitar `pnpm collect aneel`;
- fazer request HTTP à ANEEL;
- criar `collection_runs` persistentes;
- baixar ou interpretar PDFs;
- alterar contratos, limites ou retenção do endpoint;
- escrever conteúdo canônico;
- escolher runtime, scheduler, backend ou hospedagem.

## Perguntas para decisão

1. Está correto reutilizar `chargebr_collector_0001`, sem nova role ou senha?
2. Está correto não adicionar grants, pois os privilégios atuais já cobrem o
   lifecycle mínimo?
3. Está correto manter as policies ABVE intactas e adicionar cinco policies
   ANEEL independentes?
4. O par exato `aneel` + `aneel-board-meetings-index` é uma fronteira de RLS
   suficientemente estreita?
5. Está correto permitir leitura de endpoint não ativo para diagnóstico, mas
   exigir `active` na aplicação antes de run ou HTTP?
6. Os testes positivos, negativos e o processo separado de aplicação são
   suficientes para a próxima migration?

Se todas as respostas forem `sim`, registre `CONFIRMADO`. Se alguma resposta
for `não`, indique o número e a correção necessária. Este documento não deverá
ser incorporado antes da decisão.

## Resultado da decisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 29 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as seis decisões e não solicitou
correções. O PR está liberado para merge. Policies, migration, aplicação remota
e adapter continuam em etapas posteriores e separadas.
