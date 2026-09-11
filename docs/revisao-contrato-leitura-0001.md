# Revisão: contrato de leitura metodológica `0001`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento apresenta o primeiro contrato de leitura metodológica do ChargeBR. O pacote não cria view, API ou interface, não altera o schema e não modifica dados ou permissões no Supabase.

## Objetivo da revisão

Confirmar que uma aplicação futura consegue consultar o caso ABVE de janeiro de 2025 sem escolher o número errado, apagar a metodologia anterior ou apresentar um resultado incompleto como se fosse definitivo.

O contrato responde a três perguntas diferentes:

1. qual é o resultado principal segundo a metodologia vigente;
2. quais valores a ABVE publicou para o mesmo recorte;
3. o que mudou entre as metodologias.

## Arquivos do pacote

| Arquivo | Finalidade |
| --- | --- |
| `queries/0001_abve-eletrificados-janeiro-2025.read.sql` | Produzir as três projeções do contrato |
| `queries/0001_abve-eletrificados-janeiro-2025.verify.sql` | Verificar de forma independente os fatos canônicos exigidos |
| `queries/README.md` | Explicar o papel do novo diretório |

Foi corrigido também um erro material de documentação em `docs/revisao-carga-canonica-0007.md`: a granularidade geográfica persistida e permitida pelo schema é `national`, não `country`. A correção não altera o banco nem o significado do caso.

As assinaturas SHA-256 dos arquivos executados são:

| Arquivo | SHA-256 |
| --- | --- |
| Consulta de leitura | `185ad7910765378650d0c2ca12d81e16ee6220c915fdd95973b0a867772a8bdd` |
| Consulta de verificação | `9501a0301c75264435fbd9824322d96d10ddb9b9ac5c155df38414650040c22a` |

## Escopo fixo

| Dimensão | Valor |
| --- | --- |
| Versão do contrato | `chargebr-methodology-reading-v1` |
| Métrica | `monthly-light-electrified-vehicle-registrations-brazil-abve-classification` |
| Período | 1º a 31 de janeiro de 2025 |
| Geografia | Brasil |
| Granularidade geográfica | `national` |
| Unidade | `vehicle_registration` |
| Fonte | ABVE |

O SQL usa chaves estáveis e campos de escopo. Identificadores internos do banco não determinam a identidade dos registros.

## Resultado normal

A consulta foi executada no projeto Supabase do ChargeBR em 11 de setembro de 2026. Ela retornou exatamente três linhas, nesta ordem:

| Ordem | Projeção | Situação | Conteúdo principal |
| ---: | --- | --- | --- |
| 1 | `current_methodology` | `complete` | `12556`, `primary`, metodologia vigente sem MHEV no total |
| 2 | `as_published` | `complete` | `12556` principal, `16502` contrafactual e `3946` MHEV como contexto |
| 3 | `methodology_comparison` | `complete` | método anterior `historical`, método vigente `current` e relação `supersedes` |

Todas as linhas retornaram:

```text
contract_version
projection_type
projection_order
projection_status
payload
blockers
```

Nos três casos, `blockers` foi `[]`.

A consulta normal foi executada novamente sem alteração de estado e produziu conteúdo exatamente idêntico, confirmando a ordenação determinística do contrato.

## Como o resultado vigente é escolhido

A consulta não escolhe o maior valor, o registro mais recente ou o maior identificador. Ela:

1. encontra a definição pela chave da métrica;
2. reúne as versões ligadas à definição;
3. considera `applies_from` e as relações `supersedes` efetivas no início do período;
4. elimina a metodologia que já foi substituída para aquele período;
5. exige exatamente uma metodologia vigente;
6. exige exatamente um valor `primary`, `validated` e `source_published` ligado a essa metodologia.

Para janeiro de 2025, a versão anterior é substituída a partir de 1º de janeiro. A versão vigente é, portanto, a classificação sem MHEV no total principal, e o valor correspondente é `12556`.

## O que permanece visível

A projeção `as_published` não reduz a publicação ao número principal. Ela mantém:

- `12556` como resultado `primary` pela metodologia vigente;
- `16502` como comparação `counterfactual` pelo critério anterior;
- `3946` MHEV como observação de contexto, explicitamente marcada com `is_metric_value: false`.

Assim, o consumidor não precisa inventar a relação aritmética nem tratar `16502` como erro. Os dois totais são números publicados pela ABVE; o ChargeBR apenas preserva seus papéis e métodos.

## Proveniência entregue

Cada valor inclui a observação, a evidência, a fonte, a publicação e o acontecimento aceito que sustenta a leitura. A origem ABVE é resolvida tanto quando aparece diretamente na evidência quanto quando aparece por meio do item de conteúdo.

O contrato exige, para apresentar o resultado:

- linhagem `established`;
- fonte ABVE `approved` e marcada como primária;
- publicação identificada por título, data editorial, URL e chave estável;
- acontecimento `accepted` com verificação `confirmed` ou `corroborated`;
- relação `supports` para a evidência direta de cada valor.

Evidências contextuais podem usar a relação `contextualizes`, mas continuam obrigadas a possuir publicação, fonte e acontecimento aceito.

## Verificação independente

O arquivo de verificação retornou uma linha com `verification_status: complete`. Todos os controles abaixo foram `true`:

```text
metric_ok
values_ok
roles_ok
value_assignments_ok
methods_ok
current_method_ok
components_ok
mhev_treatment_ok
relation_ok
no_cycle_ok
methodology_evidence_ok
provenance_ok
context_ok
context_not_metric_value_ok
```

A verificação confirmou, entre outros pontos:

- valores exatos `[12556, 16502]`;
- papéis `primary` e `counterfactual`;
- duas metodologias e dez componentes;
- MHEV `included` no método anterior e `reported_separately` no vigente;
- uma relação `supersedes` efetiva em 1º de janeiro de 2025;
- seis vínculos de evidência metodológica;
- cinco evidências distintas com proveniência completa;
- ausência de ciclo;
- `3946` preservado como observação e ausente de `metric_values`.

## Ensaios de bloqueio

Os ensaios foram feitos por variações descartáveis da própria consulta, sem escrita no banco.

### Métrica ausente

A chave da métrica foi substituída por uma chave inexistente apenas durante o ensaio. O resultado foi exatamente uma linha:

```text
projection_type: control
projection_order: 0
projection_status: blocked
payload: null
blockers:
  - CURRENT_METHODOLOGY_NOT_UNIQUE
  - METRIC_NOT_FOUND
  - PRIMARY_VALUE_NOT_UNIQUE
  - UNEXPECTED_CARDINALITY
```

### Metodologia vigente ambígua

Uma terceira metodologia sintética foi acrescentada somente em uma CTE de teste, sem persistência. O resultado foi exatamente uma linha `blocked`, com `payload: null` e os códigos:

```text
COMPONENTS_INCOMPLETE
CURRENT_METHODOLOGY_NOT_UNIQUE
PROVENANCE_INCOMPLETE
UNEXPECTED_CARDINALITY
```

### Proveniência incompleta

A condição de proveniência foi forçada a falhar somente na consulta de teste. O resultado foi exatamente uma linha `blocked`, com `payload: null` e:

```text
PROVENANCE_INCOMPLETE
```

Nos três ensaios, nenhuma projeção parcial foi retornada e nenhum número principal apareceu no `payload`.

## Plano de execução

Foi executado `EXPLAIN (ANALYZE, BUFFERS)` sobre a consulta normal.

| Medida | Resultado |
| --- | ---: |
| Linhas finais | 3 |
| Tempo de planejamento | 15,269 ms |
| Tempo total de execução | 7,368 ms |
| Blocos compartilhados lidos do disco | 0 |
| Blocos temporários lidos ou escritos | 0 |
| Blocos compartilhados atingidos no nó final | 85 |

O plano usou o índice único de `metric_definitions.metric_key`, o índice de versões por definição e data e a chave da relação metodológica. As tabelas pequenas também tiveram leituras sequenciais, comportamento esperado para o volume atual. Não há evidência que justifique novo índice, materialized view ou armazenamento duplicado.

## Mensagens reconstruídas somente pela saída

### Metodologia vigente

> A ABVE registrou 12.556 emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025 segundo a classificação vigente desde aquele mês. O total inclui BEV, PHEV, HEV e HEV Flex; MHEV são publicados separadamente.

### Como publicado

> A ABVE publicou 12.556 como resultado principal pela classificação vigente e informou que o mesmo mês teria 16.502 pelo critério anterior, que incluía MHEV.

### Comparação

> A diferença decorre do tratamento metodológico de MHEV. A publicação informa 3.946 MHEV separadamente. O ChargeBR não recalculou os totais nem classificou o valor anterior como erro.

Cada afirmação acima pode ser reconstruída pelos campos do `payload`, sem recorrer a conhecimento factual externo.

## Segurança e ausência de mudanças no banco

- os dois arquivos SQL contêm somente consultas de leitura;
- nenhuma view, tabela, função, coluna, índice, migration, policy ou permissão foi criada ou alterada;
- nenhum dado foi inserido, atualizado ou removido;
- nenhuma permissão foi concedida a `anon` ou `authenticated`;
- nenhuma chave privilegiada foi exposta a cliente público;
- os ensaios de bloqueio não persistiram registros sintéticos;
- a consulta final agrega valores, componentes, evidências e acontecimentos no PostgreSQL, sem exigir uma consulta separada para cada elemento.

A auditoria final confirmou `17` migrations, duas metodologias, dez componentes, seis vínculos de evidência metodológica, uma relação, duas atribuições e os valores `[12556, 16502]`. A busca por metodologias sintéticas de teste retornou zero.

## Limites desta etapa

O contrato é intencionalmente específico ao caso `0007`. Ele não cria uma API genérica, não recebe parâmetros e não promete comportamento para métricas que ainda não possuam história metodológica revisada. A futura exposição pública exigirá uma decisão própria sobre view, RLS, permissões e interface.

## Perguntas para revisão

1. O escopo fixo representa corretamente a métrica ABVE de janeiro de 2025?
2. Está correto derivar a metodologia vigente pela relação `supersedes` e sua data efetiva, em vez de recência ou identificador?
3. Está correto apresentar `12556` como único resultado principal sob a metodologia vigente?
4. A projeção “como publicado” preserva corretamente `16502` como contrafactual e `3946` como contexto não métrico?
5. A comparação explica corretamente que MHEV muda de `included` para `reported_separately`?
6. Fonte, publicação, evidência e nível de verificação estão suficientemente identificados na saída?
7. Os ensaios demonstram que falhas críticas retornam uma única linha `blocked`, sem número principal parcial?
8. A verificação independente cobre os fatos canônicos necessários para confiar na leitura?
9. O plano de execução é aceitável para o volume e o escopo atuais sem criar índice ou materialização?
10. A correção de `country` para `national` corresponde ao valor real do schema e do registro?
11. Está claro que os números foram publicados pela ABVE e não calculados pelo ChargeBR?
12. Está documentado que o pacote não alterou dados, schema, políticas ou permissões?
13. O contrato está pronto para ser aceito como primeira leitura metodológica reproduzível do ChargeBR?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o contrato de leitura metodológica `0001` e não solicitou correções. O PR está liberado para merge.
