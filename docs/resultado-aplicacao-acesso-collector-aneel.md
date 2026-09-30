# Resultado da aplicação do acesso do collector à ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este documento registra a aplicação, no Supabase, da migration aprovada para
estender à ANEEL o acesso da role técnica existente. A aplicação ocorreu
somente depois do merge do PR #194 na `main`. Nenhuma coleta foi executada e
nenhum dado de conteúdo ou de execução foi criado ou alterado.

## Identificação da aplicação

| Campo | Valor |
| --- | --- |
| Decisão | [Acesso mínimo do collector ao endpoint ANEEL](decisao-acesso-collector-aneel.md) |
| Revisão | [Implementação do acesso do collector à ANEEL](revisao-acesso-collector-aneel.md) |
| Arquivo | [`20260929214528_extend_collector_access_to_aneel.sql`](../supabase/migrations/20260929214528_extend_collector_access_to_aneel.sql) |
| Data da aplicação | 30 de setembro de 2026 |
| Autorização | Confirmação de Denis Toledo e merge do PR #194 |
| Commit da `main` usado | `09a5d8110386241064e47ecae7358aa45c7c402e` |
| SHA-256 do arquivo | `e91c31e784d50836c7ec6229f46a27ed467f0454f7e4d2e36019b55f43a3a760` |
| Nome lógico aplicado | `extend_collector_access_to_aneel` |
| Versão registrada no Supabase | `20260930054602` |
| Resultado | `SUCCESS` |

O arquivo obtido da `main` era byte a byte idêntico ao arquivo revisado. Seu
SQL foi enviado integralmente e uma única vez ao mecanismo de migrations do
Supabase, sem edição durante a aplicação.

O timestamp `20260929214528` identifica a criação do arquivo versionado pela
CLI. A versão `20260930054602` identifica o registro da execução pelo mecanismo
remoto. A diferença entre eles não representa uma segunda migration nem uma
mudança no SQL.

## Verificação anterior

Antes da aplicação, consultas somente de leitura confirmaram:

- 20 migrations no histórico remoto e ausência do nome lógico novo;
- uma source ANEEL e um endpoint ANEEL ativo;
- zero `collection_runs` para o endpoint ANEEL;
- cinco policies da role, todas restritas à ABVE;
- atributos restritos da role e limite de duas conexões;
- assinaturas dos grants por objeto e por coluna usadas como linha de base.

## Resultado no catálogo

O histórico remoto passou de 20 para 21 migrations e contém exatamente um
registro chamado `extend_collector_access_to_aneel`. O catálogo contém as cinco
policies novas:

1. `sources_collector_aneel_select`;
2. `source_endpoints_collector_aneel_select`;
3. `collection_runs_collector_aneel_select`;
4. `collection_runs_collector_aneel_insert`;
5. `collection_runs_collector_aneel_update`.

A role possui agora dez policies: cinco ABVE e cinco ANEEL. As cinco novas
exigem o par exato `sources.slug = 'aneel'` e
`source_endpoints.endpoint_key = 'aneel-board-meetings-index'`. O insert exige
também `status = 'running'` e `trigger_kind = 'manual_local'`.

## Controles preservados

| Controle | Antes | Depois |
| --- | --- | --- |
| Policies ABVE | 5 | 5 |
| Policies ANEEL | 0 | 5 |
| Login da role | Sim | Sim |
| Superuser, `BYPASSRLS`, criação de role ou banco | Não | Não |
| Limite de conexões | 2 | 2 |
| Runs ANEEL | 0 | 0 |

A assinatura das policies ABVE permaneceu
`c93e189423f230c290a6fe96fdc710dd`. As assinaturas dos grants por coluna
(`41493444eef841252e4930c1f4f64d8a`) e por objeto
(`8a53cec3fa3d10a5f511e389b6e6ed2f`) também permaneceram idênticas. Não houve
alteração de role, senha, grant, tabela, coluna, índice, trigger, constraint ou
dado.

## Prova de comportamento

Antes do merge, o teste pgTAP da migration executou 16 asserções em PostgreSQL
17.6 descartável e terminou com `PASS`. Ele provou o acesso positivo a ABVE e
ANEEL e a rejeição de endpoint estranho, `DELETE`, escrita em source ou
endpoint e leitura de tabelas canônicas.

Depois da aplicação, foi tentado iniciar um ensaio transacional com
`SET LOCAL ROLE chargebr_collector_0001` pela conexão administrativa do
conector. O PostgreSQL rejeitou a troca antes de qualquer insert com
`permission denied to set role`. Esse resultado confirma que a conexão
administrativa não pode assumir a identidade técnica e não justifica ampliar
seus privilégios. A transação não persistiu dados; uma consulta posterior
reconfirmou zero runs ANEEL.

O ensaio remoto com login real fica reservado ao primeiro run controlado do
adapter ANEEL. Ele exigirá que a credencial seja fornecida ao processo pelo
mecanismo de segredo aprovado, sem exibi-la, salvá-la no repositório ou
rotacioná-la nesta etapa.

## Advisors do Supabase

### Segurança

O advisor retornou somente oito ocorrências informativas de
[`rls_enabled_no_policy`](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
nas mesmas tabelas canônicas deliberadamente fechadas já presentes na linha de
base. A aplicação não criou exposição, alerta ou erro de segurança.

### Desempenho

As 12 ocorrências informativas de
[`unused_index`](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
permaneceram. O advisor passou também a apresentar cinco ocorrências de
[`multiple_permissive_policies`](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies),
uma para cada operação em que a mesma role possui uma policy ABVE e outra
ANEEL.

Esse aviso é a consequência esperada da decisão confirmada de manter policies
separadas, estreitas e combinadas por `OR`, sem reescrever as cinco policies
ABVE. Com apenas dois endpoints autorizados, ele não bloqueia o collector e não
altera a fronteira de segurança. A futura análise do backend deverá reavaliar a
forma das policies antes de ampliar a role para novos endpoints.

## Verificação do repositório

`pnpm verify` passou integralmente com tipos, formato e lint sem erros, 197
testes do collector e extractor e 226 testes Vitest aprovados. A suíte visual
foi repetida fora da restrição local de portas depois que o primeiro ensaio foi
interrompido por `listen EPERM`; a repetição terminou com 58 arquivos de teste
aprovados. `git diff --check` também passou.

## Conclusão e limite desta etapa

A migration aceita foi aplicada uma vez e produziu exatamente a extensão de
linha prevista. O estado anterior foi preservado, o endpoint ANEEL continua
ativo e sem runs, e não existe correção remota pendente para iniciar a
implementação do adapter.

Depois do aceite e merge deste resultado, a próxima etapa é implementar o
adapter ANEEL com fixtures literais, casos negativos e execução inicialmente
controlada. Escolhas de framework, arquitetura, hospedagem e implementação do
backend permanecem fora deste ciclo e serão entregues à pessoa analista e à
gerência de projeto contratadas.

## Perguntas para revisão

1. A aplicação usou o arquivo aceito e incorporado à `main`, com commit e hash
   documentados?
2. Está clara a diferença entre o timestamp do arquivo e a versão remota?
3. As cinco policies ANEEL e a preservação das cinco policies ABVE correspondem
   à decisão confirmada?
4. Está demonstrado que role, grants e dados permaneceram inalterados?
5. Está correto não elevar a conexão administrativa nem recuperar ou expor a
   credencial técnica para forçar o ensaio remoto?
6. Está claro por que o aviso de policies permissivas múltiplas é esperado e
   deverá ser reavaliado somente antes de ampliar a role?
7. O resultado permite avançar, depois do merge, para o adapter ANEEL?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta for
`não`, indique o número e a correção necessária. Este resultado não deve ser
incorporado antes da confirmação.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 30 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as sete respostas e não solicitou
correções. O pacote está liberado para commit, abertura de PR e merge. A
implementação do adapter ANEEL permanece bloqueada até este resultado estar
incorporado à `main`.
