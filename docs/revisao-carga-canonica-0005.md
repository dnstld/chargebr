# Revisão da carga canônica `0005`

## Estado

`PROPOSTA — EM REVISÃO`

Este pacote permite revisar a persistência do conflito entre `21.061` e `21.060` pontos públicos e semipúblicos de recarga no Brasil para fevereiro de 2026. Nenhum registro novo permanece no Supabase.

Arquivos executáveis:

- [carga canônica `0005`](../data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.sql);
- [consulta de verificação reutilizável](../data/canonical/0005_abve-tupi-pontos-recarga-fevereiro-2026.verify.sql).

## O que será registrado

Duas afirmações oficiais sobre a mesma métrica, período e geografia:

| Publicação | Total | Período medido | Estado do valor |
| --- | ---: | --- | --- |
| [ABVE, 4/3/2026](https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/) | `21061` | Fevereiro de 2026 | `provisional` |
| [ABVE, 22/6/2026](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/) | `21060` | Fevereiro de 2026 | `provisional` |

A carga não incorpora `25.429`, componentes AC ou DC, totais regionais, percentuais, crescimento, número de municípios ou publicações secundárias. Esses números foram usados durante a revisão apenas para compreender a consistência interna das páginas.

## Como interpretar o conflito

`21.061` possui suporte documental interno mais forte:

- é afirmado diretamente três vezes na publicação de março;
- coincide com `14.582 AC + 6.479 DC`;
- coincide também com a soma dos cinco totais regionais de fevereiro publicados em junho.

`21.060`, porém, também aparece diretamente no texto e na linha de total da publicação oficial de junho. Nenhuma errata da ABVE ou da Tupi foi localizada.

Por isso, o pacote registra a assimetria das evidências, mas não transforma `21.061` em vencedor. “Oficial” identifica o canal que publicou a afirmação; não garante que duas afirmações desse canal sejam coerentes entre si.

## Fonte, publicações e organizações

A carga reutiliza sem modificar a fonte `abve` e a organização `abve`, ambas criadas pela carga `0003`. Todos os campos existentes são comparados com o conteúdo aprovado antes do reuso.

As duas páginas são criadas como publicações `dataset_release`, de natureza `original` e retenção `external_reference`. O texto integral não é copiado.

A Tupi Mobilidade é criada somente como organização:

| Campo | Valor |
| --- | --- |
| Nome | Tupi Mobilidade |
| `slug` | `tupi-mobilidade` |
| Tipo | `company` |
| Situação | `approved` |
| País | `BR` |
| Página inicial | `https://tupimob.com` |
| Razão social | `NULL` |

A carga não cria uma fonte Tupi porque nenhuma publicação hospedada em canal próprio da empresa integra o recorte.

## Observações e evidências

Cada total possui observação, publicação e evidência próprias:

| Identificador da observação | Origem | Total |
| --- | --- | ---: |
| `canonical-0005-abve-21061-fevereiro-2026` | Publicação de março | `21061` |
| `canonical-0005-abve-21060-fevereiro-2026` | Publicação de junho | `21060` |

As duas evidências usam a mesma chave de linhagem:

`canonical-0005-abve-tupi-base-nacional-fevereiro-2026`

O estado `likely_shared` indica que as publicações provavelmente derivam da mesma série ABVE/Tupi. A origem documental de cada evidência continua conhecida por meio de seu próprio `origin_content_item_id`. Assim, compartilhar a linhagem não transforma as páginas em confirmações independentes.

## Definição e valores da métrica

| Campo | Valor |
| --- | --- |
| Chave | `public-semi-public-charging-points-brazil` |
| Nome | Pontos públicos e semipúblicos de recarga no Brasil |
| Domínio | `charging_infrastructure` |
| Tipo do valor | `integer` |
| Unidade | `charging_point` |
| Agregação | `latest` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `national` |
| Situação | `approved` |

Os dois valores usam o período `2026-02-01` a `2026-02-28` e a geografia `Brasil`. O intervalo representa a fotografia da base até fevereiro, não pontos instalados somente durante o mês.

Ambos permanecem `provisional`. O pacote não usa `validated`, `superseded` ou `rejected`, não aplica tolerância e não cria relação de precedência.

## Acontecimentos e papéis

Cada publicação produz um acontecimento `market_data` com fase `publication`, precisão diária, situação `accepted` e verificação `confirmed`:

| Data | Acontecimento | Total associado |
| --- | --- | ---: |
| `2026-03-04` | Publicação da atualização até fevereiro | `21061` |
| `2026-06-22` | Publicação da referência retrospectiva | `21060` |

`confirmed` significa que a página oficial sustenta aquilo que foi publicado. Não representa auditoria do total, confirmação independente ou resolução do conflito.

Cada acontecimento possui:

- um vínculo `supports` com sua própria evidência;
- um vínculo `subject` com a ABVE;
- um vínculo `subject` com a Tupi Mobilidade.

## Registros e vínculos

A carga cria, caso ainda não existam:

| Entidade ou vínculo | Criados | Reutilizados |
| --- | ---: | ---: |
| Fonte ABVE | 0 | 1 |
| Publicações | 2 | 0 |
| Observações | 2 | 0 |
| Evidências | 2 | 0 |
| Acontecimentos | 2 | 0 |
| Organização ABVE | 0 | 1 |
| Organização Tupi Mobilidade | 1 | 0 |
| Definições de métrica | 1 | 0 |
| Valores de métrica | 2 | 0 |
| Vínculos acontecimento–evidência | 2 | 0 |
| Vínculos acontecimento–organização | 4 | 0 |

Cada inserção usa a restrição única aplicável e compara o registro encontrado com o conteúdo esperado. A execução é interrompida diante de identificador, URL, conteúdo, estado ou vínculo incompatível.

## Proteção das cargas anteriores

O arquivo exige as quantidades esperadas das cargas `0001`, `0002` e `0003`. Em seguida, calcula uma assinatura conjunta de todos os registros e vínculos dessas cargas antes e depois da inserção.

A assinatura cobre fontes, publicações, observações, evidências, acontecimentos, organizações, definição e valor de métrica e os vínculos com evidências e organizações. A carga para se qualquer elemento anterior mudar.

O pacote também exige que a carga `0004` continue ausente. Isso não trata sua ausência como falha histórica: impede apenas executar esta versão se o estado do banco tiver mudado desde a revisão, situação que exigiria nova validação das proteções.

## Consulta de verificação reutilizável

A consulta produz uma única linha com:

- assinatura conjunta das cargas `0001`–`0003`;
- estado agregado da `0005`: `absent`, `complete` ou `unexpected`;
- contagens de todos os registros e vínculos;
- reconstrução das duas cadeias factuais;
- dois valores provisórios no mesmo período e geografia;
- os totais exatos `[21060, 21061]`;
- duas evidências `likely_shared` com origens próprias;
- quatro vínculos institucionais;
- quantidade de registros da carga `0004` e de identificadores de piloto.

## Validação descartável

Validação concluída no projeto remoto em 8 de setembro de 2026, usando PostgreSQL 17.6. A carga foi executada duas vezes na mesma transação com limite local de 30 segundos por instrução e encerrada com `ROLLBACK`.

### Antes da carga

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0005` | `absent` |
| Assinatura das cargas `0001`–`0003` | `7a4781c6bd808c7cc21da14ea88a1a09` |
| Registros da carga `0004` | 0 |
| Identificadores de piloto | 0 |

### Dentro da transação, depois da segunda execução

| Verificação | Resultado |
| --- | ---: |
| Estado agregado | `complete` |
| Fonte ABVE reutilizada | 1 |
| Organização ABVE reutilizada | 1 |
| Publicações | 2 |
| Observações | 2 |
| Evidências | 2 |
| Acontecimentos | 2 |
| Organização Tupi criada | 1 |
| Definições de métrica | 1 |
| Valores de métrica | 2 |
| Vínculos acontecimento–evidência | 2 |
| Vínculos acontecimento–organização | 4 |
| Cadeias completas | 2 |
| Evidências `likely_shared` | 2 |
| Valores provisórios no mesmo escopo | 2 |
| Acontecimentos `accepted` e `confirmed` | 2 |
| Valores exatos | `[21060, 21061]` |
| Vínculos `subject` esperados | 4 |
| Registros da carga `0004` | 0 |
| Identificadores de piloto | 0 |
| Assinatura das cargas `0001`–`0003` | `7a4781c6bd808c7cc21da14ea88a1a09` |

### Depois do rollback

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0005` | `absent` |
| Todos os registros e vínculos da `0005` | 0 |
| Assinatura das cargas `0001`–`0003` | `7a4781c6bd808c7cc21da14ea88a1a09` |
| Registros da carga `0004` | 0 |
| Identificadores de piloto | 0 |

O teste confirmou idempotência, preservação das duas cadeias conflitantes, invariância das cargas anteriores e ausência de resíduos. Nenhuma migration foi aplicada, nenhum schema foi alterado e nenhum dado da carga `0005` foi persistido.

## Como fazer a revisão

Você não precisa procurar os novos registros no Supabase: eles foram revertidos de propósito. Revise:

1. as duas publicações oficiais, para confirmar as afirmações e a irregularidade;
2. os dois arquivos SQL, para confirmar exatamente o que será inserido e verificado;
3. os resultados da validação descartável, para confirmar que a execução foi segura.

## Perguntas para revisão

### Factuais

1. As duas publicações, seus títulos, datas, URLs e o papel declarado da ABVE e da Tupi estão corretos?
2. A publicação de março sustenta `21.061` e a publicação de junho referencia `21.060` para a rede pública e semipública brasileira até fevereiro de 2026?
3. Os dois números representam a mesma métrica, cobertura, período e geografia?
4. Está correto registrar que `21.061` possui suporte documental interno mais forte, mas que não foi localizada correção oficial para `21.060`?
5. O pacote exclui corretamente números secundários, componentes, percentuais, regiões e o total de maio sem perder o conflito selecionado?

### Metodológicas

6. A definição da métrica delimita corretamente entidade, unidade, cobertura, mês e geografia?
7. O período de 1º a 28 de fevereiro representa adequadamente uma fotografia consolidada até o mês, e não instalações ocorridas durante o mês?
8. Está correto manter `21061` e `21060` separados e `provisional`, sem tolerância, precedência, substituição ou rejeição?
9. `likely_shared` preserva corretamente origens documentais distintas e uma provável base subjacente comum?
10. `confirmed` para os acontecimentos registra o que foi publicado sem alegar auditoria, corroboração independente ou resolução do total?

### Operacionais

11. Está correto reutilizar integralmente a fonte e a organização ABVE e criar a Tupi apenas como organização?
12. As contagens, identificadores e vínculos são suficientes para reconstruir as duas cadeias separadamente?
13. A execução dupla, a assinatura invariável e o estado `absent` depois do `ROLLBACK` demonstram idempotência e ausência de persistência?
14. Está correto interromper esta versão se a carga `0004` aparecer antes da execução definitiva, para que as proteções sejam revalidadas?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes do aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados são idênticos aos aceitos e executar exatamente a carga `0005` uma vez entre `BEGIN` e `COMMIT`. Depois, executar a mesma consulta de verificação e documentar o resultado em um PR separado.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |
