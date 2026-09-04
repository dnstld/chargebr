# Resultado da segunda revisão independente de `PILOT-01`

## Identificação

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-01` |
| Revisão | Segunda revisão — correção 01 |
| Versão dos registros | Commit [`06148d15b6e11ffc557e33f69609e3c49134a43c`](https://github.com/dnstld/chargebr/commit/06148d15b6e11ffc557e33f69609e3c49134a43c) |
| Arquivo avaliado | `supabase/seed.sql` |
| SHA-256 do arquivo | `5b79b7a5c448089434e7d83241d462022762efdab4d339b1ae40ee6bb7e96f91` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 4 de setembro de 2026 |
| Revisão anterior | [`FOUNDATION_REVIEW_REQUIRED`](resultado-revisao-pilot-01.md) |
| Pacote desta revisão | [Segunda revisão independente — correção 01](revisao-pilot-01-correcao-01.md) |
| Checklist | [Checklist de revisão do piloto](checklist-de-revisao-do-piloto.md) |

## Síntese reconstruída pela pessoa revisora

Em 30 de dezembro de 2023, o Governo Federal publicou a Medida Provisória nº 1.205, que instituiu o Programa Mover. A vigência da medida provisória encerrou-se em 31 de maio de 2024. O Ato Declaratório nº 35, datado de 10 de junho de 2024 e publicado no DOU de 11 de junho de 2024, documentou posteriormente esse encerramento. A Lei nº 14.902 foi sancionada em 27 de junho de 2024 e publicada no DOU de 28 de junho de 2024; ela instituiu o programa e convalidou os atos praticados com base na medida provisória. O Decreto nº 12.435 foi expedido em 15 de abril de 2025 e publicado no DOU de 16 de abril de 2025; ele regulamentou o programa instituído pela lei.

A pessoa revisora confirmou que a diferença entre a data do ato e a data de sua publicação oficial está corretamente representada e que, para este piloto, é suficiente preservar a data do ato no título oficial sem criar um novo campo estrutural.

## Condições de independência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `I-01` | `PASS` | O commit e o SHA-256 congelaram a versão corrigida antes da segunda revisão. |
| `I-02` | `PASS` | A pessoa revisora confirmou que conseguiu revisar o caso pelos registros e pelas fontes, sem depender de informações factuais fornecidas verbalmente. O esclarecimento posterior tratou somente da distinção documental entre data do ato e publicação no DOU. |
| `I-03` | `PASS` | Os quatro documentos oficiais estavam acessíveis. |
| `I-04` | `PASS` | A pessoa revisora confirmou que não preparou nem modificou os registros corrigidos. |

## Escopo e relevância

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `S-01` | `PASS` | O conjunto permanece limitado à MP, ao encerramento de sua vigência, à lei e ao decreto aprovados para `PILOT-01`. |
| `S-02` | `PASS` | O âmbito brasileiro e a relação material do Programa Mover com veículos elétricos e híbridos, eficiência energética e descarbonização permanecem explícitos. |
| `S-03` | `PASS` | Atos complementares, habilitações, alterações posteriores e resultados do programa continuam fora do recorte. |
| `S-04` | `PASS` | As quatro fontes oficiais são suficientes para reconstruir a cadeia delimitada. |

## Proveniência

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `P-01` | `PASS` | Presidência da República e Congresso Nacional permanecem identificados como fontes oficiais verificáveis. |
| `P-02` | `PASS` | Cada documento está ligado à fonte oficial que o publicou. |
| `P-03` | `PASS` | Títulos, datas, URLs e natureza dos quatro documentos foram preservados. |
| `P-04` | `PASS` | As oito observações preservam as disposições necessárias sobre instituição, vigência, efeitos, encerramento, convalidação e regulamentação. |
| `P-05` | `PASS` | Cada evidência deriva da observação e do documento oficial correspondentes. |
| `P-06` | `PASS` | Cada um dos 12 acontecimentos possui exatamente um vínculo `supports` com evidência oficial suficiente. |
| `P-07` | `PASS` | Somente fontes oficiais primárias sustentam o caso. |
| `P-08` | `PASS` | A origem oficial e os limites de reprodução das páginas consultivas permanecem visíveis. |

## Separação semântica

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `M-01` | `PASS` | Fonte, documento, observação, evidência, instrumento e acontecimento permanecem registros conceitualmente distintos. |
| `M-02` | `PASS` | O que cada ato declara está separado da representação produzida pelo ChargeBR. |
| `M-03` | `PASS` | As normalizações não criam conversão, substituição ou sucessão entre os atos. |
| `M-04` | `PASS` | Os títulos dos acontecimentos não excedem as disposições sustentadas pelas fontes. |
| `M-05` | `PASS` | Os quatro documentos permanecem distintos e não foram tratados como confirmações independentes de uma mesma publicação. |

## Tempo e histórico

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `T-01` | `PASS` | Publicação, vigência, produção de efeitos, encerramento e publicação posterior do ato declaratório estão separados. Datas do ato e do DOU não foram confundidas. |
| `T-02` | `N/A` | O recorte não contém meta, expectativa ou outro estado futuro planejado. |
| `T-03` | `PASS` | A lei e o decreto não sobrescrevem os estados anteriores da MP nem a data de encerramento de sua vigência. |
| `T-04` | `PASS` | A sequência completa pode ser reconstruída pelos registros, inclusive os efeitos em datas diferentes e a publicação posterior do ato declaratório. |

## Esclarecimento sobre as datas oficiais

Durante a reconstrução, a pessoa revisora identificou que três documentos possuem uma data no título ou fecho e foram publicados no DOU no dia seguinte. A verificação das páginas oficiais e das edições do DOU confirmou:

| Instrumento | Data do ato | Publicação no DOU | Representação avaliada |
| --- | --- | --- | --- |
| MP nº 1.205/2023 | 30/12/2023 | 30/12/2023, edição extra | Publicação e vigência em 30/12/2023 |
| Ato Declaratório nº 35/2024 | 10/06/2024 | 11/06/2024 | Publicação em 11/06/2024; encerramento da MP em 31/05/2024 |
| Lei nº 14.902/2024 | 27/06/2024 | 28/06/2024 | Publicação e vigência em 28/06/2024 |
| Decreto nº 12.435/2025 | 15/04/2025 | 16/04/2025 | Publicação e vigência em 16/04/2025 |

A frase “Este texto não substitui o publicado no DOU” informa que a página do Planalto é uma reprodução para consulta e que o DOU preserva a publicação oficial. Ela não torna a data do ato equivalente à data de publicação. A retificação da MP no DOU de 31/12/2023 também não altera sua publicação original em 30/12/2023.

Referências oficiais usadas no esclarecimento:

- [MP nº 1.205/2023 no Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm) e [DOU de 30/12/2023](https://pesquisa.in.gov.br/imprensa/servlet/INPDFViewer?captchafield=firstAccess&data=30%2F12%2F2023&jornal=616&pagina=1)
- [Ato Declaratório nº 35/2024 no Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm) e [DOU de 11/06/2024](https://pesquisa.in.gov.br/imprensa/servlet/INPDFViewer?captchafield=firstAccess&data=11%2F06%2F2024&jornal=515&pagina=2)
- [Lei nº 14.902/2024 no Planalto](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm) e [DOU de 28/06/2024](https://pesquisa.in.gov.br/imprensa/servlet/INPDFViewer?captchafield=firstAccess&data=28%2F06%2F2024&jornal=515&pagina=4)
- [Decreto nº 12.435/2025 no Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm) e [DOU de 16/04/2025](https://pesquisa.in.gov.br/imprensa/servlet/INPDFViewer?captchafield=firstAccess&data=16%2F04%2F2025&jornal=515&pagina=1)

## Valores e métricas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `Q-01` | `N/A` | O caso é normativo e não estrutura valores quantitativos de uma métrica. |
| `Q-02` | `N/A` | As datas jurídicas não constituem período e geografia de um valor quantitativo. |
| `Q-03` | `N/A` | O caso não exige unidade canônica de métrica. |
| `Q-04` | `N/A` | Não existem valores quantitativos conflitantes no recorte. |
| `Q-05` | `N/A` | Nenhuma agregação, proporção ou taxa quantitativa integra o caso. |

## Organizações e instrumentos regulatórios

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `E-01` | `N/A` | O caso não exige organizações canônicas; as autoridades emissoras permanecem atributos das fontes e dos instrumentos. |
| `E-02` | `N/A` | Nenhuma organização desempenha papel estruturado nos acontecimentos deste recorte. |
| `E-03` | `PASS` | MP, ato declaratório, lei e decreto possuem registros canônicos distintos e identificadores oficiais. |
| `E-04` | `PASS` | Convalidação e regulamentação são as únicas relações tipadas entre instrumentos e ambas são sustentadas por disposições expressas. |

## Incerteza e reconstrução

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `R-01` | `PASS` | O limite do recorte e a distinção entre data do ato e publicação oficial estão explícitos. |
| `R-02` | `PASS` | A ausência de conversão, substituição ou sucessão expressa não foi convertida em conclusão jurídica. |
| `R-03` | `PASS` | A pessoa revisora reconstruiu a sequência e corrigiu sua própria referência inicial a 2026 para 2024 no ato declaratório. |
| `R-04` | `PASS` | Os quatro documentos oficiais e o papel de cada um foram identificados. |
| `R-05` | `PASS` | Depois do esclarecimento das datas, a pessoa revisora não identificou informação incorreta, ausente, ambígua ou sem apoio nas fontes. |
| `R-06` | `PASS` | A fase `expiry`, os 12 vínculos `subject` e as duas relações entre instrumentos eliminam os três contornos por texto livre encontrados anteriormente. |

## Verificações específicas

| ID | Resultado | Evidência ou justificativa |
| --- | --- | --- |
| `C1-01` | `PASS` | MP nº 1.205, Ato Declaratório nº 35, Lei nº 14.902 e Decreto nº 12.435 são quatro instrumentos distintos. |
| `C1-02` | `PASS` | Publicação, entrada em vigor, produção de efeitos e encerramento são acontecimentos separados; o encerramento usa a fase própria `expiry`. |
| `C1-03` | `PASS` | Convalidação e regulamentação possuem relações direcionais e tipadas, sustentadas pelas fontes e sem inferência por continuidade temática. |
| `C1-04` | `PASS` | O histórico termina no Decreto nº 12.435/2025. |
| `C2-01` | `N/A` | Outro caso. |
| `C2-02` | `N/A` | Outro caso. |
| `C2-03` | `N/A` | Outro caso. |
| `C2-04` | `N/A` | Outro caso. |
| `C3-01` | `N/A` | Outro caso. |
| `C3-02` | `N/A` | Outro caso. |
| `C3-03` | `N/A` | Outro caso. |
| `C3-04` | `N/A` | Outro caso. |

## Verificação técnica de reprodução

A versão corrigida foi executada em uma única transação contra o schema aprovado. A execução confirmou:

- duas fontes oficiais;
- quatro documentos, quatro instrumentos, oito observações e oito evidências;
- 12 acontecimentos e 12 vínculos `supports`;
- quatro acontecimentos de `publication`, seis de `effective`, um de `occurrence` e um de `expiry`;
- 12 vínculos `subject`, distribuídos em 5, 1, 4 e 2 pelos quatro instrumentos;
- exatamente duas relações entre instrumentos, com direção, tipo, acontecimento e evidência compatíveis.

Ao final, a transação foi revertida. Uma consulta posterior confirmou que nenhum registro dos pilotos permaneceu no banco persistente.

## Tratamento das lacunas anteriores

| ID | Estado | Evidência | Conclusão |
| --- | --- | --- | --- |
| `P01-MOD-01` | `RESOLVIDA` | Cada um dos 12 acontecimentos possui exatamente um instrumento central ligado pelo papel `subject`. | Os vínculos podem ser consultados sem interpretar títulos ou fingerprints. |
| `P01-MOD-02` | `RESOLVIDA` | Existem somente as relações Lei → MP por `convalidates_acts_based_on` e Decreto → Lei por `regulates_program_established_by`, ambas ligadas ao acontecimento e à evidência correspondentes. | Convalidação e regulamentação são consultáveis sem criar conversão, substituição ou regulamentação integral da lei. |
| `P01-RES-01` | `RESOLVIDA` | O encerramento em 31/05/2024 usa `expiry`, enquanto a publicação posterior do ato declaratório usa `publication`. | Encerramento de vigência e publicação do ato não dependem da fase genérica `occurrence`. |

Não foram encontradas regressões, lacunas bloqueantes nem propostas não bloqueantes novas.

## Resultado

| Campo | Valor |
| --- | --- |
| Resultado | `ACCEPTED` |
| Itens com `FAIL` | Nenhum |
| Lacunas bloqueantes | Nenhuma |
| Síntese reconstruída pela pessoa revisora | A MP instituiu o Programa Mover e teve sua vigência encerrada em 31/05/2024; o ato declaratório documentou esse encerramento e foi publicado em 11/06/2024; a lei instituiu o programa e convalidou os atos baseados na MP; o decreto regulamentou o programa da lei. As datas estruturadas de publicação usam o DOU, enquanto as datas dos atos permanecem nos títulos oficiais. |
| Próxima ação | Consolidar, em etapa própria, a conclusão geral do piloto da fundação. |

`PILOT-01` está concluído. Os três casos receberam `ACCEPTED`, e a conclusão geral do piloto da fundação pode ser preparada depois do merge deste resultado na `main`.
