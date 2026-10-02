# Registro-mestre da revisão independente

**Iniciado em:** 2 de outubro de 2026<br>
**Estado:** organização da revisão; pareceres ainda não iniciados<br>
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

## Frentes de revisão previstas

### Coleta e engenharia de dados

Revisará fontes, conectores, descoberta, extração, automação, idempotência,
falhas, repetição, observabilidade e operação do pipeline.

### Banco de dados e segurança

Revisará modelagem, integridade, histórico, migrations, acesso, RLS,
performance, auditoria, backup, recuperação e adequação da plataforma atual.

### AI, qualidade e economia de tokens

Revisará onde AI agrega valor, onde processos determinísticos são melhores,
seleção de modelos, contexto, cache, deduplicação, avaliação, custos, latência,
qualidade e participação humana.

### Backoffice e operação

Revisará os fluxos necessários para cadastrar fontes, iniciar e acompanhar
coletas, investigar falhas, comparar versões, revisar candidatos, corrigir,
aprovar, rejeitar e monitorar qualidade e custos.

### Síntese arquitetural

Uma pessoa integradora comparará os pareceres sem apagar divergências. Sua
função será apresentar alternativas completas, consequências, dependências e
riscos para decisão do proprietário, não impor a própria preferência.

### Gerência do projeto

Depois das decisões arquiteturais, a gerência transformará o caminho aprovado
em fases, responsáveis, dependências, riscos e critérios de aceite. Planejar
não autoriza iniciar implementação antes da aprovação correspondente.

## Forma de trabalho

As quatro revisões especializadas podem acontecer em paralelo depois que seus
escopos forem confirmados. Cada profissional trabalha de forma independente e
deve distinguir:

- o que mediu diretamente;
- o que concluiu a partir da medição;
- o que recomenda;
- alternativas consideradas;
- riscos e custos de cada alternativa;
- incertezas que ainda exigem prova;
- o que o faria mudar de opinião.

Nenhuma revisão recebe a incumbência de defender a solução atual. Também não
recebe a incumbência de substituí-la. Manter e mudar exigem evidência.

As divergências serão preservadas na síntese. Quando evidência adicional puder
resolvê-las, ela será solicitada. Quando a diferença for de prioridade, custo ou
valor, a decisão caberá ao proprietário.

## Ordem da fase

1. confirmar as especialidades necessárias;
2. definir o escopo e as perguntas de cada revisão;
3. selecionar os profissionais;
4. produzir os pareceres independentes;
5. confrontar achados e solicitar medições adicionais, se necessário;
6. produzir a síntese arquitetural com alternativas;
7. o proprietário decide o caminho;
8. escrever os handoffs definitivos;
9. a gerência cria o plano de execução;
10. autorizar implementações em etapas explícitas.

Uma etapa posterior não começa apenas porque a anterior gerou um documento. O
registro deve indicar a aprovação correspondente.

## Estrutura documental prevista

Somente este arquivo será criado nesta etapa dentro desta pasta. Os nomes abaixo
reservam a organização, mas não autorizam a criação antecipada dos documentos:

```text
docs/revisao-independente/
├── README.md
├── 01-coleta.md
├── 02-banco-de-dados.md
├── 03-ai-e-custos.md
├── 04-backoffice.md
├── 05-sintese-arquitetural.md
└── 06-plano-de-execucao.md
```

Cada parecer futuro terá autoria, data, escopo, evidências e estado próprios.
Um parecer não será reescrito por outra pessoa para fabricar consenso; respostas
e revisões serão acrescentadas com atribuição.

## Estado da fase

| Item | Estado |
| --- | --- |
| Mandato da revisão | confirmado |
| Especialidades iniciais | confirmadas conceitualmente |
| Escopo da revisão de coleta | pendente |
| Escopo da revisão do banco | pendente |
| Escopo da revisão de AI e custos | pendente |
| Escopo da revisão do backoffice | pendente |
| Profissionais selecionados | pendente |
| Pareceres iniciados | não |
| Síntese arquitetural | não iniciada |
| Handoffs definitivos | não iniciados |
| Plano de implementação | não iniciado |
| Implementação do backend | não autorizada |

## Registro de decisões do processo

| Data | Decisão do proprietário | Efeito |
| --- | --- | --- |
| 2 de outubro de 2026 | profissionais podem mudar qualquer regra ou parte do projeto | o estado atual é evidência, não restrição |
| 2 de outubro de 2026 | revisões podem ser divididas por especialidade | coleta, banco, AI e backoffice serão avaliados separadamente antes da síntese |
| 2 de outubro de 2026 | economia de tokens é fundamental | AI e custos formam uma frente própria de revisão |
| 2 de outubro de 2026 | o backoffice apoia coleta, análise e monitoramento | a revisão parte dessa finalidade, sem antecipar sua forma |
| 2 de outubro de 2026 | não escrever handoffs ainda | somente este registro de processo pode ser criado agora |

## Próxima decisão

Definir, em conversa com o proprietário, o escopo e as perguntas da revisão de
coleta e engenharia de dados. Essa conversa não inicia o parecer nem seleciona
uma solução.
