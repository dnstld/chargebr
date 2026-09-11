# Resultado da aplicação do histórico metodológico de métricas

## Estado

`EXECUTADA — AGUARDANDO REVISÃO`

Este documento registra a aplicação, no Supabase, da migration estrutural aprovada
para o histórico metodológico de métricas. A execução ocorreu somente depois do
`ACCEPTED` e do merge do PR #81 na `main`. Nenhuma versão metodológica,
componente, evidência, relação ou atribuição de valor foi carregada nesta etapa.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Decisão | [Decisão de modelagem: revisão metodológica `0007`](decisao-modelagem-revisao-metodologica-0007.md) |
| Arquivo | [`20260910191824_metric_methodology_history.sql`](../supabase/migrations/20260910191824_metric_methodology_history.sql) |
| Data da execução | 11 de setembro de 2026 |
| Autorização | Merge do PR #81 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `3b62064` |
| Commit da `main` usado | `5fea642` |
| SHA-256 do arquivo | `bd0a0dfa8e7d388028700640395f646f00ada1f10b98f31883c28209f92d7cf5` |
| Nome lógico aplicado | `metric_methodology_history` |
| Versão registrada no Supabase | `20260911080829` |
| Resultado | `SUCCESS` |

O arquivo da `main` era byte a byte idêntico ao arquivo aceito no commit
`3b62064`. O SQL foi lido diretamente desse arquivo e enviado integralmente ao
mecanismo de migrations do Supabase, sem correção, transformação ou cópia manual
intermediária.

## Distinção entre as duas versões

O arquivo no Git possui o timestamp `20260910191824`, produzido pela Supabase
CLI quando a migration foi criada. O histórico remoto atribuiu à aplicação a
versão `20260911080829`.

Esses números identificam momentos diferentes:

- `20260910191824`: criação do arquivo versionado e revisado no Git;
- `20260911080829`: registro da execução pelo mecanismo remoto.

O nome lógico registrado é `metric_methodology_history`. A identidade do
conteúdo aplicado foi controlada pelo arquivo aceito e por seu SHA-256. A
diferença entre os timestamps não representa uma segunda migration nem uma
alteração do SQL.

## Verificação anterior à aplicação

Antes da execução, consultas somente de leitura confirmaram:

- ausência das cinco tabelas propostas;
- 16 tabelas públicas;
- 16 migrations no histórico;
- `canonical_resolution_history`, versão `20260908161536`, como migration
  remota mais recente;
- contagens dos registros canônicos para comparação posterior;
- 16 ocorrências informativas de `rls_enabled_no_policy`;
- nove ocorrências informativas de `unused_index`.

## Procedimento

1. O merge do PR #81 foi confirmado no GitHub.
2. A `main` foi sincronizada no commit `5fea642`.
3. O arquivo foi comparado com o commit aceito e os dois SHA-256 coincidiram.
4. A consulta anterior confirmou que as cinco tabelas ainda não existiam.
5. O arquivo aceito foi aplicado uma única vez pelo mecanismo de migrations do
   Supabase.
6. O catálogo do PostgreSQL foi consultado para verificar tabelas, colunas,
   comentários, restrições, índices, chaves estrangeiras, RLS, policies e
   privilégios.
7. As contagens das 16 tabelas anteriores foram comparadas com o retrato prévio.
8. O histórico remoto de migrations foi conferido novamente.
9. Os advisors de segurança e desempenho foram executados e comparados com a
   linha de base anterior.

## Estrutura criada

| Tabela | Colunas | Finalidade | Linhas após a aplicação |
| --- | ---: | --- | ---: |
| `metric_methodology_versions` | 8 | Preservar versões imutáveis de uma metodologia | 0 |
| `metric_methodology_components` | 6 | Tornar consultável o tratamento de cada componente | 0 |
| `metric_methodology_evidence` | 5 | Ligar evidências às versões metodológicas | 0 |
| `metric_methodology_relations` | 7 | Registrar substituição dirigida entre versões | 0 |
| `metric_value_methodology_assignments` | 6 | Atribuir metodologia, origem e papel documental a um valor | 0 |
| **Total** | **32** |  | **0** |

As cinco tabelas e suas 32 colunas possuem comentários.

## Restrições e índices

| Tabela | Restrições | Índices |
| --- | ---: | ---: |
| `metric_methodology_versions` | 8 | 3 |
| `metric_methodology_components` | 7 | 1 |
| `metric_methodology_evidence` | 5 | 2 |
| `metric_methodology_relations` | 8 | 4 |
| `metric_value_methodology_assignments` | 6 | 2 |
| **Total** | **34** | **12** |

A verificação confirmou:

- nove chaves estrangeiras, todas com `on delete restrict`;
- cobertura por índice das nove chaves estrangeiras;
- unicidade de `methodology_key`;
- um único sucessor direto para cada versão anterior;
- uma única atribuição metodológica para cada valor;
- rejeição de relação autorreferente;
- vocabulários controlados para componentes, evidências, relações, origem e
  papel dos valores;
- `value_origin` limitado a `source_published`, sem habilitar derivação pelo
  ChargeBR nesta etapa.

As regras que dependem da comparação entre vários registros — pertencimento das
duas versões à mesma definição de métrica, coerência entre vigência e período e
compatibilidade entre metodologia e valor — permanecem deliberadamente sob
responsabilidade da futura carga transacional, conforme a decisão aceita.

## RLS e privilégios

| Controle | Resultado nas cinco tabelas |
| --- | --- |
| RLS habilitada | Sim |
| Policies | 0 |
| `service_role`: `SELECT` | Sim |
| `service_role`: `INSERT` | Sim |
| `service_role`: `UPDATE` | Não |
| `service_role`: `DELETE` | Não |
| `anon`: acesso | Nenhum |
| `authenticated`: acesso | Nenhum |
| `PUBLIC`: acesso explícito | Nenhum |

A sequência de identidade de `metric_methodology_versions` concede ao
`service_role` somente `USAGE` e `SELECT`. Não há concessão de `UPDATE`.
`PUBLIC`, `anon` e `authenticated` não possuem privilégios nas tabelas ou
na sequência nova.

A ausência de policies é intencional: nenhuma função do aplicativo deve acessar
essas tabelas como `anon` ou `authenticated` nesta fase. RLS e revogações
explícitas mantêm as estruturas fechadas independentemente da configuração de
exposição da Data API.

## Preservação dos dados existentes

| Tabela anterior | Antes | Depois |
| --- | ---: | ---: |
| `sources` | 4 | 4 |
| `content_items` | 9 | 9 |
| `observations` | 9 | 9 |
| `evidence` | 9 | 9 |
| `events` | 8 | 8 |
| `event_evidence` | 10 | 10 |
| `regulatory_instruments` | 0 | 0 |
| `metric_definitions` | 3 | 3 |
| `metric_values` | 6 | 6 |
| `organizations` | 4 | 4 |
| `event_organizations` | 10 | 10 |
| `event_regulatory_instruments` | 0 | 0 |
| `regulatory_instrument_relations` | 0 | 0 |
| `content_item_relations` | 1 | 1 |
| `metric_value_resolutions` | 1 | 1 |
| `metric_value_status_transitions` | 2 | 2 |

As contagens permaneceram idênticas. As cinco tabelas novas terminaram vazias.
Nenhum valor métrico ou registro metodológico foi criado, alterado, rejeitado ou
substituído durante a aplicação.

## Histórico de migrations

| Verificação | Antes | Depois |
| --- | --- | --- |
| Quantidade de migrations | 16 | 17 |
| Migration mais recente | `canonical_resolution_history` | `metric_methodology_history` |
| Versão mais recente | `20260908161536` | `20260911080829` |

O histórico contém uma nova migration, correspondente à única aplicação desta
etapa.

## Advisors do Supabase

### Segurança

O advisor retornou somente o item informativo
[`rls_enabled_no_policy`](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
A quantidade passou de 16 para 21, acrescentando exatamente as cinco tabelas
novas.

Nessas tabelas, o resultado confirma o desenho deliberado: RLS está habilitada,
não há policy pública e `PUBLIC`, `anon` e `authenticated` não receberam
privilégios. Portanto, o item não representa exposição ou correção pendente
neste modelo fechado.

### Desempenho

O advisor retornou somente o item informativo
[`unused_index`](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
A quantidade passou de nove para 14, acrescentando os cinco índices novos:

- `metric_methodology_versions_definition_applies_idx`;
- `metric_methodology_evidence_evidence_id_idx`;
- `metric_methodology_relations_later_id_idx`;
- `metric_methodology_relations_evidence_id_idx`;
- `metric_value_methodology_assignments_version_role_idx`.

As tabelas estão vazias e esses índices ainda não poderiam ter sido usados. Eles
serão mantidos porque cobrem chaves estrangeiras ou consultas previstas pela
modelagem. O resultado não indica regressão nem justifica remoção.

Nenhum advisor retornou nível de alerta ou erro que exija mudança nesta
migration.

## Objetos deliberadamente ausentes

A inspeção do arquivo e do catálogo confirmou:

- nenhuma view;
- nenhuma função;
- nenhum trigger de usuário;
- nenhuma policy;
- nenhuma linha de dados.

## Validação anterior ao merge

Antes do merge, a migration completa foi executada no projeto Supabase dentro
de uma única transação encerrada com `ROLLBACK`. O ensaio confirmou as cinco
tabelas, 34 restrições, 12 índices, comentários, RLS, privilégios e inserções
temporárias representativas. Também rejeitou sete casos inválidos.

Depois do `ROLLBACK`, o projeto continuou com 16 tabelas, 16 migrations,
contagens canônicas idênticas e nenhuma das cinco tabelas propostas. Depois do
merge, a migration foi aplicada ao projeto permanente e verificada diretamente
no catálogo real. Nenhum fixture foi inserido novamente no projeto permanente.

## Conclusão

A migration `metric_methodology_history` foi aplicada com sucesso. O Supabase
agora possui a estrutura necessária para preservar versões metodológicas,
componentes, evidências, substituições entre metodologias e a atribuição
metodológica de valores, sem alterar qualquer registro anterior e sem carregar
ainda o caso `0007`.

O resultado deve ser revisado e incorporado à `main` antes da preparação do
pacote da carga canônica `0007`.

## Perguntas para revisão

1. A aplicação usou o arquivo aceito e incorporado à `main`, com commits e
   SHA-256 documentados?
2. Está clara a diferença entre o timestamp do arquivo no Git e a versão
   registrada pelo mecanismo remoto?
3. As cinco tabelas, 32 colunas, 34 restrições e 12 índices correspondem à
   modelagem aceita?
4. A verificação demonstra que as nove chaves estrangeiras usam
   `on delete restrict` e possuem cobertura por índice?
5. RLS, ausência de policies públicas e privilégios `SELECT` + `INSERT`
   mantêm as tabelas fechadas e imutáveis como decidido?
6. Está claro que `value_origin` permanece limitado a `source_published` e
   que valores derivados ainda não foram habilitados?
7. As contagens idênticas demonstram que os 16 conjuntos de registros
   anteriores permaneceram preservados?
8. Está documentado que as cinco tabelas novas estão vazias e que nenhum dado
   do caso `0007` foi carregado?
9. Os resultados informativos dos advisors foram comparados com a linha de base
   e interpretados corretamente?
10. O conjunto de verificações permite considerar a aplicação bem-sucedida e
    avançar, depois do merge, para a preparação da carga canônica `0007`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta
for `não`, indique o número e a correção necessária. Este PR não deve ser
incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | Pendente |
| Resultado | `PENDING` |

