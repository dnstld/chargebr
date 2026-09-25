# Decisão: substituição do endpoint inicial da ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este documento decide se o ChargeBR deve substituir o candidato `aneel-board-meetings-dump`, que continua inacessível no ambiente operacional local, por um índice oficial de Pautas e Atas também mantido pela ANEEL.

Esta etapa é somente documental. Ela não persiste `source_endpoints`, não altera o Supabase, não implementa adapter, não coleta conteúdo canônico e não cria credencial, runtime ou automação.

## Decisão proposta

1. encerrar a avaliação operacional do candidato `aneel-board-meetings-dump` sem promovê-lo a `active`;
2. selecionar `aneel-board-meetings-index` como o novo endpoint inicial da ANEEL;
3. preservar o dump anterior apenas como evidência histórica de uma alternativa oficial não acessível pelo collector local;
4. depois do aceite e merge, preparar em PR separado a carga canônica do novo endpoint;
5. implementar o adapter somente depois da carga aceita e incorporada à `main`.

A substituição muda transporte, formato, identidade e paginação. Ela não é tratada como correção silenciosa do contrato anterior.

## Resultado da revalidação do dump

Em 25 de setembro de 2026, uma nova obtenção controlada tentou acessar exatamente:

```text
https://dadosabertos.aneel.gov.br/datastore/dump/43386a8b-4781-44ec-a082-fa7fdfe33186?format=json
```

Resultado:

| Campo | Valor |
| --- | --- |
| Limite de conexão | 20 segundos |
| Código HTTP | `000` |
| Bytes recebidos | `0` |
| Redirecionamentos | `0` |
| Erro | timeout antes da conexão TLS |
| Endereço IPv4 resolvido | `200.198.220.169` |
| Arquivo de corpo | ausente |

O resultado reproduz o bloqueio observado em 16 de setembro de 2026. O catálogo oficial continua mostrando o resource como ativo e atualizado em 18 de setembro de 2026, mas isso não prova que o collector local consiga obtê-lo. Acesso por cache ou proxy de pesquisa não substitui a prova no ambiente operacional.

Não será usado VPN, proxy, browser automation, mirror, fallback de URL ou runtime remoto para contornar esse bloqueio.

## Cadeia oficial do novo endpoint

A página oficial da ANEEL no `gov.br`:

```text
https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas
```

instrui a consultar Pautas e Atas em:

```text
https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425
```

Essa cadeia foi observada diretamente no HTML obtido em 25 de setembro de 2026. A página `gov.br` respondeu `200`, sem redirect, em 2,520 segundos e com 218.838 bytes. O índice `www2.aneel.gov.br` respondeu `200`, sem redirect, em 0,695 segundo e com 14.211 bytes.

O índice não é um mirror de terceiro: ele é apontado pela página institucional atual da ANEEL e permanece sob `aneel.gov.br`.

## Contrato proposto

```yaml
source_id: resolver por public.sources.slug = 'aneel'
endpoint_key: aneel-board-meetings-index
name: ANEEL — Índice de Pautas e Atas das Reuniões Públicas
endpoint_url: https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425
endpoint_type: document_index
access_method: http_get
response_format: html
status: active
request_config:
  timeout_ms: 20000
  max_response_bytes: 1000000
  query_params:
    idAreaNoticia: '425'
  headers:
    Accept: text/html
pagination_strategy: page
pagination_config:
  page_parameter: page
  first_page: 1
  observed_page_size: 15
  max_pages: 10
  next_link_text: Próximas 15 >>
  allowed_path: /aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm
cursor_strategy: none
cursor_config: {}
identity_rule:
  version: aneel-board-meeting-index-identity-v1
  primary:
    query_parameter: idNoticia
  required_scope:
    idAreaNoticia: '425'
  detail_path: /aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm
normalization_profile: aneel-board-meeting-html-v1
removal_policy: none
suggested_interval: 7 days
default_retention_class: external_reference
terms_url: https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas
robots_url: https://www2.aneel.gov.br/robots.txt
access_reviewed_at: '2026-09-25T05:11:10Z'
```

O valor `active` é proposto porque a revisão de acesso foi concluída no ambiente operacional. Ele somente será persistido depois do aceite e do merge desta decisão.

## Formato observado

O índice respondeu com `Content-Type: text/html; charset=iso-8859-1`. Cada entrada observada contém:

- uma data em `DD/MM/YYYY`;
- um título de pauta, ata ou circuito deliberativo;
- um link absoluto sob o mesmo hostname;
- `idNoticia` numérico;
- `idAreaNoticia = 425`.

A página inicial retornou 15 entradas. A consulta de 2026 terminou depois de três páginas, com contagens `15`, `15` e `10`. Os 40 valores de `idNoticia` eram únicos.

O último item de reunião pública disponível durante a revisão foi `idNoticia = 14810`, “Pauta/Ata da 19ª Reunião Pública Ordinária da Diretoria de 2026 (Prévia)”, datado de 22 de setembro de 2026.

## Página de detalhe

A página de detalhe do item `14810` respondeu:

| Campo | Valor |
| --- | --- |
| Status | `200` |
| Content type | `text/html; charset=iso-8859-1` |
| Bytes | `130226` |
| Duração | `0,605` segundo |
| Redirects | `0` |
| SHA-256 | `a0573134a5faca403c3b1f39a225f2b07f4d5782d84e02b4f183522eed8be0a9` |

Ela preserva título, data, conteúdo da reunião e links para documentos oficiais. Foram observados 27 links PDF distintos nessa página. O futuro collector não baixará esses PDFs na primeira versão; eles serão apenas referências externas do item de detalhe.

## Paginação e janela

O índice usa `page` e publica um link explícito “Próximas 15 >>”. O adapter deverá:

1. começar na página 1;
2. seguir somente páginas no hostname e path aprovados;
3. preservar os demais parâmetros públicos do contrato;
4. parar quando não existir link para a página seguinte;
5. bloquear acima de dez páginas;
6. rejeitar repetição de página, `idNoticia` duplicado ou salto observável;
7. ordenar candidatos por data e `idNoticia` somente depois da validação.

Não existe cursor confiável observado. Cada execução v1 relê a janela publicada pelo índice e compara identidades e fingerprints com o manifest anterior. Ausência em execução posterior não implica remoção.

## Identidade e normalização

`idNoticia` é a identidade nativa primária porque:

- aparece no link de cada entrada;
- é reutilizado pela página de detalhe e pela representação PDF gerada pela ANEEL;
- foi único nas 40 entradas de 2026 observadas;
- não depende do texto, da posição ou da data.

O fingerprint deverá cobrir, depois de decodificação ISO-8859-1 e normalização versionada:

- `idNoticia`;
- URL canônica de detalhe;
- data publicada no índice;
- título normalizado;
- conteúdo editorial mínimo validado da página de detalhe;
- referências de documentos oficiais ordenadas.

Cookies de sessão e Cloudflare, espaços de apresentação, scripts, estilos e parâmetros de desafio não entram na identidade nem no fingerprint.

## Acesso, segurança e retenção

- índice, detalhe e `robots.txt` responderam sem autenticação;
- `/robots.txt` contém somente `Disallow: /cedoc/`, fora do path selecionado;
- redirects não foram observados;
- somente HTTPS e o hostname exato `www2.aneel.gov.br` serão aceitos;
- cookies recebidos não serão persistidos ou reutilizados;
- o corpo integral permanecerá transitório;
- a retenção será `external_reference`;
- PDFs não serão baixados pela v1;
- rate limit explícito não foi publicado; a execução manual semanal e sequencial é conservadora;
- falha, mudança de charset, HTML incompatível ou desafio Cloudflare bloqueiam sem fallback.

## Limites propostos

`max_response_bytes = 1000000` é superior a sete vezes a maior resposta HTML observada, de 130.226 bytes, mas mantém barreira estreita contra expansão inesperada.

`timeout_ms = 20000` é mais de sete vezes a maior duração observada entre índice e detalhe, mas interrompe espera anormal. O adapter usará retry limitado somente para falhas transitórias já previstas pelo collector.

`max_pages = 10` cobre até 150 entradas por execução, mais de três vezes as 40 entradas observadas para 2026. Aumento exige nova evidência.

## Diferenças em relação ao dump rejeitado

| Dimensão | Dump anterior | Índice proposto |
| --- | --- |
| Acesso local | timeout antes de TLS | `200` consistente |
| Formato | JSON snapshot | HTML index + detalhe |
| Identidade | três campos da linha | `idNoticia` |
| Paginação | nenhuma | páginas de 15 |
| Volume observado | não obtido | índice de 14 KB; detalhe de 130 KB |
| Corpo principal | linhas estruturadas | publicação institucional e documentos referenciados |
| Retenção | referência externa | referência externa |

A troca reduz volume e elimina o bloqueio de rede, mas exige parser HTML e validação de charset. Essa diferença é deliberada e deverá aparecer nas fixtures e nos testes.

## Ordem dos próximos PRs

Depois do aceite e merge:

1. preparar e revisar a carga canônica de `aneel-board-meetings-index`, ainda sem executar;
2. depois do merge da carga, executá-la e registrar o resultado;
3. decidir a extensão mínima da role do collector para a source e o endpoint ANEEL;
4. implementar o adapter com fixtures literais e testes negativos;
5. executar coleta controlada e repetição para provar idempotência;
6. registrar as medições operacionais ABVE × ANEEL;
7. somente então decidir runtime e iniciar o backend.

Cada alteração de dados, grants, código e resultado permanece em PR separado.

## Fora de escopo

- persistir o endpoint neste PR;
- alterar ou apagar o preflight histórico do dump;
- baixar ou interpretar PDFs;
- extrair observações ou decisões regulatórias;
- criar candidato, evento, instrumento ou relação;
- alterar a role do collector;
- escolher runtime ou hospedagem;
- ativar o login do backend;
- automatizar agenda ou execução.

## Perguntas para decisão

1. Está correto encerrar o dump CKAN como candidato inacessível sem contorno de rede?
2. Está correto selecionar o índice oficial `www2.aneel.gov.br` apontado pela página institucional da ANEEL?
3. `idNoticia` é uma identidade nativa adequada para a primeira versão?
4. Está correto limitar a v1 ao índice e às páginas de detalhe, mantendo PDFs apenas como referências externas?
5. Os limites, paginação, retenção e regras de segurança estão suficientemente estreitos?
6. Está correto manter carga, grants, implementação, ensaio e medição em PRs separados?

Se todas as respostas forem `sim`, registre `CONFIRMADO`. Se alguma resposta for `não`, indique o número e a correção necessária. Este documento não deverá ser incorporado antes da decisão.

## Resultado da decisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 25 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as seis decisões. O dump CKAN permanece como candidato histórico não promovido; `aneel-board-meetings-index` passa a ser o endpoint selecionado para a próxima carga; e persistência, grants, adapter, ensaio e medição continuam em etapas separadas.
