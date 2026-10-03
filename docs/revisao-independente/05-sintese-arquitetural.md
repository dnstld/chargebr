# Síntese arquitetural independente

## 1. Identificação

- **Função:** arquiteto integrador independente da revisão do ChargeBR.
- **Agente:** Codex, trabalhando sem subagentes.
- **Commit-base:** `ac0d7bcad427ed252cdde1468df885673ec44a39`.
- **Data:** 3 de outubro de 2026.
- **Mandato:** integrar evidências e preservar decisões para o proprietário; não
  implementar, escolher arquitetura, escrever handoff ou produzir plano de
  execução.
- **Materiais lidos integralmente:**
  `docs/revisao-independente/README.md` e os pareceres
  `01-coleta.md`, `02-banco-de-dados.md`, `03-ai-e-custos.md` e
  `04-backoffice.md`. O arquivo `00-coordenacao-da-revisao.md` foi usado somente
  como registro operacional, e `docs/handoff-pre-backend.md` somente como
  fotografia histórica.
- **Verificação direta:** implementação e testes de collector/extrator,
  migrations e cargas canônicas, fronteira privada de leitura, contratos de
  acesso, aplicação de backoffice, pacotes de UI/tokens, configuração do
  workspace e documentos de ensaios citados pelos pareceres.
- **Convenção de evidência:** “fato confirmado” significa observação direta no
  commit-base; “parecer atribuído” preserva conclusão do especialista indicado;
  “inferência” liga fatos sem convertê-los em decisão. As alternativas da seção
  7 são opções, não recomendações.

### Limitações da verificação

Não houve acesso ao banco remoto, credenciais, artefatos privados dos ensaios,
telemetria de produção, pessoas operadoras ou fontes vivas. Não foram executadas
coletas nem escritas remotas. Assim, registros sobre o remoto são evidência
histórica versionada, não confirmação do estado em 3 de outubro.

Os quatro pareceres examinaram o commit
`d4361e6967ac5e7e7a6ffdcc187aa0b3cb45b803`, enquanto esta síntese parte de
`ac0d7bcad427ed252cdde1468df885673ec44a39`. A diferença inclui mudanças reais no
backoffice e no seu portão; por isso, achados afetados foram reconferidos no
commit-base atual, e não simplesmente repetidos.

O host ofereceu Node `24.12.0`, abaixo do intervalo `>=24.21.0 <25` exigido em
`package.json:5-8`. Com a checagem de engine desabilitada apenas para diagnóstico,
os 212 testes de collector/extrator e os 296 testes Vitest passaram. O typecheck
direto da raiz encontrou oito erros; o typecheck recursivo dos workspaces terminou
com sucesso. O portão oficial completo não pôde ser considerado reproduzido no
runtime exigido.

Não foi necessária pesquisa externa. Portanto, esta síntese não incorpora preços,
limites, disponibilidade ou promessas atuais de provedores.

## 2. Resumo das convergências

1. **Coleta deve continuar determinística e falhar fechada.** Os pareceres de
   coleta e AI concordam que HTTP, contratos, identidade, paginação, fingerprints,
   retries, contagens e classificação operacional não ganham com AI
   (`01-coleta.md:15-24`; `03-ai-e-custos.md:16-25`). O código confirma a
   classificação por fingerprint e a recusa de avançar quando a cobertura é
   parcial (`src/collector/abve-adapter.ts:322-445`).
2. **Candidato não é fato canônico.** Todos os pareceres que tocam a fronteira
   editorial preservam extração, revisão humana e promoção como etapas separadas.
   O artefato atual começa em `pending` e declara que o extrator não promove nem
   vincula registros (`src/extractor/artifacts.ts:111-155`).
3. **Proveniência precisa sobreviver à máquina de execução.** Coleta e banco
   identificam como lacuna central o uso de manifests e candidatos locais e a
   ausência de ligação persistente coleta → candidato → decisão → canônico
   (`01-coleta.md:59-77`; `02-banco-de-dados.md:77-95`). O backoffice depende
   dessa ligação para exibir uma fila revisável e auditável
   (`04-backoffice.md:66-73`).
4. **PostgreSQL/Supabase não foi refutado.** O parecer de banco encontrou schema,
   RLS e fronteira privada defensivos e não encontrou evidência de volume ou
   workload que justifique trocar de tecnologia (`02-banco-de-dados.md:13-22`).
   Isso sustenta sua presença nas três alternativas, mas não obriga a manter o
   Supabase como provedor nem a Data API como fronteira.
5. **Privilégio mínimo deve existir por ator, não só por convenção de código.** A
   separação atual do collector é valiosa, mas o extrator reutiliza a credencial
   capaz de criar e atualizar runs; o futuro backoffice ainda não tem autenticação,
   autorização ou auditoria (`01-coleta.md:79-87`; `04-backoffice.md:75-82`).
6. **A operação ainda não está provada.** Não há agendamento, alertas, restore
   testado, retenção operacional, resposta a incidentes ou observação prolongada.
   A ABVE cobre uma janela limitada e a ANEEL está explicitamente indisponível
   (`01-coleta.md:109-127`; `02-banco-de-dados.md:147-155`).
7. **O backoffice atual é fundação, não produto operacional.** Tokens,
   acessibilidade e primitivas podem ser reaproveitados, mas as rotas não leem
   fontes, runs, candidatos ou evidências e não executam tarefas de operação
   (`04-backoffice.md:13-24`).
8. **AI é opcional e ainda não selecionável.** Não há corpus, benchmark, volume,
   preço observado, tokens, tempo humano ou política de terceiros. Os pareceres
   convergem em manter AI fora da coleta, permitir no máximo propostas
   estruturadas depois do handoff e aceitar “sem AI” como resultado válido
   (`03-ai-e-custos.md:50-68,181-188`).
9. **As decisões de runtime, índices, UI e automação dependem de medição.** Nenhum
   parecer sustenta escolher hospedagem, modelo de AI, particionamento, navegação
   ou gráficos por preferência (`01-coleta.md:149-177`;
   `02-banco-de-dados.md:137-145`; `04-backoffice.md:168-182`).

## 3. Divergências e tensões preservadas

### 3.1 Artefato local: suficiente para ensaio, insuficiente para operação

- **Parecer atribuído a AI:** uma tentativa de AI poderia começar em artefato
  local, e persistência remota de candidatos seria prematura enquanto o piloto
  coubesse nesse limite (`03-ai-e-custos.md:80-88,171-177`).
- **Pareceres atribuídos a coleta e banco:** o histórico operacional não é
  recuperável se o diretório local desaparecer, e a linhagem termina antes do
  canônico (`01-coleta.md:59-67`; `02-banco-de-dados.md:77-85`).
- **Síntese:** não há contradição se “piloto descartável” e “operação recuperável”
  forem tratados como objetivos diferentes. Há conflito se um artefato local for
  chamado de autoridade operacional. A decisão depende do estado-alvo escolhido
  pelo proprietário.

### 3.2 Onde deve morar a autoridade durável

O parecer de banco deixa abertas duas formas: persistir a fronteira no banco ou
referenciar um registro externo durável e consultável (`02-banco-de-dados.md:77-85`).
O parecer de coleta também admite armazenamento durável ou payload limitado no
banco (`01-coleta.md:59-67`). Essa divergência é material: autoridade orientada a
artefatos e autoridade transacional orientada ao PostgreSQL produzem custos,
falhas e modelos de consulta diferentes. As alternativas A e B mantêm as duas
respostas possíveis.

### 3.3 Integridade semântica no banco ou na fronteira de escrita

O banco confirma muitas invariantes locais, mas não garante relacionalmente que
todo estado `accepted`/`validated` tenha evidência e metodologia compatíveis
(`02-banco-de-dados.md:67-75`). As opções preservadas pelo próprio parecer são
estado fraco até validação, promoção por contrato transacional ou invariantes
auditáveis materializadas. Checks frágeis entre tabelas não resolvem essa escolha.

### 3.4 Primeira finalidade real do backoffice

O parecer de backoffice considera duas fatias plausíveis — leitura operacional ou
revisão — sem escolher entre elas (`04-backoffice.md:48-64`). Começar por saúde de
runs reduz risco de escrita privilegiada; começar por revisão ataca a lacuna que
hoje deixa a decisão humana em documento. Frequência, urgência e custo das tarefas
não foram observados, então fabricar prioridade seria substituir evidência por
preferência.

### 3.5 Automação versus permanência manual

Os contratos atuais permitem somente `trigger_kind = 'manual_local'`
(`supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:248-320`).
Isso reduz superfície enquanto o piloto é estreito, mas não atende operação
agendada. O repositório não decide entre scheduler simples, fila transacional ou
orquestração distribuída; essa escolha aparece separadamente nas alternativas.

### 3.6 Escala explícita versus autorização orientada por dados

Policies literais por ABVE/ANEEL são auditáveis para dois endpoints, mas duplicam
DDL e acumulam alcance numa credencial (`01-coleta.md:139-147`;
`02-banco-de-dados.md:97-105`). Identidade por fonte reduz blast radius;
allowlist privada e policies genéricas reduzem repetição. Não há quantidade de
fontes, taxa de mudança ou regime de rotação que decida entre elas.

### 3.7 Fundação visual: preservar primitivas, não congelar composição

O parecer preserva tokens, temas, React Aria, foco e equivalência tabular, mas
considera navegação, taxonomia e formas de gráfico descartáveis se tarefas reais
não as validarem (`04-backoffice.md:158-175`). A síntese mantém essa diferença:
reuso de fundação não significa aceitar a arquitetura de informação existente.

## 4. Fatos confirmados diretamente no repositório

### 4.1 Mudanças desde a base dos pareceres

- O defeito da marca descrito como BO-05 foi corrigido antes do commit-base desta
  síntese: a aplicação passa `brandHorizontal.src` ao shell
  (`apps/backoffice/app/layout.tsx:21-40`), e o teste exige que cada referência
  aponte para um artefato emitido
  (`apps/backoffice/tests/emitted-document.test.ts:505-560`). **Conclusão:** BO-05
  não é risco vigente em `ac0d7bc`; os demais achados de ausência de fluxo
  operacional permanecem.
- A suíte atual passou 74 arquivos/296 testes Vitest e 212 testes Node na execução
  diagnóstica. O build emitiu três avisos de rastreamento amplo do filesystem:
  a rota de prova importa `@chargebr/tokens/palette`
  (`apps/backoffice/app/prova/subpaths/route.ts:1-30`), cuja descoberta de tokens
  lê diretórios dinamicamente (`packages/tokens/src/source.ts:56-79`). **Inferência:**
  a rota declaradamente não operacional não deve ser tomada como forma de
  implantação já validada; tamanho e conteúdo do bundle precisam ser medidos se
  ela sobreviver a um deploy.

### 4.2 Portão de engenharia

- `package.json:13-18` define `typecheck` como `tsc --noEmit`, mas `verify:types`
  como `pnpm -r exec tsc --noEmit`; o workspace inclui apenas `apps/*` e
  `packages/*` (`pnpm-workspace.yaml:1-3`), enquanto o contrato da raiz cobre
  `src` e `tests` (`tsconfig.json:16`).
- Na execução desta síntese, o primeiro comando encontrou oito erros e a forma
  recursiva direta terminou com sucesso. **Fato confirmado:** COL-01 continua
  aberto no commit-base.

### 4.3 Coleta e artefatos

- Manifests são gravados sob `.chargebr/collection-runs/<run_key>` e publicados
  como referência `local:` (`src/collector/artifacts.ts:17-76`). O próximo run
  lê o manifest anterior a partir de `rootDirectory` e degrada sua ausência para
  baseline indisponível (`src/collector/runner.ts:418-445`).
- A ABVE lê no máximo duas páginas de 50 itens, ordenadas por publicação, e não
  possui política de remoção (`src/collector/abve-adapter.ts:50-100`). Ela encerra
  ou marca parcial conforme cruza a fronteira anterior
  (`src/collector/abve-adapter.ts:322-445`). “Sem mudança” não prova que posts
  antigos não foram editados ou removidos.
- O adapter ANEEL limita retries, tamanho, redirects e charset e classifica
  desafio/403 como bloqueio sem fallback
  (`src/collector/aneel-adapter.ts:436-655`). A carga mais recente muda o endpoint
  para `unavailable` sem alterar runs
  (`data/canonical/0012_aneel-board-meetings-index-unavailable.sql:170-208,250-255`).
- O hash determinístico do manifest cobre o payload, mas remove
  `attempt_count`; histórico de tentativas e duração ficam no envelope e não são
  validados por `validateManifest` (`src/collector/manifest.ts:84-108,181-214`).
  Isso é telemetria, não cadeia de custódia completa, até existir hash ou assinatura
  adicional.

### 4.4 Extração e revisão

- O extrator atual é deliberadamente específico para o item ABVE `19617`, valor,
  período e âncoras literais (`src/extractor/pilot.ts:12-44,59-120`). Não é
  extrator geral nem corpus de avaliação.
- `extraction_key` identifica contrato, endpoint, item e fingerprint, mas não
  `run_key` (`src/extractor/package.ts:90-130`). O diretório usa apenas essa chave
  e rejeita bytes diferentes (`src/extractor/artifacts.ts:22-59`). **Fato
  confirmado:** duas proveniências de runs diferentes para o mesmo conteúdo podem
  colidir mesmo quando a identidade semântica converge.
- O extrator recebe `CHARGEBR_COLLECTOR_DATABASE_URL` e abre a mesma store do
  collector (`src/extractor/runner.ts:29-57,68-92`). Essa role possui `SELECT`,
  `INSERT` e `UPDATE` em `collection_runs`
  (`supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:25-79`).
  A interface de código é estreita, mas o isolamento de escrita não é imposto
  pela credencial.
- O ensaio histórico produziu um candidato e registrou `link_existing`, enquanto
  o arquivo de revisão permaneceu `pending`; a decisão vive somente no documento
  (`docs/resultado-ensaio-extrator-abve-v1.md:64-75`). Não há tabela de candidatos
  ou decisões operacionais nas migrations atuais.

### 4.5 Banco e segurança

- Existem 21 migrations. As 23 tabelas e RLS reportadas pelo especialista foram
  reconstruídas localmente por ele, mas esta síntese não consultou o remoto
  (`02-banco-de-dados.md:24-43`).
- A role do collector é login sem superprivilégio, `BYPASSRLS` ou criação de
  roles e tem limite de duas conexões
  (`supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:1-8`).
  Policies limitam ABVE e ANEEL a pares literais de fonte/endpoint
  (`supabase/migrations/20260916193622_collector_identity_grants_rls_v1.sql:85-164`;
  `supabase/migrations/20260929214528_extend_collector_access_to_aneel.sql:1-80`).
- Runs têm unicidade de chave e de execução ativa, sete estados, coerência do
  handoff e terminalidade imutável
  (`supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:248-320,470-589`).
- A função privada de leitura é `SECURITY DEFINER`, tem `search_path = ''`, exige
  papel executor e rejeita contexto JWT
  (`supabase/migrations/20260911171207_expose_methodology_contract_0001.sql:290-323`).
  Ela incorpora cópia mecânica de uma consulta específica
  (`supabase/migrations/20260911171207_expose_methodology_contract_0001.sql:325-328,1020-1032`),
  portanto não é uma API geral de backoffice.
- `events` permite `accepted` desde que `verification_level` não seja
  `unverified`, sem exigir `event_evidence`
  (`supabase/migrations/20260831132534_events.sql:73-101`). `metric_values` permite
  `validated` sem constraint de evidência/metodologia
  (`supabase/migrations/20260831142144_metric_values.sql:14-50`). A consistência
  semântica hoje depende das cargas e verificadores, não apenas do schema.
- `content_items` começa a linhagem em fonte, URL e fingerprint
  (`supabase/migrations/20260831124605_content_items.sql:1-18`), e `evidence` liga
  observação a conteúdo ou fonte (`supabase/migrations/20260831131643_evidence.sql:1-45`).
  Nenhuma delas referencia `collection_runs` ou candidato.
- Não existe `supabase/config.toml`. A carga `0004` declara depender da ordem
  `0001, 0002, 0003, 0005, 0006`
  (`data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql:23-56`), e a `0007`
  exige exatamente 17 migrations
  (`data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql:38-98`).
  Não há um comando versionado que reconstrua schema e dados atuais do zero.
- Documentos de aplicação registram versões remotas diferentes dos timestamps
  dos arquivos, ainda que declarem SQL byte a byte idêntico; por exemplo,
  `20260908152707`/`20260908161536`
  (`docs/resultado-aplicacao-historico-resolucoes-canonicas.md:14-35`) e
  `20260929214528`/`20260930054602`
  (`docs/resultado-aplicacao-acesso-collector-aneel.md:18-34`). Sem listagem remota
  atual e dry-run, a compatibilidade do fluxo normal de migrations permanece não
  provada. A afirmação histórica de ausência de divergência em
  `docs/handoff-pre-backend.md:29-45` não resolve esse risco posterior.

### 4.6 Backend, backoffice e AI

- O repositório não contém backend operacional geral. A única fronteira pronta é
  a função privada específica; a rota HTTP adicional do app existe para provar
  consumo de subpaths e declara não ser rota de negócio
  (`apps/backoffice/app/prova/subpaths/route.ts:12-30`).
- A raiz e `/prova/[id]` exibem o mesmo aviso de ausência de tela de produto
  (`apps/backoffice/app/page.tsx:4-11`;
  `apps/backoffice/app/prova/[id]/page.tsx:3-11`). As dependências do app são UI,
  tokens, Next e React, sem cliente de dados ou autenticação
  (`apps/backoffice/package.json:10-20`).
- O pacote raiz depende somente de `parse5` e `pg`; não há SDK de AI
  (`package.json:20-35`). Também não há registro de modelo, prompt, tokens, custo,
  cache ou escalonamento no envelope de extração
  (`src/extractor/package.ts:90-105`).

## 5. Decisões que ainda exigem medição

| Decisão | Medição mínima necessária | O que a medição distingue |
| --- | --- | --- |
| Estado remoto e baseline do banco | listagem somente leitura de migrations/schema; mapeamento arquivo↔versão; reconstrução do zero; restore testado com hashes | continuar fluxo atual, reconciliar histórico ou adotar snapshot + deltas |
| Autoridade de artefatos | volume/bytes por run; classes legais de retenção; custo de storage/egress; restauração sem filesystem local; teste de objeto ausente/corrompido | alternativa A orientada a artefatos versus B centrada no banco |
| Automação da coleta | dois runs ABVE repetíveis; duração, memória, bytes, retries e falhas; concorrência prevista; comportamento após crash | cron sequencial, worker transacional ou fila/orquestrador |
| Cobertura ABVE | amostra de posts antigos alterados/removidos; atraso aceitável; custo de varredura; significado operacional de “sem mudança” | manter janela, auditoria periódica ou outra estratégia incremental |
| ANEEL | novo preflight sem contorno; dois runs completos no runtime aprovado; custo de detalhes; contrato do endpoint alternativo, se houver | manter lacuna, reativar adapter ou substituir contrato |
| Runtime/hospedagem | CPU, memória, duração, conexões, frequência, limites de bundle e cold start com workload real | executor único, backend + worker ou serviços separados |
| Primeira tarefa do backoffice | pessoas/roles; tarefas e frequência; idade/volume da fila; tempo e erro por decisão; ações perigosas; necessidade de URLs compartilháveis | leitura operacional primeiro versus revisão primeiro; app único versus separado |
| Contrato de revisão | taxa de `accept_new`, `link_existing`, `correct`, `reject`; campos corrigidos; reaberturas; dupla revisão e discordância | estado e schema mínimos, quatro-olhos e autoridade de promoção |
| AI ou ausência de AI | corpus congelado e estratificado; baseline humana e determinística; precisão/recall por campo; abstenção; evidência correta; tokens, latência, custo e retrabalho por decisão útil | regra + humano, modelo pequeno, modelo maior, local ou nenhuma AI |
| Segurança operacional | atores, segregação exigida, rotação, sessão, ameaças, logs, RPO/RTO e resposta a incidente | identidades por fonte/serviço, RBAC, confirmação reforçada e topologia de deploy |
| Performance do banco | consultas reais, cardinalidades, planos, latência e taxa de escrita | manter/remover índices, adicionar projeções ou considerar particionamento |
| Processo de interface | lead time, tempo do portão, falhas escapadas e reutilização real de componentes | manter ou reduzir a cerimônia e o inventário de UI |

Preço nominal de infraestrutura ou de tokens, isolado dessas unidades, não decide
arquitetura. A unidade econômica comparável é custo total por run recuperável,
decisão humana concluída e fato canônico aceito.

## 6. Princípios e restrições derivados da evidência

1. **Versão coletada, transformação, decisão e estado canônico são identidades
   distintas e ligadas.** A ligação deve sobreviver a troca de host e restore.
2. **Toda promoção canônica é explícita, transacional e atribuível.** Nenhuma
   alternativa permite promoção por collector, extrator ou modelo.
3. **Falha de contrato é estado observável, não convite a fallback silencioso.**
   `partial`, `blocked`, `unavailable` e artefato ausente não podem aparecer como
   sucesso nem “sem mudança”.
4. **A autoridade de cada dado deve ser única e declarada.** Réplicas e índices
   podem existir, mas conflito entre artefato, banco e documento precisa ter regra
   de resolução verificável.
5. **Privilégios seguem atores:** collector, extrator, leitor, revisor, promotor e
   administrador recebem identidades e operações separadas. UI nunca substitui
   autorização no servidor.
6. **Automação herda idempotência, limite e recuperação.** Agendamento só muda o
   iniciador; não relaxa hash, lease, retry, timeout ou auditabilidade.
7. **Conteúdo mínimo não significa evidência descartável.** Retenção por fonte
   deve conservar hash, localizador, metadados e o material permitido necessário
   para provar a afirmação.
8. **AI, se existir, começa depois do handoff determinístico.** Saída é estruturada,
   admite `unknown`, cita evidência, tem chave de cache completa e registra custo e
   versão. Envio a terceiro depende de política aprovada para a fonte e a tarefa.
9. **Complexidade só se torna permanente depois de uso medido.** Isso vale para
   serviços, filas, taxonomia, gráficos, índices, modelos e abstrações genéricas.
10. **Cobertura é declarada com sua janela e lacunas.** “Todas as fontes” ou “sem
    mudança” não são critérios verificáveis sem conjunto, período e método.
11. **Schema e dados precisam de baseline reconstruível.** Estado remoto ou
    documento histórico não substitui ensaio de criação e restauração.

## 7. Alternativas arquiteturais completas

As três alternativas preservam os princípios acima. Elas diferem no centro de
autoridade, no mecanismo de automação e na quantidade de isolamento operacional.

### Alternativa A — Lote controlado, autoridade em artefatos, sem AI

**Adequação condicional.** Corresponde a uma fase de baixa frequência, poucas
fontes, uma equipe pequena e prioridade em evidência reproduzível sobre interação
em tempo real. Não pretende oferecer alto paralelismo nem uma operação rica para
muitos revisores.

**Coleta e automação.** Os adapters atuais continuam processos batch
determinísticos. Um scheduler simples dispara um endpoint por vez num executor
gerenciado; execução manual continua disponível para incidente e ensaio. Cada
tentativa produz um pacote imutável endereçado por conteúdo. Retries permanecem
dentro do contrato do adapter; repetição do job reutiliza a mesma identidade e
nunca promove dados.

**Armazenamento e banco.** Um object store imutável passa a ser a autoridade para
manifests completos, respostas permitidas pela retenção, pacotes de extração e
decisões humanas append-only. PostgreSQL/Supabase permanece autoridade dos dados
canônicos e mantém um índice operacional de runs, hashes, localizações, estado de
revisão e IDs relacionados. A promoção lê uma decisão assinada/hash-verificada e
grava canônico + vínculo em uma transação. A consistência entre object store e
índice é verificada por reconciliação; um objeto ausente bloqueia a operação.

**Backend/API.** Uma API fina, sem exposição direta da Data API, autentica a pessoa
operadora, oferece leitura de runs/evidências, emite acesso temporário a objetos,
aceita decisões append-only e solicita promoção separada. Ela não executa parsing
nem contém regra específica de fonte. A função privada atual pode continuar como
contrato de leitura `0001`, mas não é promovida a API geral.

**AI.** Ausente. Extrações determinísticas comprovadas continuam como controles;
casos não cobertos seguem para triagem humana. O custo de tokens é zero. Esta
alternativa não impede experimento offline futuro, mas AI não integra a operação.

**Backoffice.** O app lê o índice operacional e os artefatos pela API. Oferece
saúde de fontes/runs, fila de candidatos, comparação de evidência, registro de
uma das quatro decisões e histórico; ações de coleta/promoção ficam separadas e
confirmadas. Primitivas acessíveis são mantidas, enquanto navegação e gráficos só
entram quando uma tarefa os consumir.

**Segurança.** Identidades distintas para scheduler/collector, extrator somente
leitura, revisor de decisões, promotor canônico e API de leitura. Object store usa
chaves não adivinháveis, criptografia, retenção e acesso temporário; logs não
carregam corpos. O backoffice exige sessão, RBAC server-side e auditoria imutável.

**Observabilidade e operação.** `collection_runs` continua como visão de estado;
logs estruturados, métricas de duração/bytes/itens e alarme por atraso/falha
acompanham cada hash. Runbooks cobrem objeto ausente, retry, rotação, restore e
reconciliação. O scheduler não tenta ANEEL enquanto `unavailable`.

**Mantém:** adapters, fingerprints, canonical JSON, limites HTTP, estados de run,
RLS, função privada, schema canônico, piloto como regressão e fundação acessível
da UI.

**Substitui:** referências `local:` por URIs imutáveis; chave única de extração
por duas identidades — candidato semântico e tentativa/proveniência; credencial
compartilhada do extrator; decisão em Markdown como autoridade; processo manual
de baseline do banco.

**Remove quando substituído:** rota `/prova/[id]`, rota de prova de subpaths do
artefato implantado, composições de navegação/gráficos sem consumidor e adapter
ou contrato apenas após existir alternativa aprovada. Não remove ANEEL só por
estar indisponível.

**Benefícios:** custo recorrente baixo, nenhum token, cadeia de custódia explícita,
backup independente do banco e proximidade com o código batch existente.

**Custos e riscos:** custo inicial moderado para armazenamento, reconciliação,
API, auth e baseline; atomicidade atravessa object store e banco; consultas e
concorrência de revisão são menos naturais; retenção e egress podem dominar o
custo; migrar depois a autoridade dos artefatos exige importação e reindexação.

**Dependências para ser coerente:** decisão formal de retenção por fonte,
armazenamento com imutabilidade/restore testados, identificadores estáveis,
baseline reconciliada e aceitação explícita de operação batch de baixa
concorrência.

### Alternativa B — Plataforma operacional centrada no PostgreSQL

**Adequação condicional.** Corresponde a operação contínua com filas consultáveis,
um ou mais revisores e necessidade de consistência imediata entre estado do run,
candidato, decisão e promoção, sem evidência atual para fragmentar em serviços.

**Coleta e automação.** Scheduler cria jobs idempotentes numa fila transacional no
PostgreSQL. Um worker modular executa os adapters existentes, conserva lease e
heartbeat e persiste cada item/versionamento. Binários grandes ou capturas ficam
em object storage, mas hash, URI, retenção e estado vivem no banco. Workers podem
escalar separadamente do servidor web sem quebrar o monorepo ou os contratos.

**Armazenamento e banco.** PostgreSQL é a autoridade tanto canônica quanto do
workflow operacional estruturado: runs, itens coletados, versões, extrações,
candidatos, tentativas, revisões, decisões, promoções e auditoria. Object storage
é blob store subordinado e endereçado por conteúdo. Uma transação de promoção
valida cadeia de evidência, decisão e versão, escreve o canônico e registra o
vínculo imutável. Estados fortes não são graváveis fora dessa fronteira.

**Backend/API.** Um backend modular é a única fronteira de escrita. Módulos de
leitura pública, operação, revisão, promoção e administração usam roles próprias;
nenhum cliente recebe `service_role` ou a credencial do collector. A API pode
estar no mesmo deploy lógico do Next ou em processo separado, escolha reversível
depois de medir runtime, desde que a autorização seja server-side.

**AI.** Desativada por padrão. Depois de corpus e limiares aprovados, um módulo de
extração pode produzir candidatos somente para fingerprints `new`/`changed`. Cada
tentativa registra tarefa, versão de política/prompt, modelo, parâmetros, contexto,
schema, tokens, cache, latência, custo e motivo de escalonamento. Cache inclui
tarefa + versões + fingerprint de conteúdo/contexto. Regra determinística e
humano continuam caminhos válidos; promoção automática continua proibida.

**Backoffice.** Consome a API para saúde, incidentes, fila, comparação lado a lado,
correção, decisão e auditoria. Pode nascer somente leitura até auth/RBAC/auditoria
passarem nos testes. A organização da informação deriva de tarefas medidas; a
biblioteca atual é fonte de primitivas, não mapa obrigatório de telas.

**Segurança.** RLS e fronteira privada permanecem, com roles distintas por módulo
e, se a escala justificar, por fonte. Sessão curta, RBAC, reautenticação para
ação de alto impacto, proteção contra replay, idempotency keys e audit log
append-only. Promoção e correção material podem exigir quatro-olhos conforme a
medição de risco.

**Observabilidade e operação.** Métricas, logs e traces ligam request/job,
`run_key`, item, tentativa de extração, decisão e promoção. Painéis medem atraso,
fila, erro, cobertura, custo e restore. Backups, PITR, object-store restore,
rotação e disaster recovery são testados juntos. Jobs têm retry limitado e
quarentena; fonte `unavailable` não é reagendada.

**Mantém:** núcleo determinístico, schema canônico enquanto útil, PostgreSQL/
Supabase, RLS, histories append-only, função privada versionada, componentes
acessíveis e humano como autoridade editorial.

**Substitui:** manifests/candidatos locais por registros e blobs duráveis;
scripts de carga como única fronteira de escrita por contratos transacionais;
credencial comum por identidades mínimas; typecheck incompleto; rotas de prova por
jornadas reais.

**Remove quando substituído:** cópias mecânicas que puderem ser geradas de fonte
única, pré-condições acopladas a contagens globais, UI sem consumidor e artefatos
locais como autoridade. Estruturas canônicas só são removidas após consulta e uso
medidos.

**Benefícios:** consulta e auditoria uniformes, consistência transacional,
backoffice mais simples de alimentar, menor reconciliação entre sistemas e caminho
direto para medir revisão/AI.

**Custos e riscos:** custo inicial alto de schema operacional, API, auth, migração
de baseline e testes de concorrência; maior impacto de erro no banco central;
crescimento de tabelas e blobs exige retenção clara; tentações de usar
`service_role` ou Data API diretamente precisam ser bloqueadas; modelar tudo antes
de observar tarefas criaria nova complexidade prematura.

**Dependências para ser coerente:** histórico remoto reconciliado, baseline e
restore executáveis, contrato transacional de promoção, modelo mínimo de candidato
e decisão, política de blobs e medição que justifique operação interativa.

### Alternativa C — Serviços isolados orientados a eventos

**Adequação condicional.** Corresponde somente a volume, variedade de fontes,
concorrência, equipes ou SLOs que exijam isolamento de falhas e escala independente.
Esses gatilhos não foram provados no repositório; a alternativa existe para o
proprietário decidir se requisitos externos ainda não medidos precisam ser
assumidos explicitamente.

**Coleta e automação.** Um control plane versiona endpoints e agenda mensagens.
Workers por source/contrato consomem uma fila com entrega pelo menos uma vez,
produzem manifest imutável em object storage e publicam evento com hash. Extração,
revisão e promoção são consumidores distintos; inbox/outbox, idempotency keys e
dead-letter queue evitam que reentrega vire duplicação.

**Armazenamento e banco.** Object storage é autoridade dos bytes e manifests;
PostgreSQL mantém control plane, índices, candidatos, decisões e canônico. Um
ledger append-only registra eventos de domínio e liga seus hashes. Projeções são
reconstruíveis; promoção continua transacional no banco canônico. Essa forma aceita
consistência eventual fora da promoção e exige reconciliação explícita.

**Backend/API.** API gateway separa leitura pública, operação e administração. Um
serviço de workflow controla comandos e autorização; serviços não escrevem tabelas
alheias. O backoffice acompanha estado assíncrono por API, sem presumir que comando
aceito já terminou.

**AI.** Um worker opcional e isolado consome somente candidatos elegíveis. Pode
usar serviço externo ou runtime local depois do mesmo benchmark e da política de
dados; escolha local troca tokens por hardware e operação, não elimina governança.
Modelo nenhum recebe autoridade de promoção. Logs de AI seguem o mesmo ledger e
cache versionado.

**Backoffice.** Mostra linha do tempo de eventos, estado atual derivado, atraso,
retries, dead letters, evidência, divergências e decisões. Comandos perigosos são
assíncronos, idempotentes, confirmados e auditados. UI precisa representar estado
parcial e desatualizado de forma explícita.

**Segurança.** Identidade de workload por serviço e, quando necessário, por fonte;
segredos rotacionados, rede mínima, criptografia e políticas independentes. API
autentica pessoas; broker e storage autenticam workloads. O ganho de isolamento
vem acompanhado de mais credenciais, policies e superfícies para auditar.

**Observabilidade e operação.** Correlation ID atravessa fila, object store,
workers, banco e API; métricas cobrem lag, tentativas, DLQ, versões de contrato e
custos. Deploys compatíveis com versões antigas, replay controlado, backup e
reconstrução de projeções tornam-se obrigações permanentes.

**Mantém:** adapters determinísticos como bibliotecas, hashes, schema canônico,
RLS no que permanecer em PostgreSQL, separação editorial, componentes acessíveis
e contratos versionados.

**Substitui:** runner local por workers; referências locais por storage imutável;
policies acumuladas numa role por identidades de workload; handoff síncrono por
eventos versionados; observabilidade por processo por rastreamento distribuído.

**Remove quando substituído:** duplicação de lifecycle dentro de cada adapter,
rotas de prova, autoridade de documentos e composição de UI não validada. O
monólito não é decomposto além das fronteiras que medições exigirem.

**Benefícios:** isolamento de falha e credencial, escala independente, replay e
integração natural de múltiplos tipos de worker e fontes.

**Custos e riscos:** custo inicial e recorrente muito altos; consistência eventual,
ordenação, evolução de eventos, DLQ e observabilidade distribuída são novos modos
de falha; mais serviços ampliam on-call e segurança; sem volume/SLO, a arquitetura
é complexidade não justificada.

**Dependências para ser coerente:** SLO e volume que provem a necessidade, equipe
capaz de operar broker/workers 24×7, contrato de eventos evolutivo, orçamento de
infraestrutura e testes de replay/recuperação.

## 8. Comparação uniforme entre alternativas

Os custos são relativos porque não há workload nem preços datados. “Inicial” inclui
baseline, segurança, API, persistência, testes e recuperação; “recorrente” inclui
infraestrutura e carga operacional humana, não apenas fatura do provedor.

| Critério | A — lote/artefatos/sem AI | B — PostgreSQL operacional | C — serviços/eventos |
| --- | --- | --- | --- |
| Adequação | poucas fontes, baixa frequência, equipe pequena, operação controlada | operação contínua, fila consultável e revisão interativa | muitas fontes/execuções, concorrência ou SLO/isolamento fortes |
| Custo inicial | médio | alto | muito alto |
| Custo recorrente | baixo a médio; storage e operação batch | médio; banco, blobs, backend e worker | alto; broker, múltiplos workloads, tracing e on-call |
| Autoridade operacional | artefato imutável; banco indexa | PostgreSQL; object store é subordinado | artefatos + ledger; projeções no PostgreSQL |
| Risco dominante | inconsistência/reconciliação entre objeto e índice | concentração no banco e schema prematuro | consistência eventual e complexidade distribuída |
| Segurança | menos workloads, mas storage e promoção cruzam fronteiras | fronteira central mais simples de auditar; blast radius do banco maior | melhor isolamento possível; maior número de identidades e policies |
| Complexidade | moderada | alta, concentrada | muito alta e distribuída |
| Manutenção | adapters + scheduler + API/reconciliação | backend/worker/schema numa base modular | contratos, broker, serviços, compatibilidade e plataforma |
| Tokens/AI | zero | zero até gate; depois custo por `new`/`changed` e cache | zero até gate; depois tokens externos ou custo de hardware local |
| Backoffice | leitura e decisão sobre artefatos; concorrência limitada | fluxos e métricas naturais sobre dados estruturados | UI assíncrona sobre eventos, retries e estados parciais |
| Observabilidade | logs/métricas por batch e reconciliação | traces e métricas ponta a ponta dentro de poucos processos | tracing distribuído, lag, DLQ e replay obrigatórios |
| Automação | scheduler sequencial | fila transacional + workers | broker + workers independentes |
| Recuperação | restore de objetos + índice + canônico | restore coordenado de PostgreSQL + blobs | restore, replay de ledger e reconstrução de projeções |
| Reversibilidade | alta para runtime/UI; média-baixa para mudar autoridade depois | alta para framework; média para schema e promoção | serviços substituíveis isoladamente, mas eventos/topologia são caros de desfazer |
| Evidência atual a favor | código batch e volume comprovado estreito | schema/RLS maduros e necessidade de workflow consultável | apenas necessidade potencial de isolamento; escala não provada |
| Evidência ausente decisiva | retenção, restore e tolerância à baixa concorrência | volume de operação, tarefas, auth e baseline remota | volume, SLO, equipes e capacidade operacional |

Nenhuma linha torna uma alternativa vencedora por si só. A depende de aceitar um
limite operacional; B depende de justificar e modelar um workflow estruturado; C
depende de provar uma escala que hoje não aparece no repositório.

## 9. Decisões reversíveis versus difíceis de reverter

### Reversíveis ou substituíveis com custo contido

- framework do backend/BFF, desde que contratos e identidade não vazem detalhes;
- provedor do scheduler em A ou do worker em B;
- primeira fatia do backoffice somente leitura;
- navegação, gráficos e composição visual sem dados persistidos;
- ferramenta de logs, métricas e alertas com formatos exportáveis;
- modelo, fornecedor ou prompt de AI, se tentativa, entrada, saída e cache forem
  versionados e se nenhum deles promover canônico;
- habilitar ou manter AI ausente;
- consolidar runner comum após existir terceiro caso, sem mudar manifests;
- corrigir o portão de typecheck e remover rotas de prova quando substituídas.

### Caras, duradouras ou parcialmente irreversíveis

- escolher artefato, PostgreSQL ou ledger como autoridade operacional;
- identidade de item, versão, candidato, tentativa, decisão e seus vínculos;
- reconciliar ou abandonar o histórico de migrations remoto;
- semântica de `accepted`, `validated`, correção, supersessão e promoção;
- apagar ou não reter evidência necessária; retenção perdida não é reconstruível;
- enviar conteúdo a fornecedor externo; exposição e retenção já ocorridas não são
  desfeitas por troca futura de modelo;
- modelo de papéis, segregação de funções e trilha administrativa;
- contratos públicos de API e eventos consumidos por outros sistemas;
- adotar consistência eventual e topologia distribuída da alternativa C;
- consolidar aplicações pública e administrativa se isso misturar sessões,
  privilégios e ciclos de deploy; a decisão é reversível tecnicamente, mas pode
  exigir migração de auth e rotas;
- aceitar a cobertura ABVE como histórica ou apenas incremental sem declarar a
  diferença, porque decisões editoriais podem ser tomadas sobre ausência falsa.

### Reversibilidade intermediária

- Supabase como provedor: PostgreSQL favorece portabilidade, mas roles, operação,
  backups e APIs específicas elevam o custo de saída;
- schema de candidatos/revisões: migrations são possíveis, porém decisões antigas
  precisam permanecer interpretáveis;
- object storage: blobs endereçados por conteúdo são copiáveis, mas locks de
  retenção, URIs e egress podem prender a operação;
- app único versus app público/backoffice separados: pode mudar, desde que auth e
  contratos server-side sejam independentes da composição inicial.

## 10. Perguntas objetivas para a decisão do proprietário

1. O próximo estado desejado é **piloto controlado recuperável**, **operação
   contínua com revisão interativa** ou **plataforma já preparada para escala e
   isolamento**? Isso seleciona o problema que A, B ou C tenta resolver; não define
   sozinho a implementação.
2. Qual conjunto nomeado de fontes encerra a primeira fase, e a indisponibilidade
   da ANEEL bloqueia esse encerramento ou é uma lacuna aceita e visível?
3. Qual deve ser a autoridade operacional: artefato imutável (A), PostgreSQL (B)
   ou artefato + ledger/eventos (C)?
4. Quantas pessoas e papéis operarão coleta, revisão e promoção? Alguma decisão
   exige quatro-olhos ou uma única pessoa administradora é risco aceito?
5. Qual RPO, RTO, disponibilidade e atraso máximo são necessários? Sem esses
   números não há base para escolher scheduler, worker ou fila.
6. A primeira entrega de backoffice deve provar leitura/incident response ou
   revisão/decisão? Qual tarefa observada justifica essa escolha?
7. O proprietário aceita **nenhuma AI** enquanto regras + humanos não forem
   superados num corpus comum? Se não, qual limiar de qualidade, orçamento por
   decisão útil e política de envio a terceiros deve funcionar como gate?
8. Que conteúdo pode ser retido por fonte e por quanto tempo? Hash + excerto são
   suficientes, ou há obrigação/autoridade para captura completa?
9. Deve haver identidade de collector por fonte desde o início, ou a duplicação e
   o blast radius da role compartilhada são aceitos enquanto existirem dois
   endpoints?
10. O proprietário aceita consistência eventual e carga operacional distribuída
    da alternativa C antes de haver volume medido, ou essa possibilidade deve
    permanecer apenas como gatilho futuro?
11. Após a auditoria remota, qual fonte de verdade será escolhida para migrations
    e baseline: histórico reconciliado, snapshot verificado + deltas ou outro
    mecanismo automatizado?
12. A aplicação pública e o console administrativo compartilham deploy, sessão e
    domínio, ou a separação de privilégio exige aplicações independentes? A
    evidência atual não decide.

## 11. Limites da síntese

Esta síntese não aprova nenhuma alternativa, tecnologia nova, fonte, modelo de AI,
fornecedor, runtime, hospedagem, orçamento ou sequência de execução. Também não
converte prioridades dos especialistas em autorização de mudança.

As alternativas são internamente coerentes sob condições distintas; deixam de ser
coerentes se componentes forem combinados sem resolver sua autoridade. Em
particular, A não pode tratar simultaneamente banco e objeto como fonte primária;
B não pode permitir writers fora da promoção transacional; C não pode dispensar
idempotência, outbox/replay e observabilidade distribuída.

O documento não prova estado remoto, disponibilidade das fontes, custo real,
necessidade de AI, desempenho, segurança em produção ou capacidade de pessoas
operadoras. Essas ausências são limitações e medições pendentes, não fatos a
preencher por suposição. Qualquer decisão do proprietário pode legitimamente
escolher A, B, C, uma variante explicitamente delimitada ou nenhuma delas; o que
não é sustentado é declarar operação pronta mantendo manifests locais, baseline
não reconstruível, credencial compartilhada do extrator, backoffice sem auth/API
e ausência de vínculo persistente entre coleta, revisão e canônico.
