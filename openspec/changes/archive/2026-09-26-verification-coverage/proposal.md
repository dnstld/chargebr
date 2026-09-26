# Cobertura da verificação

## Why

Dois pontos abertos são a mesma falha vista de dois lados. O alcance da
verificação é mais estreito que a intenção dela, e o que fica de fora passa sem
prova. Nos dois casos a falha é silenciosa: nada reprova, porque nada olha.

- **Ponto 11 — o guardião de fixture não cobre `apps/`.**
  `tools/checks/fixture-origin.test.ts` varre só `packages/ui/src`. A razão
  registrada para adiar foi "estender o perímetro sem caso a verificar seria
  guardião sem objeto". Ela não se sustenta. O trabalho de um guardião é pegar o
  **primeiro** objeto. Adiar deixa a cobertura dependendo de alguém lembrar de
  estender o guardião no PR da primeira fixture sob `apps/`. Há duas medições
  contra o adiamento:
  - o guardião já tolera diretório inexistente, nas linhas 32 a 36;
  - `type-suppression.test.ts` já varre `["packages", "apps"]` e tem o mesmo
    tratamento, comentado "diretório do perímetro ainda não existe (ex.:
    apps/)".

  Há também uma medição nova: **nenhum requisito vivo obriga o guardião.** A
  regra de que a fixture declara a própria origem nasceu na proposta de
  `domain-charts-v1` e mora só no código. Estender um guardião que nada obriga
  seria repetir o defeito do ponto 4.
- **Ponto 4 — o requisito "Artefato de construção não é conteúdo verificado"
  cobre menos que a intenção.** Medido nesta proposta, o buraco é duplo:
  - **A lista de etapas omite a checagem de tipos.** Essa é a etapa que lê o
    que `next-env.d.ts` importa, `./.next/types/*.d.ts`. Hoje o `exclude` do
    tsconfig da aplicação a protege, mas nenhum requisito obriga essa decisão.
  - **A obrigação fala do diretório de artefatos, e `next-env.d.ts` fica fora
    dele.** Formatação e lint leem esse arquivo hoje. Plantado fora do formato
    e com `any`, ele fez `verify:format` e `verify:lint` reprovarem, com o
    arquivo nomeado. Numa árvore limpa, o arquivo não existe quando essas duas
    etapas rodam; depois de uma construção local, existe. O resultado das duas
    etapas passa a depender de ter havido construção antes.

O ciclo fecha os dois buracos do ponto 4. O dono do repositório escolheu isso
nesta proposta, depois que a segunda medição apareceu.

## A prova sugerida não reprova, e isso foi medido

O pedido sugeria remover o `exclude` e ver o estágio de tipos reprovar. **Ele
não reprova.** Tudo foi medido com TypeScript 5.9.3 e a configuração real, por
uma configuração-sonda não versionada que estende a da aplicação com
`"exclude": []`:

| Árvore | `tsc --noEmit` | Arquivos gerados que o `tsc` lê |
| --- | --- | --- |
| Configuração atual, construção presente | passa | nenhum |
| Sem `exclude`, construção presente | passa | `next-env.d.ts`, `.next/types/routes.d.ts`, `.next/types/root-params.d.ts` |
| Sem `exclude`, `.next` ausente | **passa** | `next-env.d.ts` |
| Sem `exclude`, `.next` ausente, `noUncheckedSideEffectImports` ligado | **passa** | — |
| Sem `exclude`, `.next` ausente, `noUncheckedSideEffectImports` ligado, `skipLibCheck` desligado | reprova com `TS2307` nas duas importações de `next-env.d.ts` — e com sete erros alheios nas declarações de `next` e `happy-dom` | — |

Duas coisas escondem o erro, não uma:

- `import "./x"` é importação de efeito colateral, e o TypeScript não reporta
  especificador não resolvido nela sem `noUncheckedSideEffectImports`.
- `skipLibCheck` pula o `.d.ts`.

Para o erro aparecer é preciso mudar as duas, e desligar a segunda traz erros
alheios. Mesmo com as duas mudadas, o `tsc` **passa** quando a construção está
presente. Pelo veredito da etapa, só se veria a dependência quando o artefato
falta. Com ele presente, ela não aparece.

A conclusão é que **o veredito da etapa de tipos não denuncia a dependência.
O que a denuncia é o conjunto de arquivos que a etapa lê.** A segunda linha da
tabela mostra isso: sem o `exclude`, a etapa lê três arquivos que o
versionamento ignora. Com o `exclude`, não lê nenhum. A prova deste ciclo é
feita sobre essa leitura.

## What Changes

- **Ponto 4.** O requisito "Artefato de construção não é conteúdo verificado"
  é modificado. A primeira obrigação se divide em duas:
  - o diretório de artefatos continua fora do versionamento, sem mudança;
  - as etapas de checagem de tipos, de formatação e de lint passam a não poder
    ler **arquivo que o versionamento ignora**, dentro ou fora do diretório de
    artefatos. As dependências instaladas são a única exceção.

  A segunda obrigação, "deixar a árvore versionada inalterada", não muda.
- A checagem de tipos ganha prova por execução. É um teste que roda depois da
  construção. O que a etapa de tipos lê em cada pacote do workspace é listado
  no preparo do projeto de teste, e o teste reprova se algum desses arquivos
  for ignorado pelo versionamento. Ele também
  reprova se a construção não deixou os artefatos que ele procura: sem eles, a
  afirmação seria vazia.
- Formatação e lint passam a respeitar o que o versionamento ignora. É a mesma
  linha que separa conteúdo de saída na checagem de tipos. `next-env.d.ts` sai
  das duas etapas, e nenhum outro arquivo muda de lado: medido, 151 arquivos
  passam a 150 em cada etapa.
- **Ponto 11.** Entra o requisito "Fixture com origem declarada em todo o
  perímetro", em `workspace-verification`. Ele põe em requisito vivo a regra
  que o guardião já aplica. O guardião passa a varrer `packages/*` e `apps/*`
  inteiros, como os outros dois guardiões de perímetro, e deixa de fora o
  diretório de artefatos de construção.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workspace-verification`:
  - "Artefato de construção não é conteúdo verificado" é modificado. O que
    obriga as três etapas de verificação de conteúdo passa a valer para todo
    arquivo que o versionamento ignora, não só para o diretório de artefatos, e
    a checagem de tipos entra na lista.
  - Entra "Fixture com origem declarada em todo o perímetro".

## Impact

- **Guardião:** `tools/checks/fixture-origin.test.ts`. O perímetro passa a ser
  `packages/*` e `apps/*`, e `.next` entra nos diretórios pulados. As fixtures
  encontradas continuam as mesmas: medido, os únicos diretórios `fixtures`
  fora de `node_modules` são `packages/ui/src/charts/fixtures` e
  `packages/ui/src/domain/fixtures`.
- **Prova da etapa de tipos:** um teste novo e o preparo dele em
  `apps/backoffice/tests/`, que rodam depois da construção que o projeto de
  teste já faz. Não há construção nova nem estágio novo.
- **Configuração:** `biome.json` passa a usar o ignore do versionamento, e
  `apps/backoffice/vitest.config.ts` declara o preparo da prova no
  `globalSetup`, depois da construção.
- **Registros:** `docs/pontos-abertos.md` fecha os pontos 4 e 11 citando este
  ciclo e abre os dois pontos da seção seguinte, cada um com gatilho.
- **Intocados:**
  - `src/`, `tests/`, `data/`, `queries/`, `supabase/`;
  - `packages/` inteiro, e o tsconfig da aplicação;
  - os guardiões `style-literals`, `type-suppression` e `component-vocabulary`;
  - a segunda obrigação do requisito do ponto 4.

## Correção feita depois da reprovação no CI

O primeiro run do CI de `feat/verification-coverage` reprovou a prova da etapa
de tipos por tempo. A listagem do `tsc` era paga pela afirmação que a chamasse
primeiro, sob o limite de 5 s por teste. Localmente levava 1,2 s; no CI, com as
histórias do Storybook no Chromium rodando ao mesmo tempo, 10,8 s. A correção,
em `0a3af75`, moveu a listagem para o preparo do projeto de teste. As
afirmações não mudaram, e os cenários reprovam no mesmo lugar e nomeando o
mesmo que antes. As medições estão no corpo do PR #166.

Os artefatos foram corrigidos antes do arquivamento, porque passaram a
descrever a estrutura anterior:

- **`design.md`:**
  - onde a prova mora: dois arquivos, e não um;
  - quem executa o `tsc`: o preparo, e não o teste, com as alternativas
    medidas;
  - o que acontece sem o preparo declarado;
  - o risco de custo, que dizia 0,4 s e "pequeno perto da construção".
- **Esta proposta:** What Changes e Impact passam a nomear o preparo e
  `apps/backoffice/vitest.config.ts`.
- **`tasks.md`:** entra a tarefa 4.6, marcada no próprio texto como
  acrescentada depois da reprovação, e não planejada.

A spec não muda: nenhum texto de prova diz onde o `tsc` roda.

## Lacunas registradas, e não preenchidas

- **Dois guardiões leem `next-env.d.ts`.** `style-literals` e
  `type-suppression` pulam `.next`, mas não um arquivo gerado fora dele. Hoje
  os dois passam, porque o arquivo gerado não tem literal nem supressão. O
  requisito modificado cobre as três etapas de verificação de conteúdo. Os
  guardiões rodam dentro da etapa de testes, e essa etapa lê saída de construção
  de propósito: é o objeto da camada 2. Estendê-los muda dois guardiões que este
  ciclo não precisa tocar. Entra como ponto aberto com gatilho: o próximo ciclo
  que tocar um dos dois, ou o primeiro arquivo gerado que um deles reporte.
- **A prova da etapa de tipos acompanha a construção de `apps/backoffice`.** O
  teste lista a leitura de todos os pacotes do workspace. Mas só garante que há
  artefato presente para a construção que acabou de rodar, a de
  `apps/backoffice`. Uma segunda aplicação que construa no próprio projeto de
  teste não tem ordem garantida em relação a este teste. Entra como ponto
  aberto com gatilho: a segunda aplicação sob `apps/`.
- **Fixture é reconhecida pelo diretório.** O guardião trata como fixture
  todo arquivo sob um diretório chamado `fixtures`. Uma fixture posta em outro
  lugar escapa, tanto em `packages/` quanto em `apps/`. Isso não é novo e não
  muda neste ciclo. O requisito novo declara o critério, para que ele fique
  explícito, mas não o amplia: nenhuma medição mecânica reconhece uma fixture
  pelo conteúdo.

## O que esta mudança não faz

- **Não cria aplicação, tela, rota de negócio nem fixture.** O ponto 11 arma o
  guardião, mas não cria nada para ele verificar. A prova de que ele alcança
  `apps/` é feita com plantio revertido.
- **Não muda a segunda obrigação** do requisito do ponto 4, e não mexe na
  obrigação de versionamento do diretório de artefatos.
- **Não liga `noUncheckedSideEffectImports` e não desliga `skipLibCheck`.** A
  tabela acima mostra que ligar a primeira e desligar a segunda denunciaria a
  dependência só quando o artefato falta, e traria erros alheios de biblioteca.
- **Não altera `apps/backoffice/tsconfig.json`.** O `exclude` que já existe é o
  que faz a árvore corrente passar na prova nova.
- **Não altera nenhum componente de `packages/ui`.** Por isso não entra
  história nova nem afirmação de acessibilidade.
- **Não toca em coleta**, nem nos scripts `collect` e `test` da raiz.
