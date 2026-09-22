# Tarefas — átomos v1

## 1. Base da camada

- [x] 1.1 Estabelecer a convenção de contrato dos átomos, com estados expostos como valor enumerável, e verificar em teste que a enumeração é legível por código
- [x] 1.2 Implementar a checagem que compara estados declarados com histórias existentes, e provar com um estado sem história plantado e revertido
- [x] 1.3 Verificar que átomo que importa cliente de dados ou executa chamada de rede reprova, com plantio revertido

## 2. Texto e Número

- [x] 2.1 Implementar o átomo de texto com os papéis principal, contrafactual e contexto, consumindo tokens
- [x] 2.2 Implementar o átomo de número consumindo os tokens de dado numérico, e verificar em teste que números de larguras diferentes alinham pela mesma posição
- [x] 2.3 Verificar em teste que os três papéis diferem em ao menos uma propriedade computada não cromática

## 3. Hachura e marcador

- [x] 3.1 Implementar a hachura como átomo próprio, declarando o tamanho mínimo em que a textura é perceptível, com história que exercita esse limite
- [x] 3.2 Implementar o marcador de estado com eixo obrigatório no tipo, e verificar que uso sem eixo reprova em `verify:types`, com plantio revertido
- [x] 3.3 Verificar em teste que o eixo integra o nome acessível do marcador renderizado
- [x] 3.4 Verificar que marcador em estado não resolvido usa a hachura, e que preenchimento sólido nesse estado reprova, com plantio revertido

## 4. Ausência e evidência

- [x] 4.1 Implementar o átomo de ausência declarada e verificar em teste que nenhum caractere numérico é renderizado no conteúdo acessível
- [x] 4.2 Verificar que uso sem razão declarada reprova em `verify:types`, com plantio revertido
- [x] 4.3 Implementar a âncora de evidência com nome acessível obrigatório, alcançável por teclado
- [x] 4.4 Verificar que âncora sem nome acessível reprova na checagem de acessibilidade, nomeando a regra e o elemento, com plantio revertido

## 5. Fechamento

- [x] 5.1 Verificar que todos os átomos têm história para cada estado declarado, pela checagem da tarefa 1.2
- [x] 5.2 Executar `pnpm verify` na árvore limpa e verificar que passa, com as histórias dos seis átomos executadas nos dois temas
