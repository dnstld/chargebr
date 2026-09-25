# Resultado do ensaio controlado do extrator ABVE v1

## Estado

`EXECUTADO E ACEITO — AGUARDANDO MERGE`

Este documento registra o primeiro ensaio manual controlado do extrator ABVE v1 e a decisão humana tomada separadamente dos artefatos determinísticos. O ensaio demonstrou equivalência com a carga canônica `0003`; portanto, nenhum novo registro deve ser promovido ou persistido.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Data | 25 de setembro de 2026 |
| Comando | `pnpm extract abve --run-key 529a3eeb-6921-417e-a750-b58bcb97899a --item-id 19617` |
| Commit do extrator | `f78c5179a59cf98c319e01f8aea5d4ebddf26bb4` |
| Base da `main` | `fd62cab09cd1b6d8989fe71a4fca124f180bad62` |
| Run de coleta | `529a3eeb-6921-417e-a750-b58bcb97899a` |
| Item WordPress | `19617` |
| Resultado | `produced` |
| Código de saída | `0` |
| Decisão humana | `link_existing` |
| Pessoa revisora | Denis Toledo |
| Confirmação | registrada nesta revisão em 25 de setembro de 2026 |

## Prova de versão e integridade

| Campo | Valor |
| --- | --- |
| `extraction_key` | `23cfac0b925adadcc1a8b569d1b389d730d3d284bc4ebba4e494fa6d2d2b9c4a` |
| `payload_hash` | `6e2b18ab17e2c87d2dfdef0cbf01af11fa4b40c531bf864e051886bb8cb6fd72` |
| `candidate_key` | `1f94f00df039dc210871b81f8af605ccf9d5cd073208af78de5513e111659693` |
| Hash do manifest | `02d00ebaff0d23b6fe3ef6a0bf959304d3fd83bd8147b234a34ddf19da246939` |
| Fingerprint esperado | `4a5cb1dfbeebb600ad6d2df2a7fd0c5feb3d9803bf3efe687e33f28a96618e36` |
| Fingerprint observado | `4a5cb1dfbeebb600ad6d2df2a7fd0c5feb3d9803bf3efe687e33f28a96618e36` |
| SHA-256 de `candidates.v1.json` | `2771753d4b4e64c380d5cee32cef7ee7b81cedf399459bfdea81d9edf4cf92fa` |
| SHA-256 de `review.v1.md` | `9ba8e5b5378aa006a2fb88a1417395ffb7900cd0ce32c629d6b01e29ccae9f83` |

O pacote foi validado novamente pelo contrato da aplicação depois da escrita. A recomputação interna confirmou `extraction_key`, `payload_hash` e `candidate_key`. O fingerprint do re-fetch é idêntico ao fingerprint registrado no manifest, comprovando que a versão extraída é a mesma versão coletada.

## Resultado produzido

| Verificação | Resultado |
| --- | ---: |
| Itens considerados | 1 |
| Candidatos de conteúdo | 1 |
| Candidatos de observação | 1 |
| Candidatos bloqueados | 0 |

O único candidato quantitativo contém:

| Campo | Valor |
| --- | --- |
| Sujeito | emplacamentos de veículos 100% elétricos |
| Valor normalizado | `25782` |
| Unidade | `vehicle_registration` |
| Período | 1º a 31 de julho de 2026 |
| Granularidade | mês |
| Geografia | Brasil |
| Estado da normalização | `normalized` |
| Método | `automated` |

Percentual de participação, acumulado, crescimento, projeção e outras tecnologias não foram convertidos em candidatos. O ensaio preservou exatamente o recorte estreito aprovado para o item `19617`.

## Artefatos locais

Os artefatos foram escritos atomicamente em:

```text
.chargebr/extraction-runs/23cfac0b925adadcc1a8b569d1b389d730d3d284bc4ebba4e494fa6d2d2b9c4a/candidates.v1.json
.chargebr/extraction-runs/23cfac0b925adadcc1a8b569d1b389d730d3d284bc4ebba4e494fa6d2d2b9c4a/review.v1.md
```

O diretório está em modo `0700`; os dois arquivos estão em modo `0600`. Eles permanecem privados, ignorados pelo Git e não fazem parte do PR.

O `review.v1.md` continua com `pending` por desenho: o extrator nunca escreve uma decisão em nome da pessoa revisora. A decisão humana `link_existing` está registrada somente neste relatório, vinculada aos hashes acima.

## Comparação com a carga canônica `0003`

| Critério | Candidato | Carga `0003` | Resultado |
| --- | --- | --- | --- |
| Fonte | ABVE | ABVE | igual |
| URL canônica | publicação do item `19617` | mesma publicação | igual |
| Sujeito | veículos leves BEV | veículos leves BEV | igual |
| Valor | `25782` | `25782` | igual |
| Unidade | `vehicle_registration` | `vehicle_registration` | igual |
| Período | julho de 2026 | julho de 2026 | igual |
| Geografia | Brasil | Brasil | igual |

A equivalência integral sustenta `link_existing`. Criar novo conteúdo, observação, evidência ou valor de métrica duplicaria informação já representada pela carga `0003`.

## Ausência de alterações canônicas

- a execução remota fez somente as duas leituras previstas: resolução do endpoint ABVE e localização do run solicitado;
- o corpo da publicação foi reobtido por HTTP `GET` e permaneceu fora dos logs;
- nenhum `INSERT`, `UPDATE`, `DELETE`, DDL ou chamada RPC foi executado pelo extrator;
- nenhuma migration, tabela, coluna, função, grant, policy ou credencial foi criada ou alterada;
- nenhum conteúdo, observação, evidência, acontecimento ou valor de métrica foi promovido;
- a decisão `link_existing` encerra o ensaio sem persistência adicional.

Os testes negativos do runner substituem a store por uma interface que expõe apenas `resolveAbveEndpoint`, `findRunForExtraction` e `close`. Assim, o caminho executado não possui operação de escrita disponível.

## Observação operacional

A primeira abertura da conexão foi recusada antes da leitura do run e antes da criação de artefatos porque a autoridade certificadora privada não estava carregada no processo Node. A execução bem-sucedida usou o certificado oficial `Supabase Root 2021 CA`, com verificação TLS mantida. Nenhuma verificação foi desabilitada e nenhuma credencial apareceu em argumento, log ou artefato.

## Conclusão

O ensaio controlado cumpriu o contrato aprovado: a versão coletada foi reobtida e comprovada por fingerprint; o extrator produziu exatamente um candidato quantitativo; valor, unidade, período e geografia coincidiram com a carga canônica `0003`; os artefatos permaneceram locais e privados; e nenhuma escrita canônica ocorreu.

A decisão humana é `link_existing`. O piloto está concluído para o item `19617`. Este resultado não autoriza ampliar o extrator para outros itens nem criar persistência de candidatos; essas decisões continuam separadas, conforme a ordem aprovada.
