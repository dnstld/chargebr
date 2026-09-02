# Decisão de fundação: vínculo entre acontecimentos e instrumentos regulatórios

## Estado

**Proposta para revisão.** Esta decisão responde somente à lacuna `P01-MOD-01`, identificada na revisão independente de `PILOT-01`. O merge deste documento em `main` registra sua aprovação.

Nenhuma alteração de schema, migration, seed ou banco faz parte desta etapa.

## Lacuna encontrada

O cadastro `events` representa algo que aconteceu em determinada data. O cadastro `regulatory_instruments` representa o ato jurídico que continua existindo e pode mudar de estado ao longo do tempo. Atualmente, os dois registros não possuem ligação estrutural.

Em `PILOT-01`, uma pessoa consegue associá-los lendo títulos, resumos e fingerprints. Uma consulta automática, porém, não consegue responder com segurança perguntas simples como:

- quais acontecimentos pertencem à MP nº 1.205/2023;
- qual instrumento entrou em vigor em determinada data;
- a qual instrumento corresponde o encerramento de vigência registrado em 31 de maio de 2024.

| Campo | Valor |
| --- | --- |
| Caso que revelou a lacuna | `PILOT-01` |
| Identificador | `P01-MOD-01` |
| Categoria | `modelo` |
| Severidade | `bloqueante` |
| Critérios afetados | `E-03`, `R-03`, `R-04`, `R-05` e `R-06` |

## Decisão proposta

Depois da aprovação desta decisão, criar a tabela associativa `event_regulatory_instruments` com:

- referência obrigatória ao acontecimento;
- referência obrigatória ao instrumento regulatório;
- papel contextual obrigatório do instrumento no acontecimento, na coluna `instrument_role`;
- notas opcionais apenas para qualificações que não substituam o vínculo;
- chave primária composta por acontecimento, instrumento e papel;
- índice para consultas iniciadas pelo instrumento;
- as mesmas restrições de acesso adotadas nas demais tabelas da fundação.

O único papel admitido inicialmente será `subject`: o instrumento cuja publicação, vigência, produção de efeitos, encerramento ou outra mudança de estado constitui o objeto central do acontecimento.

A relação será muitos-para-muitos. Um instrumento pode participar de vários acontecimentos ao longo do tempo, e o modelo não impedirá que um acontecimento futuro possua mais de um instrumento quando um caso real demonstrar essa necessidade. O mesmo vínculo, com o mesmo papel, não poderá ser duplicado.

Para preservar o histórico, a exclusão de um acontecimento ou instrumento relacionado será impedida enquanto o vínculo existir.

## O que o vínculo afirma

O vínculo responderá somente:

> Qual instrumento é o objeto central deste acontecimento?

Ele não afirmará que um instrumento regulamenta, convalida, altera, revoga, substitui ou sucede outro instrumento. Essas são relações jurídicas entre dois atos e pertencem à lacuna separada `P01-MOD-02`.

Também não substituirá `event_evidence`. A sustentação factual continuará percorrendo o caminho já aprovado:

1. o acontecimento aponta para uma ou mais evidências por `event_evidence`;
2. cada evidência deriva de uma observação e de um documento identificado;
3. o instrumento aponta para seu documento oficial, quando disponível;
4. a revisão compara esses caminhos e impede que o vínculo seja inferido somente por semelhança textual.

Não será criado um segundo vínculo de evidência nesta tabela. O papel `subject` é parte da representação do próprio acontecimento; a relação jurídica entre instrumentos, quando existir, precisará de proveniência própria na decisão `P01-MOD-02`.

## Aplicação em `PILOT-01`

A versão corrigida do caso deverá criar doze vínculos com o papel `subject`:

| Instrumento central | Acontecimentos vinculados |
| --- | ---: |
| MP nº 1.205/2023 | 5 |
| Ato Declaratório nº 35/2024 | 1 |
| Lei nº 14.902/2024 | 4 |
| Decreto nº 12.435/2025 | 2 |

O acontecimento de convalidação terá a Lei nº 14.902/2024 como instrumento central. O acontecimento de publicação do decreto terá o Decreto nº 12.435/2025 como instrumento central. As relações da lei com a MP e do decreto com a lei não serão representadas por um segundo papel ou por notas: elas aguardarão `P01-MOD-02`.

## Completude e validação

A tabela garante que todo vínculo gravado aponta para registros existentes, possui um papel permitido e não está duplicado. Ela não consegue, por uma restrição declarativa simples, obrigar que todo acontecimento regulatório tenha ao menos um vínculo.

Nesta primeira versão, a completude será exigida pelo processo de preparação e revisão:

- todo acontecimento regulatório aplicável submetido à aceitação deve possuir ao menos um vínculo `subject`;
- a validação reproduzível do caso deve comparar a quantidade de acontecimentos aplicáveis com a quantidade de vínculos esperados;
- ausência de vínculo permanece uma falha de registro e não pode ser compensada por título, resumo, notas ou fingerprint.

Uma automação ou restrição entre tabelas só será proposta se um caso posterior demonstrar que a validação de processo é insuficiente. Isso evita introduzir agora gatilhos e regras de transição de estado ainda não exigidos pelo piloto.

## Alternativas não adotadas

- **Adicionar `regulatory_instrument_id` diretamente a `events`:** limitaria cada acontecimento a um instrumento e não registraria o papel contextual.
- **Continuar usando texto ou fingerprints:** não oferece integridade referencial nem consultas relacionais seguras.
- **Usar `event_evidence` como se fosse o vínculo:** evidência sustenta uma afirmação; ela não identifica, por si só, qual entidade canônica é o objeto do acontecimento.
- **Usar a relação com `content_items`:** documento oficial e instrumento regulatório são conceitos diferentes, e nem todo acontecimento corresponde à publicação do documento.
- **Criar agora papéis como `affected`, `origin` ou `target`:** nenhum caso aprovado demonstrou significados estáveis para esses papéis.
- **Representar convalidação ou regulamentação nesta tabela:** misturaria o objeto do acontecimento com relações jurídicas entre instrumentos.

## Consequências

- `P01-MOD-01` permanecerá aberta até a aprovação e implementação desta decisão.
- A próxima etapa depois do merge será uma migration exclusiva para `event_regulatory_instruments`.
- A migration será validada transacionalmente, incluindo os doze vínculos esperados de `PILOT-01`, e os dados de teste serão revertidos.
- A tabela permanecerá sem acesso público, com RLS habilitado e acesso operacional restrito ao `service_role`, como nas tabelas equivalentes.
- Nenhuma alteração será aplicada ao Supabase antes do merge da migration.
- `P01-MOD-02` e `P01-RES-01` continuarão abertas e serão tratadas em etapas separadas.

## Critérios para a implementação

A migration futura deverá comprovar que:

- somente acontecimentos e instrumentos existentes podem ser relacionados;
- o mesmo vínculo não pode ser duplicado;
- apenas `subject` é aceito nesta primeira versão;
- exclusões não apagam silenciosamente relações históricas;
- consultas iniciadas pelo instrumento possuem índice adequado;
- notas vazias não são aceitas quando a coluna é preenchida;
- RLS permanece habilitado e o acesso público permanece revogado;
- os doze acontecimentos de `PILOT-01` podem ser ligados aos quatro instrumentos conforme a tabela acima;
- nenhuma relação jurídica entre dois instrumentos é inferida ou antecipada;
- a validação termina com rollback e não deixa dados do piloto no banco persistente.
