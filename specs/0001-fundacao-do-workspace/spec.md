# Spec 0001 — Fundação do workspace

## Estado

`PROPOSTA PARA REVISÃO`

## Problema

Não existe hoje um lugar onde código da biblioteca de interface possa ser
escrito, verificado e revisado com resultado reprodutível por qualquer agente.
O repositório `chargebr` já existe e hospeda a fase de coleta; ele passa a
abrigar também a biblioteca de interface, o back office e o produto público.

## Quem usa

Todo agente que escreve ou julga código nos ciclos 02 a 08, e a pessoa
supervisora que aceita PRs.

## Comportamento observável

O repositório passa a ser um workspace com verificação única, executável por um
comando na raiz e pela integração contínua, com perímetro declarado entre o que
é verificado e o que é conteúdo herdado.

## Escopo

**Entra:** conversão do repositório existente em workspace; estrutura de
monorepo; versão de runtime fixada; checagem de tipos em modo estrito;
formatação; lint; execução de testes; comando único de verificação na raiz;
integração contínua sobre pull request; proteção da branch principal; manifesto
de perímetro; local declarado para aplicações futuras.

**Não entra:** Storybook, tokens, componentes, gráficos, framework de aplicação,
código de aplicação, migração do que já vive no repositório, publicação de
pacote, deploy.

Os critérios abaixo descrevem comportamento observável, não ferramenta. Vincular
ferramenta a critério é trabalho do desenho. Se o desenho propuser ferramenta
diferente da hipótese registrada na constituição e ela atender aos mesmos
critérios, isso é resultado válido do portão 2.

## Linha de corte entre o ciclo 01 e o ciclo 02

O ciclo 01 congela gerenciador de pacotes, runtime, sistema de módulos,
linguagem e ferramentas de verificação. O ciclo 02 decide apenas o que termina
dentro de artefato publicado: primitivas de comportamento, estilo, formato e
pipeline de token, e gráficos.

## Critérios de aceite

1. **CA-01** — Quando alguém clona o repositório e executa o comando documentado
   de instalação, o workspace deve instalar todas as dependências a partir de um
   arquivo de lock versionado e concluir sem erro.
2. **CA-02** — Quando a instalação ocorre sob uma versão de runtime diferente da
   declarada, o workspace deve falhar com mensagem que nomeia a versão exigida.
3. **CA-03** — Quando alguém executa o comando único de verificação na raiz, o
   workspace deve executar tipos, formatação, lint e testes em todos os pacotes
   do perímetro e retornar código de saída diferente de zero se qualquer etapa
   falhar.
4. **CA-04** — Quando um arquivo versionado dentro do perímetro está fora do
   formato canônico, a verificação deve falhar sem reescrever o arquivo.
5. **CA-05** — Quando um arquivo usa `any` explícito ou suprime um erro de tipo
   sem justificativa anexa na mesma supressão, a verificação deve falhar.
6. **CA-06** — Quando um pacote importa outro pacote do mesmo workspace, a
   verificação deve resolver a importação pelo nome público do pacote.
7. **CA-07** — Quando um pacote é adicionado ao workspace, ele deve ser incluído
   na verificação por descoberta automática, sem alteração na configuração da
   raiz.
8. **CA-08** — Quando um pull request é aberto, a integração contínua deve
   executar a mesma verificação da raiz, publicar resultado por etapa e impedir
   merge enquanto houver etapa falhando.
9. **CA-09** — Quando alguém tenta enviar commit diretamente para a branch
   principal já existente, o repositório deve recusar, sem reescrita de
   histórico anterior.
10. **CA-10** — Quando a verificação é executada duas vezes sobre a mesma árvore
    sem alteração, o resultado de cada etapa deve ser idêntico.
11. **CA-11** — Quando um diretório do repositório não pertence ao workspace, ele
    deve constar do manifesto de perímetro com justificativa por entrada; quando
    um pacote do workspace está ausente do manifesto de perímetro, a verificação
    deve falhar.
12. **CA-12** — Quando um pacote da biblioteca declara dependência sobre uma
    aplicação do repositório, ou importa um framework de aplicação, a
    verificação deve falhar.

## Prova

| Critério | Prova |
| --- | --- |
| CA-01, CA-02, CA-06, CA-10 | Execução registrada em máquina limpa e na integração contínua |
| CA-07 | Pacote-fixture descartável adicionado; verificação o inclui sem edição na raiz |
| CA-03, CA-04, CA-05 | Caso negativo plantado por commit, verificação falhando, commit revertido |
| CA-08, CA-09 | Tentativa registrada no próprio repositório, com captura do bloqueio |
| CA-11 | Diretório-fixture fora do workspace sem entrada no manifesto, verificação falhando; pacote-fixture removido do manifesto, verificação falhando |
| CA-12 | Dependência invertida plantada por commit, verificação falhando, commit revertido |

## Estados obrigatórios

**Aplicáveis:** repositório recém-clonado sem dependências instaladas;
verificação em andamento; falha de etapa isolada; falha simultânea de mais de
uma etapa; limite inferior — workspace sem nenhum pacote; limite superior —
pacote adicionado sem configuração própria; repositório com árvore herdada fora
do perímetro; workspace sem nenhuma aplicação.

**Não aplicáveis, declarados:** `unresolved`, `blocked`, vazio e erro de dado de
domínio. Este ciclo não exibe nenhum dado.

## Regras de domínio envolvidas

Nenhuma. Este ciclo não exibe número, estado de verificação nem evidência.
CA-12 existe para que a fronteira entre biblioteca e aplicação — condição para
que as regras de domínio sejam preserváveis nos ciclos seguintes — seja
verificável por execução desde já.

## Acessibilidade

**Não aplicável, declarado.** Este ciclo não produz superfície de usuário: não
há operação por teclado, nome acessível, papel ou anúncio de mudança a
verificar. Esta declaração é a condição que habilita o parecer `não aplicável`
do `especialista-em-acessibilidade` no portão 5.

## Fora de escopo

Varredura de segredos, publicação de pacote, versionamento semântico, cache
remoto de build, Storybook, qualquer token ou componente, escolha de framework
de aplicação, criação de aplicação, migração ou remoção de conteúdo herdado.

## Decisões em aberto

Nenhuma dentro desta spec. As quatro decisões herdadas da constituição não são
exigidas por nenhum critério acima.

## Dependência de processo

Esta spec declara acessibilidade como não aplicável e depende do quarto
resultado de parecer `não aplicável`, decidido pela pessoa supervisora e ainda
não registrado em `docs/processo-de-desenvolvimento-sdd.md`. A emenda precisa
estar aceita antes do portão 5 deste ciclo. Não bloqueia os portões 2, 3 e 4.

## Perguntas para revisão

1. A linha de corte entre o ciclo 01 e o ciclo 02 está no lugar certo?
2. Os doze critérios são todos verificáveis por teste ou inspeção executada?
3. O manifesto de perímetro resolve a coexistência com o conteúdo herdado sem
   autorizar migração?
4. CA-12 é suficiente para impedir que a biblioteca dependa de aplicação?
5. A declaração de acessibilidade não aplicável está correta para este ciclo?
6. O escopo exclui tudo o que pertence aos ciclos seguintes?

Se todas forem `sim`, registre `ACEITA`.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 20 de setembro de 2026 |
| Resultado | `ACCEPTED` |
