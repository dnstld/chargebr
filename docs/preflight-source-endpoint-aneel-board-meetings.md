# Preflight do source endpoint ANEEL — Pautas e Atas

## Estado e escopo

Este preflight propõe o contrato operacional do primeiro endpoint ANEEL do ChargeBR. Ele não persiste `source_endpoints`, não cria `collection_runs`, não coleta conteúdo canônico e não inicia collector, scheduler ou runtime.

O baseline remoto de 16 de setembro de 2026 confirmou:

- `public.sources.slug = 'aneel'`: uma linha, atualmente `id = 40`;
- endpoint `aneel-board-meetings-dump`: zero linhas;
- `public.source_endpoints`: uma linha, correspondente ao endpoint ABVE já aprovado;
- `public.collection_runs`: zero linhas.

O endpoint efetivo avaliado é:

```text
https://dadosabertos.aneel.gov.br/datastore/dump/43386a8b-4781-44ec-a082-fa7fdfe33186?format=json
```

A source canônica deve ser resolvida por `public.sources.slug = 'aneel'`. O `id = 40` é somente evidência do baseline e não faz parte do registro canônico proposto.

## Contrato observado

Duas tentativas diretas de `GET` ao dump não estabeleceram conexão TLS com `dadosabertos.aneel.gov.br`: a primeira expirou em 20 segundos e a tentativa de controle, forçada a IPv4, expirou em 60 segundos. Ambas terminaram sem status HTTP, headers ou corpo. Portanto, alcance atual, content type, redirects, validators, autenticação, bytes do JSON, contagem de linhas e estrutura externa não foram confirmados no ambiente operacional.

A página oficial do resource ID permaneceu consultável por uma rota independente e registrou, em 16 de setembro de 2026:

- resource e DataStore ativos;
- DataStore contendo todos os registros do arquivo-fonte;
- arquivo-fonte CSV com 18 MiB;
- dados e metadados atualizados em 14 de setembro de 2026;
- licença Open Data Commons Open Database License (ODbL);
- treze campos textuais, incluindo `IdeReuniao`, `NumOrdem`, `NumProcesso`, `DatGeracaoConjuntoDados` e `DatReuniao`.

Essa evidência confirma o schema catalogado, mas não substitui uma amostra real do dump JSON. O contrato continua esperando JSON do dump CKAN, com schema e linhas do dataset, porém a forma externa e o path exato das linhas precisam ser reobservados antes da promoção a `active`.

## Natureza do snapshot

O resource representa um snapshot integral. O ChargeBR não pagina esse endpoint na v1 e não inventa incrementalidade ou checkpoint:

- `pagination_strategy = none`;
- `pagination_config = {}`;
- `cursor_strategy = none`;
- `cursor_config = {}`.

Uma execução futura deve preservar no manifest, quando disponíveis, SHA-256 dos bytes brutos, quantidade de bytes, status e headers HTTP, validators, URL efetiva, redirects e `DatGeracaoConjuntoDados`.

Snapshots com bytes diferentes não provam, isoladamente, mudança canônica: serialização, ordem, metadados técnicos ou republicação podem variar. Da mesma forma, uma identidade ausente em um snapshot posterior não prova remoção. Comparação canônica exige normalização versionada, e `removal_policy` permanece `none`.

## Identidade

A identidade de domínio aprovada permanece composta, nesta ordem:

1. `IdeReuniao`;
2. `NumOrdem`;
3. `NumProcesso`.

Os três campos aparecem no dicionário oficial como `text`. Sua presença e utilidade por linha ainda precisam ser confirmadas no dump real, incluindo ausência de nulos problemáticos e unicidade da composição. Não há evidência de incompatibilidade; há uma verificação ao vivo pendente.

`_id` não substitui essa identidade e não é fallback. Ele é somente campo auxiliar de diagnóstico, pois pode mudar quando o DataStore é recarregado. `DatGeracaoConjuntoDados` também é diagnóstico e sinal temporal do snapshot, não parte da identidade.

## Retenção

`default_retention_class = external_reference`.

O endpoint publica um snapshot estruturado oficial e potencialmente grande. A v1 deve preservar referência, identidade, fingerprints, hashes e manifest verificável sem assumir que o corpo integral precisa ser retido pelo ChargeBR. Essa decisão não impede fixtures mínimas autorizadas para testes determinísticos e não altera as obrigações da ODbL.

## Registro completo proposto

```yaml
source_id: resolver por public.sources.slug = 'aneel'
endpoint_key: aneel-board-meetings-dump
name: ANEEL — Pautas e Atas das Reuniões Públicas da Diretoria
endpoint_url: https://dadosabertos.aneel.gov.br/datastore/dump/43386a8b-4781-44ec-a082-fa7fdfe33186
endpoint_type: snapshot
access_method: http_get
response_format: json
status: candidate
request_config:
  timeout_ms: 120000
  max_response_bytes: 50000000
  query_params:
    format: json
  headers:
    Accept: application/json
pagination_strategy: none
pagination_config: {}
cursor_strategy: none
cursor_config: {}
identity_rule:
  version: aneel-board-meeting-row-identity-v1
  primary:
    fields: [IdeReuniao, NumOrdem, NumProcesso]
    separator: "\u001f"
  diagnostic_fields: [_id, DatGeracaoConjuntoDados]
normalization_profile: aneel-board-meeting-row-v1
removal_policy: none
suggested_interval: 7 days
default_retention_class: external_reference
terms_url: https://opendefinition.org/licenses/odc-odbl/
robots_url: null
access_reviewed_at: null
notes: >-
  Snapshot integral do DataStore das Pautas e Atas das Reuniões Públicas da
  Diretoria. A página oficial do resource confirma DataStore ativo, arquivo-fonte
  de 18 MiB, campos da identidade e licença ODbL, mas duas tentativas diretas ao
  dump expiraram antes de qualquer resposta HTTP em 2026-09-16. Manter candidate
  até revalidar GET 200, JSON, estrutura externa, linhas, identidade composta,
  bytes, redirects, validators e condições de acesso. _id e
  DatGeracaoConjuntoDados são apenas diagnósticos. Snapshot diferente não implica
  mudança canônica e ausência não implica remoção.
```

O `endpoint_url` e `query_params` acima produzem exatamente a URL efetiva selecionada. Não há fallback silencioso em `identity_rule`.

Limites operacionais propostos:

- `max_response_bytes = 50000000`: o CSV-fonte observado tem 18 MiB; 50 MB dá margem para overhead do JSON e crescimento normal, mantendo uma barreira contra expansão anormal. O limite precisa ser confirmado contra os bytes reais do dump.
- `timeout_ms = 120000`: um snapshot dessa ordem de grandeza precisa de margem superior aos timeouts de conexão de 20 e 60 segundos observados, sem permitir espera indefinida. Esse limite não transforma a falha atual em acesso aprovado.
- `suggested_interval = 7 days`: uma orientação semanal reduz downloads integrais repetidos de aproximadamente dezenas de MiB e é conservadora para pautas e atas; não cria scheduler e deve ser revista quando houver histórico de atualização.

## Evidências verificadas

- [Fundação do pipeline de coleta v1](fundacao-pipeline-coleta-v1.md): escolhe o resource, caracteriza o dump integral, aprova a identidade conceitual e fixa `removal_policy = none`.
- [Decisão: source canônica da ANEEL](decisao-source-aneel.md): define a Agência como publicador canônico e o slug `aneel`.
- [Modelagem de source_endpoints e collection_runs v1](modelagem-source-endpoints-collection-runs-v1.md): define colunas, JSONB, estados, revisão de acesso e o exemplo normativo ANEEL.
- [Resource oficial ANEEL](https://dadosabertos.aneel.gov.br/dataset/pautas-e-atas-das-reunioes-publicas-da-diretoria/resource/43386a8b-4781-44ec-a082-fa7fdfe33186): confirma schema catalogado, atualização, tamanho do CSV, DataStore ativo e ODbL.
- [Open Database License (ODbL)](https://opendefinition.org/licenses/odc-odbl/): página formal de licença referenciada pelos metadados do resource.
- baseline remoto: source ANEEL única, nenhum endpoint ANEEL, um endpoint total e zero `collection_runs`.

Não foi recuperado `robots.txt` aplicável durante este preflight; `robots_url` permanece nulo. Nenhuma página de privacidade, cookies ou institucional foi usada como `terms_url`.

## Requests usados

1. `GET` do dump selecionado, com limite de conexão de 20 segundos: conexão expirou, status HTTP `000`, zero bytes e nenhum redirect observado.
2. `GET` de controle ao mesmo dump, IPv4 e limite de conexão de 60 segundos: conexão expirou, status HTTP `000`, zero bytes e nenhum redirect observado.
3. consulta direta à página oficial do resource ID: metadados recuperados.
4. abertura do link formal ODbL referenciado pela página do resource: licença confirmada.

Não houve download bem-sucedido do snapshot, segunda URL de dataset, busca web genérica ou request à Action API.

## Riscos/limitações

- A indisponibilidade observada pode ser transitória, filtragem de rede ou condição do servidor; sem resposta HTTP, a causa não foi inferida.
- O status HTTP, content type, estrutura externa, path das linhas, contagem, bytes JSON, validators, redirects e eventual exigência de autenticação permanecem não observados.
- O dicionário confirma os três campos de identidade e seus tipos declarados, mas não confirma preenchimento ou unicidade em todas as linhas.
- O tamanho de 18 MiB é do CSV-fonte; JSON pode ser maior. O limite de 50 MB é proposta protegida por margem, não medição do dump.
- `suggested_interval = 7 days` é orientação conservadora sem histórico suficiente para inferir cadência formal.
- O resource pode ser republicado sob o mesmo UUID, alterando `_id`, ordem, serialização ou linhas históricas.
- Diferença de snapshot não implica automaticamente mudança canônica, e ausência não implica remoção.

## Critérios de aceite

O contrato documental somente poderá ser promovido de `candidate` para `active` quando uma revisão nova confirmar, na mesma configuração sensível:

1. source resolvida exclusivamente por `slug = 'aneel'`, sem hardcode do ID;
2. `GET` da URL efetiva exata respondendo sem workaround e sem autenticação não declarada;
3. status de sucesso, JSON e snapshot integral, sem paginação;
4. estrutura externa e path das linhas registrados de forma inequívoca;
5. `IdeReuniao`, `NumOrdem` e `NumProcesso` presentes, utilizáveis e compatíveis com a identidade composta aprovada;
6. `_id` mantido somente como diagnóstico, nunca como substituto ou fallback;
7. `pagination_strategy = none`, `pagination_config = {}`, `cursor_strategy = none` e `cursor_config = {}`;
8. `removal_policy = none`, snapshot diferente sem equivalência automática a mudança canônica e ausência sem equivalência a remoção;
9. bytes e duração reais dentro dos limites propostos ou limites revisados com nova justificativa;
10. headers, validators, redirects, autenticação, licença e robots tratados de forma explícita;
11. `default_retention_class = external_reference` confirmado pela revisão;
12. `access_reviewed_at` preenchido com o instante real da revisão que autorizar `active`.

Este PR satisfaz somente o aceite documental de um registro completo em estado `candidate`. Nenhuma coleta canônica foi executada.

## Decisão explícita

O endpoint permanece **`candidate`**. A URL e o schema catalogado são compatíveis com o contrato conceitual, mas a revisão de acesso não foi concluída porque nenhuma tentativa direta obteve resposta HTTP. Por isso `access_reviewed_at = null` e o registro não está pronto para persistência como `active`.

Não há autorização para substituir o endpoint, mudar a identidade aprovada, usar `_id` como fallback ou inferir remoção.

## Próximo passo

Em uma etapa separada, repetir uma única obtenção controlada quando o host estiver acessível, reutilizar o corpo para validar shape, path das linhas, contagem, tipos observados, identidade composta, `_id`, `DatGeracaoConjuntoDados`, bytes, duração e headers. Se todos os critérios forem satisfeitos, revisar limites se necessário, registrar um `access_reviewed_at` novo e somente então propor a carga canônica em PR separado.
