# Revisão da implementação do adapter ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este pacote implementa `pnpm collect aneel` sobre o endpoint e a fronteira de
acesso já aprovados. Ele não executa coleta com a credencial técnica, não cria
run remoto, não persiste conteúdo canônico e não escolhe qualquer componente do
futuro backend.

## Base confirmada

A branch foi criada a partir da `main` no commit
`caf8915d1e085e5f2d346a105f4ae0aa1df0dfe1`, merge do PR #195. Nesse estado:

- a source `aneel` e o endpoint `aneel-board-meetings-index` estavam ativos;
- as cinco policies ANEEL da role `chargebr_collector_0001` estavam aplicadas;
- não existia `collection_run` ANEEL;
- a CLI reconhecia `aneel`, mas ainda encerrava como indisponível antes de
  conectar.

## Implementação

O adapter novo:

1. resolve exatamente `aneel` + `aneel-board-meetings-index`, sem ID fixo;
2. compara o contrato completo do banco com o contrato canônico versionado;
3. faz apenas `GET`, com `Accept: text/html`, timeout de 20 segundos e limite de
   1.000.000 bytes por resposta;
4. aceita somente HTTPS no hostname exato `www2.aneel.gov.br` para índice,
   paginação, detalhes e redirects;
5. exige HTML declarado como `ISO-8859-1` e decodifica os bytes antes do parser;
6. começa na página 1, segue apenas o link `Próximas 15 >>`, exige avanço de uma
   página e limita a janela a dez páginas;
7. identifica cada item por `idNoticia`, exige `idAreaNoticia = 425` e o path de
   detalhe aprovado;
8. lê data e título no índice, conteúdo editorial mínimo no detalhe e apenas
   referencia PDFs oficiais, sem baixá-los;
9. remove regiões voláteis como scripts, navegação, cabeçalho, rodapé e
   formulários antes do fingerprint;
10. compara identidades e fingerprints com o último manifest completo, sem
    inferir remoção pela ausência de um item;
11. mantém `cursor_in`, `cursor_out` e `window_start` nulos, como exige o
    `cursor_strategy = none`;
12. grava `ready_for_extraction` somente em `succeeded`, `not_produced` em
    `no_change` e `withheld` nos demais estados.

O runner, heartbeat, reconciliação de run vencido, escrita atômica do manifest,
hashes, contagens, transição terminal e sanitização continuam compartilhando a
infraestrutura já exercitada pelo adapter ABVE.

## HTML e dependência

Foi adicionada `parse5` na versão exata `8.0.1`. O lockfile registra também sua
dependência transitiva. `pnpm audit --prod` terminou com `No known
vulnerabilities found`.

O parser não executa scripts e não usa browser, cookies, sessão ou automação. Os
bodies permanecem transitórios; o manifest conserva somente identidade, URL,
fingerprint, classificação, hashes dos bytes e diagnósticos sanitizados.

As fixtures positivas são fragmentos literais mínimos reconstruídos a partir
das observações registradas em 25 de setembro de 2026 na decisão do endpoint.
Elas não são uma alegação de arquivamento do body oficial e dizem isso dentro do
próprio arquivo. As fixtures negativas cobrem cardinalidade, região editorial
ausente, charset divergente, redirect externo, desafio de acesso e detalhe
inacessível.

## Correção do contrato comum

O teste de detalhe inacessível revelou que o manifest já possuía a classe
`inaccessible`, mas sua validação exigia um fingerprint mesmo sem o body do
item. A regra foi corrigida para:

- exigir identidade e URL de todo item `inaccessible` já descoberto no índice;
- permitir que apenas essa classe e `rejected` não possuam fingerprint;
- continuar exigindo identidade, URL e fingerprint em `new`, `unchanged` e
  `changed`.

Um teste específico impede regressão dessa invariável.

## Evidência operacional atual

Em 30 de setembro de 2026, uma requisição sem banco executou o adapter real
contra o endpoint aprovado. O resultado sanitizado foi:

```json
{
  "status": "blocked",
  "error_kind": "access_policy",
  "error_code": "access_challenge",
  "request_count": 1,
  "item_count": 0,
  "http_status": 403
}
```

A resposta declarou `CF-Mitigated: challenge`. O adapter cancelou o body, não
tentou cookie, navegador, user-agent alternativo, proxy, mirror ou URL de
fallback e não repetiu um status não transitório. Nenhuma conexão com o banco
foi aberta nesse ensaio e nenhum run foi criado.

Esse estado difere do preflight de 25 de setembro, que recebeu `200`. Portanto,
os testes provam a implementação do contrato e o bloqueio seguro, mas não
provam que o HTML vivo atual ainda corresponde às fixtures positivas. Essa
prova só pode ocorrer quando o endpoint voltar a servir o conteúdo ao runtime
aprovado; ela não será fabricada por contorno de acesso.

## Verificação

Antes da revisão, passaram:

- tipos, formato e lint;
- 212 testes do collector e extractor;
- 58 arquivos e 226 testes na verificação completa do workspace;
- `pnpm audit --prod`, sem vulnerabilidade conhecida;
- ensaio HTTP real e sem banco, com bloqueio sanitizado do desafio atual.

`git diff --check` também terminou sem erros. A verificação completa será
executada novamente depois da confirmação e antes da publicação do PR.

## Fora de escopo

- recuperar, exibir, armazenar ou rotacionar a senha técnica;
- usar conexão administrativa como fallback;
- contornar o desafio Cloudflare;
- executar `pnpm collect aneel` com escrita remota;
- baixar ou interpretar PDFs;
- implementar extração ou persistência canônica para ANEEL;
- alterar policies, grants, migrations ou dados;
- automatizar agenda de coleta;
- escolher framework, arquitetura, hospedagem ou runtime do backend.

## Próxima etapa

Depois do aceite e merge, o acesso será revalidado uma vez pelo runtime
aprovado. Se o desafio persistir, a próxima decisão será substituir ou pausar o
endpoint; não haverá coleta controlada falsa. Se o conteúdo voltar a responder
sem desafio, o primeiro run com a identidade técnica validará o HTML vivo,
produzirá o manifest bootstrap e será documentado separadamente.

## Perguntas para revisão

1. O adapter implementa exatamente o contrato canônico aprovado?
2. Os limites de host, paths, paginação, charset, tamanho, timeout e redirects
   estão suficientemente estreitos?
3. Identidade, normalização, referências de PDF e fingerprints preservam apenas
   a evidência mínima decidida?
4. Está correta a regra comum para itens `inaccessible` descobertos sem body?
5. As fixtures positivas e sua origem reconstruída estão descritas sem alegar
   compatibilidade ainda não provada com o HTML vivo?
6. Está correto bloquear o desafio atual sem qualquer contorno e decidir o
   endpoint novamente se ele persistir depois do merge?
7. Está correto manter credencial, coleta remota, extração, backend e automação
   fora deste PR?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta for
`não`, indique o número e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 30 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as sete decisões e não solicitou
correções. O pacote está liberado para commit e abertura de PR. Nenhuma coleta
remota, mudança no banco ou decisão de backend foi autorizada por este aceite.
