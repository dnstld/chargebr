# Decisão de fundação: precisão da data de publicação

## Estado

**Proposta para revisão.** Esta decisão surgiu durante a preparação dos registros de `PILOT-02`. O merge deste documento em `main` registra sua aprovação.

## Lacuna encontrada

A [publicação da BYD usada em `PILOT-02`](https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional) informa `24/03/2026`, sem horário de publicação.

O cadastro `content_items` possui somente `published_at`, do tipo `timestamptz`. Esse campo representa um instante, portanto seu preenchimento exigiria inventar uma hora e um fuso que a fonte não forneceu. Deixá-lo vazio perderia uma data conhecida.

| Campo | Valor |
| --- | --- |
| Caso que revelou a lacuna | `PILOT-02` |
| Categoria | `modelo` |
| Severidade | `bloqueante` |
| Critérios afetados | `P-03`, `T-01`, `R-02` e `R-06` |

## Decisão proposta

Depois da aprovação desta decisão, acrescentar a `content_items` a coluna opcional `published_on`, do tipo `date`.

Os dois campos terão significados distintos:

- `published_on`: data de calendário conhecida, sem horário sustentado pela fonte;
- `published_at`: instante de publicação conhecido, com horário e fuso representáveis.

Uma restrição impedirá o preenchimento simultâneo dos dois campos. Ambos poderão permanecer vazios quando nem a data nem o instante forem conhecidos.

A migration também deverá documentar os dois campos e criar um índice para consultas por fonte e `published_on`. O índice existente por fonte e `published_at` será preservado.

## Aplicação em `PILOT-02`

O item de conteúdo da BYD usará:

- `published_on = '2026-03-24'`;
- `published_at = null`.

A data de coleta continuará em `collected_at`, pois ela representa outro momento e pode ser registrada como instante pelo processo de coleta.

## Alternativas não adotadas

- **Converter a data em meia-noite:** criaria precisão e fuso inexistentes na fonte.
- **Deixar `published_at` vazio:** descartaria a data de publicação conhecida.
- **Registrar a data apenas em uma observação:** trataria metadado da publicação como afirmação extraída e enfraqueceria a reconstrução do item.
- **Guardar a precisão em texto livre:** impediria validação estrutural e dependeria de uma convenção não verificável.
- **Criar agora suporte a precisão mensal ou anual:** nenhum caso aprovado demonstrou essa necessidade.

## Consequências

- Os registros de teste de `PILOT-02` permanecem suspensos até a aprovação e implementação desta decisão.
- A próxima etapa, depois do merge, será uma migration exclusiva para a data de publicação em nível de dia.
- Nenhum valor existente será convertido ou inferido; atualmente as tabelas da fundação permanecem sem registros.
- A mudança não altera `event_date`, que já possui sua própria precisão, nem `collected_at`, que continua representando um instante.

## Critérios para a implementação

A migration futura deverá comprovar que:

- uma data sem horário pode ser armazenada em `published_on`;
- um instante pode continuar sendo armazenado em `published_at`;
- os dois campos não podem ser preenchidos simultaneamente;
- a ausência de ambos continua permitida;
- consultas por fonte e `published_on` possuem índice adequado;
- RLS e permissões de `content_items` permanecem inalterados.
