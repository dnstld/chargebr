# Desenho — tokens v1

## Context

Ver `proposal.md` — Why. `packages/tokens` existe como casca vazia desde o ciclo
1, e `pnpm verify` já roda tipos, formatação, lint e testes sobre o perímetro.
As cores de marca e as medições de contraste estão registradas em
`docs/decisao-identidade-visual.md`; este ciclo não as reabre.

A stack está fixada na decisão de configuração: DTCG processado por Style
Dictionary, e CSS Modules consumindo custom properties.

## Goals / Non-Goals

**Goals**

- Uma fonte só, da qual CSS e TypeScript derivam sem divergir.
- Regras entre camadas verificáveis por execução, não por convenção.
- Critério de paleta nomeado, executável e reproduzível.

**Non-Goals**

- Escolher a forma de qualquer gráfico.
- Definir tokens de componente para componentes que ainda não existem — a
  terceira camada nasce com o mínimo que prova a regra de referência.
- Rampas sequenciais e divergentes, e paleta de status. Entram no ciclo 6, junto
  com os gráficos que as consomem.

## Decisions

**Style Dictionary sobre DTCG, gerando CSS e TypeScript.** Decidido na
configuração inicial. Em desenho, a consequência é que as regras entre camadas
podem ser conferidas na árvore de tokens já resolvida, e não por análise de
texto: o gerador sabe o que é referência e o que é literal.

**Temas por redefinição de custom properties, não por dois artefatos.** O tema
escuro redefine as mesmas custom properties sob um seletor, com a preferência do
sistema como padrão e um atributo no documento como override explícito. É o que
torna verificável o requisito de trocar tema sem nova geração. A alternativa —
gerar um arquivo por tema e trocar a folha — exigiria recarregar e romperia esse
requisito.

**As seis checagens são padrão adotado, com implementação própria.** O método
está documentado; o repositório implementa as checagens como teste seu, usando
`culori` (MIT) para conversão OKLCH e para a simulação de protanopia e
deuteranopia pelo modelo de Machado, Oliveira e Fernandes. Vendorizar um script
externo criaria uma cópia que ninguém atualiza; depender de um pacote que
encapsule as seis checagens não existe.

A alternativa considerada — confiar num validador de terceiro sem entender os
limiares — foi recusada: o resultado precisa ser explicável quando reprovar, e os
números de corte fazem parte do critério, não do detalhe de implementação.

**A checagem roda na etapa de testes, não numa etapa nova.** `pnpm verify` tem
quatro estágios e o ciclo 1 provou que cada um falha isoladamente nomeando-se.
Acrescentar um quinto estágio para a paleta obrigaria a mexer no workflow de CI e
no contrato já provado. A checagem é um teste, e testes já têm estágio.

**O que a paleta cobre nesta versão.** Três séries categóricas, validadas
também no teste de todos os pares, não só dos adjacentes. Mais de três séries
num gráfico onde qualquer marca pode encostar em qualquer outra é limite de
forma, não de paleta, e será tratado no ciclo 6.

## Risks / Trade-offs

- A simulação de daltonismo depende do modelo escolhido, e os limiares são
  calibrados para ele → o modelo fica declarado no teste, junto com os cortes,
  para que uma troca de biblioteca não mude o resultado em silêncio.
- A superfície de gráfico do tema escuro ainda não existe e será decidida neste
  ciclo → a paleta escura foi conferida contra uma superfície de placeholder e
  precisa ser reconferida contra a definitiva; se reprovar, o valor muda, não o
  critério.
- Separação sob tritanopia no tema claro é baixa nos valores atuais → as seis
  checagens se ancoram em protanopia e deuteranopia, que são as prevalentes;
  fica registrado como limitação conhecida, não como reprovação.
- A terceira camada nasce quase vazia, porque não há componentes → ela existe
  para que a regra de referência seja provada agora, e não descoberta quebrada no
  ciclo 5.

## Migration Plan

Nenhuma migração. `packages/tokens` está vazio; tudo é adição. Reversão é o
revert do commit.

## Open Questions

Nenhuma. A superfície de gráfico do tema escuro é decidida dentro deste ciclo,
pelas tarefas, e não é pergunta deixada em aberto.
