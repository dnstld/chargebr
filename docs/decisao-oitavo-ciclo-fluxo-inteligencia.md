# Decisão: oitavo ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento propõe o objetivo, o contrato e os controles do oitavo ciclo. Ele não cria consulta SQL, view, API ou interface, não altera o schema e não modifica dados no Supabase.

## Contexto

O [sétimo ciclo](conclusao-setimo-ciclo-fluxo-inteligencia.md) demonstrou que o ChargeBR consegue preservar uma métrica conceitual, duas versões metodológicas, seus componentes, suas evidências, a relação temporal entre elas e dois valores publicados com papéis distintos.

Para janeiro de 2025, estão estruturados:

- `12556` como resultado `primary` pela metodologia vigente;
- `16502` como valor `counterfactual` publicado para o critério anterior;
- `3946` MHEV como contexto documental;
- a relação `supersedes` entre os métodos, não entre os valores.

O banco já contém os elementos necessários para explicar o caso. Ainda não foi validado um contrato de leitura que impeça uma aplicação, análise ou texto editorial de:

- escolher o valor errado como corrente;
- omitir o critério metodológico;
- esconder o contrafactual;
- chamar uma mudança de classificação de correção;
- atribuir ao ChargeBR um número publicado pela fonte;
- atribuir à fonte um cálculo futuro do ChargeBR;
- expor dados sem período, unidade, geografia ou nível de verificação.

O oitavo ciclo introduzirá somente essa dificuldade: **transformar registros canônicos já aceitos em uma saída de leitura reproduzível e semanticamente segura**.

## Por que esta capacidade vem antes de uma interface

Uma interface bonita não corrige um contrato ambíguo. Se a regra de seleção estiver escondida no código da aplicação, diferentes páginas poderão apresentar números ou explicações incompatíveis para os mesmos registros.

O contrato de leitura deverá decidir primeiro:

1. quais registros formam a resposta;
2. como a metodologia vigente é derivada;
3. qual valor pode aparecer como principal;
4. quais valores e contextos não podem ser ocultados;
5. quais limitações acompanham a saída;
6. quando a consulta deve bloquear a apresentação em vez de improvisar.

Depois dessa validação, uma interface, API ou texto editorial poderá consumir uma regra revisada em vez de reconstruí-la por conta própria.

## Decisão proposta

O oitavo ciclo criará uma única consulta SQL reutilizável, somente de leitura, para a métrica e o período da carga `0007`.

Arquivo proposto:

```text
queries/0001_abve-eletrificados-janeiro-2025.read.sql
```

A consulta retornará três linhas ordenadas, uma para cada projeção:

```text
1. current_methodology
2. as_published
3. methodology_comparison
```

Cada linha terá a mesma estrutura externa:

| Campo | Finalidade |
| --- | --- |
| `contract_version` | Identificar a versão do contrato de leitura |
| `projection_type` | Distinguir as três formas de apresentação |
| `projection_order` | Tornar a ordem determinística |
| `projection_status` | Informar `complete` ou `blocked` |
| `payload` | Conter os campos específicos da projeção em `jsonb` |
| `blockers` | Listar códigos estruturados que impedem a apresentação |

Versão inicial proposta:

```text
chargebr-methodology-reading-v1
```

No caso de sucesso, deverão existir exatamente três linhas `complete` e `blockers` deverá ser um array vazio. Se qualquer requisito crítico falhar, a consulta deverá retornar exatamente uma linha de controle `blocked`, sem apresentar um número principal parcial.

Uma única consulta evita repetir em três arquivos a lógica que determina escopo, método vigente, proveniência e bloqueios. As três projeções poderão possuir conteúdos diferentes dentro de `payload`, mas compartilharão a mesma base canônica e os mesmos controles.

## Escopo fixo do primeiro contrato

O primeiro teste será deliberadamente específico:

| Dimensão | Valor |
| --- | --- |
| Métrica | `monthly-light-electrified-vehicle-registrations-brazil-abve-classification` |
| Período inicial | `2025-01-01` |
| Período final | `2025-01-31` |
| Geografia | Brasil |
| Unidade | `vehicle_registration` |
| Fonte mantenedora | ABVE |
| Carga de origem | `0007` |

A consulta não receberá parâmetros nesta primeira versão. Parametrização genérica antes de provar um caso concreto poderia esconder comportamentos indefinidos para métricas sem história metodológica revisada.

O SQL deverá filtrar por identificadores estáveis e campos de escopo. Identificadores internos como `21`, `41` ou `42` poderão aparecer na saída para auditoria, mas não serão usados como condição de identidade.

## Campos comuns obrigatórios

Cada `payload` deverá permitir reconstruir, diretamente ou por elementos aninhados:

- chave e nome da métrica;
- domínio da métrica;
- período inicial e final;
- granularidade temporal;
- geografia e granularidade geográfica;
- unidade e tipo do valor;
- fonte, URL e natureza primária;
- publicação, data editorial e URL;
- nível de verificação do acontecimento;
- situação do valor;
- origem do valor;
- papel do valor;
- chave, nome e início conhecido da metodologia;
- componentes e seus papéis;
- limitações necessárias para interpretar o resultado.

Campos de proveniência não poderão ser substituídos por um rótulo genérico como “fonte oficial”. A saída precisa identificar quem publicou, onde e com qual nível de confirmação registrado pelo ChargeBR.

## Projeção `current_methodology`

### Pergunta respondida

> Qual valor representa a métrica no período segundo a metodologia que estava vigente?

### Regra de seleção

A consulta deverá:

1. localizar a definição pela chave estável;
2. localizar as versões pertencentes à definição;
3. considerar as datas `applies_from` e as relações `supersedes` efetivas até o início do período;
4. exigir uma única versão vigente;
5. exigir um único valor `primary` ligado a essa versão, métrica, período, unidade e geografia;
6. exigir origem `source_published` e situação `validated`;
7. incluir todos os componentes da versão vigente;
8. incluir a evidência que define a versão e a publicação que sustenta o valor.

Resultado esperado para o caso:

```text
valor: 12556
papel: primary
origem: source_published
metodologia: classificação vigente desde janeiro de 2025
incluídos: BEV, PHEV, HEV e HEV Flex
publicado separadamente: MHEV
```

A consulta não selecionará simplesmente o valor mais recente, o maior identificador ou a versão com `applies_from` mais alta. A vigência deverá ser derivada da cadeia metodológica e do período solicitado.

## Projeção `as_published`

### Pergunta respondida

> O que a fonte publicou para esse recorte, com quais papéis e métodos?

### Regra de seleção

A saída deverá incluir todos os valores `source_published` ligados à definição, ao período e à geografia escolhidos, sem reduzir o conjunto ao resultado principal.

Cada valor deverá incluir:

- número exato;
- situação;
- papel `primary` ou `counterfactual`;
- metodologia correspondente;
- publicação e evidência de origem;
- nota suficiente para impedir interpretação como correção ou cálculo do ChargeBR.

Resultado esperado:

```text
primary: 12556 pela classificação vigente
counterfactual: 16502 pelo critério anterior com MHEV
```

A observação de `3946` MHEV deverá aparecer como contexto documental identificado, não como terceiro valor da métrica. A consulta não transformará texto de observação em um `metric_value` inexistente.

## Projeção `methodology_comparison`

### Pergunta respondida

> Quais regras mudaram e como os resultados publicados se relacionam a cada versão?

### Regra de seleção

A saída deverá colocar as versões em ordem histórica e incluir:

- chave, nome e descrição de cada versão;
- início conhecido;
- situação derivada `current` ou `historical` apenas na resposta;
- componentes ordenados por chave;
- papel de cada componente;
- valor publicado ligado à versão, quando houver;
- papel e origem desse valor;
- relação `supersedes`, data efetiva e evidência;
- limitações da comparação.

Resultado esperado:

| Metodologia | Estado derivado | Valor | MHEV |
| --- | --- | ---: | --- |
| Critério anterior | `historical` | `16502` como `counterfactual` | `included` |
| Vigente desde janeiro de 2025 | `current` | `12556` como `primary` | `reported_separately` |

`current` e `historical` serão rótulos derivados da consulta. Eles não serão gravados nas versões metodológicas.

## Regra de bloqueio

A consulta não deverá produzir as três projeções quando encontrar qualquer uma destas condições:

| Código proposto | Condição |
| --- | --- |
| `METRIC_NOT_FOUND` | A definição esperada não existe |
| `SCOPE_MISMATCH` | Período, unidade ou geografia divergem do contrato |
| `METHODOLOGY_MISSING` | Nenhuma versão está ligada à métrica |
| `METHODOLOGY_CYCLE` | A cadeia de substituição contém ciclo |
| `CURRENT_METHODOLOGY_NOT_UNIQUE` | Zero ou mais de uma versão podem ser correntes |
| `PRIMARY_VALUE_NOT_UNIQUE` | Zero ou mais de um valor principal atendem ao escopo |
| `VALUE_METHOD_MISMATCH` | Valor e metodologia pertencem a definições diferentes |
| `PRIMARY_OUTSIDE_APPLICABILITY` | O valor principal antecede o início conhecido da versão |
| `PROVENANCE_INCOMPLETE` | Fonte, publicação, observação ou evidência necessária está ausente |
| `UNSUPPORTED_VALUE_ORIGIN` | A origem não é suportada pelo contrato inicial |
| `COMPONENTS_INCOMPLETE` | A versão corrente não possui componentes suficientes para explicar sua composição |
| `UNEXPECTED_CARDINALITY` | Contagens críticas divergem do caso aceito |

Os códigos poderão ser refinados durante a implementação, mas cada bloqueio deverá ser estruturado, determinístico e testável. Texto livre poderá explicar o problema, mas não será a única forma de identificá-lo.

Uma saída `blocked` não deverá incluir `12556` como resultado principal. Isso impede que uma aplicação ignore a falha e apresente um número sem o contexto necessário.

## Redação humana esperada

A consulta fornecerá dados estruturados, não uma frase final única. O pacote de validação deverá demonstrar que os campos permitem produzir em PT-BR, sem informação externa, ao menos estas mensagens:

### Metodologia vigente

> A ABVE registrou 12.556 emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025 segundo a classificação vigente desde aquele mês. O total inclui BEV, PHEV, HEV e HEV Flex; MHEV são publicados separadamente.

### Como publicado

> A ABVE publicou 12.556 como resultado principal pela classificação vigente e informou que o mesmo mês teria 16.502 pelo critério anterior, que incluía MHEV.

### Comparação

> A diferença decorre do tratamento metodológico de MHEV. A publicação informa 3.946 MHEV separadamente. O ChargeBR não recalculou os totais nem classificou o valor anterior como erro.

Esses textos são exemplos de aceitação, não conteúdo armazenado adicional. A revisão deverá confirmar que cada parte é reconstruível pelos registros retornados.

## Segurança e exposição

O primeiro contrato será executado apenas no fluxo administrativo interno já autorizado. Ele não concederá acesso a `anon` ou `authenticated` e não colocará a chave `service_role` em navegador ou cliente público.

Nenhuma view será criada nesta etapa. Uma consulta SQL versionada é suficiente para provar a semântica sem alterar o banco.

Se uma view for proposta depois:

- deverá ter migration e revisão próprias;
- deverá usar `security_invoker = true` em PostgreSQL 15 ou posterior;
- deverá respeitar RLS e o princípio do menor privilégio;
- deverá receber permissões explícitas somente para os papéis necessários;
- não poderá depender do proprietário da view para contornar RLS;
- deverá passar pelos advisors de segurança e desempenho antes da aplicação.

Uma view em `public` não será considerada segura apenas porque contém somente `SELECT`.

## Desempenho e plano de consulta

A implementação deverá usar os índices e chaves existentes sempre que forem adequados:

- chave única de `metric_definitions.metric_key`;
- `(metric_definition_id, applies_from)` nas versões;
- chaves das relações metodológicas;
- `(methodology_version_id, value_role)` nas atribuições;
- índices existentes de valores por métrica e período;
- chaves de evidência e conteúdo.

O pacote deverá registrar `EXPLAIN (ANALYZE, BUFFERS)` da consulta contra o caso `0007`. Um `Seq Scan` em tabela atualmente minúscula não será tratado automaticamente como falha; índice adicional só será proposto diante de plano e padrão de acesso que demonstrem necessidade.

A consulta deverá evitar uma operação separada por componente ou por valor. Os conjuntos serão agregados no próprio PostgreSQL, evitando padrão N+1 na futura camada consumidora.

Não será criada materialized view. O conjunto atual é pequeno, precisa refletir o estado canônico mais recente e não apresenta evidência de custo que justifique armazenamento duplicado ou rotina de atualização.

## Artefatos da próxima etapa

Depois do aceite e do merge desta decisão, preparar em uma branch própria:

```text
queries/0001_abve-eletrificados-janeiro-2025.read.sql
queries/0001_abve-eletrificados-janeiro-2025.verify.sql
docs/revisao-contrato-leitura-0001.md
```

O pacote de revisão deverá conter:

- a consulta integral;
- a consulta de verificação;
- o resultado exato das três projeções;
- os bloqueios exercitados em transação descartável ou por CTEs de teste que não modifiquem dados permanentes;
- o plano de execução;
- uma demonstração das três mensagens em PT-BR;
- confirmação de que nenhuma tabela, dado, permissão ou policy foi alterado.

O diretório `queries/` deverá receber um `README.md` mínimo quando o primeiro contrato for criado.

## Critérios de sucesso

O oitavo ciclo será concluído quando:

1. uma única consulta reproduzível retornar as três projeções previstas;
2. a metodologia vigente for derivada de versões, relações e datas;
3. existir exatamente um resultado principal para o escopo;
4. valores contrafactuais permanecerem visíveis na projeção “como publicado”;
5. componentes e sua mudança de papel forem consultáveis;
6. fonte, publicação, evidência e nível de verificação acompanharem os valores;
7. a consulta não atribuir cálculo próprio à fonte nem autoria da fonte ao ChargeBR;
8. ambiguidades críticas produzirem `blocked`, sem resultado principal parcial;
9. a saída for determinística e verificável por conteúdo e cardinalidade;
10. o plano de execução for registrado e não revelar problema injustificado de desempenho;
11. nenhuma permissão pública, view, migration ou dado novo for criado;
12. os exemplos em PT-BR puderem ser escritos somente com os campos retornados;
13. o pacote e o resultado forem revisados e aceitos.

## Interrupções obrigatórias

O ciclo deverá parar quando:

- a lógica exigir alterar os dados da carga `0007`;
- o valor principal depender de recência, identificador interno ou preferência editorial;
- a metodologia corrente não puder ser determinada univocamente;
- o contrato precisar interpretar `notes` como única fonte de uma distinção crítica;
- algum campo necessário à comunicação não possuir proveniência;
- uma projeção parcial puder parecer completa;
- o teste exigir valor derivado, nova carga ou backfill;
- for necessária uma view ou mudança de índice sem decisão própria;
- a segurança depender de `security definer` ou de chave privilegiada no cliente;
- qualquer carga anterior deixar de permanecer protegida.

Se o modelo não conseguir produzir a saída sem uma mudança estrutural, a implementação deverá ser interrompida e uma decisão de modelagem deverá preceder qualquer migration.

## Fora do escopo

- criação de view ou materialized view;
- migration ou alteração de índice;
- política para `anon` ou `authenticated`;
- API, endpoint ou SDK;
- interface pública;
- autenticação ou conta de usuário;
- newsletter, alerta ou produto pago;
- geração automática de texto;
- parametrização para todas as métricas;
- valor calculado pelo ChargeBR;
- recálculo histórico;
- nova carga canônica;
- backfill metodológico;
- resolução dos casos `0004` ou `0005`;
- automação de coleta ou classificação;
- migração do Notion.

## Próxima etapa depois desta decisão

Depois do aceite e do merge, criar os quatro arquivos do primeiro contrato de leitura em uma branch própria. A consulta será executada contra os registros já persistidos da carga `0007`, mas nenhuma mudança será feita no Supabase.

O pacote deverá ser revisado antes de ser tratado como contrato canônico. A eventual criação de view, política pública ou integração com uma interface continuará condicionada a decisão posterior.

## Perguntas para revisão

### Escopo e formato

1. Está correto limitar o oitavo ciclo a uma consulta de leitura sobre a carga `0007`, sem nova fonte, carga ou cálculo?
2. Está correto retornar três projeções — metodologia vigente, “como publicado” e comparação metodológica — a partir de uma base comum?
3. Uma estrutura externa com versão, tipo, ordem, situação, `payload` e bloqueios é suficiente para um primeiro contrato verificável?
4. Está correto manter o primeiro contrato sem parâmetros e identificado por chaves estáveis, período e geografia fixos?

### Semântica

5. A regra da metodologia vigente evita depender de recência, maior identificador ou coluna `is_current`?
6. Está correto exigir exatamente um valor `primary`, mas preservar todos os valores publicados na projeção “como publicado”?
7. Está correto apresentar `3946` somente como contexto documental e não como terceiro valor da métrica?
8. Os campos obrigatórios permitem comunicar período, unidade, geografia, metodologia, papel, proveniência e verificação sem informação factual externa?
9. A regra `blocked` impede adequadamente que uma aplicação apresente um número parcial diante de ambiguidade crítica?
10. As três mensagens de exemplo descrevem o caso sem chamar a mudança de correção nem atribuir cálculo ao ChargeBR?

### Operação, segurança e desempenho

11. Está correto começar com SQL versionado e adiar qualquer view, API ou permissão pública?
12. Se uma view futura for necessária, as exigências de `security_invoker`, RLS, privilégios mínimos e advisors são adequadas?
13. Está correto registrar `EXPLAIN (ANALYZE, BUFFERS)` e não criar índice novo sem evidência do plano de execução?
14. Os artefatos, critérios de sucesso, interrupções e itens fora do escopo mantêm o teste pequeno e revisável?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A preparação do primeiro contrato de leitura só poderá começar depois que esta versão aceita estiver incorporada à `main`.
