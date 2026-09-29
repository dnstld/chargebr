# Spec Delta

## ADDED Requirements

### Requirement: Asserção prova o comportamento, não o ambiente

Uma asserção que alega provar uma garantia SHALL ser revisada contra
mutação do comportamento que ela alega provar: se existe uma mutação
mínima — remover o efeito, inverter a condição, trocar o valor — sob a
qual a asserção, como está escrita, continuaria passando, ela SHALL ser
lida como não provando a garantia, e a revisão SHALL nomear a mutação que
a desqualifica.

**Por quê:** medido em `button-variants` — cinco histórias/testes provaram
uma garantia com argumentos, estado de ambiente ou localizador sob os
quais a asserção passava independentemente de o comportamento existir
(`docs/pontos-abertos.md`, ponto 16, as cinco nomeadas). Não há
propriedade sintática comum às cinco — cada uma depende de saber o que o
teste alega provar, não só o que ele executa —, e por isso este requisito
não tem prova mecânica: é revisado, não executado. O critério de revisão
é o mesmo método que encontrou as cinco ocorrências originais — perguntar
que mutação a asserção deixaria passar —, para que o próprio critério não
seja vago a ponto de repetir o defeito que ele nomeia.

#### Scenario: Asserção que passa sob comportamento quebrado é identificada por revisão

- **WHEN** uma história ou teste alega provar uma garantia, e existe uma mutação mínima do comportamento sob a qual a asserção continuaria passando
- **THEN** a revisão nomeia a mutação e não conta a asserção como prova da garantia
- **Prova:** revisão nomeada — a mutação considerada, e por que a asserção não a detectaria, registradas no material de revisão (design ou corpo do PR)

#### Scenario: Asserção independente da mutação considerada é aceita

- **WHEN** uma asserção continuaria reprovando sob toda mutação mínima considerada do comportamento que ela alega provar
- **THEN** a revisão aceita a asserção como prova da garantia
- **Prova:** revisão nomeada — as mutações consideradas e o resultado de cada uma, registrados no material de revisão
