# Handoff pré-backend

**Atualizado em:** 2 de outubro de 2026  
**Base auditada:** `main` no commit `5eba29a` e projeto Supabase principal  
**Estado:** pronto para análise e planejamento; não autoriza implementação

## Veredito executivo

O trabalho preparatório chegou ao ponto correto para a entrada de uma pessoa
responsável pela análise técnica e de uma pessoa responsável pela gerência do
projeto.

Elas podem começar imediatamente. Ainda não existe, porém, evidência para
declarar que a coleta de todas as fontes está pronta nem decisão suficiente
para iniciar a implementação do backend.

O próximo marco não é escolher um framework. É transformar as lacunas
operacionais abaixo em um plano aceito e, em seguida, decidir a arquitetura com
as medições reais do pipeline. Até isso acontecer, permanecem proibidos:

- ativar o login do backend;
- escolher runtime ou hospedagem por suposição;
- ligar a interface a dados reais;
- agendar coleta automática;
- promover candidatos automaticamente ao conjunto canônico.

## O que está pronto

### Fundação de dados

- 21 migrations aplicadas no Supabase, sem divergência entre o histórico
  remoto e o repositório;
- 23 tabelas no schema `public`, todas com RLS habilitado;
- modelo canônico cobrindo fontes, conteúdos, observações, evidências, eventos,
  organizações, instrumentos regulatórios, métricas, resoluções e mudanças
  metodológicas;
- nove cargas canônicas e seus ciclos de revisão preservados no Git;
- fronteira privada de leitura `chargebr_private.read_methodology_contract_0001()`
  instalada como `SECURITY DEFINER`, com `search_path` fechado;
- nenhuma permissão de tabela no schema `public` para `PUBLIC`, `anon` ou
  `authenticated`;
- login `chargebr_backend_methodology_0001` com senha nula, leitura por papel
  executor, transação somente leitura e limites de tempo e de conexão;
- identidade separada e restrita para o collector, sem reutilizar a identidade
  do backend.

### Pipeline de coleta

- contratos de `source_endpoints` e `collection_runs` aplicados;
- collector manual/local com gravação de runs, manifestos de resultado,
  hashes, cursores e erros sanitizados;
- adapter ABVE implementado e ensaiado contra conteúdo real;
- adapter ANEEL implementado e coberto por fixtures e testes;
- extrator ABVE v1 validado para o item piloto `19617`;
- revisão humana separada da coleta e da extração;
- nenhuma promoção canônica automática.

### Interface

- workspace, tokens, biblioteca de componentes, gráficos e shell do back office
  verificados em navegador real e nos dois temas;
- navegação lateral e composição completa disponíveis na bancada;
- `apps/backoffice` existe, mas deliberadamente não possui rota de negócio nem
  busca de dados;
- sete capacidades OpenSpec vivas, 16 ciclos arquivados e nenhuma mudança
  ativa;
- um único ponto de interface aberto, com gatilho restrito ao próximo ciclo que
  tocar `interface-charts`.

## Fotografia do banco

A auditoria remota de 2 de outubro de 2026 encontrou:

| Entidade | Registros |
| --- | ---: |
| fontes | 5 |
| endpoints de coleta | 2 |
| execuções de coleta | 1 |
| conteúdos | 11 |
| observações | 14 |
| evidências | 14 |
| eventos | 11 |
| definições de métrica | 4 |
| valores de métrica | 8 |
| organizações | 4 |

Esses números são uma fotografia operacional, não critérios fixos. Dados
canônicos existentes provam a modelagem e o processo de revisão; não provam
que cada fonte já seja coletada automaticamente.

## Cobertura real das fontes

| Fonte canônica | Endpoint | Adapter | Run remoto | Situação |
| --- | --- | --- | --- | --- |
| ABVE | ativo | sim | 1 sucesso | piloto operacional, ainda estreito |
| ANEEL | indisponível | sim | nenhum | bloqueada por desafio de acesso |
| BMW Group PressClub Brasil | nenhum | não | nenhum | somente representação canônica |
| Diário do Grande ABC | nenhum | não | nenhum | somente representação canônica |
| Jeep — Stellantis Media | nenhum | não | nenhum | somente representação canônica |

O único run remoto terminou com `succeeded`, encontrou 100 itens novos e
produziu handoff `ready_for_extraction`. Ele não teve repetição remota; portanto,
a idempotência operacional ainda não foi demonstrada por um segundo run.

O extrator ABVE produziu um candidato quantitativo para um único item e a
revisão humana decidiu `link_existing`. O piloto é válido, mas não sustenta
generalização para todas as publicações da ABVE nem persistência de candidatos.

Na ANEEL, o endpoint aprovado passou a devolver um desafio de acesso. O adapter,
as policies e os testes foram preservados, mas o endpoint foi corretamente
marcado como `unavailable`. Reativá-lo ou substituí-lo exige novo preflight e
nova revisão; o backend não deve ser usado como contorno.

## A lacuna que precisa ser planejada

“Coletar todas as fontes” ainda não possui um limite fechado. O banco contém
cinco fontes hoje, mas a estratégia do produto prevê que novas fontes sejam
incorporadas continuamente. Antes de transformar essa expressão em entrega, a
gerência precisa definir um conjunto verificável, por exemplo:

1. as cinco fontes canônicas atuais;
2. somente fontes primárias atuais;
3. um conjunto prioritário nomeado, com critérios para entrada e saída;
4. cobertura por domínio, como mercado, empresas, imprensa e regulação.

Sem essa decisão, “todas” não possui critério de aceite e nunca termina.

Para cada fonte incluída no conjunto, a definição de pronto precisa exigir:

1. endpoint oficial e publicamente acessível;
2. termos, robots, formato, paginação, identidade e retenção revisados;
3. endpoint persistido e grants mínimos aplicados;
4. adapter com fixtures literais, testes positivos e falhas explícitas;
5. pelo menos dois runs controlados que provem repetição e idempotência;
6. medições de duração, volume, tentativas, falhas e recursos;
7. handoff de extração rastreável;
8. revisão humana e decisão editorial;
9. promoção canônica somente por etapa separada e auditável.

## Trabalho da pessoa analista

A análise técnica começa por confirmar ou substituir, com evidência, as
decisões já registradas. Seu primeiro pacote deve responder:

1. o produto público e o console interno serão uma aplicação ou duas?
2. qual parte nasce primeiro e por quê?
3. como a aplicação alcança a fronteira privada de leitura?
4. qual é o modelo de autenticação, sessão e autorização para público,
   assinantes e super admin?
5. qual runtime atende às medições reais de coleta, extração e leitura?
6. como segredos, rotação, observabilidade, auditoria, backup e recuperação
   serão operados?
7. qual contrato liga candidatos, revisão humana e persistência canônica sem
   apagar histórico nem aceitar automaticamente?
8. qual evidência substitui a medição ANEEL caso a fonte permaneça
   indisponível?

A pessoa analista recebe como restrições, e não como escolhas a refazer sem
motivo, a proveniência canônica, a separação entre coleta e verdade editorial,
o RLS, o princípio de privilégio mínimo e a ausência de promoção automática.

GraphQL não foi escolhido. A extensão `pg_graphql` não está instalada; sua
menção atual no repositório é expectativa, não decisão.

## Trabalho da pessoa gerente

A gerência transforma a análise em incrementos pequenos, cada um com dono,
dependências, risco, evidência e critério de aceite. A sequência inicial deve
ser:

1. definir o conjunto de fontes que torna a primeira fase encerrável;
2. resolver a prova da segunda fonte heterogênea — ANEEL reativada, endpoint
   substituto aprovado ou decisão formal que a substitua no ensaio;
3. repetir a ABVE e registrar a prova operacional de idempotência;
4. medir o par de conectores e consolidar requisitos de runtime;
5. conduzir e aprovar a decisão de arquitetura do backend;
6. planejar ativação controlada da identidade privada e seus testes negativos;
7. só então autorizar o primeiro incremento de implementação do backend;
8. incorporar as demais fontes do conjunto uma a uma, sem misturar seleção,
   acesso, implementação, ensaio e promoção canônica no mesmo PR.

Nenhum cronograma deve esconder a dependência externa da ANEEL. Se ela não for
resolvida, o plano registra a alternativa e a decisão que permite avançar.

## Alertas para a revisão técnica

Os advisors do Supabase não mostraram exposição pública de dados. Os avisos
atuais são:

- oito tabelas com RLS e sem policy, coerentes com o modelo fechado e sem grants
  públicos;
- cinco avisos de policies permissivas múltiplas, causados pela separação
  explícita das permissões ABVE e ANEEL;
- 12 índices ainda não utilizados, sem tráfego suficiente para justificar
  remoção.

Eles não bloqueiam o handoff, mas devem ser reavaliados quando o backend gerar
tráfego real. Otimização sem carga observada não faz parte desta etapa.

Antes de ativar a API, a análise também deve revalidar duas mudanças atuais da
plataforma:

- a [mudança de exposição automática de tabelas na Data API e no GraphQL](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically),
  prevista para todos os projetos em 30 de outubro de 2026;
- as [mudanças da atualização PostgreSQL 15.19/17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes),
  antes de atualizar o projeto atualmente em PostgreSQL 17.6.

O desenho atual usa grants explícitos e não depende de exposição automática,
mas a compatibilidade deve ser provada no momento da ativação, não presumida.

## Condição de entrada para implementação do backend

A implementação pode começar quando existir um registro aprovado contendo:

- escopo encerrável da primeira fase de fontes;
- tratamento decidido para a lacuna ANEEL;
- medições operacionais suficientes para escolher runtime;
- arquitetura de aplicação e de dados;
- modelo de autenticação e autorização;
- plano de segredos e ativação do login privado;
- contrato de API ou de leitura;
- estratégia de revisão e persistência de candidatos;
- incrementos, responsáveis, riscos e critérios de aceite;
- plano de testes, implantação, observabilidade e reversão.

Até lá, o estado correto é **pronto para análise do backend**, não “backend em
implementação” e não “coleta completa”.

## Mapa de leitura

- [`estrategia-de-produto.md`](estrategia-de-produto.md) — ordem dos estágios e
  limites do produto;
- [`forma-do-produto.md`](forma-do-produto.md) — decisões de aplicação ainda em
  aberto;
- [`decisao-pipeline-coleta-antes-runtime.md`](decisao-pipeline-coleta-antes-runtime.md)
  — por que as medições precedem o runtime;
- [`decisao-indisponibilidade-collector-aneel.md`](decisao-indisponibilidade-collector-aneel.md)
  — evidência, limites e retomada da ANEEL;
- [`decisao-pos-ensaio-extrator-abve-v1.md`](decisao-pos-ensaio-extrator-abve-v1.md)
  — alcance real do piloto ABVE;
- [`resultado-implementacao-fronteira-exposicao-0001.md`](resultado-implementacao-fronteira-exposicao-0001.md)
  — segurança e ativação futura da leitura privada;
- [`pontos-abertos.md`](pontos-abertos.md) — único registro vivo de pendências
  da frente de interface.
