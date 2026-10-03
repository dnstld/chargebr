# Parecer independente — backoffice e operação

## 1. Identificação

- **Especialidade:** backoffice e operação.
- **Agente:** agente independente responsável pela revisão de backoffice.
- **Commit examinado:** `d4361e6967ac5e7e7a6ffdcc187aa0b3cb45b803`.
- **Data:** 3 de outubro de 2026.
- **Escopo:** `apps/backoffice`, `packages/ui`, `packages/tokens`, specs e histórico local relacionados à interface, testes, shell, gráficos e sua adequação aos fluxos de coleta, análise, revisão, monitoramento e controle já evidenciados no repositório.
- **Método:** leitura estática; contagens do Git; construção de produção; portão completo; execução local do artefato construído; inspeção em navegador das rotas `/`, `/prova/123` e de uma rota inexistente.
- **Limitações:** não consultei banco remoto, telemetria, custos reais, pessoas usuárias ou ambiente implantado; não há backoffice operacional para teste de tarefa; não li branches nem pareceres de outros revisores. Ausência de evidência é registrada abaixo, sem inferência substituta.

## 2. Veredito executivo

1. O que existe é uma bancada de componentes e uma moldura, não um backoffice utilizável: nenhuma rota apoia hoje coleta, análise, revisão, monitoramento ou controle.
2. A biblioteca tem boas bases reutilizáveis: tokens, temas, foco, teclado, nomes acessíveis, valores de gráficos em tabela e um portão amplo e verde.
3. A aplicação não consome contratos de dados, não apresenta fontes, execuções, falhas, candidatos ou evidências e não possui ações operacionais.
4. O fluxo humano mais sensível — comparar evidência, corrigir, aprovar, rejeitar ou vincular a registro existente — permanece fora da interface e até fora de persistência estruturada no piloto.
5. Autenticação, autorização, auditoria de ações e proteção de operações administrativas não estão implementadas nem provadas; ligar controles antes desses contratos seria risco alto.
6. O teste em produção revelou a marca quebrada (`src="[object Object]"`), defeito que 284 testes verdes não detectaram; a página 404 também sai em inglês.
7. A cobertura atual prova componentes isolados e HTML estático, mas não navegação, hidratação, integração, estados assíncronos ou jornadas completas.
8. A relação entre processo e resultado está desproporcional: 77 commits de interface, 2.341 linhas de specs vivas e 14 ciclos de interface entre 17 arquivados sustentam uma aplicação de produto com 68 linhas e nenhum fluxo real.
9. Recomendo preservar a fundação acessível, corrigir o defeito de produção e deslocar o próximo esforço para uma fatia operacional vertical mensurável, sem ampliar antecipadamente o design system.
10. A arquitetura de aplicação, acesso a dados, persistência de candidatos, AI e autoridade de escrita depende das demais especialidades e não deve ser decidida por este parecer.

## 3. O que foi examinado

- as duas páginas, layout, estilo, configuração e testes de `apps/backoffice`;
- 65 módulos de produção de `packages/ui`, 25 histórias, navegação, moldura e quatro formas de gráfico;
- fonte e saída gerada de tokens, temas, contraste, tipografia, espaçamento e breakpoints;
- sete capacidades OpenSpec vivas, 17 ciclos arquivados e o registro de pontos abertos;
- contratos existentes de `source_endpoints`, `collection_runs` e pacote/revisão do extrator ABVE, somente para medir o que uma operação real precisaria apresentar;
- build Next.js, tipos, formatação, lint, testes Node, Vitest, Storybook/axe nos dois temas e navegador Chromium;
- composição e árvore acessível em desktop, rota dinâmica, 404 e carregamento real dos recursos.

Medições: 298 arquivos versionados no perímetro `apps/backoffice` + UI + tokens + OpenSpec; 11.272 linhas de TS/TSX/CSS/JSON não gerado; 3.050 linhas nos módulos de produção da UI; 2.962 linhas em histórias/testes da UI; 841 linhas no pacote do app, das quais 68 formam a interface de produto e 773 são testes, configuração e preparo; 80 requisitos e 179 cenários nas specs vivas. O portão terminou com 72 arquivos e 284 testes Vitest aprovados, além de 212 testes Node aprovados.

## 4. O que está bem construído

- A decisão de não inventar rotas ou dados é honesta: a aplicação declara explicitamente que não há tela de produto (`apps/backoffice/app/page.tsx:4-11`) e as fixtures dizem ser sintéticas (`packages/ui/src/organisms/nav/tree/fixtures/example-tree.ts:4-6`; `packages/ui/src/organisms/charts/fixtures/synthetic-series.ts:4-9`). Isso é preferível a uma falsa demonstração operacional.
- A moldura entrega `lang="pt-BR"`, link de salto, cabeçalho e `main` focalizável (`apps/backoffice/app/layout.tsx:20-28`; `packages/ui/src/organisms/app-frame/app-frame.tsx:70-109`). O teste do HTML emitido verifica essas relações (`apps/backoffice/tests/emitted-document.test.ts:364-473`).
- A bancada executa histórias em Chromium, claro e escuro, com axe em modo de reprovação (`packages/ui/vitest.config.ts:12-47`; `packages/ui/.storybook/bench.ts:13-31`). Componentes interativos usam React Aria e contratos tipados.
- Gráficos não dependem apenas de cor, interrompem lacunas e oferecem tabela equivalente (`packages/ui/src/organisms/charts/chart.tsx:24-40`; `packages/ui/src/organisms/charts/value-table.tsx:23-67`; `openspec/specs/interface-charts/spec.md:42-90`). Essa fundação merece preservação se as futuras tarefas confirmarem seu uso.
- O modelo operacional já possui matéria-prima rica: endpoints têm estado, intervalo, retenção e revisão de acesso (`supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:1-24`); runs têm tempos, heartbeat, tentativas, bytes, contagens, falhas e handoff (`supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:248-285`). A lacuna é de produto e integração, não ausência total de domínio.

## 5. Achados priorizados

### BO-01 — Alta — Não existe backoffice operacional

- **Fato medido:** as únicas rotas são `/` e `/prova/[id]`; ambas renderizam o mesmo parágrafo. No navegador: zero botões, formulários, tabelas e regiões de navegação.
- **Evidência:** `apps/backoffice/app/page.tsx:4-11`; `apps/backoffice/app/prova/[id]/page.tsx:3-11`; `apps/backoffice/app/_components/no-product-notice.tsx:1-8`.
- **Consequência:** nenhuma finalidade confirmada — coletar, analisar, revisar, monitorar ou controlar — pode ser executada.
- **Recomendação/opções:** tratar o shell como fundação, não como entrega de backoffice; medir uma fatia vertical real antes de ampliar inventário. A fatia pode começar por leitura operacional ou revisão, decisão que a síntese deve tomar.
- **Confiança:** alta.
- **Mudaria minha opinião:** uma rota funcional omitida deste commit ou evidência de que outra aplicação já realiza essas tarefas.

### BO-02 — Alta — Os contratos operacionais existentes não chegam à interface

- **Fato medido:** o banco modela cinco estados de endpoint e sete estados de execução, além de heartbeat, tentativas, bytes, sete contagens, três campos de erro e handoff; o app não importa cliente, contrato ou dado e suas dependências são apenas tokens, UI, Next e React.
- **Evidência:** `supabase/migrations/20260916083548_source_endpoints_collection_runs_v1.sql:56-57,248-285,295-305`; `apps/backoffice/package.json:10-20`.
- **Consequência:** não há visão de saúde, atraso, volume, falha, indisponibilidade ou prontidão para extração; incidentes dependem de consulta técnica externa.
- **Recomendação/opções:** definir com coleta/banco um contrato de leitura que preserve estado, atualidade e proveniência; só depois escolher consulta direta, backend ou outra fronteira. Estados vazios, carregando, desatualizado, parcial e erro precisam nascer do contrato real.
- **Confiança:** alta.
- **Mudaria minha opinião:** um consumidor versionado ou API operacional fora do perímetro examinado.

### BO-03 — Alta — Revisão humana não possui fila, comparação nem decisão auditável

- **Fato medido:** o piloto gerou um candidato e uma decisão `link_existing`, mas `review.v1.md` ficou `pending`; a decisão existe somente em documento, sem persistência adicional. Não há UI para comparar candidato, fonte e canônico, corrigir, aprovar, rejeitar ou vincular.
- **Evidência:** `docs/resultado-ensaio-extrator-abve-v1.md:7-23,64-75,77-100`.
- **Consequência:** revisão não escala, estado pendente pode divergir da decisão humana e não há trilha transacional de quem decidiu o quê sobre qual hash.
- **Recomendação/opções:** antes de desenhar tela, fechar com banco/coleta o ciclo de vida e a autoridade de cada decisão; preservar lado a lado evidência original, transformação, divergências, versão e histórico imutável. Não promover automaticamente.
- **Confiança:** alta.
- **Mudaria minha opinião:** persistência auditável de decisões e jornada de revisão existentes em outro sistema confirmado.

### BO-04 — Alta — Controle administrativo não tem fronteira de segurança provada

- **Fato medido:** não há login, sessão, papéis, autorização de ação, confirmação reforçada ou log administrativo no app. A documentação histórica descreve um console de um super admin, mas o código não materializa isso.
- **Evidência:** ausência de qualquer referência correspondente em `apps/backoffice`; dependências em `apps/backoffice/package.json:10-20`; finalidade histórica em `docs/forma-do-produto.md:23-39`.
- **Consequência:** conectar pausar fonte, disparar coleta, corrigir ou aprovar sem desenho de autoridade criaria um ponto único de comprometimento com escrita de alto impacto.
- **Recomendação/opções:** manter qualquer primeiro incremento somente leitura até existir autenticação, autorização no servidor, auditoria, proteção contra repetição e tratamento explícito de ações destrutivas; não confiar em ocultação de controles no cliente.
- **Confiança:** alta sobre a ausência; média sobre a forma futura.
- **Mudaria minha opinião:** controles server-side testados e logs imutáveis fora deste commit.

### BO-05 — Alta — A marca quebra na aplicação de produção e o portão não percebe

- **Fato medido:** build e 284 testes passam, mas `/` e `/prova/123` em `next start` emitem `<img src="[object Object]">`; `naturalWidth` é `0`. O componente passa o módulo SVG diretamente a `src`; no Storybook/Vite ele vira URL, no Next vira objeto.
- **Evidência:** `packages/ui/src/atoms/logo/logo.tsx:1-3,27-33`; o teste do app só confere elemento e `alt` (`apps/backoffice/tests/emitted-document.test.ts:425-448`); a história valida carregamento apenas na bancada (`packages/ui/src/atoms/logo/logo.stories.tsx:17-29`).
- **Consequência:** identidade visual quebrada e falso sinal de cobertura de produção.
- **Recomendação/opções:** corrigir o contrato do asset e acrescentar prova na aplicação executada de que o recurso responde e tem dimensão intrínseca; não duplicar apenas a asserção do Storybook.
- **Confiança:** alta.
- **Mudaria minha opinião:** reprodução em artefato idêntico mostrando URL válida e imagem carregada.

### BO-06 — Média — Falta a camada de teste que cobre jornadas reais

- **Fato medido:** a própria decisão registra que só existem bancada e inspeção do documento; servidor+navegador foi adiado. O teste de viewport monta componentes, não abre o app. A rota dinâmica tem existência testada, mas não conteúdo.
- **Evidência:** `docs/decisao-prova-de-comportamento-de-aplicacao.md:54-95,191-192`; `packages/ui/src/organisms/app-frame/app-frame.viewport.test.tsx:24-74`; `apps/backoffice/tests/emitted-document.test.ts:298-333`.
- **Consequência:** integração de bundlers, assets, navegação, hidratação, foco após transição, sessão e falhas de rede podem quebrar com portão verde — como BO-05 demonstra.
- **Recomendação/opções:** ativar a camada de aplicação quando entrar a primeira jornada real e mantê-la estreita, cobrindo resultado operacional e acessibilidade, não uma matriz de implementação.
- **Confiança:** alta.
- **Mudaria minha opinião:** teste end-to-end do artefato de produção já integrado ao portão.

### BO-07 — Média — Navegação foi refinada antes de existir arquitetura de informação validada

- **Fato medido:** trilha, painel, árvore, responsividade e foco existem, mas os destinos são sintéticos e a própria fixture diz que não representam rotas. A trilha foi fixada como botões que trocam painel local, não links.
- **Evidência:** `packages/ui/src/organisms/nav/tree/fixtures/example-tree.ts:4-6,8-73`; `openspec/specs/shell-components/spec.md:176-191`; `packages/ui/src/organisms/app-frame/app-frame.stories.tsx:242-315`.
- **Consequência:** a solução pode impor taxonomia por fonte e estado local onde operadores precisem de filas, incidentes, busca, URLs compartilháveis ou retorno do navegador.
- **Recomendação/opções:** preservar primitivas, mas considerar descartável a composição e a taxonomia; validar a hierarquia por tarefas e frequência antes de conectá-la.
- **Confiança:** média.
- **Mudaria minha opinião:** pesquisa de tarefas mostrando que alternância local fonte-a-fonte é o eixo dominante.

### BO-08 — Média — O painel sobreposto não oferece encerramento completo

- **Fato medido:** no modo overlay, `NavPanel` apenas aplica `FocusScope contain`; não recebe ação de fechar, não trata Escape nem restaura foco. O botão que alterna o painel fica no cabeçalho, fora do escopo contido.
- **Evidência:** `packages/ui/src/organisms/nav/panel/nav-panel.tsx:13-27,35-58`; `packages/ui/src/organisms/app-frame/app-frame.tsx:82-105`.
- **Consequência:** a futura navegação móvel pode aprisionar ou deslocar foco sem caminho claro de saída, embora axe e o teste de contenção passem.
- **Recomendação/opções:** reavaliar o padrão completo quando houver app composto: foco inicial, fechar explícito, Escape, retorno de foco e bloqueio do conteúdo de fundo devem ser observados juntos.
- **Confiança:** média, pois o componente ainda não tem consumidor real.
- **Mudaria minha opinião:** jornada composta demonstrando entrada e saída por teclado/leitor de tela sem ambiguidade.

### BO-09 — Média — Gráficos são acessíveis, mas semanticamente insuficientes para operação

- **Fato medido:** `ChartPoint` contém somente categoria, número/nulo e preenchimento; a spec removeu proveniência, bloqueio de projeção e estado não resolvido. Séries acima de três são recusadas.
- **Evidência:** `packages/ui/src/organisms/charts/series.ts:3-39`; `openspec/specs/interface-charts/spec.md:3-8,25-40,78-90`; `packages/ui/src/organisms/charts/palette.ts:3-15`.
- **Consequência:** saúde, custo, atraso e qualidade não podem carregar atualização, limiar, unidade de comparação, confiança, origem ou ligação à execução sem composição adicional; um painel bonito poderia esconder incerteza.
- **Recomendação/opções:** manter as formas como renderizadores genéricos, mas exigir que qualquer uso operacional componha contexto, atualidade, estados e caminho até evidência. Remover formas que não forem usadas, em vez de expandi-las preventivamente.
- **Confiança:** alta sobre o contrato; média sobre adequação futura.
- **Mudaria minha opinião:** composição real que cubra esses significados sem sobrecarregar o gráfico.

### BO-10 — Média — O processo spec-driven está desproporcional ao produto entregue

- **Fato medido:** no escopo de interface há 77 commits, 14 ciclos arquivados, 2.341 linhas de specs vivas, 3.050 linhas de UI e 2.962 de histórias/testes; o app de produto soma 68 linhas e nenhuma tarefa operacional. O histórico inclui construção e posterior remoção de primitivas de domínio.
- **Evidência:** contagem Git no commit base; contexto fixa a fase como biblioteca/shell e proíbe rotas/dados (`openspec/config.yaml:8-12,35-40`); a spec aceita componente sem consumidor como catálogo (`openspec/specs/shell-components/spec.md:102-113`).
- **Consequência:** custo de mudança e revisão cresce antes do aprendizado com operação real; cobertura local pode otimizar contratos que serão refeitos.
- **Recomendação/opções:** manter rigor para segurança, dados, acessibilidade e regressões reais; simplificar cerimônia e exigir consumidor/jornada para novas abstrações. Catálogo sem demanda deve ser excepcional, não objetivo.
- **Confiança:** alta na medição, média no limiar ideal.
- **Mudaria minha opinião:** evidência de redução mensurável de lead time ou reutilização externa que compense o custo.

### BO-11 — Baixa — Estados de erro e vocabulário de produção estão incompletos

- **Fato medido:** rota inexistente renderiza “This page could not be found.” sob `lang="pt-BR"`; não há página própria de erro. O valor tabular do gráfico também fixa três rótulos em português dentro do componente, enquanto o guardião de vocabulário exclui gráficos e a lacuna está registrada.
- **Evidência:** medição local de `/nao-existe`; rotas de framework apenas declaradas em `apps/backoffice/tests/emitted-document.test.ts:37-57`; `packages/ui/src/organisms/charts/value-table.tsx:34-43`; `docs/pontos-abertos.md:36-43`.
- **Consequência:** experiência inconsistente e regra de composição aplicada de forma desigual.
- **Recomendação/opções:** ao nascer a primeira rota real, definir 404/erro em PT-BR e decidir explicitamente se textos genéricos do gráfico são props ou vocabulário estável; fechar o guardião sem criar camada de tradução, pois internacionalização está fora do produto.
- **Confiança:** alta.
- **Mudaria minha opinião:** tratamento de erro em camada de implantação não presente no artefato local.

## 6. O que não foi provado

- que qualquer tarefa operacional possa ser concluída, porque nenhuma está implementada;
- que o shell funcione com sessão, dados reais, latência, concorrência, paginação ou falhas;
- que a hierarquia sintética corresponda ao modelo mental do operador;
- que contraste e acessibilidade permaneçam corretos em telas densas e dados extremos;
- que existam métricas de custo, SLOs, alertas, retenção ou trilha administrativa consumíveis pela UI;
- que o backoffice precise ser app separado, grupo de rotas ou outra forma;
- que os quatro gráficos sejam necessários;
- que o estado remoto em 3 de outubro coincida com a fotografia histórica.

## 7. Complexidade e dívida

**Necessária e reaproveitável:** tokens sem literais, tipografia PT-BR, temas, foco visível, React Aria, link de salto, tabela equivalente dos gráficos, separação entre biblioteca e domínio, fixtures declaradamente sintéticas e portão único.

**Prematura:** taxonomia de navegação, quatro formas de gráfico, 17 arquivos de token e grande parte da governança de estados de componentes antes de uma jornada operacional. A regra que chama componente sem consumidor de “catálogo, não lacuna” institucionaliza estoque (`openspec/specs/shell-components/spec.md:102-113`).

**Duplicada ou frágil:** Storybook e app interpretam SVG de modo diferente; o teste de documento repete estrutura estática sem provar recursos. A rota `/prova/[id]` é dívida deliberada para exercitar forma de entrega e deve sair quando uma rota real cumprir essa função.

**Descartável se não validada:** composição completa e hierarquia sintética da navegação; formas de gráfico sem consumidor; regras OpenSpec que protegem inventário não usado. Não recomendo apagar a fundação agora, mas tampouco tratá-la como arquitetura obrigatória.

## 8. Recomendações

- **Manter:** tokens, temas, acessibilidade básica, React Aria, primitives de texto/ação, tabela equivalente e testes de contraste.
- **Corrigir:** asset da marca e a lacuna de teste em produção; saída 404 em PT-BR quando houver rotas reais; encerramento acessível do painel sobreposto.
- **Simplificar:** governança spec-driven e matriz de histórias para privilegiar riscos e jornadas; evitar novo componente sem consumidor comprovado.
- **Reescrever conforme evidência:** navegação e organização da informação se tarefas reais não confirmarem o eixo fonte/árvore; contrato dos gráficos se saúde, custo ou incerteza exigirem semântica própria.
- **Remover quando substituído:** rota de prova; componentes/formas sem consumidor após a primeira rodada de fluxos reais.
- **Medir antes de decidir:** tarefas e frequência do operador; volume e idade de filas; tempos de revisão; falhas por fonte; ações perigosas; custo por run/item; densidade de dados; necessidade de URLs compartilháveis; tempo do portão e retrabalho causado pelo processo.

## 9. Dependências de outras especialidades

- **Coleta:** comandos seguros, idempotência, estados, cancelamento/repetição, heartbeat, diagnóstico e limites de fonte.
- **Banco e segurança:** contrato de leitura/escrita, persistência de candidatos e decisões, transações, RLS, papéis, auditoria, retenção e concorrência.
- **AI e custos:** quais saídas são sugestões, confiança/limitações, versionamento de modelo/prompt, custo e escalonamento humano.
- **Síntese arquitetural:** uma ou duas aplicações; backend/fronteira de dados; sessão; implantação; observabilidade. Este parecer só exige que operações privilegiadas sejam server-side, auditáveis e inicialmente conservadoras.

## 10. Limites da revisão

Este parecer avalia o commit fixado, não intenção futura. Não valida segurança do banco, correção da coleta ou arquitetura de AI além do que afeta a interface. Não executou escrita remota, não alterou código e não seleciona funcionalidades novas. Prioridades indicam risco para a finalidade confirmada, não uma ordem de implementação. A principal conclusão pode mudar quando existirem contrato operacional, dados reais e observação de tarefas; até lá, chamar a bancada atual de backoffice utilizável não é sustentado pela evidência.
