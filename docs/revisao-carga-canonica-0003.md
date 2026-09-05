# Revisão da carga canônica `0003`

## Estado

`AGUARDANDO REVISÃO`

Este pacote permite revisar o primeiro valor quantitativo canônico do ChargeBR antes que qualquer registro novo seja persistido no Supabase.

Arquivos executáveis:

- [carga canônica `0003`](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.sql);
- [consulta de verificação reutilizável](../data/canonical/0003_abve-bev-emplacamentos-julho-2026.verify.sql).

## O que será registrado

Um único resultado mensal: **25.782 emplacamentos de veículos leves 100% elétricos, classificados como BEV, no Brasil durante julho de 2026**.

O pacote não registra o acumulado de janeiro a julho. Também não incorpora o total de veículos eletrificados, outras tecnologias, percentuais, variações, valores de outros períodos, participação de mercado, projeções, rankings ou interpretações de tendência.

O acontecimento canônico é a publicação desse resultado pela ABVE Data em 11 de agosto de 2026. A data da publicação e o mês medido são armazenados em campos diferentes e não devem ser confundidos.

## Fonte e publicação

| Campo | Valor |
| --- | --- |
| Fonte | ABVE |
| Tipo | `industry_association` |
| Situação | `approved` |
| Fonte primária | `true` |
| Publicação | [“Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026”](https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/) |
| Data de publicação | 11/08/2026 |
| Autoria pessoal | Não identificada na página |
| Tipo de conteúdo | `dataset_release` |
| Retenção | `external_reference` |

A publicação permanece apenas como referência externa. O ChargeBR não copia o texto integral nem trata a ABVE como confirmação independente dos dados que ela própria publica.

## Observação e evidência

A observação preserva dois trechos da publicação nos quais `25.782` aparece com o mesmo sentido. A afirmação normalizada é:

> Brasil: 25.782 emplacamentos de veículos leves BEV em julho de 2026.

`observation_date` permanece `NULL` porque a observação representa um mês civil, não um dia específico. O início e o fim do período ficam estruturados no valor da métrica.

A evidência usa `lineage_status = 'established'` porque a publicação exata de origem é conhecida. Isso estabelece a proveniência; não representa auditoria da base da ABVE nem corroboração por outra instituição.

## Definição da métrica

| Campo | Valor |
| --- | --- |
| Chave | `monthly-light-bev-registrations-brazil` |
| Nome | Emplacamentos mensais de veículos leves BEV no Brasil |
| Domínio | `vehicle_market` |
| Tipo do valor | `integer` |
| Unidade canônica | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `national` |
| Situação | `approved` |

A definição delimita uma contagem mensal de emplacamentos, e não uma contagem acumulada de veículos únicos. Ela exclui PHEV, HEV, HEV Flex e MHEV. O tipo `count` descreve a natureza do valor; não autoriza somar automaticamente meses ou geografias sem verificar cobertura, duplicidade e comparabilidade.

## Valor da métrica

| Campo | Valor |
| --- | --- |
| Valor numérico | `25782` |
| Período inicial | `2026-07-01` |
| Período final | `2026-07-31` |
| Geografia | Brasil |
| Situação | `validated` |
| Observação de origem | `canonical-0003-abve-bev-emplacamentos-julho-2026` |

A transformação de `25.782` em `25782` remove somente o separador brasileiro de milhar. Não há cálculo, arredondamento, estimativa ou conversão de unidade.

`validated` indica que valor, unidade, período, geografia e proveniência foram conferidos no pacote. Não indica confirmação independente da contagem publicada.

## Acontecimento

| Campo | Valor |
| --- | --- |
| Título | ABVE Data publica 25.782 emplacamentos de veículos leves BEV em julho de 2026 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-08-11` |
| Precisão | `day` |
| Geografia | Brasil |
| Verificação | `confirmed` |
| Situação | `accepted` |

`confirmed` registra que a publicação primária sustenta aquilo que a própria ABVE Data anunciou. O nível não foi elevado a `corroborated`, pois não foi encontrada uma linhagem independente para o mesmo número.

## Organização e papéis

A Associação Brasileira do Veículo Elétrico será registrada como organização `industry_association`, com nome curto ABVE e situação `approved`.

Fonte e organização recebem o mesmo `slug`, mas ocupam papéis diferentes:

- a fonte representa o canal institucional no qual a publicação foi encontrada;
- a organização representa o sujeito que publicou o resultado por meio da ABVE Data.

O acontecimento terá um vínculo `subject` com a organização e um vínculo `supports` com a evidência.

## Registros e vínculos

A carga cria, caso ainda não existam:

- 1 fonte;
- 1 publicação;
- 1 observação;
- 1 evidência;
- 1 acontecimento;
- 1 organização;
- 1 definição de métrica;
- 1 valor de métrica;
- 1 vínculo `supports` entre acontecimento e evidência;
- 1 vínculo `subject` entre acontecimento e organização.

Cada inserção usa a restrição única aplicável e depois compara o registro encontrado com o conteúdo esperado. A execução é interrompida se um identificador ou vínculo já existir com conteúdo incompatível.

## Proteção das cargas anteriores

Antes de inserir qualquer registro, o arquivo exige que as cargas `0001` e `0002` tenham suas quantidades, estados e vínculos esperados. Ele produz uma assinatura conjunta de todos os registros e vínculos dessas cargas e calcula a mesma assinatura novamente ao final.

A carga é interrompida se a assinatura mudar. Assim, o pacote não pode atualizar silenciosamente um registro do Jeep Avenger, do BMW iX3 ou de suas fontes, organizações e vínculos.

## Consulta de verificação reutilizável

O arquivo `0003_abve-bev-emplacamentos-julho-2026.verify.sql` produz uma única linha com:

- assinatura conjunta das cargas `0001` e `0002`;
- estado agregado da carga `0003`: `absent`, `complete` ou `unexpected`;
- contagem de cada registro e vínculo esperado;
- reconstrução da cadeia entre fonte, publicação, observação, evidência e acontecimento;
- reconstrução da cadeia entre observação, definição e valor da métrica;
- confirmação do valor `25782`, do período mensal, da geografia e de `validated`;
- quantidade de identificadores de piloto presentes no banco.

A consulta é independente da transação da carga. O mesmo arquivo deverá ser executado antes e depois da persistência definitiva, sem cópias manuais divergentes.

## Validação descartável

Validação concluída no projeto remoto em 5 de setembro de 2026.

### Antes da carga

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0003` | `absent` |
| Registros e vínculos da carga `0003` | Todos com contagem 0 |
| Assinatura conjunta das cargas `0001` e `0002` | `7cc4c60de77d59f68fa621f522f776e4` |
| Identificadores de piloto | 0 |

### Dentro da transação

O arquivo da carga foi executado duas vezes, sem alteração entre as execuções e com limite local de 30 segundos por instrução. Todas as verificações internas terminaram sem exceção.

| Verificação depois da segunda execução | Resultado |
| --- | ---: |
| Estado agregado | `complete` |
| Fontes | 1 |
| Publicações | 1 |
| Observações | 1 |
| Evidências | 1 |
| Acontecimentos | 1 |
| Organizações | 1 |
| Definições de métrica | 1 |
| Valores de métrica | 1 |
| Vínculos acontecimento–evidência | 1 |
| Vínculos acontecimento–organização | 1 |
| Cadeias factuais completas | 1 |
| Evidências `established` ligadas por `supports` | 1 |
| Valores `25782` mensais e `validated` | 1 |
| Identificadores de piloto | 0 |
| Assinatura conjunta das cargas `0001` e `0002` | `7cc4c60de77d59f68fa621f522f776e4` |

### Depois do rollback

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0003` | `absent` |
| Registros e vínculos da carga `0003` | Todos com contagem 0 |
| Assinatura conjunta das cargas `0001` e `0002` | `7cc4c60de77d59f68fa621f522f776e4` |
| Identificadores de piloto | 0 |

O teste confirmou idempotência, reconstrução das duas cadeias, invariância das cargas anteriores e ausência de resíduos. Nenhuma migration foi aplicada, nenhuma estrutura foi criada e nenhum dado da carga `0003` foi persistido.

## Como fazer a revisão

Você não precisa procurar os novos registros no Supabase: eles foram revertidos de propósito. Revise três conjuntos de evidência:

1. a publicação original da ABVE, para confirmar o conteúdo factual;
2. os dois arquivos SQL, para confirmar exatamente o que será inserido e verificado;
3. os resultados da validação descartável acima, para confirmar que a execução foi segura e não deixou dados.

## Perguntas para revisão

### Factuais

1. A fonte, o título, a data, a autoria não identificada e a URL da publicação estão corretos?
2. A publicação sustenta exatamente `25.782` emplacamentos de veículos leves BEV no Brasil durante julho de 2026?
3. A observação e sua normalização deixam claro que `25.782` é o valor mensal de julho, e não o acumulado de janeiro a julho?
4. O pacote exclui outras tecnologias, totais, percentuais, comparações, projeções e interpretações sem distorcer o significado do valor selecionado?

### Metodológicas

5. A definição `monthly-light-bev-registrations-brazil` delimita corretamente objeto, unidade, mês, país e tecnologias excluídas?
6. Converter `25.782` em `25782` é uma normalização exata do separador de milhar, sem cálculo derivado?
7. A data da publicação no acontecimento e o período mensal no valor da métrica estão corretamente separados?
8. `established` para a linhagem, `confirmed` para o acontecimento e `validated` para o valor preservam corretamente os diferentes sentidos desses estados?

### Operacionais

9. A carga cria exatamente um registro de cada tipo e os dois vínculos esperados, sem reutilizar registros de piloto?
10. As proteções de idempotência e divergência são suficientes para interromper conteúdo incompatível?
11. A assinatura idêntica antes, dentro e depois da transação demonstra que as cargas `0001` e `0002` permaneceram inalteradas?
12. O estado `absent` depois do rollback demonstra que nenhum dado da carga `0003` foi persistido e que o schema permaneceu inalterado?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes do aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados são idênticos aos aceitos e executar exatamente a carga `0003` uma vez entre `BEGIN` e `COMMIT`. Em seguida, executar a mesma consulta de verificação e documentar o resultado em um PR separado.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
