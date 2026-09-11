# Revisão da carga canônica `0007`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este pacote permite revisar como o ChargeBR preservará uma mudança de metodologia sem apagar o critério anterior nem apresentar dois resultados metodologicamente diferentes como uma divergência factual. Nenhum registro novo permanece no Supabase.

Arquivos executáveis:

- [carga canônica `0007`](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql);
- [consulta de verificação reutilizável](../data/canonical/0007_abve-revisao-metodologica-eletrificados-janeiro-2025.verify.sql).

## Fontes primárias

A carga usa três publicações institucionais da ABVE:

1. [anúncio da adoção de novos requisitos técnicos a partir de janeiro de 2025](https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/), publicado em 6 de janeiro de 2025 e já preservado pela carga `0006`;
2. [publicação do primeiro resultado sob a nova classificação](https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/), publicada em 10 de fevereiro de 2025;
3. [publicação posterior que confirma a continuidade da classificação](https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/), publicada em 9 de fevereiro de 2026.

As três publicações pertencem à própria ABVE. A carga registra o que a associação publicou; não afirma auditoria independente da base de emplacamentos.

## O que o caso representa

Para janeiro de 2025 no Brasil, a ABVE publicou:

| Papel | Valor | Classificação | Tratamento de MHEV |
| --- | ---: | --- | --- |
| Resultado principal | `12556` | Vigente desde janeiro de 2025 | Publicado separadamente |
| Comparação contrafactual | `16502` | Critério anterior | Incluído no total principal |

A mesma publicação informa `3946` MHEV, compostos por `2883` MHEV de 12 V e `1063` MHEV de 48 V. Esse número explica a diferença entre os dois totais e é preservado como observação contextual, não como um terceiro valor da métrica.

Os dois totais são transcritos diretamente da fonte. A igualdade aritmética `12556 + 3946 = 16502` é uma verificação de coerência do conteúdo publicado, não a origem de um valor calculado pelo ChargeBR.

## Uma métrica, duas metodologias

A carga cria uma única definição conceitual:

| Campo | Valor |
| --- | --- |
| Chave | `monthly-light-electrified-vehicle-registrations-brazil-abve-classification` |
| Domínio | `vehicle_market` |
| Tipo | `integer` |
| Unidade | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `month` |
| Granularidade geográfica | `country` |
| Período dos valores | `2025-01-01` a `2025-01-31` |
| Geografia | Brasil |

A definição responde ao que é medido: emplacamentos mensais de veículos leves classificados pela ABVE Data como eletrificados. A composição do total não é fixada na definição, pois ela pertence à versão metodológica.

As duas versões são:

| Versão | Início conhecido | BEV | PHEV | HEV | HEV Flex | MHEV |
| --- | --- | --- | --- | --- | --- | --- |
| Critério anterior | Não determinado no recorte | Incluído | Incluído | Incluído | Incluído | Incluído |
| Classificação vigente | 1/1/2025 | Incluído | Incluído | Incluído | Incluído | Publicado separadamente |

A versão vigente `supersedes` a anterior a partir de 1º de janeiro de 2025. Essa relação determina qual metodologia orienta o resultado principal dali em diante, mas não declara falsos os valores produzidos ou apresentados segundo o método anterior.

## Situação e papel dos valores

Os dois valores ficam `validated`, pois ambos são afirmações quantitativas publicadas diretamente pela fonte para seus respectivos critérios:

- `12556` recebe a metodologia vigente e o papel `primary`;
- `16502` recebe a metodologia anterior e o papel `counterfactual`.

O papel evita que `16502` seja exibido como resultado principal de janeiro de 2025. A situação `validated` indica que a representação corresponde à publicação; ela não transforma o critério anterior em metodologia vigente nem atesta a base primária da ABVE.

Não é criada resolução de conflito nem transição de situação. Aqui não há um valor corrigindo o outro: há dois resultados documentados para regras de classificação diferentes.

## Proveniência e acontecimentos

A carga cria cinco observações e cinco evidências:

1. anúncio prospectivo dos novos critérios;
2. resultado principal `12556` sob a metodologia vigente;
3. comparação `16502` sob o critério anterior;
4. contexto de `3946` MHEV;
5. confirmação posterior da continuidade metodológica.

São criados três acontecimentos, todos `confirmed` e `accepted`:

| Fase | Data | Função |
| --- | --- | --- |
| `announcement` | 6/1/2025 | Anunciar a aplicação prospectiva dos novos requisitos |
| `publication` | 10/2/2025 | Publicar os resultados de janeiro e descrever os dois critérios |
| `update` | 9/2/2026 | Confirmar a continuidade da classificação vigente |

A ABVE é vinculada como sujeito dos três acontecimentos. O estado `established` das evidências identifica uma origem documental conhecida, sem significar corroboração independente.

## Registros incluídos

| Estrutura | Quantidade | Tratamento |
| --- | ---: | --- |
| Fonte ABVE | `1` | Reutilizada e comparada integralmente |
| Organização ABVE | `1` | Reutilizada e comparada integralmente |
| Publicação de 6/1/2025 | `1` | Reutilizada da carga `0006` |
| Novas versões de conteúdo | `2` | Resultado inicial e confirmação posterior |
| Definição de métrica | `1` | Nova e compartilhada pelas duas metodologias |
| Observações | `5` | Novas |
| Evidências | `5` | Novas |
| Valores métricos | `2` | Novos |
| Acontecimentos | `3` | Novos |
| Vínculos acontecimento–evidência | `5` | Novos |
| Vínculos acontecimento–organização | `3` | Novos |
| Versões metodológicas | `2` | Critério anterior e classificação vigente |
| Componentes metodológicos | `10` | Cinco categorias em cada versão |
| Vínculos metodologia–evidência | `6` | `defines`, `announces`, `confirms` e `contextualizes` |
| Relação entre metodologias | `1` | `supersedes` a partir de 1/1/2025 |
| Atribuições valor–metodologia | `2` | `primary` e `counterfactual` |

## Conteúdo deliberadamente excluído

- números anuais de 2024;
- resultados, percentuais e comparações referentes a janeiro de 2026;
- `3946` como valor separado em `metric_values`;
- valores calculados ou derivados pelo ChargeBR;
- resolução de conflito ou transição de situação;
- relação de correção entre publicações;
- data inicial inventada para o critério anterior;
- fonte secundária ou alegação de confirmação independente;
- registros do piloto;
- migration ou alteração de schema.

## Proteções operacionais

A carga:

- exige o estado anterior exato sobre o qual foi revisada;
- exige as `17` migrations já aplicadas;
- reutiliza fonte, organização e publicação anterior somente se todos os campos esperados coincidirem;
- rejeita colisões de URL, chaves e identificadores estáveis;
- compara todos os campos semânticos dos registros novos, inclusive notas e papéis dos vínculos;
- exige que cada valor e sua metodologia pertençam à mesma definição conceitual;
- exige que o resultado principal esteja dentro da vigência da metodologia atual;
- rejeita ciclos na cadeia de substituição metodológica;
- impede estruturas e valores deliberadamente excluídos;
- compara a assinatura dos registros anteriores antes e depois;
- pode ser executada novamente sem duplicar registros.

## Validação descartável

Antes do ensaio, a consulta reutilizável retornou:

```text
load_0007_state: absent
prior_records_signature: 5cbe217edb134cf2b02352cd7910f9ed
```

Em seguida, dentro de uma única transação:

1. a carga foi executada uma vez;
2. a mesma carga foi executada novamente;
3. a consulta de verificação retornou `complete`;
4. a transação foi encerrada com `ROLLBACK`.

O estado `complete` confirmou, entre outros pontos:

- valores `[12556, 16502]` e papéis `[primary, counterfactual]`;
- duas observações distintas ligadas a uma única definição de métrica;
- cinco componentes incluídos no critério anterior;
- quatro componentes incluídos e MHEV publicado separadamente na metodologia vigente;
- duas relações `defines`, uma `announces`, uma `confirms` e duas `contextualizes`;
- uma relação `supersedes` exata e nenhum ciclo;
- `3946` preservado somente como contexto;
- três acontecimentos nas fases e datas previstas;
- nenhum registro indesejado ou de piloto;
- assinatura anterior ainda igual a `5cbe217edb134cf2b02352cd7910f9ed`.

Depois do `ROLLBACK`, a consulta retornou novamente `absent` e a mesma assinatura. Nenhum dado foi persistido.

Hashes SHA-256 dos arquivos ensaiados:

```text
41fcbf280b8a3940db361efad39f8792399416f543a3b0fde4f7d90c07ffec86  0007_abve-revisao-metodologica-eletrificados-janeiro-2025.sql
6da79e5319dcce4bcbe8b85786166fc1b813e2554725ef52ec52eb19de2e9956  0007_abve-revisao-metodologica-eletrificados-janeiro-2025.verify.sql
```

## Como fazer a revisão

Você não precisa procurar os novos registros no Supabase: eles foram revertidos de propósito. Revise as publicações oficiais, este documento e os dois arquivos SQL.

### Perguntas factuais

1. As três páginas identificam claramente a ABVE, os títulos, as datas e as URLs usadas pela carga?
2. A publicação de 10 de fevereiro sustenta `12556` como total principal de janeiro de 2025 sob a nova classificação?
3. A mesma publicação sustenta `16502` como total que seria obtido pelo critério anterior com MHEV?
4. Ela também informa `3946` MHEV, divididos em `2883` de 12 V e `1063` de 48 V?
5. A publicação de 9 de fevereiro de 2026 confirma tanto a referência `12556` para janeiro de 2025 quanto a continuidade da composição sem MHEV no total principal?

### Perguntas metodológicas

6. Está correto representar uma única métrica conceitual com duas versões metodológicas, em vez de criar duas métricas independentes?
7. Os componentes representam corretamente BEV, PHEV, HEV, HEV Flex e a mudança de tratamento de MHEV?
8. Está correto deixar desconhecido o início do critério anterior e marcar 1º de janeiro de 2025 como início da versão vigente?
9. Está correto manter `12556` e `16502` como `validated`, distinguindo-os pelos papéis `primary` e `counterfactual`?
10. Está correto preservar `3946` somente como observação contextual, sem criar um terceiro valor dessa métrica?
11. Está correto usar `supersedes` para a vigência metodológica sem rejeitar, corrigir ou invalidar o valor ligado ao critério anterior?
12. Está claro que a carga documenta as afirmações da ABVE, mas não oferece auditoria ou confirmação independente dos emplacamentos?

### Perguntas operacionais

13. Está correto reutilizar a publicação de 6 de janeiro já preservada pela carga `0006`, sem criar uma terceira representação da mesma página?
14. Os seis vínculos de evidência metodológica e seus quatro tipos permitem reconstruir anúncio, definição, contexto e confirmação posterior?
15. O conteúdo excluído impede que números de outros períodos ou cálculos derivados sejam confundidos com os dois valores selecionados?
16. A execução dupla, as verificações de conteúdo, a assinatura invariável e o retorno a `absent` depois do `ROLLBACK` demonstram idempotência e ausência de persistência?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes do aceite.

## Próxima etapa depois do aceite e do merge

Sincronizar a `main`, confirmar que os dois arquivos incorporados são idênticos aos aceitos e executar exatamente a carga `0007` uma vez entre `BEGIN` e `COMMIT`. Depois, executar a consulta de verificação e documentar o resultado em um PR separado.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o pacote e não solicitou correções. O PR está liberado para merge. A carga `0007` permanece ausente do Supabase e só poderá ser persistida depois que esta versão aceita estiver incorporada à `main`.
