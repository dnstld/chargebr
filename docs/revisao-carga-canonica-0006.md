# Revisão da carga canônica `0006`

## Estado

`PROPOSTA PARA REVISÃO`

Este pacote permite revisar a correção material dos emplacamentos de veículos leves eletrificados no Estado de São Paulo em 2024. Nenhum registro novo permanece no Supabase.

Arquivos executáveis:

- [carga canônica `0006`](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.sql);
- [consulta de verificação reutilizável](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.verify.sql).

## Resultado representado

A [publicação oficial da ABVE](https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/) exibe data editorial de 6 de janeiro de 2025. Ao final da página, a associação informa que corrigiu o conteúdo em 7 de janeiro de 2025, às 18h12, porque os números de São Paulo nos rankings estadual e municipal estavam trocados.

O recorte permanece exclusivamente estadual:

| Versão | Valor atribuído ao Estado de São Paulo | Situação inicial | Situação depois da resolução |
| --- | ---: | --- | --- |
| Primeira edição reconstruída | `24435` | `provisional` | `rejected` |
| Edição corrigida | `56819` | `provisional` | `validated` |

O valor `24435` não é declarado falso em qualquer contexto. Ele é rejeitado apenas quando associado ao **Estado de São Paulo** no período de 2024; a própria correção o mantém como valor da **cidade de São Paulo**, recorte não persistido nesta carga.

## Publicação e versões

A carga cria duas linhas de `content_items` com a mesma fonte, URL, título e data editorial, mas identificadores de conteúdo diferentes:

| Versão | Data editorial | Retenção | Significado |
| --- | --- | --- | --- |
| Primeira edição | 6/1/2025 | `metadata_only` | Versão histórica reconstruída; não há captura primária integral do corpo incorreto |
| Edição corrigida | 6/1/2025 | `external_reference` | Página oficial atualmente acessível |

As duas linhas usam `published_on = 2025-01-06` porque esse campo registra a data editorial exibida pela página. O momento posterior da alteração não é transformado em uma nova data de publicação: ele fica em uma relação `corrects` datada de `2025-01-07` e em um acontecimento próprio da correção.

A versão inicial não recebe URL de captura nem trecho retido. Assim, o registro não finge que o ChargeBR possui uma cópia integral do conteúdo anterior. A limitação aparece expressamente na observação, na evidência e no acontecimento reconstruído.

## Métrica e escopo

A carga cria uma definição específica:

| Campo | Valor |
| --- | --- |
| Chave | `annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification` |
| Domínio | `vehicle_market` |
| Tipo | `integer` |
| Unidade | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `year` |
| Granularidade geográfica | `state` |
| Período dos valores | `2024-01-01` a `2024-12-31` |
| Geografia | Estado de São Paulo, Brasil |

A definição preserva a classificação usada pela ABVE naquele balanço: BEV, PHEV, HEV, HEV Flex e MHEV. Ela não deve ser reutilizada automaticamente depois da separação metodológica anunciada pela associação para os números de janeiro de 2025.

Os valores representam emplacamentos ocorridos entre janeiro e dezembro de 2024. Eles não representam frota acumulada, vendas contratadas nem somente o mês de dezembro.

## Proveniência

As duas observações possuem evidências separadas, mas a origem documental acessível de ambas é a versão corrigida:

- para `24435`, a nota oficial permite reconstruir a atribuição inicial ao declarar que os números estavam trocados e informar o par correto;
- para `56819`, o corpo atual e a nota oficial sustentam diretamente a atribuição estadual corrigida.

O estado `established` afirma que a origem documental utilizada é conhecida. Ele não significa que houve auditoria independente da base de emplacamentos. A publicação e a correção pertencem à própria ABVE.

Não são incluídas reproduções secundárias, outra fonte ou uma alegação de corroboração independente.

## Acontecimentos e vínculos

São criados dois acontecimentos:

1. publicação da primeira edição em 6 de janeiro de 2025, reconstruída pela nota oficial;
2. correção da atribuição geográfica em 7 de janeiro de 2025.

A correção usa precisão diária porque o schema de acontecimentos não representa uma hora sem fuso conhecido. A informação `18h12` é preservada no resumo do acontecimento e na evidência, sem inventar um fuso horário.

A ABVE é ligada como sujeito dos dois acontecimentos. A publicação inicial recebe sua evidência como `supports`; a correção recebe a evidência de `56819` como `supports` e a reconstrução de `24435` como `contextualizes`.

## Resolução e histórico

A resolução possui:

| Campo | Valor |
| --- | --- |
| Chave | `canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024` |
| Tipo | `material_correction` |
| Acontecimento de resolução | Correção da ABVE em 7/1/2025 |
| Pessoa revisora | Denis Toledo |
| Data prevista da revisão | 8/9/2026 |
| Referência da decisão | `docs/revisao-carga-canonica-0006.md` |

A correção publicada pela fonte e o aceite do ChargeBR permanecem momentos distintos. O acontecimento registra o que a ABVE fez em 2025; os campos de revisão registram quem aceitou a representação canônica em 2026.

As duas transições históricas são:

| Valor estadual | Ordem | De | Para | Substituto |
| ---: | ---: | --- | --- | ---: |
| `24435` | `1` | `provisional` | `rejected` | `56819` |
| `56819` | `1` | `provisional` | `validated` | Nenhum |

Na mesma transação, a carga insere a resolução e as transições e atualiza `metric_values.value_status` para coincidir com o destino mais recente. As tabelas históricas recebem somente novas linhas; nenhuma resolução ou transição anterior é editada.

## Registros incluídos

| Estrutura | Quantidade | Tratamento |
| --- | ---: | --- |
| Fonte ABVE | `1` | Reutilizada e comparada integralmente |
| Organização ABVE | `1` | Reutilizada e comparada integralmente |
| Definição de métrica | `1` | Nova |
| Versões de conteúdo | `2` | Novas |
| Observações | `2` | Novas |
| Evidências | `2` | Novas |
| Valores métricos | `2` | Novos |
| Acontecimentos | `2` | Novos |
| Vínculos acontecimento–evidência | `3` | Novos |
| Vínculos acontecimento–organização | `2` | Novos |
| Relação entre versões | `1` | Nova, do tipo `corrects` |
| Resolução | `1` | Nova |
| Transições de situação | `2` | Novas |

O pacote não cria migration, tabela, função, gatilho, view, organização ou fonte adicional.

## Conteúdo excluído

- valor municipal como métrica própria;
- demais estados e municípios dos rankings;
- total brasileiro e valores por tecnologia;
- percentuais e comparações com 2023;
- números de dezembro isoladamente;
- infraestrutura de recarga mencionada na página;
- aplicação retroativa da classificação adotada pela ABVE a partir de janeiro de 2025;
- reproduções secundárias da primeira edição;
- resolução do conflito da carga `0005`;
- carga `0004`.

## Proteções operacionais

A carga:

- exige o estado anterior exato sobre o qual foi revisada;
- interrompe se a carga `0004` estiver presente;
- compara todos os campos da fonte e da organização ABVE antes do reuso;
- rejeita colisões de URL ou identificadores estáveis;
- compara todos os campos semânticos dos registros novos;
- rejeita relação cronologicamente inválida ou que crie ciclo;
- exige situação `provisional` antes de criar uma transição ainda inexistente;
- faz a situação atual coincidir com a última transição;
- verifica contagens e vínculos completos;
- compara a assinatura dos registros anteriores antes e depois;
- pode ser executada novamente sem duplicar registros.

## Validação descartável

A consulta de verificação foi executada antes do ensaio e retornou:

```text
load_0006_state: absent
prior_records_signature: 55c6b481a8022792824e9e1de0240c70
```

Em seguida, dentro de uma única transação:

1. a carga foi executada uma vez;
2. a mesma carga foi executada novamente;
3. a verificação retornou `complete`;
4. a transação foi encerrada com `ROLLBACK`.

O estado `complete` confirmou, entre outros pontos:

- valores `[24435, 56819]`;
- situações atuais `[rejected, validated]`;
- uma rejeição com substituto e uma validação sem substituto;
- duas evidências com origem documental conhecida;
- limitação da reconstrução declarada;
- horário da correção preservado;
- uma relação exata entre as versões;
- nenhum ciclo;
- nenhuma carga `0004` e nenhum resíduo de piloto;
- assinatura anterior ainda igual a `55c6b481a8022792824e9e1de0240c70`.

Depois do `ROLLBACK`, a consulta retornou novamente `absent` e a mesma assinatura. Nenhum dado foi persistido.

Hashes SHA-256 dos arquivos ensaiados:

```text
4ee538dfb46013ccf5b81f6ba2cc1f966b14dfd511d54d8434fdb0dcbd187abb  0006_abve-correcao-emplacamentos-sao-paulo-2024.sql
4e73d195348c2eeae18586fea9ac8a85e96fc05a66bfadc99ffa61227bc50e6d  0006_abve-correcao-emplacamentos-sao-paulo-2024.verify.sql
```

## Como fazer a revisão

Você não precisa procurar os novos registros no Supabase: eles foram revertidos de propósito. Revise a publicação oficial, este documento e os dois arquivos SQL.

### Perguntas factuais

1. A página identifica a ABVE, o título, a data editorial de 6 de janeiro de 2025 e a URL usada pela carga?
2. A nota oficial declara que os números estadual e municipal de São Paulo estavam trocados na primeira edição?
3. A nota estabelece `56.819` para o Estado e `24.435` para a cidade e informa a correção em 7 de janeiro de 2025 às 18h12?
4. Está correto reconstruir `24.435` como a atribuição estadual da primeira edição, mantendo explícita a ausência de captura integral do corpo antigo?
5. O ranking estadual trata de emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024?

### Perguntas metodológicas

6. Está correto limitar a métrica ao Estado de São Paulo e não persistir o valor municipal?
7. A definição preserva corretamente período, geografia, unidade e a classificação ABVE usada no balanço de 2024?
8. Está correto classificar a resolução como `material_correction`, e não como nova medição, revisão metodológica ou atualização de cobertura?
9. Está correto passar `24435` de `provisional` para `rejected` somente no escopo estadual, indicando `56819` como substituto?
10. Está correto passar `56819` de `provisional` para `validated` no mesmo escopo?
11. Está claro que `established` identifica a origem documental conhecida, sem afirmar auditoria ou corroboração independente?

### Perguntas operacionais

12. Está correto representar a mesma página por duas linhas e ligá-las por `corrects`, mantendo `2025-01-06` como data editorial e `2025-01-07` como data da correção?
13. A resolução separa adequadamente o acontecimento da ABVE em 2025 do aceite de Denis Toledo em 2026?
14. As contagens, relações, transições e verificações são suficientes para reconstruir a decisão sem depender de texto livre isolado?
15. A execução dupla, a assinatura invariável e o retorno a `absent` depois do `ROLLBACK` demonstram idempotência e ausência de persistência?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes do aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados são idênticos aos aceitos e executar exatamente a carga `0006` uma vez entre `BEGIN` e `COMMIT`. Depois, executar a consulta de verificação e documentar o resultado em um PR separado.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | — |
