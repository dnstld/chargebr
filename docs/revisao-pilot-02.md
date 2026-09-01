# Revisão independente de `PILOT-02`

## Estado

`CONCLUIDA — ACCEPTED`

Este documento congela a versão avaliada, descreve como reproduzir os registros e indica onde encontrar as evidências necessárias. A revisão foi concluída por Denis Toledo em 1º de setembro de 2026; o [resultado completo](resultado-revisao-pilot-02.md) foi `ACCEPTED`.

A identidade, os resultados dos itens e a conclusão abaixo refletem as decisões expressamente fornecidas pela pessoa revisora. A pessoa que preparou os registros somente transcreveu essas decisões e executou a verificação técnica documentada, sem decidir o resultado.

## Identificação do objeto revisado

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-02` |
| Versão dos registros | Commit [`bc5906a0096cc7424000cb25d992720f85f0ed01`](https://github.com/dnstld/chargebr/commit/bc5906a0096cc7424000cb25d992720f85f0ed01) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `f1ac40c58abdf3067063c77505a0f5bda4d36e45a91614a0acd0a2d387bb3af9` |
| Fonte primária | [Publicação da BYD Brasil de 24 de março de 2026](https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional) |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 1º de setembro de 2026 |
| Revisão anterior | `N/A` |

O commit acima é a versão imutável dos registros. O merge na `main` ocorreu depois, sem modificar o conteúdo do arquivo.

## Condições de independência

Antes de avaliar o caso, a pessoa revisora deve confirmar no registro da revisão que:

- não preparou os registros avaliados;
- não recebeu explicações verbais necessárias para interpretá-los;
- não modificou os registros durante a avaliação;
- registrou qualquer indisponibilidade ou limitação da fonte;
- verificou o commit e o SHA-256 informados acima.

Se alguma condição não puder ser confirmada, o impedimento deve permanecer explícito e o resultado não pode ser `ACCEPTED`.

## Reprodução em ambiente local descartável

O caminho preferencial usa uma instância local do Supabase. Ele exige a Supabase CLI e um runtime compatível com Docker.

1. Obter uma cópia limpa do repositório e selecionar o commit congelado.
2. Conferir o SHA-256 de `supabase/seed.sql`.
3. Executar `supabase init` para gerar uma configuração local, caso ela ainda não exista.
4. Iniciar o ambiente local e executar `supabase db reset --local`.
5. Confirmar que todas as migrações foram aplicadas antes do `seed.sql` e consultar os identificadores descritos abaixo.
6. Descartar o ambiente ao terminar.

Não usar `--linked`, não executar o seed no projeto remoto persistente e não transformar os registros do piloto em dados de produção. Se a reprodução local não for possível, a limitação deve ser registrada; a inspeção somente do SQL não equivale automaticamente à execução bem-sucedida.

## Índice dos registros

Os identificadores estáveis abaixo permitem localizar o caso sem depender dos IDs numéricos gerados durante a carga.

| Entidade | Identificador estável | Papel no caso |
| --- | --- | --- |
| Fonte | `sources.slug = 'byd-brasil'` | Publicadora empresarial e única fonte do recorte |
| Organização | `organizations.slug = 'byd-brasil'` | Sujeito dos dois eventos |
| Publicação | `content_items.content_fingerprint = 'pilot-02-byd-2026-03-24'` | Publicação original de 24 de março de 2026 |
| Observação realizada | `observations.observation_fingerprint = 'pilot-02-byd-125-operacao-2026-03-24'` | Declaração de 125 carregadores em operação pública |
| Observação futura | `observations.observation_fingerprint = 'pilot-02-byd-meta-225-2026-12-31'` | Expectativa de 225 pontos até o fim de 2026 |
| Evidência realizada | `evidence.lineage_key = 'pilot-02-byd-2026-03-24-125-operacao'` | Origem da afirmação realizada |
| Evidência futura | `evidence.lineage_key = 'pilot-02-byd-2026-03-24-meta-225'` | Origem da expectativa futura |
| Evento realizado | `events.event_fingerprint = 'pilot-02-byd-125-operacao-2026-03-24'` | Atualização declarada pela empresa |
| Evento futuro | `events.event_fingerprint = 'pilot-02-byd-meta-225-anuncio-2026-03-24'` | Anúncio da expectativa |

Cada evento deve possuir exatamente um vínculo `supports` com sua evidência correspondente e exatamente um vínculo `subject` com a organização BYD Brasil.

## Mapa de evidências para o checklist

Este mapa indica onde inspecionar; ele não atribui `PASS`, `FAIL` ou `N/A`.

| Seção | Onde verificar |
| --- | --- |
| Escopo e relevância | Recorte de `PILOT-02` em [Casos do piloto](casos-do-piloto.md); URLs, geografia e limites no `seed.sql` |
| Proveniência | `sources`, `content_items`, `observations`, `evidence` e os dois vínculos em `event_evidence` |
| Separação semântica | Duas observações, duas evidências e dois eventos distintos; campos `event_phase`, `verification_level`, `workflow_status` e `notes` |
| Tempo e histórico | `published_on`, `collected_at`, `observation_date`, `event_date` e o prazo futuro preservado na observação de 225 pontos |
| Valores e métricas | `source_claim`, `source_term`, `normalized_claim` e ausência de carga em `metric_values` para este caso |
| Organizações | Registro canônico em `organizations` e os dois vínculos `subject` em `event_organizations` |
| Instrumentos regulatórios | Ausência de instrumento regulatório neste caso empresarial; a pessoa revisora decide e justifica a aplicabilidade dos itens |
| Incerteza e reconstrução | `verification_level = 'reported'`, `workflow_status = 'under_review'` e notas que limitam a confirmação à declaração empresarial |
| Verificações de `PILOT-02` | Separação entre os fingerprints de 125 e 225; fases `update` e `announcement`; limites registrados nas notas e no recorte |

## Limites deliberadamente preservados

O metadado da publicação preserva seu título original, inclusive a expressão “Maior rede de recarga pública do país”. Fora desse registro documental, o conjunto congelado:

- não contém confirmação independente dos 125 carregadores;
- não registra como realizada a expectativa de 225 pontos;
- não transforma metas para 2027 ou para mil carregadores em observações, evidências ou eventos;
- não transforma comparações de liderança em observações, evidências ou eventos;
- não cria métricas derivadas ou normalização por `metric_values`;
- não relaciona instrumentos regulatórios ao caso.

A ausência desses elementos analíticos faz parte do limite aprovado e não deve ser preenchida com contexto externo durante a revisão.

## Registro produzido pela pessoa revisora

A revisão está documentada no [resultado independente de `PILOT-02`](resultado-revisao-pilot-02.md), baseado no checklist canônico. O registro contém:

1. a identificação completa da revisão e a versão congelada acima;
2. um resultado individual para todos os itens de independência e todos os itens aplicáveis;
3. `N/A` acompanhado de justificativa sempre que um item não se aplicar;
4. uma linha por lacuna encontrada, inclusive limitações de acesso à fonte;
5. a síntese do caso reconstruída sem ajuda da pessoa que preparou os registros;
6. exatamente um resultado final permitido pelo checklist.

O registro não alterou o seed avaliado. A precisão documental encontrada durante a revisão foi corrigida neste pacote sem modificar os registros congelados.

## Regra para avançar

A revisão independente de `PILOT-02` foi registrada com resultado `ACCEPTED`. `PILOT-03` pode começar depois que o resultado e a correção documental forem aprovados e integrados à `main`.
