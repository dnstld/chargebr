# Resultado da aplicação do histórico de resoluções canônicas

## Estado

`EXECUTADA — EM REVISÃO`

Este documento registra a aplicação, no Supabase, da migration estrutural aprovada para a resolução de conflito `0006`. A execução ocorreu somente depois do `ACCEPTED` e do merge do PR #69 na `main`. Nenhum dado do caso `0006` foi carregado nesta etapa.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Decisão | [Decisão de modelagem: resolução de conflito `0006`](decisao-modelagem-resolucao-conflito-0006.md) |
| Arquivo | [`20260908152707_canonical_resolution_history.sql`](../supabase/migrations/20260908152707_canonical_resolution_history.sql) |
| Data da execução | 8 de setembro de 2026 |
| Autorização | Merge do PR #69 depois de `ACCEPTED` de Denis Toledo |
| Commit aceito | `3d3fd88` |
| Commit da `main` usado | `9e604ba` |
| SHA-256 do arquivo | `a2cf79459f3c890060d56fabcce1be9e1b042bb87d7a801c0fda3cab3df13eb2` |
| Nome lógico aplicado | `canonical_resolution_history` |
| Versão registrada no Supabase | `20260908161536` |
| Resultado | `SUCCESS` |

O arquivo da `main` era byte a byte idêntico ao arquivo aceito no commit `3d3fd88`. O SQL foi lido diretamente desse arquivo e enviado integralmente ao mecanismo de migrations do Supabase, sem correção, transformação ou cópia manual intermediária.

## Distinção entre as duas versões

O arquivo no Git possui o timestamp `20260908152707`, produzido pela Supabase CLI quando a migration foi criada. O histórico remoto atribuiu à aplicação a versão `20260908161536`.

Esses números identificam momentos diferentes:

- `20260908152707`: criação do arquivo versionado e revisado no Git;
- `20260908161536`: registro da execução pelo mecanismo remoto.

O nome lógico registrado é `canonical_resolution_history`. A identidade do conteúdo aplicado foi controlada pelo arquivo aceito e por seu SHA-256. A diferença entre os timestamps não representa uma segunda migration nem uma alteração do SQL.

## Verificação anterior à aplicação

Antes da execução, uma consulta somente de leitura confirmou:

- ausência de `content_item_relations`;
- ausência de `metric_value_resolutions`;
- ausência de `metric_value_status_transitions`;
- 15 migrations no histórico;
- `event_expiry_phase`, versão `20260903162434`, como migration remota mais recente;
- contagens canônicas registradas para comparação posterior;
- ausência de comentário anterior em `metric_values.value_status`.

## Procedimento

1. O merge do PR #69 foi confirmado no GitHub.
2. A `main` foi sincronizada no commit `9e604ba`.
3. O arquivo foi comparado com o commit aceito e os dois SHA-256 coincidiram.
4. A consulta anterior confirmou que as três tabelas ainda não existiam.
5. O arquivo aceito foi aplicado uma única vez pelo mecanismo de migrations do Supabase.
6. O catálogo do PostgreSQL foi consultado para verificar tabelas, colunas, comentários, restrições, índices, RLS, policies e privilégios.
7. As contagens de todas as tabelas anteriores foram comparadas com o retrato prévio.
8. O histórico remoto de migrations foi conferido novamente.
9. Os advisors de segurança e desempenho foram executados.

## Estrutura criada

| Tabela | Colunas | Finalidade | Linhas após a aplicação |
| --- | ---: | --- | ---: |
| `content_item_relations` | 7 | Relacionar versões anterior e posterior de um conteúdo | 0 |
| `metric_value_resolutions` | 9 | Registrar a decisão canônica que resolveu um conflito | 0 |
| `metric_value_status_transitions` | 10 | Preservar mudanças ordenadas de situação dos valores | 0 |

As três tabelas e todas as suas colunas possuem comentários. O comentário de `metric_values.value_status` passou a declarar:

> Situação atual do valor; o histórico de mudanças fica em metric_value_status_transitions.

## Restrições e índices

| Tabela | Restrições | Índices |
| --- | ---: | ---: |
| `content_item_relations` | 7 | 3 |
| `metric_value_resolutions` | 8 | 3 |
| `metric_value_status_transitions` | 15 | 5 |
| **Total** | **30** | **11** |

A verificação confirmou:

- sete chaves estrangeiras, todas com `on delete restrict`;
- nenhuma chave estrangeira sem cobertura por índice;
- chave primária composta da relação entre conteúdos;
- unicidade de `resolution_key` e `transition_key`;
- unicidade de uma transição por valor em cada resolução;
- unicidade da ordem de transição dentro de cada valor;
- índice parcial para o valor substituto quando não for nulo;
- vocabulários controlados para relações, resoluções e estados;
- rejeição de autorrelação direta, ordem não positiva, estados iguais e combinações inválidas de substituição.

As regras que dependem da comparação entre várias linhas — continuidade sem lacunas, coerência entre versões e coincidência com a situação atual — permanecem deliberadamente sob responsabilidade da futura carga transacional e de sua consulta reutilizável, conforme a decisão aceita.

## RLS e privilégios

| Controle | `content_item_relations` | `metric_value_resolutions` | `metric_value_status_transitions` |
| --- | --- | --- | --- |
| RLS habilitada | Sim | Sim | Sim |
| Policies | 0 | 0 | 0 |
| `service_role`: `SELECT` | Sim | Sim | Sim |
| `service_role`: `INSERT` | Sim | Sim | Sim |
| `service_role`: `UPDATE` | Não | Não | Não |
| `service_role`: `DELETE` | Não | Não | Não |
| `anon`: acesso | Nenhum | Nenhum | Nenhum |
| `authenticated`: acesso | Nenhum | Nenhum | Nenhum |
| `PUBLIC`: acesso explícito | Nenhum | Nenhum | Nenhum |

As duas sequências de identidade concedem ao `service_role` somente `USAGE` e `SELECT`. Não há concessão de `UPDATE`. `PUBLIC`, `anon` e `authenticated` não possuem privilégios explícitos nas tabelas ou sequências novas.

A ausência de policies é intencional: nenhuma função do aplicativo deve acessar essas tabelas como `anon` ou `authenticated` nesta fase. RLS e revogações explícitas preservam o fechamento mesmo se a configuração de exposição da Data API mudar.

## Preservação dos dados existentes

| Tabela anterior | Antes | Depois |
| --- | ---: | ---: |
| `sources` | 4 | 4 |
| `content_items` | 6 | 6 |
| `observations` | 6 | 6 |
| `evidence` | 6 | 6 |
| `events` | 5 | 5 |
| `event_evidence` | 6 | 6 |
| `regulatory_instruments` | 0 | 0 |
| `metric_definitions` | 2 | 2 |
| `metric_values` | 3 | 3 |
| `organizations` | 4 | 4 |
| `event_organizations` | 7 | 7 |
| `event_regulatory_instruments` | 0 | 0 |
| `regulatory_instrument_relations` | 0 | 0 |

As contagens permaneceram idênticas. As três tabelas novas terminaram vazias. Nenhum valor métrico foi validado, rejeitado ou substituído durante a aplicação.

## Histórico de migrations

| Verificação | Antes | Depois |
| --- | --- | --- |
| Quantidade de migrations | 15 | 16 |
| Migration mais recente | `event_expiry_phase` | `canonical_resolution_history` |
| Versão mais recente | `20260903162434` | `20260908161536` |

O histórico contém uma nova migration, correspondente à única aplicação desta etapa.

## Advisors do Supabase

### Segurança

O advisor retornou somente o item informativo [`rls_enabled_no_policy`](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), presente nas 16 tabelas públicas.

Nas três tabelas novas, esse resultado confirma o desenho deliberado: RLS está habilitada, não há policy pública e `PUBLIC`, `anon` e `authenticated` não receberam privilégios. Portanto, o aviso não representa exposição ou correção pendente neste modelo fechado.

### Desempenho

O advisor retornou somente o item informativo [`unused_index`](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), com nove índices no projeto. Quatro pertencem às tabelas recém-criadas:

- `content_item_relations_later_id_idx`;
- `content_item_relations_evidence_id_idx`;
- `metric_value_resolutions_event_id_idx`;
- `metric_value_status_transitions_replacement_id_idx`.

As tabelas estão vazias e os índices ainda não poderiam ter sido usados. Eles serão mantidos porque cobrem chaves estrangeiras no sentido inverso e consultas previstas pela modelagem. O resultado não indica regressão nem justifica remoção.

Nenhum advisor retornou nível de alerta ou erro que exija mudança nesta migration.

## Objetos deliberadamente ausentes

A consulta ao catálogo confirmou zero objetos adicionais associados às três tabelas:

- nenhuma view;
- nenhuma função;
- nenhum trigger de usuário;
- nenhuma policy;
- nenhuma linha de dados.

## Limitação da validação local

O Docker local disponível nesta máquina não possui executável funcional. Por isso, `supabase db reset --local`, `supabase migration list --local` e os advisors de uma instância Supabase local não puderam ser executados antes do PR #69.

Antes do merge, a sintaxe e a cadeia das 16 migrations foram executadas em PostgreSQL descartável em memória. Depois do merge, a migration foi aplicada ao projeto permanente e verificada diretamente no catálogo real, incluindo os advisors oficiais. Nenhum fixture foi inserido no projeto permanente para repetir testes destrutivos de restrições.

## Conclusão

A migration `canonical_resolution_history` foi aplicada com sucesso. O Supabase agora representa versões de conteúdo, resoluções canônicas e transições ordenadas de valores sem alterar qualquer registro anterior e sem carregar o caso `0006`.

O resultado deve ser revisado e incorporado à `main` antes da preparação do pacote da carga canônica `0006`.

## Perguntas para revisão

1. A aplicação usou o arquivo aceito e incorporado à `main`, com commits e SHA-256 documentados?
2. Está clara a diferença entre o timestamp do arquivo no Git e a versão registrada pelo mecanismo remoto?
3. As três tabelas, 30 restrições e 11 índices correspondem à modelagem aceita?
4. A verificação demonstra que todas as chaves estrangeiras possuem `on delete restrict` e cobertura por índice?
5. RLS, ausência de policies públicas e privilégios mínimos mantêm as tabelas fechadas como decidido?
6. As contagens idênticas demonstram que os registros anteriores permaneceram preservados?
7. Está documentado que as três tabelas novas estão vazias e que nenhum estado de valor foi alterado?
8. Os resultados informativos dos advisors foram interpretados corretamente e não exigem correção nesta etapa?
9. A limitação da validação local e a verificação posterior no projeto real estão descritas com transparência suficiente?
10. O conjunto de verificações permite considerar a aplicação bem-sucedida e avançar, depois do merge, para a preparação da carga `0006`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |
