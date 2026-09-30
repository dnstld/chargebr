# Decisão: indisponibilidade operacional do collector ANEEL

## Estado

`CONFIRMADA — AGUARDANDO MERGE`

Este documento decide o estado operacional do endpoint
`aneel-board-meetings-index` depois da implementação do adapter e da
revalidação posterior ao merge do PR #196.

Esta etapa é somente documental. Ela não altera o Supabase, não cria
`collection_run`, não usa a credencial técnica, não executa fallback, não
implementa outro adapter e não escolhe qualquer componente do futuro backend.

## Decisão proposta

1. declarar o endpoint `aneel-board-meetings-index` como operacionalmente
   `unavailable`;
2. preservar o contrato, o adapter, os testes, as policies e todo o histórico,
   sem apagar nem reescrever a evidência já aceita;
3. não executar coleta controlada enquanto o endpoint devolver desafio de
   acesso;
4. não substituir o endpoint por uma alternativa que ainda não tenha acesso,
   formato, identidade e cobertura comprovados no runtime aprovado;
5. depois do aceite e merge desta decisão, preparar em PR separado a mudança
   mínima de `source_endpoints.status` de `active` para `unavailable`;
6. aplicar essa mudança somente depois do merge, auditar o resultado remoto e
   registrá-lo em outro PR;
7. entregar ao futuro time de backend a ANEEL como integração implementada,
   porém indisponível como alimentação operacional do banco.

O estado proposto é `unavailable`, e não `paused`, porque o modelo vigente
reserva `paused` para suspensão deliberada e reversível. Aqui o acesso ou
contrato deixou de funcionar e a condição externa foi confirmada.

## Base incorporada

O PR #196 foi incorporado à `main` no commit
`4217f090e65a8377dbf3c2237c8fcb3b0fcb3a1b`. Nesse estado:

- `pnpm collect aneel` está implementado;
- o runner exige endpoint `active` antes de abrir um run;
- o adapter bloqueia desafio interativo sem retry ou fallback;
- nenhuma coleta ANEEL completa foi criada;
- nenhuma evidência viva foi tratada como coletada durante o bloqueio.

## Revalidação posterior ao merge

Em 30 de setembro de 2026, o runtime local fez uma única requisição sem banco e
sem credencial para a primeira página exata do endpoint aprovado:

```text
https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425&page=1
```

Resultado:

| Campo | Valor |
| --- | --- |
| Método | `GET` |
| Accept | `text/html` |
| Redirect | manual, não seguido |
| Timeout | 20 segundos |
| Status | `403` |
| Content type | `text/html; charset=UTF-8` |
| `CF-Mitigated` | `challenge` |
| Location | ausente |
| Body retido | não |

O resultado repete o bloqueio observado durante a revisão da implementação.
Em 25 de setembro, o mesmo índice havia respondido `200` e declarado
`ISO-8859-1`. A mudança é externa ao repositório e impede provar o HTML vivo
atual sem contornar a política de acesso.

## Alternativas oficiais verificadas

### Página institucional no gov.br

A página oficial
[Pautas e Atas](https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas)
continua apontando para o índice bloqueado e também para o Boletim de Serviço
Eletrônico. Ela descreve a coleção, mas não contém por si só o histórico e o
conteúdo editorial necessários ao contrato do collector.

### Portal de Dados Abertos

O catálogo oficial
[Pautas e Atas das Reuniões Públicas da Diretoria](https://dadosabertos.aneel.gov.br/pt_BR/dataset/pautas-e-atas-das-reunioes-publicas-da-diretoria)
declara frequência semanal e atualização em 25 de setembro de 2026. O resource
CSV `43386a8b-4781-44ec-a082-fa7fdfe33186` aparece como ativo, com datastore
contendo todos os registros.

Isso não resolveu a fronteira operacional:

- o download do CSV expirou sem resposta útil;
- uma leitura `datastore_search` com `limit=1` expirou antes da conexão TLS no
  runtime local;
- o mesmo host já havia falhado em duas avaliações anteriores;
- cache ou indexação de pesquisa não prova acesso pelo collector.

O dataset continua sendo uma alternativa oficial relevante, mas não pode ser
promovido enquanto permanecer inacessível no ambiente aprovado.

### Boletim de Serviço Eletrônico

A página oficial
[Boletim de Serviço Eletrônico](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/boletim-de-servico-eletronico)
informa que pautas e atas estão disponíveis desde 5 de maio de 2026. O destino
de pesquisa pública no domínio `sei.aneel.gov.br` respondeu `403` na avaliação
atual e ainda não possui contrato de paginação, identidade ou formato aprovado.

## Por que não substituir agora

Uma troca imediata produziria pelo menos um destes problemas:

- chamar de operacional um recurso que o runtime não consegue acessar;
- alterar formato, cobertura ou identidade sem preflight e decisão próprios;
- usar browser, cookie, proxy, mirror ou cache como contorno;
- confundir disponibilidade em pesquisa web com disponibilidade para coleta;
- entregar ao backend uma falsa garantia de cobertura ANEEL.

O ChargeBR preserva mais evidência declarando uma lacuna explícita do que
fabricando uma coleta parcial por outro canal.

## Efeito da mudança futura de status

Quando o banco registrar `unavailable`:

- o runner encerrará antes de qualquer request HTTP e antes de inserir
  `collection_run`;
- as policies e o adapter permanecerão disponíveis para auditoria;
- runs e documentos anteriores permanecerão intactos;
- não haverá agendamento ou nova tentativa automática;
- ABVE continuará independente e não será afetada.

Nenhum run artificial será criado para representar esta decisão. O estado do
endpoint é a evidência correta para uma indisponibilidade confirmada antes da
coleta.

## Critério para retomada

A ANEEL só poderá voltar a `active` depois de um novo ciclo explícito que:

1. obtenha resposta pública sem desafio no runtime aprovado;
2. confirme termos, robots, host, formato, tamanho e paginação;
3. valide a compatibilidade do HTML vivo com o adapter, ou aprove outro
   endpoint e contrato;
4. registre uma nova revisão de acesso;
5. incorpore e aplique a mudança de status antes de qualquer run controlado.

O futuro backend não deverá ser usado como tentativa de contornar ou redescobrir
essa fronteira.

## Fora de escopo

- alterar o banco neste PR;
- retirar o adapter ANEEL;
- mudar ou reutilizar a senha técnica;
- criar run remoto ou manifest bootstrap;
- baixar PDFs;
- implementar o dataset CKAN ou o Boletim Eletrônico;
- automatizar novas tentativas;
- escolher arquitetura, framework, hospedagem ou runtime do backend.

## Perguntas para decisão

1. Está correto declarar o endpoint atual como `unavailable` diante do desafio
   confirmado?
2. Está correto preservar adapter, policies e histórico sem executar nova
   coleta?
3. Está correto não promover o CKAN ou o Boletim enquanto o acesso e o contrato
   não forem provados no runtime aprovado?
4. Está correto implementar e aplicar a mudança de status em etapas separadas,
   depois do merge desta decisão?
5. Está correto informar ao futuro time que ANEEL não é uma fonte operacional
   de alimentação do banco neste momento?
6. Está correto exigir novo preflight e nova revisão antes de reativar ou
   substituir o endpoint?

Se todas as respostas forem `sim`, registre `CONFIRMO`. Se alguma resposta for
`não`, indique o número e a correção necessária.

## Resultado da decisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data | 30 de setembro de 2026 |
| Resultado | `CONFIRMADO` |

A pessoa revisora confirmou integralmente as seis decisões e não solicitou
correções. O documento está liberado para commit e abertura de PR. A mudança de
status no banco permanece bloqueada até o merge e será preparada, aplicada e
auditada em etapas separadas.
