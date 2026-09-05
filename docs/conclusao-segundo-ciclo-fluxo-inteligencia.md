# Conclusão do segundo ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento avalia o segundo ciclo operacional do fluxo de inteligência depois da persistência, da revisão e do merge da carga canônica `0002`. Ele não cria outra carga, não altera o schema, não modifica dados no Supabase e não autoriza automação.

## Resultado geral

O segundo ciclo atingiu seu objetivo: um único acontecimento foi estruturado a partir de duas publicações sob controles institucionais distintos, revisado antes da persistência e registrado como `accepted` e `corroborated`. Depois do `COMMIT`, a consulta reutilizável reconstruiu separadamente as duas linhagens e confirmou que a carga `0001` permaneceu inalterada.

O resultado permite considerar **validado o uso manual e defensável de `corroborated` para um núcleo factual comum sustentado por duas linhagens independentes**. Ele não demonstra que toda publicação adicional é independente, que detalhes sustentados por apenas uma fonte podem ser tratados como corroborados ou que o processo está pronto para escala e automação.

## Acontecimento produzido

| Campo | Resultado |
| --- | --- |
| Carga | `0002` |
| Acontecimento | Apresentação pública do BMW iX3 no Festival Interlagos Carros 2026 |
| Data | 27 de agosto de 2026 |
| Tipo e fase | `product_service` / `occurrence` |
| Verificação | `corroborated` |
| Situação | `accepted` |
| Fonte primária | BMW Group PressClub Brasil |
| Fonte independente | Diário do Grande ABC |
| Organização central | BMW, registrada como marca por `other` |

A [seleção](selecao-carga-canonica-0002.md), o [pacote aceito](revisao-carga-canonica-0002.md), a [carga executada](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.sql), a [consulta reutilizável](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.verify.sql) e o [resultado aceito](resultado-carga-canonica-0002.md) preservam a trilha completa do ciclo.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Revisão humana do núcleo e da independência | Denis Toledo registrou `ACCEPTED` na seleção, no pacote da carga e no resultado | Atendido |
| Merge antes da persistência | O PR #51 foi incorporado à `main` antes da execução | Atendido |
| Um acontecimento `accepted` e `corroborated` | A consulta posterior encontrou exatamente um acontecimento da carga `0002` nesses estados | Atendido |
| Duas linhagens reconstruíveis | Cada cadeia alcançou sua própria fonte, publicação, observação e evidência | Atendido |
| Preservação da carga `0001` | Sua assinatura integral permaneceu `1509ccaa3560ffa46a53b2ff287e6339` antes e depois da carga | Atendido |
| Ausência de resíduos ou mudança estrutural | Não houve duplicatas, dados de piloto, candidatos alternativos ou alteração de schema | Atendido |
| Verificação reutilizada | O mesmo arquivo confirmou `absent` antes e `complete` depois da persistência | Atendido |
| Execução documentada e aceita | O resultado recebeu `ACCEPTED` e foi incorporado pelo PR #52 | Atendido |

Os oito critérios da [decisão do segundo ciclo](decisao-segundo-ciclo-fluxo-inteligencia.md) foram atendidos.

## O que foi validado

O segundo ciclo acrescenta às regras já demonstradas no primeiro ciclo:

1. definir o núcleo factual comum antes de atribuir `corroborated`;
2. avaliar independência por controle institucional, origem da apuração e sinais de derivação, não apenas por URL ou autoria distinta;
3. criar uma observação e uma evidência separadas para cada linhagem;
4. limitar o acontecimento ao que todas as evidências qualificadas sustentam;
5. preservar fora do núcleo corroborado os detalhes sustentados por apenas uma fonte;
6. reconstruir e contar cada cadeia com uma consulta reutilizável;
7. proteger cargas canônicas anteriores por uma assinatura integral antes e depois da nova persistência;
8. registrar separadamente preparação, aceite, execução e resultado.

Essas regras complementam, sem substituir, o fluxo manual mínimo validado no primeiro ciclo.

## Simplificações que funcionaram

A consulta de verificação deixou de ser uma cópia eventual usada somente durante a preparação. Ela passou a ser um arquivo versionado, executado antes da validação, depois do `rollback`, antes da persistência e depois do `COMMIT`.

O pacote de revisão também separou perguntas factuais, metodológicas e operacionais. Essa divisão permitiu avaliar o conteúdo das fontes, a independência das linhagens e a segurança da carga sem tratar tudo como uma única decisão.

Os hashes da carga e da consulta tornaram explícita a identidade entre os arquivos aceitos e os arquivos executados. Essas três práticas devem permanecer nos próximos ciclos.

## Aprendizado operacional

As validações descartáveis confirmaram a atomicidade dos registros, mas consumiram valores das sequências de identidade do PostgreSQL. Por isso os identificadores internos da carga `0002` apresentam saltos em relação à carga `0001`, mesmo sem linhas residuais.

Esse comportamento não compromete a integridade porque:

- a carga usa identificadores estáveis próprios para localizar e proteger registros;
- cada entidade esperada aparece exatamente uma vez;
- as relações apontam para os registros persistidos corretos;
- nenhuma regra do ChargeBR depende de identificadores internos consecutivos.

Os próximos pacotes devem continuar explicando os identificadores internos quando úteis para auditoria, sem tratá-los como identificadores de negócio nem reiniciar sequências para eliminar lacunas visuais.

## Limites do que foi provado

Os dois ciclos concluídos ainda não validaram:

- valores canônicos em `metric_definitions` e `metric_values` no banco persistente;
- normalização quantitativa de unidade, período e geografia em uma carga canônica;
- atualização, correção, rejeição ou substituição de registro já aceito;
- vários acontecimentos em uma mesma carga;
- conflito quantitativo em dados canônicos ou uma regra de tolerância;
- cadeia regulatória canônica no banco persistente;
- coleta recorrente, priorização ou monitoramento;
- automação de descoberta, captura, classificação ou decisão;
- geração de história, análise, alerta ou produto público;
- volume, desempenho, frequência ou custo operacional.

O sucesso de `corroborated` não elimina esses limites nem autoriza ampliar várias dimensões ao mesmo tempo.

## Próxima capacidade proposta

O terceiro ciclo deverá testar **um único acontecimento quantitativo de mercado ligado a uma definição e a um valor canônicos de métrica**, usando o schema atual.

O objetivo será demonstrar que o ChargeBR consegue transformar um número publicado em um valor consultável sem perder seu termo de origem, unidade, período, geografia, proveniência ou grau de confirmação.

Para introduzir somente uma dificuldade nova, o ciclo poderá usar uma única fonte primária apropriada e `verification_level = 'confirmed'`. A independência já foi exercitada no segundo ciclo e não será requisito para o terceiro; uma fonte adicional só poderá elevar o nível se sua independência e seu suporte ao mesmo valor forem demonstrados novamente.

O terceiro ciclo deverá:

- continuar manual e limitar-se a um acontecimento novo;
- não reutilizar como carga canônica os registros dos pilotos;
- selecionar uma publicação recente com um valor quantitativo explicitamente declarado e materialmente relacionado ao Brasil;
- definir uma única métrica canônica com semântica, unidade, agregação e granularidades inequívocas;
- registrar o valor com período e geografia sustentados diretamente pela fonte;
- preservar o termo original da publicação na observação e separar sua normalização no valor métrico;
- não calcular crescimento, cobertura, proporção, soma ou conversão que a fonte não permita reproduzir de forma inequívoca;
- não reconciliar divergências por tolerância e não adotar a proposta `P03-MET-01` neste ciclo;
- produzir a carga `0003` e uma consulta reutilizável que também conte a definição e o valor da métrica;
- proteger integralmente as cargas `0001` e `0002` antes e depois da validação e da persistência;
- permanecer dentro do schema atual; qualquer distinção estrutural indispensável que não possa ser representada interrompe o ciclo e exige decisão própria.

A seleção do acontecimento e a definição detalhada da métrica deverão ser objeto de uma nova decisão. Esta conclusão não escolhe antecipadamente fonte, publicação, número ou unidade.

## O que permanece fora da próxima etapa

- mais de um acontecimento ou mais de uma métrica nova;
- cálculos derivados não publicados pela fonte;
- reconciliação automática de números divergentes;
- margem fixa de tolerância entre valores;
- atualização ou substituição das cargas `0001` e `0002`;
- automação de descoberta, captura, normalização ou verificação;
- coleta em lote ou recorrente;
- interface pública, newsletter, alertas ou produto pago;
- importação histórica ou migração do Notion;
- alteração de schema sem lacuna documentada e decisão própria.

## Perguntas para revisão

1. Os oito critérios de sucesso do segundo ciclo foram atendidos?
2. A conclusão limita corretamente o que foi validado ao uso manual de `corroborated` para um núcleo comum sustentado por linhagens independentes?
3. A consulta reutilizável, a separação das perguntas e os hashes são simplificações que devem permanecer?
4. A explicação dos saltos nas sequências distingue corretamente valores consumidos de registros persistidos?
5. Um acontecimento quantitativo ligado a uma definição e a um valor de métrica é a próxima capacidade adequada?
6. Está correto permitir uma única fonte primária e `confirmed` para testar a dimensão quantitativa sem exigir novamente a dificuldade da corroboração?
7. Está correto excluir deste ciclo cálculos derivados, tolerância e reconciliação de divergências?
8. Está correto manter atualização de registros existentes, escala, automação e produto público fora da próxima etapa?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 5 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a conclusão e a próxima capacidade proposta, sem solicitar correções. O PR está liberado para merge. A carga `0003` não deve começar antes que esta conclusão esteja incorporada à `main` e a decisão específica do terceiro ciclo seja preparada.
