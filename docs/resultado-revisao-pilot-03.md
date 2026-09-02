# Resultado da revisão independente de `PILOT-03`

## Identificação

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-03` |
| Versão dos registros | Commit [`ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0`](https://github.com/dnstld/chargebr/commit/ad4579bbedf9d73f4e1f0da847ae6eaf0f7e93d0) |
| Arquivo avaliado | `supabase/seed.sql` |
| SHA-256 do arquivo | `fb3c1a08aeec702e4d3d192bdb613b29e6dcefe46c6cbb14458eec0eb437321b` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 2 de setembro de 2026 |
| Revisão anterior | `N/A` |
| Checklist | [Checklist de revisão do piloto](checklist-de-revisao-do-piloto.md) |

## Síntese reconstruída pela pessoa revisora

A publicação de março sustenta que o Brasil tinha 21.061 pontos públicos e semipúblicos de recarga até fevereiro de 2026. Ela também informa crescimento de 42% sobre fevereiro de 2025, quando havia 14.827, e de 25% sobre agosto de 2025, quando havia 16.880. A publicação ainda menciona, com números e percentuais, a expansão dos carregadores rápidos e ultrarrápidos nos 12 meses anteriores.

A publicação de junho sustenta que o Brasil tinha 25.429 pontos públicos e semipúblicos de recarga até maio de 2026. Ao mencionar o levantamento anterior, ela registra 21.060 para fevereiro de 2026, e não 21.061 como a publicação de março.

Para o recorte aprovado, somente 21.061 e 21.060 foram avaliados como afirmações estruturadas. Os demais números permanecem como contexto das fontes, sem expansão do caso. A revisão confirmou o conteúdo das duas publicações da ABVE, mas não auditou de forma independente os levantamentos subjacentes. Permanecem desconhecidos o motivo da diferença de uma unidade e qual dos dois valores deve prevalecer.

## Condições de independência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `I-01` | `PASS` | O commit e o SHA-256 congelam a versão anterior à revisão. |
| `I-02` | `PASS` | A pessoa revisora confirmou que conseguiu avaliar o caso sem explicações verbais necessárias ou informações não registradas. |
| `I-03` | `PASS` | As duas publicações estavam acessíveis. A ausência de auditoria dos levantamentos subjacentes não impede avaliar o que a ABVE publicou. |
| `I-04` | `PASS` | A pessoa revisora confirmou que não preparou nem modificou os registros avaliados. |

## Escopo e relevância

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `S-01` | `PASS` | O conjunto corresponde ao recorte aprovado para `PILOT-03`: a divergência entre 21.061 e 21.060 para fevereiro de 2026. |
| `S-02` | `PASS` | A relação com o Brasil está explícita nas fontes e nos registros. |
| `S-03` | `PASS` | O total de maio e os cálculos de crescimento e cobertura permanecem fora das observações, evidências, eventos e métricas do caso. Percentuais presentes nos títulos originais são metadados de proveniência. |
| `S-04` | `PASS` | As duas publicações da mesma série são suficientes para demonstrar a divergência sem ampliar a cobertura. |

## Proveniência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `P-01` | `PASS` | `sources.slug = 'abve'` identifica a fonte que publicou as duas atualizações. |
| `P-02` | `PASS` | Cada publicação está ligada à fonte ABVE. |
| `P-03` | `PASS` | Títulos, datas, URLs e natureza das duas publicações foram preservados. |
| `P-04` | `PASS` | As observações reproduzem separadamente 21.061 e 21.060, conforme suas publicações. |
| `P-05` | `PASS` | Cada evidência deriva da observação e da publicação correspondentes. |
| `P-06` | `PASS` | Cada evento possui exatamente um vínculo `supports` com sua evidência. |
| `P-07` | `PASS` | A publicação posterior não foi tratada como confirmação independente da publicação de março. |
| `P-08` | `PASS` | Referências externas, ausência de captura própria e limites de confirmação permanecem visíveis. |

## Separação semântica

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `M-01` | `PASS` | Fonte, publicações, observações, evidências e eventos permanecem registros distintos. |
| `M-02` | `PASS` | Os eventos registram o que a ABVE publicou, sem escolher um valor correto. |
| `M-03` | `FAIL` | `normalization_status = 'unresolved'` classifica a unidade como não resolvida, mas a pessoa revisora encontrou base suficiente nas próprias publicações para tratar os termos como a mesma unidade. |
| `M-04` | `PASS` | Os títulos dos eventos usam “publicam” e “referencia”, sem afirmar um estado mais forte que as evidências. |
| `M-05` | `PASS` | A linhagem compartilhada foi marcada como `likely_shared`, sem produzir confirmação independente adicional. |

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
| `Q-01` | `PASS` | Os valores e termos originais foram preservados nas observações e notas. |
| `Q-02` | `PASS` | Fevereiro de 2026 e Brasil estão registrados para os dois valores. |
| `Q-03` | `FAIL` | A pessoa revisora concluiu que existe base defensável para uma unidade canônica equivalente a ponto público ou semipúblico de recarga, mas ela não foi usada. |
| `Q-04` | `PASS` | 21.061 e 21.060 permanecem separados, vinculados às respectivas publicações. |
| `Q-05` | `PASS` | O caso não cria crescimento, cobertura, proporção ou agregação derivada. |

## Organizações e instrumentos regulatórios

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `E-01` | `PASS` | ABVE e Tupi Mobilidade possuem registros canônicos distintos, sem duplicação por variação de nome. |
| `E-02` | `PASS` | As duas organizações estão ligadas como `subject`; as notas distinguem a ABVE publicadora da Tupi participante da apuração. |
| `E-03` | `N/A` | O caso de métrica não envolve instrumento regulatório. |
| `E-04` | `N/A` | O caso não contém relações jurídicas entre instrumentos. |

## Incerteza e reconstrução

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `R-01` | `PASS` | A divergência de uma unidade e a linhagem provavelmente compartilhada estão explícitas. |
| `R-02` | `PASS` | A ausência de explicação para a divergência não foi convertida em escolha entre os valores. |
| `R-03` | `PASS` | A pessoa revisora reconstruiu os valores, os períodos e o contexto das duas publicações. |
| `R-04` | `PASS` | As duas publicações da ABVE e o que cada uma sustenta foram identificados. |
| `R-05` | `PASS` | Permanecem desconhecidos o motivo da divergência, o valor que deve prevalecer e a validação independente dos levantamentos. |
| `R-06` | `FAIL` | Os números ficaram apenas nas observações, embora a pessoa revisora tenha considerado aplicável a relação estrutural com uma métrica canônica. |

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
| `C3-01` | `PASS` | 21.061 e 21.060 aparecem como observações distintas. |
| `C3-02` | `PASS` | Pontos de recarga, eletropostos, carregadores e total da rede foram preservados conforme as fontes. |
| `C3-03` | `PASS` | Nenhuma unidade foi normalizada silenciosamente; a revisão registra separadamente que existe base suficiente e que a normalização deve ser acrescentada. |
| `C3-04` | `PASS` | Crescimento, cobertura e proporções derivadas não foram estruturados no caso. |

## Verificação técnica de reprodução

Em 1º de setembro de 2026, o seed congelado foi executado em uma única transação contra o schema formado pelas migrações aprovadas. A execução confirmou:

- uma fonte e duas organizações;
- duas publicações, duas observações, duas evidências e dois eventos;
- dois vínculos `supports` entre eventos e evidências;
- quatro vínculos `subject` entre eventos, ABVE e Tupi Mobilidade;
- zero valores em `metric_values` para as observações de `PILOT-03`.

Ao final, a transação foi revertida. Uma consulta posterior confirmou zero registros de `PILOT-02` e `PILOT-03` no banco persistente.

## Lacunas encontradas

| ID | Categoria | Severidade | Descrição | Evidência | Próxima decisão |
| --- | --- | --- | --- | --- | --- |
| `P03-REG-01` | `registro` | `bloqueante` | Os termos das publicações oferecem base defensável para uma unidade canônica, mas as observações permanecem como não resolvidas e não existem valores de métrica para 21.061 e 21.060. | Publicações de março e junho; `observations.normalization_status`; ausência em `metric_definitions` e `metric_values` | Corrigir os registros com a estrutura existente, preservar os dois valores e submeter a versão corrigida a nova revisão. |

Não foram encontradas lacunas bloqueantes de restrição, modelo ou metodologia. A estrutura atual comporta uma definição de métrica com unidade canônica e dois valores distintos ligados às observações de origem.

## Resultado

| Campo | Valor |
| --- | --- |
| Resultado | `CORRECTION_REQUIRED` |
| Itens com `FAIL` | `M-03`, `Q-03` e `R-06` |
| Lacunas bloqueantes | `P03-REG-01` |
| Próxima ação | Corrigir os registros de `PILOT-03` no seed e realizar nova revisão independente da versão corrigida. |

`PILOT-03` ainda não está concluído. `PILOT-01` não pode começar antes que a versão corrigida receba `ACCEPTED`.
