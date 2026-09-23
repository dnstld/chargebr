# Tarefas — shell do back office

Ordem: o perímetro dos guardiões fecha **antes** de existir código novo, porque
um guardião estendido depois do código nasce já anistiando o que passou. A
moldura vem antes da aplicação, porque a aplicação a consome. A camada 2 vem por
último, porque ela afirma sobre o que a aplicação emite.

## 1. Perímetro dos guardiões, antes do código novo

- [x] 1.1 Estender o perímetro de `tools/checks/style-literals.test.ts` de `packages/` para `packages/` e `apps/`, mantendo a isenção do pacote de tokens por nome de pacote e não por posição na lista de áreas; pronto quando o guardião passa na árvore corrente e a varredura enumera arquivos das duas áreas
- [x] 1.2 Plantar uma aplicação-fixture descartável sob `apps/` com um literal de cor e outro de espaçamento; pronto quando o guardião falha nomeando arquivo e linha de cada um, sem nenhuma edição no próprio guardião, e volta a passar com o fixture removido
- [x] 1.3 Confirmar que a isenção continua onde deve: plantar literal num arquivo de `packages/ui` e outro na camada primitiva da fonte de tokens; pronto quando o primeiro reprova e o segundo não, e os dois plantios são revertidos
- [x] 1.4 Confirmar que a lógica e o perímetro de `tools/checks/type-suppression.test.ts` não precisam de alteração, e excluir dele o diretório de artefatos da construção, que o framework preenche com supressão sem justificativa; pronto quando um `any` explícito plantado na aplicação-fixture de 1.2 reprova nomeando arquivo e linha, sem edição na lógica do guardião

## 2. A moldura, em `@chargebr/ui/shell`

- [x] 2.1 Criar `packages/ui/src/shell/` com o componente de moldura — salto, região de cabeçalho e região de conteúdo principal, sem `"use client"`, recebendo `productName`, `skipLabel` e `children` —, e a folha CSS Module consumindo só token; pronto quando `verify:types` passa e o guardião de literais não acusa nada sob `shell/`
- [x] 2.2 Declarar o contrato de estados da moldura pelo mesmo `defineContract` usado por átomos, primitivas e gráficos, com os estados **repouso** e **salto focado**, e acrescentá-lo à lista de contratos da cobertura de histórias; pronto quando `stories-coverage.test.ts` inclui a moldura e reprova ao remover uma das duas histórias, com a remoção revertida
- [x] 2.3 Publicar o subpath `./shell` no mapa de exportações de `@chargebr/ui`; pronto quando um arquivo de checagem de tipos importa `@chargebr/ui/shell` e `verify:types` passa, e falha ao importar caminho interno equivalente
- [x] 2.4 Escrever a história do estado **repouso**, com nome de produto e texto de salto vindos da história; pronto quando ela afirma a presença das duas regiões pelo papel e o nome do produto dentro do cabeçalho, e o axe passa nos dois temas
- [x] 2.5 Escrever a história do estado **salto focado**; pronto quando o link de salto está em foco ao fim da montagem da história e o axe passa nos dois temas
- [x] 2.6 Afirmar na bancada que o salto leva o foco ao conteúdo: tabular até o link, conferir o destino dele e navegar até esse fragmento, lendo o elemento focado — acionar a âncora dentro da bancada derruba a conexão do executor com a página, e o que ela acrescentaria é que navega para o próprio href, conferido na mesma história; pronto quando a afirmação passa nos dois temas e falha quando o alvo deixa de ser focalizável, com o plantio revertido
- [x] 2.7 Afirmar que nenhum elemento focalizável precede o salto dentro da moldura renderizada; pronto quando um elemento focalizável plantado antes do salto reprova nomeando-o, plantio revertido
- [x] 2.8 Afirmar que a família tipográfica computada do texto da moldura é a declarada pela camada de tokens; pronto quando a afirmação passa nos dois temas e reprova com uma família plantada na folha da moldura, plantio revertido
- [x] 2.9 Afirmar que a superfície e a cor de texto da moldura resolvem para os valores do tema corrente, comparando cor computada com valor de token resolvido; pronto quando a afirmação passa nos dois temas e reprova com uma cor plantada, plantio revertido
- [x] 2.10 Criar o arquivo de checagem de tipos com uso da moldura sem `productName` e sem `skipLabel`; pronto quando `verify:types` falha nomeando cada uso e passa depois de revertidos os dois plantios
- [x] 2.11 Renomear `tools/checks/domain-vocabulary.test.ts` para `tools/checks/component-vocabulary.test.ts` e reescrever seu cabeçalho e o nome dos seus testes para o sujeito novo — componente que exibe texto —, sem alterar a lógica da checagem; pronto quando `git log --follow` acompanha o arquivo renomeado, o cabeçalho não menciona mais "primitiva de domínio" como sujeito da regra, e a suíte passa com os mesmos resultados de antes na árvore corrente
- [x] 2.12 Substituir o perímetro único por dois perímetros nomeados — o diretório das primitivas de domínio e o diretório da moldura —, e ajustar o teste de perímetro não vazio para cobrar os dois separadamente; pronto quando remover qualquer um dos dois do código faz esse teste reprovar nomeando o perímetro que ficou vazio, e a remoção é revertida
- [x] 2.13 Confirmar a checagem sobre a moldura; pronto quando um rótulo em português plantado no arquivo da moldura reprova nomeando arquivo e texto, um rótulo plantado numa primitiva de domínio continua reprovando como antes, e a história da moldura continua passando com os mesmos rótulos, porque história está fora dos dois perímetros

## 3. A aplicação

- [x] 3.1 Criar `apps/backoffice/package.json` com `next`, `react` e `react-dom`, sem diretório `src/`; pronto quando `pnpm install` conclui a partir do lock atualizado e `pnpm -r exec tsc --noEmit` passa a cobrir o pacote novo sem edição na raiz
- [x] 3.2 Criar o `tsconfig.json` da aplicação sem rotas tipadas; pronto quando `verify:types` passa numa árvore em que o diretório de artefatos de construção foi apagado antes da execução
- [x] 3.3 Escrever o layout da rota raiz: idioma pt-BR no elemento raiz, importação da folha publicada por `@chargebr/tokens`, importação da folha global da aplicação e composição da moldura com os rótulos em pt-BR; pronto quando `verify:lint` e `verify:types` passam e nenhum arquivo da aplicação declara `"use client"`
- [x] 3.4 Escrever a página da rota raiz com o conteúdo mínimo da moldura, sem número, sem dado e sem componente de domínio; pronto quando a página renderiza texto e nada mais, e o guardião de literais não acusa nada
- [x] 3.5 Escrever a folha global da aplicação declarando superfície e cor de texto do corpo do documento, só com token; pronto quando o guardião de literais passa e reprova com um literal plantado nessa folha, plantio revertido
- [x] 3.6 Declarar o diretório de artefatos de construção fora do versionamento e fora da varredura de formatação e lint; pronto quando, depois de uma construção, `git status` sai limpo e `verify:format` e `verify:lint` não listam nenhum arquivo desse diretório

## 4. Fronteira da aplicação

- [x] 4.1 Acrescentar a `biome.json` o bloco de `apps/**` com a lista de importações proibidas da tabela de `design.md`, e os globais de rede negados; pronto quando `verify:lint` passa com a aplicação importando `next` no layout e na página
- [x] 4.2 Plantar importação de arquivo de outra aplicação; pronto quando `verify:lint` falha nomeando o arquivo e a importação proibida, plantio revertido
- [x] 4.3 Plantar importação de caminho interno de pacote da biblioteca, em vez do subpath publicado; pronto quando `verify:lint` falha nomeando os dois, plantio revertido
- [x] 4.4 Plantar importação da árvore herdada, uma para cada grupo — contrato de leitura, banco e coleta; pronto quando `verify:lint` falha em cada caso, e os três plantios são revertidos
- [x] 4.5 Plantar importação de cliente de dado e importação de cliente de rede; pronto quando `verify:lint` falha em cada caso nomeando o que foi importado, plantios revertidos
- [x] 4.6 Plantar chamada de rede por variável global; pronto quando `verify:lint` falha nomeando o global e o arquivo, plantio revertido
- [x] 4.7 Confirmar que a lista de `packages/**` não foi alterada; pronto quando `git diff` de `biome.json` mostra apenas linhas acrescentadas fora do bloco de `packages/**`

## 5. Camada 2 — o documento emitido

- [x] 5.1 Criar o projeto Vitest da aplicação, em Node, com a construção executada uma vez por execução antes das afirmações; pronto quando a raiz descobre o projeto sem edição em `vitest.config.ts` da raiz, a construção roda uma vez só e `pnpm verify` continua com quatro estágios
- [ ] 5.2 Executar a construção e registrar no corpo do PR o caminho exato de cada documento emitido e a classificação de cada rota; pronto quando o registro nomeia o caminho do documento da rota raiz e lista tudo o mais que tiver sido emitido
- [x] 5.3 Declarar o conjunto de rotas emitidas a partir do que 5.2 observou, e compará-lo com o emitido; pronto quando uma rota plantada sem declaração reprova nomeando-a, uma rota declarada sem página reprova nomeando-a, e os dois plantios são revertidos
- [x] 5.4 Escrever a afirmação de existência do documento da rota raiz; pronto quando, com o artefato removido antes da execução, a verificação falha nomeando o caminho procurado e a saída não reporta nenhuma afirmação pulada
- [x] 5.5 Plantar a rota raiz como dinâmica; pronto quando a verificação falha nomeando a rota que deixou de emitir documento, plantio revertido
- [x] 5.6 Afirmar que o elemento raiz do documento emitido declara pt-BR, lendo o documento por DOM; pronto quando um idioma divergente plantado reprova nomeando o encontrado e o exigido, plantio revertido
- [x] 5.7 Afirmar que o elemento raiz não declara atributo de tema e que nenhum artefato de script emitido menciona esse atributo; pronto quando um atributo plantado no elemento raiz reprova, um script plantado que mencione o atributo reprova, e os dois plantios são revertidos
- [x] 5.8 Afirmar que o estilo entregue pelo documento contém as regras dos dois temas, seguindo a referência que o documento carrega ou o estilo embutido nele; pronto quando a remoção da importação da folha de tokens reprova nomeando o que foi procurado e não encontrado, plantio revertido
- [x] 5.9 Afirmar que o documento emitido contém a região de cabeçalho com o nome do produto e a região de conteúdo principal, e não contém região de navegação; pronto quando uma região de navegação plantada reprova nomeando-a, plantio revertido
- [x] 5.10 Afirmar que o primeiro elemento focalizável do documento emitido é o salto e que seu destino corresponde à região de conteúdo presente no mesmo documento; pronto quando um elemento focalizável plantado antes do salto reprova nomeando-o, plantio revertido

## 6. Fechamento

- [ ] 6.1 Executar `pnpm verify` inteiro; pronto quando os quatro estágios passam, a lista de estágios é a mesma de antes da mudança, e o tempo do estágio de testes antes e depois está registrado no corpo do PR
- [x] 6.2 Executar a verificação duas vezes seguidas sobre a mesma árvore; pronto quando o resultado de cada estágio é idêntico nas duas e `git status` sai limpo depois das duas
- [x] 6.3 Construir a documentação viva com as histórias da moldura; pronto quando a construção conclui e a moldura aparece nela com os dois estados
- [ ] 6.4 Registrar no corpo do PR a execução do axe sobre as histórias da moldura nos dois temas; pronto quando o registro existe — afirmação de acessibilidade sem execução registrada não vale
- [ ] 6.5 Registrar no corpo do PR o que continua em aberto: a camada 3 não existe, e o mapeamento de rota aninhada para arquivo emitido não foi fechado porque este ciclo emite uma rota só; pronto quando as duas lacunas estão no registro, cada uma com o gatilho que a reabre
