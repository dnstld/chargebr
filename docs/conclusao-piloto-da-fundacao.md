# Conclusão do piloto da fundação

## Estado

`APROVADA — FUNDACAO VALIDADA NO ESCOPO DO PILOTO`

O merge do documento na `main` registrou a aprovação desta conclusão. A etapa consolidou resultados já revisados; não alterou registros, schema, migrations ou dados persistentes.

## Conclusão proposta

**A fundação do ChargeBR está validada para o escopo definido no piloto.**

Os três casos foram reconstruídos por uma pessoa revisora independente, receberam `ACCEPTED` e terminaram sem lacunas bloqueantes abertas. As lacunas encontradas durante a execução foram corrigidas e submetidas a nova revisão quando necessário.

Essa conclusão demonstra que a fundação consegue representar, nos três recortes avaliados, proveniência, tempo, incerteza, valores, organizações e relações regulatórias sem depender de texto livre para contornar relações estruturais indispensáveis.

Ela não afirma que o sistema inteiro está pronto para produção nem que o modelo cobre antecipadamente qualquer caso futuro.

## Resultados dos casos

| Caso | Capacidade principal avaliada | Resultado final | Conclusão |
| --- | --- | --- | --- |
| [`PILOT-02`](resultado-revisao-pilot-02.md) | Afirmação empresarial sobre infraestrutura; separação entre estado realizado e expectativa futura | `ACCEPTED` | A proveniência da publicação da BYD, os valores 125 e 225, seus estados temporais e a ausência de confirmação independente ficaram preservados. |
| [`PILOT-03`](resultado-revisao-pilot-03-correcao-01.md) | Métrica nacional com divergência entre duas publicações da mesma série | `ACCEPTED` | Os valores 21.061 e 21.060 permaneceram separados, provisórios, rastreáveis e associados à mesma métrica, sem escolha silenciosa de um vencedor. |
| [`PILOT-01`](resultado-revisao-pilot-01-correcao-01.md) | Cadeia normativa com publicação, efeitos, encerramento e relações entre instrumentos | `ACCEPTED` | Os quatro instrumentos, os marcos temporais, o encerramento da MP, a convalidação e a regulamentação ficaram estruturalmente consultáveis. |

## Critérios gerais avaliados

| Critério do piloto | Evidência consolidada | Estado |
| --- | --- | --- |
| Relação material com o Brasil | Confirmada nos três casos e sustentada pelas respectivas fontes. | Atendido |
| Proveniência das afirmações | Fontes, publicações, observações, evidências e acontecimentos permanecem rastreáveis. | Atendido |
| Separação semântica | Declaração da fonte, normalização e representação do ChargeBR permanecem distinguíveis. | Atendido |
| Preservação do histórico | Estados anteriores, datas de referência, publicação, vigência, efeitos e encerramento não são sobrescritos. | Atendido |
| Incerteza e conflito | Afirmação empresarial não corroborada e divergência quantitativa permanecem explícitas. | Atendido |
| Valores e métricas | Valor, unidade, período, geografia e observação de origem foram preservados quando aplicáveis. | Atendido |
| Organizações e instrumentos | Registros canônicos e papéis ou relações aplicáveis foram representados sem duplicação ou inferência excessiva. | Atendido |
| Reconstrução independente | Denis Toledo reconstruiu os três casos a partir dos registros e das fontes congeladas. | Atendido |
| Relações estruturais indispensáveis | As revisões finais confirmaram que nenhum texto livre ainda contorna as relações exigidas pelos casos. | Atendido |

## Lacunas tratadas durante o piloto

| ID | Origem | Tratamento | Estado final |
| --- | --- | --- | --- |
| `P02-DOC-01` | `PILOT-02` | A documentação passou a distinguir o título original da afirmação efetivamente estruturada. | Resolvida na própria revisão; não bloqueante |
| `P03-REG-01` | `PILOT-03` | As observações foram normalizadas e os dois valores foram ligados a uma definição comum de métrica sem apagar a divergência. | Resolvida e aceita na segunda revisão |
| `P01-MOD-01` | `PILOT-01` | Acontecimentos receberam vínculos estruturais com seus instrumentos centrais. | Resolvida e aceita na segunda revisão |
| `P01-MOD-02` | `PILOT-01` | Convalidação e regulamentação receberam relações direcionais e tipadas entre instrumentos. | Resolvida e aceita na segunda revisão |
| `P01-RES-01` | `PILOT-01` | O encerramento de vigência recebeu a fase própria `expiry`. | Resolvida e aceita na segunda revisão |

Não existem lacunas bloqueantes abertas ao final do piloto.

## Decisões de fundação exercitadas

O piloto justificou e verificou mudanças incrementais para:

- vincular acontecimentos a organizações com papéis explícitos;
- preservar datas de publicação com precisão diária;
- vincular acontecimentos a instrumentos regulatórios;
- representar relações direcionais e tipadas entre instrumentos;
- distinguir encerramento de vigência com a fase `expiry`.

As mudanças foram aprovadas em documentos e migrations separados antes de serem usadas nas versões corrigidas dos casos. As revisões registram que os seeds foram executados em transações descartáveis e revertidos, sem persistir os dados dos pilotos no Supabase.

## Questão remanescente não bloqueante

`P03-MET-01` permanece como proposta metodológica futura: avaliar, com justificativa empírica ou documental, se comparações de valores da mesma métrica e do mesmo período devem usar alguma tolerância quantitativa.

A sugestão não estabelece uma margem de cinco, não altera valores publicados e não é requisito para a conclusão do piloto. Qualquer regra futura precisará de decisão própria antes de ser adotada.

## Limites desta validação

O piloto valida a fundação somente contra os três casos e os critérios aprovados. Permanecem fora desta conclusão:

- cobertura contínua ou exaustiva do mercado;
- automação de coleta, classificação ou publicação;
- escala, desempenho e operação recorrente;
- interface pública, newsletter e produto comercial;
- políticas de acesso para usuários finais;
- importação integral do conteúdo histórico do Notion;
- garantia de que nenhum caso futuro exigirá extensão do modelo.

Novos casos ainda podem revelar lacunas. Quando isso ocorrer, deve continuar valendo o método usado no piloto: registrar a necessidade, tomar uma decisão pequena, alterar a fundação somente depois da revisão e preservar o histórico.

## Próximo passo

O piloto da fundação está formalmente encerrado. A etapa seguinte é revisar a [decisão sobre o primeiro ciclo do fluxo de inteligência](decisao-primeiro-ciclo-fluxo-inteligencia.md) antes de ampliar dados ou iniciar automações.

Essa nova decisão deve escolher um objetivo operacional limitado e seus critérios de aceite, sem importar automaticamente a estrutura ou os registros do Notion.
