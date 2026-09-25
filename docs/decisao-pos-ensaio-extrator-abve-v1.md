# Decisão: próximo passo após o ensaio do extrator ABVE v1

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este documento avalia a evidência produzida pelo primeiro ensaio controlado do extrator ABVE v1 e decide se ela justifica ampliar o contrato ou criar persistência para candidatos.

Esta etapa é somente documental. Ela não altera o extrator, o collector, o schema, o Supabase, os dados canônicos, as credenciais ou os artefatos locais.

## Decisão proposta

1. **não ampliar o contrato do extrator ABVE v1 agora;**
2. **não criar persistência de candidatos ou histórico de revisão agora;**
3. **encerrar o ciclo discover do extrator ABVE v1 com o escopo atual;**
4. retomar qualquer uma dessas frentes somente em um ciclo separado, depois do gatilho e das evidências registrados em `pontos-abertos.md`.

O código existente permanece válido como piloto reproduzível do item `19617`. “Não ampliar” não significa descartar o piloto; significa impedir que um único caso seja apresentado como contrato geral.

## Evidência disponível

O [resultado do ensaio controlado](resultado-ensaio-extrator-abve-v1.md) demonstrou:

- handoff reproduzível entre run, manifest e re-fetch;
- igualdade do fingerprint esperado e observado;
- produção determinística de um candidato de conteúdo e um candidato quantitativo;
- extração correta de `25782 vehicle_registration`, julho de 2026, Brasil;
- exclusão de percentual, acumulado, crescimento, projeção e outras tecnologias;
- revisão humana separada dos artefatos determinísticos;
- decisão `link_existing` contra a carga canônica `0003`;
- ausência de escrita canônica.

Essa evidência é suficiente para aceitar o piloto. Ela não é suficiente para afirmar que a mesma regra cobre outras publicações ABVE.

## Por que o contrato não deve ser ampliado

O ensaio vivo cobriu uma única combinação:

| Dimensão | Cobertura observada |
| --- | --- |
| Fonte | ABVE |
| Formato | post WordPress |
| Item | `19617` |
| Afirmação | quantidade mensal de emplacamentos BEV |
| Unidade | `vehicle_registration` |
| Período | mês completo |
| Geografia | Brasil |
| Resultado humano | `link_existing` |

Ainda não houve ensaio vivo que demonstre:

- outro item ou outra estrutura editorial da ABVE;
- `no_candidates` diante de uma publicação válida sem a afirmação completa;
- mais de uma afirmação elegível no mesmo conteúdo;
- uma correção ou mudança de versão depois da coleta;
- unidade, período, geografia ou sujeito diferentes;
- decisão humana `accept_new`, `correct` ou `reject`;
- repetição do mesmo candidato a partir de outro run real.

Ampliar agora exigiria transformar hipóteses em regras. O contrato v1 continuará recusando qualquer item fora do piloto aprovado.

## Por que não deve existir persistência agora

O único candidato vivo recebeu `link_existing`: sua publicação e sua observação já estão representadas pela carga canônica `0003`. Não há candidato novo, corrigido ou rejeitado que exija estado persistido.

Criar tabelas neste momento obrigaria a antecipar, sem evidência operacional:

- identidade e versionamento de candidatos;
- histórico imutável de decisões;
- autoria e autorização de revisão;
- transições entre `pending`, `accept_new`, `link_existing`, `correct` e `reject`;
- retenção de evidência mínima e expiração de artefatos locais;
- relação entre candidato, conteúdo canônico, observação e correção;
- tratamento de concorrência e idempotência da decisão humana.

Os artefatos locais privados atendem ao piloto atual. Persistência deverá responder a um caso real que não possa ser tratado com segurança por esse mecanismo.

## O que permanece válido

- a CLI estrita do extrator;
- o contrato do pacote e seus hashes determinísticos;
- a leitura somente de run e endpoint;
- a prova de manifest e fingerprint antes da extração;
- a regra estreita do item `19617`;
- os artefatos locais em modo privado;
- o vocabulário de revisão humana;
- a proibição de promoção canônica automática.

Nenhum código precisa ser removido ou reclassificado como produção geral. O extrator continua sendo um piloto local controlado.

## Encerramento do ciclo discover

O ciclo discover do extrator ABVE v1 cumpriu sua pergunta central: é possível transformar, de forma reproduzível e revisável, um item ABVE previamente coletado em um candidato quantitativo sem duplicar nem alterar o canônico.

A resposta é **sim para o caso piloto aprovado**. O ciclo também revelou o limite: um caso `link_existing` não sustenta generalização nem persistência.

Por isso, o encerramento correto é parar no piloto validado. O próximo ciclo do produto poderá priorizar o conector ANEEL previsto na direção collection-first ou abrir uma descoberta ABVE própria quando surgir um gatilho real. Nenhuma dessas opções é escolhida neste documento.

## Critérios para uma futura ampliação

Uma proposta de ampliação deverá, antes de mudar o contrato:

1. selecionar explicitamente os novos casos e explicar por que são representativos;
2. preservar fixtures literais de cada estrutura observada;
3. demonstrar ao menos um resultado positivo e um `no_candidates` vivo;
4. provar que o novo caso não reduz as garantias de fingerprint, segurança e idempotência;
5. separar regras específicas da ABVE de qualquer abstração compartilhada;
6. registrar revisão humana e divergências de cada caso;
7. manter promoção canônica fora do extrator.

Esses critérios são condição de entrada para uma nova decisão, não autorização antecipada para implementar.

## Critérios para uma futura persistência

A modelagem de persistência somente será retomada quando existir pelo menos um candidato vivo cuja decisão ou histórico não possa ser preservado adequadamente em artefato local privado. A proposta deverá trazer:

1. o caso concreto e sua decisão humana;
2. requisitos de autoria, auditoria, retenção e correção;
3. prova de que `link_existing` não duplica registros canônicos;
4. modelo de transições e idempotência;
5. separação explícita entre candidato e dado canônico;
6. migration e grants em PRs posteriores e separados.

## Fora de escopo

- alterar o item piloto ou aceitar outros itens;
- implementar ANEEL;
- criar tabelas, migrations, roles, grants ou policies;
- promover ou vincular registros canônicos;
- automatizar execução ou revisão;
- escolher runtime, backend ou hospedagem;
- apagar os artefatos locais do ensaio;
- transformar o piloto em serviço de produção.

## Perguntas para decisão

1. Está correto manter o extrator ABVE v1 limitado ao piloto do item `19617`?
2. Está correto não criar persistência porque o único resultado vivo foi `link_existing`?
3. Está correto encerrar o ciclo discover atual sem escolher automaticamente o próximo ciclo?
4. Os gatilhos registrados são suficientes para reabrir ampliação e persistência com evidência real?

Se todas as respostas forem `sim`, registre `CONFIRMADO`. Se alguma resposta for `não`, indique o número e a correção necessária. Este documento não deverá ser incorporado antes da decisão.

## Resultado da decisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 25 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as quatro decisões. O extrator ABVE v1 permanece limitado ao item `19617`; nenhuma persistência de candidatos será criada; o ciclo discover atual está encerrado; e ampliação ou persistência somente poderão ser retomadas pelos gatilhos documentados.
