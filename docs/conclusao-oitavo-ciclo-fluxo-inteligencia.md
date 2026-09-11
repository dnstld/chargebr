# Conclusão do oitavo ciclo do fluxo de inteligência

## Estado

`AGUARDANDO REVISÃO`

Este documento avalia o oitavo ciclo depois da decisão, da implementação do primeiro contrato de leitura, dos ensaios de bloqueio, da revisão e do merge do PR #87. Ele não cria outra consulta, não altera o schema e não modifica dados ou permissões no Supabase.

## Resultado geral

O oitavo ciclo atingiu seu objetivo: o ChargeBR consegue transformar registros canônicos com história metodológica em uma saída de leitura reproduzível, sem esconder o critério anterior, confundir vigência com validade ou apresentar um número principal quando faltam condições críticas.

Para a métrica ABVE de janeiro de 2025, o contrato `chargebr-methodology-reading-v1` produz três leituras complementares:

| Ordem | Projeção | Pergunta respondida | Resultado central |
| ---: | --- | --- | --- |
| 1 | `current_methodology` | Qual valor representa o período segundo a metodologia vigente? | `12556` como `primary` |
| 2 | `as_published` | O que a ABVE publicou para o mesmo recorte? | `12556`, `16502` e o contexto de `3946` MHEV |
| 3 | `methodology_comparison` | O que mudou entre os critérios? | MHEV passa de `included` para `reported_separately` |

O resultado permite considerar **validado o primeiro contrato interno e somente de leitura para comunicar valor, método, papel, escopo, proveniência e limitações como uma unidade inseparável**.

## Trilha completa do ciclo

O ciclo foi dividido em etapas independentes e revisáveis:

1. a [conclusão do sétimo ciclo](conclusao-setimo-ciclo-fluxo-inteligencia.md) identificou a necessidade de uma leitura segura para as metodologias já persistidas;
2. a [decisão do oitavo ciclo](decisao-oitavo-ciclo-fluxo-inteligencia.md) definiu o escopo fixo, as três projeções, os bloqueios e os controles de segurança e desempenho;
3. a [consulta de leitura](../queries/0001_abve-eletrificados-janeiro-2025.read.sql) implementou uma base canônica comum para as três projeções;
4. a [consulta de verificação](../queries/0001_abve-eletrificados-janeiro-2025.verify.sql) conferiu os fatos esperados de forma independente;
5. o [pacote de revisão](revisao-contrato-leitura-0001.md) registrou a saída normal, os ensaios de bloqueio, a repetibilidade e o plano de execução;
6. Denis Toledo aceitou integralmente o contrato em 11 de setembro de 2026;
7. o PR #87 incorporou os arquivos à `main` no commit `7788572`.

Nenhuma etapa posterior antecipou o aceite da etapa anterior.

## Critérios de sucesso

| Critério da decisão | Evidência | Resultado |
| --- | --- | --- |
| Uma consulta produz as três projeções | O arquivo `read.sql` retornou três linhas ordenadas | Atendido |
| Metodologia vigente derivada | `applies_from`, `supersedes` e data efetiva determinam a versão corrente | Atendido |
| Um único resultado principal | `12556` é o único `primary`, `validated` e `source_published` do método vigente | Atendido |
| Contrafactual permanece visível | `16502` aparece em `as_published` e na comparação | Atendido |
| Componentes consultáveis | Dez componentes preservam os dois tratamentos de MHEV | Atendido |
| Proveniência acompanha os valores | Fonte, publicação, evidência e acontecimento verificado aparecem no `payload` | Atendido |
| Autoria dos números preservada | A saída identifica os dois totais como publicados pela ABVE | Atendido |
| Ambiguidade bloqueia a resposta | Ensaios retornaram uma linha `blocked`, `payload: null` e nenhum número principal | Atendido |
| Conteúdo e cardinalidade determinísticos | Duas execuções normais produziram conteúdo idêntico | Atendido |
| Desempenho registrado | `EXPLAIN (ANALYZE, BUFFERS)` concluiu em 7,368 ms | Atendido |
| Ausência de exposição ou escrita | Nenhuma view, migration, dado, policy ou permissão foi alterado | Atendido |
| Mensagens em PT-BR reconstruíveis | As três mensagens de aceitação usam somente campos retornados | Atendido |
| Pacote revisado e aceito | O documento registrou `ACCEPTED` e foi incorporado pelo PR #87 | Atendido |

Os treze critérios do oitavo ciclo foram atendidos.

## O que foi validado

O oitavo ciclo acrescenta às capacidades anteriores:

1. localizar uma métrica por chave estável e conferir seu escopo completo;
2. derivar a metodologia vigente para uma data sem coluna `is_current`;
3. impedir que recência, maior identificador ou maior valor funcionem como critério editorial oculto;
4. selecionar o resultado principal pela combinação de método, papel, origem e situação;
5. preservar todos os valores publicados para o mesmo recorte;
6. distinguir um contrafactual publicado de uma correção ou cálculo próprio;
7. apresentar uma observação quantitativa como contexto sem inventar outro `metric_value`;
8. comparar versões, componentes, valores e relações em ordem histórica;
9. carregar fonte, publicação, evidência e nível de verificação junto de cada número;
10. exigir proveniência completa antes de liberar a apresentação;
11. detectar ciclos e cardinalidades incompatíveis com o caso aceito;
12. substituir uma resposta incompleta por uma linha de controle estruturada;
13. produzir JSON determinístico com ordenação explícita;
14. agregar os conjuntos no PostgreSQL sem exigir uma consulta por valor ou componente;
15. verificar o estado canônico por uma segunda consulta independente;
16. provar o comportamento normal e falhas simuladas sem modificar o banco.

Essas capacidades foram validadas para o escopo fixo do caso `0007`. Elas não tornam automaticamente o contrato genérico para qualquer métrica.

## Significado das três projeções

| Projeção | O que autoriza comunicar | O que não autoriza |
| --- | --- | --- |
| `current_methodology` | O resultado principal sob o método vigente no período | Omitir que a composição depende de uma classificação |
| `as_published` | Todos os valores da fonte para o recorte, com seus papéis | Tratar todo número publicado como resultado principal |
| `methodology_comparison` | A mudança de regras, componentes e vigência | Chamar a metodologia anterior de erro factual |

As projeções não são três verdades concorrentes. Elas respondem a perguntas diferentes sobre o mesmo conjunto canônico.

## A regra de bloqueio foi validada

O contrato não tenta produzir a melhor resposta possível quando uma condição crítica falha. Ele troca as três projeções por uma única linha:

```text
projection_type: control
projection_order: 0
projection_status: blocked
payload: null
blockers: [códigos estruturados]
```

Foram exercitados três defeitos:

| Ensaio | Código central observado | Resultado |
| --- | --- | --- |
| Métrica inexistente | `METRIC_NOT_FOUND` | Uma linha bloqueada |
| Mais de uma metodologia corrente | `CURRENT_METHODOLOGY_NOT_UNIQUE` | Uma linha bloqueada |
| Proveniência insuficiente | `PROVENANCE_INCOMPLETE` | Uma linha bloqueada |

Um defeito pode produzir mais de um código porque a ausência de uma peça pode quebrar condições dependentes. Os códigos são diagnósticos acumuláveis, não categorias mutuamente exclusivas. Para o consumidor, qualquer array não vazio significa que nenhuma projeção deve ser apresentada como completa.

## Proveniência como caminho, não como rótulo

O caso demonstrou que a fonte pode estar ligada diretamente à evidência ou ao item de conteúdo de origem. A consulta acompanha os dois caminhos:

```text
valor
  → observação
  → evidência
  → publicação
  → fonte ABVE
  → acontecimento aceito e verificado
```

Isso evita exigir duplicação do identificador da fonte em cada evidência sem perder a capacidade de comprovar quem publicou.

A relação da evidência com o acontecimento também importa:

- evidências diretas dos valores exigem `supports`;
- o contexto de MHEV pode usar `contextualizes`;
- em ambos os casos, origem, publicação, fonte e acontecimento aceito continuam obrigatórios.

Um rótulo genérico como “fonte oficial” não seria suficiente para reconstruir essa cadeia.

## Metodologia vigente é uma conclusão temporal

A metodologia corrente não foi gravada como estado permanente. Para o período solicitado, a consulta:

1. reúne as versões da métrica;
2. exclui versões cujo início conhecido seja posterior ao período;
3. percorre as relações de substituição;
4. aplica somente relações efetivas até o início do período;
5. exige um único método restante.

Essa regra permite que uma metodologia seja histórica para janeiro de 2025 e continue corretamente associada a valores ou períodos anteriores. Uma coluna global `is_current` não conseguiria responder sozinha qual método valia em cada data.

## Comunicação ao usuário final

O ciclo demonstrou que o banco já contém informação suficiente para produzir textos precisos sem inventar fatos externos.

### Resultado vigente

> A ABVE registrou 12.556 emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025 segundo a classificação vigente desde aquele mês. O total inclui BEV, PHEV, HEV e HEV Flex; MHEV são publicados separadamente.

### História publicada

> A ABVE publicou 12.556 como resultado principal pela classificação vigente e informou que o mesmo mês teria 16.502 pelo critério anterior, que incluía MHEV.

### Explicação da diferença

> A diferença decorre do tratamento metodológico de MHEV. A publicação informa 3.946 MHEV separadamente. O ChargeBR não recalculou os totais nem classificou o valor anterior como erro.

O contrato fornece os elementos, mas não obriga todas as interfaces a usar uma única frase. Uma apresentação pode resumir ou detalhar desde que preserve valor, período, método, papel, origem e limitações.

## Aprendizados metodológicos

### Completude vem antes do número

Uma aplicação não deve receber `12556` como resposta principal e descobrir depois que a metodologia ou a proveniência estava ambígua. O bloqueio no nível do contrato reduz o risco de uma camada consumidora ignorar avisos secundários.

### “Como publicado” não é sinônimo de “vigente”

`16502` foi realmente publicado pela ABVE, mas sob o papel contrafactual e a metodologia anterior. Preservar o valor não exige promovê-lo a resultado corrente; escolher `12556` como principal não autoriza esconder `16502` da história publicada.

### Contexto quantitativo não precisa virar métrica

`3946` explica a diferença e pode aparecer na comunicação porque a observação e sua proveniência são consultáveis. Criar um terceiro `metric_value` apenas para facilitar a tela teria ampliado o modelo sem necessidade demonstrada.

### Bloqueios acumulados ajudam a corrigir a causa completa

Quando a métrica não existe, também não pode haver método corrente ou valor principal. Retornar todos os códigos aplicáveis oferece diagnóstico mais completo, desde que o consumidor trate o conjunto inteiro como bloqueio e não tente escolher qual erro ignorar.

## Aprendizados operacionais

### Uma base comum evita divergência entre projeções

As três linhas compartilham os mesmos CTEs de escopo, método, valor e proveniência. Assim, uma alteração na regra crítica não precisa ser copiada manualmente para três consultas independentes.

### Ordenação faz parte do contrato

Valores, metodologias, componentes, evidências, relações e projeções possuem ordem explícita. Duas execuções produziram conteúdo idêntico, condição necessária para testes, cache futuro e comparação de resultados.

### Verificação independente reduz falso positivo

O arquivo `verify.sql` não aceita a saída apenas porque ela possui o formato esperado. Ele consulta novamente os fatos canônicos: valores, papéis, métodos, componentes, relação, evidências, contexto e ausência de ciclo.

### O plano atual não justifica otimização estrutural

A consulta executou em 7,368 ms, sem leitura de blocos do disco ou uso de armazenamento temporário. Os índices existentes foram usados nos pontos seletivos; leituras sequenciais de tabelas minúsculas são adequadas ao volume atual.

Não há evidência para criar índice, materialized view ou cópia pré-agregada nesta etapa.

## Simplificações que funcionaram

- uma única consulta SQL produziu as três projeções;
- um escopo fixo evitou generalização prematura;
- o envelope externo permaneceu igual para sucesso e bloqueio;
- JSON aninhado preservou a cadeia completa sem multiplicar linhas para o consumidor;
- o papel `primary` distinguiu o resultado vigente;
- o papel `counterfactual` preservou a comparação da fonte;
- `3946` permaneceu observação contextual;
- a relação `supersedes` determinou vigência sem `is_current`;
- doze códigos estruturados cobriram as interrupções previstas;
- três variações descartáveis provaram bloqueios sem escrita;
- uma consulta independente verificou quatorze condições;
- o plano foi medido antes de qualquer proposta de otimização.

Essas simplificações devem ser mantidas enquanto novos casos ou consumidores não demonstrarem uma necessidade diferente.

## Correção documental incorporada

O PR #87 corrigiu a granularidade geográfica descrita na revisão da carga `0007` de `country` para `national`.

`national` é o valor permitido pelo schema e persistido na definição da métrica. A correção foi exclusivamente documental e não alterou o banco ou o significado do caso.

## Limites do que foi provado

O ciclo ainda não validou:

- parametrização do contrato para outras métricas ou períodos;
- comportamento diante de cadeias com três ou mais metodologias;
- metodologias paralelas sem relação `supersedes`;
- um método com mais de um sucessor;
- leitura conjunta de revisão metodológica e correção material;
- leitura do histórico de transições da carga `0006` no mesmo envelope;
- backfill metodológico das cargas `0001` a `0006`;
- contrato público estável ou garantia de compatibilidade entre versões;
- papel de usuário, autenticação ou autorização para consumir a consulta;
- view com `security_invoker`, função SQL ou endpoint de servidor;
- RLS de leitura para um consumidor não administrativo;
- controle de tamanho do `payload` para séries longas;
- paginação, cache, limite de uso ou observabilidade;
- interface, gráfico, tabela ou texto gerado automaticamente;
- auditoria independente da base da ABVE;
- cálculo derivado pelo ChargeBR;
- resolução do conflito `21061` versus `21060` da carga `0005`;
- retomada da carga `0004`;
- automação, alerta ou produto público.

Uma consulta correta quando executada administrativamente não prova que seja seguro expor as tabelas ou uma chave privilegiada ao cliente.

## Próxima capacidade proposta

O nono ciclo deverá decidir **a menor fronteira segura de exposição interna para um consumidor usar o contrato sem acesso administrativo às tabelas**.

O objetivo não será ainda publicar uma interface. Será definir onde a consulta deve executar, qual identidade poderá chamá-la e qual formato versionado atravessará a fronteira entre banco e aplicação.

A decisão deverá comparar pelo menos:

1. execução no servidor da aplicação com credencial mantida somente no servidor;
2. view com `security_invoker`, RLS e permissões mínimas;
3. função ou RPC somente de leitura com privilégios explicitamente controlados.

A decisão não deverá escolher uma opção por familiaridade. Ela deverá avaliar:

- quais tabelas o consumidor realmente precisa acessar;
- se o consumidor precisa de acesso direto ao banco;
- como impedir uso de `service_role` no navegador;
- como manter o envelope `chargebr-methodology-reading-v1` estável;
- como representar `blocked` sem transformar o erro em resposta parcial;
- como testar RLS e permissões com papéis reais;
- como auditar chamadas sem registrar conteúdo sensível desnecessário;
- como medir tamanho e tempo da resposta;
- como versionar mudanças incompatíveis;
- como evitar que uma interface refaça a regra de vigência por conta própria.

O primeiro teste deverá continuar limitado ao contrato `0001`. Generalizar simultaneamente para outras métricas misturaria segurança, arquitetura e semântica em um único passo.

## Por que a fronteira vem antes da interface

Hoje, a consulta funciona no fluxo administrativo autorizado. Uma aplicação pública não pode receber a credencial administrativa nem acesso irrestrito às tabelas.

Construir a tela primeiro criaria duas pressões perigosas:

- expor mais dados e privilégios do que o necessário para fazê-la funcionar;
- copiar a seleção de metodologia e bloqueios para o código visual.

Uma fronteira revisada permitirá que a futura interface consuma somente o contrato, sem conhecer identificadores internos, refazer joins ou decidir silenciosamente qual número mostrar.

## Interrupções necessárias no próximo ciclo

O nono ciclo deverá parar quando:

- qualquer opção exigir colocar `service_role` ou segredo equivalente no navegador;
- uma view puder contornar RLS por propriedade ou privilégio implícito;
- o papel consumidor receber acesso direto a tabelas que não precisa consultar;
- a resposta pública puder ignorar `projection_status: blocked`;
- a implementação duplicar a regra de seleção da metodologia na aplicação;
- for necessário tornar o contrato genérico antes de definir o consumidor concreto;
- testes de permissão não puderem ser executados com o mesmo papel que será usado;
- uma mudança estrutural for necessária sem migration e revisão próprias;
- a solução depender de `security definer` sem justificativa e controle explícitos;
- uma alteração no contrato quebrar consumidores sem nova versão;
- o teste introduzir interface pública, conta de usuário ou cobrança;
- qualquer dado ou resultado anterior deixar de permanecer protegido.

Uma interrupção deverá produzir uma decisão explícita, não uma ampliação silenciosa de privilégios.

## O que permanece fora da próxima etapa

- interface pública completa;
- implantação em produção de site ou aplicativo;
- acesso anônimo antes de decisão e teste próprios;
- autenticação, conta de usuário ou painel administrativo;
- newsletter, alerta ou produto pago;
- parametrização para todas as métricas;
- backfill das cargas anteriores;
- novo caso canônico;
- cálculo, tendência ou indicador derivado;
- recálculo histórico;
- captura automática de publicações;
- resolução do conflito da carga `0005`;
- retomada forçada da carga `0004`;
- migração do Notion.

## Perguntas para revisão

1. Os treze critérios de sucesso do oitavo ciclo foram atendidos?
2. Está correto concluir que as três projeções respondem a perguntas diferentes sobre o mesmo conjunto canônico?
3. A consulta deriva adequadamente a metodologia vigente sem usar recência, maior identificador ou `is_current`?
4. Está correto apresentar `12556` como principal, preservar `16502` como contrafactual e manter `3946` como contexto?
5. A cadeia de proveniência identifica suficientemente fonte, publicação, evidência e acontecimento verificado?
6. Está correto aceitar `contextualizes` para o contexto, mantendo `supports` como requisito da evidência direta dos valores?
7. A linha única `blocked`, com `payload: null`, impede adequadamente uma apresentação principal parcial?
8. Está claro que os códigos de bloqueio podem ser acumulados e não são categorias exclusivas?
9. A verificação independente, a repetibilidade e o plano de execução sustentam a conclusão do ciclo?
10. Os limites deixam claro que o contrato ainda é fixo, administrativo e não constitui acesso público?
11. Uma fronteira segura de exposição interna é a próxima capacidade adequada antes de construir uma interface?
12. Está correto manter o nono ciclo restrito ao contrato `0001`, sem generalizar métricas e sem criar produto público ao mesmo tempo?
13. As interrupções impedem exposição de credencial privilegiada, contorno de RLS e duplicação das regras semânticas na aplicação?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A conclusão não deve ser incorporada antes do aceite.
