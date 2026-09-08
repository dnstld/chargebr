# Conclusão do sexto ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento avalia o sexto ciclo depois da seleção do caso, da mudança estrutural, da persistência, da revisão e do merge da carga canônica `0006`. Ele não cria outra carga, não altera o schema e não modifica dados no Supabase.

## Resultado geral

O sexto ciclo atingiu seu objetivo: um conflito quantitativo foi resolvido manualmente a partir de uma correção autoritativa, sem apagar a afirmação anterior nem reescrever o histórico para fazê-lo parecer coerente desde o início.

A ABVE informou que, na primeira edição de seu balanço de 2024, os números de São Paulo nos rankings estadual e municipal estavam trocados. Para o recorte estadual, o banco preserva:

| Momento | Valor atribuído ao Estado de São Paulo | Situação atual |
| --- | ---: | --- |
| Primeira edição de 6/1/2025 | `24435` | `rejected` |
| Correção de 7/1/2025 | `56819` | `validated` |

O valor `24435` foi rejeitado somente no escopo estadual. Ele permanece correto para a cidade de São Paulo segundo a própria correção, mas o recorte municipal não foi persistido.

O resultado permite considerar **validado o fluxo manual mínimo para registrar uma correção material, preservar versões de conteúdo e explicar estruturalmente a passagem de valores provisórios para suas situações atuais**.

## Trilha completa do ciclo

O ciclo foi dividido em etapas independentes e revisáveis:

1. a [decisão do sexto ciclo](decisao-sexto-ciclo-fluxo-inteligencia.md) definiu que nenhum conflito seria resolvido por plausibilidade, aritmética, proximidade ou preferência editorial;
2. a [seleção do caso `0006`](selecao-resolucao-conflito-0006.md) confirmou a correção oficial da ABVE e limitou o teste ao valor estadual;
3. a [decisão de modelagem](decisao-modelagem-resolucao-conflito-0006.md) demonstrou que `value_status`, `notes` e `updated_at` não preservavam sozinhos uma transição auditável;
4. a migration `canonical_resolution_history` criou as três estruturas aditivas necessárias;
5. o [resultado da aplicação estrutural](resultado-aplicacao-historico-resolucoes-canonicas.md) confirmou a segurança da mudança;
6. o [pacote da carga `0006`](revisao-carga-canonica-0006.md) foi validado duas vezes em transação descartável e aceito;
7. a [carga canônica executada](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.sql) persistiu exatamente o pacote incorporado à `main`;
8. a [consulta reutilizável](../data/canonical/0006_abve-correcao-emplacamentos-sao-paulo-2024.verify.sql) confirmou o estado `complete`;
9. o [resultado da persistência](resultado-carga-canonica-0006.md) foi aceito e incorporado pelo PR #72.

Nenhuma etapa posterior antecipou o aceite da etapa anterior.

## Mudança estrutural validada

O caso demonstrou a necessidade e a utilidade de três tabelas:

| Estrutura | Pergunta respondida |
| --- | --- |
| `content_item_relations` | Como a versão posterior afeta a anterior? |
| `metric_value_resolutions` | Qual decisão canônica resolveu o conflito, com qual acontecimento e revisão? |
| `metric_value_status_transitions` | De qual situação cada valor veio, para qual passou e qual valor o substitui? |

As tabelas foram acrescentadas sem substituir estruturas existentes. O campo `metric_values.value_status` continua respondendo qual é a situação atual; as transições explicam como ela foi alcançada.

O primeiro caso demonstrou que a duplicação controlada entre fotografia atual e histórico pode permanecer consistente quando:

- resolução, transições e atualização dos estados ocorrem na mesma transação;
- a carga exige o estado anterior esperado;
- a última transição coincide com `value_status`;
- registros históricos recebem inserções, não edições silenciosas;
- a consulta posterior reconstrói a cadeia completa.

Não foi necessário criar função privilegiada, gatilho, view ou política pública para provar essa capacidade inicial.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Um único conflito e resolução autoritativa | A nota oficial da ABVE identifica o erro e o par correto | Atendido |
| Afirmações realmente comparáveis | Os dois valores usam a mesma métrica, período, unidade e geografia estadual | Atendido |
| Tipo e alcance documentados | A resolução é `material_correction` restrita ao Estado de São Paulo em 2024 | Atendido |
| Afirmações originais consultáveis | Duas versões, duas observações, duas evidências e dois valores permanecem no banco | Atendido |
| Transições reconstruíveis | Cada transição possui origem, destino, ordem, resolução, acontecimento e revisão | Atendido |
| Relação explícita e acíclica | A versão posterior `corrects` a anterior e a verificação encontrou zero ciclos | Atendido |
| Valor vigente sem apagar o histórico | `56819` está `validated`; `24435` continua consultável como `rejected` no escopo estadual | Atendido |
| Ausência de preferência do ChargeBR | A escolha decorre da correção da ABVE, não de soma, tolerância, maioria ou recência | Atendido |
| Schema e cargas anteriores protegidos | A assinatura anterior permaneceu `55c6b481a8022792824e9e1de0240c70` | Atendido |
| Execução e resultado documentados | O resultado recebeu `ACCEPTED` e foi incorporado pelo PR #72 | Atendido |

Os dez critérios da decisão do sexto ciclo foram atendidos.

## O que foi validado

O sexto ciclo acrescenta às capacidades anteriores:

1. distinguir duas versões da mesma URL por identificadores de conteúdo próprios;
2. relacionar explicitamente a versão corrigida à anterior por `corrects`;
3. preservar uma primeira edição reconstruída sem alegar captura integral inexistente;
4. manter duas afirmações quantitativas para o mesmo escopo, mesmo depois da resolução;
5. representar a resolução como `material_correction` ligada ao acontecimento da fonte;
6. separar a data da correção publicada da data da revisão humana do ChargeBR;
7. registrar `provisional → rejected` com indicação do valor substituto;
8. registrar `provisional → validated` sem substituto;
9. fazer a situação atual coincidir com o destino da transição mais recente;
10. validar ausência de ciclos, duplicações e alterações nos registros anteriores;
11. preservar o alcance geográfico da decisão, evitando declarar um número falso fora do escopo analisado;
12. executar de forma idempotente no ensaio e exatamente uma vez na persistência definitiva.

Essas regras validam o caso observado. Elas não autorizam classificar automaticamente outras mudanças como correções materiais.

## Significado dos estados usados

| Estado ou relação | Significado neste caso | O que não significa |
| --- | --- | --- |
| Evidência `established` | A origem documental utilizada é conhecida | Que a base de emplacamentos foi auditada independentemente |
| Acontecimento `confirmed` | A página oficial sustenta aquilo que foi registrado como publicado | Que todo dado subjacente foi verificado por outra fonte |
| Relação `corrects` | A versão posterior corrige erro material da anterior | Que toda edição posterior de uma página seja automaticamente superior |
| Valor `rejected` | O valor é inválido para o escopo estadual selecionado | Que o número seja falso em qualquer geografia |
| Valor `validated` | A correção da autoridade documental estabelece o valor para o escopo | Que o ChargeBR auditou a coleta primária |

Aceitar a representação não transforma a publicação institucional em corroboração independente. Da mesma forma, rejeitar uma associação entre número e estado não invalida o mesmo número quando associado corretamente à cidade.

## Aprendizados metodológicos

### A validade pertence ao escopo, não ao número isolado

`24435` não possui um significado verdadeiro ou falso sem entidade, período, unidade e geografia. A ABVE o reconhece para a cidade e o rejeita implicitamente para o estado ao declarar a troca.

Por isso, toda interpretação de `value_status` precisa acompanhar os campos de escopo do `metric_value`. Interfaces e análises futuras não devem exibir apenas número e situação.

### Correção da fonte e decisão do ChargeBR são acontecimentos distintos

A ABVE corrigiu a publicação em 7 de janeiro de 2025, às 18h12. Denis Toledo aceitou a representação canônica em 8 de setembro de 2026.

O primeiro momento sustenta a resolução factual; o segundo autoriza sua persistência no ChargeBR. Fundir as datas ocultaria quem fez o quê e impediria reconstruir o fluxo de revisão.

### Uma versão reconstruída exige proveniência diferente de uma captura

A página acessível preserva a nota de correção, mas não o corpo integral incorreto. A carga criou identidade para a primeira edição e registrou sua afirmação, porém não inventou uma captura ou trecho antigo.

A evidência de `24435` aponta para a versão corrigida atualmente acessível e explica a inferência autorizada pela nota. Essa diferença deve continuar explícita em qualquer caso de conteúdo alterado.

### “Mais recente” não foi o critério

A versão corrigida é posterior, mas esse fato isolado não resolve o conflito. A decisão decorre da declaração expressa de que os números estavam trocados e da indicação do par correto.

Sem linguagem ou documentação equivalente, uma publicação posterior poderá representar nova medição, cobertura atualizada ou revisão metodológica e não deverá receber `corrects` automaticamente.

## Aprendizados operacionais

### Histórico imutável e estado atual podem coexistir

As tabelas históricas receberam somente `select` e `insert` para o papel administrativo do aplicativo. A fotografia em `metric_values` continuou atualizável, mas sua mudança ocorreu junto das transições e foi verificada depois do `COMMIT`.

Essa combinação foi suficiente para o primeiro caso manual. Ela ainda não prova que cargas concorrentes, operações fora do fluxo ou cadeias longas permanecerão corretas sem uma função transacional obrigatória.

### Identificadores estáveis importam mais que sequências

Os ensaios descartáveis e as tentativas idempotentes consumiram números das sequências sem deixar registros. Os identificadores internos resultantes possuem lacunas esperadas.

Chaves estáveis, restrições, contagens, relações e assinaturas continuam sendo os controles de identidade. As sequências não devem ser reiniciadas por aparência.

### O estado anterior precisa ser verificado antes de persistir

A carga só foi executada depois de confirmar:

- merge e commit exatos na `main`;
- hashes iguais aos arquivos aceitos;
- estado `absent` antes da execução;
- carga `0004` ausente;
- zero resíduos de piloto;
- assinatura integral dos registros anteriores.

Esse controle evitou executar um pacote revisado contra um banco diferente daquele usado no ensaio.

## Simplificações que funcionaram

- duas linhas de `content_items` reutilizaram o modelo existente de publicação;
- uma relação direcionada explicou a correção sem criar uma tabela completa de versões;
- uma resolução agrupou as mudanças dos dois valores;
- uma transição por valor foi suficiente para o caso;
- a hora `18h12` permaneceu na evidência e no resumo, enquanto o acontecimento usou precisão diária sem inventar fuso;
- a consulta reutilizável representou `absent` antes e `complete` depois;
- o ensaio com duas execuções e `ROLLBACK` comprovou idempotência sem persistir dados de teste;
- a aplicação definitiva executou o mesmo arquivo uma vez entre `BEGIN` e `COMMIT`.

Essas simplificações devem ser mantidas enquanto casos reais não demonstrarem necessidade adicional.

## Limites do que foi provado

O ciclo ainda não validou:

- revisão metodológica em que os dois valores sejam válidos sob métodos diferentes;
- atualização de cobertura com chegada posterior de registros;
- substituição formal sem declaração de erro material;
- uso de `superseded` em um valor historicamente válido;
- mais de uma transição para o mesmo valor;
- continuidade automática de cadeias com ordens superiores a `1`;
- múltiplas resoluções apoiadas pelo mesmo acontecimento;
- conflitos com mais de dois valores;
- resolução apoiada por fontes independentes;
- regra global de um único valor `validated` por escopo;
- função obrigatória, gatilho ou bloqueio de alterações administrativas fora do fluxo;
- consulta ou view pública para combinar situação atual e histórico;
- captura automática de versões alteradas;
- resolução do conflito `21061` versus `21060` da carga `0005`;
- retomada da carga `0004`;
- automação, escala, alerta ou produto público.

Uma correção material bem representada não prova que revisões metodológicas ou de cobertura devam usar os mesmos estados.

## Próxima capacidade proposta

O sétimo ciclo deverá testar **uma revisão metodológica quantitativa na qual o valor anterior continue historicamente válido sob o método antigo e o novo valor passe a representar a metodologia revisada**.

A dificuldade exclusiva será distinguir `superseded` de `rejected`:

- `rejected` indica que o valor era inválido para o escopo considerado;
- `superseded` indica que o valor pode ter sido válido sob uma versão anterior, mas deixou de ser o valor corrente depois de mudança declarada de método ou classificação.

Antes de selecionar um caso, uma decisão própria deverá definir:

- quais documentos demonstram mudança metodológica real;
- como identificar versões do método;
- quando dois valores do mesmo período continuam comparáveis;
- como ligar cada valor à metodologia sob a qual foi produzido;
- quando o valor anterior deve permanecer `validated` em sua série histórica ou passar a `superseded`;
- se o schema atual consegue representar versões metodológicas sem depender apenas de texto livre;
- quais condições exigem nova decisão estrutural antes da carga.

O caso deverá continuar pequeno: uma métrica, um período, um escopo e uma revisão documentada. A seleção não deverá começar antes do aceite e do merge desta conclusão.

## Interrupções necessárias no próximo ciclo

O sétimo ciclo deverá parar quando:

- a publicação apenas corrige erro material, repetindo a capacidade já validada;
- não houver declaração ou documentação suficiente da mudança metodológica;
- os valores pertencerem a períodos ou geografias diferentes;
- a diferença decorrer apenas de registros atrasados sem método alterado;
- o valor anterior tiver sido declarado incorreto, caso em que `rejected` pode continuar adequado;
- a resolução depender de preferência, recência, média, proximidade ou maioria;
- não for possível identificar sob qual versão metodológica cada valor foi produzido;
- o schema exigir representar versões do método, mas ainda não houver decisão estrutural aceita;
- a carga precisar editar ou apagar o histórico do sexto ciclo;
- o caso introduzir mais de uma nova dificuldade indispensável.

Uma interrupção não autoriza chamar toda atualização posterior de revisão metodológica.

## O que permanece fora da próxima etapa

- resolução automática ou em lote;
- adoção de margem de tolerância;
- reabertura da resolução `0006` sem nova evidência;
- resolução do conflito `0005` sem esclarecimento autoritativo;
- retomada forçada da carga `0004`;
- auditoria da base primária da fonte;
- múltiplas métricas ou revisões no mesmo ciclo;
- cálculo de tendência, crescimento ou indicador derivado;
- coleta recorrente e captura automática de versões;
- interface pública, newsletter, alerta ou produto pago;
- importação histórica ou migração do Notion.

## Perguntas para revisão

1. Os dez critérios de sucesso do sexto ciclo foram atendidos?
2. A conclusão limita corretamente o resultado a uma correção material manual, sem generalizá-lo para revisão metodológica ou atualização de cobertura?
3. Está correto afirmar que `24435` foi rejeitado somente no escopo estadual e continua correto para a cidade não persistida?
4. A separação entre versões, relação `corrects`, resolução e transições preserva adequadamente o histórico?
5. Está claro que `established`, `confirmed`, `rejected` e `validated` respondem a perguntas diferentes e não implicam auditoria independente?
6. A conclusão explica adequadamente a diferença entre data da correção da ABVE e data do aceite do ChargeBR?
7. Está correto manter explícita a reconstrução da primeira edição e não tratá-la como captura integral?
8. Os limites reconhecem corretamente que o ciclo ainda não validou `superseded`, cadeias longas, revisão metodológica ou automação?
9. Uma revisão metodológica quantitativa, limitada a distinguir `superseded` de `rejected`, é a próxima capacidade adequada?
10. As interrupções impedem chamar de revisão metodológica uma correção material, nova medição, atualização de cobertura ou simples publicação posterior?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 8 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a conclusão e não solicitou correções. O PR está liberado para merge. O sétimo ciclo só poderá começar depois que esta versão aceita estiver incorporada à `main`.
