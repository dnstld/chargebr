# Resultado da revisão independente de `PILOT-02`

## Identificação

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-02` |
| Versão dos registros | Commit [`bc5906a0096cc7424000cb25d992720f85f0ed01`](https://github.com/dnstld/chargebr/commit/bc5906a0096cc7424000cb25d992720f85f0ed01) |
| Arquivo avaliado | `supabase/seed.sql` |
| SHA-256 do arquivo | `f1ac40c58abdf3067063c77505a0f5bda4d36e45a91614a0acd0a2d387bb3af9` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 1º de setembro de 2026 |
| Revisão anterior | `N/A` |
| Checklist | [Checklist de revisão do piloto](checklist-de-revisao-do-piloto.md) |

## Síntese reconstruída pela pessoa revisora

Em 24 de março de 2026, a BYD declarou que 125 carregadores rápidos já estavam em operação pública no Brasil. A empresa também declarou a expectativa de que essa quantidade chegasse a 225 pontos de recarga rápida até o fim de 2026. A publicação é uma declaração da própria BYD e não oferece confirmação independente.

A fonte menciona ainda um carregador ultrarrápido, a projeção de mil carregadores ultrarrápidos até o fim de 2027 e liderança nacional. Esses elementos permanecem no conteúdo original e, quando necessário à fidelidade documental, em seus metadados. Eles não foram transformados em observações, evidências ou eventos do caso.

## Condições de independência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `I-01` | `PASS` | Commit e SHA-256 congelam a versão anterior à revisão. |
| `I-02` | `PASS` | A pessoa revisora confirmou que tomou as decisões com base na fonte e nos documentos registrados. |
| `I-03` | `PASS` | A fonte estava acessível e permitiu identificar publicação, data, URL e afirmações. |
| `I-04` | `PASS` | A pessoa revisora confirmou que não preparou nem modificou os registros avaliados. |

## Escopo e relevância

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `S-01` | `PASS` | O conjunto corresponde ao recorte aprovado para `PILOT-02`. |
| `S-02` | `PASS` | A relação com o Brasil está explícita na fonte e nos registros. |
| `S-03` | `PASS` | Afirmações sobre ultrarrápidos, 2027, mil unidades e liderança não viraram observações, evidências ou eventos. |
| `S-04` | `PASS` | A fonte oficial é suficiente para representar o que a própria BYD declarou; a ausência de confirmação independente permanece explícita. |

## Proveniência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `P-01` | `PASS` | `sources.slug = 'byd-brasil'` identifica a fonte oficial empresarial. |
| `P-02` | `PASS` | A publicação está ligada à fonte que a publicou. |
| `P-03` | `PASS` | Título original, data, URL e natureza da publicação foram preservados. |
| `P-04` | `PASS` | As observações preservam separadamente as afirmações de 125 e 225. |
| `P-05` | `PASS` | Cada uma das duas evidências deriva de sua observação identificada. |
| `P-06` | `PASS` | Cada evento possui exatamente um vínculo `supports` com a evidência correspondente. |
| `P-07` | `PASS` | A fonte empresarial não foi promovida a confirmação independente. |
| `P-08` | `PASS` | A referência externa e a limitação de confirmação permanecem visíveis. |

## Separação semântica

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `M-01` | `PASS` | Fonte, publicação, observações, evidências e eventos são registros distintos. |
| `M-02` | `PASS` | As conclusões se limitam ao que a BYD declarou. |
| `M-03` | `PASS` | Termos e normalizações não alteram o sentido das afirmações originais. |
| `M-04` | `PASS` | Os títulos usam “declara” e “anuncia expectativa”, sem exceder a força da evidência. |
| `M-05` | `PASS` | Não há republicação ou duplicata contada como confirmação adicional. |

## Tempo e histórico

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `T-01` | `PASS` | Publicação, anúncio e prazo futuro permanecem distinguíveis. |
| `T-02` | `PASS` | Os 125 declarados em operação estão separados da expectativa de 225. |
| `T-03` | `N/A` | O recorte não contém atualização posterior que possa sobrescrever o estado anterior. |
| `T-04` | `PASS` | A pessoa revisora reconstruiu a sequência somente pelos registros e pela fonte. |

## Valores e métricas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `Q-01` | `PASS` | “Carregadores rápidos em operação pública” e “pontos de recarga rápida” foram preservados. |
| `Q-02` | `PASS` | Brasil, 24 de março de 2026 e fim de 2026 permanecem identificáveis. |
| `Q-03` | `PASS` | O caso não força uma unidade canônica nem cria registros em `metric_values`. |
| `Q-04` | `N/A` | Não há valores conflitantes dentro do recorte de `PILOT-02`. |
| `Q-05` | `PASS` | Nenhuma agregação, proporção ou taxa de crescimento foi derivada. |

## Organizações e instrumentos regulatórios

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `E-01` | `PASS` | A BYD Brasil possui um único registro canônico no caso. |
| `E-02` | `PASS` | O tipo empresarial não substitui o papel `subject` nos dois eventos. |
| `E-03` | `N/A` | O caso empresarial não envolve instrumento regulatório. |
| `E-04` | `N/A` | O caso não contém relações jurídicas entre instrumentos. |

## Incerteza e reconstrução

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `R-01` | `PASS` | A ausência de confirmação independente e o caráter futuro da expectativa estão explícitos. |
| `R-02` | `PASS` | O cumprimento da expectativa não foi inferido da ausência de atualização posterior. |
| `R-03` | `PASS` | A pessoa revisora reconstruiu estado realizado, expectativa e limitação da fonte. |
| `R-04` | `PASS` | A única fonte do recorte e o que ela sustenta foram identificados. |
| `R-05` | `PASS` | Permanecem desconhecidos a verificação independente dos 125 e o cumprimento dos 225. |
| `R-06` | `PASS` | Os vínculos essenciais entre evento, evidência e organização foram verificados estruturalmente. |

## Verificações específicas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `C1-01` | `N/A` | Outro caso. |
| `C1-02` | `N/A` | Outro caso. |
| `C1-03` | `N/A` | Outro caso. |
| `C1-04` | `N/A` | Outro caso. |
| `C2-01` | `PASS` | Os 125 declarados em operação e a expectativa de 225 são registros separados. |
| `C2-02` | `PASS` | A expectativa de 225 não foi registrada como realizada. |
| `C2-03` | `PASS` | A declaração empresarial não foi tratada como confirmação independente. |
| `C2-04` | `PASS` | Afirmações fora do recorte não foram incorporadas como observações, evidências ou eventos. |
| `C3-01` | `N/A` | Outro caso. |
| `C3-02` | `N/A` | Outro caso. |
| `C3-03` | `N/A` | Outro caso. |
| `C3-04` | `N/A` | Outro caso. |

## Verificação técnica de reprodução

Em 1º de setembro de 2026, o seed congelado foi executado em uma única transação contra o schema formado pelas migrações aprovadas. A execução confirmou:

- uma fonte, uma publicação e uma organização;
- duas observações, duas evidências e dois eventos;
- dois vínculos `supports` entre eventos e evidências;
- dois vínculos `subject` entre eventos e a BYD Brasil;
- zero observações ou eventos com as afirmações excluídas do recorte.

Ao final, a transação foi revertida. Uma consulta posterior confirmou zero registros de `PILOT-02` no banco persistente.

## Lacunas encontradas

| ID | Categoria | Severidade | Descrição | Evidência | Próxima decisão |
| --- | --- | --- | --- | --- | --- |
| `P02-DOC-01` | `documentação` | `não bloqueante` | O pacote dizia de forma ampla que comparações de liderança não estavam registradas, embora o título original preservado contenha “Maior rede”. | `content_items.title` | Esclarecer que a afirmação não foi transformada em observação, evidência ou evento. Correção incluída com este resultado. |

Não foram encontradas lacunas bloqueantes nos registros, nas restrições, no modelo ou na metodologia.

## Resultado

| Campo | Valor |
| --- | --- |
| Resultado | `ACCEPTED` |
| Itens com `FAIL` | Nenhum |
| Lacunas bloqueantes | Nenhuma |
| Próxima ação | Iniciar a preparação dos registros reproduzíveis de `PILOT-03`. |

`PILOT-02` está concluído e a sequência do piloto pode avançar.
