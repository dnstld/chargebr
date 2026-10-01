# Spec Delta

## ADDED Requirements

### Requirement: Conjunto de token que não varia por tema tem contraste medido uma vez, fora da varredura por tema

Um grupo de tokens pode ser declarado com o mesmo valor nos dois temas — hoje,
só a camada semântica tem exemplo disso, em `semantic/shared.json`, para
espaço, raio e tipografia. Quando esse mecanismo é usado para um grupo de
**cor**, o grupo SHALL ter contraste medido por uma checagem própria,
executada uma única vez contra as próprias superfícies do grupo — nunca pela
checagem de contraste por tema que já existe, e SHALL NOT usar os prefixos de
nome `color.surface.*` ou `color.action.*`, que essa checagem já varre
automaticamente a partir da fonte resolvida.

A checagem própria SHALL aplicar os mesmos pisos já declarados — 4,5:1 para
par de texto, 3:1 para objeto gráfico — e SHALL reprovar nomeando o par, a
razão medida e o piso, no mesmo formato que a checagem por tema já usa.

**Por quê:** a trilha, o painel e a barra de conteúdo da navegação são a
primeira superfície do sistema que não segue o tema do leitor — decisão do
dono, registrada em `design.md` deste ciclo. A checagem por tema
(`contrast.test.ts`) mede a cor de ação do tema **ativo** contra as
superfícies **daquele tema**; aplicá-la ao conjunto fixo mediria a cor de ação
de cada tema contra uma superfície que não é dele, uma comparação sem sentido
— a trilha nunca hospeda a cor de ação do conteúdo, tem a própria. Os
prefixos de nome que a varredura por tema já reconhece
(`color-surface-[a-z0-9-]+`, `color-action-[a-z0-9-]+`, em `contrast.ts`) são
descoberta automática por desenho — qualquer nome novo sob eles entraria na
varredura por tema sem edição do arquivo de checagem, exatamente o
comportamento que esta checagem nova precisa evitar. Nomear o grupo fora
desses prefixos é o que garante que ele não entra lá por acidente; a checagem
própria é o que garante que ele é medido assim mesmo.

#### Scenario: Par do conjunto fixo abaixo do piso reprova

- **WHEN** um par de texto ou de destaque do conjunto fixo fica abaixo do piso correspondente contra sua própria superfície
- **THEN** a checagem própria do conjunto falha, nomeando o par, a razão medida e o piso
- **Prova:** valor plantado no grupo fixo, checagem própria falhando, plantio revertido

#### Scenario: Conjunto fixo aprovado registra o pior par

- **WHEN** a checagem própria é executada sobre os valores correntes do conjunto fixo
- **THEN** ela passa e registra o pior par e sua margem sobre o piso
- **Prova:** execução registrada, com o valor do pior par

#### Scenario: Nome do conjunto fixo não entra na varredura por tema

- **WHEN** a checagem de contraste por tema (`contrast.test.ts`) é executada sobre a fonte corrente, com o conjunto fixo declarado
- **THEN** nenhum token do conjunto fixo aparece entre as superfícies ou ações descobertas por ela
- **Prova:** execução da checagem por tema sobre a fonte com o conjunto fixo presente, conferindo a ausência dos seus nomes nas listas descobertas

#### Scenario: Token do conjunto fixo presente nos dois temas sem arquivo duplicado

- **WHEN** a geração lê o conjunto fixo declarado uma vez, fora de `light.json`/`dark.json`
- **THEN** o valor resolvido é idêntico nos dois temas, sem exigir uma segunda declaração
- **Prova:** teste de geração que resolve o token nos dois temas e compara os valores
