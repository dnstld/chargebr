# Spec Delta

## ADDED Requirements

### Requirement: Localizador independente do que se afirma

Uma afirmação sobre o resultado renderizado de uma história SHALL localizar
o elemento medido por um sinal independente da propriedade que a afirmação
verifica. Uma afirmação SHALL NOT ser a única prova de um comportamento
quando o elemento foi localizado por um atributo `data-*` cujo valor, ou
cujo efeito de estilo, é exatamente o que a afirmação lê.

**Por quê:** um localizador reaproveitado como prova não reprova quando o
comportamento que ele deveria provar quebra — a busca continua encontrando
o elemento pelo mesmo sinal, e a afirmação compara esse sinal contra si
mesmo ou contra um valor que coincide com o estado quebrado. Medido em
`docs/decisao-biblioteca-de-componentes.md`-derived `design.md` (D8,
`interface-atomic-structure`): uma composição que estilizava por seletor um
elemento de átomo, usando o atributo `data-weight` como gancho, tinha sua
única prova localizando por esse mesmo atributo — a afirmação passava
mesmo com o acoplamento quebrado, porque o localizador nunca deixava de
achar o elemento. A mesma varredura encontrou mais dois casos, sem relação
com aquele: uma afirmação de estilo computado cujo valor esperado coincidia
com o padrão do navegador (independente de qualquer classe aplicar), e uma
afirmação que comparava um rótulo `data-*` contra si mesmo em vez de
comparar a forma de fato desenhada.

#### Scenario: Acoplamento sem prova independente é encontrado por medição

- **WHEN** o sinal usado para localizar um elemento é decoplado do
  comportamento que uma afirmação sobre esse elemento deveria provar, e o
  comportamento é quebrado
- **THEN** a afirmação reprova sozinha, nomeando a propriedade divergente,
  sem depender de um localizador reprovar primeiro
- **Prova:** o comportamento é quebrado com o localizador já decoplado dele
  (planta de posição ou de conteúdo, não do mesmo atributo); a afirmação
  reprova nomeando o valor esperado e o recebido; o plantio é revertido

#### Scenario: Valor esperado coincide com o padrão do navegador

- **WHEN** uma afirmação de estilo computado compara contra um valor que é
  também o valor inicial da propriedade CSS, sem nenhuma regra aplicada
- **THEN** essa afirmação não é a única prova do comportamento — outra
  afirmação, independente e com valor que não coincide com o padrão, prova
  o mesmo comportamento
- **Prova:** a classe ou regra responsável é removida mantendo os demais
  atributos; a afirmação contra o valor-padrão continua passando; a
  afirmação independente reprova

