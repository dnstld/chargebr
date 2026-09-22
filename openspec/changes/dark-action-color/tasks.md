# Tarefas — cor de ação do tema escuro

Ordem: o registro do estado atual vem antes de qualquer edição, porque é contra
ele que a regressão da paleta é conferida no fim. O critério vem antes dos
valores, porque um critério escrito depois do valor que ele aprova não prova
nada.

## 1. Registro do estado atual

- [ ] 1.1 Executar `pnpm --filter @chargebr/tokens palette:report` e guardar a saída dos dois temas no corpo do PR; pronto quando o registro contém, por tema, o resultado das seis checagens, o pior par e sua distância
- [ ] 1.2 Registrar no corpo do PR a matriz de contraste medida hoje, nos dois temas, para os sete pares da tabela de `design.md`; pronto quando os sete valores do tema escuro batem com os de `design.md`, incluindo os dois que reprovam

## 2. Critério de contraste dos pares de ação

- [ ] 2.1 Criar o módulo de critério em `packages/tokens/src`, no formato de `palette.ts`: piso de 4,5:1, piso de 3:1 para objeto gráfico, tolerância de 0,02 entre os passos de hover, e uma função que devolve a lista de violações a partir dos tokens resolvidos de um tema; pronto quando `pnpm verify:types` passa e o módulo não importa nada de `packages/ui`
- [ ] 2.2 Fazer o conjunto de superfícies neutras ser lido dos tokens resolvidos, e não de uma lista escrita no módulo; pronto quando um teste que planta uma superfície neutra nova a vê aparecer na saída da checagem sem nenhuma edição no arquivo de teste
- [ ] 2.3 Escrever o teste que executa a checagem sobre os tokens correntes nos dois temas; pronto quando ele reprova com os valores de hoje, nomeando `action.primary` × `surface.raised` no escuro (4,263:1) e o hover no escuro (2,308:1) — este teste tem de falhar antes de o grupo 3 existir
- [ ] 2.4 Escrever os testes de plantio que provam cada mensagem de reprovação, um por cenário do requisito "Cor de ação legível contra toda superfície neutra do tema": par abaixo do piso, reprovação em uma superfície só, superfície nova, anel de foco descolado; pronto quando cada um falha com o par, a razão, o piso e o tema nomeados, e passa depois de revertido o plantio
- [ ] 2.5 Escrever os testes de plantio do requisito "Estado de interação com legibilidade provada": hover abaixo do piso, valor de ação repetido entre temas, hover mais escuro que o repouso, passos divergentes entre temas; pronto quando o segundo reproduz o defeito exato deste ciclo — `indigo.600` nos dois temas — e a mensagem carrega a razão medida **e** a causa nomeada, "não invertido"
- [ ] 2.6 Implementar a varredura de valor repetido como diagnóstico que anota a violação já produzida por um piso, e nunca como violação própria; pronto quando um teste alimenta a checagem com um par de temas sintético — superfícies escuras nos dois, onde a repetição sustenta os dois pisos — e a lista de violações sai vazia, com o valor repetido aparecendo apenas no registro
- [ ] 2.7 Escrever o teste que planta uma superfície neutra sem nenhum consumidor de ação e confere que ela é varrida ao piso de 4,5:1 assim mesmo; pronto quando a reprovação nomeia a superfície plantada e não há caminho no código que a isente
- [ ] 2.8 Criar a entrada de registro `contrast:report` em `packages/tokens/package.json`, no formato de `palette:report`; pronto quando ela imprime, por tema, a razão em repouso, a razão em hover, o passo entre eles e a pior margem sobre o piso

## 3. Primitivos novos

- [ ] 3.1 Acrescentar `color.indigo.300` = `#8788FE` (componentes sRGB `[0.5294, 0.5333, 0.9961]`) a `packages/tokens/tokens/primitive/color.json`, com descrição dizendo que é a cor de ação do tema escuro; pronto quando `pnpm --filter @chargebr/tokens build` regenera as duas saídas com o token presente e `verify` não acusa literal fora da camada primitiva
- [ ] 3.2 Acrescentar `color.indigo.200` = `#A8AEFE` (componentes sRGB `[0.6588, 0.6824, 0.9961]`), com descrição dizendo que é o hover da cor de ação do tema escuro; pronto pelo mesmo critério de 3.1
- [ ] 3.3 Escrever o teste que confere as propriedades dos dois primitivos novos em OKLCH — matiz dentro de 280,4° ± 15°, e o passo de luminosidade de `indigo.300` para `indigo.200` igual a 0,096 dentro da tolerância de 0,02; pronto quando o teste passa e falha se qualquer dos dois hexadecimais for alterado
- [ ] 3.4 Confirmar que `color.indigo.400` conserva `#706FE2` byte a byte e que sua descrição segue nomeando a série 1 do tema escuro; pronto quando `git diff` do arquivo de primitivos mostra apenas linhas acrescentadas

## 4. Referências semânticas do tema escuro

- [ ] 4.1 Apontar `color.action.primary` do tema escuro para `{color.indigo.300}`; pronto quando o teste de 2.3 deixa de reprovar nos pares de repouso e a saída registra 6,316:1 contra `surface.base` e 5,882:1 contra `surface.raised`
- [ ] 4.2 Apontar `color.action.primary-hover` do tema escuro para `{color.indigo.200}`; pronto quando o par com `text.on-action` registra 9,181:1 e o teste de valor repetido entre temas passa
- [ ] 4.3 Apontar `color.focus.ring` do tema escuro para `{color.indigo.300}`; pronto quando o teste do anel de foco confere que os dois temas resolvem `focus.ring` e `action.primary` para o mesmo primitivo
- [ ] 4.4 Confirmar que `color.chart.series.1/2/3` dos dois temas não foram tocados; pronto quando `git diff` de `semantic/dark.json` e `semantic/light.json` não mostra nenhuma linha dentro dos blocos `series`

## 5. Superfície de gráfico

- [ ] 5.1 Acrescentar à checagem do grupo 2 a conferência de que `color.chart.surface` de cada tema resolve para o valor de alguma superfície neutra declarada do mesmo tema; pronto quando ela passa hoje (claro: `surface.base`; escuro: `surface.raised`) e reprova com um valor próprio plantado, nomeando o tema e o valor
- [ ] 5.2 Acrescentar a `packages/ui/src/charts/chart.assert.ts` a afirmação de que dentro de `[data-plot]` não há elemento alcançável por foco nem manipulador de ponteiro; pronto quando ela é chamada por toda história de gráfico e falha com um elemento focalizável plantado dentro do desenho
- [ ] 5.3 Estender a afirmação de projeção bloqueada para cobrir o mesmo, no caminho em que o desenho é substituído; pronto quando a história de projeção bloqueada a executa nos dois temas
- [ ] 5.4 Executar `pnpm verify` com um elemento focalizável plantado dentro de `[data-plot]` e confirmar que a reprovação nomeia a história e o elemento, nos dois temas; pronto quando o plantio é revertido e a verificação volta a passar

## 6. Regressão e fechamento

- [ ] 6.1 Reexecutar `pnpm --filter @chargebr/tokens palette:report` e comparar com o registro de 1.1; pronto quando os dois temas saem com os mesmos piores pares e as mesmas distâncias, dígito a dígito — a paleta categórica não mudou, e é isto que prova
- [ ] 6.2 Executar `contrast:report` e registrar no corpo do PR a matriz nova dos dois temas; pronto quando os sete pares do tema escuro batem com a coluna "escuro (proposto)" de `design.md` e a pior margem sobre o piso é 1,382
- [ ] 6.3 Confirmar que as saídas geradas correspondem à fonte e que a geração é determinística; pronto quando duas gerações consecutivas produzem arquivos idênticos e nenhum arquivo gerado aparece editado à mão no diff
- [ ] 6.4 Executar `pnpm verify` inteiro; pronto quando os quatro estágios passam, a lista de estágios é a mesma de antes da mudança, e a saída não lista nenhuma exceção de acessibilidade nova
- [ ] 6.5 Registrar no corpo do PR, na seção Verificação, a execução do axe sobre as histórias nos dois temas; pronto quando o registro existe — afirmação de acessibilidade sem execução registrada não vale
