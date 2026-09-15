# Fundação do pipeline de coleta v1

## Estado e escopo

`PROPOSTA PARA REVISÃO`

Este documento detalha a primeira etapa da direção **collection-first** já aceita. Ele seleciona um endpoint inicial da ABVE e um da ANEEL, propõe os contratos conceituais de `source_endpoints` e `collection_runs` e fixa os limites do primeiro coletor manual/local.

O documento não cria migration, tabela, coletor, credencial, backend, API, frontend ou automação e não escolhe framework, runtime ou hospedagem. Nenhuma alteração no Supabase faz parte deste PR.

## Confirmação do que o schema atual já representa

Antes de propor novas estruturas, foram revisadas as migrations de `sources`, `content_items`, `observations` e `evidence`, a extensão de data de publicação e o histórico de resoluções canônicas.

| Necessidade | Estrutura atual | O que já está atendido | O que não está atendido |
| --- | --- | --- | --- |
| Identidade e avaliação do publicador | `sources` | nome, `slug`, homepage, tipo, estado editorial, país, idiomas, natureza primária, grupo e notas | locais concretos e regras de coleta |
| Publicação ou documento específico | `content_items` | fonte, URL, título, tipo, data ou instante de publicação, coleta, autor, idioma, retenção, referência de captura e fingerprint | endpoint e execução que descobriram ou voltaram a observar o item; identificador nativo da fonte |
| Versões e correções | múltiplos `content_items` e `content_item_relations` | mesma URL pode ter fingerprints diferentes; versões aceitas podem ser relacionadas como correção, revisão ou substituição | histórico operacional anterior à revisão e classificação automática `new`/`changed`/`unchanged` |
| Afirmação extraída | `observations` | afirmação original, normalização, data, geografia, método de extração, termo da fonte e fingerprint | estado de candidatura/revisão, versão do extrator, localização no conteúdo e ligação à execução |
| Linhagem da afirmação | `evidence` | origem exata ou fonte de origem, chave e grau de certeza da linhagem | proveniência de transporte e captura |

Conclusões:

- `sources` deve continuar representando **quem publica ou mantém** a informação. Não deve receber URL de API, paginação, cursor ou estado operacional.
- `content_items` deve continuar representando **o que foi publicado**. Um índice, feed, API ou dump não é um item apenas por ter sido consultado.
- `observations` e `evidence` pertencem ao fluxo de conteúdo já estruturado; não substituem o registro de uma tentativa de coleta.
- a ABVE já possui a fonte canônica `sources.slug = 'abve'`, aprovada, primária e em `pt-BR`; ela deve ser reutilizada sem alteração;
- não há fonte ANEEL nas migrations, seeds ou cargas canônicas atuais. Antes de persistir um endpoint ANEEL, uma etapa própria deverá cadastrar e revisar a fonte ANEEL. Este documento não antecipa esse registro.

Portanto, nenhuma estrutura atual atende à identidade/configuração de um local coletável nem ao histórico de execuções bem-sucedidas, vazias, parciais ou falhas. `source_endpoints` e `collection_runs` cobrem lacunas reais e não duplicam as quatro entidades existentes.

## Endpoints selecionados

Os endereços foram inspecionados em 15 de setembro de 2026. Ambos aceitam `GET`, não exigiram autenticação e pertencem a domínios oficiais das fontes.

### ABVE — posts da categoria Notícias

Endpoint lógico:

```text
https://abve.org.br/wp-json/wp/v2/posts
  ?categories=13
  &per_page={page_size}
  &page={page}
  &_fields=id,date,modified,slug,link,title,excerpt,content
```

Por que foi escolhido:

- a página oficial da categoria anuncia a API JSON e identifica Notícias como categoria `13`;
- a resposta oferece `id` nativo, URL canônica, data, última modificação, título e conteúdo;
- `X-WP-Total`, `X-WP-TotalPages` e `Link` tornam a paginação observável;
- uma consulta pelo `slug` encontrou a publicação já usada pelo ChargeBR sobre a expansão da recarga rápida, permitindo um caso de regressão conhecido;
- `robots.txt` não declara caminhos proibidos no momento da inspeção.

Limites:

- é uma interface do CMS, não um contrato publicado pela ABVE; categoria, campos ou disponibilidade podem mudar;
- a listagem é ordenada e mutável, portanto itens novos podem deslocar páginas durante a execução;
- ausência em uma janela ou página não significa remoção;
- o conteúdo chega como HTML dentro de JSON e exige normalização versionada;
- a política de privacidade não equivale a uma autorização específica de coleta. A frequência inicial será manual e conservadora, e qualquer restrição posterior interromperá o ensaio.

O primeiro ensaio deve fixar `before` no instante de início, usar uma janela e número de páginas limitados e registrar a ordenação efetiva. A primeira amostra não precisa varrer o arquivo inteiro.

Referências: [arquivo de Notícias](https://abve.org.br/category/noticias/), [API de posts](https://abve.org.br/wp-json/wp/v2/posts), [publicação conhecida](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/) e [robots.txt](https://abve.org.br/robots.txt).

### ANEEL — Pautas e Atas das Reuniões Públicas da Diretoria

Endpoint lógico selecionado:

```text
https://dadosabertos.aneel.gov.br/datastore/dump/
43386a8b-4781-44ec-a082-fa7fdfe33186?format=json
```

O recurso pertence ao conjunto “Pautas e Atas das Reuniões Públicas da Diretoria”. O snapshot JSON expõe esquema e registros com, entre outros campos, `DatGeracaoConjuntoDados`, `DatReuniao`, `IdeReuniao`, `IdcSituacao`, `NumProcesso`, `NumOrdem`, `NumAtoAdministrativo`, `NomTipoAtoAdministrativo`, `TxtAssunto`, `TxtDecisaoJulgamento` e `DscResultadoJulgamento`.

Por que foi escolhido:

- é um conjunto oficial, processável por máquina e publicado sob ODbL;
- o recurso possui UUID estável no catálogo e DataStore ativo;
- o dump completo permite exercitar snapshot, alteração de linhas e ausência entre versões;
- os campos conectam reunião, processo, assunto, decisão e ato administrativo sem exigir interpretação jurídica na coleta;
- a amostra contém um caso diretamente pertinente ao ChargeBR: o item 8 da `21/2018 - RPO`, processo `48500000825201695`, registra a decisão sobre condições para recarga de veículos elétricos e o ato normativo `819`;
- ele introduz estrutura tabular e semântica regulatória distintas das publicações editoriais da ABVE.

Limites:

- o dump é integral, sem paginação HTTP; a página do recurso reportava aproximadamente 17,9 MiB para o CSV correspondente na inspeção;
- o `_id` do DataStore é técnico e não deve ser tratado sozinho como identidade de domínio;
- o mesmo recurso pode ser substituído mantendo a URL, e linhas históricas podem ser corrigidas;
- relevância para mobilidade elétrica não pode ser decidida pela coleta;
- chamadas diretas à Action API do catálogo apresentaram timeout no ambiente de pesquisa. Por isso a v1 seleciona o dump JSON que pôde ser inspecionado; duração, tamanho e estabilidade deverão passar por preflight local antes do ensaio.

Referências: [conjunto de dados](https://dadosabertos.aneel.gov.br/dataset/pautas-e-atas-das-reunioes-publicas-da-diretoria), [recurso e metadados](https://dadosabertos.aneel.gov.br/dataset/pautas-e-atas-das-reunioes-publicas-da-diretoria/resource/43386a8b-4781-44ec-a082-fa7fdfe33186) e [snapshot JSON](https://dadosabertos.aneel.gov.br/datastore/dump/43386a8b-4781-44ec-a082-fa7fdfe33186?format=json).

## Fluxo completo

```text
source aprovada
  → source_endpoint ativo e configuração pública validada
  → preflight de acesso, limites e política
  → collection_run iniciado por pessoa em ambiente local
  → respostas coletadas com retry limitado
  → transporte, formato e contrato validados
  → IDs, URLs e conteúdo normalizados de forma determinística
  → manifest imutável com hashes e classificação operacional
       new | unchanged | changed | removal_candidate | inaccessible | rejected
  → candidatos a content_items
  → extração separada de candidatos a observations
  → pacote de revisão humana
  → aceite, correção, rejeição ou pendência
  → persistência canônica somente em etapa posterior
```

O cursor só pode avançar depois de uma execução terminal completa. Resultado parcial, falha, bloqueio ou contrato inesperado preserva o cursor de entrada.

## Responsabilidades das entidades

| Entidade | Responsabilidade | Não é responsável por |
| --- | --- | --- |
| `sources` | identidade, natureza e avaliação da fonte | transporte, paginação ou saúde de endpoint |
| `source_endpoints` | endereço lógico e configuração pública de coleta | representar publicação, execução ou segredo |
| `collection_runs` | uma invocação observável do coletor e seu resultado agregado | afirmar verdade editorial ou substituir item/observação |
| manifest da execução | respostas, registros e decisões determinísticas por item, com hashes | aceite canônico |
| `content_items` | versão de publicação ou documento aceito | registrar cada visita ao endpoint |
| candidato a `observations` | proposta rastreável de afirmação estruturada | virar fato automaticamente |
| `observations` | afirmação aceita e sua normalização defensável | estado de transporte |
| `evidence` | linhagem semântica de uma observação | log de HTTP |
| revisão humana | relevância, significado, suficiência, conflitos e aceite | refazer silenciosamente a coleta |

## Contrato conceitual de `source_endpoints`

| Campo proposto | Tipo conceitual | Regra |
| --- | --- | --- |
| `id` | identidade interna | chave primária |
| `source_id` | referência | obrigatório, aponta para `sources`, exclusão restrita |
| `endpoint_key` | texto estável | obrigatório; único dentro da fonte; não depende da URL mutável |
| `name` | texto | nome humano curto |
| `endpoint_url` | texto | endereço ou template público, não vazio |
| `endpoint_type` | vocabulário | `listing`, `feed`, `api`, `snapshot` ou `document_index` |
| `access_method` | vocabulário | inicialmente apenas `http_get` |
| `response_format` | vocabulário | `html`, `json`, `xml`, `csv`, `pdf` ou `other` |
| `status` | vocabulário | `candidate`, `active`, `paused`, `unavailable` ou `retired` |
| `pagination_strategy` | configuração pública | `none`, `page`, `offset`, `cursor` ou `link`; inclui limites seguros |
| `cursor_strategy` | configuração pública | define a janela ou marcador, não armazena segredo |
| `identity_rule` | configuração versionada | campos nativos e fallback usados para identidade de item |
| `normalization_profile` | texto versionado | identifica a regra que produz fingerprints comparáveis |
| `request_config` | objeto público | parâmetros, headers permitidos, timeout e limite de bytes; nunca cookies, tokens ou chaves |
| `suggested_interval` | duração opcional | orientação operacional, sem criar agenda |
| `default_retention_class` | vocabulário existente | herda os valores já definidos em `content_items`; pode ser sobrescrito após revisão |
| `terms_url` | texto opcional | referência aos termos ou licença aplicáveis |
| `robots_url` | texto opcional | referência ao arquivo de robots quando aplicável |
| `access_reviewed_at` | instante opcional | quando condições de acesso foram verificadas |
| `notes` | texto opcional | limitações não estruturadas |
| `created_at`, `updated_at` | instantes | auditoria do cadastro |

Regras mínimas:

- unicidade de `(source_id, endpoint_key)`;
- `request_config` deve ser um objeto e não pode conter material secreto;
- um endpoint `active` precisa de URL, método, formato, regra de identidade e perfil de normalização válidos;
- `unavailable` é uma decisão operacional confirmada, não consequência automática de uma falha transitória;
- última coleta, última execução bem-sucedida e saúde corrente devem ser derivadas de `collection_runs`, evitando duplicação no endpoint;
- o próximo cursor deve ser derivado da execução completa mais recente. Um campo materializado só deve ser considerado após existir necessidade medida de concorrência ou desempenho.

Configuração inicial:

| Chave | ABVE | ANEEL |
| --- | --- | --- |
| `endpoint_key` | `abve-news-wordpress-posts` | `aneel-board-meetings-dump` |
| Tipo/formato | `api` / `json` | `snapshot` / `json` |
| Paginação | `page`, limitada e congelada por janela | `none`; snapshot integral |
| Identidade primária | `id` do post | composição de `IdeReuniao`, `NumOrdem` e `NumProcesso`; `_id` apenas auxiliar |
| Sinal de alteração | hash normalizado e `modified` como pista | hash da linha e `DatGeracaoConjuntoDados` como pista |
| Remoção inferível | não por ausência em página limitada | apenas após snapshots completos e confirmação |

## Contrato conceitual de `collection_runs`

Uma execução representa uma invocação completa do coletor, não cada request HTTP interno. Requests repetidos por retry permanecem na mesma execução; uma nova ação da pessoa operadora cria outra execução.

| Campo proposto | Tipo conceitual | Regra |
| --- | --- | --- |
| `id` | identidade interna | chave primária |
| `source_endpoint_id` | referência | obrigatório, exclusão restrita |
| `run_key` | texto/UUID | chave única da invocação; reutilizada apenas para retomar a mesma execução interrompida |
| `status` | vocabulário | estado da máquina descrita abaixo |
| `started_at`, `finished_at` | instantes | início obrigatório; fim obrigatório em estado terminal |
| `trigger_kind` | vocabulário | inicialmente `manual_local` |
| `initiated_by` | texto | pessoa ou processo identificável, sem credencial |
| `collector_name`, `collector_version` | textos | implementação e revisão exatas usadas |
| `contract_version` | texto | versão deste contrato operacional |
| `config_fingerprint` | hash | configuração pública efetiva, sem segredo |
| `window_start`, `window_end` | instantes opcionais | limite lógico da execução |
| `cursor_in`, `cursor_out` | objetos opcionais | marcador recebido e próximo marcador; `cursor_out` só é comprometido em execução completa |
| `request_attempt_count` | inteiro | total de requests, incluindo retries, não negativo |
| `response_manifest_hash` | hash opcional | hash do manifest ordenado de respostas/páginas |
| `response_manifest_reference` | texto opcional | referência recuperável ao artefato, conforme retenção |
| `http_status` | inteiro opcional | estado final quando existe uma única resposta; múltiplas respostas ficam no manifest |
| `response_content_type`, `etag`, `last_modified` | metadados opcionais | preservados sem inferir veracidade |
| `response_bytes` | inteiro opcional | volume total recebido, não negativo |
| `items_found` | inteiro | identidades enumeradas |
| `items_new`, `items_unchanged`, `items_changed` | inteiros | classes mutuamente exclusivas por identidade |
| `items_removal_candidates` | inteiro | ausências qualificadas, nunca remoções automáticas |
| `items_inaccessible`, `items_rejected` | inteiros | falhas por item e violações do contrato |
| `error_kind`, `error_code`, `error_message` | campos opcionais | erro sanitizado; sem resposta integral, stack sensível ou segredo |
| `handoff_status` | vocabulário | `not_produced`, `ready_for_extraction` ou `withheld` |
| `created_at`, `updated_at` | instantes | criação e finalização; estado terminal torna-se imutável |

Invariantes:

- contagens são não negativas e coerentes com `items_found`;
- `finished_at` é nulo somente em `running`;
- `cursor_out` é nulo em `partial`, `failed` e `blocked`;
- `ready_for_extraction` exige execução completa, manifest válido e hash registrado;
- uma execução terminal não volta a `running`;
- logs e erros nunca armazenam credencial, cookie de sessão ou conteúdo integral não autorizado.

## Estados

### Endpoint

```text
candidate → active ↔ paused
    │          │
    │          ├→ unavailable → active | retired
    └──────────┴────────────────→ retired
```

- `candidate`: ainda não passou por preflight e revisão de acesso;
- `active`: permitido para execução manual;
- `paused`: suspensão deliberada, reversível;
- `unavailable`: acesso ou contrato deixou de funcionar e a condição foi confirmada;
- `retired`: não deve voltar a ser usado; o histórico permanece.

### Execução

```text
running → succeeded | no_change | partial | failed | blocked
```

- `succeeded`: todas as unidades previstas foram processadas e o manifest é válido;
- `no_change`: sucesso completo sem conteúdo novo ou alterado;
- `partial`: houve saída válida, mas a cobertura prevista não terminou;
- `failed`: erro transitório ou operacional impediu resultado utilizável;
- `blocked`: política, autenticação, formato ou contrato inesperado exige decisão humana.

`succeeded` e `no_change` são os únicos estados que podem produzir `cursor_out`. `partial` nunca promove os itens incompletos diretamente; o manifest pode ajudar diagnóstico ou uma repetição idempotente.

## Retry

1. Cada página ou snapshot admite no máximo três tentativas HTTP dentro da mesma execução.
2. Timeout, desconexão, `408`, `425`, `429` e `5xx` podem ser repetidos com espera crescente e pequena variação aleatória. `Retry-After` prevalece; espera superior ao limite manual encerra a execução como `failed`.
3. `400`, `401`, `403`, `404` ou `410` no endpoint, violação de robots/termos, formato inesperado, resposta acima do limite e falha de validação não recebem retry cego; terminam como `blocked`.
4. Falha depois de páginas válidas produz `partial`, conserva o cursor de entrada e preserva hashes das páginas concluídas.
5. Uma nova tentativa iniciada pela pessoa operadora cria novo `run_key`. Retomar a mesma execução após queda do processo reutiliza o `run_key` e não cria uma segunda linha.
6. O coletor não repete escrita canônica: a v1 produz artefatos de simulação e revisão.

## Deduplicação

A classificação ocorre em camadas, nesta ordem:

1. **Endpoint:** `(source_id, endpoint_key)` identifica o alvo lógico. Mudança de URL não cria automaticamente outro endpoint.
2. **Execução:** `run_key` evita duplicar a mesma invocação retomada, mas uma repetição deliberada permanece como novo acontecimento operacional.
3. **Resposta:** SHA-256 dos bytes detecta repetição exata; hash de manifest ordenado cobre múltiplas páginas.
4. **Item:** identificador nativo da fonte é preferido; URL canônica é fallback. Query de rastreamento, fragmento, barra final e host/case devem seguir regra versionada por endpoint, sem remover parâmetros semanticamente relevantes.
5. **Versão:** fingerprint SHA-256 do conteúdo normalizado, acompanhado da versão do perfil de normalização. Mesmo item com fingerprint novo é `changed`, nunca sobrescrito.
6. **Observação candidata:** fingerprint do item/versão, localização, afirmação original e campos normalizados propostos. Mudança material ou conflito não pode ser escondido por `upsert`.

Regras específicas:

- ABVE usa `id` do post como identidade; `link` normalizado é verificação/fallback. `modified` é pista, não substitui o hash.
- ANEEL usa uma chave composta estável dos campos da reunião/item/processo. `_id` auxilia diagnóstico, mas pode mudar quando o recurso é recarregado.
- a restrição atual de `content_items` aceita versões com fingerprints diferentes, porém fingerprints nulos não impedem duplicatas e URLs distintas não são reconciliadas;
- a restrição atual de `observations` deduplica somente dentro de um `content_item` quando o fingerprint está preenchido;
- igualdade de bytes ou afirmações não funde linhagens de fontes diferentes.

## Idempotência

Para a mesma fixture, versão de coletor, configuração e janela, o coletor deve produzir exatamente as mesmas identidades, fingerprints, classes e manifest, independentemente do diretório ou da pessoa que o executa.

- o artefato separa envelope operacional de payload determinístico; `run_key`, horários de coleta e headers voláteis ficam no envelope e não entram no hash do payload;
- timestamps de execução não participam dos fingerprints de conteúdo;
- ordem de propriedades JSON, headers voláteis, scripts, cookies e marcação não semântica são excluídos apenas por perfil explícito e versionado;
- itens e campos são ordenados deterministicamente antes do hash do manifest;
- uma repetição deliberada cria novo `collection_run`, mas não cria outro candidato equivalente;
- persistência futura deverá usar constraint única e operação atômica baseada na identidade, nunca `SELECT` seguido de `INSERT` sem proteção;
- conflito entre identidade existente e conteúdo incompatível interrompe o efeito e vai para revisão;
- `partial`, `failed` e `blocked` não avançam checkpoint nem confirmam ausência.

## Conteúdo novo, alterado, removido e inacessível

| Situação | Regra | Efeito permitido |
| --- | --- | --- |
| Novo | identidade ainda não conhecida e contrato válido | candidato a novo `content_item`; nunca persistência canônica automática |
| Inalterado | mesma identidade e mesmo fingerprint de versão | registrar nova observação operacional no manifest; não duplicar item ou observação |
| Alterado | mesma identidade e fingerprint diferente | candidato a nova versão; conservar anterior; relação `corrects`, `revises` ou `replaces` só após evidência e revisão |
| Ausente | não apareceu na coleta corrente | nenhuma conclusão em janela incremental ou execução parcial |
| Candidato a remoção | `404`/`410` da URL conhecida ou ausência em dois snapshots integrais completos consecutivos | sinalizar para revisão; nunca apagar ou inativar automaticamente |
| Inacessível | timeout, permissão, bloqueio ou erro de transporte | registrar falha; não converter em remoção nem alterar endpoint após um único caso |
| Rejeitado | registro viola o contrato esperado | preservar motivo e amostra mínima segura; bloquear promoção |

Para ABVE, uma ausência na janela paginada não prova remoção. Para o snapshot integral ANEEL, a ausência pode gerar candidato somente se dois snapshots completos consecutivos concordarem; mudança de chave/estrutura invalida essa inferência.

## Limite entre coleta, extração e revisão

### Coleta determinística termina quando

- a resposta foi obtida e validada quanto a transporte, tipo, tamanho e estrutura;
- bytes, páginas e registros possuem hashes reproduzíveis;
- valores explicitamente publicados foram projetados sem mudar unidade, data, texto ou significado;
- identidade, URL e fingerprint foram calculados por regras versionadas;
- cada item recebeu uma classificação operacional;
- um manifest imutável e legível foi produzido em modo de simulação.

Decodificar JSON/HTML, copiar título/data/campo explícito e normalizar URL são coleta. Usar `modified` ou `DatGeracaoConjuntoDados` como metadado também é coleta, sem tratá-los como prova de alteração material.

### Extração começa quando

- texto ou linha passa a ser interpretado como afirmação;
- valor, unidade, período, geografia, sujeito, tipo de observação ou relação são propostos;
- relevância para mobilidade elétrica ou para o Brasil é avaliada;
- notícia, decisão, processo e ato são semanticamente relacionados.

A extração produz somente candidatos rastreáveis. “Confiança” mede a operação do extrator, não a veracidade.

### Revisão humana decide

- se a fonte/publicação correta foi identificada;
- se a transcrição e a normalização preservam o significado;
- se a evidência é suficiente, direta, compartilhada, conflitante ou incerta;
- se uma alteração corrige, revisa ou substitui conteúdo anterior;
- se o item é relevante para o Brasil;
- se candidatos são aceitos, corrigidos, rejeitados ou mantidos pendentes.

Nada atravessa automaticamente da extração para `observations`, `evidence`, eventos, instrumentos regulatórios ou métricas canônicas.

## Primeiro coletor manual/local

Deverá:

- aceitar uma configuração pública de um único endpoint e uma janela/amostra explícita;
- executar preflight, `GET`, limites de tempo/tamanho e retries definidos aqui;
- preservar metadados de resposta e referências permitidas, sem versionar segredo;
- validar formato e falhar de forma explícita diante de schema inesperado;
- calcular identidades, URLs canônicas, hashes de bytes, registros e conteúdo normalizado;
- classificar `new`, `unchanged`, `changed`, `removal_candidate`, `inaccessible` e `rejected`;
- produzir `collection_run`, manifest e candidatos em modo de simulação;
- repetir fixtures offline com saída determinística;
- mostrar contagens, falhas, duração e bytes para revisão humana;
- manter registros canônicos existentes apenas como oráculos de regressão, sem reimportá-los.

Não deverá:

- gravar no Supabase ou usar `service_role`, `postgres` ou o login privado `0001`;
- executar agenda, servidor, fila, API ou interface pública;
- escolher framework, runtime ou hospedagem definitiva;
- contornar autenticação, robots, licença, termos, captcha ou rate limit;
- renderizar navegador quando HTTP e fixtures bastarem;
- coletar o arquivo histórico inteiro da ABVE no primeiro ensaio;
- concluir que ausência significa remoção;
- sobrescrever versão anterior ou apagar conteúdo;
- decidir relevância, verdade, confirmação, comparação metodológica ou interpretação jurídica;
- criar `observations`, `evidence`, eventos, métricas ou instrumentos canônicos;
- guardar corpo integral quando a classe de retenção permitir apenas metadados ou excerto mínimo.

## Requisitos ainda não representáveis

Mesmo com os dois contratos propostos, o schema atual ainda não representa:

1. associação muitos-para-muitos entre execuções, requests/páginas e itens observados;
2. identificador nativo da publicação separado da URL;
3. versões de captura e sua relação com o item canônico antes da revisão;
4. estado, decisão, pessoa revisora e histórico de candidatos a conteúdo/observação;
5. versão do extrator, localização exata da afirmação e confiança operacional;
6. artefatos, hashes e política de retenção por resposta/página;
7. motivo e confirmação temporal de remoção/inacessibilidade;
8. checkpoint comprometido com segurança quando houver concorrência;
9. relação operacional entre uma linha ANEEL e o documento/ato oficial correspondente.

Este PR não propõe tabelas adicionais para essas lacunas. No primeiro ensaio, o manifest versionado cobre o detalhe por request e item. Antes de qualquer persistência remota ou concorrente, será necessária uma decisão própria sobre quais lacunas merecem entidades, alterações em tabelas existentes ou apenas artefatos externos.

## Perguntas em aberto

1. O endpoint WordPress da ABVE continuará aceitável após uma confirmação explícita de frequência e retenção?
2. Qual janela e quantidade de páginas ABVE oferecem uma amostra suficiente sem varrer o arquivo inteiro?
3. A chave composta ANEEL permanece estável após recargas do DataStore ou precisa incluir outro campo?
4. Dois snapshots completos são suficientes para sinalizar remoção na ANEEL?
5. Qual tamanho e duração reais do dump ANEEL no ambiente local controlado?
6. O manifest por request/item deverá permanecer arquivo versionado ou ganhar persistência própria antes da primeira escrita remota?
7. Onde candidatos e decisões de revisão serão representados sem misturá-los às tabelas canônicas?
8. Qual política de retenção é adequada para HTML ABVE e para o snapshot aberto ANEEL?
9. Como ligar, depois da revisão, uma linha da reunião ANEEL ao ato ou documento oficial sem inferência jurídica automática?

## Critérios de aceite

Esta fundação está aceita quando a revisão confirmar que:

1. a direção collection-first permaneceu fechada e runtime/backend/hospedagem não foram escolhidos;
2. a reutilização do schema atual e suas lacunas foram verificadas antes das novas entidades;
3. a fonte ABVE existente será reutilizada e a ausência de fonte ANEEL é um pré-requisito explícito;
4. cada endpoint possui URL oficial, formato, identidade, paginação/snapshot, limites e amostra verificável;
5. `source_endpoints` separa fonte, local coletável e configuração pública sem guardar segredo;
6. `collection_runs` preserva sucesso, nenhuma mudança, parcial, falha e bloqueio;
7. retry não esconde falha, não cria loop agressivo e não avança cursor após resultado incompleto;
8. repetição deliberada preserva novo histórico operacional sem duplicar candidatos equivalentes;
9. alteração cria candidato a versão e nunca sobrescreve a anterior;
10. ausência e inacessibilidade não provocam remoção automática;
11. ABVE exercita conteúdo editorial paginado e ANEEL exercita snapshot tabular regulatório;
12. a fronteira entre coleta, extração e revisão humana é testável;
13. o coletor inicial está limitado a execução manual/local, simulação e artefatos revisáveis;
14. os requisitos ainda não representáveis e as perguntas em aberto estão explícitos;
15. este PR contém somente documentação e nenhuma mudança de migration, schema, Supabase ou código.

Depois do aceite, a próxima etapa poderá preparar a migration de `source_endpoints` e `collection_runs` em PR separado. Este documento não autoriza sua criação ou aplicação.
