# Seleção da carga canônica `0004`

## Estado

`INTERROMPIDA — ACEITA, AGUARDANDO MERGE`

Este documento registra uma seleção sem candidato elegível. Em 5 de setembro de 2026, a ABVE ainda não havia publicado um novo resultado mensal compatível com a definição `monthly-light-bev-registrations-brazil` depois do resultado de julho usado na carga `0003`.

A interrupção cumpre a [decisão do quarto ciclo](decisao-quarto-ciclo-fluxo-inteligencia.md). Ela não cria a carga `0004`, não escolhe outro indicador, não altera o schema e não modifica dados no Supabase.

## Parâmetros da pesquisa

| Campo | Valor |
| --- | --- |
| Data da pesquisa | 5 de setembro de 2026 |
| Período procurado | Mês civil diferente de julho de 2026 |
| Série preferida | ABVE Data |
| Definição obrigatória | `monthly-light-bev-registrations-brazil` |
| Objeto obrigatório | Emplacamentos mensais de veículos leves 100% elétricos — BEV — no Brasil |
| Valor admissível | Total mensal realizado, exato e diretamente publicado |
| Regra de parada | Ausência de publicação posterior compatível |

A pesquisa verificou as publicações da ABVE posteriores a 11 de agosto de 2026, data da publicação usada na carga `0003`, e conferiu a área ABVE Data. Até a data da pesquisa, foram localizadas três novas publicações no site da associação; nenhuma apresentou o total mensal nacional de emplacamentos BEV para um novo mês.

## Publicações comparadas

| Data | Publicação | Conteúdo relevante | Avaliação |
| --- | --- | --- | --- |
| 2/9/2026 | [99 ultrapassa 66 mil veículos eletrificados no Brasil](https://abve.org.br/99-ultrapassa-66-mil-veiculos-eletrificados-no-brasil-e-reforca-protagonismo-do-pais-na-estrategia-global-de-sustentabilidade-da-didi/) | Mais de 66 mil veículos eletrificados cadastrados na plataforma 99, em data não delimitada como mês civil | Incompatível: mede uma frota cadastrada, mistura tecnologias e não representa emplacamentos nacionais realizados durante um mês |
| 31/8/2026 | [ABVE participa de seminário sobre eletromobilidade e Zona de Baixa Emissão](https://abve.org.br/abve-participa-de-seminario-sobre-eletromobilidade-e-zona-de-baixa-emissao-no-centro-de-sao-paulo/) | Anúncio e programação de evento sobre eletromobilidade urbana | Incompatível: não publica um resultado mensal de emplacamentos BEV |
| 19/8/2026 | [Em congresso da Fenabrave, presidente da ABVE destaca avanços da eletromobilidade](https://abve.org.br/em-congresso-da-fenabrave-presidente-da-abve-destaca-avancos-da-eletromobilidade-no-brasil/) | Projeção de mais de 400 mil emplacamentos de veículos eletrificados leves em 2026 e outros números institucionais | Incompatível: o número é projetado, anual e reúne BEV, HEV e PHEV |
| 11/8/2026 | [Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026](https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/) | 25.782 emplacamentos de BEV em julho de 2026 | Compatível, porém já usado na carga `0003`; não acrescenta um período novo |

## Resultado da seleção

**Nenhuma publicação foi selecionada e nenhum valor foi proposto para a carga `0004`.**

A publicação de 2 de setembro não pode substituir um resultado mensal apenas por ser recente e tratar de veículos eletrificados. Seu objeto é o conjunto de veículos cadastrados em uma plataforma privada; a definição aprovada mede emplacamentos de veículos leves BEV ocorridos no Brasil durante um mês civil.

As publicações de 31 e 19 de agosto também não fornecem o núcleo exigido. A primeira anuncia um seminário. A segunda apresenta uma projeção anual para um conjunto de tecnologias, não um total mensal realizado de BEV.

O resultado de julho permanece o mais recente candidato compatível localizado, mas já está integralmente representado pela carga `0003`. Reutilizá-lo criaria uma duplicata em vez de estender a definição por outro período.

## Motivo da interrupção obrigatória

A decisão do quarto ciclo determina que a seleção pare quando uma publicação posterior da mesma série não estiver disponível ou não atender aos requisitos. Ela proíbe trocar de métrica ou escolher uma fonte semanticamente diferente apenas para produzir a carga `0004`.

Prosseguir agora exigiria pelo menos uma destas mudanças não autorizadas:

- tratar veículos cadastrados na plataforma 99 como emplacamentos mensais nacionais;
- tratar uma projeção anual de várias tecnologias como um valor realizado de BEV;
- criar outra métrica;
- repetir o valor e o período de julho;
- procurar um número menos adequado somente para evitar a interrupção.

Nenhuma dessas mudanças será feita. A ausência de candidato não é uma falha do fluxo: é a aplicação do controle que impede uma carga semanticamente incompatível.

## Efeito sobre o repositório e o banco

Esta etapa acrescenta somente este registro documental e seu vínculo no índice da documentação.

Não serão criados:

- arquivo SQL da carga `0004`;
- consulta de verificação da carga `0004`;
- pacote de revisão de carga;
- publicação, observação, evidência, acontecimento ou valor métrico;
- nova fonte, organização ou definição de métrica;
- migration, seed ou alteração de schema.

O Supabase não será consultado nem modificado nesta etapa. As cargas `0001`, `0002` e `0003`, inclusive o valor `25782` de julho, permanecem inalteradas.

## Condições para retomar a seleção

A seleção poderá ser retomada quando a ABVE publicar um novo resultado que satisfaça simultaneamente estas condições:

1. pertencer à mesma série ou apresentar semântica integralmente equivalente à ABVE Data;
2. declarar um total mensal realizado de emplacamentos de veículos leves BEV;
3. referir-se a um mês civil diferente de julho de 2026;
4. tornar explícitos Brasil, BEV, emplacamentos e o período medido;
5. permitir normalização para inteiro sem cálculo, arredondamento ou conversão discutível;
6. não revisar, corrigir ou substituir o valor de julho;
7. não apresentar conflito conhecido para o novo mês;
8. permanecer integralmente compatível com a fonte, a organização e a definição aprovadas na carga `0003`.

Quando essas condições forem atendidas, uma nova revisão da pesquisa deverá substituir a interrupção por uma seleção factual completa. Só depois do aceite e do merge dessa seleção poderão ser preparados o SQL, a consulta de verificação e o pacote de revisão da carga `0004`.

## Perguntas para revisão

### Factuais

1. A pesquisa cobriu todas as publicações da ABVE posteriores à publicação de 11 de agosto de 2026 disponíveis até 5 de setembro de 2026?
2. As três publicações posteriores são incompatíveis pelos motivos registrados: frota de plataforma, anúncio de evento e projeção anual de várias tecnologias?
3. O resultado mensal de julho é compatível, mas já foi usado na carga `0003` e não representa um período novo?

### Metodológicas

4. A decisão do quarto ciclo exige interromper a seleção diante dessa ausência, sem trocar de métrica ou forçar outro candidato?
5. As oito condições de retomada protegem adequadamente a semântica da definição existente e o valor de julho?

### Operacionais

6. Está correto não criar SQL, não preparar uma carga e não modificar o Supabase enquanto não existir candidato elegível?

Se todas as respostas forem `sim`, registre `ACCEPTED`. O aceite confirmará que a interrupção está corretamente documentada; ele não autorizará a preparação da carga `0004`.

Se alguma resposta for `não`, indique o número e a correção necessária. Este documento não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 8 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o registro da interrupção e não solicitou correções. O PR está liberado para merge.

Esse aceite não autoriza preparar ou persistir a carga `0004`. A seleção permanecerá interrompida até que uma nova publicação satisfaça todas as condições de retomada documentadas acima.
