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

## Goals / Non-Goals

**Goals:**

- Fechar a folga entre nomear um teste e o teste poder reprovar, com uma regra
  que um leitor futuro aplique sozinho.
- Fechar a folga da lista de entrada declarada à mão, com as duas provas que o
  caso 5 mostrou serem distintas.
- Deixar o limite entre as duas regras escrito, para que a primeira não alcance
  toda asserção do repositório.

**Non-Goals:**

- Mecanizar qualquer uma das duas. Nenhum guardião novo — ver D4.
- Reescrever qualquer entrada existente de `rules.specs`. As duas regras são
  acrescentadas; as seis atuais ficam literalmente como estão.
- Resolver o ponto 21 de `docs/pontos-abertos.md`, que este ciclo não toca.

## Decisions

### D1. A mudança não tem delta de spec: `skip_specs: true`

**Decisão:** `.openspec.yaml` declara `skip_specs: true`, e a mudança não cria
`specs/`.

**Por quê:** as duas regras novas não descrevem comportamento observável de
nenhuma capacidade — descrevem o que um **artefato de planejamento** precisa
conter. A autoridade sobre isso é `rules` em `openspec/config.yaml`, e
`CLAUDE.md` proíbe duplicar essas regras fora dele. Escrever a mesma obrigação
como requisito de capacidade seria inventar requisito para satisfazer validação,
que é exatamente o que a instrução do artefato de proposta manda não fazer, e
reprovaria a primeira entrada de `rules.specs`: um requisito só existe se nomear
o que quebra sem ele, hoje, no que está construído — e nenhum código quebra sem
uma regra de redação.

**Alternativas consideradas:**

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
2. **Requisito em `workspace-verification`.** Descartada pela mesma razão, com
   um agravante: os três requisitos de ciclo OpenSpec que vivem lá são provados
   por `tools/checks/change-lifecycle.test.ts`, por execução. Pôr ali uma regra
   sem guardião misturaria dois tipos de obrigação na mesma capacidade.

**Relação declarada, para quem revisar:** as duas regras novas **não substituem
e não duplicam** os dois requisitos de `verification-bench`. Aqueles são lidos
contra uma asserção escrita; estas são lidas contra um critério de aceite sendo
escrito. Os casos 1, 2 e 3 da proposta foram encontrados por aqueles; os casos 4
e 5, por revisão humana que nenhuma regra obrigava — é essa ausência que este
ciclo fecha.

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

### D4. Nenhum guardião, e isso é a forma final

**Decisão:** as duas regras são aplicadas na revisão, como as outras seis de
`rules.specs`. `tools/checks/` continua com seis guardiões.

**Por quê:** nenhuma das seis entradas de `rules.specs` tem guardião hoje — elas
governam texto de artefato, e o que um critério de aceite **alega provar** não
está no código, está na intenção de quem o escreveu. É o mesmo achado que
`close-open-points` registrou para o ponto 16, com as cinco ocorrências medidas,
e a conclusão lá foi a mesma: forma final, não promessa de mecanizar depois.

Há um guardião que cobre **uma fatia** da segunda regra, e isso é precedente, não
contradição: `tools/checks/nav-pair-adjacency.test.ts` verifica a
correspondência de papel para os pares da moldura de navegação — fundo de par
declarado precisa ser pintado como `background` por algum componente, token
isento precisa ser borda em algum lugar e fundo em nenhum. A regra nova é a
obrigação geral; aquele guardião é como uma capacidade específica a cumpriu.
Um ciclo futuro que declare lista à mão em outro domínio decide se mecaniza a
correspondência do mesmo jeito — a regra pede a prova, não a forma dela.

**O que faria mudar de ideia:** uma propriedade sintática comum aos cinco casos,
verificável sem saber o que o teste alega provar. `close-open-points` já procurou
por ela nas cinco ocorrências do ponto 16 e registrou que não existe.

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
- **A segunda regra é lida como pedido de guardião** → D4 diz o contrário por
  escrito, e a regra pede "duas provas próprias", sem nomear mecanismo. A prova
  pode ser execução, como em `nav-pair-adjacency`, ou revisão nomeada, como em
  `verification-bench`.
- **`rules.specs` cresce de seis para oito entradas, e lista longa é lida por
  diagonal** → aceito. As duas entradas atacam defeito medido cinco vezes em
  dezessete ciclos; o custo é duas linhas num arquivo que `CLAUDE.md` já aponta
  como leitura obrigatória antes de propor.
- **Nenhum ciclo futuro é obrigado por mecanismo a cumprir as duas** → é o
  mesmo risco que as seis entradas atuais já correm, e a mitigação é a mesma: a
  revisão independente mede contra `rules`, e `CLAUDE.md` manda ler lá.
- **Regra nova em `openspec/config.yaml` é a alavanca do over-engineering** →
  mitigado por `proposal.md`, "What This Does Not Do", que lista por escrito o
  que as duas regras **não** exigem: plantio em asserção de tipo, guardião novo,
  revisão de ciclo arquivado, ponto aberto novo.
