# Spec Delta

## ADDED Requirements

### Requirement: Asserção discrimina a quebra do comportamento que prova

Uma história que prova uma garantia SHALL escolher argumentos — valores de
prop, estado de ambiente, ou o elemento consultado — sob os quais a asserção
seria falsa se o comportamento provado estivesse quebrado de uma forma
plausível. Um argumento sob o qual a asserção é verdadeira independentemente
de o comportamento existir ou estar correto SHALL NOT ser usado como prova
dessa garantia.

**Por quê:** medido em `button-variants` — cinco histórias/testes passavam,
aparentando provar a garantia nomeada, sob argumentos que não dependiam do
comportamento sob prova (ver proposal.md para as cinco ocorrências). Uma
história assim não é ausência de teste — o que seria visível — é pior: passa,
e esconde a ausência de prova atrás de verde.

Este requisito não tem prova automatizável no formato dos demais requisitos
desta capacidade (plantio de defeito, execução, reprovação nomeada) — é
verificado por revisão, no mesmo formato que `openspec/config.yaml`
(`rules.specs`) já usa para "todo critério de aceite nomeia o teste que o
prova". Como mecanizar isso, se for possível, fica em aberto.

#### Scenario: Revisão nomeia o argumento e a quebra que ele não distingue

- **WHEN** uma história prova uma garantia escolhendo um argumento sob o qual a asserção é verdadeira mesmo com o comportamento quebrado de uma forma plausível
- **THEN** a revisão nomeia o argumento escolhido e a quebra plausível que ele não distingue, e não aceita a história como prova daquela garantia
- **Prova:** achado de revisão, nomeando a história, o argumento e a mutação de comportamento que ele deixaria passar despercebida
