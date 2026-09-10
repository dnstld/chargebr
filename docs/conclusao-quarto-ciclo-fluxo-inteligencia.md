# Conclusão do quarto ciclo do fluxo de inteligência

## Estado

`PROPOSTA — EM REVISÃO`

Este documento avalia o quarto ciclo depois da seleção, da persistência, da revisão e do merge da carga canônica `0004`. Ele não cria outra carga, não altera o schema, não modifica dados no Supabase e não autoriza cálculos ou automação.

## Resultado geral

O quarto ciclo atingiu seu objetivo: a definição aprovada `monthly-light-bev-registrations-brazil` foi reutilizada para acrescentar um segundo mês, sem duplicar a definição e sem modificar o valor, a observação ou a proveniência de julho.

O banco preserva agora:

| Período | Valor | Situação | Carga |
| --- | ---: | --- | --- |
| Julho de 2026 | `25782` | `validated` | `0003` |
| Agosto de 2026 | `27166` | `validated` | `0004` |

Cada valor possui observação e proveniência próprias. Ambos usam a mesma unidade `vehicle_registration`, a mesma geografia nacional e a mesma definição de métrica, mas permanecem medições independentes de meses civis distintos.

O resultado permite considerar **validado o fluxo manual mínimo para estender por um período uma série canônica existente, reutilizando com segurança sua definição, fonte e organização**. Ele não demonstra comparabilidade indefinida da série, estabilidade futura da metodologia, tendência, crescimento ou qualquer outro cálculo derivado.

## Trilha completa do ciclo

O quarto ciclo foi dividido em etapas independentes e revisáveis:

1. a [decisão do quarto ciclo](decisao-quarto-ciclo-fluxo-inteligencia.md) limitou a dificuldade à reutilização canônica para um segundo período;
2. a seleção foi interrompida quando ainda não existia publicação elegível para um mês posterior;
3. a [seleção da carga `0004`](selecao-carga-canonica-0004.md) foi retomada depois que a ABVE Data publicou o resultado de agosto;
4. o [pacote de revisão](revisao-carga-canonica-0004.md) definiu a carga idempotente, a consulta reutilizável e os controles de integridade;
5. a [carga executada](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.sql) persistiu exatamente o pacote aceito e incorporado à `main`;
6. a [consulta reutilizável](../data/canonical/0004_abve-bev-emplacamentos-agosto-2026.verify.sql) confirmou o estado `complete`;
7. o [resultado da persistência](resultado-carga-canonica-0004.md) recebeu `ACCEPTED` e foi incorporado pelo PR #78.

Nenhuma etapa antecipou o aceite da etapa anterior. A interrupção inicial permaneceu visível e a retomada foi motivada por nova evidência primária, não por relaxamento dos critérios.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Revisão humana do novo valor e de seu recorte | Denis Toledo registrou `ACCEPTED` na seleção, no pacote e no resultado | Atendido |
| Correspondência integral da definição, da fonte e da organização | O SQL comparou todos os campos relevantes antes da reutilização | Atendido |
| Arquivo aprovado na `main` antes da execução | Os arquivos executados no commit `253bd6a` eram idênticos aos aceitos | Atendido |
| Novo acontecimento ligado à própria evidência | O acontecimento 110 possui vínculo `supports` com a evidência 95 | Atendido |
| Novo valor ligado à própria observação e à definição existente | O valor 32 liga a observação 95 à definição 8 | Atendido |
| Julho e agosto reconstruíveis separadamente | A consulta retornou `[25782, 27166]` em duas observações e dois períodos | Atendido |
| Preservação integral do valor de julho | A assinatura anterior permaneceu `a5e325a3f0eb2bde724949b4f4bba322` | Atendido |
| Preservação das demais cargas anteriores | A mesma assinatura protegeu o estado aceito anterior à `0004` | Atendido |
| Ausência de duplicata, piloto, derivação ou mudança estrutural | Registros únicos, zero identificadores de piloto e 16 migrations | Atendido |
| Mesma consulta antes e depois | O arquivo reutilizável retornou `absent` antes e `complete` depois do `COMMIT` | Atendido |
| Execução e contagens documentadas e aceitas | O resultado recebeu `ACCEPTED` e foi incorporado pelo PR #78 | Atendido |

Os onze critérios da decisão do quarto ciclo foram atendidos.

## O que foi validado

O quarto ciclo acrescenta às capacidades anteriores:

1. reutilizar uma definição de métrica somente depois de confirmar sua identidade e sua semântica completas;
2. reutilizar fonte e organização existentes sem confundir seus papéis nem criar duplicatas;
3. acrescentar um novo mês civil por nova observação, nova evidência, novo acontecimento e novo valor;
4. preservar o período medido no valor e a data da publicação no acontecimento;
5. agrupar julho e agosto pela mesma definição sem criar uma relação artificial entre os valores;
6. comprovar que o novo mês não atualiza nem substitui silenciosamente o mês anterior;
7. reconstruir uma série curta ordenada por período mantendo a proveniência individual de cada ponto;
8. excluir percentuais, acumulados, outras tecnologias e interpretações que não pertencem ao recorte;
9. interromper o ciclo diante da ausência de evidência elegível e retomá-lo quando uma fonte primária passa a satisfazer os mesmos requisitos;
10. executar um ciclo retomado sobre um banco que já contém cargas posteriores, protegendo integralmente todo o estado anterior.

Essas regras validam a inclusão manual de um segundo ponto compatível. Elas não autorizam incorporar automaticamente toda publicação posterior da ABVE Data.

## Significado dos estados usados

| Estado | Pergunta respondida | O que não significa |
| --- | --- | --- |
| Evidência `established` | A origem exata da observação de agosto é conhecida? | Que outra instituição confirmou o número |
| Acontecimento `confirmed` | A publicação primária sustenta o acontecimento registrado? | Que a base subjacente foi auditada independentemente |
| Valor `validated` | Valor, unidade, período, geografia e proveniência foram revisados? | Que qualquer comparação com outro mês já foi validada |

A reutilização da definição não altera esses significados. Dois valores `validated` não tornam automaticamente validado o crescimento entre eles.

## Aprendizados metodológicos

### Continuidade estrutural não é análise de tendência

Dois valores ordenados no tempo já formam uma série estrutural consultável, mas são insuficientes para afirmar tendência. O ciclo demonstrou que julho e agosto podem ser armazenados sob a mesma definição; não demonstrou que dois pontos descrevem uma direção persistente do mercado.

Também não foi persistido o crescimento de `5,4%` apresentado pela publicação. Qualquer variação futura deverá distinguir:

- valor publicado pela fonte;
- cálculo reproduzido pelo ChargeBR;
- fórmula, precisão e política de arredondamento;
- versões metodológicas usadas em cada período.

### A definição compartilhada estabelece compatibilidade limitada

Julho e agosto satisfazem a mesma definição aprovada: objeto, tecnologia, unidade, geografia, agregação e granularidade coincidem. Isso autoriza agrupá-los nesta série, mas não prova que a metodologia da fonte permanecerá estável em todos os meses futuros.

Cada novo valor ainda exige confirmação de compatibilidade. Se a classificação, a cobertura ou o método mudar, o ChargeBR deverá preservar essa mudança em vez de forçar o valor novo na definição antiga.

### Cada ponto mantém sua própria proveniência

A definição identifica o significado comum da série. Ela não substitui a publicação, a observação e a evidência de cada mês.

Essa separação permite corrigir, revisar ou explicar um período específico no futuro sem reescrever todos os demais pontos. Também permite ao usuário distinguir o que foi publicado em julho do que foi publicado em agosto.

## Aprendizados operacionais

### Interromper foi um resultado correto

O ciclo não encontrou inicialmente uma publicação que satisfizesse todos os requisitos e foi interrompido. A ausência de carga naquele momento evitou preencher a série com número acumulado, categoria incompatível ou evidência insuficiente.

A publicação de 9 de setembro de 2026 permitiu retomar a seleção mantendo os critérios originais. Isso demonstrou que uma interrupção pode preservar a qualidade metodológica sem encerrar definitivamente o ciclo.

### A numeração das cargas não determina a ordem de execução

Enquanto a `0004` aguardava evidência, as cargas `0005` e `0006` foram concluídas. Por isso, a `0004` foi validada e executada depois delas.

O pacote não presumiu que o banco ainda estivesse no estado existente após a `0003`. Ele verificou o estado real, protegeu as cargas já persistidas e acrescentou somente seus próprios registros. A numeração identifica o ciclo lógico; commits, assinaturas e verificações documentam a ordem efetiva.

### Identificadores estáveis continuam sendo o controle principal

Ensaios com `ROLLBACK` e inserções idempotentes podem consumir números das sequências internas sem deixar linhas no banco. Por isso, continuidade e integridade são verificadas por chaves estáveis, restrições, contagens, períodos, vínculos e assinaturas — não pela aparência consecutiva dos IDs.

## Simplificações que funcionaram

- uma definição existente agrupou os dois meses sem nova estrutura de série;
- fonte e organização foram reutilizadas por identidade integral;
- cada mês recebeu uma única observação e uma única evidência;
- períodos distintos bastaram para ordenar os valores;
- nenhum vínculo direto entre valores foi necessário;
- a mesma consulta representou `absent` antes e `complete` depois;
- a carga idempotente falhou diante de conteúdo incompatível, sem atualizar conflitos;
- a assinatura protegeu o banco real, inclusive cargas concluídas durante a interrupção da `0004`;
- execução, hashes e resultado permaneceram em documentos revisáveis separados.

Essas simplificações devem permanecer enquanto casos reais não demonstrarem necessidade adicional.

## Limites do que foi provado

O ciclo ainda não validou:

- três ou mais períodos na mesma série;
- comparabilidade de longo prazo;
- mudança de classificação, cobertura ou metodologia entre períodos;
- versão metodológica ligada estruturalmente a cada valor;
- identificação automática da metodologia vigente;
- valor recalculado pelo ChargeBR;
- fórmula, entradas, arredondamento ou linhagem de cálculo derivado;
- crescimento mensal ou anual;
- soma, acumulado, participação, média, razão ou tendência;
- preenchimento de mês ausente;
- revisão, correção ou substituição de um valor desta série;
- coleta recorrente, monitoramento, escala ou automação;
- interface pública, newsletter, alerta ou produto pago.

Dois pontos compatíveis demonstram extensão controlada, não uma política completa para séries temporais.

## Relação com os ciclos posteriores

O quinto e o sexto ciclos foram concluídos enquanto o quarto estava interrompido. Seus resultados não dependem desta conclusão e não são reabertos por ela.

O sétimo ciclo também já possui uma [decisão aceita](decisao-setimo-ciclo-fluxo-inteligencia.md) e uma [seleção metodológica aceita](selecao-revisao-metodologica-0007.md). O caso `0007` demonstra justamente um limite que a continuidade simples da `0004` não resolve: dois valores podem pertencer ao mesmo conceito geral e ainda depender de versões diferentes da metodologia.

Portanto, concluir o quarto ciclo não cria um novo quinto ciclo nem altera a sequência já registrada. Apenas fecha a capacidade que havia permanecido pendente e devolve o trabalho ao ponto atualmente aprovado do sétimo ciclo.

## Próxima etapa proposta

Depois do aceite e do merge desta conclusão, preparar uma decisão separada de modelagem para o caso `0007`.

Essa decisão deverá comparar o caso selecionado com o schema atual e definir a menor representação capaz de separar:

- conceito da métrica;
- versão metodológica;
- vigência da metodologia;
- validade factual do valor;
- papel documental do valor;
- valores publicados e valores calculados pelo ChargeBR;
- consulta pela metodologia atual e consulta histórica “como publicado”.

Nenhum SQL da carga `0007` deverá ser preparado antes dessa decisão e de qualquer mudança estrutural que ela demonstre ser necessária.

## Perguntas para revisão

1. Os onze critérios de sucesso do quarto ciclo foram atendidos?
2. A conclusão limita corretamente o resultado à extensão manual de uma série por um segundo período compatível?
3. Está correto afirmar que dois valores `validated` sob a mesma definição não validam automaticamente crescimento, tendência ou comparabilidade futura?
4. A reutilização integral da definição, da fonte e da organização, com proveniência própria para cada mês, preserva adequadamente identidade e contexto?
5. A conclusão explica corretamente por que a interrupção inicial e a retomada posterior fortaleceram, em vez de enfraquecer, o fluxo?
6. Está correto tratar a numeração `0004` como identidade lógica, sem fingir que sua execução ocorreu antes das cargas `0005` e `0006`?
7. Os limites reconhecem corretamente que o ciclo não validou mudança metodológica, cálculo derivado, escala ou produto público?
8. Está correto manter o quinto e o sexto ciclos encerrados, sem reabri-los por causa da conclusão posterior da `0004`?
9. A decisão de modelagem do caso metodológico `0007` é a próxima etapa adequada, considerando que sua seleção já foi aceita e incorporada?
10. Está correto impedir a preparação de SQL da `0007` antes dessa decisão e de eventual mudança estrutural própria?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
