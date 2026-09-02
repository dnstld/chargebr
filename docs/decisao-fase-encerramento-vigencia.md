# Decisão de fundação: fase de encerramento de vigência

## Estado

**Proposta para revisão.** Esta decisão responde somente à lacuna `P01-RES-01`, identificada na revisão independente de `PILOT-01`. O merge deste documento em `main` registra sua aprovação.

Nenhuma alteração de schema, migration, seed ou banco faz parte desta etapa.

## Por que esta fase pertence ao ChargeBR

O ChargeBR não pretende registrar toda a história do Programa Mover nem formar uma enciclopédia jurídica. Um marco regulatório só pertence ao produto quando ajuda a explicar uma mudança materialmente relevante para a mobilidade elétrica no Brasil.

Em `PILOT-01`, a Medida Provisória nº 1.205/2023 instituiu um programa ligado a veículos elétricos e híbridos, eficiência energética e descarbonização. Saber quando esse instrumento deixou de vigorar é necessário para não apresentar como vigente uma regra que já havia encerrado seu prazo.

A fase proposta descreve esse marco temporal. Ela não amplia o caso para todos os acontecimentos da medida provisória, da lei ou do decreto.

## Lacuna encontrada

O vocabulário atual de `events.event_phase` admite:

- `announcement`;
- `approval`;
- `publication`;
- `effective`;
- `occurrence`;
- `update`.

O acontecimento de 31 de maio de 2024, quando se encerrou a vigência da MP nº 1.205/2023, usa `occurrence`. Essa fase apenas informa que algo ocorreu; ela não permite distinguir o fim da vigência de qualquer outro acontecimento genérico.

O campo `regulatory_instruments.expiry_date` já preserva a data canônica de encerramento no instrumento, mas não substitui o acontecimento histórico nem seu caminho de evidências. Sem uma fase própria, uma consulta automática precisa interpretar título, resumo ou notas para descobrir o significado do marco.

| Campo | Valor |
| --- | --- |
| Caso que revelou a lacuna | `PILOT-01` |
| Identificador | `P01-RES-01` |
| Categoria | `restrição` |
| Severidade | `bloqueante` |
| Critérios afetados | `C1-02`, `T-01`, `T-04`, `R-05` e `R-06` |

## Decisão proposta

Depois da aprovação desta decisão, acrescentar `expiry` aos valores aceitos pela restrição `events_event_phase_valid`.

`expiry` significa que o acontecimento registra o encerramento da vigência ou do prazo de um instrumento regulatório em uma data específica. A fase descreve o que aconteceu naquela data, mesmo quando o documento oficial que confirma o encerramento foi publicado depois.

O nome acompanha `regulatory_instruments.expiry_date` e preserva a distinção entre:

- o estado atual ou canônico do instrumento;
- a data canônica de encerramento;
- o acontecimento histórico que mudou esse estado;
- a publicação posterior que documentou o acontecimento.

Os valores existentes continuarão válidos. Nenhuma outra fase será adicionada nesta etapa.

## Aplicação em `PILOT-01`

Somente um acontecimento do seed corrigido mudará de fase:

| Acontecimento | Data | Fase atual | Fase proposta |
| --- | --- | --- | --- |
| `pilot-01-mp-1205-vigencia-encerrada-2024-05-31` | 31/05/2024 | `occurrence` | `expiry` |

O evento registra a data em que o prazo da MP terminou. Sua confirmação deriva do Ato Declaratório nº 35/2024, publicado posteriormente.

O acontecimento `pilot-01-ato-35-publicacao-2024-06-11` continuará separado, em 11 de junho de 2024, com fase `publication`. Portanto, o modelo não confundirá a data do encerramento da MP com a data em que o ato declaratório foi publicado.

## Relação entre fase, data e estado

Os três elementos têm funções diferentes:

| Elemento | Função em `PILOT-01` |
| --- | --- |
| `events.event_phase = 'expiry'` | Classifica o marco histórico como encerramento de vigência. |
| `events.event_date = '2024-05-31'` | Registra quando o encerramento ocorreu. |
| `regulatory_instruments.expiry_date = '2024-05-31'` | Preserva no registro da MP sua data canônica de encerramento. |
| `regulatory_instruments.current_status = 'expired'` | Informa o estado atual conhecido da MP. |

Essa pequena redundância é intencional: o instrumento responde qual é seu estado e sua data de encerramento; o acontecimento preserva a transição histórica e permite chegar às evidências que a sustentam.

## Por que não usar `revocation`

Encerramento de prazo e revogação não são sinônimos. A fonte oficial do caso declara que o prazo de vigência da medida provisória se encerrou. Ela não sustenta que esse marco tenha sido uma revogação.

Criar ou usar `revocation` faria uma afirmação jurídica mais específica do que a evidência permite. Se um caso futuro demonstrar a necessidade de representar revogação, ele deverá originar uma decisão própria.

## Por que usar `expiry`, e não `expired`

`expiry` nomeia o acontecimento de encerramento. `expired` já é usado em `regulatory_instruments.current_status` para descrever o estado atual do instrumento.

Manter palavras diferentes ajuda a separar transição e estado:

- o instrumento **está** `expired`;
- o acontecimento registra seu `expiry`.

## Alternativas não adotadas

- **Manter `occurrence`:** preserva a data, mas obriga consultas a interpretar texto livre para identificar o encerramento.
- **Inferir o acontecimento apenas por `expiry_date`:** perde o registro histórico separado e seu caminho de evidências.
- **Usar `effective` com sentido inverso:** confundiria entrada em vigor com término de vigência.
- **Adicionar uma fase ampla como `termination`:** poderia misturar expiração de prazo, revogação, anulação e outros mecanismos juridicamente diferentes.
- **Renomear ou remover `occurrence`:** afetaria acontecimentos existentes sem necessidade demonstrada pelo caso.
- **Adicionar agora fases para revogação, suspensão ou anulação:** anteciparia necessidades ainda não comprovadas por casos aprovados.

## Consequências

- `P01-RES-01` permanecerá aberta até a aprovação e implementação desta decisão.
- A próxima etapa depois do merge será uma migration exclusiva para acrescentar `expiry` à restrição de `events.event_phase` e atualizar o comentário da coluna.
- A migration não alterará registros existentes e não carregará dados do piloto.
- Depois da aplicação da migration, as três lacunas de fundação identificadas em `PILOT-01` estarão implementadas.
- O seed de `PILOT-01` será corrigido somente em uma etapa posterior, com os vínculos e relações já aprovados e a nova fase.
- O caso corrigido precisará de novo pacote e nova revisão independente antes de ser aceito.
- Nenhuma alteração será aplicada ao Supabase antes do merge da migration correspondente.

## Critérios para a implementação

A migration futura deverá comprovar que:

- `expiry` passa a ser aceito por `events.event_phase`;
- todos os seis valores anteriores continuam aceitos;
- qualquer valor fora do vocabulário aprovado continua rejeitado;
- o comentário da coluna explica que a fase também pode representar encerramento de vigência;
- RLS e privilégios da tabela `events` permanecem inalterados;
- a validação termina com rollback e não deixa dados de teste no banco persistente.

Na etapa posterior de correção do seed, a validação também deverá comprovar que:

- somente o acontecimento de encerramento da MP muda de `occurrence` para `expiry`;
- a publicação do ato declaratório permanece um acontecimento separado com fase `publication`;
- a data do acontecimento e `regulatory_instruments.expiry_date` permanecem consistentes;
- a evidência oficial continua sustentando o encerramento declarado;
- nenhum dado de `PILOT-01` permanece no banco ao final da validação transacional.
