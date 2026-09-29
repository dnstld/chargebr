# Revisão da carga canônica `0011`

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este pacote cadastra o endpoint oficial `aneel-board-meetings-index` exatamente
como aprovado na [decisão de substituição do endpoint inicial da
ANEEL](decisao-substituicao-endpoint-aneel.md). Nenhuma alteração foi aplicada
ao Supabase remoto.

Arquivos executáveis:

- [carga canônica `0011`](../data/canonical/0011_aneel-board-meetings-index-source-endpoint.sql);
- [consulta de verificação reutilizável](../data/canonical/0011_aneel-board-meetings-index-source-endpoint.verify.sql).

## Registro proposto

| Campo | Valor |
| --- | --- |
| Source | resolvida por `public.sources.slug = 'aneel'` |
| Chave | `aneel-board-meetings-index` |
| Nome | `ANEEL — Índice de Pautas e Atas das Reuniões Públicas` |
| URL | `https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425` |
| Tipo e formato | `document_index`, `html` |
| Situação | `active` |
| Identidade | parâmetro nativo `idNoticia` no escopo `idAreaNoticia = 425` |
| Paginação | páginas de 15 observadas, máximo de 10 páginas |
| Cursor | nenhum; a janela publicada é relida |
| Intervalo sugerido | 7 dias |
| Retenção | `external_reference` |
| Revisão de acesso | `2026-09-25T05:11:10Z` |

A configuração preserva literalmente a URL, os parâmetros, os paths, os
limites, a identidade, a normalização, os termos e o `robots.txt` confirmados
na decisão anterior. A carga não implementa o adapter nem baixa os PDFs.

## Proteções operacionais

A carga:

- exige que `sources.slug = 'aneel'` resolva exatamente uma source;
- não cria, atualiza ou remove a source ANEEL;
- insere o endpoint somente quando sua chave ainda não existe nessa source;
- recusa conteúdo preexistente divergente em qualquer campo do contrato;
- exige exatamente um registro final e compara todo o conteúdo aprovado;
- calcula antes e depois a assinatura de todos os demais `source_endpoints`;
- pode ser executada novamente sem criar duplicatas;
- não controla a transação, para que validação e persistência permaneçam
  procedimentos explícitos e separados.

A consulta reutilizável retorna `absent`, `complete` ou `unexpected`, além da
resolução da source, do registro encontrado e da assinatura dos demais
endpoints.

## Validação descartável

Em 25 de setembro de 2026, a carga foi ensaiada em PostgreSQL 17 local e
descartável, com as tabelas `sources`, `source_endpoints` e `collection_runs`
da `main`. A linha de base continha a source ANEEL, a source ABVE e o endpoint
ABVE no estado resultante da carga `0010`.

Antes do ensaio:

```text
load_0011_state: absent
aneel_sources: 1
target_endpoints: 0
other_source_endpoints: 1
other_source_endpoints_signature: cf7c97dcb992152b341a9c55f36d74a4
```

Dentro de uma única transação:

1. a carga `0011` foi executada;
2. a mesma carga foi executada novamente;
3. a consulta retornou `complete`, um target e uma linha exata;
4. a assinatura do endpoint ABVE permaneceu idêntica;
5. a transação foi encerrada com `ROLLBACK`.

Depois do rollback, a consulta retornou novamente `absent`, zero targets e a
mesma assinatura dos demais endpoints. Nenhuma linha do ensaio permaneceu.

Um teste negativo adicional alterou somente as notas do target dentro de outra
transação. A segunda execução interrompeu com
`o endpoint ANEEL já existe com conteúdo divergente`; a desconexão reverteu a
transação e a verificação seguinte continuou em `absent`.

Hashes SHA-256 dos arquivos ensaiados:

```text
13cbe759f6edabaf6d3fb651b592b0a796c85b9b70dc05392ffe816b3ebd36b1  0011_aneel-board-meetings-index-source-endpoint.sql
9739e6f5724a6b5c73f410a5bd76b3816dd782615bb4b20c47f308815b428c04  0011_aneel-board-meetings-index-source-endpoint.verify.sql
```

## Fora de escopo

- executar a carga no Supabase remoto;
- criar migration ou alterar schema;
- alterar grants, policies ou credenciais;
- implementar o adapter ANEEL;
- baixar, interpretar ou persistir PDFs;
- criar `collection_runs`, conteúdo canônico ou automação;
- alterar o endpoint ABVE ou o candidato histórico do dump CKAN.

## Perguntas para revisão

1. A carga corresponde integralmente ao contrato confirmado no PR anterior?
2. Está correto resolver a source pelo slug `aneel`, sem fixar seu ID interno?
3. As proteções contra divergência, duplicidade e alteração dos demais
   endpoints são suficientes?
4. A execução dupla, o teste negativo e o retorno a `absent` demonstram
   idempotência e ausência de persistência?
5. Está correto manter aplicação remota, grants, adapter e ensaio operacional
   em etapas posteriores e separadas?

Se todas as respostas forem `sim`, registre `CONFIRMADO`. Se alguma resposta
for `não`, indique o número e a correção necessária. Este pacote não deverá ser
incorporado antes da confirmação.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 29 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as cinco decisões e não solicitou
correções. O pacote está liberado para merge. A carga `0011` permanece ausente
do Supabase e somente poderá ser persistida depois que esta versão aceita
estiver incorporada à `main`.

## Próxima etapa depois da confirmação e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados mantêm os
hashes aceitos e executar exatamente a carga `0011` uma vez entre `BEGIN` e
`COMMIT` no Supabase. Em seguida, executar a consulta reutilizável e registrar
o resultado em PR separado. A implementação do adapter continua bloqueada até
essa persistência ser comprovada.
