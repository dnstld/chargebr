# Decisão: primeiro ciclo do fluxo de inteligência

## Estado

`PROPOSTA PARA REVISAO`

O merge deste documento na `main` registra a aprovação da decisão. Nenhuma coleta ou carga de dados é autorizada antes do merge.

## Contexto

O [piloto da fundação](conclusao-piloto-da-fundacao.md) validou três casos por meio de seeds descartáveis. Essa etapa demonstrou que o modelo consegue representar os recortes avaliados, mas não testou o uso operacional de um registro canônico persistente.

A estratégia de produto estabelece que o estágio seguinte é o fluxo de inteligência: descoberta, triagem, busca de origem, captura, estruturação, verificação, revisão humana e uso do resultado aceito.

O primeiro ciclo deve provar esse caminho com risco e volume mínimos antes de qualquer automação ou coleta recorrente.

## Decisão proposta

O primeiro ciclo pós-piloto produzirá **um único acontecimento canônico**, preparado manualmente, revisado antes da carga e persistido no Supabase somente depois do aceite e do merge do respectivo PR.

O ciclo não importará registros do Notion e não reutilizará um dos três casos do piloto como se fosse dado operacional novo.

## Objeto do ciclo

A publicação escolhida deverá:

- não ter sido usada nos pilotos;
- ter sido publicada, preferencialmente, nos 30 dias anteriores à seleção;
- possuir relação material e explícita com a mobilidade elétrica no Brasil;
- ter ao menos uma fonte primária acessível;
- sustentar um único acontecimento já realizado ou oficialmente publicado;
- não exigir cálculo derivado, reconciliação quantitativa complexa ou reconstrução de uma cadeia regulatória;
- caber no schema aprovado sem contornar uma relação estrutural por texto livre.

Fontes adicionais poderão ser usadas somente quando forem necessárias para verificar o acontecimento ou registrar uma limitação. A ausência de uma publicação elegível interrompe a seleção; ela não autoriza reduzir os critérios.

## Fluxo aprovado

### 1. Seleção

Pesquisar poucos candidatos recentes e escolher um caso simples com fonte primária. A justificativa de relevância para o Brasil deve ser registrada antes da estruturação.

### 2. Preparação reproduzível

Criar uma carga idempotente em `data/canonical/0001_<identificador>.sql`. O arquivo deve conter somente os registros necessários para o acontecimento e deve poder ser executado novamente sem criar duplicatas.

A carga canônica não é migration e não integra `supabase/seed.sql`:

- migrations continuam reservadas a mudanças de schema;
- o seed continua reservado a dados reproduzíveis de desenvolvimento e teste;
- `data/canonical/` passa a guardar cargas de dados reais aprovadas e auditáveis.

### 3. Validação descartável

Antes da revisão humana, executar a carga inteira em uma transação e revertê-la. Confirmar que a cadeia pode ser consultada, que os identificadores estáveis impedem duplicação e que nenhum dado de teste permaneceu no projeto remoto.

### 4. Revisão humana

Preparar `docs/revisao-carga-canonica-0001.md` com:

- fonte, título, URL e data da publicação;
- afirmação observada e evidência correspondente;
- acontecimento proposto, data, tipo, fase e relevância para o Brasil;
- nível de verificação e limitações;
- registros e vínculos que serão persistidos;
- resultado da validação descartável;
- perguntas curtas para a pessoa revisora.

A revisão deve confirmar que a fonte sustenta o acontecimento, que a redação não excede a evidência e que o pacote não omite uma incerteza material.

### 5. Aprovação no GitHub

O PR da carga e de seu pacote de revisão só pode ser incorporado à `main` depois do aceite expresso da pessoa revisora. Uma correção solicitada deve produzir nova versão antes do merge.

### 6. Persistência

Depois do merge, executar no Supabase exatamente a carga aprovada e confirmar:

- um acontecimento com `workflow_status = 'accepted'`;
- nível de verificação diferente de `unverified`;
- cadeia completa até a fonte e a publicação;
- vínculos especializados aplicáveis;
- ausência de duplicatas;
- nenhuma alteração de schema produzida pela carga.

O resultado da execução será registrado em `docs/resultado-carga-canonica-0001.md`, em um PR separado. Falha de execução não autoriza editar silenciosamente o arquivo já aprovado.

## Critérios de sucesso

O primeiro ciclo será concluído quando:

1. uma pessoa revisora aceitar o acontecimento usando o pacote e as fontes preservadas;
2. a carga aprovada for incorporada à `main` antes de chegar ao Supabase;
3. o acontecimento e sua cadeia de proveniência forem persistidos sem duplicatas;
4. uma consulta posterior reconstruir fonte, publicação, observação, evidência e acontecimento;
5. a execução e as contagens finais forem documentadas;
6. nenhuma lacuna de fundação tiver sido ocultada para concluir o ciclo.

## Regra para lacunas

Se o caso revelar que o schema ou a metodologia são insuficientes, o ciclo para antes da persistência. A lacuna deve receber identificador, severidade e decisão própria. O acontecimento não será simplificado apenas para caber no modelo.

Uma extensão de schema continua exigindo decisão, migration, aplicação e verificação em etapas separadas antes de uma nova versão da carga.

## Fora do escopo

- automação de descoberta ou captura;
- persistência de candidatos ou itens ainda em revisão;
- mais de um acontecimento aceito;
- importação histórica ou migração do Notion;
- interface de administração ou produto público;
- publicação editorial, newsletter ou alerta;
- metas de produtividade, frequência ou cobertura;
- avaliação de escala e desempenho.

## O que esta decisão ainda não define

Esta decisão não escolhe antecipadamente a publicação. Depois do merge, uma etapa de seleção apresentará poucos candidatos elegíveis com suas fontes primárias. A escolha será registrada antes da preparação da carga.

Também não transforma este procedimento manual no fluxo definitivo do produto. Ao final, o ciclo deverá indicar o que pode ser repetido, o que precisa ser simplificado e qual capacidade operacional deve ser testada em seguida.
