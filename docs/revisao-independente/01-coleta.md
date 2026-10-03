# Revisão independente — coleta e engenharia de dados

## 1. Identificação

- **Especialidade:** coleta e engenharia de dados.
- **Agente:** agente independente de revisão de coleta (Codex).
- **Commit examinado:** `d4361e6967ac5e7e7a6ffdcc187aa0b3cb45b803`.
- **Data:** 2–3 de outubro de 2026.
- **Escopo:** collector manual/local; adapters ABVE e ANEEL; extrator ABVE; contratos, manifests, artefatos, `source_endpoints`, `collection_runs`, identidade técnica, grants, policies, testes, documentação e prontidão operacional.
- **Método:** inspeção estática do commit fixado; comparação entre código, migrations, testes e documentação; execução local com Node `24.21.0` e pnpm `10.34.5`.
- **Limitações:** não consultei banco remoto, credenciais, branches ou pareceres de outros revisores; não repeti HTTP contra ABVE/ANEEL; o teste pgTAP não foi reexecutado porque o clone não contém configuração de banco local. Fatos remotos são tratados apenas como evidência histórica versionada.

## 2. Veredito executivo

1. A fundação é defensiva e auditável: falha fechada, limites de acesso, hashes, estados terminais, atomicidade e privilégio mínimo estão acima do esperado para um piloto.
2. A separação entre coleta, extração, revisão humana e dados canônicos é correta e deve ser preservada; não existe promoção automática.
3. O pipeline ainda é um piloto local, não uma operação recuperável: o banco depende de manifests que existem somente no filesystem da máquina que executou a coleta.
4. O portão declarado do repositório não verifica os tipos do collector/extrator; ele passa enquanto o typecheck da raiz falha com sete erros.
5. A idempotência da extração tem uma contradição: a chave semântica converge, mas duas proveniências legítimas para a mesma versão disputam o mesmo diretório e a segunda é rejeitada.
6. O extrator usa a mesma credencial que pode inserir e atualizar runs; sua leitura exclusiva é convenção de código, não isolamento imposto pelo banco.
7. A ABVE cobre deliberadamente uma janela recente de até 100 posts; alterações em posts mais antigos e remoções não são detectadas por esse desenho.
8. A ANEEL falha com segurança diante do desafio de acesso, mas não há run bem-sucedido nem fixture positiva integral que prove compatibilidade com o HTML vivo atual.
9. Os 212 testes do collector/extrator passaram; a cobertura negativa é ampla, porém predominantemente unitária e não prova repetição remota, recuperação entre hosts ou operação prolongada.
10. Recomendação global: manter os contratos determinísticos e as fronteiras editoriais, corrigir primeiro o portão de tipos e a durabilidade/proveniência dos artefatos, e só então considerar o pipeline operacional.

## 3. O que foi examinado

- os 29 arquivos de implementação em `src/collector` e `src/extractor`;
- os 24 arquivos de testes do collector/extrator, seis fixtures HTML/JSON locais e dois pacotes de extração literais;
- migrations de `source_endpoints`, `collection_runs`, identidade do collector e extensão de acesso à ANEEL;
- teste pgTAP de acesso ANEEL e constraints, triggers, índices, grants e policies associados;
- contratos HTTP, paginação, cursor, retries, timeouts, redirects, limites de corpo, sanitização e códigos de saída;
- canonical JSON, fingerprints, hashes, manifests, escrita atômica e handoff da extração;
- documentação de runtime, modelagem, preflights, ensaios, indisponibilidade ANEEL e handoff histórico;
- scripts de verificação, perímetro do workspace e configuração TypeScript.

## 4. O que está bem construído

- O adapter ABVE congela a paginação, confere totais, cardinalidade, ordem, duplicidade e fronteira antes de avançar o cursor (`src/collector/abve-adapter.ts:322-445`).
- ABVE e ANEEL limitam redirects, retries, `Retry-After`, tempo e bytes; recusam formato, autenticação ou desafio inesperados sem fallback (`src/collector/abve-http.ts:30-149`; `src/collector/aneel-adapter.ts:436-655`).
- Manifest e pacote de extração usam serialização canônica, ordenação explícita, fingerprints e validação estrutural; a extração reobtém o item e exige identidade, URL e fingerprint idênticos (`src/extractor/handoff.ts:127-201`).
- Artefatos são escritos atomicamente, com diretórios `0700`, arquivos `0600`, sincronização e recusa de sobrescrita divergente (`src/collector/artifacts.ts:29-53`; `src/extractor/artifacts.ts:39-84`).
- O banco impõe um único run ativo por endpoint, terminalidade imutável, aritmética das contagens e coerência entre status, erro, manifest e handoff (`supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:248-589`).
- A role é dedicada, sem superprivilégios ou bypass de RLS, e não lê dados canônicos; policies restringem as duas combinações source/endpoint aprovadas (`supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:1-164`; `supabase/migrations/20260929214528_extend_collector_access_to_aneel.sql:1-80`).
- O extrator gera propostas locais, mantém decisão humana `pending` e não oferece operação de escrita canônica (`src/extractor/runner.ts:33-105`; `src/extractor/artifacts.ts:87-157`).

## 5. Achados priorizados

### COL-01 — O portão oficial não cobre os tipos da raiz

- **Prioridade:** alta.
- **Fato medido:** `pnpm test` passou 212/212 testes; `pnpm typecheck` falhou com sete erros em `aneel-adapter.ts`, `aneel-html.ts`, `collection-run-store.ts` e testes; `pnpm run verify:types` terminou com sucesso.
- **Evidência exata:** `package.json:13-18` usa `tsc --noEmit` no comando direto, mas `pnpm -r exec tsc --noEmit` no portão; `pnpm-workspace.yaml:1-3` inclui apenas `apps/*` e `packages/*`; `tsconfig.json:16` é o contrato da raiz para `src` e `tests`.
- **Consequência:** mudanças do pipeline podem ser aceitas pelo portão documentado mesmo sem satisfazer seu próprio TypeScript estrito; testes via `tsx` transpilem e executam apesar desses erros.
- **Recomendação/opções:** incluir explicitamente o typecheck da raiz no portão, ou transformar o pipeline em pacote do workspace; manter um único caminho oficial, não dois com coberturas diferentes.
- **Confiança:** alta.
- **O que mudaria minha opinião:** evidência de outro estágio obrigatório de CI que execute `pnpm typecheck` na raiz e bloqueie merges.

### COL-02 — O histórico remoto depende de artefato local não durável

- **Prioridade:** alta.
- **Fato medido:** `collection_runs` guarda referências `local:.chargebr/...`; o próximo run e o extrator precisam ler esse caminho relativo ao `cwd`. Arquivo ausente, host diferente ou diretório perdido bloqueia baseline/handoff.
- **Evidência exata:** `src/collector/artifacts.ts:56-76`; `src/collector/runner.ts:418-445`; `src/collector/abve-adapter.ts:472-508`; `src/extractor/handoff.ts:136-157`.
- **Consequência:** o banco pode declarar run completo e `ready_for_extraction` sem conservar a evidência necessária para repeti-lo, auditá-lo ou continuar em outra máquina; backup do banco não recupera o pipeline.
- **Recomendação/opções:** persistir manifests imutáveis em armazenamento durável com hash e localização estável, ou guardar o payload limitado no banco; para permanência local, registrar host/raiz, política de backup e verificação de existência antes da transição terminal.
- **Confiança:** alta.
- **O que mudaria minha opinião:** prova de replicação/backup automático dos `.chargebr`, restauração testada e vínculo inequívoco do host no contrato.

### COL-03 — A chave da extração não comporta duas proveniências legítimas

- **Prioridade:** alta.
- **Fato medido:** `extraction_key` usa contrato, endpoint, identidade e fingerprint, mas não `run_key`; o envelope contém `run_key`, tempo e versão. O diretório é indexado só por `extraction_key` e rejeita bytes diferentes.
- **Evidência exata:** `src/extractor/package.ts:122-130`; `src/extractor/artifacts.ts:22-35,53-59,171-192`; a documentação promete convergência com preservação de cada proveniência em `docs/decisao-extrator-abve-v1.md:295-326`.
- **Consequência:** repetir a mesma versão em outro run produz a mesma chave, porém envelope diferente; em vez de preservar a segunda proveniência, a escrita termina como conflito interno. A idempotência vale apenas para bytes operacionais idênticos.
- **Recomendação/opções:** separar identidade semântica do candidato da identidade da execução; indexar pacote por run/execution key e manter `candidate_key` convergente, ou armazenar uma lista imutável de proveniências sob a chave semântica.
- **Confiança:** alta.
- **O que mudaria minha opinião:** teste ponta a ponta demonstrando duas `run_key` distintas para o mesmo fingerprint, com ambas as proveniências preservadas e rerun bem-sucedido.

### COL-04 — A fronteira somente leitura do extrator não é imposta pela credencial

- **Prioridade:** alta.
- **Fato medido:** o extrator abre `openPostgresCollectionRunStore` com `CHARGEBR_COLLECTOR_DATABASE_URL`; essa role possui `INSERT` e `UPDATE` em `collection_runs`. A interface estreita impede chamadas no código atual, mas a conexão mantém os privilégios.
- **Evidência exata:** `src/extractor/runner.ts:1,29-53`; `supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:33-79`.
- **Consequência:** erro futuro ou comprometimento do processo de extração pode criar ou alterar runs em andamento; os testes com uma store reduzida provam comportamento do código atual, não isolamento de banco.
- **Recomendação/opções:** criar identidade de extração somente leitura, ou expor leitura por função/view privada com grants mínimos; se a role compartilhada for mantida, descrevê-la como risco aceito, não como garantia de leitura exclusiva.
- **Confiança:** alta.
- **O que mudaria minha opinião:** controle externo verificável que entregue ao extrator credencial distinta sem privilégios de escrita.

### COL-05 — A prova operacional de TLS não virou procedimento reproduzível

- **Prioridade:** média.
- **Fato medido:** a store remove `sslrootcert`, `sslcert`, `sslkey` e `sslmode` da connection string e força verificação TLS; o ensaio histórico registra que a primeira conexão falhou até carregar `Supabase Root 2021 CA`, mas nenhum guia define como fazê-lo.
- **Evidência exata:** `src/collector/collection-run-store.ts:412-424`; `docs/resultado-ensaio-extrator-abve-v1.md:104` e ausência de `NODE_EXTRA_CA_CERTS` na documentação operacional.
- **Consequência:** um operador novo pode ter conexão corretamente recusada sem diagnóstico acionável; a configuração que tornou o único ensaio possível não é repetível a partir do repositório.
- **Recomendação/opções:** documentar e validar o mecanismo de trust store adotado, com preflight seguro; alternativamente aceitar uma referência controlada de CA sem permitir desabilitar verificação.
- **Confiança:** alta.
- **O que mudaria minha opinião:** runbook versionado que reproduza a conexão limpa usando apenas dependências e segredos aprovados.

### COL-06 — O manifest autentica o payload, não toda a evidência operacional

- **Prioridade:** média.
- **Fato medido:** `response_manifest_hash` cobre somente o payload e remove `attempt_count` das requests; `validateManifest` não valida `request_attempt_count`, `attempt_history` nem `duration_ms` opcionais.
- **Evidência exata:** `src/collector/manifest.ts:94-102,181-187,199-214`; teste confirma exclusão em `tests/collector/manifest.test.ts:61-87`.
- **Consequência:** histórico de tentativas e duração pode ser alterado ou ficar incoerente sem romper o hash persistido; ele serve como telemetria não autenticada, embora o manifest seja apresentado como evidência auditável.
- **Recomendação/opções:** definir um hash do artefato completo além do hash determinístico do payload e validar esquema/contagens do envelope; ou declarar explicitamente esses campos como telemetria não íntegra e não usá-los em auditoria.
- **Confiança:** alta.
- **O que mudaria minha opinião:** assinatura ou hash externo do arquivo completo verificado no handoff.

### COL-07 — A detecção de mudança ABVE é uma janela, não vigilância do acervo

- **Prioridade:** média.
- **Fato medido:** a consulta ordena por `date`, limita duas páginas de 50 e encerra ao cruzar `cursor_in.before`; o fingerprint inclui conteúdo e `modified`, mas posts publicados antes da fronteira deixam de ser relidos.
- **Evidência exata:** `src/collector/abve-adapter.ts:58-87,322-445`; `src/collector/abve-post.ts:70-94`; limitação reconhecida em `docs/collector-local-runtime-v1.md:339-349`.
- **Consequência:** correções retroativas em publicações antigas não aparecem como `changed`; `removal_policy = none` também impede inferência de remoção. “Sem mudança” significa apenas ausência de mudança observada na janela.
- **Recomendação/opções:** preservar a estratégia barata para ingestão incremental, mas nomear sua cobertura em métricas e interface; medir antes de decidir entre varredura periódica, endpoint por `modified` ou auditoria amostral.
- **Confiança:** alta.
- **O que mudaria minha opinião:** prova de que a fonte nunca altera posts fora da janela, ou mecanismo separado que os revalide.

### COL-08 — A ANEEL está segura, mas não operacionalmente validada

- **Prioridade:** média.
- **Fato medido:** o endpoint está `unavailable`, não há `collection_run` ANEEL bem-sucedido e as fixtures positivas são fragmentos mínimos reconstruídos; a última execução documentada recebeu desafio `403`.
- **Evidência exata:** `docs/decisao-indisponibilidade-collector-aneel.md:36-73,125-149`; `docs/revisao-implementacao-adapter-aneel.md:63-68,83-108`; `docs/resultado-carga-canonica-0012.md:69-89`.
- **Consequência:** testes provam parsing e bloqueio conforme o contrato conhecido, não compatibilidade atual, paginação real completa, custo ou idempotência remota.
- **Recomendação/opções:** manter o estado `unavailable` e o fail-closed; não declarar prontidão até um run controlado e sua repetição passarem contra conteúdo acessível, sem contorno.
- **Confiança:** alta.
- **O que mudaria minha opinião:** dois runs completos, medidos e repetíveis no runtime aprovado, com fixture atualizada de origem verificável.

### COL-09 — Configuração no banco e contrato compilado são duplicados e rigidamente acoplados

- **Prioridade:** média.
- **Fato medido:** o banco monta um objeto de contrato, mas runners aceitam somente igualdade canônica exata com constantes TypeScript; ABVE e ANEEL repetem runner, heartbeat e terminalização em blocos quase idênticos.
- **Evidência exata:** `src/collector/collection-run-store.ts:144-196`; `src/collector/runner.ts:114-388,578-592`.
- **Consequência:** qualquer mudança revisada de configuração exige sincronização perfeita entre carga e deploy; a duplicação aumenta risco de divergência entre adapters e custo por nova source.
- **Recomendação/opções:** manter invariantes de segurança compiladas, mas validar um contrato versionado por esquema e extrair um runner comum parametrizado; não generalizar adapters antes de existir o terceiro caso.
- **Confiança:** média-alta.
- **O que mudaria minha opinião:** evidência de geração automática das constantes a partir do registro canônico e teste que impeça toda divergência entre os dois caminhos.

### COL-10 — Policies por source já duplicam a matriz de acesso

- **Prioridade:** baixa.
- **Fato medido:** cada source adiciona cinco policies permissivas quase idênticas; ABVE e ANEEL totalizam dez policies para uma única role.
- **Evidência exata:** `supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:85-164`; `supabase/migrations/20260929214528_extend_collector_access_to_aneel.sql:1-80`.
- **Consequência:** o modelo é seguro para duas sources, mas cresce em DDL repetido, avisos de policies permissivas múltiplas e risco de esquecer uma operação ao ampliar cobertura.
- **Recomendação/opções:** manter agora; antes de ampliar, comparar a duplicação explícita com uma allowlist privada e policies genéricas, preservando auditabilidade e privilégio mínimo.
- **Confiança:** alta sobre a duplicação, média sobre o momento de simplificar.
- **O que mudaria minha opinião:** decisão de limitar permanentemente a role a essas duas combinações.

## 6. O que não foi provado

- repetição remota da ABVE e idempotência entre duas `run_key` reais;
- recuperação após perda do diretório `.chargebr`, troca de host ou restauração apenas do banco;
- execução bem-sucedida da ANEEL contra HTML vivo e custo de até 150 detalhes;
- operação agendada, observabilidade, alertas, retenção, backup e resposta a incidentes;
- cobertura de alterações ABVE fora da janela e qualquer semântica de remoção;
- persistência estruturada e consultável de candidatos e decisões humanas;
- pgTAP no ambiente deste clone e compatibilidade entre migrations e estado remoto atual.

## 7. Complexidade e dívida

A complexidade de canonicalização, hashing, limites HTTP, lifecycle e fail-closed é justificada pela proveniência. Já a duplicação dos dois runners, dos contratos em banco/código e das policies por source começa a cobrar manutenção sem entregar generalidade real. O extrator de 596 linhas, seu pacote rígido e a revisão HTML são proporcionais apenas como prova falsificável de um item; seriam complexidade prematura se tratados como motor genérico. O adapter ANEEL não é código morto: preserva conhecimento testado e bloqueia corretamente, mas seu custo deve ser reconhecido enquanto a fonte estiver indisponível.

## 8. Recomendações

- **Manter:** separação collection-first, hashes determinísticos, re-fetch, fail-closed, limites HTTP, terminalidade imutável, RLS e ausência de promoção automática.
- **Corrigir:** cobertura do typecheck oficial; identidade/proveniência dos artefatos de extração; procedimento TLS; validação e integridade do envelope.
- **Reescrever parcialmente:** armazenamento/referência de artefatos para ser durável e recuperável; identidade de banco do extrator para leitura exclusiva.
- **Simplificar:** runner comum para lifecycle e, quando houver escala real, matriz de policies/configuração duplicada.
- **Medir antes de decidir:** estratégia para alterações históricas ABVE, custo/volume ANEEL e retenção durável dos artefatos.
- **Não remover agora:** adapter ANEEL e contratos de candidatos; removê-los apagaria evidência útil antes de existir substituição comprovada.

## 9. Dependências de outras especialidades

- **Banco e segurança:** decidir armazenamento durável, role somente leitura do extrator, allowlist de endpoints e integridade/retensão dos manifests.
- **AI e qualidade:** avaliar candidatos somente depois de existir persistência e proveniência recuperável; o collector determinístico não precisa de AI.
- **Backoffice e operação:** representar cobertura como janela, distinguir `unavailable` de falha transitória e expor ausência de artefato/backup sem sugerir cobertura total.
- **Síntese arquitetural:** escolher runtime apenas depois de medições repetidas; a revisão não seleciona hospedagem nem novas fontes.

## 10. Limites da revisão

Este parecer não seleciona fontes, não cria roadmap, não decide arquitetura futura e não substitui auditoria do banco remoto. Não executei requests vivos porque não eram necessários para confirmar os achados de código e porque a indisponibilidade ANEEL já está registrada com critério explícito. Nenhum código, migration, configuração, dado, issue ou credencial foi alterado; somente este relatório foi produzido.
