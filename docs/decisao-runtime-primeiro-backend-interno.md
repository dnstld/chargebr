# Decisão: escolha do runtime do primeiro backend interno

## Estado

`AGUARDANDO REVISÃO`

Este documento define como o ChargeBR escolherá a plataforma de hospedagem do primeiro consumidor da fronteira privada `0001`. Ele não escolhe ainda uma plataforma definitiva, não cria aplicação ou infraestrutura e não ativa o login do banco.

A decisão parte da escolha de Denis Toledo de manter a identidade operacional inativa enquanto runtime, forma de conexão e gerenciador de segredos ainda não estiverem definidos.

## Resultado proposto

A escolha será feita em duas etapas pequenas:

1. este PR fixa escopo, candidatas, critérios, provas e interrupções;
2. depois do aceite e merge, outro PR compara as plataformas e propõe uma seleção concreta.

Até a seleção ser aceita e implementada:

```text
chargebr_backend_methodology_0001
  LOGIN
  PASSWORD NULL
  nenhuma conexão operacional possível por senha
```

Não será criada uma senha apenas para descobrir depois onde armazená-la ou como usá-la.

## Por que a hospedagem precisa ser decidida agora

A função privada já existe e foi verificada estruturalmente. Porém o modo correto de chegar ao PostgreSQL depende de onde o código será executado:

| Forma de execução | Conexão normalmente adequada |
| --- | --- |
| processo persistente com IPv6 | conexão direta |
| processo persistente somente com IPv4 | pool compartilhado em modo de sessão |
| processo temporário, serverless ou edge | pool compartilhado em modo de transação |

No modo de transação, prepared statements e estado de sessão não podem ser pressupostos. Escolher a conexão antes do runtime poderia produzir uma implementação incompatível ou desnecessariamente complexa.

## Estado atual confirmado

| Dimensão | Estado |
| --- | --- |
| Aplicação no repositório | inexistente |
| Framework ou linguagem | não escolhidos |
| Provedor de hospedagem | não escolhido |
| Gerenciador de segredos | não escolhido |
| Consumidor | backend interno do ChargeBR |
| Projeto Supabase | `chargebr` |
| Região do Supabase | `eu-central-1` |
| PostgreSQL | `17.6` |
| Fronteira | `chargebr_private.read_methodology_contract_0001()` |
| Login operacional | criado, mas com `PASSWORD NULL` |
| Limite do login | 5 conexões |
| Data API | fora do caminho selecionado |

O changelog atual do Supabase não apresentou mudança que obrigue alterar a fronteira instalada. A mudança anunciada para exposição de tabelas pela Data API não interfere nesta seleção porque o consumidor continuará usando conexão PostgreSQL e um schema privado.

## Escopo fixo da primeira hospedagem

A primeira implementação deverá existir somente para:

1. conectar como `chargebr_backend_methodology_0001`;
2. chamar a função privada `0001` pelo nome qualificado;
3. validar o envelope retornado;
4. registrar somente situação, versão, tipos de projeção, tamanho, hash e duração;
5. executar os testes positivos e negativos já aceitos;
6. permitir revogar a credencial e retornar o login a `PASSWORD NULL`.

Ela não deverá inicialmente:

- servir uma interface pública;
- receber tráfego de visitantes;
- expor a função como RPC;
- usar `postgres`, `service_role` ou outra credencial ampla;
- executar consulta direta nas tabelas;
- armazenar o payload integral nos logs;
- parametrizar outras métricas ou períodos;
- iniciar coleta, processamento documental ou geração de análises no mesmo PR.

## Hipótese inicial, sem aprovação antecipada

A hipótese inicial é um **job em contêiner executado sob demanda**, sem servidor HTTP público.

O Google Cloud Run Job será a primeira candidata concreta porque:

- executa uma tarefa e termina, sem precisar escutar requisições;
- permite uma única tarefa sem paralelismo;
- possui identidade de serviço e integração com Secret Manager;
- registra execução, resultado e logs;
- pode evoluir posteriormente para agenda, workflow ou serviço;
- aceita um contêiner portável em vez de prender a lógica a um runtime edge.

Essa hipótese não está selecionada por este documento. Ela deverá ser comparada pelos mesmos critérios das demais candidatas e poderá ser rejeitada por custo, complexidade administrativa ou inadequação ao uso pretendido.

## Candidatas obrigatórias

### A — Google Cloud Run Job

Forma inicial avaliada:

```text
job sem URL pública
uma tarefa
sem paralelismo
execução manual
secret no Google Secret Manager
```

Se selecionada para esta fase, a conexão provável será o pool compartilhado do Supabase em modo de transação, com uma conexão por processo, SSL obrigatório e prepared statements desativados.

### B — Supabase Edge Functions

É a alternativa de menor quantidade de fornecedores. Oferece runtime TypeScript/Deno, secrets do próprio projeto e conexão server-side ao PostgreSQL.

Ela deverá responder, porém, por que criar um endpoint HTTP é adequado quando a primeira execução pode ser uma tarefa interna sem endpoint. Também deverá demonstrar que limites de CPU, memória, duração e concorrência são compatíveis com a fronteira e com o limite de cinco conexões.

### C — backend persistente em contêiner

Esta categoria inclui um serviço ou worker sempre disponível em provedores como Cloud Run, Render, Fly.io ou Railway.

Ela poderá usar conexão direta quando houver IPv6, ou pool em modo de sessão em rede somente IPv4. Deverá justificar o custo e a operação contínuos antes de existir uma necessidade de resposta imediata.

### D — outra candidata proposta durante a seleção

Outra plataforma poderá entrar na comparação se satisfizer todo o escopo fixo. Ela não poderá receber critérios mais brandos apenas por ser simples ou familiar.

## Critérios de comparação

O próximo artefato deverá registrar `atende`, `não atende` ou `não demonstrado` para cada candidata:

| Critério | Evidência necessária |
| --- | --- |
| Ausência de endpoint público inicial | tarefa pode executar sem escutar a internet |
| Segredo fora do código | cofre próprio e acesso por identidade do runtime |
| Privilégio mínimo | usa exclusivamente o login restrito já criado |
| Conexão compatível | modo, porta, SSL e limitações documentados |
| Controle de conexões | uma conexão inicial e concorrência limitada |
| Execução manual | somente pessoa ou identidade autorizada inicia o ensaio |
| Observabilidade | duração, resultado e erro sem segredo ou payload integral |
| Região | execução próxima de `eu-central-1` ou latência justificada |
| Custo inicial | cobrança, franquia, recursos mínimos e alerta conhecidos |
| Reversão | runtime, secret e senha removíveis sem afetar dados |
| Portabilidade | lógica do contrato não depende de API proprietária desnecessária |
| Evolução | caminho explícito para agenda, processamento ou serviço futuro |
| Operação | quantidade de contas, permissões e manutenção compreensível |
| Limites | CPU, memória, duração, tentativas e tamanho suficientes |

Preferência por um fornecedor não substituirá evidência. Preço promocional ou franquia gratuita também não poderá ser tratado como garantia permanente.

## Perguntas que a seleção deverá responder

1. A primeira execução é somente manual, agendada ou precisa responder imediatamente a outra aplicação?
2. Quem pode iniciá-la: somente Denis Toledo, outros administradores ou uma identidade de serviço?
3. Existe disposição para criar uma conta em outro provedor e habilitar faturamento controlado?
4. O backend deverá permanecer uma leitura curta ou existe necessidade próxima de coleta e processamento mais longos?
5. Qual região reduz latência e transferência sem afastar a operação dos usuários responsáveis?
6. Qual é o menor custo previsível quando não há execução?
7. Como estabelecer orçamento e alerta antes de criar recursos cobrados?
8. Como o runtime acessa somente um secret e como esse acesso é revogado?
9. Como impedir mais de uma execução concorrente na primeira ativação?
10. Como provar que prepared statements estão desativados quando o pool transacional for usado?

As quatro primeiras perguntas exigem confirmação de produto ou operação. As demais podem ser investigadas tecnicamente depois que as candidatas forem aplicadas ao cenário escolhido.

## Requisitos de segurança invariáveis

Independentemente da plataforma selecionada:

- a connection string será um secret server-side;
- o nome do secret poderá ser documentado, mas seu valor nunca será versionado;
- o secret usará `chargebr_backend_methodology_0001`, nunca `postgres`;
- SSL deverá ser obrigatório;
- o cliente começará com uma única conexão;
- o runtime não poderá assumir proprietário ou executor com `SET ROLE`;
- o payload integral de aproximadamente 36 KB não será registrado em logs;
- falhas de autorização serão registradas sem esconder o código do erro;
- a senha de ensaio será rotacionada antes de qualquer uso contínuo;
- a reversão terminará com `PASSWORD NULL` e remoção do secret;
- nenhum segredo será enviado ao navegador, resposta, commit, PR ou saída de revisão.

## Etapas depois desta decisão

Se este documento for aceito e incorporado à `main`:

1. um PR de seleção aplicará os critérios às candidatas;
2. Denis Toledo revisará a plataforma proposta e as respostas de produto;
3. outro PR definirá runtime, dependências, identidade de serviço, secret, conexão e reversão concretos;
4. somente depois dos aceites será criada a fundação mínima do consumidor;
5. a ativação da senha ocorrerá por procedimento operacional fora do Git;
6. os testes serão executados pela identidade real;
7. um relatório registrará a execução sem revelar credenciais;
8. somente então o nono ciclo poderá receber uma conclusão.

Cada etapa poderá parar sem deixar uma credencial ativa ou infraestrutura desconhecida.

## Interrupções obrigatórias

A seleção ou implementação deverá parar se:

- exigir uma senha antes de existir cofre e identidade do runtime;
- depender de credencial administrativa;
- criar endpoint público sem necessidade e autenticação definidas;
- não permitir limitar conexões ou concorrência;
- registrar connection string, senha ou payload integral;
- exigir expor o schema privado pela Data API;
- impedir SSL obrigatório;
- esconder custo mínimo, faturamento ou limites relevantes;
- misturar seleção da plataforma com implantação irreversível;
- exigir modificar a função ou ampliar grants já aceitos;
- não oferecer reversão para `PASSWORD NULL`;
- tratar a execução de teste como backend final sem uma decisão explícita.

## Fora de escopo

- criar conta ou projeto em provedor de nuvem;
- habilitar faturamento;
- escolher definitivamente Cloud Run, Edge Functions ou outro provedor;
- criar `package.json`, contêiner ou código de aplicação;
- criar service account, secret, senha ou connection string;
- ativar o login do banco;
- alterar migration, função, roles, grants, policies ou dados;
- criar endpoint, interface, autenticação de usuário ou agenda;
- definir a arquitetura completa do produto ChargeBR.

## Referências oficiais consideradas

- [Conectar ao PostgreSQL — Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Pooling e limites de conexão — Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits)
- [Edge Functions — Supabase](https://supabase.com/docs/guides/functions)
- [Limites das Edge Functions — Supabase](https://supabase.com/docs/guides/functions/limits)
- [Criar Cloud Run Jobs — Google Cloud](https://cloud.google.com/run/docs/create-jobs)
- [Secrets em Cloud Run Jobs — Google Cloud](https://cloud.google.com/run/docs/configuring/jobs/secrets)
- [Changelog do Supabase](https://supabase.com/changelog?types=breaking-change)

## Perguntas para revisão

1. Está correto manter o login operacional com `PASSWORD NULL` durante toda a seleção da hospedagem?
2. Está correto separar a definição dos critérios da futura escolha de uma plataforma?
3. O escopo inicial deve permanecer restrito à ativação e aos testes da fronteira `0001`, sem criar produto público?
4. Está correto usar um job em contêiner sem endpoint como hipótese inicial, mas não como escolha antecipada?
5. Cloud Run Job, Supabase Edge Functions e backend persistente cobrem as categorias plausíveis para a primeira comparação?
6. Os critérios comparam segurança, conexão, custo, operação, limites e evolução sem favorecer silenciosamente uma candidata?
7. Está correto exigir uma única conexão e nenhuma execução paralela no primeiro ensaio?
8. Está correto manter a Data API fora do caminho e impedir o uso de `postgres` ou `service_role`?
9. As perguntas de produto separam adequadamente o que Denis Toledo precisa decidir do que pode ser investigado tecnicamente?
10. A sequência de PRs impede criar infraestrutura, faturamento ou segredo antes de cada aceite?
11. As interrupções evitam exposição, custo desconhecido e ativação prematura?
12. O conjunto é suficiente para começar do zero a seleção do runtime do primeiro backend interno?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.
