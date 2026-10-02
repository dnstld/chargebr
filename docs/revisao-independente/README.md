# Registro-mestre da revisão independente

**Iniciado em:** 2 de outubro de 2026<br>
**Estado:** protocolo confirmado; agentes ainda não iniciados<br>
**Responsável pelas decisões finais:** Denis Toledo

## O que este registro é

Este arquivo preserva as decisões sobre **como** a próxima fase será conduzida.
Ele evita que o contexto da conversa se perca ou que uma orientação de processo
seja confundida com decisão técnica.

Este arquivo não é:

- handoff técnico;
- parecer sobre o estado do projeto;
- aprovação da arquitetura atual;
- plano de implementação;
- autorização para escrever código;
- restrição à liberdade de qualquer especialista.

Os futuros pareceres serão registrados separadamente e atribuídos às pessoas
que os produzirem. Este registro não antecipa suas conclusões.

O arquivo `docs/handoff-pre-backend.md` foi produzido antes deste mandato. Ele
permanece como fotografia auditada daquele momento, não como briefing da revisão
independente nem como restrição às alternativas. Sua revisão, substituição ou
reclassificação será decidida somente depois desta fase de conversa.

## Mandato dado pelo proprietário

As orientações abaixo foram confirmadas por Denis Toledo na conversa de 2 de
outubro de 2026:

1. a fase começa por revisão, não por implementação;
2. o ponto mais importante do futuro handoff é não influenciar as decisões dos
   profissionais;
3. cada profissional possui liberdade para questionar, substituir ou descartar
   qualquer regra, tecnologia, arquitetura, modelo ou decisão existente;
4. o trabalho pode ser dividido entre diferentes especialidades;
5. o backoffice deverá ajudar a coletar, analisar, revisar, operar e monitorar
   o sistema, mas sua forma ainda não foi decidida;
6. economia de tokens é fundamental e merece revisão especializada em AI;
7. handoffs definitivos somente serão escritos depois das revisões, da síntese
   e das decisões do proprietário.

“Liberdade para mudar” inclui, sem se limitar a:

- pipeline e estratégia de coleta;
- fontes e critérios de cobertura;
- estrutura e tecnologia do banco de dados;
- Supabase e seus mecanismos de segurança;
- separação entre aplicações;
- backend, API, runtime e hospedagem;
- automação e agendamento;
- uso ou ausência de AI;
- modelo de revisão humana;
- estrutura do backoffice;
- regras de engenharia e processo do repositório.

O material existente é evidência e contexto histórico. Não é uma constituição
técnica nem uma lista de decisões que os profissionais são obrigados a manter.

## Agentes independentes

Os profissionais serão agentes de AI em tarefas separadas. As quatro revisões
especializadas partirão do mesmo commit da `main`, receberão o mesmo mandato
neutro e não compartilharão contexto, mensagens ou relatórios entre si.

Nenhum agente especialista poderá delegar trabalho a subagentes. A autoria do
parecer precisa corresponder ao agente que recebeu o escopo.

## Escopos confirmados

### Coleta e engenharia de dados

A revisão examinará exclusivamente o que já foi construído. Ela não selecionará
fontes, não decidirá quais fontes devem entrar ou sair e não criará roadmap.

O agente revisará:

- arquitetura e contratos do pipeline atual;
- collector manual/local;
- adapter e execução da ABVE;
- adapter e tratamento da indisponibilidade da ANEEL;
- extrator ABVE;
- `source_endpoints` e `collection_runs`;
- identidade técnica, grants e policies do collector;
- deduplicação, fingerprints e idempotência;
- retries, timeouts, paginação e tratamento de falhas;
- manifests e artefatos locais;
- fixtures e cobertura dos testes;
- separação entre coleta, extração, revisão humana e dados canônicos;
- documentação comparada ao comportamento real;
- complexidade desnecessária, código morto e riscos de manutenção;
- segurança, custos e prontidão operacional.

O parecer poderá recomendar manter, simplificar, reescrever ou remover qualquer
parte, sem implementar a recomendação.

### Banco de dados e segurança

A revisão examinará exclusivamente o banco e a estrutura já construídos. Ela
não decidirá novas funcionalidades do produto.

O agente revisará:

- schema e migrations existentes;
- tabelas, relações, constraints e índices;
- dados canônicos já carregados;
- integridade, normalização e rastreabilidade;
- histórico de correções e mudanças metodológicas;
- RLS, roles, grants, policies e função privada;
- separação entre dados canônicos, coleta e candidatos;
- qualidade e consistência dos dados existentes;
- riscos de segurança, performance e manutenção;
- compatibilidade entre documentação, migrations e banco remoto;
- estruturas desnecessárias, ausentes ou excessivamente complexas;
- adequação ou inadequação do Supabase e PostgreSQL atuais.

O parecer poderá recomendar manter, corrigir, simplificar, migrar ou substituir
qualquer parte, sem executar alterações.

### AI, qualidade e economia de tokens

Como ainda não existe uma arquitetura de AI implementada, a revisão partirá dos
fluxos já construídos e poderá concluir que uma etapa não deve usar AI.

O agente revisará:

- collector e extrator determinístico existentes;
- tarefas manuais, repetitivas ou semanticamente difíceis;
- o que deve continuar determinístico e o que pode se beneficiar de AI;
- extração, classificação, comparação, resumo, revisão e divergências;
- riscos de alucinação, perda de contexto e falsa confiança;
- como medir qualidade antes de escolher modelos;
- modelos grandes, pequenos, locais e serviços externos;
- cache, deduplicação, processamento incremental e reaproveitamento;
- prevenção de reenvio de conteúdo que não mudou;
- tokens e custos por item, execução e decisão humana;
- saídas estruturadas e contexto mínimo;
- escalonamento para modelos mais caros ou revisão humana;
- privacidade, retenção e envio de conteúdo a terceiros;
- registro de modelo, prompt, versão, custo e evidência;
- onde o projeto atual dificulta ou facilita uma integração futura.

O parecer não implementará prompts, modelos ou integrações.

### Backoffice e operação

A revisão analisará o que já foi construído contra a finalidade definida pelo
proprietário: apoiar coleta, análise, revisão, monitoramento e controle.

O agente revisará:

- `apps/backoffice`, tokens, componentes, gráficos e shell;
- qualidade, acessibilidade, testes e manutenção da interface existente;
- adequação dos componentes atuais a fluxos operacionais reais;
- navegação, hierarquia visual e organização da informação;
- representação de fontes, execuções, falhas, candidatos e evidências;
- fluxos para acompanhar e controlar a coleta;
- revisão, comparação, correção, aprovação e rejeição;
- monitoramento de saúde, custos, volume, atrasos e erros;
- permissões e riscos de um console administrativo;
- partes que podem ser aproveitadas, simplificadas, refeitas ou removidas;
- proporcionalidade do design system e do processo spec-driven;
- lacunas entre a bancada de componentes e um backoffice utilizável;
- dependências de backend, banco, coleta e AI que outra especialidade decide.

O parecer não implementará telas nem escolherá sozinho a arquitetura geral.

## Síntese arquitetural

O agente integrador só começa depois que os quatro pareceres estiverem
incorporados à `main`. Ele receberá os pareceres completos e poderá conferir
suas evidências diretamente no projeto.

Sua função será:

- identificar concordâncias, conflitos e dependências;
- preservar divergências em vez de fabricar consenso;
- separar decisões reversíveis das caras ou difíceis de reverter;
- solicitar medições adicionais quando a evidência não decidir;
- apresentar duas ou três arquiteturas completas e coerentes;
- explicar custos, riscos, benefícios e consequências de cada alternativa;
- indicar o que seria mantido, substituído ou removido;
- cobrir coleta, banco, AI, backoffice, segurança e operação;
- entregar a decisão final ao proprietário.

O integrador poderá discordar dos especialistas, desde que mostre a evidência.
Ele não implementará nem transformará recomendação em decisão.

## Gerência do projeto

O agente gerente começa com a primeira rodada, mas atua somente sobre processo:

- acompanha estados, bloqueios e limitações sem orientar conclusões técnicas;
- registra dependências, riscos, decisões pendentes e responsáveis;
- não recebe nem distribui conclusões parciais entre especialistas;
- preserva divergências até a decisão do proprietário;
- não autoriza implementação.

Depois que o proprietário escolher uma arquitetura, o gerente transforma apenas
o caminho aprovado em fases, responsáveis, dependências, riscos, custos e
critérios de aceite. Ele também acompanhará orçamento de infraestrutura, AI e
tokens. Prazo não justifica esconder risco ou eliminar revisão.

## Limite do orquestrador

O orquestrador não revisará, avaliará, resumirá, corrigirá, comparará ou editará
nenhum parecer. Também não selecionará recomendações, resolverá divergências,
produzirá a síntese ou decidirá arquitetura.

Sua função se limita a:

- criar as tarefas com o mandato aprovado;
- garantir contextos separados;
- acompanhar estado, bloqueios e conclusão;
- encaminhar perguntas ao proprietário;
- confirmar mecanicamente branches, commits e arquivos;
- reunir os commits sem alterar o conteúdo;
- executar o portão do repositório e abrir o PR de consolidação;
- iniciar a etapa seguinte somente depois da autorização correspondente.

## Protocolo dos agentes

Todos os agentes da primeira rodada:

1. começam do mesmo commit da `main`;
2. recebem apenas este registro, o escopo próprio e o formato do parecer;
3. inspecionam o repositório diretamente;
4. tratam `docs/handoff-pre-backend.md` apenas como evidência histórica;
5. não recebem resumo conclusivo do orquestrador;
6. não leem branches ou relatórios dos outros agentes;
7. podem consultar estado remoto somente em modo de leitura;
8. usam pesquisa externa apenas quando necessária, com fontes primárias;
9. registram data e método de fatos temporários;
10. tratam falta de acesso como limitação, nunca como lacuna a preencher por
    suposição;
11. não alteram código, banco, credenciais, configuração, issues ou PRs;
12. alteram somente o arquivo de relatório atribuído;
13. fazem o próprio commit e publicam a própria branch;
14. não abrem PR;
15. encerram a tarefa informando arquivo, branch e commit.

## Formato obrigatório dos pareceres

Cada parecer especializado terá:

1. **Identificação** — especialidade, agente, commit, data, escopo e limitações;
2. **Veredito executivo** — no máximo dez pontos;
3. **O que foi examinado** — lista objetiva do que foi realmente inspecionado;
4. **O que está bem construído** — evidências que justificam preservação;
5. **Achados priorizados** — no máximo 15 achados principais;
6. **O que não foi provado** — ausência de evidência separada de defeito;
7. **Complexidade e dívida** — necessária, prematura, duplicada ou descartável;
8. **Recomendações** — manter, corrigir, simplificar, reescrever, remover ou
   medir antes de decidir;
9. **Dependências de outras especialidades**;
10. **Limites da revisão**.

Cada achado informará:

- identificador próprio;
- prioridade crítica, alta, média ou baixa;
- o que foi medido;
- evidência exata, preferencialmente arquivo e linha;
- conclusão e consequência prática;
- recomendação e alternativas consideradas;
- nível de confiança;
- o que faria o agente mudar de opinião.

O parecer principal terá aproximadamente 3.000 palavras no máximo. Ele não
transcreverá arquivos extensos, diário de raciocínio, código corretivo ou plano
de implementação. Anexos só serão usados quando uma medição não puder ser
resumida com segurança.

## Modelos e esforço

Os modelos disponíveis neste host e confirmados pelo proprietário serão:

| Agente | Modelo | Esforço |
| --- | --- | --- |
| coleta | `gpt-5.6-sol` | `medium` |
| banco | `gpt-5.6-sol` | `medium` |
| AI e custos | `gpt-5.6-sol` | `medium` |
| backoffice | `gpt-5.6-sol` | `medium` |
| arquiteto integrador | `gpt-5.6-sol` | `xhigh` |
| gerente | `gpt-5.6-luna` | `medium` |

Os quatro especialistas usam a mesma configuração para reduzir viés de
capacidade. Esforços `max` ou `ultra` não serão usados sem evidência de
necessidade. A escolha segue a orientação de começar com a configuração mais
leve que atinja o nível de qualidade necessário, conforme a
[documentação oficial de seleção de modelos](https://developers.openai.com/api/docs/guides/model-selection).

## Arquivos e branches

Cada agente é dono de um arquivo e uma branch:

| Agente | Branch | Arquivo |
| --- | --- | --- |
| gerente, primeira rodada | `docs/review-coordination` | `00-coordenacao-da-revisao.md` |
| coleta | `docs/review-collection` | `01-coleta.md` |
| banco | `docs/review-database` | `02-banco-de-dados.md` |
| AI e custos | `docs/review-ai-costs` | `03-ai-e-custos.md` |
| backoffice | `docs/review-backoffice` | `04-backoffice.md` |
| arquiteto, etapa posterior | `docs/review-architecture` | `05-sintese-arquitetural.md` |
| gerente, após a decisão | `docs/review-execution-plan` | `06-plano-de-execucao.md` |

Todos os caminhos são relativos a `docs/revisao-independente/`.

Quando os cinco agentes da primeira rodada terminarem, o orquestrador criará
uma branch de consolidação, reunirá os commits sem editar conteúdo, executará o
portão completo e abrirá um único PR. Somente depois do merge desse pacote o
arquiteto integrador poderá começar.

Cada parecer terá autoria, data, escopo, evidências e estado próprios. Um
parecer não será reescrito por outra pessoa para fabricar consenso; respostas e
revisões serão acrescentadas com atribuição.

## Ordem da fase

1. incorporar este protocolo;
2. obter autorização explícita para iniciar os agentes;
3. criar gerente e quatro especialistas no mesmo commit-base;
4. produzir cinco relatórios independentes em branches separadas;
5. consolidar mecanicamente os relatórios em um único PR;
6. incorporar o pacote à `main`;
7. iniciar o arquiteto integrador;
8. incorporar a síntese sem convertê-la em decisão;
9. o proprietário decide o caminho;
10. escrever os handoffs definitivos;
11. o gerente cria o plano de execução;
12. autorizar implementações em etapas explícitas.

Uma etapa posterior não começa apenas porque a anterior gerou um documento. O
registro precisa indicar a aprovação correspondente.

## Estado da fase

| Item | Estado |
| --- | --- |
| Mandato da revisão | confirmado |
| Profissionais como agentes de AI independentes | confirmado |
| Escopo da revisão de coleta | confirmado |
| Escopo da revisão do banco | confirmado |
| Escopo da revisão de AI e custos | confirmado |
| Escopo da revisão do backoffice | confirmado |
| Papel do arquiteto integrador | confirmado |
| Papel e entrada antecipada do gerente | confirmado |
| Formato dos pareceres | confirmado |
| Protocolo de independência | confirmado |
| Arquivos, branches e consolidação | confirmados |
| Modelos e esforços | confirmados |
| Agentes criados | não |
| Pareceres iniciados | não |
| Síntese arquitetural | não iniciada |
| Handoffs definitivos | não iniciados |
| Plano de implementação | não iniciado |
| Implementação do backend | não autorizada |

## Registro de decisões do processo

| Data | Decisão do proprietário | Efeito |
| --- | --- | --- |
| 2 de outubro de 2026 | profissionais podem mudar qualquer regra ou parte do projeto | o estado atual é evidência, não restrição |
| 2 de outubro de 2026 | revisões serão divididas por especialidade | coleta, banco, AI e backoffice são avaliados separadamente |
| 2 de outubro de 2026 | as revisões analisam o que já foi feito | seleção de fontes e novas funcionalidades ficam fora dos pareceres correspondentes |
| 2 de outubro de 2026 | economia de tokens é fundamental | AI e custos formam uma frente própria e o protocolo evita repetição |
| 2 de outubro de 2026 | o backoffice apoia coleta, análise e monitoramento | a revisão usa essa finalidade sem antecipar a forma |
| 2 de outubro de 2026 | os profissionais serão agentes de AI independentes | tarefas, contextos, branches e autoria ficam separados |
| 2 de outubro de 2026 | cada agente salva e versiona o próprio relatório | a primeira rodada termina em pacote único de relatórios |
| 2 de outubro de 2026 | o orquestrador não revisa relatórios | conteúdo segue intacto aos próximos agentes e ao proprietário |
| 2 de outubro de 2026 | modelos e esforços foram confirmados | especialistas usam Sol médio; arquiteto Sol xhigh; gerente Luna médio |
| 2 de outubro de 2026 | não escrever handoffs ainda | handoffs continuam posteriores à síntese e à decisão |

## Próximo passo

Depois do merge deste protocolo, solicitar ao proprietário autorização explícita
para criar os cinco agentes da primeira rodada. O merge, sozinho, não inicia as
tarefas.
