# Segunda revisão independente de `PILOT-01`

## Estado

`CONCLUIDA — ACCEPTED`

Este documento congelou a primeira versão corrigida dos registros de `PILOT-01` para sua segunda revisão independente. A revisão foi concluída com resultado [`ACCEPTED`](resultado-revisao-pilot-01-correcao-01.md).

## Identificação do objeto a revisar

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-01` |
| Revisão | Segunda revisão — correção 01 |
| Versão corrigida | Commit [`06148d15b6e11ffc557e33f69609e3c49134a43c`](https://github.com/dnstld/chargebr/commit/06148d15b6e11ffc557e33f69609e3c49134a43c) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `5b79b7a5c448089434e7d83241d462022762efdab4d339b1ae40ee6bb7e96f91` |
| Versão anterior | Commit [`2c5c844cdf531e0e2badea984c91b0b79995f99f`](https://github.com/dnstld/chargebr/commit/2c5c844cdf531e0e2badea984c91b0b79995f99f) |
| Resultado anterior | [`FOUNDATION_REVIEW_REQUIRED`](resultado-revisao-pilot-01.md) |
| Lacunas a verificar | `P01-MOD-01`, `P01-MOD-02` e `P01-RES-01` |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 4 de setembro de 2026 |
| Resultado | [`ACCEPTED`](resultado-revisao-pilot-01-correcao-01.md) |

O commit da versão corrigida é a referência imutável desta revisão. O merge na `main` ocorreu depois, sem modificar o conteúdo do seed.

## Fontes oficiais do caso

- [Medida Provisória nº 1.205, de 30 de dezembro de 2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm)
- [Ato Declaratório do Presidente da Mesa do Congresso Nacional nº 35, de 2024](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm)
- [Lei nº 14.902, de 27 de junho de 2024](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm)
- [Decreto nº 12.435, de 15 de abril de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm)

## Condições de independência

Antes de avaliar a correção, a pessoa revisora deve confirmar que:

- não preparou nem modificou a versão corrigida;
- consegue revisar os registros sem depender de explicações factuais verbais;
- consegue acessar os quatro documentos oficiais necessários;
- verificou o commit e o SHA-256 acima;
- registrará qualquer limitação nova encontrada.

Uma condição não confirmada deve permanecer explícita e impede o resultado `ACCEPTED`.

## O que motivou a correção

A primeira revisão concluiu que os fatos do caso estavam reconstruíveis, mas três elementos indispensáveis dependiam de títulos, notas ou fingerprints:

| Lacuna | Problema anterior |
| --- | --- |
| `P01-MOD-01` | Os acontecimentos não possuíam vínculo estrutural com seus instrumentos regulatórios centrais. |
| `P01-MOD-02` | Convalidação e regulamentação não existiam como relações tipadas entre instrumentos. |
| `P01-RES-01` | O encerramento de vigência usava a fase genérica `occurrence`. |

As três lacunas foram classificadas como bloqueantes e exigiram decisões de fundação, migrations próprias e uma nova versão dos registros.

## Fundação aprovada antes da correção

As seguintes mudanças já estavam aprovadas e aplicadas ao schema antes da versão corrigida:

1. `event_regulatory_instruments` liga acontecimentos a seus instrumentos centrais com o papel `subject`;
2. `regulatory_instrument_relations` registra relações direcionais entre instrumentos, com tipo e acontecimento de estabelecimento;
3. `expiry` identifica um acontecimento de encerramento de vigência em `events.event_phase`.

As tabelas persistentes continuam vazias. O seed existe para reprodução e revisão; ele não foi carregado permanentemente no Supabase.

## Correções submetidas à revisão

| Lacuna anterior | Correção | Onde verificar |
| --- | --- | --- |
| `P01-MOD-01` | Foram criados 12 vínculos `subject`, um para cada acontecimento de `PILOT-01`. | `event_regulatory_instruments` no bloco de `PILOT-01` |
| `P01-MOD-02` | Foram criadas exatamente duas relações direcionais e tipadas entre instrumentos. | `regulatory_instrument_relations` no bloco de `PILOT-01` |
| `P01-RES-01` | O encerramento da MP em 31/05/2024 mudou de `occurrence` para `expiry`. | Evento `pilot-01-mp-1205-vigencia-encerrada-2024-05-31` |
| `R-06` | As três informações deixam de depender de texto livre para consultas estruturadas. | Fase e duas tabelas relacionais |

## Instrumentos que devem permanecer distintos

| Instrumento | Identificador estável | Estado e datas principais |
| --- | --- | --- |
| MP nº 1.205/2023 | `mp-1205-2023` | `expired`; publicação e vigência em 30/12/2023; encerramento em 31/05/2024 |
| Ato Declaratório nº 35/2024 | `ato-declaratorio-35-2024-mp-1205` | `published`; publicação em 11/06/2024 |
| Lei nº 14.902/2024 | `lei-14902-2024` | `effective`; publicação e vigência em 28/06/2024 |
| Decreto nº 12.435/2025 | `decreto-12435-2025` | `effective`; publicação e vigência em 16/04/2025 |

## Acontecimentos e instrumentos centrais

Cada acontecimento abaixo deve possuir exatamente um vínculo `subject` com o instrumento indicado:

| Data | Fase | Acontecimento | Instrumento central |
| --- | --- | --- | --- |
| 30/12/2023 | `publication` | Publicação da MP e instituição do Programa Mover | MP nº 1.205/2023 |
| 30/12/2023 | `effective` | Entrada em vigor e efeitos imediatos da MP | MP nº 1.205/2023 |
| 01/02/2024 | `effective` | Efeitos dos arts. 12 a 21 da MP | MP nº 1.205/2023 |
| 01/04/2024 | `effective` | Efeitos dos arts. 9º a 11 da MP | MP nº 1.205/2023 |
| 01/04/2024 | `effective` | Data de efeitos atribuída aos arts. 9º a 11 da lei | Lei nº 14.902/2024 |
| 31/05/2024 | `expiry` | Encerramento da vigência da MP | MP nº 1.205/2023 |
| 11/06/2024 | `publication` | Publicação do ato que documenta o encerramento anterior | Ato Declaratório nº 35/2024 |
| 28/06/2024 | `publication` | Publicação da lei e instituição do Programa Mover | Lei nº 14.902/2024 |
| 28/06/2024 | `effective` | Entrada em vigor e efeitos dos demais dispositivos da lei | Lei nº 14.902/2024 |
| 28/06/2024 | `occurrence` | Convalidação dos atos praticados com base na MP | Lei nº 14.902/2024 |
| 16/04/2025 | `publication` | Publicação do decreto que regulamenta o Programa Mover | Decreto nº 12.435/2025 |
| 16/04/2025 | `effective` | Entrada em vigor do decreto | Decreto nº 12.435/2025 |

A distribuição esperada dos vínculos é:

| Instrumento | Quantidade de vínculos `subject` |
| --- | ---: |
| MP nº 1.205/2023 | 5 |
| Ato Declaratório nº 35/2024 | 1 |
| Lei nº 14.902/2024 | 4 |
| Decreto nº 12.435/2025 | 2 |

O vínculo responde apenas qual instrumento é o objeto central do acontecimento. Ele não afirma, sozinho, que um ato regulamenta, convalida, altera ou substitui outro.

## Relações entre instrumentos

A versão corrigida deve conter somente estas duas relações:

| Origem | Tipo | Destino | Acontecimento de estabelecimento |
| --- | --- | --- | --- |
| Lei nº 14.902/2024 | `convalidates_acts_based_on` | MP nº 1.205/2023 | Convalidação registrada em 28/06/2024 |
| Decreto nº 12.435/2025 | `regulates_program_established_by` | Lei nº 14.902/2024 | Publicação do decreto em 16/04/2025 |

A direção é importante. A lei é a origem da afirmação de convalidação e a MP é o ato anterior alcançado. O decreto é a origem da regulamentação e a lei é o ato que instituiu o programa regulamentado.

Cada relação deve permitir percorrer o seguinte caminho:

1. relação tipada entre origem e destino;
2. acontecimento que estabelece a relação;
3. instrumento de origem como `subject` desse acontecimento;
4. vínculo `supports` entre o acontecimento e sua evidência oficial.

A primeira relação não afirma conversão, substituição ou sucessão da MP pela lei. A segunda não afirma regulamentação integral de todo o conteúdo da lei.

## Encerramento e publicação posterior

A segunda revisão deve verificar três registros complementares, não concorrentes:

| Registro | Resposta fornecida |
| --- | --- |
| Evento com fase `expiry` em 31/05/2024 | Quando a vigência da MP se encerrou. |
| `regulatory_instruments.expiry_date = '2024-05-31'` | Qual é a data canônica de encerramento da MP. |
| Evento com fase `publication` em 11/06/2024 | Quando foi publicado o ato que documentou o encerramento anterior. |

`expiry` não significa revogação. A fonte afirma encerramento do prazo de vigência, e a representação não deve produzir uma conclusão jurídica mais ampla.

## Elementos que não deveriam ter mudado

A segunda revisão também deve confirmar que a correção:

- preserva as duas fontes, os quatro documentos, as oito observações e as oito evidências;
- mantém os 12 acontecimentos e os 12 vínculos `supports` anteriores;
- conserva as datas, títulos, afirmações originais e limites de cada evidência;
- mantém publicação, vigência, produção de efeitos e encerramento como marcos separados;
- não infere conversão, substituição ou sucessão entre MP e lei;
- não cria uma relação entre o ato declaratório e a MP além do acontecimento sustentado pela evidência;
- não incorpora atos posteriores ao Decreto nº 12.435/2025;
- não altera fatos de `PILOT-02` ou `PILOT-03`;
- não altera schema, migrations ou políticas de acesso nesta correção do seed.

## Verificação técnica já executada

Antes deste pacote, o seed completo corrigido foi executado em uma única transação contra o schema aprovado. Foram confirmados para `PILOT-01`:

- duas fontes oficiais;
- quatro documentos, quatro instrumentos, oito observações e oito evidências;
- 12 acontecimentos e 12 vínculos `supports`;
- fases distribuídas em quatro `publication`, seis `effective`, uma `occurrence` e uma `expiry`;
- 12 vínculos `subject`, distribuídos em 5, 1, 4 e 2 pelos quatro instrumentos;
- exatamente duas relações entre instrumentos, com direção, tipo e acontecimento corretos;
- instrumento de origem como `subject` e evidência `supports` para cada relação.

A transação foi revertida. Uma consulta posterior confirmou que todas as tabelas dos pilotos permaneceram vazias no banco persistente.

## Reprodução em ambiente descartável

O caminho preferencial usa uma instância local do Supabase e um runtime compatível com Docker.

1. Obter uma cópia limpa do repositório e selecionar o commit corrigido.
2. Conferir o SHA-256 de `supabase/seed.sql`.
3. Iniciar o ambiente local e executar `supabase db reset --local`.
4. Consultar os identificadores estáveis e os estados esperados acima.
5. Descartar o ambiente ao terminar.

Não usar `--linked` nem executar o seed no projeto remoto persistente. Se a reprodução local não for possível, registrar a limitação; a inspeção somente do SQL não equivale automaticamente à execução bem-sucedida.

## Como conduzir a segunda revisão

Todos os itens do [checklist canônico](checklist-de-revisao-do-piloto.md) devem ser reavaliados. A revisão não se limita às três lacunas anteriores, porque uma correção também pode introduzir regressões.

Na conversa, as perguntas serão apresentadas em seis grupos curtos:

### Etapa 1 — Identidade e independência

Confirmar pessoa, data, commit, SHA-256, acesso às fontes e ausência de participação na preparação dos registros corrigidos.

### Etapa 2 — Preservação do caso

Confirmar que fontes, recorte, fatos e datas anteriores não mudaram indevidamente e que os outros pilotos não foram afetados.

### Etapa 3 — Vínculos entre acontecimentos e instrumentos

Verificar se cada um dos 12 acontecimentos possui o instrumento central correto como `subject` e se a distribuição 5–1–4–2 faz sentido.

### Etapa 4 — Relações entre instrumentos

Verificar a direção e o significado das duas relações, seu acontecimento de estabelecimento e sua evidência. Confirmar que nenhuma relação mais ampla foi inferida.

### Etapa 5 — Encerramento de vigência

Esta etapa pergunta somente se três coisas ficaram distinguíveis: o encerramento em 31/05/2024, o estado `expired` da MP e a publicação do ato declaratório em 11/06/2024. Não é uma nova avaliação sobre toda a história do Programa Mover.

### Etapa 6 — Reconstrução e resultado

A pessoa revisora resume o caso com suas próprias palavras, registra qualquer lacuna ou regressão e escolhe exatamente um resultado final. Esta etapa testa se a estrutura pode ser compreendida sem completar relações pela interpretação de texto livre.

## Registro produzido pela pessoa revisora

O [resultado da segunda revisão](resultado-revisao-pilot-01-correcao-01.md) ficou em documento separado e contém:

- identificação da versão corrigida e referência ao resultado anterior;
- `PASS`, `FAIL` ou `N/A` para todos os itens do checklist;
- decisão expressa sobre `P01-MOD-01`, `P01-MOD-02` e `P01-RES-01`;
- uma linha por lacuna nova ou ainda aberta;
- síntese reconstruída sem ajuda da pessoa que preparou a correção;
- exatamente um resultado final.

Os resultados permitidos continuam sendo `ACCEPTED`, `CORRECTION_REQUIRED`, `FOUNDATION_REVIEW_REQUIRED` e `INCONCLUSIVE`.

## Regra para avançar

A versão corrigida de `PILOT-01` recebeu `ACCEPTED`. O caso está concluído, e a conclusão geral do piloto da fundação pode ser consolidada depois do merge deste resultado na `main`.
