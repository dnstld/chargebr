# Parecer independente — AI, qualidade e economia de tokens

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Especialidade | AI, qualidade e economia de tokens |
| Agente | Codex, revisão independente sem subagentes |
| Commit-base | `d4361e6967ac5e7e7a6ffdcc187aa0b3cb45b803` |
| Data | 2 de outubro de 2026 |
| Escopo | Collector e extrator atuais; fronteira determinismo/AI; qualidade, custo, tokens, revisão, privacidade e rastreabilidade de uma eventual AI |
| Limitações | Não há AI implementada nem tráfego, preço, token, latência ou conjunto de avaliação de modelos. Não consultei banco remoto, artefatos locais do ensaio nem fontes externas. A análise é do repositório no commit fixado. |

## 2. Veredito executivo

1. **Não há justificativa para AI na coleta.** Transporte, validação, identidade, fingerprint, classificação operacional e idempotência já têm contratos determinísticos fortes e devem permanecer assim.
2. **Também não há evidência para escolher modelo agora.** O único ensaio vivo de extração cobre um item, uma afirmação quantitativa e uma decisão humana `link_existing`.
3. AI pode ser útil futuramente como produtora de **candidatos**, sobretudo em triagem semântica, extração variada, comparação e resumo; nunca como prova, árbitro de verdade ou promotora canônica.
4. O projeto facilita uma integração segura: fingerprints, versões, hashes, evidência mínima, saídas estruturadas e separação da revisão já existem.
5. A principal lacuna é de medição: faltam conjunto de avaliação representativo, critérios por tarefa, custo por decisão útil e tempo/discordância da revisão humana.
6. A economia deve começar antes do modelo: processar somente `new`/`changed`, reutilizar resultados por fingerprint, deduplicar e enviar contexto mínimo com expansão controlada.
7. Qualquer saída probabilística deve ser estritamente estruturada, citar trecho/localizador e admitir `unknown`, ausência ou divergência; “confiança” do modelo não equivale a veracidade.
8. Modelos pequenos, grandes, locais e externos só podem ser comparados no mesmo conjunto de avaliação. O menor que alcance o limiar vence; casos ambíguos escalam para modelo mais capaz ou pessoa revisora.
9. Antes de serviço externo, são necessárias decisões explícitas sobre licença da fonte, conteúdo enviado, região, retenção, treinamento do fornecedor e exclusão de dados pessoais ou segredos.
10. Recomendação atual: preservar o núcleo determinístico, não contratar nem integrar AI ainda e medir primeiro os casos humanos que realmente geram custo ou erro.

## 3. O que foi examinado

- contratos e implementação dos adapters ABVE e ANEEL, manifests, normalização, fingerprints, cursor, retries e classificação incremental;
- handoff, re-fetch, pacote estruturado, chaves, artefatos e revisão do extrator ABVE;
- testes de collector e extrator, fixtures e resultado do único ensaio vivo;
- metodologia editorial, fronteira entre coleta, extração, revisão e canônico;
- migrations de `collection_runs` e entidades canônicas quanto a proveniência e medição;
- dependências e buscas por SDKs, modelos, prompts, tokens, custos e metadados de execução de AI.

Foram medidos 9.790 linhas em `src/collector`, `src/extractor` e seus testes; 212 testes Node passaram. A suíte Vitest passou com 72 arquivos/284 testes; formatador e lint passaram. A verificação agregada ficou limitada pelo runtime, detalhada na seção 10.

## 4. O que está bem construído

- O collector declara não usar AI e não promover fatos; o código classifica por identidade e igualdade de fingerprint (`docs/collector-local-runtime-v1.md:11-17`; `src/collector/abve-adapter.ts:388-400`).
- O incremental falha fechado quando o manifest anterior falta, diverge ou é incompatível (`src/collector/abve-adapter.ts:472-516`), evitando reprocessamento tratado como novidade.
- O handoff exige run pronto, manifest íntegro, item elegível e igualdade de identidade, URL e fingerprint antes de expor conteúdo à extração (`src/extractor/handoff.ts:127-202`).
- O pacote de candidatos tem schema fechado, hashes determinísticos, campos limitados e no máximo uma observação no piloto (`src/extractor/package.ts:122-215,273-320`).
- A revisão começa em `pending` e o extrator não decide nem promove (`src/extractor/artifacts.ts:87-157`).
- O corpo integral fica apenas em memória e a retenção é `minimum_excerpt` (`docs/decisao-extrator-abve-v1.md:153-155`; `src/extractor/package.ts:396-405`).
- A metodologia preserva conflitos, incerteza e força da evidência (`docs/metodologia-de-pesquisa-e-inteligencia.md:80-94`). Esses são controles melhores contra falsa confiança do que um escore opaco.

## 5. Achados priorizados

### AI-01 — Não existe base de qualidade para selecionar um modelo

- **Prioridade:** alta.
- **Fato medido:** há um ensaio vivo: uma fonte, um post, uma quantidade mensal, uma unidade, um período, uma geografia e uma decisão `link_existing`; não há casos vivos de `accept_new`, `correct` ou `reject`.
- **Evidência exata:** `docs/decisao-pos-ensaio-extrator-abve-v1.md:35-60`; `docs/resultado-ensaio-extrator-abve-v1.md:40-62`.
- **Consequência:** qualquer escolha entre modelo grande, pequeno, local ou externo seria preferência sem estimativa defensável de precisão, cobertura ou custo.
- **Recomendação/opções:** formar primeiro um conjunto congelado e revisado, estratificado por fonte, formato, tarefa, ambiguidade e resultado negativo; medir precisão por campo, recall de afirmações, taxa de abstenção, evidência correta, duplicação e concordância humana. Manter o extrator atual como controle determinístico.
- **Confiança:** alta.
- **O que mudaria minha opinião:** um conjunto representativo já existente fora do repositório, com rótulos, protocolo de revisão e resultados reproduzíveis.

### AI-02 — A coleta não deve usar AI

- **Prioridade:** alta.
- **Fato medido:** identidade, normalização, fingerprint, paginação, classificação `new/unchanged/changed`, contagens e falhas são determinísticos e cobertos por testes; 212 testes de collector/extrator passaram.
- **Evidência exata:** `src/collector/abve-post.ts:30-100`; `src/collector/abve-adapter.ts:250-445`; `src/collector/manifest.ts:199-292`.
- **Consequência:** inserir AI nessa camada aumentaria custo e não determinismo, enfraquecendo a prova de versão sem resolver tarefa semântica.
- **Recomendação/opções:** manter AI fora de HTTP, schema, identidade, hashing, cursor, deduplicação, retries e classificação operacional. Reservar eventual AI para depois de um handoff íntegro.
- **Confiança:** alta.
- **O que mudaria minha opinião:** uma tarefa inevitavelmente semântica dentro da coleta que não possa ser isolada como candidato posterior.

### AI-03 — O piloto é uma prova estreita, não um extrator geral

- **Prioridade:** alta.
- **Fato medido:** item, URL, afirmações, valor e normalização estão codificados para o post `19617`; a regra procura âncoras literais e cinco sinais.
- **Evidência exata:** `src/extractor/pilot.ts:12-44,59-120`.
- **Consequência:** ele é excelente oráculo de regressão, mas não mede generalização nem oferece baseline de cobertura para AI.
- **Recomendação/opções:** preservar como caso de controle; não estender por cadeias de regras nem substituí-lo diretamente por LLM. Comparar regras, modelos e revisão humana apenas após amostrar casos reais variados.
- **Confiança:** alta.
- **O que mudaria minha opinião:** ensaios independentes em múltiplas estruturas reproduzindo qualidade equivalente sem constantes específicas.

### AI-04 — Falta rastreio próprio para uma execução de AI

- **Prioridade:** alta.
- **Fato medido:** o pacote registra versão do extrator, contrato, hashes e duração, mas não fornecedor, modelo/revisão, prompt/política, parâmetros, tokens, preço, cache ou motivo de escalonamento; não existe persistência de candidatos/revisões.
- **Evidência exata:** `src/extractor/package.ts:90-105`; `docs/decisao-pos-ensaio-extrator-abve-v1.md:62-76`.
- **Consequência:** seria impossível reproduzir ou atribuir regressão, custo e decisão a uma configuração probabilística específica.
- **Recomendação/opções:** antes de AI operacional, exigir um registro imutável por tentativa com tarefa, fingerprints de entrada/contexto, versão da política/prompt, fornecedor/modelo/revisão, parâmetros, saída estruturada, tokens, cache, latência, custo calculado, status e ligação à decisão humana. Pode começar em artefato local; banco só quando houver necessidade real.
- **Confiança:** alta.
- **O que mudaria minha opinião:** telemetria equivalente já mantida por uma plataforma externa e exportável sem perda.

### AI-05 — Não existe unidade econômica observada

- **Prioridade:** alta.
- **Fato medido:** `collection_runs` mede bytes e contagens, e o pacote mede duração; não há tokens, custo monetário, minutos de revisão, taxa de aceite ou custo por decisão útil.
- **Evidência exata:** `supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:248-285`; `src/extractor/package.ts:90-100`.
- **Consequência:** preço por milhão de tokens isolado não permite decidir se AI economiza trabalho ou apenas cria revisão adicional.
- **Recomendação/opções:** comparar por item elegível, candidato correto, execução, decisão humana concluída e fato canônico aceito. Incluir tokens de entrada/saída, chamadas, cache, moeda/preço datado, latência, tempo humano e retrabalho; usar custo marginal e total.
- **Confiança:** alta.
- **O que mudaria minha opinião:** métricas operacionais externas ligadas por `run_key`, `extraction_key` e decisão.

### AI-06 — A base permite evitar reenvio, mas a chave de cache de AI ainda não existe

- **Prioridade:** alta.
- **Fato medido:** runs com conteúdo igual produzem `unchanged`; somente `new`/`changed` entram no handoff; `extraction_key` inclui endpoint, identidade, fingerprint e contrato, e artefatos iguais são reutilizados sem sobrescrita.
- **Evidência exata:** `src/collector/abve-adapter.ts:388-445`; `src/extractor/handoff.ts:277-321`; `src/extractor/package.ts:122-152`; `src/extractor/artifacts.ts:51-83`.
- **Consequência:** a maior economia potencial já está na arquitetura, porém trocar política, modelo ou contexto sem chave própria pode reutilizar resposta indevida; ignorar os hashes pode reenviar conteúdo intacto.
- **Recomendação/opções:** AI apenas para fingerprints inéditos naquela tarefa; cache por tarefa + versão da política/prompt + modelo/revisão + fingerprint do contexto + schema de saída. Reexecução deve ser explícita e contabilizada; resultados idênticos entre runs devem ser ligados, não cobrados novamente.
- **Confiança:** alta.
- **O que mudaria minha opinião:** fornecedor sem determinismo de versão/cache ou requisito regulatório de reprocessar toda ocorrência.

### AI-07 — Contexto mínimo precisa de expansão controlada

- **Prioridade:** média.
- **Fato medido:** a normalização/fingerprint cobre o HTML editorial integral, enquanto o artefato retém excerto limitado; o piloto transforma parágrafos e procura sinais no texto completo.
- **Evidência exata:** `src/collector/abve-post.ts:70-100`; `src/extractor/pilot.ts:59-86,123-155`; `src/extractor/package.ts:37-49`.
- **Consequência:** enviar todo o corpo aumenta tokens, exposição e ruído; enviar só uma sentença pode perder negação, unidade, período, sujeito ou contexto de tabela.
- **Recomendação/opções:** seleção determinística inicial de trechos e metadados, com janelas adjacentes e expansão sob ambiguidade; preservar fingerprint do corpo e dos trechos enviados. Corpo completo só quando o caso de avaliação provar ganho.
- **Confiança:** média-alta.
- **O que mudaria minha opinião:** medição mostrando que recortes reduzem materialmente recall/precisão, ou fontes sempre curtas.

### AI-08 — Saída estruturada deve admitir abstenção e nunca promover canônico

- **Prioridade:** alta.
- **Fato medido:** o contrato atual restringe tipos, unidades, período, geografia, limitações e evidência; campos sem prova ficam nulos/desconhecidos; revisão decide separadamente.
- **Evidência exata:** `src/extractor/package.ts:37-87,362-477`; `docs/decisao-extrator-abve-v1.md:157-191`; `src/extractor/artifacts.ts:146-155`.
- **Consequência:** texto livre ou preenchimento obrigatório criaria aparência de certeza, alucinação e afirmações mais fortes que a fonte.
- **Recomendação/opções:** manter schema estrito e validação determinística; exigir trecho/localizador, limitações e `unknown`/abstenção. AI propõe extração, classificação, comparação ou resumo; pessoa revisora decide verdade, suficiência, conflito, relação jurídica/metodológica e promoção.
- **Confiança:** alta.
- **O que mudaria minha opinião:** tarefa de baixo risco com erro automaticamente verificável e reversível, demonstrada no conjunto de avaliação.

### AI-09 — Escalonamento e escolha de porte devem ser dirigidos por erro, não por prestígio

- **Prioridade:** média.
- **Fato medido:** não há benchmark de modelo; a metodologia inclui tarefas com riscos muito diferentes, de extração explícita a análise e conflitos.
- **Evidência exata:** `docs/metodologia-de-pesquisa-e-inteligencia.md:58-86`; ausência de SDK/modelo de AI em `package.json:1-29`.
- **Consequência:** usar sempre modelo grande desperdiça dinheiro; usar sempre modelo pequeno/local pode transferir falsos negativos e correções para humanos.
- **Recomendação/opções:** avaliar na ordem regra determinística, modelo pequeno/mais barato, modelo mais capaz e humano. Escalar por falha de schema, ausência de evidência, ambiguidade, conflito entre métodos, novidade ou alto impacto. Modelo local só vence se qualidade, operação, hardware, privacidade e manutenção total também vencerem.
- **Confiança:** média-alta.
- **O que mudaria minha opinião:** volume, latência, hardware ou obrigação de residência de dados que alterem a economia total.

### AI-10 — Privacidade e retenção para terceiros não foram decididas

- **Prioridade:** alta.
- **Fato medido:** o corpo integral hoje é transitório e os artefatos são privados/`minimum_excerpt`; nenhuma política cobre envio a fornecedor, retenção, treinamento, região ou exclusão de PII para AI.
- **Evidência exata:** `docs/decisao-extrator-abve-v1.md:153-155,193-201`; `src/extractor/artifacts.ts:39-84,160-168`.
- **Consequência:** uma integração externa mudaria materialmente a fronteira de dados e pode contrariar retenção da fonte mesmo sem persistência local.
- **Recomendação/opções:** decidir por fonte e tarefa o conteúdo permitido, base/licença, PII/segredos, região, retenção, treinamento, logs, suboperadores e deleção. Preferir excertos mínimos; bloquear envio até a decisão. Local não elimina governança, apenas muda o operador.
- **Confiança:** alta.
- **O que mudaria minha opinião:** política contratual e técnica já aprovada cobrindo exatamente esses dados e fornecedores.

### AI-11 — O custo e a qualidade da revisão humana são desconhecidos

- **Prioridade:** média.
- **Fato medido:** o template registra `pending`, mas a única decisão viva foi documentada separadamente; não há duração, correções por campo, divergência, reabertura ou dupla revisão.
- **Evidência exata:** `src/extractor/artifacts.ts:111-155`; `docs/resultado-ensaio-extrator-abve-v1.md:64-100`.
- **Consequência:** não se sabe se AI reduziria trabalho, aumentaria a fila ou induziria viés de automação.
- **Recomendação/opções:** medir tempo ativo, decisão, campos corrigidos, motivo, concordância e reversões; ocultar “confiança” não calibrada e mostrar primeiro evidência/diferenças. Amostrar dupla revisão para estimar o próprio ruído humano.
- **Confiança:** alta.
- **O que mudaria minha opinião:** dados de operação humana já coletados de modo estruturado em outro sistema.

## 6. O que não foi provado

- que AI seja necessária em qualquer etapa atual;
- que o extrator determinístico generalize além do item `19617`;
- qualidade ou custo de qualquer modelo, fornecedor ou execução local;
- volume futuro de itens elegíveis, tokens ou decisões humanas;
- validade de score de confiança, resumo, classificação semântica ou comparação automática;
- economia de cache de fornecedor, batch, embeddings ou fine-tuning;
- autorização para enviar conteúdo de fontes a terceiros;
- que uma decisão humana única represente taxa de erro ou custo de revisão.

## 7. Complexidade e dívida

**Necessária:** hashes, versões, schema fechado, separação candidato/canônico, abstenção e revisão humana. Essa complexidade reduz reprocessamento e torna erro auditável.

**Prematura:** qualquer gateway multi-modelo, vector store, embeddings, fine-tuning, GPU local, roteador inteligente ou tabela abrangente de AI antes de casos e medições. O mesmo vale para persistência remota de candidatos enquanto o artefato local satisfizer o piloto.

**Dívida relevante:** ausência de corpus de avaliação, telemetria econômica e histórico estruturado de revisão. São pré-condições para decidir AI, não autorização para construir uma plataforma genérica.

**Descartável:** tratar probabilidade/confiança declarada pelo modelo como verdade, reenviar `unchanged`, resumir antes de preservar evidência ou usar AI para reproduzir validações determinísticas existentes.

## 8. Recomendações

- **Manter:** collector determinístico, fingerprints, manifests, handoff fail-closed, pacote estruturado, evidência mínima e promoção exclusivamente revisada.
- **Medir antes de decidir:** amostra representativa, baseline humana e determinística, métricas por campo/tarefa, custo completo e critérios de escalonamento.
- **Corrigir antes de operar AI:** contrato de rastreio de execução, chave de cache, política de terceiros/retenção e registro estruturado da decisão humana.
- **Simplificar:** uma tarefa por chamada e contexto mínimo expansível; evitar arquitetura multi-modelo até um segundo modelo provar benefício líquido.
- **Não fazer:** AI na coleta, promoção automática, modelo escolhido por preço nominal/benchmark genérico, ou envio de corpos integrais por padrão.
- **Reavaliar:** modelos pequenos, grandes, locais e externos somente com o mesmo corpus e limiares; aceitar como resultado válido que nenhuma opção supere regras + humanos.

## 9. Dependências de outras especialidades

- **Coleta:** cobertura incremental e estabilidade do fingerprint determinam quais itens evitam reprocessamento.
- **Banco e segurança:** eventual persistência de tentativas, candidatos, decisões, custos e retenção; identidade e privilégios separados antes de automação.
- **Backoffice:** fluxo que exponha evidência, divergências, custo e motivo de escalonamento sem induzir falsa confiança.
- **Arquitetura/gerência:** volume, orçamento, SLO, fornecedor, residência de dados e responsabilidade pela aprovação são decisões posteriores.

## 10. Limites da revisão

A revisão foi estática e offline, exceto pela instalação das dependências fixadas. Não executei coleta viva, banco remoto, API de modelos nem comparação de preços, pois isso não era necessário para avaliar a prontidão atual e fatos temporários distorceriam uma base sem workload.

O host ofereceu Node `24.12.0` (runtime auxiliar `24.19.0`), enquanto o projeto exige `>=24.21.0 <25`; por isso `pnpm verify` recusou iniciar. Com a checagem de engine ignorada apenas para diagnóstico, os 212 testes Node passaram. Executados diretamente, formatação e lint passaram, e Vitest passou com 72 arquivos/284 testes. A checagem de tipos encontrou oito erros preexistentes em `aneel-adapter.ts`, `aneel-html.ts`, `collection-run-store.ts` e `aneel-html.test.ts`; não os corrigi nem os transformei em achado de AI. Nenhum fato sobre qualidade, preço ou privacidade de fornecedor específico foi inferido sem evidência.
