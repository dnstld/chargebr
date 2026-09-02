# Resultado da segunda revisão independente de `PILOT-03`

## Identificação

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-03` |
| Revisão | Segunda revisão — correção 01 |
| Versão dos registros | Commit [`f31bc6b599859fa114b54bf18219f65fbd91844c`](https://github.com/dnstld/chargebr/commit/f31bc6b599859fa114b54bf18219f65fbd91844c) |
| Arquivo avaliado | `supabase/seed.sql` |
| SHA-256 do arquivo | `49bac2db8d4b94a18be86ad3908b030661746327ea874779f9ad3c081270485d` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 2 de setembro de 2026 |
| Revisão anterior | [`CORRECTION_REQUIRED`](resultado-revisao-pilot-03.md) |
| Pacote desta revisão | [Segunda revisão independente — correção 01](revisao-pilot-03-correcao-01.md) |
| Checklist | [Checklist de revisão do piloto](checklist-de-revisao-do-piloto.md) |

## Síntese reconstruída pela pessoa revisora

A publicação de março informa 21.061 pontos públicos e semipúblicos de recarga no Brasil para fevereiro de 2026. A publicação de junho referencia 21.060 para o mesmo período. A versão corrigida mantém os dois valores separados, associa ambos à mesma métrica e os classifica como provisórios. Permanece desconhecida a origem da diferença de uma unidade e qual valor deve prevalecer.

## Condições de independência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `I-01` | `PASS` | O commit e o SHA-256 congelam a versão corrigida antes da segunda revisão. |
| `I-02` | `PASS` | A pessoa revisora confirmou que não precisou de explicações verbais nem de informações não registradas. |
| `I-03` | `PASS` | As duas publicações da ABVE estavam acessíveis. |
| `I-04` | `PASS` | A pessoa revisora confirmou que não preparou nem modificou a versão corrigida. |

## Escopo e relevância

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `S-01` | `PASS` | O conjunto corresponde ao recorte aprovado para `PILOT-03`: a divergência entre 21.061 e 21.060 para fevereiro de 2026. |
| `S-02` | `PASS` | Brasil está explícito nas publicações, nas observações e nos dois valores estruturados. |
| `S-03` | `PASS` | 25.429, 14.827, 16.880 e os cálculos de crescimento, cobertura e proporção não foram incorporados como observações, evidências, eventos ou métricas. Percentuais presentes nos títulos originais permanecem apenas como metadados de proveniência. |
| `S-04` | `PASS` | As duas publicações da mesma série são suficientes para representar a divergência sem ampliar a cobertura. |

## Proveniência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `P-01` | `PASS` | `sources.slug = 'abve'` identifica a fonte publicadora das duas atualizações. |
| `P-02` | `PASS` | Cada publicação está ligada à fonte ABVE. |
| `P-03` | `PASS` | Títulos, datas, URLs e natureza das duas publicações foram preservados. |
| `P-04` | `PASS` | As observações preservam separadamente 21.061 e 21.060 e os termos usados nas respectivas publicações. |
| `P-05` | `PASS` | Cada evidência deriva da observação e da publicação correspondentes. |
| `P-06` | `PASS` | Cada evento possui exatamente um vínculo `supports` com sua evidência. |
| `P-07` | `PASS` | A publicação posterior não foi tratada como confirmação independente da publicação de março. |
| `P-08` | `PASS` | A origem compartilhada, a ausência de captura própria e os limites de confirmação permanecem visíveis. |

## Separação semântica

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `M-01` | `PASS` | Fonte, publicações, observações, evidências, eventos, definição de métrica e valores permanecem registros distintos. |
| `M-02` | `PASS` | Os eventos registram o que a ABVE publicou; o ChargeBR não escolhe qual valor está correto. |
| `M-03` | `PASS` | As afirmações originais foram preservadas, enquanto `normalized_claim` explicita separadamente a interpretação comum adotada. |
| `M-04` | `PASS` | Os títulos dos eventos usam “publicam” e “referencia”, sem afirmar um estado mais forte que as evidências. |
| `M-05` | `PASS` | A linhagem compartilhada permanece marcada como `likely_shared`, sem produzir uma confirmação independente adicional. |

## Tempo e histórico

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `T-01` | `PASS` | Fevereiro de 2026 permanece como período de referência, separado das publicações de 4 de março e 22 de junho. |
| `T-02` | `N/A` | O recorte não contém expectativa ou estado futuro. |
| `T-03` | `PASS` | A referência posterior a 21.060 não sobrescreve a observação anterior de 21.061. |
| `T-04` | `PASS` | A ordem das duas publicações e seus respectivos valores pode ser reconstruída pelos registros. |

## Valores e métricas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `Q-01` | `PASS` | Os valores e termos originais foram preservados nas observações. |
| `Q-02` | `PASS` | Fevereiro de 2026 e Brasil estão registrados para os dois valores. |
| `Q-03` | `PASS` | A pessoa revisora confirmou que a unidade canônica `charging_point` representa adequadamente os termos das publicações neste recorte. |
| `Q-04` | `PASS` | 21.061 e 21.060 permanecem em registros distintos, ligados às respectivas observações, sem escolha de vencedor. |
| `Q-05` | `PASS` | Nenhum crescimento, cobertura, proporção ou agregação derivada foi estruturado. |

## Organizações e instrumentos regulatórios

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `E-01` | `PASS` | ABVE e Tupi Mobilidade possuem registros canônicos distintos, sem duplicação por variação de nome. |
| `E-02` | `PASS` | Os papéis permanecem explícitos: ABVE como publicadora e Tupi Mobilidade como participante da apuração. |
| `E-03` | `N/A` | O caso de métrica não envolve instrumento regulatório. |
| `E-04` | `N/A` | O caso não contém relações jurídicas entre instrumentos. |

## Incerteza e reconstrução

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `R-01` | `PASS` | A divergência de uma unidade está explícita e os dois valores estão classificados como provisórios. |
| `R-02` | `PASS` | A ausência de explicação para a divergência não foi convertida em escolha entre os valores. |
| `R-03` | `PASS` | A pessoa revisora reconstruiu os valores, o período, a geografia e o contexto das duas publicações. |
| `R-04` | `PASS` | As duas publicações da ABVE e o que cada uma sustenta foram identificados. |
| `R-05` | `PASS` | Permanecem desconhecidos a origem da diferença de uma unidade e qual valor deve prevalecer. |
| `R-06` | `PASS` | A definição de métrica e os dois registros em `metric_values` representam estruturalmente os valores e mantêm os vínculos com as observações de origem. |

## Verificações específicas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `C1-01` | `N/A` | Outro caso. |
| `C1-02` | `N/A` | Outro caso. |
| `C1-03` | `N/A` | Outro caso. |
| `C1-04` | `N/A` | Outro caso. |
| `C2-01` | `N/A` | Outro caso. |
| `C2-02` | `N/A` | Outro caso. |
| `C2-03` | `N/A` | Outro caso. |
| `C2-04` | `N/A` | Outro caso. |
| `C3-01` | `PASS` | 21.061 e 21.060 aparecem como observações e valores distintos. |
| `C3-02` | `PASS` | Pontos de recarga, eletropostos, carregadores e total da rede foram preservados conforme as fontes. |
| `C3-03` | `PASS` | A unidade comum foi normalizada com a justificativa confirmada na primeira revisão e reavaliada nesta segunda revisão. |
| `C3-04` | `PASS` | Crescimento, cobertura e proporções derivadas não foram estruturados no caso. |

## Verificação técnica de reprodução

A versão corrigida foi executada em uma única transação contra o schema aprovado. A execução confirmou:

- uma fonte, duas organizações e duas publicações;
- duas observações normalizadas;
- uma definição de métrica candidata;
- dois valores mensais provisórios, exatamente 21.060 e 21.061;
- duas evidências, dois eventos e dois vínculos `supports`;
- quatro vínculos `subject` entre os eventos, a ABVE e a Tupi Mobilidade.

Ao final, a transação foi revertida. Uma consulta posterior confirmou que nenhum registro dos pilotos permaneceu no banco persistente.

## Tratamento da lacuna anterior

| ID | Estado | Evidência | Conclusão |
| --- | --- | --- | --- |
| `P03-REG-01` | `RESOLVIDA` | As duas observações estão normalizadas; existe uma definição de métrica comum; 21.061 e 21.060 foram registrados separadamente em `metric_values` e ligados às observações de origem. | `M-03`, `Q-03` e `R-06` passaram nesta revisão. |

## Nova proposta não bloqueante

| ID | Categoria | Severidade | Descrição | Evidência | Próxima decisão |
| --- | --- | --- | --- | --- | --- |
| `P03-MET-01` | `metodologia` | `não bloqueante` | Avaliar futuramente se comparações de valores da mesma métrica e do mesmo período devem usar uma tolerância quantitativa; a pessoa revisora sugeriu considerar uma margem de cinco. | Observação registrada durante a segunda revisão. | Tratar em decisão metodológica separada, com justificativa empírica ou documental, antes de adotar a regra. A tolerância não deve alterar os valores publicados. |

Não existem lacunas bloqueantes. A proposta `P03-MET-01` não é requisito para concluir `PILOT-03` nem para iniciar o próximo caso.

## Resultado

| Campo | Valor |
| --- | --- |
| Resultado | `ACCEPTED` |
| Itens com `FAIL` | Nenhum |
| Lacunas bloqueantes | Nenhuma |
| Síntese reconstruída pela pessoa revisora | A publicação de março informa 21.061 pontos públicos e semipúblicos de recarga no Brasil para fevereiro de 2026; a publicação de junho referencia 21.060 para o mesmo período; ambos permanecem separados, provisórios e associados à mesma métrica, sem explicação para a diferença nem escolha de qual deve prevalecer. |
| Próxima ação | Preparar os registros reproduzíveis de `PILOT-01` em uma nova etapa. |

`PILOT-03` está concluído. `PILOT-01` pode começar depois do merge deste resultado na `main`.
