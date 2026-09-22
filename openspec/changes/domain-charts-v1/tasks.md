# Tarefas — gráficos de domínio v1

## 1. Hachura única

- [x] 1.1 Extrair ângulo, espaçamento e espessura da hachura para uma definição compartilhada, e fazer o átomo do ciclo 4 passar a consumi-la, sem mudança visual
- [x] 1.2 Implementar o padrão SVG da hachura derivando da mesma definição
- [x] 1.3 Acrescentar a checagem que compara as duas definições e reprova divergência, e provar com um plantio revertido

## 2. Fundação da camada

- [x] 2.1 Instalar visx e criar a base dos gráficos, com a forma declarando qual lista de pares a paleta deve usar
- [x] 2.2 Implementar a checagem de paleta por forma, executando a lista de pares declarada, e registrar o resultado por forma e por tema
- [x] 2.3 Implementar o limite de séries por forma no tipo, e verificar que excesso reprova em `verify:types`, com plantio revertido
- [x] 2.4 Verificar que declarar duas escalas de valor no mesmo gráfico reprova em `verify:types`, com plantio revertido

## 3. Estados do domínio

- [x] 3.1 Implementar a substituição do gráfico pela primitiva de bloqueio, e verificar em teste a ausência de eixo, grade e rótulo de escala
- [x] 3.2 Implementar a interrupção da ligação no ponto não resolvido e a marca hachurada, e verificar em teste os segmentos desenhados
- [x] 3.3 Implementar o tratamento de ponto ausente — sem marca, sem interpolação, ausência declarada — e verificar em teste

## 4. Identidade e acesso

- [x] 4.1 Implementar a legenda presente a partir de duas séries, alcançável na leitura assistida, e verificar em teste
- [x] 4.2 Implementar a representação equivalente em texto, com valores e caminho até a evidência, e verificar em teste que ambos estão presentes

## 5. Fixtures e formas

- [x] 5.1 Derivar as fixtures possíveis da saída real do contrato, anotando a origem de cada campo
- [x] 5.2 Declarar como sintética, no próprio arquivo, toda fixture que não vier do contrato, e acrescentar a checagem que reprova fixture sem declaração de origem, com plantio revertido
- [x] 5.3 Criar as histórias de cada forma, exercitando os estados do domínio em cada uma onde forem aplicáveis

## 6. Fechamento

- [x] 6.1 Verificar que todo estado declarado nas formas tem história, pela checagem estendida no ciclo 5
- [x] 6.2 Executar `pnpm verify` três vezes seguidas em árvore limpa e verificar que passa nas três, com as histórias executadas nos dois temas
