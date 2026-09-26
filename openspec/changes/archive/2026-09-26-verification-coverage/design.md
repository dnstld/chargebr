# Desenho — cobertura da verificação

## Context

A motivação está em `proposal.md`, na seção Why, e as exigências estão em
`specs/workspace-verification/spec.md`. Abaixo, o estado atual que restringe o
desenho, tal como foi medido:

- **A construção roda dentro do estágio de testes.** O projeto de teste de
  `apps/backoffice`, chamado "documento emitido", tem
  `tests/build.setup.ts` como `globalSetup`: ele apaga `.next/` e executa
  `next build` uma vez por execução. Os projetos do Vitest rodam sem ordem
  garantida entre si. Um guardião em `tools/checks/` pode rodar antes da
  construção, durante ela ou depois.
- **`next build` gera `next-env.d.ts`** na raiz da aplicação, fora de `.next/`.
  O setup não o apaga. Numa árvore limpa ele não existe até a primeira
  construção.
- **`.gitignore` ignora** `.chargebr/`, `node_modules/`, `storybook-static/`,
  `.next/` e `next-env.d.ts`. Dentro do perímetro, fora de `node_modules`, tudo
  o que o versionamento ignora é saída de construção: da aplicação ou da
  bancada.
- **O Biome lê `next-env.d.ts`.** Em `files.includes`, `biome.json` exclui
  `**/storybook-static` e `**/.next`, mas não esse arquivo. Com o ignore do
  versionamento ligado, formatação e lint passam de 151 para 150 arquivos cada.
  O único que sai é `next-env.d.ts`.
- **A checagem de tipos só lê artefato de construção quando o `exclude` sai.**
  Isso foi medido com `tsc --listFilesOnly`, pacote a pacote, e
  `git check-ignore`:
  - na árvore corrente, com a construção feita, nenhum arquivo ignorado é lido
    em `apps/backoffice`, `packages/tokens` e `packages/ui`;
  - sem o `exclude`, a checagem de `apps/backoffice` lê `next-env.d.ts`,
    `.next/types/routes.d.ts` e `.next/types/root-params.d.ts`;
  - `packages/tokens/generated/` é saída da geração de tokens, mas é
    versionada. Por isso não é ignorada e não conta como artefato.
- **O veredito do `tsc` não denuncia essa leitura.** A tabela está na proposta.
  A dependência fica escondida por dois fatores: importação de efeito colateral
  sem `noUncheckedSideEffectImports` e `skipLibCheck`.
- **`fixture-origin.test.ts` tem um perímetro diferente dos outros.** Ele varre
  `packages/ui/src` e pula `node_modules` e `storybook-static`. Os dois
  guardiões de perímetro, `style-literals` e `type-suppression`, varrem
  `["packages", "apps"]` e pulam também `.next`. Hoje, os únicos diretórios
  `fixtures` fora de `node_modules` são `packages/ui/src/charts/fixtures` e
  `packages/ui/src/domain/fixtures`.

## Goals / Non-Goals

**Goals**

- Uma linha só entre conteúdo e saída, a do versionamento, aplicada igual às
  três etapas que verificam conteúdo.
- Uma prova da checagem de tipos que reprove de fato quando a dependência
  volta. A reprovação precisa ter sido medida, não suposta.
- O guardião de fixture passa a cobrir o perímetro inteiro, e a regra que ele
  aplica passa a ser obrigação escrita.

**Non-Goals**

- Mudar o que a checagem de tipos aceita. Nenhuma bandeira do compilador muda.
- Mudar os guardiões `style-literals`, `type-suppression` e
  `component-vocabulary`.
- Garantir, para uma segunda aplicação, que haja artefato presente na hora da
  prova. Isso fica registrado como ponto aberto.

**Estados obrigatórios:** não se aplicam. Esta mudança não cria nem altera
componente, e não há estado de interface a declarar.

## Decisions

### A linha entre conteúdo e saída é a do versionamento

"Artefato de construção" passa a ser, para as três etapas, **arquivo que o
versionamento ignora**. As dependências instaladas são a exceção.

**Alternativas descartadas:**

- **Uma lista de nomes, como `.next/` e `next-env.d.ts`.** Fecha o caso de
  hoje, mas não o próximo arquivo que a construção gerar fora de `.next/`. Esse
  é o texto literal do ponto 4.
- **Comparar a árvore antes e depois da construção.** `next-env.d.ts`
  sobrevive entre execuções, porque o setup só apaga `.next/`. Por isso ele
  existe antes da construção e não aparece como novo. Além disso, a comparação
  exigiria instrumentar o setup.
- **Usar data de modificação.** É frágil entre sistemas de arquivos e não é
  determinística.

**A premissa, e o que me faria mudar de ideia.** O critério depende de dois
fatos:

1. **Toda saída de construção dentro do perímetro é ignorada.** Uma saída não
   ignorada aparece como arquivo novo em `git status` depois de `pnpm verify`.
   Aí ela cai na segunda obrigação do requisito, que este ciclo não reabre. Se
   o dono do repositório ler "árvore versionada inalterada" como algo que não
   alcança arquivo não rastreado, a cadeia tem um furo, e este critério sozinho
   não o fecha.
2. **Todo arquivo ignorado dentro do perímetro é saída.** Medido hoje: é.

   Se alguém ignorar no `.gitignore` um arquivo de origem que a etapa de tipos
   lê, a prova reprova. Entendo que reprovar é o certo, porque a etapa passaria
   a ler conteúdo que não está no repositório. Um caso legítimo em contrário me
   faria rever o critério.

### A prova da checagem de tipos é sobre o que ela lê

A tabela da proposta mostra que o veredito do `tsc` passa com ou sem artefato
presente. Por isso a prova não pode ser "a etapa reprova". Ela afirma sobre o
**conjunto de arquivos** que a etapa lê.

**Onde a prova mora.** Em dois arquivos novos, no projeto de teste que já
constrói: as afirmações em `apps/backoffice/tests/type-stage-inputs.test.ts`,
e a listagem no preparo dele, `apps/backoffice/tests/type-stage.setup.ts`. As
alternativas:

- **Um guardião em `tools/checks/`.** Sem ordem garantida entre projetos, ele
  rodaria às vezes antes da construção. Numa árvore limpa de CI não haveria
  artefato presente, e a afirmação passaria sem ter olhado nada. É a falha
  silenciosa que este ciclo existe para fechar.
- **Um guardião que faça a própria construção.** Seriam duas construções por
  execução, e a construção é o custo dominante do estágio de testes.

O projeto se chama "documento emitido" e passa a conter uma prova que não é
sobre documento. O nome fica: o que o projeto garante é "roda depois da
construção", e renomeá-lo não muda nenhuma afirmação.

**Como a leitura é obtida.** Para cada pacote do workspace, o preparo executa o
mesmo binário que a etapa usa: `tsc` da raiz, com `--noEmit`, `-p` apontando o
`tsconfig.json` do pacote e `--listFilesOnly`. Para `verify:types`, pacote do
workspace é cada diretório sob `apps/` e `packages/` com `package.json`. É o
conjunto que `pnpm -r exec` alcança.

**Por que a listagem é preparo, e não afirmação.** Dentro de uma afirmação,
quem a chamasse primeiro pagaria o custo dela sob o limite de 5 s por teste. No
CI, com as histórias do Storybook no Chromium rodando ao mesmo tempo, a
listagem dos três pacotes levou 10,8 s e reprovou. Medido:

| Forma | Medido | Destino |
| --- | --- | --- |
| Três `tsc` em sequência, dentro do teste | 1,2 s local, 10,8 s no CI | reprovou no CI |
| Três `tsc` em paralelo | 0,59 s local | descartado: na razão local/CI observada, cerca de 4,9 s, no limite |
| Um `tsc -b --listFilesOnly` | `error TS5094` | não existe |
| Listagem no `globalSetup` | afirmações em 1 ms, 0 ms e 6 ms | escolhido |

O preparo é declarado no `globalSetup` depois de `build.setup.ts` e guarda, por
`project.provide`, a listagem de cada pacote, com o erro do `tsc` no lugar da
lista quando ele não lista. `beforeAll` também caberia, porque o projeto
declara `hookTimeout: 180_000`. O `globalSetup` foi preferido por ser onde a
construção já roda, e porque com ele a ordem das afirmações deixa de decidir
quem paga. Nenhum tempo limite foi aumentado, e nenhuma repetição foi
acrescentada.

A alternativa era montar o programa pela API do TypeScript. Ela foi descartada
porque resolveria a configuração por outro caminho, que pode divergir de
`tsc -p`, e porque traria o compilador como importação para dentro da
aplicação.

**Como "ignorado" é decidido.** Os caminhos listados fora de `node_modules`
são passados de uma vez para `git check-ignore --stdin`:

- código de saída `0`: há arquivos ignorados, e eles são nomeados;
- código `1`: nenhum arquivo é ignorado;
- qualquer outro código: o teste falha com a saída de erro do git.

Os pacotes do workspace aparecem pelo caminho real, `packages/ui/src/…`, e não
pelo link em `node_modules`. Isso foi medido. O filtro de `node_modules` tira
só as dependências instaladas e as bibliotecas-padrão do compilador.

**Três afirmações, cada uma reprovando com nome e nunca pulando:**

1. **A construção deixou o que a prova procura.** `apps/backoffice/next-env.d.ts`
   e `apps/backoffice/.next/types/routes.d.ts` existem. Sem eles, a prova seria
   vazia. São o par pelo qual a dependência passa: o arquivo fora do diretório
   de artefatos e o que ele importa de dentro. Se uma versão do Next deixar de
   gerá-los, a prova reprova nomeando o caminho. Aí alguém remede o que a
   construção gera fora de `.next/`, em vez de a prova passar sem objeto.
2. **A enumeração alcança o workspace.** A lista de pacotes contém
   `apps/backoffice`, `packages/tokens` e `packages/ui`, e a listagem de cada
   um não é vazia.
3. **Nenhum arquivo lido é ignorado.** A mensagem nomeia o pacote e cada
   arquivo, relativo à raiz.

As afirmações 2 e 3 leem o que o preparo guardou. Sem o preparo declarado no
projeto, as duas reprovam nomeando o arquivo que falta, em vez de afirmar sobre
uma lista vazia.

A prova negativa foi medida antes de ser declarada. Sem o `exclude`, o critério
acusa exatamente os três arquivos que o cenário da spec nomeia, e
`verify:types` continua passando.

### Formatação e lint: o ignore do versionamento no Biome

`biome.json` ganha `"vcs": { "enabled": true, "clientKind": "git",
"useIgnoreFile": true }`.

**As exclusões `!**/storybook-static` e `!**/.next` ficam.** Com o ignore
ligado, elas são redundantes. Removê-las não é exigido por nenhuma obrigação e
tiraria a proteção explícita que o ciclo 8 pôs e provou.

**Alternativa descartada: acrescentar `!**/next-env.d.ts` a `files.includes`.**
É uma lista de nomes, e a lista não pega o próximo arquivo.

**Medido:** com o ignore ligado, a árvore corrente perde exatamente um arquivo
em cada etapa, `next-env.d.ts`. Fora de um checkout git, o Biome com o ignore
ligado saiu com código 1 nos dois casos testados, com e sem `.gitignore`.
Falha visível, não silenciosa.

### O guardião de fixture cobre o perímetro inteiro

Em `tools/checks/fixture-origin.test.ts`:

- `PERIMETER` passa de `packages/ui/src` a `["packages", "apps"]`, com a mesma
  forma e o mesmo tratamento de diretório inexistente de `type-suppression`;
- `.next` entra em `SKIPPED_DIRS`;
- o comentário do perímetro é reescrito.

As duas afirmações existentes ficam como estão: a de que toda fixture declara
origem e a de que o perímetro encontra `abve-janeiro-2025.ts` e
`synthetic-series.ts`.

**Por que `packages` inteiro e não só `apps` somado a `packages/ui/src`.** O
requisito cobre toda área do perímetro, e uma fixture num pacote novo
escaparia do mesmo jeito que uma em `apps/`. Medido: a varredura ampliada
encontra os mesmos dois diretórios de hoje.

**Por que pular `.next` pelo nome, e não pelo ignore do versionamento.** Assim
o guardião fica coerente com os outros dois guardiões de perímetro, que pulam
pelo nome. Unificar os guardiões sob o ignore do versionamento é o ponto aberto
novo, e não cabe a este ciclo.

**`node_modules` continua pulado.** Os links de workspace levam a
`node_modules/.pnpm`, e pacotes publicados trazem diretórios `fixtures`
próprios.

### Os registros mudam no PR de código

`docs/pontos-abertos.md` entra no PR de `feat/verification-coverage`, como no
ciclo anterior:

- **o ponto 4 sai, citando este ciclo.** A nota de fechamento registra uma
  correção medida. O texto do ponto dizia que o `exclude` "faz trabalho real" e
  que `verify:types` passa "não porque uma bandeira esconde o erro". A primeira
  frase vale para o que a etapa lê. Para o veredito, não vale: sem o `exclude`,
  duas configurações escondem o erro. O fechamento diz isso;
- **o ponto 11 sai, citando este ciclo;**
- **entra o ponto 12**, "Dois guardiões leem `next-env.d.ts`". O gatilho é o
  próximo ciclo que tocar `style-literals` ou `type-suppression`, ou o primeiro
  arquivo gerado que um deles reporte;
- **entra o ponto 13**, "A prova da etapa de tipos acompanha a construção de
  `apps/backoffice`". O gatilho é a segunda aplicação sob `apps/`;
- **o cabeçalho** ganha data e contagens atualizadas: 8 pontos abertos, com
  este ciclo fechando 2 e abrindo 2.

## Risks / Trade-offs

- **O teste passa a depender de git.** → Se o git não estiver disponível, ou
  sair com código diferente de 0 e 1, o teste falha com a saída de erro. A CI
  já faz checkout com git, e o Biome passa a depender dele do mesmo jeito.
- **A listagem custa uma execução de `tsc` por pacote.** → Medido em 1,2 s
  local e 10,8 s no CI. Roda no preparo, fora do limite por teste. A ordem
  entre construção e listagem depende de o Vitest preparar os arquivos de
  `globalSetup` na ordem declarada. O cenário sem o `exclude` prova essa ordem
  por execução, porque a listagem só vê `.next/types/*` depois da construção.
- **Uma versão do Next pode gerar outro arquivo fora de `.next/`.** → Se ele
  for ignorado e lido, a prova reprova nomeando o arquivo. Se não for ignorado,
  aparece em `git status` depois da verificação. Se deixar de gerar os dois
  arquivos procurados, a prova reprova por ausência. Em nenhum dos três casos a
  prova passa calada.
- **Uma segunda aplicação não tem artefato garantido na hora da prova.** → Ponto
  13, com gatilho.
- **Dois guardiões continuam lendo `next-env.d.ts`.** → Ponto 12, com gatilho.
  Hoje os dois passam sobre o arquivo gerado.
- **Uma fixture fora de um diretório `fixtures` escapa.** → Não é novo. O
  requisito declara o critério para que ele fique visível. Nenhuma medição
  mecânica reconhece fixture pelo conteúdo.
