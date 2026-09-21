# Tarefas — tokens v1

## 1. Fonte e geração

- [ ] 1.1 Definir a fonte DTCG da camada primitiva com cor, espaço, raio, sombra e tipografia, e verificar que o arquivo é válido no formato
- [ ] 1.2 Configurar a geração de CSS custom properties e de constantes TypeScript a partir da mesma fonte, e verificar que um valor alterado aparece nas duas saídas
- [ ] 1.3 Verificar que duas gerações consecutivas sobre a mesma fonte produzem arquivos idênticos, comparando hash por arquivo
- [ ] 1.4 Acrescentar um teste que reprova quando um arquivo gerado é editado à mão, e provar com uma edição plantada e revertida

## 2. Camadas

- [ ] 2.1 Definir a camada semântica referenciando apenas a primitiva, incluindo as superfícies de gráfico dos dois temas
- [ ] 2.2 Definir a camada de componente com o mínimo que prova a regra de referência, referenciando apenas a semântica
- [ ] 2.3 Acrescentar o teste de referência dirigida e provar com três plantios revertidos: componente referenciando primitivo, semântico referenciando componente, e primitivo referenciando qualquer coisa
- [ ] 2.4 Acrescentar o teste que reprova valor literal fora da camada primitiva, e provar com um literal plantado e revertido

## 3. Temas

- [ ] 3.1 Definir o tema escuro redefinindo as mesmas custom properties, com preferência do sistema como padrão e atributo no documento como override
- [ ] 3.2 Acrescentar o teste que reprova token presente num tema e ausente no outro, e provar com um plantio revertido
- [ ] 3.3 Verificar em teste que alternar o tema muda os valores computados sem nova geração, lendo antes e depois

## 4. Paleta

- [ ] 4.1 Implementar as seis checagens como teste, declarando no próprio arquivo o modelo de simulação e os limiares de corte
- [ ] 4.2 Executar as checagens sobre a paleta corrente nos dois temas, contra as superfícies definidas em 2.1, e registrar por tema o pior par e sua distância
- [ ] 4.3 Verificar que um valor reprovado bloqueia `pnpm verify` nomeando a checagem, o par e o tema, com plantio revertido
- [ ] 4.4 Verificar que superfície de gráfico ausente faz a checagem falhar nomeando o tema, em vez de assumir um valor implícito

## 5. Tipografia

- [ ] 5.1 Declarar a família tipográfica somente na camada primitiva e acrescentar o teste que reprova declaração em outra camada, com plantio revertido
- [ ] 5.2 Definir os tokens de dado numérico com algarismos tabulares e zero cortado, e verificar em teste que os dois recursos estão declarados

## 6. Acesso tipado

- [ ] 6.1 Expor as constantes TypeScript de modo que um nome de token inexistente falhe em `verify:types`, e provar com uma referência plantada e revertida

## 7. Fechamento

- [ ] 7.1 Executar `pnpm verify` na árvore limpa e verificar que passa com a checagem de paleta incluída no estágio de testes
