# Revisão da carga canônica `0004`

## Estado

`PROPOSTA — EM REVISÃO`

Este pacote permite revisar a inclusão de agosto de 2026 como segundo período da métrica canônica de emplacamentos mensais de veículos leves BEV no Brasil. Nenhum registro novo permanece no Supabase.

Arquivos executáveis:

- [carga canônica `0004`](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql);
- [consulta de verificação reutilizável](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.verify.sql).

## O que será registrado

Um único resultado mensal: **27.166 emplacamentos de veículos leves 100% elétricos, classificados como BEV, no Brasil durante agosto de 2026**.

O pacote não registra acumulado, frota circulante, total de eletrificados, outras tecnologias, percentuais, variações, participação de mercado, projeções, recortes subnacionais ou interpretações de tendência.

O acontecimento canônico é a publicação desse resultado pela ABVE Data em 9 de setembro de 2026. A data de publicação e o mês medido ficam em campos distintos.

## Fonte e publicação

| Campo | Valor |
| --- | --- |
| Fonte reutilizada | ABVE — `abve` |
| Tipo | `industry_association` |
| Situação | `approved` |
| Fonte primária | `true` |
| Publicação | [“Com 57 mil emplacamentos em agosto, eletrificados abrem a corrida para o milhão em setembro”](https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/) |
| Data de publicação | 9/9/2026 |
| Autoria pessoal | Não identificada na página |
| Tipo de conteúdo | `dataset_release` |
| Retenção | `external_reference` |

A fonte `abve` é reutilizada sem alteração. O arquivo compara todos os seus campos semânticos com o registro aprovado pela carga `0003` e interrompe a execução diante de divergência.

A publicação permanece como referência externa. O texto integral não é copiado e a ABVE não é tratada como confirmação independente de seus próprios dados.

## Observação e evidência

A observação preserva a afirmação de que os BEV alcançaram `27.166` emplacamentos no mês. A normalização é:

> Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026.

`observation_date` permanece `NULL` porque o dado cobre um mês civil. O período é estruturado no valor da métrica.

A evidência usa `lineage_status = 'established'` porque a publicação exata de origem é conhecida. Esse estado demonstra proveniência, não auditoria da base ou corroboração por outra instituição.

## Definição reutilizada

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

A carga não cria nem atualiza a definição. Ela recupera o registro existente, compara descrição, notas metodológicas e todos os campos controlados e interrompe se houver diferença.

A classificação é compatível com julho: BEV representa veículos leves 100% elétricos e a métrica exclui PHEV, HEV, HEV Flex e MHEV.

## Valor de agosto

| Campo | Valor |
| --- | --- |
| Valor numérico | `27166` |
| Período inicial | `2026-08-01` |
| Período final | `2026-08-31` |
| Geografia | Brasil |
| Situação | `validated` |
| Observação de origem | `canonical-0004-abve-bev-emplacamentos-agosto-2026` |

A transformação de `27.166` em `27166` remove somente o separador brasileiro de milhar. Não existe cálculo, arredondamento, estimativa ou conversão de unidade.

O valor representa apenas agosto. Ele não incorpora os meses anteriores nem o acumulado de janeiro a agosto.

## Continuidade com julho

A definição passa a possuir, dentro da validação, dois valores:

| Período | Valor | Observação | Situação |
| --- | ---: | --- | --- |
| Julho de 2026 | `25782` | `canonical-0003-abve-bev-emplacamentos-julho-2026` | `validated` |
| Agosto de 2026 | `27166` | `canonical-0004-abve-bev-emplacamentos-agosto-2026` | `validated` |

A carga exige exatamente duas observações distintas e dois períodos distintos. Ela não cria relação direta entre os valores e não persiste a variação de 5,4% publicada pela ABVE.

A referência a `25.782` na publicação de agosto serve somente para confirmar que a fonte não revisou o valor de julho.

## Acontecimento

| Campo | Valor |
| --- | --- |
| Título | ABVE Data publica 27.166 emplacamentos de veículos leves BEV em agosto de 2026 |
| Tipo | `market_data` |
| Fase | `publication` |
| Data | `2026-09-09` |
| Precisão | `day` |
| Geografia | Brasil |
| Verificação | `confirmed` |
| Situação | `accepted` |

`confirmed` registra que a publicação primária sustenta aquilo que a ABVE Data anunciou. Não significa corroboração independente do número.

## Organização e vínculos

A organização `abve`, criada pela carga `0003`, é reutilizada sem alteração e comparada integralmente antes do uso.

O novo acontecimento terá:

- um vínculo `supports` com a evidência de agosto;
- um vínculo `subject` com a organização ABVE.

Fonte e organização compartilham o `slug`, mas representam papéis diferentes: canal de publicação e sujeito institucional.

## Registros e vínculos

| Entidade ou vínculo | Criados | Reutilizados |
| --- | ---: | ---: |
| Fonte ABVE | 0 | 1 |
| Organização ABVE | 0 | 1 |
| Definição de métrica | 0 | 1 |
| Publicação | 1 | 0 |
| Observação | 1 | 0 |
| Evidência | 1 | 0 |
| Acontecimento | 1 | 0 |
| Valor de métrica | 1 | 0 |
| Vínculo acontecimento–evidência | 1 | 0 |
| Vínculo acontecimento–organização | 1 | 0 |

Cada inserção usa a restrição única aplicável com `ON CONFLICT DO NOTHING` e depois compara o registro encontrado com o conteúdo esperado. Nenhum conflito provoca atualização. Conteúdo incompatível interrompe a execução.

## Proteção das cargas anteriores

Antes da inserção, a carga exige o estado exato preparado sobre as cargas persistidas `0001`, `0002`, `0003`, `0005` e `0006`, mantendo `0004` ausente ou integralmente idêntica numa segunda execução.

Uma assinatura cobre:

- fontes;
- publicações;
- observações;
- evidências;
- acontecimentos;
- definições e valores de métricas;
- organizações;
- vínculos com evidências e organizações;
- relações entre versões de publicações;
- resoluções e transições históricas de valores.

Os registros próprios da `0004` são excluídos da assinatura. A mesma assinatura é calculada antes e depois da carga; qualquer mudança nos registros anteriores provoca interrupção.

O pacote também exige:

- ausência de instrumentos regulatórios canônicos, como no estado revisado;
- zero identificadores descartáveis de piloto;
- preservação exata do valor `25782` de julho;
- ausência de outro valor de agosto para a mesma métrica e geografia.

## Consulta de verificação reutilizável

O arquivo `0004_abve-bev-emplacamentos-agosto-2026.verify.sql` produz uma única linha com:

- assinatura de todos os registros anteriores;
- estado agregado da carga: `absent`, `complete` ou `unexpected`;
- contagens dos registros criados e reutilizados;
- reconstrução integral da cadeia de agosto;
- valores e períodos da série BEV;
- confirmação de duas observações distintas;
- quantidade de estruturas históricas indevidas da `0004`;
- quantidade de identificadores de piloto.

A consulta é independente da transação. O mesmo arquivo deverá ser usado antes e depois da persistência definitiva.

## Validação descartável

Validação concluída no projeto remoto em 10 de setembro de 2026. A carga foi executada duas vezes na mesma transação, seguida pela consulta reutilizável, e a transação terminou com `ROLLBACK`.

### Antes da carga

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0004` | `absent` |
| Assinatura dos registros anteriores | `a5e325a3f0eb2bde724949b4f4bba322` |
| Fonte ABVE reutilizável | 1 |
| Organização ABVE reutilizável | 1 |
| Definição reutilizável | 1 |
| Valores existentes na série | 1 |
| Valor e período existentes | `[25782]`, `[2026-07-01]` |
| Registros próprios da carga | Todos com contagem 0 |
| Estruturas históricas indevidas da `0004` | 0 |
| Identificadores de piloto | 0 |

### Dentro da transação, depois da segunda execução

| Verificação | Resultado |
| --- | ---: |
| Estado agregado | `complete` |
| Fonte ABVE reutilizada | 1 |
| Organização ABVE reutilizada | 1 |
| Definição reutilizada | 1 |
| Publicações criadas | 1 |
| Observações criadas | 1 |
| Evidências criadas | 1 |
| Acontecimentos criados | 1 |
| Valores criados | 1 |
| Vínculos acontecimento–evidência | 1 |
| Vínculos acontecimento–organização | 1 |
| Cadeias completas e exatas | 1 |
| Valores da série | `[25782, 27166]` |
| Inícios dos períodos | `[2026-07-01, 2026-08-01]` |
| Observações distintas | 2 |
| Estruturas históricas indevidas da `0004` | 0 |
| Identificadores de piloto | 0 |
| Assinatura dos registros anteriores | `a5e325a3f0eb2bde724949b4f4bba322` |

### Depois do rollback

| Verificação | Resultado |
| --- | --- |
| Estado da carga `0004` | `absent` |
| Assinatura dos registros anteriores | `a5e325a3f0eb2bde724949b4f4bba322` |
| Valores existentes na série | 1 |
| Valor e período existentes | `[25782]`, `[2026-07-01]` |
| Registros próprios da carga | Todos com contagem 0 |
| Estruturas históricas indevidas da `0004` | 0 |
| Identificadores de piloto | 0 |

O teste confirmou idempotência, reutilização sem duplicação, reconstrução da nova cadeia, continuidade por dois períodos e invariância das cargas anteriores. Nenhuma migration foi aplicada, nenhum schema foi alterado e nenhum dado da carga `0004` foi persistido.

Como [comportamento normal do PostgreSQL documentado pelo Supabase](https://supabase.com/docs/guides/troubleshooting/why-are-there-gaps-in-my-postgres-id-sequence-Frifus), os contadores internos usados para gerar IDs podem avançar mesmo quando uma transação é revertida ou uma inserção termina em `ON CONFLICT DO NOTHING`. Portanto, a validação pode deixar lacunas na numeração dos IDs, mas não deixa linhas da carga `0004`. O ChargeBR não usa consecutividade de IDs como requisito de integridade; usa restrições, identificadores estáveis e as verificações documentadas.

## Como fazer a revisão

Você não encontrará os novos registros no Supabase porque o teste terminou com `ROLLBACK`. Revise:

1. a publicação original da ABVE, para confirmar o valor e seu significado;
2. os dois arquivos SQL, para confirmar exatamente o que será inserido e verificado;
3. os resultados da validação descartável acima, para confirmar idempotência e ausência de persistência.

## Perguntas para revisão

### Factuais

1. A fonte, o título, a data, a autoria não identificada e a URL estão corretos?
2. A publicação sustenta exatamente `27.166` emplacamentos de veículos leves BEV no Brasil durante agosto de 2026?
3. A observação deixa claro que o valor representa somente agosto, e não acumulado, frota ou total de eletrificados?
4. A transformação de `27.166` em `27166` preserva exatamente o número publicado?

### Metodológicas

5. Está correto reutilizar sem alteração `monthly-light-bev-registrations-brazil`, a fonte ABVE e a organização ABVE?
6. A data de publicação no acontecimento e o período de agosto no valor estão separados corretamente?
7. `established`, `confirmed` e `validated` preservam corretamente proveniência, suporte documental e revisão do valor sem alegar corroboração independente?
8. Está correto excluir percentuais, acumulados, outras tecnologias, projeções e interpretações sem perder o núcleo factual?
9. Está correto manter julho e agosto como valores distintos ligados à mesma definição, sem relação direta ou cálculo de crescimento?

### Operacionais

10. A carga cria somente os sete registros e vínculos previstos e reutiliza exatamente três registros existentes?
11. As comparações integrais e a ausência de atualização em conflitos protegem contra conteúdo incompatível?
12. A execução dupla com estado `complete` demonstra idempotência do pacote?
13. A assinatura idêntica demonstra que as cargas anteriores e o histórico de resolução permaneceram inalterados?
14. O estado `absent` depois do `ROLLBACK` demonstra que nenhuma linha da carga `0004` foi persistida, mesmo que os contadores internos de IDs possam ter avançado normalmente?
15. Depois do aceite e do merge, o mesmo arquivo pode ser executado uma vez entre `BEGIN` e `COMMIT`, seguido pela consulta de verificação?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes do aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados são idênticos aos aceitos e executar exatamente a carga `0004` uma vez entre `BEGIN` e `COMMIT`. Em seguida, executar a mesma consulta de verificação e documentar o resultado em um PR separado.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 10 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o pacote e não solicitou correções. O PR está liberado para merge. A carga `0004` permanece ausente do Supabase e só poderá ser persistida depois que esta versão aceita estiver incorporada à `main`.
