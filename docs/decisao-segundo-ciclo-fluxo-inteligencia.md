# Decisão: segundo ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento define o objetivo e os controles do segundo ciclo. Ele não seleciona fontes ou acontecimentos, não cria a carga `0002`, não altera o schema e não modifica dados no Supabase.

## Contexto

O [primeiro ciclo](conclusao-primeiro-ciclo-fluxo-inteligencia.md) validou o fluxo manual mínimo para um acontecimento simples sustentado por uma fonte primária. A carga `0001` foi revisada antes da persistência, executada sem duplicatas e reconstruída até sua fonte e organização.

O primeiro ciclo usou `verification_level = 'confirmed'`. Ele não demonstrou que o ChargeBR consegue distinguir confirmação independente de mera repetição, republicação ou derivação da mesma origem.

## Decisão proposta

O segundo ciclo produzirá **um único acontecimento canônico sustentado por múltiplas fontes de linhagens independentes**. O objetivo é testar o uso defensável de `verification_level = 'corroborated'` em uma base que já contém a carga `0001`.

O ciclo continuará manual. A dificuldade nova será a avaliação da independência entre as fontes, não o aumento de volume nem a automação do fluxo.

## Conceitos aplicáveis

### Núcleo factual

O núcleo factual é a parte do acontecimento que todas as evidências usadas para `corroborated` precisam sustentar. Ele inclui, conforme o caso:

- o que aconteceu;
- quem realizou ou sofreu o acontecimento;
- a relação material com o Brasil;
- a data ou o período relevante;
- qualquer qualificador sem o qual a natureza do acontecimento mudaria.

As fontes não precisam repetir todos os detalhes. Entretanto, um detalhe sustentado por apenas uma delas não pode ampliar silenciosamente o núcleo apresentado como corroborado.

### Linhagem independente

Duas publicações possuem linhagens independentes quando:

- pertencem a controles editoriais ou institucionais distintos;
- não são republicações, versões sindicadas ou cópias uma da outra;
- a segunda não sustenta o núcleo factual exclusivamente por atribuição à primeira;
- existe base identificável para cada publicação afirmar o núcleo, como documento oficial, observação direta, apuração própria ou participação institucional distinta.

Sites, URLs, títulos ou autores diferentes não demonstram independência por si sós. Publicações do mesmo grupo ou textos derivados de um mesmo comunicado continuam pertencendo à mesma linhagem para este teste.

Uma fonte oficial do sujeito é apropriada para `confirmed`, mas não fornece sozinha confirmação independente. Para avançar a `corroborated`, ao menos uma fonte adicional deverá ser independente do sujeito e da publicação primária.

### Sinais de derivação

Os seguintes sinais exigem cautela:

- crédito explícito à publicação primária como única origem;
- sequência, redação, números ou erros incomuns reproduzidos sem apuração adicional;
- indicação de conteúdo sindicado, patrocinado ou republicado;
- mesma assessoria, mesmo grupo editorial ou mesmo canal institucional;
- ausência de explicação sobre como a segunda fonte confirmou o núcleo.

Um sinal isolado não resolve automaticamente a avaliação, mas a independência só poderá ser afirmada quando houver evidência positiva suficiente.

## Requisitos do acontecimento

O acontecimento selecionado deverá:

- não ter sido usado nos pilotos nem na carga `0001`;
- ter sido publicado, preferencialmente, nos 30 dias anteriores à seleção;
- possuir relação material e explícita com a mobilidade elétrica no Brasil;
- representar um único acontecimento realizado ou oficialmente publicado;
- possuir uma fonte primária apropriada e acessível;
- possuir ao menos uma fonte adicional independente, também acessível;
- permitir que as duas fontes sustentem o mesmo núcleo factual;
- não apresentar conflito material não resolvido sobre esse núcleo;
- caber no schema aprovado sem contornar relações estruturais por texto livre;
- não exigir cálculo derivado, reconciliação quantitativa complexa ou reconstrução extensa de cadeia regulatória.

A relevância ou notoriedade do tema não compensa a ausência de fontes independentes.

## Condições para `corroborated`

O acontecimento só poderá receber `corroborated` quando a revisão confirmar simultaneamente:

1. ao menos duas publicações distintas;
2. ao menos duas fontes sob controles distintos;
3. uma evidência separada para cada linhagem;
4. suporte de cada evidência ao mesmo núcleo factual;
5. independência da fonte adicional em relação ao sujeito e à publicação primária;
6. ausência de conflito material não resolvido no núcleo;
7. redação do acontecimento limitada ao que foi corroborado.

Se a independência não puder ser demonstrada, o nível correto continua sendo `confirmed`, `reported` ou outro aplicável. Como o objetivo específico deste ciclo é testar `corroborated`, o candidato deverá retornar à seleção em vez de ser forçado para a carga `0002`.

## Fluxo aprovado

### 1. Seleção

Pesquisar poucos candidatos recentes e comparar sua relevância, simplicidade e disponibilidade de fontes. A seleção deverá registrar por que cada fonte parece possuir linhagem própria.

### 2. Avaliação de independência

Antes da estruturação, examinar autoria, controle institucional, atribuições, links, redação e origem provável das afirmações. Classificar cada relação como:

- `independent`: existe suporte positivo para linhagem distinta;
- `derived`: a publicação depende da mesma origem;
- `unresolved`: a independência não pode ser determinada.

Somente fontes classificadas como `independent` poderão sustentar `corroborated`. `Derived` e `unresolved` permanecem documentadas, mas não contam como confirmação independente.

### 3. Preparação reproduzível

Depois do merge da seleção, criar:

- `data/canonical/0002_<identificador>.sql`;
- `docs/revisao-carga-canonica-0002.md`.

A carga deverá ser idempotente, interromper diante de registros homônimos divergentes e conter somente os registros e vínculos necessários. Ela não será migration nem seed.

Cada publicação deverá gerar sua própria observação e evidência. Ambas poderão usar `supports` somente quando sustentarem o núcleo do acontecimento.

### 4. Proteção da carga `0001`

Antes e depois de cada validação ou execução, confirmar que:

- o acontecimento da carga `0001` continua presente uma única vez;
- seus identificadores, estados e vínculos permanecem inalterados;
- a carga `0002` não recria silenciosamente fonte, publicação, observação, evidência, acontecimento ou organização já existentes;
- eventual reutilização de uma fonte ou organização canônica exige correspondência exata; conteúdo divergente interrompe a operação.

### 5. Validação descartável

Executar a carga `0002` duas vezes dentro da mesma transação e revertê-la. Uma única consulta de verificação deverá:

- reconstruir as duas linhagens da carga `0002`;
- contar registros, evidências e vínculos;
- confirmar o núcleo factual comum;
- detectar identificadores duplicados;
- verificar a invariância da carga `0001`;
- confirmar, depois do rollback, que nenhum registro da carga `0002` permaneceu.

A mesma estrutura de consulta deverá ser reutilizada depois da persistência. Se ela exigir cópias manuais divergentes, isso será registrado como lacuna de processo; não será criada função no banco apenas para concluir o ciclo.

### 6. Revisão humana

O pacote separará as perguntas em três grupos:

- **factuais:** o que cada fonte sustenta e qual é o núcleo comum;
- **metodológicas:** se as linhagens são independentes e permitem `corroborated`;
- **operacionais:** se a carga é mínima, idempotente e preserva a carga `0001`.

O PR só poderá ser incorporado depois de `ACCEPTED` expresso.

### 7. Persistência e resultado

Depois do aceite e do merge, executar no Supabase exatamente a carga aprovada entre `BEGIN` e `COMMIT`. A consulta reutilizada deverá demonstrar:

- um acontecimento `accepted` e `corroborated`;
- duas ou mais linhagens independentes ligadas por `supports`;
- cadeia completa até cada fonte e publicação;
- ausência de duplicatas;
- invariância da carga `0001`;
- nenhuma alteração de schema ou dado de teste.

O resultado será documentado em `docs/resultado-carga-canonica-0002.md`, em PR separado e sujeito a nova revisão.

## Interrupções obrigatórias

O ciclo para antes da persistência quando:

- nenhum candidato atende aos requisitos;
- a fonte adicional é `derived` ou permanece `unresolved`;
- existe conflito material não resolvido no núcleo factual;
- a redação exige informação não sustentada por ambas as linhagens;
- a carga modificaria silenciosamente um registro canônico existente;
- o schema ou a metodologia não conseguem representar uma distinção necessária.

Uma interrupção não autoriza reduzir o padrão de independência, ocultar a limitação ou alterar o schema dentro da carga.

## Critérios de sucesso

O segundo ciclo será concluído quando:

1. uma pessoa revisora confirmar o núcleo factual e a independência das fontes;
2. a carga aprovada estiver na `main` antes da persistência;
3. um único acontecimento `accepted` e `corroborated` estiver ligado a ao menos duas linhagens independentes;
4. cada linhagem puder ser reconstruída até sua fonte e publicação;
5. a carga `0001` permanecer inalterada;
6. não houver duplicatas, dados de teste ou alteração de schema;
7. a mesma estrutura de verificação funcionar antes e depois da persistência;
8. a execução e suas contagens forem documentadas e aceitas.

## Fora do escopo

- mais de um acontecimento novo;
- automação de descoberta, captura, classificação ou verificação;
- coleta em lote ou recorrente;
- geração de histórias, análises, alertas ou produto público;
- meta de produtividade, frequência ou cobertura;
- importação histórica ou migração do Notion;
- alteração de schema sem lacuna e decisão próprias.

## Próxima etapa após esta decisão

Depois do merge desta decisão, pesquisar poucos candidatos e preparar um documento de seleção da carga `0002`. Nenhum arquivo de carga e nenhuma alteração no Supabase serão realizados durante a seleção.

## Perguntas para revisão

1. O núcleo factual está definido de forma suficientemente clara?
2. Os critérios distinguem uma fonte independente de uma publicação derivada?
3. As sete condições para usar `corroborated` são adequadas?
4. O fluxo protege corretamente a carga `0001` durante a validação e a persistência?
5. As interrupções impedem que o objetivo seja cumprido por redução silenciosa do padrão?
6. A consulta reutilizável e a divisão das perguntas reduzem repetição sem remover controles?
7. Os oito critérios de sucesso demonstram o resultado esperado do segundo ciclo?
8. Está correto manter volume, automação, produto público e alterações de schema fora desta etapa?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 4 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A pesquisa de candidatos e a seleção da carga `0002` só poderão começar depois que esta decisão estiver incorporada à `main`.
