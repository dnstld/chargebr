---
description: Registra o aceite humano num documento de decisão ou numa spec.
argument-hint: [caminho do documento]
allowed-tools: Bash(date *) Read Edit Grep Glob
---

## Data de hoje

```!
date "+%-d de %B de %Y" | sed 's/January/janeiro/;s/February/fevereiro/;s/March/março/;s/April/abril/;s/May/maio/;s/June/junho/;s/July/julho/;s/August/agosto/;s/September/setembro/;s/October/outubro/;s/November/novembro/;s/December/dezembro/'
```

## O que fazer

No documento `$1`:

1. Troque o campo `Estado` de `PROPOSTA PARA REVISÃO` para
   `ACEITA — AGUARDANDO MERGE`.
2. Preencha a tabela de resultado da revisão com `Denis Toledo`, a data acima e
   o resultado `` `ACCEPTED` `` — sempre esse identificador, nunca traduzido.
3. Acrescente, se ainda não houver, a frase de fechamento no padrão do
   repositório: que a pessoa revisora aceitou integralmente e não solicitou
   correções.
4. Não altere nenhuma outra parte do documento.

Se o documento não tiver tabela de resultado da revisão, pare e diga.
