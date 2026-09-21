# Tarefas — fundação do workspace

## 1. Perímetro

- [ ] 1.1 Criar `pnpm-workspace.yaml` declarando exclusivamente `apps/*` e `packages/*`, e verificar que `pnpm list -r --depth -1` lista apenas a raiz
- [ ] 1.2 Criar `packages/tokens` e `packages/ui` como cascas: `package.json`, `tsconfig.json` estendendo a raiz, e um `src/index.ts` vazio; verificar que `pnpm list -r --depth -1` passa a listar os dois
- [ ] 1.3 Acrescentar as dependências de desenvolvimento ao `package.json` da raiz sem tocar nos scripts `collect` e `test`, e verificar que `pnpm install` conclui e o lockfile é atualizado

## 2. Etapas da verificação

- [ ] 2.1 Configurar a checagem de tipos sobre o perímetro e verificar que ela falha num arquivo com `any` explícito plantado, e passa após removê-lo
- [ ] 2.2 Configurar Biome e verificar que `biome ci` reprova um arquivo desformatado plantado sem alterá-lo — `git diff` vazio após a execução
- [ ] 2.3 Configurar a regra de lint que proíbe, dentro de `packages/`, importar de `apps/` ou de framework de aplicação; verificar com uma importação proibida plantada
- [ ] 2.4 Configurar `vitest.config.ts` na raiz com projetos resolvidos pelo workspace, e verificar que um teste plantado em `packages/ui` é executado sem edição na raiz

## 3. Comando único

- [ ] 3.1 Acrescentar o script `verify` encadeando tipos, formatação, lint e testes nessa ordem, e verificar que ele retorna zero na árvore limpa
- [ ] 3.2 Verificar que cada uma das quatro etapas, falhando isoladamente, faz `pnpm verify` retornar código diferente de zero e nomear a etapa
- [ ] 3.3 Executar `pnpm verify` duas vezes seguidas sobre a mesma árvore e verificar que as saídas coincidem

## 4. Isolamento do que já existe

- [ ] 4.1 Executar `pnpm verify` e verificar que nenhum arquivo de `src/`, `tests/`, `data/`, `queries/` ou `supabase/` aparece na saída e que `git status` fica limpo
- [ ] 4.2 Executar `pnpm collect --help` e `pnpm test` antes e depois da conversão e verificar que saída e código de saída são idênticos
- [ ] 4.3 Verificar que a instalação sob versão de Node diferente da declarada falha nomeando a versão exigida

## 5. Descoberta automática

- [ ] 5.1 Acrescentar um pacote-fixture descartável sob `packages/`, verificar que `pnpm verify` passa a cobri-lo sem edição em nenhum arquivo de configuração da raiz, e remover o fixture

## 6. Integração contínua

- [ ] 6.1 Criar o workflow que executa `pnpm verify` em todo pull request publicando resultado por etapa, e verificar numa execução real que as quatro etapas aparecem separadas
- [ ] 6.2 Abrir um pull request com uma falha plantada e verificar que a integração contínua reprova e o merge fica bloqueado
- [ ] 6.3 Ativar a proteção da branch principal no GitHub, tentar um push direto e verificar que é recusado sem reescrita de histórico
