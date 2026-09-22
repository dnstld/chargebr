# Tarefas — primitivas de domínio v1

## 1. Vocabulário

- [x] 1.1 Criar o módulo de vocabulário com os termos dos três eixos, dos estados e das razões de bloqueio, e verificar em teste que todos os termos exibidos pelas primitivas saem dele
- [x] 1.2 Implementar a sobrescrita termo a termo por propriedade e verificar em teste que um termo fornecido substitui o padrão
- [x] 1.3 Acrescentar a checagem que reprova rótulo em português declarado dentro de uma primitiva, e provar com um plantio revertido

## 2. Fronteira com o contrato

- [x] 2.1 Definir as formas de entrada das três primitivas, próprias da biblioteca, sem referência a nome de coluna ou projeção
- [x] 2.2 Acrescentar a regra que reprova importação de tipo ou esquema do contrato de leitura dentro de `packages/ui`, e provar com um plantio revertido
- [x] 2.3 Derivar as fixtures das histórias a partir da saída real do contrato para a carga `0007`, registrando no arquivo de fixtures de onde cada campo veio

## 3. Valor com proveniência

- [x] 3.1 Implementar a primitiva de valor com proveniência obrigatória no tipo, e verificar que uso sem ela reprova em `verify:types`, com plantio revertido
- [x] 3.2 Verificar em teste que o caminho até a evidência recebe foco por teclado e tem nome acessível que o identifica
- [x] 3.3 Implementar os três papéis em posições distintas e verificar em teste que contrafactual e principal diferem em posição e em propriedade computada não cromática

## 4. Projeção bloqueada

- [x] 4.1 Implementar a primitiva de projeção bloqueada com razão obrigatória no tipo, e verificar que uso sem razão reprova em `verify:types`, com plantio revertido
- [x] 4.2 Verificar em teste que nenhum caractere numérico existe no conteúdo acessível da primitiva renderizada

## 5. Painel de estados

- [x] 5.1 Implementar o painel compondo o marcador do ciclo 4, sem reimplementá-lo
- [x] 5.2 Verificar em teste que existem três itens e que o nome acessível de cada um contém seu eixo
- [x] 5.3 Verificar em teste que, com um eixo sem valor, o painel continua exibindo três itens e o item vazio declara a ausência

## 6. Cobertura e fechamento

- [x] 6.1 Estender a checagem de cobertura de estados para incluir as primitivas, e provar com um estado de primitiva sem história plantado e revertido
- [x] 6.2 Executar `pnpm verify` três vezes seguidas em árvore limpa e verificar que passa nas três, com as histórias das primitivas executadas nos dois temas
