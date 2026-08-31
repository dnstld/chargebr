# Revisão independente de `PILOT-02`

## Estado

`AGUARDANDO_REVISAO_INDEPENDENTE`

Este documento congela a versão avaliada, descreve como reproduzir os registros e indica onde encontrar as evidências necessárias. Ele não antecipa o resultado da revisão.

A pessoa que preparou os registros não pode preencher a identidade da pessoa revisora, os resultados dos itens nem a conclusão. Esses campos devem ser completados por outra pessoa, usando somente os registros congelados, a fonte referenciada e o [checklist canônico](checklist-de-revisao-do-piloto.md).

## Identificação do objeto revisado

| Campo | Valor |
| --- | --- |
| Caso | `PILOT-02` |
| Versão dos registros | Commit [`bc5906a0096cc7424000cb25d992720f85f0ed01`](https://github.com/dnstld/chargebr/commit/bc5906a0096cc7424000cb25d992720f85f0ed01) |
| Arquivo | `supabase/seed.sql` |
| SHA-256 do arquivo | `f1ac40c58abdf3067063c77505a0f5bda4d36e45a91614a0acd0a2d387bb3af9` |
| Fonte primária | [Publicação da BYD Brasil de 24 de março de 2026](https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional) |
| Pessoa revisora | A preencher pela pessoa revisora |
| Data da revisão | A preencher pela pessoa revisora |
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

## Afirmações deliberadamente não registradas

O conjunto congelado não contém:

- confirmação independente dos 125 carregadores;
- realização da expectativa de 225 pontos;
- metas para 2027 ou para mil carregadores;
- comparações de liderança de mercado;
- métricas derivadas ou normalização por `metric_values`;
- instrumentos regulatórios relacionados ao caso.

A ausência desses elementos faz parte do limite aprovado e não deve ser preenchida com contexto externo durante a revisão.

## Registro a ser produzido pela pessoa revisora

A revisão deve ser registrada em um arquivo separado, baseado no checklist canônico, e conter:

1. a identificação completa da revisão e a versão congelada acima;
2. um resultado individual para todos os itens de independência e todos os itens aplicáveis;
3. `N/A` acompanhado de justificativa sempre que um item não se aplicar;
4. uma linha por lacuna encontrada, inclusive limitações de acesso à fonte;
5. a síntese do caso reconstruída sem ajuda da pessoa que preparou os registros;
6. exatamente um resultado final permitido pelo checklist.

O registro não deve alterar este pacote nem o seed avaliado. Correções eventualmente necessárias pertencem a uma versão posterior, que exigirá nova revisão.

## Regra para avançar

`PILOT-03` só pode começar depois que a revisão independente de `PILOT-02` estiver registrada com resultado `ACCEPTED`. Merge deste pacote, aprovação do PR ou ausência de comentários não substituem esse resultado.
