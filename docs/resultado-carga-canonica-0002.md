# Resultado da carga canônica `0002`

## Estado

`EXECUTADA — AGUARDANDO REVISÃO`

Este documento registra a persistência do primeiro acontecimento canônico `corroborated` no Supabase. A execução ocorreu somente depois do `ACCEPTED` da pessoa revisora e do merge do [pacote de revisão](revisao-carga-canonica-0002.md) na `main`.

## Identificação da execução

| Campo | Valor |
| --- | --- |
| Carga | [`0002_bmw-ix3-apresentacao-publica-brasil.sql`](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.sql) |
| Verificação | [`0002_bmw-ix3-apresentacao-publica-brasil.verify.sql`](../data/canonical/0002_bmw-ix3-apresentacao-publica-brasil.verify.sql) |
| Acontecimento | Apresentação pública do BMW iX3 no Festival Interlagos Carros 2026 |
| Data da execução | 5 de setembro de 2026 |
| Autorização | Merge do PR #51 depois de `ACCEPTED` de Denis Toledo |
| Commit da `main` usado | `c9d0e6b` |
| SHA-256 da carga | `050fb0c8a66794206bdd7fe65ce0dfe007bc4ac2f5b7acd1ad6b7057079866e0` |
| SHA-256 da verificação | `77ac5f2869b601239928055cbce08ab670eb038e025870eeed0b0b2229457b7d` |
| Resultado | `SUCCESS` |

Os dois arquivos da `main` eram byte a byte idênticos aos arquivos aceitos no commit `ccb45f1`. Nenhuma correção, transformação ou cópia manual da consulta foi aplicada durante a execução.

## Procedimento

1. A `main` foi sincronizada depois do merge do PR #51.
2. A identidade dos dois arquivos foi confirmada por SHA-256.
3. A consulta reutilizável confirmou `load_0002_state = 'absent'` e a assinatura esperada da carga `0001`.
4. O arquivo da carga foi executado integralmente uma vez entre `BEGIN` e `COMMIT`, com limite local de 30 segundos por instrução.
5. As verificações internas terminaram sem exceção e a transação recebeu `COMMIT`.
6. O arquivo de verificação foi executado novamente sem modificação.
7. Consultas adicionais reconstruíram as duas linhagens e identificaram os registros persistidos.
8. O histórico de migrations e a ausência de identificadores de piloto foram conferidos.

## Registros persistidos

| Registro | Identificador interno | Identificador estável | Contagem |
| --- | ---: | --- | ---: |
| Fonte oficial | 35 | `bmw-group-pressclub-brasil` | 1 |
| Fonte jornalística | 36 | `diario-do-grande-abc` | 1 |
| Publicação oficial | 51 | `canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03` | 1 |
| Publicação jornalística | 52 | `canonical-0002-dgabc-ix3-interlagos-2026-08-27` | 1 |
| Observação oficial | 72 | `canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27` | 1 |
| Observação jornalística | 73 | `canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27` | 1 |
| Evidência oficial | 72 | `canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03` | 1 |
| Evidência jornalística | 73 | `canonical-0002-dgabc-ix3-interlagos-2026-08-27` | 1 |
| Acontecimento | 88 | `canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27` | 1 |
| Organização | 31 | `bmw` | 1 |

Os identificadores internos são valores gerados pelo banco. Os identificadores estáveis são os usados pela carga para impedir duplicação e reconstruir as linhagens.

## Cadeias verificadas

| Linhagem | Fonte | Publicação | Observação | Evidência | Vínculo |
| --- | ---: | ---: | ---: | ---: | --- |
| Oficial da BMW | 35 | 51 | 72 | 72 | `supports` |
| Jornalística do Diário do Grande ABC | 36 | 52 | 73 | 73 | `supports` |

As duas evidências possuem `lineage_status = 'established'`, apontam para suas respectivas publicações de origem e alcançam o mesmo acontecimento por vínculos separados.

## Estado do acontecimento

| Verificação | Resultado |
| --- | --- |
| Identificador interno | 88 |
| Situação | `accepted` |
| Nível de verificação | `corroborated` |
| Tipo e fase | `product_service` / `occurrence` |
| Data e precisão | 27/08/2026 / `day` |
| Fontes distintas | 2 |
| Observações distintas | 2 |
| Evidências distintas | 2 |
| Evidências `established` ligadas por `supports` | 2 |
| Organização central | BMW, identificador 31, tipo `other`, vínculo `subject` |

`corroborated` continua limitado à apresentação pública do iX3 durante o Festival. A persistência não incorporou a alegação de primeira aparição pública, especificações, preço, desempenho, superlativos ou outros assuntos excluídos no pacote aceito.

## Resultado da consulta reutilizável

| Campo | Antes da carga | Depois do `COMMIT` |
| --- | ---: | ---: |
| Estado agregado da carga `0002` | `absent` | `complete` |
| Fontes | 0 | 2 |
| Publicações | 0 | 2 |
| Observações | 0 | 2 |
| Evidências | 0 | 2 |
| Acontecimentos | 0 | 1 |
| Organizações | 0 | 1 |
| Vínculos acontecimento–evidência | 0 | 2 |
| Vínculos acontecimento–organização | 0 | 1 |
| Cadeias completas | 0 | 2 |
| Assinatura integral da carga `0001` | `1509ccaa3560ffa46a53b2ff287e6339` | `1509ccaa3560ffa46a53b2ff287e6339` |

A igualdade da assinatura compara integralmente os registros e vínculos da carga `0001`, incluindo seus identificadores internos e datas de controle. A carga anterior não foi modificada.

## Ausência de alterações indevidas

- não existem acontecimentos ou publicações com identificadores `pilot-%`;
- há exatamente dois acontecimentos canônicos `accepted`: as cargas `0001` e `0002`;
- há exatamente um acontecimento `corroborated`: a carga `0002`;
- permanecem 15 migrations no histórico;
- nenhuma migration, tabela, coluna, índice, função ou regra de acesso foi criada ou alterada;
- cada identificador estável da carga `0002` aparece exatamente uma vez;
- nenhum registro alternativo dos candidatos GreenV/Porsche ou GWM/EletroGraal foi carregado.

## Saltos nos identificadores internos

Os identificadores internos não são consecutivos em relação à carga `0001`. Isso é esperado porque sequências de identidade do PostgreSQL não retrocedem quando uma transação é revertida e também podem consumir valores em tentativas de `INSERT ... ON CONFLICT DO NOTHING`.

As duas execuções descartáveis anteriores não deixaram linhas nas tabelas, mas consumiram valores das sequências. Esses saltos:

- não representam registros apagados da carga canônica;
- não são duplicatas ou dados de teste;
- não afetam os identificadores estáveis, vínculos ou contagens;
- não exigem reinício ou manipulação das sequências.

## Conclusão

A carga canônica `0002` foi persistida com sucesso. O banco contém um único acontecimento `accepted` e `corroborated`, reconstruído por duas cadeias completas sob controles institucionais distintos. A carga `0001` permaneceu integralmente inalterada, nenhum dado de piloto foi introduzido e o schema não mudou.

O resultado deve ser revisado e incorporado à `main` antes da conclusão formal do segundo ciclo.

## Perguntas para revisão

1. A execução usou os arquivos aceitos e incorporados à `main`, com os hashes documentados?
2. Cada fonte, publicação, observação, evidência, acontecimento, organização e vínculo aparece na contagem esperada?
3. As duas cadeias preservam fontes distintas, origens `established` e vínculos `supports` até o mesmo acontecimento?
4. O acontecimento preserva `accepted`, `corroborated`, `product_service`, `occurrence`, a data e o núcleo factual aprovados?
5. A assinatura idêntica demonstra que a carga `0001` permaneceu inalterada?
6. Está documentado que não houve dado de piloto, duplicata, candidato alternativo ou alteração de schema?
7. A explicação sobre os saltos das sequências distingue corretamente valores consumidos de registros persistidos?
8. O conjunto de verificações permite considerar a persistência da carga canônica `0002` bem-sucedida?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.
