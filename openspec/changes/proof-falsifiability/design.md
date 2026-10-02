# Design

## Context

Ver `proposal.md`, seção Why, para a motivação e os cinco casos medidos. O que
importa aqui é o estado da alavanca que este ciclo move.

`openspec/config.yaml` tem hoje, em `rules.specs`, seis entradas. A segunda
— "Todo critério de aceite nomeia o teste que o prova" — é a que este ciclo
qualifica. Ela obriga a **citação** de um teste e nada diz sobre a **capacidade
de reprovar** desse teste.

Duas restrições vindas do próprio repositório moldam o que pode ser escrito:

- `openspec/config.yaml` é a mesma alavanca que produziu o over-engineering
  violento que `remove-domain-capabilities` desmontou — a seção de regras de
  domínio saiu de lá. Toda entrada nova em `rules` carrega esse risco: regra que
  obriga trabalho sem nomear o defeito que evita vira cerimônia.
- `CLAUDE.md`, seção "Onde as regras de conteúdo moram", diz que
  `openspec/config.yaml`, em `rules`, é a **autoridade** sobre o que uma
  proposta, uma spec, um design e uma lista de tarefas precisam conter, e que
  essas regras não devem ser duplicadas em outro lugar.
- **Nada verifica esse arquivo.** Medido: com YAML inválido plantado,
  `openspec validate --specs --strict` e `openspec list` passam com código 0 e
  **sem aviso**; nenhum estágio de `pnpm verify` o lê; `grep` por `config.yaml`
  em `tools/`, `package.json` e `biome.json` volta vazio. A alavanca que
  `CLAUDE.md` chama de autoridade é a única lista do repositório sem prova
  nenhuma. Os comandos de autoria (`openspec instructions`, `openspec context`)
  **avisam** e devolvem `rules: []`; os que o portão poderia rodar, não avisam.
  A diferença não salva nada: nenhum dos dois grupos está no portão.

## Goals / Non-Goals

**Goals:**

- Fechar a folga entre nomear um teste e o teste poder reprovar, com uma regra
  que um leitor futuro aplique sozinho.
- Fechar a folga da lista de entrada declarada à mão, com as duas provas que o
  caso 5 mostrou serem distintas.
- Deixar o limite entre as duas regras escrito, para que a primeira não alcance
  toda asserção do repositório.
- Deixar a lista de regras com a prova de cobertura que a segunda regra exige de
  qualquer lista declarada à mão — a regra aplicada a si mesma, pelo guardião.

**Non-Goals:**

- Mecanizar qualquer uma das duas regras. O guardião do ciclo não lê o conteúdo
  de regra nenhuma — ver D4.
- Reescrever qualquer entrada existente de `rules.specs`. As duas regras são
  acrescentadas; as seis atuais ficam literalmente como estão.
- Resolver o ponto 21 de `docs/pontos-abertos.md`, que este ciclo não toca.

## Decisions

### D1. As duas regras não produzem delta; o guardião produz

**Decisão:** a mudança **tem** delta — um requisito novo em
`workspace-verification`, o do guardião. As duas regras de `rules.specs`
continuam sem delta nenhum, e `.openspec.yaml` **não** declara `skip_specs`.

**A primeira versão deste design decidiu o contrário**, `skip_specs: true`, e
estava certa sobre as duas regras e errada sobre o ciclo: ela foi escrita antes de
o guardião existir. O argumento sobre as regras sobrevive inteiro; o que ele não
alcança é o guardião.

**Por que as duas regras não têm delta:** elas não descrevem comportamento
observável de nenhuma capacidade — descrevem o que um **artefato de planejamento**
precisa conter. A autoridade sobre isso é `rules` em `openspec/config.yaml`, e
`CLAUDE.md` proíbe duplicar essas regras fora dele. Escrever a mesma obrigação
como requisito de capacidade seria inventar requisito para satisfazer validação, e
reprovaria a primeira entrada de `rules.specs`: um requisito só existe se nomear o
que quebra sem ele, hoje, no que está construído — e nenhum código quebra sem uma
regra de redação.

**Por que o guardião tem:** ele muda comportamento observável do portão —
`pnpm verify` passa a reprovar sobre um arquivo que antes podia desaparecer em
silêncio. **Medido:** os seis guardiões de hoje têm, cada um, requisito vivo que
descreve o que eles reprovam — `style-literals` ("Estilo sem literal em todo o
perímetro") e `fixture-origin` ("Fixture com origem declarada em todo o
perímetro") em `workspace-verification`, nomeados no texto; `type-suppression`
("Supressão de tipo com justificativa") e os três de `change-lifecycle` na mesma
capacidade, descritos pelo comportamento e sem nomear o arquivo;
`component-vocabulary` em `shell-components`; `nav-pair-adjacency` em
`design-tokens`, no requisito do conjunto que não varia por tema. Um sétimo sem
requisito seria o primeiro, e deixaria uma reprovação nova do portão sem registro
— o silêncio que este ciclo existe para fechar.

**Alternativas consideradas, para o lugar das duas regras:**

1. **Requisito em `verification-bench`.** Descartada. O argumento "não é
   mecanizável, logo não é requisito" **não vale** — `verification-bench` já tem
   "Asserção prova o comportamento, não o ambiente", provado por revisão
   nomeada, não por execução. O que descarta a alternativa é outra coisa: aquele
   requisito obriga a **bancada**, e é aplicado a uma asserção que já existe,
   no momento da revisão. As duas regras novas obrigam a **spec**, no momento em
   que o critério é escrito, e valem para critério de qualquer capacidade,
   inclusive das que não têm bancada. São a mesma família de defeito em dois
   momentos diferentes do ciclo, em dois lugares diferentes — não a mesma regra
   escrita duas vezes.
2. **Requisito em `workspace-verification`.** Descartada **para as duas regras**,
   pela mesma razão. A capacidade recebe o requisito **do guardião**, que é
   comportamento de verificação executado, igual aos outros que moram lá.

**Relação declarada, para quem revisar:** as duas regras novas **não substituem
e não duplicam** os dois requisitos de `verification-bench`. Aqueles são lidos
contra uma asserção escrita; estas são lidas contra um critério de aceite sendo
escrito. Os casos 1, 2 e 3 da proposta foram encontrados por aqueles; os casos 4
e 5, por revisão humana que nenhuma regra obrigava; o caso 6 — a própria lista de
regras sem prova — por medição na emenda. É essa ausência que este ciclo fecha.

### D2. O limite da primeira regra: recusar, não registrar

**Decisão:** o plantio é obrigatório para o critério cujo teste **existe para
recusar algo** — piso, proibição, fronteira, guardião. Um critério que apenas
**registra uma medição** — a matriz afirmando um valor — não planta.

**Por quê:** sem esse limite, a regra alcançaria toda asserção do repositório e
pediria plantio para coisas em que o plantio não significa nada. A pergunta que
o leitor futuro faz é operacional e não depende de contexto: **"este teste existe
para que algum estado reprove?"** Se sim, o plantio é o estado que ele deve
reprovar. Se o teste só afirma um valor medido, não há estado a plantar — e é
justamente ali que a segunda regra morde, porque o erro de um critério de
medição não é "não reprova", é "mede a coisa errada".

**O que faria mudar de ideia:** um caso medido em que um critério puramente de
medição errou de um jeito que **só** o plantio pegaria, e que a segunda regra
deixasse passar. Não conheço nenhum neste repositório; o caso 5 é o contrário
disso — tinha plantio, o plantio reprovava, e o defeito passou.

### D3. Duas regras, não uma

**Decisão:** duas entradas separadas em `rules.specs`.

**Por quê:** o caso 5 separa as duas por medição. Em `nav-frame-contrast`, PR 2,
havia plantio (`color.nav.text-muted` plantado de volta em `{color.gray.500}`,
reprovando com 3,780:1 e o piso nomeado — tarefa 2.3) e havia cobertura (tarefa
2.2). Mesmo assim `color.nav.edge` estava declarado como superfície sendo borda
nos cinco usos. **Plantio prova que o teste roda; não prova que ele mede a coisa
certa.** Uma regra só teria que dizer as duas coisas numa frase, e a frase única
é o que produz regra que ninguém sabe se cumpriu.

**O que faria mudar de ideia:** uma redação única que um leitor aplique sem
ambiguidade aos dois defeitos, e que não vire parágrafo. Não achei.

### D4. As duas regras ficam sem guardião; a lista que as carrega ganha um

**Decisão:** as duas regras são aplicadas na revisão, como as outras seis de
`rules.specs`. **Nenhum guardião lê o conteúdo de regra alguma.** O guardião novo
verifica outra coisa: que o arquivo que carrega as regras **parseia, tem as quatro
seções e não está vazio**.

**Esta decisão substitui a da primeira versão deste design**, que dizia "nenhum
guardião, e isso é a forma final". A parte que sobrevive é a que importava: o que
um critério de aceite **alega provar** não está no código, está na intenção de
quem o escreveu, e isso continua sem mecanismo — é o mesmo achado que
`close-open-points` registrou para o ponto 16, com as cinco ocorrências medidas, e
a conclusão lá é a mesma. A parte que caiu era uma generalização indevida: de "as
duas regras não são mecanizáveis" não segue "nada neste ciclo é mecanizável". A
**presença** da lista é mecanizável, e a medição da emenda mostrou que ela estava
desprotegida.

**Por que o guardião nasce neste ciclo, e não num ciclo à parte:** a lista de
regras é uma lista de entrada declarada à mão, e a regra 2 que este ciclo escreve
exige prova de cobertura para lista declarada à mão. Um ciclo que escrevesse a
regra e deixasse sem prova a lista mais importante do repositório estaria
afirmando a regra e não a cumprindo. Não é escopo novo; é a regra aplicada a si
mesma.

**Por que o plantio do grupo 2 das tarefas não bastava.** Aquele plantio — aspa
quebrada e inversão de ordem, conferidos pela saída de `openspec instructions` —
prova que a **conferência das tarefas** funciona, e é por isso que ele fica. Mas
essa conferência é um ato do ciclo: ela morre no arquivamento. Depois do PR 3 o
arquivo voltaria a não ter guardião nenhum. **Plantio prova que a conferência
roda; não deixa nada de pé.** O guardião é o que fica vigente.

**O que o guardião não faz:** não lê o conteúdo de nenhuma regra, não julga
critério de aceite, não sabe o que um teste alega provar, e não detecta regra mal
escrita, ambígua ou contraditória. Presença e contagem não são qualidade de
redação.

**Precedente de fatia mecanizada, não contradição:**
`tools/checks/nav-pair-adjacency.test.ts` verifica a correspondência de papel para
os pares da moldura de navegação — fundo de par declarado precisa ser pintado como
`background` por algum componente, token isento precisa ser borda em algum lugar e
fundo em nenhum. A regra nova é a obrigação geral; aquele guardião é como uma
capacidade específica a cumpriu. Um ciclo futuro que declare lista à mão em outro
domínio decide se mecaniza a correspondência do mesmo jeito — a regra pede a
prova, não a forma dela.

**O que faria mudar de ideia sobre as duas regras seguirem sem guardião:** uma
propriedade sintática comum aos cinco primeiros casos, verificável sem saber o que
o teste alega provar. `close-open-points` já procurou por ela nas cinco ocorrências
do ponto 16 e registrou que não existe.

### D5. A redação não depende da conversa que a originou

**Decisão:** cada regra é operacional por si — um teste de aplicabilidade
(a pergunta de D2), a obrigação, e o que a ausência dela deixa passar. A citação
de evidência entre parênteses é **leitura opcional**, não parte operativa: a
regra se aplica inteira sem abrir o arquivo citado.

**Por quê:** `rules.specs` é lido por quem escreve um ciclo futuro, sem acesso a
esta discussão. Regra que exija lembrar de onde ela veio não é aplicável.
Precedente de forma: as entradas de `rules.design` que citam
`docs/decisao-biblioteca-de-componentes.md` são operativas antes do parêntese.

### D6. Onde as duas entradas entram na lista

**Decisão:** a regra do plantio entra **imediatamente depois** de "Todo critério
de aceite nomeia o teste que o prova"; a regra da lista entra depois dela.

**Por quê:** a primeira qualifica a entrada que a precede, e ler as duas fora de
ordem inverte a leitura. As outras cinco entradas não mudam de posição.

### D7. A forma do guardião: seções descobertas, contagem declarada

**Decisão:** o guardião afirma quatro coisas, nesta ordem — o arquivo parseia; o
conjunto de seções que ele declara (`proposal`, `specs`, `design`, `tasks`) é
igual ao conjunto descoberto sob `rules:` no arquivo; nenhuma dessas seções está
vazia; e a contagem de cada uma bate com a contagem declarada no próprio
guardião.

**Por que o conjunto é comparado com o descoberto, e não apenas declarado:** a
lista de quatro seções dentro do guardião é ela mesma uma lista declarada à mão, e
a regra 2 vale para ela. Sem a comparação, uma seção nova de regras entraria no
arquivo sem nenhuma prova — o defeito do caso 4, `surfaces: []`, repetido no
guardião que existe para evitá-lo. A comparação reprova nas duas direções: seção
no arquivo que o guardião não declara, e seção declarada que o arquivo não tem.

**Por que a contagem é declarada, e não derivada do arquivo:** derivada, a
checagem não seria capaz de reprovar — uma regra apagada mudaria o esperado junto
com o lido, e a comparação passaria sempre. É exatamente o localizador circular do
caso 1, na forma de contagem. Declarada, ela custa uma linha a quem acrescenta ou
remove uma regra, e esse custo é o ponto: a mudança fica visível.

**Contagens medidas na main, antes da aplicação:** `proposal` 2, `specs` 6,
`design` 11, `tasks` 2. Depois das duas entradas deste ciclo, `specs` passa a 8, e
é esse o número que o guardião declara.

**O que faria mudar de ideia:** uma forma de derivar o esperado de uma fonte
independente do arquivo verificado — não existe aqui, porque o arquivo é a fonte.

### D8. `yaml` entra como dependência de desenvolvimento na raiz

**Decisão:** `yaml` é acrescentado a `devDependencies` do `package.json` da raiz.

**Por quê:** afirmar "o arquivo parseia" exige um parser. **Medido:** `yaml@2.9.1`
está no armazenamento do pnpm como dependência transitiva de
`@fission-ai/openspec`, e **não resolve da raiz** — `import("yaml")` falha com
`ERR_MODULE_NOT_FOUND`. Depender de resolução transitiva seria depender de um
detalhe de árvore de dependências de terceiro, que muda sem aviso.

**Alternativas consideradas:**

1. **Escrever a leitura à mão**, por expressão regular sobre as linhas. Descartada:
   um YAML inválido que a expressão aceita é precisamente o caso que o guardião
   existe para pegar, e a expressão não tem como distinguir "não parseia" de "não
   casou com o meu padrão".
2. **Usar o parser de `@fission-ai/openspec`.** Descartada: não é interface
   pública, e o aviso que ele emite não reprova nada — foi medido passando com
   código 0.

Nenhum script da raiz é alterado. `collect`, `extract` e `test` não são nossos, e
continuam intactos.

## Texto proposto, literal

As duas entradas, exatamente como entram em `rules.specs` na aplicação:

```yaml
    - "Critério de aceite cujo teste existe para recusar algo só está provado com o plantio registrado: o que foi plantado, a reprovação observada com o que ela nomeou, e a reversão do plantio. Critério que apenas registra uma medição não planta — a obrigação dele é a da lista declarada à mão. Prova que nunca foi vista reprovar não é prova, é coincidência registrada (docs/pontos-abertos.md, ponto 16)"
    - "Lista de entrada declarada à mão — par de contraste, alvo de varredura, superfície, perímetro de guardião — é afirmação sobre o código, e tem duas provas próprias: cobertura, comparando a lista contra o conjunto descoberto da fonte, e correspondência, conferindo que cada item cumpre no código o papel que o nome dele anuncia. Lista vazia e item inexistente passam calados (openspec/specs/design-tokens/spec.md, o conjunto que não varia por tema)"
```

Forma conferida contra as seis entradas atuais: string de linha única entre
aspas duplas, sem ponto final, sem aspas duplas internas, com a citação de
evidência no fim e entre parênteses. **Medido:** a entrada mais longa de `rules`
hoje tem 375 caracteres (a primeira de `rules.specs`, sobre requisito ancorado no
construído); a segunda mais longa tem 329. As duas novas têm 396 e 446 — maiores
que qualquer uma de hoje, e é por isso que a citação de evidência de cada uma foi
reduzida a um ponteiro só, em vez dos dois que a primeira versão deste design
trazia.

## Risks / Trade-offs

- **A primeira regra vira cerimônia em asserção que não recusa nada** → o limite
  de D2 está na própria frase da regra ("existe para recusar algo", e a sentença
  que manda o critério de medição para a segunda regra), não num documento à
  parte que o leitor teria que achar.
- **A segunda regra é lida como pedido de guardião em todo domínio** → D4 diz o
  contrário por escrito, e a regra pede "duas provas próprias", sem nomear
  mecanismo. A prova pode ser execução, como em `nav-pair-adjacency` e no
  guardião deste ciclo, ou revisão nomeada, como em `verification-bench`.
- **O guardião é lido como se verificasse as regras** → o requisito do delta diz
  `SHALL NOT julgar o conteúdo de nenhuma regra`, e a proposta repete na seção do
  que o ciclo não faz. Ele prova presença e contagem; redação continua sendo
  revisão humana.
- **A contagem declarada vira atrito em todo ciclo que acrescentar regra** →
  aceito, e é o objetivo. O custo é uma linha por regra acrescentada, e o que ele
  compra é a mudança não passar sem ser vista. Derivar a contagem removeria o
  atrito e removeria a prova junto (D7).
- **`rules.specs` cresce de seis para oito entradas, e lista longa é lida por
  diagonal** → aceito. As duas entradas atacam defeito medido seis vezes em
  dezessete ciclos; o custo é duas linhas num arquivo que `CLAUDE.md` já aponta
  como leitura obrigatória antes de propor. O guardião garante que elas não
  desaparecem em silêncio, que era o risco maior.
- **Dependência nova na raiz** → `yaml`, só em `devDependencies`, com as duas
  alternativas descartadas por medição em D8. Nenhum script da raiz muda.
- **Nenhum ciclo futuro é obrigado por mecanismo a cumprir as duas regras** → é o
  mesmo risco que as seis entradas atuais já correm, e a mitigação é a mesma: a
  revisão independente mede contra `rules`, e `CLAUDE.md` manda ler lá. O que o
  guardião fecha é a camada abaixo dessa — que as regras **existam** para serem
  lidas.
- **Regra nova em `openspec/config.yaml` é a alavanca do over-engineering** →
  mitigado por `proposal.md`, "What This Does Not Do", que lista por escrito o
  que o ciclo **não** faz: plantio em asserção de tipo, mecanização das duas
  regras, revisão de ciclo arquivado, ponto aberto novo, julgamento de redação
  pelo guardião.
