# Revisão independente de `PILOT-01`

## Estado

`AGUARDANDO_REVISAO_INDEPENDENTE`

Este documento congela a primeira versão dos registros de `PILOT-01`, descreve como reproduzi-los e organiza a revisão da cadeia normativa do Programa Mover. O pacote não atribui resultados nem presume que a fundação seja suficiente.

## Identificação do objeto a revisar

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-01` |
| Versão dos registros | Commit [`2c5c844cdf531e0e2badea984c91b0b79995f99f`](https://github.com/dnstld/chargebr/commit/2c5c844cdf531e0e2badea984c91b0b79995f99f) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `2588b0a77617ed5e6dca4dad7a54911d396ec168d70e6d98cd16497ea348084f` |
| Pessoa revisora | A preencher |
| Data da revisão | A preencher |
| Revisão anterior | `N/A` |

O commit acima é a referência imutável dos registros. O merge na `main` ocorreu depois, sem modificar o conteúdo do seed.

## Fontes oficiais do caso

- [Medida Provisória nº 1.205, de 30 de dezembro de 2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm)
- [Ato Declaratório do Presidente da Mesa do Congresso Nacional nº 35, de 2024](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm)
- [Lei nº 14.902, de 27 de junho de 2024](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm)
- [Decreto nº 12.435, de 15 de abril de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm)

## Limite da revisão

O caso começa com a Medida Provisória nº 1.205/2023 e termina com o Decreto nº 12.435/2025. Atos complementares, habilitações de empresas, alterações posteriores e resultados do programa permanecem fora desta execução.

A revisão deve avaliar o que as quatro fontes sustentam e como os registros representam essa cadeia. Não deve completar o caso com conhecimento jurídico externo nem presumir que continuidade temática significa conversão, substituição ou outra relação específica.

## Condições de independência

Antes de avaliar o caso, a pessoa revisora deve confirmar que:

- não preparou nem modificou os registros avaliados;
- não depende de explicações verbais para interpretá-los;
- consegue acessar os quatro documentos oficiais;
- verificou o commit e o SHA-256 acima;
- registrará qualquer indisponibilidade, ambiguidade ou nova lacuna encontrada.

Uma condição não confirmada deve permanecer explícita e impede o resultado `ACCEPTED`.

## Índice dos registros

Os identificadores estáveis permitem localizar o caso sem depender dos IDs numéricos gerados durante a carga.

### Fontes e documentos

| Entidade | Identificador estável | Papel no caso |
| --- | --- | --- |
| Fonte | `sources.slug = 'legislacao-presidencia-republica'` | Repositório oficial da medida provisória, da lei e do decreto |
| Fonte | `sources.slug = 'congresso-nacional'` | Autoridade oficial do ato declaratório |
| Documento | `content_items.content_fingerprint = 'pilot-01-mp-1205-2023'` | Texto oficial da MP nº 1.205/2023 |
| Documento | `content_items.content_fingerprint = 'pilot-01-ato-declaratorio-35-2024'` | Declaração do encerramento da vigência |
| Documento | `content_items.content_fingerprint = 'pilot-01-lei-14902-2024'` | Texto oficial da Lei nº 14.902/2024 |
| Documento | `content_items.content_fingerprint = 'pilot-01-decreto-12435-2025'` | Texto oficial do Decreto nº 12.435/2025 |

### Instrumentos regulatórios

| Identificador estável | Estado registrado | Datas estruturadas |
| --- | --- | --- |
| `regulatory_instruments.instrument_key = 'mp-1205-2023'` | `expired` | publicação e vigência em 30/12/2023; encerramento em 31/05/2024 |
| `regulatory_instruments.instrument_key = 'ato-declaratorio-35-2024-mp-1205'` | `published` | publicação em 11/06/2024 |
| `regulatory_instruments.instrument_key = 'lei-14902-2024'` | `effective` | publicação e vigência em 28/06/2024 |
| `regulatory_instruments.instrument_key = 'decreto-12435-2025'` | `effective` | publicação e vigência em 16/04/2025 |

As datas resumidas nesta tabela não substituem os acontecimentos. A medida provisória e a lei possuem grupos de dispositivos com datas próprias de produção de efeitos.

### Observações e evidências

| Tema | Fingerprint da observação | Origem |
| --- | --- | --- |
| MP institui o Programa Mover | `pilot-01-mp-1205-institui-mover` | Ementa e art. 1º da MP |
| Vigência e efeitos da MP | `pilot-01-mp-1205-vigencia-e-efeitos` | Art. 32 da MP |
| Encerramento da MP | `pilot-01-mp-1205-vigencia-encerrada` | Ato Declaratório nº 35/2024 |
| Lei institui o Programa Mover | `pilot-01-lei-14902-institui-mover` | Ementa e art. 1º da lei |
| Vigência e efeitos da lei | `pilot-01-lei-14902-vigencia-e-efeitos` | Art. 35 da lei |
| Convalidação de atos da MP | `pilot-01-lei-14902-convalida-atos-mp-1205` | Art. 33 da lei |
| Decreto regulamenta o programa da lei | `pilot-01-decreto-12435-regulamenta-lei-14902` | Ementa do decreto |
| Vigência do decreto | `pilot-01-decreto-12435-vigencia` | Art. 15 do decreto |

Cada observação possui uma evidência de linhagem `established` ligada ao documento oficial correspondente.

### Acontecimentos

| Data | Fase | Acontecimento |
| --- | --- | --- |
| 30/12/2023 | `publication` | Publicação da MP nº 1.205 e instituição do Programa Mover |
| 30/12/2023 | `effective` | Entrada em vigor da MP e efeitos dos dispositivos não ressalvados |
| 01/02/2024 | `effective` | Produção de efeitos dos arts. 12 a 21 da MP |
| 01/04/2024 | `effective` | Produção de efeitos dos arts. 9º a 11 da MP |
| 01/04/2024 | `effective` | Data de efeitos atribuída posteriormente aos arts. 9º a 11 da lei |
| 31/05/2024 | `occurrence` | Encerramento da vigência da MP |
| 11/06/2024 | `publication` | Publicação do ato que declara o encerramento anterior |
| 28/06/2024 | `publication` | Publicação da Lei nº 14.902 e instituição do Programa Mover |
| 28/06/2024 | `effective` | Entrada em vigor da lei e efeitos dos demais dispositivos |
| 28/06/2024 | `occurrence` | Convalidação dos atos praticados com base na MP |
| 16/04/2025 | `publication` | Publicação do decreto que regulamenta o Programa Mover |
| 16/04/2025 | `effective` | Entrada em vigor do decreto |

Cada acontecimento possui exatamente um vínculo `supports` com a evidência indicada no seed.

## Relações jurídicas registradas

O conjunto contém somente duas relações explícitas entre instrumentos:

1. o art. 33 da Lei nº 14.902/2024 convalida os atos praticados com base na MP nº 1.205/2023;
2. a ementa do Decreto nº 12.435/2025 declara que ele regulamenta o Programa Mover instituído pela Lei nº 14.902/2024.

O conjunto não afirma que a lei converteu, substituiu ou sucedeu juridicamente a medida provisória. O encerramento da MP é sustentado pelo ato declaratório, e não inferido da publicação posterior da lei.

## Questões estruturais submetidas à revisão

O schema atual permite registrar instrumentos, datas, observações, evidências e acontecimentos, mas apresenta três escolhas que precisam ser avaliadas de forma independente:

- não existe vínculo estrutural entre `events` e `regulatory_instruments`; a identificação do instrumento afetado depende do conteúdo textual e dos fingerprints;
- não existe relação estrutural entre dois registros de `regulatory_instruments`; convalidação e regulamentação aparecem como observações e acontecimentos, mas não como arestas entre instrumentos;
- `events.event_phase` não possui uma fase específica para encerramento de vigência; o evento de 31 de maio usa `occurrence`, enquanto `regulatory_instruments.expiry_date` preserva a data estruturada.

A pessoa revisora deve decidir se essas escolhas permitem reconstruir o caso com segurança ou se alguma delas contorna uma relação estrutural indispensável. Uma lacuna bloqueante de restrição ou modelo conduz a `FOUNDATION_REVIEW_REQUIRED`; uma correção possível com a estrutura atual conduz a `CORRECTION_REQUIRED`.

## Mapa de evidências para o checklist

Este mapa indica onde inspecionar; ele não atribui `PASS`, `FAIL` ou `N/A`.

| Seção | Onde verificar |
| --- | --- |
| Escopo e relevância | Recorte de `PILOT-01` em [Casos do piloto](casos-do-piloto.md), quatro URLs e limite encerrado no decreto |
| Proveniência | Duas fontes, quatro `content_items`, oito observações, oito evidências e doze vínculos `supports` |
| Separação semântica | Registros distintos em `regulatory_instruments`, `events`, `observations` e `evidence`; fases e datas dos acontecimentos |
| Tempo e histórico | `published_on`, `publication_date`, `effective_date`, `expiry_date`, `event_date`, `event_phase` e notas sobre datas coincidentes ou retroativas |
| Valores e métricas | Ausência de valores quantitativos no recorte; a pessoa revisora justifica `N/A` quando aplicável |
| Organizações e instrumentos | Quatro instrumentos canônicos, autoridades emissoras textuais e ausência de arestas entre instrumentos |
| Incerteza e reconstrução | Limites das relações declaradas, fase `occurrence` para encerramento e ausência de vínculos entre eventos e instrumentos |
| Verificações de `PILOT-01` | Quatro registros distintos; separação dos marcos temporais; relações sustentadas; limite no decreto |

## Reprodução em ambiente descartável

O caminho preferencial usa uma instância local do Supabase e um runtime compatível com Docker.

1. Obter uma cópia limpa do repositório e selecionar o commit congelado.
2. Conferir o SHA-256 de `supabase/seed.sql`.
3. Iniciar o ambiente local e executar `supabase db reset --local`.
4. Consultar os identificadores estáveis e os estados esperados acima.
5. Descartar o ambiente ao terminar.

Não usar `--linked` nem executar o seed no projeto remoto persistente. Se a reprodução local não for possível, registrar a limitação; a inspeção somente do SQL não equivale automaticamente à execução bem-sucedida.

## Verificação técnica já executada

Antes deste pacote, o seed completo foi executado em uma única transação contra o schema aprovado. Foram confirmados para `PILOT-01`:

- duas fontes oficiais;
- quatro documentos e quatro instrumentos regulatórios;
- oito observações normalizadas e oito evidências;
- doze acontecimentos: quatro de publicação, seis de produção de efeitos ou vigência e dois de ocorrência;
- doze vínculos `supports`;
- o estado `expired` e as três datas estruturadas da MP;
- os estados `effective` e as datas estruturadas da lei e do decreto.

A transação foi revertida. Uma consulta posterior confirmou zero fontes, instrumentos e acontecimentos de `PILOT-01` no banco persistente.

## Roteiro conversacional da revisão

Depois do merge deste pacote, as perguntas serão apresentadas em grupos curtos. A pessoa revisora poderá responder em linguagem comum; o resultado final será transcrito posteriormente para todos os itens do checklist.

### Etapa 1 — Identidade e independência

Confirmar a pessoa revisora, a data, o commit, o SHA-256, a ausência de participação na preparação e a possibilidade de revisar sem explicações verbais necessárias.

### Etapa 2 — Fontes e limite

Confirmar o acesso aos quatro documentos, a natureza oficial das fontes, a relação material com o Brasil e a exclusão de atos posteriores ou complementares.

### Etapa 3 — Linha do tempo

Reconstruir o que ocorreu e verificar se publicação, entrada em vigor, produção de efeitos, encerramento e publicação do ato declaratório permanecem distinguíveis, inclusive quando compartilham a mesma data ou quando a data de efeitos antecede a publicação da lei.

### Etapa 4 — Relações entre os atos

Verificar se convalidação e regulamentação estão sustentadas e se nenhuma conversão, substituição ou sucessão foi inferida apenas pela continuidade temática.

### Etapa 5 — Suficiência estrutural

Decidir expressamente sobre a ausência de vínculos entre acontecimentos e instrumentos, a ausência de relações entre instrumentos e o uso de `occurrence` para o encerramento da vigência.

### Etapa 6 — Reconstrução e resultado

Registrar regressões, lacunas e uma síntese independente; então selecionar exatamente um resultado permitido pelo checklist.

## Registro a ser produzido pela pessoa revisora

O resultado da revisão deve ficar em documento separado e conter:

- identificação da versão congelada;
- `PASS`, `FAIL` ou `N/A` para todos os itens do checklist;
- uma linha por lacuna encontrada;
- decisão expressa sobre as três questões estruturais;
- síntese reconstruída sem ajuda da pessoa que preparou os registros;
- exatamente um resultado final.

Os resultados permitidos são `ACCEPTED`, `CORRECTION_REQUIRED`, `FOUNDATION_REVIEW_REQUIRED` e `INCONCLUSIVE`.

## Regra para concluir a fundação

`PILOT-01` e o piloto da fundação só podem ser considerados concluídos se esta versão receber `ACCEPTED`. Qualquer outro resultado mantém a etapa aberta até a decisão ou correção correspondente e uma nova revisão, quando necessária.
