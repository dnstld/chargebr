# Revisão da carga canônica `0001`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este pacote permite revisar o primeiro acontecimento canônico antes que qualquer registro real seja persistido no Supabase. O arquivo da carga é [`data/canonical/0001_jeep-avenger-lancamento-brasil.sql`](../data/canonical/0001_jeep-avenger-lancamento-brasil.sql).

## O que será registrado

Um único acontecimento: **o lançamento comercial do Jeep Avenger híbrido MHEV no Brasil em 13 de agosto de 2026**.

A carga não inclui preços, condições comerciais, desempenho, equipamentos, prêmios, comparações, alegações promocionais, produção, empregos ou investimentos.

## Fonte e publicação

| Campo | Valor proposto |
| --- | --- |
| Fonte | Jeep — Stellantis Media |
| Natureza | Canal oficial da marca; fonte primária empresarial |
| Situação da fonte | `approved` |
| Título | “Chegou o Novo Jeep Avenger! Inovador, tecnológico e sofisticado, modelo representa a essência da marca para conquistar novos territórios no Brasil” |
| Data | 13 de agosto de 2026 |
| URL | [Publicação oficial da Jeep](https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil) |
| Retenção | Referência externa; não há cópia integral da publicação |

## Observação e evidência

### Trecho observado

> [...] Novo Jeep Avenger chega ao Brasil [...]. Todas as versões [...] são equipadas com o sistema MHEV de 12V [...] será possível reservar [...] a partir de hoje.

Os colchetes indicam que dois trechos da mesma publicação foram aproximados; não afirmam que as frases eram consecutivas.

### Afirmação normalizada

> A Jeep lançou comercialmente o Novo Jeep Avenger no Brasil em 13 de agosto de 2026, em três versões, todas equipadas com motorização híbrida MHEV de 12 V e disponíveis para reserva naquela data.

A extração é manual. A publicação também informa que as versões Altitude, Longitude e Limited podiam ser reservadas em concessionárias Jeep em 13 de agosto. A evidência aponta diretamente para essa publicação e possui linhagem `established`.

## Acontecimento proposto

| Campo | Valor proposto |
| --- | --- |
| Título | Jeep lança o Avenger híbrido MHEV no Brasil |
| Resumo | A Jeep lançou comercialmente o Novo Jeep Avenger no mercado brasileiro em três versões, todas com motorização híbrida MHEV de 12 V e disponíveis para reserva na data da publicação. |
| Tipo | `product_service` |
| Fase | `occurrence` |
| Data e precisão | 13/08/2026, dia exato |
| Geografia | Brasil |
| Relevância | Amplia a oferta de veículos híbridos leves disponível no mercado brasileiro. |
| Verificação | `confirmed` |
| Situação após a carga | `accepted` |

`occurrence` representa um lançamento realizado: a publicação afirma a chegada ao mercado brasileiro e a abertura imediata de reservas. Não se trata apenas do anúncio de uma disponibilidade futura.

`confirmed` significa que uma fonte primária oficial confirma o ato da própria marca. Não significa confirmação independente e, por isso, não se usa `corroborated`.

## Organização

Jeep será registrada como organização `other` e como sujeito central do acontecimento. Isso representa a marca sem tratá-la como pessoa jurídica. A relação corporativa com a Stellantis fica fora desta carga.

## Registros e vínculos

A carga criará, caso ainda não existam:

- 1 fonte;
- 1 publicação;
- 1 observação;
- 1 evidência;
- 1 acontecimento;
- 1 organização;
- 1 vínculo `supports` entre acontecimento e evidência;
- 1 vínculo `subject` entre acontecimento e Jeep.

Cada registro possui identificador estável. Uma segunda execução não cria duplicatas e interrompe a operação se encontrar um registro homônimo com conteúdo divergente.

## Validação descartável

Validação concluída no projeto remoto em 4 de setembro de 2026:

- a conferência inicial encontrou zero registros com os identificadores da carga;
- o mesmo arquivo foi executado duas vezes dentro de uma única transação;
- depois da segunda execução, havia exatamente um acontecimento e uma cadeia completa até fonte, publicação, observação, evidência e organização;
- os vínculos `supports` e `subject` estavam presentes uma única vez;
- a transação inteira foi revertida;
- a conferência posterior encontrou zero registros e zero vínculos da carga;
- nenhuma migration foi aplicada e nenhuma alteração de schema foi realizada.

O teste confirmou a idempotência e a integridade da cadeia sem persistir dados. A execução definitiva continua proibida até o aceite, o merge deste PR e a etapa separada de persistência.

## Perguntas para revisão

Consulte a publicação oficial e responda:

1. A fonte, o título, a data e a URL estão corretos?
2. O trecho observado e a afirmação normalizada são fiéis à publicação?
3. O título e o resumo se limitam ao lançamento, à motorização híbrida e às reservas abertas?
4. `product_service`, `occurrence`, 13/08/2026 e Brasil representam adequadamente o acontecimento?
5. Está claro que `confirmed` se apoia na fonte oficial da própria marca, sem confirmação independente?
6. Jeep como `other` e sujeito central está adequada, sem transformar a marca em pessoa jurídica?
7. Os registros, vínculos, limitações e exclusões estão completos?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. O PR não deve ser incorporado antes desse aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 4 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente o pacote e não solicitou correções. O PR está liberado para merge. A carga permanece sem persistência no Supabase e só poderá ser executada depois que esta versão aceita estiver incorporada à `main`.
