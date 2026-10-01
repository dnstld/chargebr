# A forma do produto, e o que ainda não foi decidido

**Atualizado em:** 30 de setembro de 2026, no arquivamento de
`close-open-points`
**Estado:** ponto de partida para a fase de desenho — **não é decisão tomada**

## O que este arquivo é

O que o dono do repositório disse sobre a forma do produto, separado entre o que
está resolvido e o que não está, para que a fase de desenho comece daqui em vez
de rederivar a conversa.

**A procedência importa e está declarada:** tudo abaixo vem de conversa com o
dono do repositório, não de medição. É diferente do resto da documentação deste
projeto, onde quase tudo tem número atrás. Trate como premissa a confirmar, não
como fato verificado.

Nada aqui é requisito. A fase de desenho pode derrubar qualquer item — o valor
deste arquivo é que ela derrube sabendo o que está derrubando.

---

## O que está resolvido

**Duas superfícies, com públicos diferentes.**

- **O aplicativo principal** é público. Todo mundo alcança. A assinatura não abre
  outra superfície: ela **libera mais profundidade na mesma** — mais gráficos e
  mais detalhe.
- **O back office** é o espaço de trabalho do dono: monitoramento e controle,
  um usuário, super admin.

**Conta e sessão são as mesmas** entre gratuito e pago. Papéis diferenciam o
acesso.

**"Back office" nomeia duas coisas diferentes, e só uma delas é o back office.**
Gráficos para assinantes são **produto**: mesmo público, mesma conta, mais coisa
liberada. Monitoramento e controle são **console interno**: um usuário, risco
próprio, ciclo de vida próprio. O que se chamou de back office é o segundo.

---

## O que não está resolvido

**Uma aplicação com grupos de rota, ou duas aplicações.**

O eixo da separação **não** é gratuito contra pago — esses são o mesmo produto
com acessos diferentes, o que é autorização e não implantação. O eixo é
**console interno contra produto público**.

Se a separação se pagar, é por uma razão que grupos de rota não resolvem bem: o
código que controla tudo é o que um visitante anônimo não deveria receber nem
como JavaScript morto.

**A assimetria de custo, para quem for decidir:** uma aplicação virando duas é
uma **separação** — o código já está isolado por rota. Duas virando uma é uma
**fusão**: desfazer perímetro, desduplicar configuração e reabrir toda decisão
que assumiu separação. Com a escolha em aberto, a forma mais barata de errar é
a de uma aplicação.

**As perguntas que decidem**, com o que já se sabe:

1. Conta e sessão são as mesmas entre gratuito e pago? **Sim** — responde para
   uma aplicação nesse eixo.
2. Existe código que um visitante anônimo não pode receber nem como JavaScript
   morto? **Em aberto.** É a pergunta que decide o eixo console interno.
3. O lado público precisa ser indexado e o console precisa não ser? **Em
   aberto.** Grupos de rota resolvem, mas muda configuração de construção.
4. As duas partes serão implantadas em cadências ou domínios diferentes? **Em
   aberto.**

**Como a aplicação lê dado.** A fronteira de exposição já decidida é de banco —
papéis, treze policies, schema privado, contrato de função atrás de RLS, em
`docs/decisao-implementacao-fronteira-exposicao-0001.md`. Se a aplicação alcança
essa fronteira por GraphQL, por acesso direto, ou por outra coisa, **não está
escrito em lugar nenhum**.

GraphQL aparece hoje no repositório em um lugar só: na lista de importações
proibidas de `biome.json`, com a mensagem de que a linha é reescrita pelo ciclo
que trouxer o contrato de leitura. É expectativa registrada, não escolha feita.

Esta decisão não precisa ser tomada agora — o backend não tem data. Mas é a
única coisa da camada de aplicação que **não dá para antecipar**, porque a forma
dela é a própria decisão.

---

## O que não deve ser rederivado

**A autorização já existe no banco, e a interface a reflete.** Papéis e policies
estão na fronteira de exposição. A interface lê o direito de acesso que a
fronteira impõe; ela não o define. Sem isso escrito, a autorização acaba
duplicada na interface, as duas versões divergem, e a que manda é a do banco —
a da interface vira mentira que parece verdade.

**O perímetro entre aplicações existe e funciona.** `apps/**` já tem proibição
de importação entre aplicações, provada com aplicação descartável. A
justificativa registrada nos ciclos era instrumental — "a biblioteca não tem
consumidor", "o buraco de perímetro nasce com `apps/`". A razão real é a deste
arquivo: console interno não é entregue junto com produto público.

**O que está construído hoje:** `apps/backoffice` de pé, sem tela de negócio;
`@chargebr/tokens` e `@chargebr/ui` com bancada provando cada estado nos dois
temas; nenhuma busca de dado em lugar nenhum, por decisão.

---

## Pontos técnicos reclassificados de `docs/pontos-abertos.md`

Três pontos de `docs/pontos-abertos.md` saíram de lá no arquivamento de
`close-open-points` (2026-09-30), não por terem sido resolvidos — nenhum
foi — mas porque nunca foram dívida de interface. `pontos-abertos.md`
registra o que um ciclo deixou aberto de propósito dentro de um trabalho
já decidido; estes três são o produto ainda não decidido, e é isso que os
gatilhos de cada um sempre disseram: a primeira rota de negócio real, a
primeira exigência de navegação entre rotas. Nenhum ciclo de interface
pode fechá-los sozinho — cada um depende de uma resposta que só a fase de
desenho dá, registrada acima neste arquivo. Texto e gatilho de cada um
estão preservados por inteiro, como estavam em `pontos-abertos.md`.

### A camada 3 não existe

**O que é:** o repositório prova comportamento de aplicação em duas camadas — a
bancada, para componentes, e o documento emitido pela construção, para o
documento. A terceira camada, um navegador dirigido contra um servidor iniciado,
nunca foi construída.

**Por que ficou aberto:** nenhuma exigência precisou dela até aqui, e o custo é
alto: servidor, segundo executor, provavelmente um estágio novo em
`pnpm verify`.

**Gatilho:** a primeira exigência que fale de navegação entre rotas, ou de
comportamento que só exista depois da hidratação.

**Consequência enquanto não existe:** nenhuma exigência pode ser redigida como
"antes da primeira pintura". A camada 2 prova a condição necessária — um script
síncrono posicionado antes de `<body>` —, nunca a suficiente.

E uma rota resolvida por requisição não tem documento emitido: a camada 2 prova
que ela existe e está declarada com essa forma, e nada sobre o conteúdo dela é
provável até a camada 3. Hoje é o caso de `/prova/[id]`, que existe só para
exercitar essa forma; cada rota de negócio declarada assim herda a mesma lacuna.

**Onde está registrado:** `docs/decisao-prova-de-comportamento-de-aplicacao.md`.

### A forma mista é recusada, não resolvida

**O que é:** uma rota com parâmetro pré-renderizada para uma lista de valores e
resolvida por requisição para valor fora dela — lista aberta, `fallback: null`
em `prerender-manifest.json` — reprova na camada 2, declarada ou não. Só a
lista fechada (`dynamicParams = false`) é aceita como pré-renderizada.

**Por que ficou aberto:** a parte resolvida por requisição é o mesmo ponto cego
que o ciclo `dynamic-route-readiness` fechou, e aceitá-la exigiria uma terceira
forma de declaração que nenhum ciclo precisou. Recusar é o que não supõe.

**Gatilho:** a primeira exigência que precise de uma rota pré-renderizada para
uma lista e resolvida por requisição fora dela. O ciclo que a trouxer propõe a
forma de declaração, com o que a camada 2 afirma sobre cada parte.

**Onde está registrado:** requisito "Rotas construídas são as declaradas" de
`backoffice-shell`; design do ciclo `dynamic-route-readiness`.

### `NavPanel` construído, sem rota de negócio para religar

**O que é:** `NavPanel`, `NavSection` e `NavItem` existem como componentes de
`@chargebr/ui`, exercitados na bancada (Storybook), e `AppFrame` ganhou um
slot de navegação (`nav`, `navToggleLabel`, `navOpen`, `onNavToggle`) e o
gatilho do hambúrguer que o abre e fecha — mas nenhum dos dois está ligado a
`apps/backoffice`. O requisito "Regiões da moldura no documento entregue"
(`backoffice-shell`) continua proibindo região de navegação no documento
emitido, porque não existe rota de negócio real para listar (decisão do
dono, `design.md` D5 de `interface-atomic-structure`).

**Por que ficou aberto:** popular `nav` com destinos de mentira reproduziria
exatamente o defeito que aquele requisito foi escrito para impedir — uma
região de navegação vazia (ou fictícia) anuncia um destino que não existe.

**Gatilho:** a primeira rota de negócio real — o ciclo que a trouxer decide
a forma final de `nav` em `apps/backoffice` e revisa o requisito "Regiões da
moldura no documento entregue" em conjunto.

---

## O que a fase de desenho decide

- O eixo da separação, respondendo a pergunta 2.
- Se o aplicativo principal nasce agora ou depois das telas do back office.
- Como a aplicação lê dado, com o outro lado da mesa presente — a fronteira é da
  coleta, quem a consome é a interface, e nenhum dos dois lados a enxerga
  inteira sozinho.

**Antes de propor qualquer ciclo a partir daqui, leia
[`docs/pontos-abertos.md`](pontos-abertos.md).**
