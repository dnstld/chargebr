# Decisão de fundação: vínculo entre eventos e organizações

## Estado

**Proposta para revisão.** Esta decisão surgiu durante a preparação de `PILOT-02` e bloqueia a criação de seus registros de teste. O merge deste documento em `main` registra sua aprovação.

## Lacuna encontrada

O cadastro `organizations` representa organizações canônicas, mas ainda não existe uma relação estrutural entre uma organização e um evento.

No caso da expansão da rede de recarga rápida da BYD, o modelo atual permitiria criar a BYD e o evento separadamente, porém não permitiria registrar que a empresa é o sujeito daquele acontecimento. Repetir seu nome no título, no resumo ou nas notas não cria uma relação verificável e contrariaria os itens `E-02` e `R-06` do checklist do piloto.

| Campo | Valor |
| --- | --- |
| Caso que revelou a lacuna | `PILOT-02` |
| Categoria | `modelo` |
| Severidade | `bloqueante` |
| Critérios afetados | `E-01`, `E-02`, `R-03` e `R-06` |

## Decisão proposta

Depois da aprovação desta decisão, criar a tabela associativa `event_organizations` com:

- referência obrigatória ao evento;
- referência obrigatória à organização;
- papel contextual obrigatório da organização no evento, na coluna `event_role`;
- notas opcionais somente para qualificações que não substituam a relação;
- chave primária composta por evento, organização e papel;
- índice para consultas por organização;
- as mesmas restrições de acesso já adotadas nas tabelas da fundação.

O único papel admitido inicialmente será `subject`, definido como a organização cuja ação, declaração ou estado constitui o foco central do evento. Novos papéis só serão acrescentados quando um caso concreto os exigir.

Para preservar o histórico, a exclusão de um evento ou de uma organização relacionada será impedida enquanto o vínculo existir.

## Aplicação em `PILOT-02`

A representação prevista será:

1. a BYD terá um único registro canônico em `organizations`;
2. a publicação continuará representada por `sources` e `content_items`;
3. as duas afirmações quantitativas continuarão em observações e evidências distintas;
4. o evento será ligado à BYD por `event_organizations`, com o papel `subject`.

Essa relação não afirma, por si só, propriedade, operação exclusiva ou confirmação independente da infraestrutura. Ela identifica apenas a organização central do acontecimento.

## Alternativas não adotadas

- **Guardar o nome da organização em texto livre:** não é verificável por integridade referencial e duplica a identidade canônica.
- **Usar `organization_type` como papel:** `company` descreve a natureza da BYD, não sua função no evento.
- **Adicionar `organization_id` diretamente a `events`:** limitaria o modelo a uma organização e não registraria o papel contextual.
- **Criar agora um vocabulário amplo de papéis:** anteciparia necessidades ainda não demonstradas pelo piloto.
- **Relacionar fontes e organizações nesta etapa:** autoria ou controle editorial de uma fonte é uma relação diferente e exigirá caso e decisão próprios se se tornar necessária.

## Consequências

- Os registros de teste de `PILOT-02` permanecem suspensos até a aprovação e implementação desta decisão.
- A próxima etapa, depois do merge, será uma migration exclusiva para `event_organizations`.
- A migration será validada de forma transacional, sem persistir dados de teste, antes de ser enviada para revisão.
- Nenhuma alteração será aplicada ao Supabase antes do merge da migration.

## Critérios para a implementação

A migration futura deverá comprovar que:

- somente eventos e organizações existentes podem ser relacionados;
- o mesmo vínculo não pode ser duplicado;
- apenas `subject` é aceito nesta primeira versão;
- exclusões não apagam silenciosamente relações históricas;
- o acesso público permanece revogado e o RLS permanece habilitado;
- consultas partindo da organização possuem índice adequado.
