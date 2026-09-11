# Decisão: nono ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento propõe como o ChargeBR escolherá a menor fronteira segura para um consumidor interno usar o contrato `chargebr-methodology-reading-v1`. Ele não escolhe definitivamente uma arquitetura, não cria aplicação, view, função, endpoint ou credencial e não altera schema, dados, RLS, permissões ou configuração do Supabase.

## Contexto

O [oitavo ciclo](conclusao-oitavo-ciclo-fluxo-inteligencia.md) validou uma consulta SQL somente de leitura para o caso metodológico `0007`. O contrato:

- retorna três projeções complementares;
- determina a metodologia vigente sem usar um estado global `is_current`;
- preserva o valor contrafactual e o contexto publicado;
- acompanha cada número com sua proveniência;
- bloqueia a resposta inteira quando uma condição crítica falha;
- produz conteúdo determinístico e verificável.

Essa consulta foi validada em execução administrativa autorizada. Ainda não existe uma fronteira que permita a uma aplicação consumi-la sem acesso administrativo às tabelas.

O próximo problema não é visual. É decidir **onde a consulta será executada, com qual identidade e quais privilégios, e qual resultado poderá atravessar a fronteira entre banco e aplicação**.

## Objetivo do nono ciclo

O nono ciclo comparará três alternativas e registrará uma seleção fundamentada para o primeiro consumidor interno:

1. execução no servidor da aplicação por conexão direta ao PostgreSQL;
2. view com `security_invoker`, RLS e privilégios mínimos;
3. função ou RPC somente de leitura com privilégios explicitamente controlados.

A seleção deverá demonstrar segurança e fidelidade semântica com ensaios reproduzíveis. Somente uma etapa posterior, em outro PR, poderá implementar a alternativa aceita.

## Consumidor concreto

O consumidor deste ciclo será:

```text
backend interno do ChargeBR
```

Ele não será:

- navegador;
- visitante anônimo;
- usuário autenticado do produto;
- ferramenta de terceiros;
- cliente com acesso direto às tabelas;
- interface pública.

Definir esse consumidor evita avaliar privilégios abstratos ou ampliar o acesso para públicos ainda inexistentes.

## Escopo fixo

| Dimensão | Escopo do ciclo |
| --- | --- |
| Contrato | `chargebr-methodology-reading-v1` |
| Consulta | `queries/0001_abve-eletrificados-janeiro-2025.read.sql` |
| Verificação | `queries/0001_abve-eletrificados-janeiro-2025.verify.sql` |
| Caso canônico | carga `0007` |
| Métrica | emplacamentos mensais de veículos leves eletrificados no Brasil |
| Período | janeiro de 2025 |
| Consumidor | backend interno do ChargeBR |
| Operações autorizadas | somente a leitura necessária para produzir o contrato |

O ciclo não parametrizará a consulta para outras métricas e não criará um contrato público genérico.

## Estado de segurança observado antes da decisão

Em 11 de setembro de 2026, uma inspeção somente de leitura encontrou:

| Verificação | Estado observado |
| --- | --- |
| Versão do PostgreSQL | `17.6` |
| Tabelas no schema `public` | `21` |
| Tabelas com RLS habilitada | `21` |
| Grants de tabela para `anon` | nenhum |
| Grants de tabela para `authenticated` | nenhum |
| Views no schema `public` | nenhuma |
| Papel `service_role` | possui `BYPASSRLS` |
| Aplicação no repositório | ainda não existe |

A lista de schemas expostos pela Data API não pôde ser confirmada pela sessão SQL. Qualquer alternativa que use a Data API deverá conferir e registrar essa configuração antes de ser aceita.

O estado atual é uma linha de base, não uma autorização. O objetivo é preservar a ausência de acesso público enquanto se cria somente a capacidade interna necessária.

## Contrato que não pode mudar silenciosamente

A alternativa selecionada deverá entregar exatamente o envelope já validado:

| Campo | Obrigação |
| --- | --- |
| `contract_version` | permanecer `chargebr-methodology-reading-v1` |
| `projection_type` | preservar os tipos e seus significados |
| `projection_order` | manter a ordem determinística |
| `projection_status` | retornar `complete` ou `blocked` conforme o contrato |
| `payload` | não remover método, papel, escopo, proveniência ou limitações |
| `blockers` | preservar códigos estruturados e bloquear resposta parcial |

No sucesso, devem existir exatamente três linhas completas. Em uma falha crítica, deve existir exatamente uma linha de controle bloqueada, com `payload: null` e sem número principal parcial.

O backend não poderá reconstruir joins, decidir a metodologia vigente ou escolher o valor principal por conta própria. Ele apenas transportará e validará o envelope produzido pelo contrato.

## Identidade e privilégio mínimo

“Segredo mantido no servidor” e “privilégio mínimo” são propriedades diferentes.

Uma chave secreta pode estar corretamente fora do navegador e ainda assim possuir poderes excessivos. Em particular, `service_role` ignora RLS e não deve ser tratado como identidade de leitura mínima.

A opção selecionada deverá identificar concretamente:

- qual papel do PostgreSQL ou chave chamará a fronteira;
- onde o segredo ficará armazenado;
- quais objetos esse papel poderá acessar;
- quais operações serão negadas;
- se a identidade ignora RLS;
- como a credencial poderá ser rotacionada e revogada;
- como impedir sua presença no repositório, navegador, resposta e logs;
- como reproduzir os testes usando a mesma identidade do consumidor.

Se o ensaio só funcionar com `postgres`, `service_role` ou outro papel amplo, a alternativa não estará aprovada por isso. O ciclo deverá interromper e explicar a lacuna ou demonstrar uma identidade restrita adicional.

## Alternativa A — execução no servidor por conexão direta

### Forma

Um adaptador executaria a consulta validada no servidor da aplicação, usando uma conexão PostgreSQL que nunca chega ao navegador. A aplicação receberia somente as linhas do contrato.

### Vantagens a demonstrar

- reutilização do SQL completo já validado;
- nenhuma view ou função adicional exposta pela Data API;
- preservação do estado atual sem acesso de `anon` e `authenticated` às tabelas;
- sem duplicação da lógica semântica na aplicação;
- separação clara entre navegador e banco.

### Riscos e perguntas obrigatórias

- qual papel de banco poderá ler somente os objetos necessários;
- se a consulta de múltiplas tabelas exige grants excessivos;
- se o papel conseguirá escrever, executar DDL ou assumir outro papel;
- como limitar conexões, tempo, tamanho da resposta e uso de recursos;
- como rotacionar a credencial sem interromper o consumidor;
- se o ambiente de aplicação oferece conexão PostgreSQL adequada.

### Condição para permanecer candidata

Deve ser possível executar a consulta exata com uma identidade somente de servidor e demonstravelmente restrita. Usar uma credencial administrativa apenas porque o consumidor está no servidor não satisfaz a decisão.

## Alternativa B — view com `security_invoker`

### Forma

Uma view reuniria a lógica de leitura e, em PostgreSQL 15 ou posterior, usaria `security_invoker = true` para aplicar os privilégios e as políticas RLS do papel que a consulta.

### Vantagens a demonstrar

- objeto consultável com forma tabular conhecida;
- privilégios e RLS avaliados como o chamador;
- possibilidade de restringir o consumidor a uma interface estável;
- integração direta com a Data API, se essa for uma necessidade comprovada.

### Riscos e perguntas obrigatórias

- views não usam o comportamento de invocador por padrão;
- o chamador pode precisar de privilégios sobre objetos subjacentes;
- liberar tabelas de base apenas para a view funcionar pode permitir consultas diretas indesejadas;
- expor o schema `public` pode ampliar a superfície além da view;
- RLS por tabela pode tornar a solução extensa ou incoerente com um consumidor interno único;
- mudanças futuras na view podem alterar o contrato sem mudança de versão.

### Condição para permanecer candidata

O ensaio deverá provar, com o papel real, que o contrato funciona e que as tabelas de base continuam inacessíveis diretamente. Se isso exigir exposição ampla do schema ou grants diretos desnecessários, a alternativa deverá ser rejeitada ou redesenhada com um schema exposto dedicado e revisão própria.

## Alternativa C — função ou RPC somente de leitura

### Forma

Uma função SQL exporia somente a resposta do contrato e poderia ser chamada como RPC pela Data API ou diretamente pelo servidor.

### Vantagens a demonstrar

- ponto de entrada estreito;
- assinatura e versão explícitas;
- capacidade de encapsular a consulta sem liberar acesso direto às tabelas;
- resposta única para consumidores futuros, se isso for posteriormente necessário.

### Riscos e perguntas obrigatórias

- funções recebem permissão `EXECUTE` de `PUBLIC` por padrão no PostgreSQL;
- `SECURITY DEFINER` executa com privilégios do proprietário e amplia o impacto de uma implementação incorreta;
- `search_path`, propriedade, funções auxiliares e resolução de nomes precisam ser controlados;
- uma função com privilégios elevados pode contornar RLS;
- a Data API exige revisão dos schemas expostos e dos papéis autorizados;
- a função pode esconder uma mudança incompatível se não houver versionamento explícito.

### Condição para permanecer candidata

O ensaio deverá revogar `EXECUTE` de `PUBLIC` e dos papéis que não precisam chamar a função, conceder acesso somente ao consumidor escolhido e provar que nenhuma escrita ou leitura fora do envelope é possível. `SECURITY DEFINER` só poderá ser escolhido com justificativa específica, proprietário controlado, `search_path` seguro e testes negativos completos.

## Hipótese inicial, sem aprovação antecipada

A hipótese inicial é que a **alternativa A, execução no servidor por conexão direta**, seja a menor fronteira para o primeiro consumidor.

Ela parte de três fatos do escopo atual:

1. o contrato já existe como uma consulta SQL completa e validada;
2. o consumidor é exclusivamente um backend interno;
3. ainda não há necessidade demonstrada de expor uma view ou RPC pela Data API.

Essa preferência preservaria a superfície pública atual e evitaria criar um objeto de API antes de existir um consumidor público. Porém ela só será selecionada se o ensaio demonstrar uma identidade de banco restrita e operacionalmente viável. A decisão não autoriza o uso permanente de uma credencial administrativa.

Se a conexão direta não puder atingir privilégio mínimo, a comparação deverá favorecer a alternativa que encapsule melhor o contrato com menos acesso efetivo, mesmo que exija uma migration posterior.

## Método de seleção

O próximo artefato deverá preencher a mesma matriz para as três alternativas:

| Critério | Evidência exigida |
| --- | --- |
| Fidelidade semântica | saída normal idêntica à consulta aceita |
| Comportamento bloqueado | uma linha de controle e nenhum número parcial |
| Identidade | papel ou chave nomeados, com local de uso definido |
| Menor privilégio | lista explícita de acessos permitidos e negados |
| Isolamento do navegador | nenhum segredo ou acesso de banco no cliente |
| Proteção das tabelas | consultas diretas não necessárias continuam negadas |
| Somente leitura | tentativas de `INSERT`, `UPDATE`, `DELETE` e DDL falham |
| Superfície da Data API | schemas e objetos expostos conhecidos e mínimos |
| Revogação | credencial e grants removíveis sem alterar os dados |
| Observabilidade | falhas auditáveis sem registrar segredo ou payload sensível |
| Desempenho | tempo, plano e tamanho de resposta registrados |
| Reversibilidade | teste descartável e retorno ao estado inicial comprovados |
| Manutenção | uma única regra semântica, sem cópia no backend |
| Versionamento | mudança incompatível exige nova versão do contrato |

Cada avaliação deverá registrar `atende`, `não atende` ou `não demonstrado`, acompanhada da evidência correspondente. Uma preferência arquitetural sem ensaio não poderá receber `atende`.

## Ensaios obrigatórios

### Resultado e semântica

1. executar o contrato pela fronteira candidata;
2. comparar conteúdo e ordem com a saída administrativa aceita;
3. confirmar exatamente três linhas `complete` no caso normal;
4. repetir a execução e comparar o conteúdo integral;
5. simular os bloqueios já exercitados sem modificar permanentemente os dados;
6. confirmar uma única linha `blocked`, `payload: null` e nenhum número principal;
7. verificar a versão e o hash do SQL usado no ensaio.

### Permissões

1. executar com a identidade real do backend;
2. confirmar que a mesma identidade não consegue escrever;
3. confirmar que `anon` e `authenticated` não conseguem usar a fronteira;
4. confirmar que tabelas de base não se tornam consultáveis por consequência;
5. confirmar que o consumidor não pode acessar outras métricas ou registros fora do contrato fixo;
6. inspecionar grants, RLS, propriedade, `BYPASSRLS` e herança de papéis;
7. conferir os schemas expostos pela Data API quando ela fizer parte da alternativa;
8. verificar que nenhum segredo aparece no repositório, no cliente, na resposta ou nos logs do ensaio.

### Operação

1. registrar `EXPLAIN (ANALYZE, BUFFERS)` com dados sem segredos;
2. medir duração e tamanho da resposta;
3. definir timeout e limite de conexões aplicáveis;
4. descrever rotação e revogação da credencial;
5. executar verificações de segurança e desempenho do Supabase se houver DDL, função, view, policy ou grant;
6. reverter todo objeto ou privilégio descartável e conferir o estado final.

## Forma dos artefatos

O nono ciclo será dividido em etapas pequenas:

1. este documento decide o método de comparação;
2. `docs/selecao-fronteira-exposicao-0001.md` registra os ensaios, a matriz e a alternativa proposta;
3. a pessoa revisora aceita ou corrige a seleção;
4. somente depois do merge, outro PR decide a implementação concreta;
5. migration, adaptador ou configuração serão separados conforme a alternativa escolhida;
6. uma revisão final verificará o resultado com a identidade real.

O documento de seleção poderá usar objetos e papéis descartáveis em uma transação ou ambiente controlado, desde que nenhuma alteração permanente seja incorporada ao banco antes de uma decisão própria.

## Critérios de sucesso do nono ciclo

O ciclo estará concluído quando:

1. as três alternativas tiverem sido avaliadas pelos mesmos critérios;
2. o consumidor e sua identidade estiverem definidos sem ambiguidade;
3. a alternativa proposta reproduzir as três projeções e os bloqueios do contrato;
4. o backend não precisar reconstruir a lógica semântica;
5. nenhuma credencial administrativa ou segredo alcançar o navegador;
6. os acessos permitidos e negados tiverem sido testados com o papel real;
7. tabelas e dados fora do contrato permanecerem protegidos;
8. todas as operações de escrita tiverem sido negadas;
9. configuração da Data API, grants, RLS e propriedades relevantes estiverem documentados;
10. desempenho e tamanho da resposta tiverem sido medidos;
11. rotação, revogação e reversão estiverem definidas;
12. a seleção não criar interface pública nem generalizar o contrato;
13. nenhuma alteração permanente tiver sido feita antes de uma decisão aceita e versionada.

## Interrupções obrigatórias

O ciclo deverá parar quando:

- um segredo precisar ser enviado ao navegador;
- a única identidade viável possuir privilégios administrativos sem contenção demonstrada;
- uma alternativa depender de `service_role` como se fosse um papel de leitura mínima;
- tabelas de base precisarem ser liberadas diretamente ao consumidor sem necessidade;
- uma view puder executar com privilégios do proprietário sem decisão explícita;
- uma função conservar `EXECUTE` para `PUBLIC` ou papéis não autorizados;
- `SECURITY DEFINER` for necessário sem proprietário, `search_path` e grants controlados;
- a configuração dos schemas expostos pela Data API permanecer desconhecida para uma alternativa que dependa dela;
- a resposta puder ignorar `projection_status: blocked`;
- a aplicação precisar copiar ou reinterpretar a seleção metodológica;
- testes negativos não puderem usar a identidade real do consumidor;
- qualquer escrita permanente for necessária antes de decisão e migration próprias;
- a solução exigir generalizar o contrato ou criar uma interface pública neste ciclo.

Uma interrupção deverá resultar em uma lacuna documentada. Ela não autoriza ampliar privilégios silenciosamente.

## O que permanece fora deste ciclo

- criação do backend ou escolha de framework;
- criação ou armazenamento de credencial permanente;
- migration, view, função, RPC, policy ou grant permanente;
- alteração dos schemas expostos pela Data API;
- interface pública;
- acesso de `anon` ou `authenticated`;
- autenticação e contas de usuário;
- parametrização para outras métricas ou períodos;
- mudança do envelope `chargebr-methodology-reading-v1`;
- cache, paginação, cobrança ou limite comercial;
- backfill metodológico;
- novo caso canônico;
- resolução do conflito da carga `0005`;
- retomada da carga `0004`;
- migração do Notion.

## Referências oficiais consideradas

- [Securing your API — Supabase](https://supabase.com/docs/guides/api/securing-your-api)
- [Row Level Security — Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Using custom schemas — Supabase](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Database Functions — Supabase](https://supabase.com/docs/guides/database/functions)
- [Revoking function execution — Supabase](https://supabase.com/docs/guides/troubleshooting/how-can-i-revoke-execution-of-a-postgresql-function-2GYb0A)
- [API keys — Supabase](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Changelog](https://supabase.com/changelog)

Essas referências orientam a comparação, mas a decisão dependerá também dos ensaios no estado real do projeto.

## Perguntas para revisão

1. Está correto definir o backend interno do ChargeBR como o único consumidor deste ciclo?
2. Está correto preservar exatamente o contrato `chargebr-methodology-reading-v1`, inclusive a resposta única bloqueada?
3. As alternativas A, B e C cobrem as menores fronteiras plausíveis sem antecipar uma interface pública?
4. Está correto tratar segredo no servidor e privilégio mínimo como requisitos distintos?
5. Está correto não considerar `service_role` uma identidade de leitura mínima apenas porque fica no servidor?
6. A hipótese inicial em favor da conexão direta está suficientemente condicionada a uma identidade restrita e aos ensaios?
7. A matriz compara as alternativas pelos mesmos critérios e exige evidência em vez de preferência?
8. Os testes negativos protegem tabelas, escrita, navegador, outros papéis e dados fora do contrato?
9. Está correto exigir a verificação dos schemas expostos sempre que uma alternativa depender da Data API?
10. Está correto separar a seleção, a decisão de implementação e qualquer mudança permanente em PRs posteriores?
11. Os treze critérios de sucesso são suficientes para concluir o ciclo?
12. As interrupções impedem ampliar silenciosamente privilégios ou duplicar a regra semântica?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Esta decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 11 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A seleção da fronteira de exposição só poderá começar depois que esta versão aceita estiver incorporada à `main`.
