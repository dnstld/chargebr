# Decisão: extrator ABVE v1

## Estado e escopo

`PROPOSTA PARA REVISÃO`

Este documento define o menor contrato reproduzível para transformar um item de uma execução ABVE com `handoff_status = ready_for_extraction` em candidatos locais de conteúdo e observação prontos para revisão humana.

Esta etapa é somente documental. Ela não implementa o extrator, não cria migration, tabela, role, grant, policy, credencial ou automação e não altera o Supabase, os dados canônicos ou o collector já aprovado.

O extrator v1 será:

- manual e local;
- limitado à ABVE;
- determinístico e sem uso de IA;
- executado sobre um único item explícito;
- incapaz de promover candidatos automaticamente;
- incapaz de escrever em `content_items`, `observations`, `evidence` ou qualquer outra entidade canônica.

## Evidência de entrada disponível

O primeiro ensaio controlado do collector ABVE terminou com:

| Campo | Valor |
| --- | --- |
| `run_key` | `529a3eeb-6921-417e-a750-b58bcb97899a` |
| status | `succeeded` |
| handoff | `ready_for_extraction` |
| endpoint | `abve-news-wordpress-posts` |
| collector | `chargebr-local-collector` |
| collector version | `e6811ce7ffeeae1939b4ca6bec8460f80bfa9e85` |
| contract | `chargebr-local-collector-contract-v1` |
| itens | 100 `new` |
| requests | 2 |
| bytes | 678.736 |
| manifest hash | `02d00ebaff0d23b6fe3ef6a0bf959304d3fd83bd8147b234a34ddf19da246939` |

O manifest local foi validado e o hash de seu payload determinístico foi recalculado com igualdade exata. A execução não escreveu em `content_items`, `observations` ou `evidence`.

## Objetivo do piloto

O piloto deverá provar um único caminho completo:

```text
collection_run pronto
  → manifest e item validados
  → re-fetch exato do post
  → fingerprint idêntico ao manifest
  → candidato de conteúdo
  → candidato de observação quantitativa
  → pacote local de revisão
  → decisão humana de vínculo com registro já existente
```

O piloto não mede cobertura editorial dos 100 itens. O objetivo é provar fidelidade de versão, rastreabilidade, determinismo, idempotência e bloqueio antes de ampliar volume.

## Item piloto

O item selecionado é:

| Campo | Valor |
| --- | --- |
| WordPress `id` | `19617` |
| URL canônica | `https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano` |
| classificação no manifest | `new` |
| content fingerprint | `4a5cb1dfbeebb600ad6d2df2a7fd0c5feb3d9803bf3efe687e33f28a96618e36` |
| oráculo canônico | carga `0003` |

Ele foi escolhido porque a mesma publicação sustenta a carga canônica `0003`, que registra a afirmação sobre 25.782 emplacamentos de veículos leves BEV no Brasil em julho de 2026. Assim, o ensaio pode demonstrar que extração repetível não implica nova promoção canônica.

A carga `0003` é apenas oráculo de regressão e revisão. O extrator não copiará a carga, não consultará o SQL para montar sua saída e não reutilizará identificadores canônicos como se fossem resultado próprio.

`new` no manifest é uma classificação operacional relativa ao manifest anterior. Ela não significa que a publicação ou a afirmação sejam novas no conjunto canônico. Separar essas duas noções é uma das provas centrais do piloto.

## Invocação futura

A única forma funcional do piloto será:

```text
pnpm extract abve --run-key <uuid> --item-id <wordpress-id>
```

Para o primeiro ensaio:

```text
pnpm extract abve \
  --run-key 529a3eeb-6921-417e-a750-b58bcb97899a \
  --item-id 19617
```

`run-key` e `item-id` não são segredos. URL, hash, profile, endpoint e conteúdo não podem ser substituídos por flags. Eles vêm exclusivamente do `collection_run`, do endpoint aprovado, do manifest e do re-fetch validado.

A v1 rejeitará múltiplos itens, outra source, URL arbitrária, arquivo de entrada arbitrário, override de fingerprint e qualquer flag de persistência.

## Resolução e validação da entrada

Antes de fazer HTTP, a implementação deverá:

1. validar a forma canônica do UUID e do inteiro positivo do WordPress;
2. conectar usando a credencial local já restrita do pipeline;
3. exigir exatamente um `collection_run` da ABVE para o `run_key`;
4. exigir `status = succeeded` e `handoff_status = ready_for_extraction`;
5. exigir `response_manifest_hash` e `response_manifest_reference` não nulos;
6. resolver a referência somente dentro de `.chargebr/collection-runs`;
7. carregar e validar o manifest v1;
8. recalcular `response_manifest_hash` sobre o payload determinístico, pela função vigente do collector, e exigir igualdade com o banco;
9. exigir igualdade de `run_key`, `endpoint_key`, `collector_name`, `collector_version`, `contract_version` e `config_fingerprint` entre as evidências aplicáveis;
10. encontrar exatamente um item com o `native_identity.id` solicitado;
11. aceitar somente item classificado como `new` ou `changed`;
12. exigir URL canônica HTTPS no hostname `abve.org.br` e `content_fingerprint` SHA-256 válido.

Qualquer falha encerra antes do re-fetch e não produz candidato parcial.

O extrator poderá reutilizar a role `chargebr_collector_0001` somente para os reads que ela já possui em `sources`, `source_endpoints` e `collection_runs`. A implementação não executará `INSERT`, `UPDATE`, `DELETE`, DDL ou função remota. Nenhum grant adicional é autorizado por esta decisão.

## Re-fetch exato e prova de versão

O [WordPress documenta a leitura de um post por ID](https://developer.wordpress.org/rest-api/reference/posts/) com `GET /wp/v2/posts/<id>`. O extrator usará:

```text
GET https://abve.org.br/wp-json/wp/v2/posts/19617
  ?context=view
  &_fields=id,date,date_gmt,modified,slug,link,title,excerpt,content
```

A implementação deverá reutilizar as proteções do adapter ABVE:

- HTTPS obrigatório;
- hostname exatamente `abve.org.br`;
- ausência de userinfo;
- no máximo três redirects e nenhum redirect cross-host;
- `Accept: application/json`;
- timeout de 30 segundos;
- limite de 2.000.000 bytes;
- retry apenas para as condições transitórias já aprovadas;
- content type, JSON e schema validados;
- exatamente os nove campos do contrato vigente.

Depois do re-fetch, deverá aplicar `abve-wordpress-post-v1` e recalcular o `content_fingerprint` pela mesma função usada pelo collector. A extração só continua se:

```text
id observado = id do manifest
URL canônica observada = URL canônica do manifest
fingerprint observado = fingerprint do manifest
```

Para o piloto, o fingerprint esperado é:

```text
4a5cb1dfbeebb600ad6d2df2a7fd0c5feb3d9803bf3efe687e33f28a96618e36
```

Conteúdo ausente, inacessível, inválido ou diferente bloqueia o handoff. O extrator não usa silenciosamente uma versão mais nova, não tenta reconstruir o corpo a partir do manifest e não produz candidatos com evidência divergente.

O corpo integral existe apenas em memória durante validação e extração. Ele não entra em stdout, stderr, banco, manifest de extração ou Git.

## Fronteira da extração

O extrator pode:

- converter o HTML validado em texto com uma regra versionada;
- identificar uma afirmação explícita;
- propor tipo, valor, unidade, período, geografia e termo da fonte;
- propor uma normalização;
- registrar localização e trecho mínimo que sustentem a proposta;
- apontar ambiguidades e campos ausentes.

O extrator não pode:

- declarar a afirmação verdadeira, confirmada ou corroborada;
- decidir comparabilidade metodológica;
- inferir período, geografia, unidade ou sujeito quando o texto não os sustentar;
- interpretar projeção como valor observado;
- escolher relação `corrects`, `revises` ou `replaces`;
- criar ou atualizar registros canônicos;
- transformar confiança operacional em veracidade;
- incluir eventos, métricas ou relações fora do candidato mínimo.

## Regra específica do piloto

O primeiro caso deverá localizar no item `19617` a afirmação explícita que associa:

- tecnologia: veículos leves 100% elétricos / BEV;
- valor observado: `25.782` unidades;
- período medido: julho de 2026;
- geografia: Brasil;
- natureza: emplacamentos mensais.

A normalização proposta deverá converter somente o separador brasileiro de milhar e preservar sujeito, unidade, período e geografia. Percentual de participação, crescimento, acumulado e projeções presentes na publicação não pertencem a esse candidato.

Se os cinco elementos não puderem ser sustentados pelo texto reobtido, o resultado será `no_candidates` ou `blocked`, conforme a causa. A implementação não completa campos por conhecimento externo.

## Artefato de candidatos

O resultado determinístico será escrito atomicamente em:

```text
.chargebr/extraction-runs/<extraction-key>/candidates.v1.json
```

O arquivo terá permissão `0600` e a raiz `.chargebr/` continuará ignorada pelo Git.

### Envelope operacional

O envelope conterá:

| Campo | Regra |
| --- | --- |
| `package_version` | `chargebr-abve-extraction-candidates-v1` |
| `extraction_key` | SHA-256 determinístico definido abaixo |
| `run_key` | run que autorizou o handoff |
| `extractor_name` | `chargebr-abve-extractor` |
| `extractor_version` | Git SHA completo da implementação |
| `contract_version` | `chargebr-abve-extraction-contract-v1` |
| `result_status` | `produced` ou `no_candidates` |
| `payload_hash` | SHA-256 do canonical JSON do payload determinístico |
| `started_at` | instante UTC operacional |
| `duration_ms` | duração operacional |

Tempo e duração não entram no hash do payload determinístico.

### Payload determinístico

O payload conterá:

```text
input
  endpoint_key
  manifest_hash
  native_identity
  canonical_url
  expected_content_fingerprint
  observed_content_fingerprint
  normalization_profile

content_item_candidate
  canonical_url
  title
  published_local
  published_at_utc
  language_code
  section_name
  publication_nature
  content_fingerprint
  retention_class
  evidentiary_excerpt
  raw_capture_reference

observation_candidates[]
  candidate_key
  observation_type
  source_claim
  normalized_claim
  normalization_status
  measured_period
  geography
  extraction_method
  source_term
  locator
  limitations[]

aggregate_counts
  items_considered
  content_candidates
  observation_candidates
  candidates_blocked
```

`published_local` preserva `date`; `published_at_utc` deriva exclusivamente de `date_gmt`. Esses metadados não decidem automaticamente se uma futura promoção usará `published_on`, `published_at` ou ambos.

O mapeamento do candidato de conteúdo obedecerá a estas regras:

| Campo | Derivação |
| --- | --- |
| `canonical_url` | `link` após `canonical-url-v1` |
| `title` | `title.rendered` após a normalização textual aprovada |
| `published_local` | `date`, sem acrescentar offset |
| `published_at_utc` | `date_gmt` interpretado como UTC |
| `language_code` | `null`; a v1 não infere idioma por inspeção do texto |
| `section_name` | `null`; o ID de categoria não é convertido em rótulo editorial |
| `publication_nature` | `unknown`; autoria no domínio da source não prova natureza original |
| `content_fingerprint` | fingerprint já comprovado pelo manifest e pelo re-fetch |
| `retention_class` | `minimum_excerpt` |
| `evidentiary_excerpt` | mesmo trecho mínimo que sustenta o candidato quantitativo |
| `raw_capture_reference` | URL canônica externa, nunca corpo arquivado |

O JSON não guardará o corpo integral. Cada `source_claim`, `evidentiary_excerpt` ou trecho de localização deverá ser o mínimo necessário para sustentar um candidato e terá limite de 320 caracteres Unicode.

`extraction_method = automated` descreve como a proposta foi produzida. Ele não dispensa revisão humana.

## Identidade e determinismo

O `extraction_key` será o SHA-256 do canonical JSON de:

```text
contract_version
endpoint_key
native_identity
content_fingerprint
```

Cada `candidate_key` será o SHA-256 do canonical JSON de:

```text
contract_version
endpoint_key
native_identity
content_fingerprint
observation_type
source_claim
normalized_claim
measured_period
geography
source_term
locator
```

O payload será ordenado e serializado pelas mesmas regras de canonical JSON do collector. Repetir a mesma entrada e fixture deverá produzir bytes, `extraction_key`, `candidate_key` e payload hash idênticos.

O `run_key` permanece no envelope de proveniência, mas não entra no `candidate_key`. Duas execuções que comprovem exatamente a mesma versão do mesmo item devem convergir para o mesmo candidato, preservando a proveniência de cada run sem multiplicar a proposta semântica.

## Pacote de revisão humana

Além do JSON, a implementação produzirá:

```text
.chargebr/extraction-runs/<extraction-key>/review.v1.md
```

O documento será derivado do payload, sem lógica semântica adicional, e mostrará:

1. run, endpoint, item e hashes;
2. prova de igualdade do re-fetch;
3. metadados do candidato de conteúdo;
4. afirmação mínima e normalização proposta;
5. período, geografia, termo e localização;
6. limitações e campos ausentes;
7. comparação com o oráculo da carga `0003`;
8. decisão humana ainda pendente.

O extrator gera `review.v1.md` com a decisão `pending` e nunca registra outra decisão em nome da pessoa revisora. O resultado da revisão controlada será documentado separadamente no relatório do ensaio, com referência a `extraction_key`, `payload_hash` e aos `candidate_key` revisados. Assim, uma decisão humana não altera o artefato determinístico de candidatos.

O vocabulário de decisão será:

| Decisão | Uso |
| --- | --- |
| `pending` | ainda não revisado |
| `accept_new` | candidato aceito para uma futura etapa de persistência |
| `link_existing` | conteúdo/observação já representados canonicamente |
| `correct` | proposta precisa de correção antes de nova revisão |
| `reject` | proposta não é sustentada ou não é útil |

Para o piloto, o resultado esperado da revisão é `link_existing`, porque a carga `0003` já representa a publicação e a observação. Essa decisão é humana e não será escrita pelo extrator.

## Estados e códigos de saída

| Código | Estado | Significado |
| --- | --- | --- |
| `0` | `produced` | candidatos e pacote de revisão produzidos |
| `0` | `no_candidates` | versão validada; JSON com lista vazia e pacote de revisão produzidos |
| `4` | `blocked` | manifest, versão, acesso, formato, fingerprint ou contrato incompatível |
| `64` | — | CLI inválida |
| `69` | — | run, manifest ou item não disponível |
| `70` | — | falha interna antes de um resultado verificável |

Falha ou bloqueio não produz candidato parcial. Um artefato diagnóstico sanitizado poderá existir, sem corpo integral, credencial, connection string ou stack sensível.

## Idempotência e relação com o canônico

O extrator não consulta nem altera tabelas canônicas para decidir o resultado. Ele produz identificadores estáveis e um pacote revisável.

No ensaio, a revisão comparará o candidato com a carga `0003` e deverá demonstrar:

- mesma source ABVE;
- mesma URL canônica, desconsiderando apenas a barra final normalizada;
- mesmo sujeito BEV;
- mesmo valor 25.782;
- mesmo período julho de 2026;
- mesma geografia Brasil;
- nenhuma nova persistência necessária.

Encontrar equivalência leva a `link_existing`, não a uma segunda observação. Encontrar divergência leva a `correct`, `reject` ou a uma decisão de modelagem separada; nunca a sobrescrita silenciosa.

## Segurança e acesso

- nenhuma senha ou connection string entra em argumentos, artefatos ou logs;
- a credencial permanece em secret storage local;
- TLS e verificação de certificado continuam obrigatórios;
- a role do collector não recebe grants adicionais;
- o extrator faz somente `SELECT` remoto e HTTP `GET`;
- não há `postgres`, `service_role`, browser automation ou autenticação WordPress;
- nenhuma escrita remota é necessária;
- redirects, tamanho, timeout e retry permanecem limitados;
- o corpo editorial integral permanece transitório;
- artefatos locais são privados e ignorados pelo Git.

## Critérios de aceite da implementação futura

1. a CLI aceita somente o comando e as duas chaves públicas definidas;
2. run não sucedido ou handoff diferente de `ready_for_extraction` bloqueia antes do HTTP;
3. referência fora de `.chargebr/collection-runs` é rejeitada;
4. manifest inválido ou hash divergente bloqueia antes do HTTP;
5. item ausente, duplicado, `unchanged`, inacessível ou rejeitado não produz candidato;
6. o re-fetch usa `GET /wp/v2/posts/<id>` com os nove campos aprovados;
7. redirect cross-host, resposta grande, JSON/schema inválido ou id/URL divergente bloqueiam;
8. fingerprint diferente bloqueia e não usa a versão nova;
9. o corpo integral nunca é persistido ou logado;
10. a fixture do item `19617` produz exatamente um candidato quantitativo do escopo definido;
11. percentual, acumulado, crescimento e projeção não entram nesse candidato;
12. remover ou alterar valor, sujeito, unidade, período ou geografia na fixture impede a saída esperada, provando que o resultado não está apenas hardcoded;
13. `language_code`, `section_name` e `publication_nature` permanecem `null`, `null` e `unknown` sem evidência explícita adicional;
14. repetição da fixture produz bytes e hashes idênticos;
15. uma segunda proveniência da mesma versão conserva o mesmo `candidate_key`;
16. candidatos e review são escritos atomicamente com modo `0600`;
17. o template `review.v1.md` começa com decisão `pending` e o extrator não a altera;
18. o ensaio humano demonstra `link_existing` contra a carga `0003`;
19. `content_items`, `observations`, `evidence` e demais tabelas canônicas permanecem inalteradas;
20. testes negativos provam que a implementação não executa SQL de escrita;
21. nenhuma mudança de schema, grant, policy, migration ou Supabase acompanha a implementação;
22. o PR de implementação entrega apenas o piloto de um item e para após o relatório.

## Ordem dos próximos PRs

Depois do aceite e merge desta decisão:

1. implementar contrato, canonical JSON, hashes e fixtures offline do pacote;
2. integrar leitura do run/manifest e re-fetch com prova de fingerprint;
3. implementar a regra piloto do item `19617` e gerar o pacote de revisão;
4. executar um ensaio manual controlado e registrar o resultado;
5. decidir separadamente se o contrato pode ser ampliado para outros itens;
6. somente depois modelar persistência de candidatos e histórico de revisão, se a evidência justificar.

Cada etapa deverá permanecer pequena e revisável. Nenhuma delas autoriza promoção canônica automática.

## Fora de escopo

- extrair os 100 itens do primeiro run;
- implementar ANEEL;
- usar LLM, embeddings ou classificação probabilística;
- criar tabela de candidatos ou revisão;
- alterar `content_items`, `observations` ou `evidence`;
- criar eventos, métricas ou relações;
- selecionar ou implementar backend, fila, job, agenda ou hospedagem;
- alterar collector, manifest v1, cursor ou endpoint canônico;
- reclassificar a carga `0003`;
- publicar artefatos locais no Git.

## Divergências e decisões posteriores

O schema atual não representa candidato, estado de revisão, versão do extrator ou localização da afirmação. A v1 mantém essas informações em artefatos locais; qualquer persistência exige decisão e migration próprias.

A role do collector possui os reads necessários e também os writes restritos do lifecycle de coleta. A implementação v1 reutiliza apenas seus reads para evitar uma nova credencial antes de existir persistência de extração. Uma identidade separada deverá ser reavaliada antes de automação, execução distribuída ou ampliação de privilégios.

O primeiro caso demonstra equivalência com um registro canônico conhecido. Ele não prova generalização para outras estruturas editoriais, tecnologias, períodos ou tipos de afirmação. A ampliação depende do relatório do ensaio.
