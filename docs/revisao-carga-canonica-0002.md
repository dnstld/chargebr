# Revisão da carga canônica `0002`

## Estado

`PROPOSTA — AGUARDANDO REVISÃO`

Este pacote permite revisar o segundo acontecimento canônico antes que qualquer registro novo seja persistido no Supabase.

Arquivos executáveis:

- [carga canônica `0002`](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.sql);
- [consulta de verificação reutilizável](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.verify.sql).

## O que será registrado

Um único acontecimento: **a BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, no Autódromo de Interlagos, em São Paulo**. O evento abriu ao público em 27 de agosto de 2026.

A carga não afirma que essa foi a primeira aparição pública do modelo no Brasil. Também não inclui preço, pré-venda, chegada às concessionárias, autonomia, desempenho, arquitetura elétrica, test-drive, interesse do público, superlativos ou outros participantes do Festival.

## Fontes e publicações

| Papel | Fonte | Tipo | Publicação | Data | Autoria |
| --- | --- | --- | --- | --- | --- |
| Primária | BMW Group PressClub Brasil | `company` | [“Novo BMW iX3 fez primeira aparição ao público no Brasil e foi destaque da BMW no Festival Interlagos Carros 2026”](https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026) | 03/09/2026 | Fabiano Severo |
| Adicional | Diário do Grande ABC | `news_journalism` | [“Festival Interlagos 2026 tem enxurrada de estreias no país”](https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais) | 27/08/2026 | Vagner Aquino |

As duas publicações usarão `published_on`. O Diário exibe também 21h06, mas não informa um fuso explícito suficiente para preencher `published_at` sem inferência. Os textos integrais não serão copiados: a retenção será `external_reference`, com a URL original como referência.

## Observações e evidências

Cada publicação gera sua própria observação e sua própria evidência.

### Linhagem oficial da BMW

Trecho observado:

> O novo BMW iX3 fez sua primeira aparição pública no Brasil durante o evento [...].

Afirmação normalizada:

> A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, realizado no Autódromo de Interlagos, em São Paulo, de 27 a 30 de agosto de 2026.

A evidência aponta para a publicação oficial exata e usa `lineage_status = 'established'`. Isso significa que a origem é conhecida. Não significa que a BMW seja independente do próprio acontecimento.

### Linhagem jornalística do Diário do Grande ABC

Trecho observado:

> O Festival Interlagos 2026 abriu as portas para o público nesta quinta-feira (27) [...]. Na BMW, o principal lançamento é o iX3 [...].

Afirmação normalizada:

> Em 27 de agosto de 2026, o Festival Interlagos 2026 abriu ao público no Autódromo de Interlagos, em São Paulo, com o iX3 como principal lançamento da BMW e parte da nova geração de veículos elétricos da marca.

A evidência aponta para a reportagem exata e também usa `lineage_status = 'established'`. Sua independência foi avaliada metodologicamente pela combinação de controle editorial distinto, cobertura contemporânea, autoria identificada, fotografia própria e publicação sete dias anterior ao comunicado retrospectivo da BMW.

## Núcleo corroborado

O acontecimento canônico combina somente a interseção defensável entre as duas observações:

- a BMW apresentou o iX3 elétrico ao público brasileiro;
- isso ocorreu durante o Festival Interlagos Carros 2026;
- o evento aconteceu no Autódromo de Interlagos, em São Paulo;
- o período público começou em 27 de agosto de 2026.

As duas evidências serão ligadas ao mesmo acontecimento por `supports`. O nível `corroborated` vale apenas para esse núcleo. A expressão “primeira aparição pública”, embora conste no comunicado da BMW, foi excluída porque a reportagem não a confirma explicitamente.

## Acontecimento proposto

| Campo | Valor proposto |
| --- | --- |
| Título | BMW apresenta o iX3 ao público brasileiro no Festival Interlagos |
| Resumo | A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, no Autódromo de Interlagos, em São Paulo. O evento abriu ao público em 27 de agosto de 2026. |
| Tipo | `product_service` |
| Fase | `occurrence` |
| Data e precisão | 27/08/2026, dia exato |
| Significado da data | Início do período público do Festival, não uma apresentação limitada a um único dia |
| Geografia | São Paulo, SP, Brasil |
| Verificação | `corroborated` |
| Situação após a carga | `accepted` |

`occurrence` representa uma apresentação já realizada. A data marca o início conhecido do período público, enquanto o resumo e as notas preservam que o Festival ocorreu por mais de um dia.

## Organização

BMW será registrada como organização `other` e como sujeito central do acontecimento. A escolha representa a marca sem tratá-la como uma pessoa jurídica específica. Sua relação societária com o BMW Group permanece fora da carga.

O BMW Group PressClub Brasil é registrado separadamente como fonte empresarial. A distinção evita confundir o papel da marca no acontecimento com o controle institucional da publicação oficial.

## Registros e vínculos

A carga criará, caso ainda não existam:

- 2 fontes;
- 2 publicações;
- 2 observações;
- 2 evidências;
- 1 acontecimento;
- 1 organização;
- 2 vínculos `supports` entre o acontecimento e as evidências;
- 1 vínculo `subject` entre o acontecimento e BMW.

Os identificadores estáveis são distintos dos usados nos pilotos e na carga `0001`. Cada inserção utiliza a restrição única aplicável e é seguida por uma comparação do conteúdo esperado. A execução interrompe se encontrar:

- fonte ou organização homônima divergente;
- URL e identificador de publicação incompatíveis;
- observação ou chave de linhagem reutilizada com outra origem;
- conteúdo divergente sob o mesmo identificador;
- vínculo ausente ou diferente;
- contagem final diferente do pacote mínimo;
- menos de duas cadeias completas ou menos de duas fontes distintas;
- ausência, mudança de estado ou quebra dos vínculos da carga `0001`.

## Consulta de verificação reutilizável

O arquivo `0002_bmw-ix3-apresentacao-publica-brasil.verify.sql` produz uma única linha com:

- assinatura integral dos registros e vínculos da carga `0001`;
- estado agregado da carga `0002`: `absent`, `complete` ou `unexpected`;
- contagens de cada tipo de registro e vínculo;
- quantidade de cadeias reconstruídas;
- quantidade de fontes, observações e evidências distintas;
- quantidade de evidências `established` ligadas por `supports`.

A consulta é independente da transação da carga. O mesmo arquivo deverá ser executado antes e depois da persistência definitiva, sem manter cópias manuais divergentes.

## Validação descartável

Validação concluída no projeto remoto em 5 de setembro de 2026.

### Antes da carga

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0002` | `absent` |
| Registros e vínculos da carga `0002` | Todos com contagem 0 |
| Assinatura integral da carga `0001` | `1509ccaa3560ffa46a53b2ff287e6339` |

### Dentro da transação

O arquivo da carga foi executado duas vezes, sem alteração entre as execuções. Todas as verificações internas terminaram sem exceção.

| Verificação após a segunda execução | Resultado |
| --- | ---: |
| Estado agregado | `complete` |
| Fontes | 2 |
| Publicações | 2 |
| Observações | 2 |
| Evidências | 2 |
| Acontecimentos | 1 |
| Organizações | 1 |
| Vínculos acontecimento–evidência | 2 |
| Vínculos acontecimento–organização | 1 |
| Cadeias completas | 2 |
| Fontes distintas | 2 |
| Observações distintas | 2 |
| Evidências distintas | 2 |
| Evidências `established` com `supports` | 2 |
| Assinatura integral da carga `0001` | `1509ccaa3560ffa46a53b2ff287e6339` |

### Depois do rollback

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0002` | `absent` |
| Registros e vínculos da carga `0002` | Todos com contagem 0 |
| Assinatura integral da carga `0001` | `1509ccaa3560ffa46a53b2ff287e6339` |

O teste confirmou idempotência, reconstrução das duas linhagens, invariância integral da carga `0001` e ausência de resíduos. Nenhuma migration foi aplicada, nenhuma estrutura foi criada e nenhum dado da carga `0002` foi persistido.

## Perguntas para revisão

Nesta etapa, consulte os dois arquivos SQL, este documento e as duas publicações originais. Os novos registros não aparecem no Supabase porque a validação foi revertida.

### Factuais

1. As fontes, os títulos, as autorias, as datas e as URLs estão corretos?
2. Os dois trechos e suas afirmações normalizadas são fiéis às respectivas publicações?
3. O título, o resumo, a data e a geografia representam corretamente somente a apresentação pública durante o Festival?
4. As exclusões impedem que “primeira aparição”, especificações, superlativos ou outros assuntos recebam `corroborated`?

### Metodológicas

5. As duas observações e evidências mantêm linhagens separadas e sustentam o mesmo núcleo factual?
6. Está claro que `established` identifica a origem de cada evidência, enquanto `corroborated` depende da independência metodologicamente demonstrada entre as fontes?
7. BMW como organização `other`, o PressClub como fonte `company` e o Diário como `news_journalism` representam adequadamente seus papéis distintos?

### Operacionais

8. As proteções de idempotência e divergência são suficientes para interromper uma carga incompatível?
9. As contagens, a assinatura invariável da carga `0001` e o estado `absent` depois do rollback demonstram uma validação descartável bem-sucedida?
10. Está correto manter o schema inalterado e proibir a persistência até o aceite e o merge deste pacote?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes desse aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que o arquivo incorporado é idêntico ao aceito e executar exatamente a carga `0002` uma vez entre `BEGIN` e `COMMIT`. Em seguida, executar a mesma consulta de verificação e documentar o resultado em `docs/resultado-carga-canonica-0002.md`, em PR separado.
