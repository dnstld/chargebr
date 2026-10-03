# Parecer independente — banco de dados e segurança

## 1. Identificação

- **Especialidade:** banco de dados e segurança.
- **Agente:** agente independente Codex, sem subagentes.
- **Commit-base:** `d4361e6967ac5e7e7a6ffdcc187aa0b3cb45b803`.
- **Data da revisão:** 2–3 de outubro de 2026.
- **Escopo:** schema, migrations, dados canônicos, integridade, normalização, rastreabilidade, histórico de correções e metodologia, RLS, roles, grants, policies, função privada, separação entre coleta/candidatos/canônico, qualidade, segurança, desempenho, manutenção e compatibilidade documentada com o Supabase remoto.
- **Método:** leitura integral do protocolo; inspeção estática das 21 migrations, 12 pacotes canônicos/ajustes, verificadores, teste pgTAP, consultas e documentação de aplicação; reconstruções descartáveis em PostgreSQL 17/Supabase local; consultas a catálogos; lint e advisors. Nenhuma mudança foi feita no banco remoto.
- **Limitações:** o clone não contém vínculo/configuração local nem credencial de leitura do projeto Supabase; portanto o estado remoto atual não foi consultado diretamente. Fatos remotos provêm dos registros versionados e estão identificados como tal. Não houve workload de produção, estatísticas reais, planos de execução reais, volume relevante nem revalidação externa do conteúdo das URLs.

## 2. Veredito executivo

1. O schema é cuidadoso e defensivo: as 21 migrations sobem do zero, as 23 tabelas têm RLS, e constraints e triggers cobrem muitas invariantes locais.
2. A fronteira privada de leitura é a parte de segurança mais madura: `SECURITY DEFINER`, `search_path` vazio, owner sem login, executor separado e negação explícita à Data API.
3. O maior risco é operacional: o histórico remoto documentado usa versões diferentes dos nomes das migrations no Git, logo o repositório não prova que consegue gerenciar o remoto por fluxo normal de migrations.
4. O banco canônico não é reconstruível por um comando: seed, migrations e cargas reais são trilhas separadas e dependem de uma coreografia histórica não codificada.
5. As cargas canônicas demonstram revisão diligente, idempotência e preservação de correções/metodologias, mas uma carga aceita (`0007`) rejeita o schema atual por contar migrations antigas.
6. Estados como `accepted`, `confirmed` e `validated` não garantem no banco que existam evidência, linhagem e metodologia compatíveis; hoje a integridade semântica depende dos scripts de carga.
7. Coleta e canônico estão separados quanto a privilégios, mas não quanto à linhagem: não há chave entre `collection_runs`/manifestos, candidatos e os registros canônicos resultantes.
8. Supabase/PostgreSQL continuam adequados ao volume e às necessidades observadas, desde que a próxima etapa priorize uma baseline reproduzível e contratos de integridade; migrar de tecnologia agora não é sustentado por evidência.

## 3. O que foi examinado

- 21 arquivos em `supabase/migrations/`, `supabase/seed.sql` e o teste `supabase/tests/collector_aneel_access_v1_test.sql`;
- cargas `0001`–`0012`, seus verificadores e resultados documentados;
- 23 tabelas, 272 colunas, 204 checks, 35 FKs, 23 PKs, 17 constraints únicas, 71 índices e 23 policies materializados localmente;
- quatro roles `chargebr_*`, grants de tabela/coluna/sequência, 23 tabelas com RLS, oito delas deliberadamente sem policy, dois triggers e a função privada;
- consulta metodológica, histórico de resolução, histórico metodológico, endpoints e execuções de coleta;
- documentação de seleção, decisão, revisão e aplicação, inclusive versões registradas remotamente;
- reconstrução limpa das 21 migrations; reconstrução histórica das cargas `0001`, `0002`, `0003`, `0005`, `0006`, `0004`, `0007`, depois das migrations restantes e das cargas `0008`–`0012`;
- `supabase db lint`, advisors de segurança/desempenho, verificadores SQL e tentativa do pgTAP pelo runner atual.

## 4. O que está bem construído

- Todas as migrations aplicaram em uma base vazia e o lint dos schemas `public` e `chargebr_private` terminou sem erro. Não há constraint local não validada.
- RLS está habilitada nas 23 tabelas. A ausência de policy em oito delas fecha o acesso, coerente com grants restritos; não é, por si, vulnerabilidade.
- A função privada possui owner dedicado, `SECURITY DEFINER`, `search_path = ''`, valida `session_user`, rejeita contexto JWT e revoga execução de `PUBLIC`, `anon`, `authenticated` e `service_role` (`20260911171207_expose_methodology_contract_0001.sql:290-323,1031-1054`). A inspeção do catálogo confirmou essas propriedades.
- O collector usa login sem superusuário, `BYPASSRLS` ou criação de roles, limite de duas conexões, grants por coluna e policies específicas (`20260916193622_collector_identity_grants_rls_v1.sql:1-8,21-83`).
- `collection_runs` protege identidade, unicidade de execução ativa, transições, contagens, manifestos e imutabilidade terminal (`20260916083548_source_endpoints_collection_runs_v1.sql:289-484,510-589`).
- O histórico de correções e de metodologias preserva versões, relações e substituições em vez de sobrescrever silenciosamente. A reprodução histórica executou os verificadores `0002`–`0007` com estado `complete`, sem identificadores de piloto.
- As cargas usam identificadores estáveis, checks explícitos e assinaturas do estado anterior. Isso fornece evidência forte de intenção e de não regressão dentro do estado exato para o qual foram escritas.

## 5. Achados priorizados

### BD-01 — Histórico remoto e migrations locais não têm a mesma identidade

- **Prioridade:** crítica.
- **Fato medido:** ao menos quatro migrations têm timestamp de arquivo diferente da versão que a documentação afirma ter sido registrada no remoto.
- **Evidência exata:** resolução `20260908152707` versus `20260908161536` (`docs/resultado-aplicacao-historico-resolucoes-canonicas.md:14-33`); metodologia `20260910191824` versus `20260911080829` (`docs/resultado-aplicacao-historico-metodologico-metricas.md:17-41`); fronteira `20260911171207` versus `20260911173003` (`docs/resultado-implementacao-fronteira-exposicao-0001.md:15-24`); collector `20260929214528` versus `20260930054602` (`docs/resultado-aplicacao-acesso-collector-aneel.md:18-32`).
- **Consequência:** uma comparação normal local/remoto pode classificar migrations já executadas como pendentes e as versões remotas como ausentes no Git; `db push`, reparo, clone de ambiente e auditoria ficam inseguros.
- **Recomendação/opções:** reconciliar formalmente o histórico para que cada mudança remota corresponda a um artefato local único; alternativamente declarar e automatizar outro mecanismo como fonte de verdade. Não aceitar simultaneamente os dois históricos como equivalentes apenas pelo nome lógico.
- **Confiança:** alta.
- **O que mudaria minha opinião:** uma listagem atual, somente leitura, demonstrando mapeamento suportado e um ensaio limpo de `migration list`/dry-run sem reaplicações.

### BD-02 — Não existe baseline única e reproduzível do banco real

- **Prioridade:** alta.
- **Fato medido:** não há `supabase/config.toml`; o reset padrão carrega fixtures, enquanto dados reais vivem fora de migrations/seed; as cargas exigem ordem `0001,0002,0003,0005,0006,0004,0007`; `0007` exige exatamente 17 migrations e falha depois das 21 atuais.
- **Evidência exata:** a própria documentação manda executar `supabase init` quando a configuração falta (`docs/revisao-pilot-03.md:52-57`); `0004` declara depender de `0005` e `0006` (`data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql:23-56`); `0007` exige contagem 17 (`data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql:38-98`). Em ensaio, a ordem numérica parou em `0004`; a ordem histórica passou até `0007`, mas só sobre 17 migrations.
- **Consequência:** recuperar o banco após perda ou criar staging fiel exige conhecimento documental e intervenção manual; não há prova automatizada de disaster recovery.
- **Recomendação/opções:** escolher uma baseline declarativa reproduzível (snapshot verificado mais deltas, ou migrations/cargas ordenadas por manifesto) e separar inequivocamente fixtures de produção.
- **Confiança:** alta.
- **O que mudaria minha opinião:** um procedimento versionado, executável do zero, que produza schema, dados e hashes atuais sem edição manual.

### BD-03 — Estados canônicos fortes não são invariantes relacionais

- **Prioridade:** alta.
- **Fato medido:** `events` permite `accepted` com qualquer nível diferente de `unverified`, sem exigir `event_evidence`; `metric_values` permite `validated` sem exigir observação normalizada, evidência estabelecida ou metodologia aplicável.
- **Evidência exata:** o único acoplamento de aceitação é `workflow_status <> 'accepted' or verification_level <> 'unverified'` (`20260831132534_events.sql:73-101`); `metric_values` valida período, status e unicidade, não a cadeia semântica (`20260831142144_metric_values.sql:14-50`). As cargas conferem essas cadeias proceduralmente, por exemplo `0004` (`data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql:640-671`).
- **Consequência:** qualquer escritor privilegiado pode persistir estado formalmente “aceito/validado” sem suporte que o contrato de leitura presume.
- **Recomendação/opções:** manter estados mais fracos até validação transacional, ou centralizar promoções em uma fronteira que valide a cadeia; outra opção é materializar invariantes auditáveis. Evitar checks cruzando tabelas de forma frágil.
- **Confiança:** alta.
- **O que mudaria minha opinião:** prova de que todos os escritores, inclusive operações administrativas, só conseguem promover registros por um contrato transacional já existente e testado.

### BD-04 — A linhagem termina no manifesto da coleta

- **Prioridade:** alta.
- **Fato medido:** `collection_runs` guarda hash/referência e contagens, mas nenhuma tabela canônica possui `collection_run_id`, identidade do item coletado ou referência a candidato; candidatos e pacotes ficam em artefatos locais.
- **Evidência exata:** campos de execução e manifesto (`20260916083548_source_endpoints_collection_runs_v1.sql:248-287,486-508`); `content_items` começa sua linhagem em `source_id` e URL (`20260831124605_content_items.sql:1-18`); `evidence` começa em observação/conteúdo/fonte (`20260831131643_evidence.sql:1-23`).
- **Consequência:** não é possível provar apenas no banco qual execução e qual byte coletado originaram um item, nem reconciliar contagens de `items_new/changed` com decisões canônicas.
- **Recomendação/opções:** definir uma fronteira persistente mínima entre item de coleta/candidato e decisão canônica; se artefatos externos continuarem como autoridade, armazenar identidade imutável e hash referenciável no banco.
- **Confiança:** alta.
- **O que mudaria minha opinião:** um registro versionado externo, durável e consultável que demonstre a relação bijetiva e verificada com IDs canônicos.

### BD-05 — A evidência canônica depende majoritariamente de URLs mutáveis

- **Prioridade:** alta.
- **Fato medido:** os pacotes canônicos usam repetidamente `external_reference`, `evidentiary_excerpt = null` e a própria URL como `raw_capture_reference`; existe até conteúdo anterior `metadata_only` sem captura.
- **Evidência exata:** `0001` (`data/canonical/0001_jeep-avenger-lancamento-brasil.sql:134-182`), `0002` (`data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.sql:288-383`), `0005` (`data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.sql:342-428`) e correção `0006` (`data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.sql:299-385`).
- **Consequência:** remoção ou alteração editorial da página enfraquece a auditabilidade factual, embora a cadeia relacional permaneça íntegra.
- **Recomendação/opções:** preservar, dentro de limites legais, pelo menos hash, metadados de captura e trecho probatório imutável; para referências externas obrigatórias, registrar indisponibilidade e cadeia de custódia.
- **Confiança:** alta.
- **O que mudaria minha opinião:** comprovação de arquivo durável externo, endereçado por conteúdo e coberto por retenção, associado às referências atuais.

### BD-06 — A identidade do collector escala por duplicação de policies e pares fixos

- **Prioridade:** média.
- **Fato medido:** uma única role atende ABVE e ANEEL; cada fonte adiciona policies permissivas paralelas com slugs/chaves literais. O advisor encontrou cinco grupos de policies permissivas múltiplas.
- **Evidência exata:** ABVE (`20260916193622_collector_identity_grants_rls_v1.sql:85-164`) e ANEEL (`20260929214528_extend_collector_access_to_aneel.sql:1-80`).
- **Consequência:** custo e risco de divergência crescem por endpoint; comprometimento da credencial alcança todos os endpoints acumulados e todas as execuções visíveis da role.
- **Recomendação/opções:** antes de ampliar, comparar identidade por fonte, autorização orientada por dados e policies consolidadas; manter a forma atual apenas enquanto o conjunto continuar pequeno e revisável.
- **Confiança:** alta sobre duplicação; média sobre impacto de desempenho no volume atual.
- **O que mudaria minha opinião:** limite permanente de dois endpoints, rotação/segregação operacional comprovada e planos mostrando custo irrelevante.

### BD-07 — O teste de segurança do collector não roda pelo fluxo local atual

- **Prioridade:** média.
- **Fato medido:** `supabase test db` executou quatro de 16 asserções e parou em `SET LOCAL ROLE`; sobre dados canônicos, parou antes por colisão nos slugs `abve`/`aneel`.
- **Evidência exata:** fixtures com slugs globais (`supabase/tests/collector_aneel_access_v1_test.sql:4-44`) e troca de role (`:170-191`). A documentação registra PASS em contêiner descartável (`docs/revisao-acesso-collector-aneel.md:45-53`), mas não há comando reprodutível versionado que prepare a associação necessária.
- **Consequência:** o teste negativo mais importante pode não integrar um gate contínuo e não é isolado do conjunto de dados real.
- **Recomendação/opções:** tornar o teste autocontido no runner suportado e independente de slugs existentes; ou versionar explicitamente o harness/container que já produziu PASS.
- **Confiança:** alta para Supabase CLI 2.98.2/PostgreSQL 17 local.
- **O que mudaria minha opinião:** execução limpa documentada, a partir do clone, com `16/16 PASS` no comando suportado.

### BD-08 — Campos de auditoria podem ser arbitrários ou ficar obsoletos

- **Prioridade:** média.
- **Fato medido:** `created_at`/`updated_at` são graváveis; não há trigger geral de atualização nem ator de mudança nas entidades canônicas. Só endpoints/runs checam ordem temporal.
- **Evidência exata:** `sources` define defaults sem proteção (`20260831123209_sources.sql:1-14`); `content_items`, observações, evidências, eventos e métricas repetem o padrão. `service_role` recebe atualização ampla, por exemplo em `events` (`20260831132534_events.sql:136-147`).
- **Consequência:** `updated_at` não prova quando uma correção ocorreu e pode contradizer o histórico, reduzindo rastreabilidade forense.
- **Recomendação/opções:** tratar timestamps como campos controlados pelo banco/contrato e usar histórico append-only para mudanças materiais; não atribuir valor probatório aos campos atuais sem outra evidência.
- **Confiança:** alta.
- **O que mudaria minha opinião:** demonstração de uma única camada de escrita que sempre mantém timestamps e auditoria, sem caminhos administrativos alternativos.

### BD-09 — A complexidade já excede a automação que a sustenta

- **Prioridade:** média.
- **Fato medido:** são 23 tabelas, 272 colunas, 204 checks e 71 índices; a migration da função privada tem 1.428 linhas e incorpora cópia mecânica de uma consulta entre as linhas 326–1027; não há configuração Supabase nem suíte abrangente de schema/cargas.
- **Evidência exata:** cópia e hash declarados (`20260911171207_expose_methodology_contract_0001.sql:326-328,1025-1032`); o repositório possui um único teste SQL em `supabase/tests/`.
- **Consequência:** mudanças pequenas exigem sincronizar SQL duplicado, pré-condições, verificadores e documentação extensa; o risco de drift supera o benefício de parte das salvaguardas.
- **Recomendação/opções:** preservar as invariantes valiosas, mas reduzir duplicação e gerar artefatos derivados de uma fonte única; remover estrutura somente após provar que não atende consulta ou requisito vigente.
- **Confiança:** alta sobre as medidas; média sobre quais componentes devem ser simplificados.
- **O que mudaria minha opinião:** geração determinística já existente e um gate que compare consulta, função, hashes, cargas e baseline integralmente.

### BD-10 — Não há evidência para decisões de performance

- **Prioridade:** baixa.
- **Fato medido:** os advisors locais marcaram índices sem uso, mas a base reconstruída não tinha workload; não existem métricas, `EXPLAIN`, volume alvo ou consultas operacionais representativas versionadas além do contrato `0001`.
- **Evidência exata:** índices são definidos preventivamente, por exemplo `events` (`20260831132534_events.sql:130-134`) e `collection_runs` (`20260916083548_source_endpoints_collection_runs_v1.sql:580-589`).
- **Consequência:** remover índices pelo advisor ou adicionar novos por intuição seria prematuro; custo de escrita e desempenho real permanecem desconhecidos.
- **Recomendação/opções:** manter índices que suportam FKs, unicidade e acessos declarados; medir consultas reais antes de remover/adicionar índices ou considerar outra tecnologia.
- **Confiança:** alta quanto à ausência de evidência; baixa para qualquer previsão de gargalo.
- **O que mudaria minha opinião:** estatísticas remotas, consultas lentas e planos representativos com cardinalidades reais.

## 6. O que não foi provado

- Que as 21 migrations e seus hashes correspondem exatamente ao schema remoto atual.
- Que os dados remotos continuam com as contagens e valores registrados nos relatórios de aplicação.
- Que restore completo, rotação de credenciais e conexão real das roles funcionam hoje.
- Que URLs probatórias continuam acessíveis e sem alteração de conteúdo.
- Que a função privada satisfaz latência/custo em volume futuro; somente estrutura e privilégios foram verificados.
- Que índices são úteis ou inúteis em produção.
- Que existe backup, PITR, monitoramento, alertas, pool de conexões ou procedimento de incidente adequados.

## 7. Complexidade e dívida

- **Necessária:** FKs, unicidade, checks locais, estados históricos append-only, RLS fechada, roles mínimas, função privada e imutabilidade terminal de execuções.
- **Prematura:** parte da taxonomia rígida e dos índices de consulta sem workload; não há evidência para remoção imediata.
- **Duplicada:** consulta metodológica copiada para a função; policies quase idênticas por endpoint; verificações extensas repetidas em cargas e arquivos `.verify.sql`.
- **Descartável:** nenhum objeto foi provado descartável. O candidato mais claro à substituição é o processo manual de baseline/aplicação, não uma tabela específica.

## 8. Recomendações

1. **Corrigir primeiro:** reconciliar identidade das migrations remotas e publicar uma baseline executável e verificável.
2. **Corrigir:** tornar promoções canônicas e rastreabilidade coleta→decisão contratos transacionais verificáveis.
3. **Manter:** PostgreSQL/Supabase, RLS fechada, roles mínimas, função privada e históricos append-only enquanto não surgir evidência contrária.
4. **Simplificar:** uma fonte de verdade para consulta/contrato e autorização do collector; reduzir pré-condições acopladas a contagens globais.
5. **Medir antes de decidir:** índices, particionamento, migração de tecnologia e qualquer expansão da taxonomia.
6. **Reforçar evidência:** captura endereçada por conteúdo e testes de banco executáveis do clone em ambiente suportado.

## 9. Dependências de outras especialidades

- **Coleta:** definir identidade durável de item/manifesto e o ponto de entrega de candidatos; o banco deve apenas persistir o contrato acordado.
- **AI/qualidade:** qualquer saída assistida precisa conservar modelo/método/evidência sem promover diretamente estados canônicos fortes.
- **Backoffice/operação:** fluxos de aprovação determinam ator, transação, auditoria e permissões; não devem reutilizar `service_role` ou collector por conveniência.
- **Arquitetura:** decidir se artefatos externos são autoridade durável e como baseline, backup e restauração serão operados.

## 10. Limites da revisão

Este parecer avalia o commit indicado e reproduções locais; não aprova dados factuais externos, operação remota ou nova funcionalidade. As recomendações não autorizam mudanças. A ausência de acesso remoto, workload e evidência de backup foi tratada como limitação, não preenchida por suposição.
