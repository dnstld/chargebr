# Tarefas — bancada de verificação

## 1. Fronteira

- [ ] 1.1 Ajustar a regra de importações proibidas em `packages/` para barrar framework de aplicação e importação de `apps/`, sem barrar o renderizador, e verificar que a verificação continua reprovando os dois casos proibidos
- [ ] 1.2 Verificar que importar o renderizador dentro de `packages/` passa na verificação, com um arquivo de fixture removido depois

## 2. Bancada

- [ ] 2.1 Instalar o renderizador e a ferramenta de documentação viva em `packages/ui` e verificar que a construção da documentação conclui com uma história mínima
- [ ] 2.2 Ligar o complemento que transforma histórias em teste e verificar que `pnpm verify` executa a história mínima dentro do estágio de testes, sem estágio novo
- [ ] 2.3 Verificar que `pnpm verify` continua com os mesmos quatro estágios, comparando a lista com a do ciclo anterior
- [ ] 2.4 Verificar que uma história que lança erro ao renderizar reprova a verificação nomeando a história, com plantio revertido
- [ ] 2.5 Verificar que uma história quebrada reprova a construção da documentação viva, com plantio revertido

## 3. Acessibilidade

- [ ] 3.1 Ligar a checagem de acessibilidade em modo de reprovação na configuração global da bancada
- [ ] 3.2 Verificar que uma violação plantada reprova `pnpm verify` nomeando a regra e o elemento, com plantio revertido
- [ ] 3.3 Verificar que uma história sem nenhuma declaração sobre acessibilidade também reprova ao violar, com plantio revertido
- [ ] 3.4 Implementar a listagem das histórias que rebaixam o modo e verificar que uma história rebaixada aparece na saída sem reprovar, com plantio revertido

## 4. Temas

- [ ] 4.1 Fazer cada história ser verificada nos temas claro e escuro, consumindo os tokens publicados
- [ ] 4.2 Verificar que uma violação de contraste presente só no tema escuro reprova, com o tema nomeado e o plantio revertido

## 5. Tokens

- [ ] 5.1 Verificar que a bancada renderiza com os tokens publicados, sem declarar valor de estilo próprio
- [ ] 5.2 Verificar que um valor literal de estilo plantado num arquivo da bancada reprova a verificação nomeando o arquivo, com plantio revertido

## 6. Determinismo e fechamento

- [ ] 6.1 Executar a verificação duas vezes sobre a mesma árvore e verificar que o conjunto de violações é idêntico
- [ ] 6.2 Executar `pnpm verify` na árvore limpa e verificar que passa com histórias e acessibilidade incluídas
