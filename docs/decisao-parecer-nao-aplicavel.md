# Decisão: resultado de parecer `não aplicável`

## Estado e escopo

`ACEITA — AGUARDANDO MERGE`

Esta decisão cria um quarto resultado possível para os pareceres da verificação
tripla e define as condições estritas em que ele pode ser emitido. Ela não
implementa: a emenda a `docs/processo-de-desenvolvimento-sdd.md` é PR próprio,
posterior ao aceite, do `escriba-do-projeto`.

Não altera o número de pareceristas, não altera o escopo de nenhum estatuto,
não cria exceção para ciclo algum e não toca a definição de pronto de um
componente.

## Contexto

O portão 5 exige três pareceres e só abre com os três `aprova`. Cada parecer é
`aprova`, `reprova` ou `não demonstrado`, e `não demonstrado` bloqueia como
reprovação.

O ciclo 01 entrega monorepo, tipos, Prettier, ESLint, Vitest e integração
contínua. Não entrega nada que renderize. O `especialista-em-acessibilidade`
não terá superfície do seu domínio para julgar: não pode `aprova`, porque a
constituição proíbe afirmação de acessibilidade sem verificação executada; e
`não demonstrado` trava o portão sem que exista defeito algum a corrigir.

O ciclo 01 chegará ao portão 5 sem saída legítima. Sem regra, a saída praticada
será informal — alguém dispensa o parecer na sessão, sem registro. Isso aciona
uma das interrupções obrigatórias da fase: a verificação tripla reduzida para
acelerar entrega.

A spec 0001 já registrou esta dependência de processo como bloqueio conhecido.
Esta decisão a fecha.

## Decisão

Passa a existir o resultado `não aplicável`, admissível apenas quando o
artefato não possui superfície do domínio daquele parecer.

A distinção que sustenta a regra inteira: **`não demonstrado` fala da
evidência; `não aplicável` fala do objeto.** O primeiro diz que havia o que
julgar e a evidência não foi obtida. O segundo diz que não havia o que julgar.

## Regra

1. **Quem emite.** Apenas o próprio parecerista, sobre o seu próprio parecer.
   Nenhum outro agente e nenhuma outra pessoa declara `não aplicável` no lugar
   dele.

2. **Condição única.** O artefato não possui superfície do domínio. O parecer
   deve nomear o que constituiria superfície naquele domínio e demonstrar sua
   ausência no artefato, item por item. Afirmação genérica de inaplicabilidade
   não é parecer.

3. **Teste de separação.** Com ferramenta, acesso e tempo suficientes, haveria
   algo a julgar? Se sim, o resultado é `aprova`, `reprova` ou `não
   demonstrado` — nunca `não aplicável`. Falta de ferramenta, de história no
   Storybook, de ambiente ou de acesso é `não demonstrado`.

4. **Ausência que é defeito não é ausência de superfície.** Um artefato que
   renderiza e não expõe nome acessível tem superfície de acessibilidade e está
   reprovado. Ausência de afordância nunca é ausência de superfície.

5. **Vedações por tipo de artefato.** Artefato que renderiza interface:
   `especialista-em-acessibilidade` nunca emite `não aplicável`. Artefato que
   contém código versionado: `revisor-de-codigo` nunca emite. Artefato cujo
   comportamento é observável por execução: `engenheiro-de-qualidade` nunca
   emite.

6. **Piso de verificação.** Pelo menos um dos três pareceres é `aprova`. Três
   `não aplicável` significa que ninguém verificou nada: o portão não abre e o
   plano de tarefas está errado.

7. **Ratificação.** Todo `não aplicável` é ratificado pela pessoa supervisora
   no portão 6. Sem ratificação registrada, bloqueia como `não demonstrado`.

8. **Registro.** Toda emissão entra na conclusão do ciclo em `docs/`, com
   domínio, justificativa e ratificação. Reincidência do mesmo agente em ciclos
   consecutivos é sinal de estatuto ou de sequência de ciclos mal desenhada, e
   exige revisão — não mais emissões.

9. **Previsão no portão 3.** `tarefas.md` declara quais pareceres se espera que
   sejam `não aplicável`. A previsão é aviso ao portão 5, nunca autorização.
   Divergência entre previsão e emissão é registrada e não bloqueia; a palavra
   final é do parecerista.

## Caso previsto hoje

Apenas o ciclo 01, no parecer de acessibilidade. Os ciclos 03 a 08 produzem
tokens, componentes e gráficos, todos com superfície nos três domínios. O ciclo
04 entrega a bancada que executa a verificação de acessibilidade: julgar se ela
verifica o que afirma verificar é superfície do
`especialista-em-acessibilidade`, não exceção a ele.

## Emenda proposta ao processo

Em `docs/processo-de-desenvolvimento-sdd.md`, seção **5. Verificação tripla**,
substituir o parágrafo de resultados e o portão por:

> Cada parecer é `aprova`, `reprova`, `não demonstrado` ou `não aplicável`,
> sempre com evidência. `não demonstrado` bloqueia como reprovação. `não
> aplicável` só é admissível quando o artefato não possui superfície do domínio
> daquele parecer, nas condições de `docs/decisao-parecer-nao-aplicavel.md`.
> Nenhum deles corrige o que aponta; quem escreveu corrige e submete de novo.
>
> **Portão:** os três pareceres são `aprova` ou `não aplicável`, com pelo menos
> um `aprova`, e todo `não aplicável` ratificado no portão 6.

Em **3. Plano de tarefas**, acrescentar: `tarefas.md` declara os pareceres
previstos como `não aplicável`, com a razão.

A **Definição de pronto de um componente** não muda. Seu item 8 continua
exigindo os três pareceres aprovados, porque componente sempre tem superfície
nos três domínios.

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Aceitar `aprova` vazio do parecerista sem superfície | Falsifica o registro. A constituição proíbe afirmação de acessibilidade sem verificação executada, e o critério 4 da fase exige acessibilidade verificada por execução |
| Dispensar o parecerista por decisão pontual, ciclo a ciclo | Sem registro, normaliza rápido e entrega a terceiro o julgamento sobre existir superfície, que é do dono do domínio |
| Reduzir a verificação tripla a dois pareceres em ciclos de infraestrutura | Aciona interrupção obrigatória da fase e perde o ciclo 04, que é infraestrutura com superfície de acessibilidade |
| Tratar `não demonstrado` como aceitável quando não há superfície | Destrói o significado do sinal de bloqueio mais forte do processo |

## Risco aceito

`não aplicável` pode virar porta dos fundos de `não demonstrado`. A regra 3
separa os dois casos, as regras 4 e 5 fecham as passagens mais prováveis, e as
regras 7 e 8 tornam cada emissão visível e auditável. O risco residual é
detectável pelo registro do item 8 antes de causar dano.

## Fora de escopo

Número de pareceristas, escopo de estatuto, ferramentas de cada agente,
sequência de ciclos, decisões de marca em aberto e qualquer antecipação do
ciclo 02.

## Perguntas para revisão

1. A distinção entre `não aplicável` e `não demonstrado` está clara o bastante
   para ser aplicada por um agente com contexto zero?
2. Está correto que só o próprio parecerista possa emitir `não aplicável`?
3. As vedações da regra 5 cobrem as passagens de abuso mais prováveis?
4. O piso de pelo menos um `aprova` é a guarda certa contra o portão vazio?
5. Está correto exigir ratificação humana no portão 6, em vez de aceitar a
   emissão como suficiente?
6. A previsão no portão 3 vale o acréscimo em `tarefas.md`?
7. Está correto manter intacta a definição de pronto de um componente?
8. A emenda proposta é a menor alteração possível ao processo?

Se todas forem `sim`, registre `ACCEPTED`. Se alguma for `não`, indique o número
e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 20 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções.
