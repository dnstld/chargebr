# Decisão de fundação: relações entre instrumentos regulatórios

## Estado

**Proposta para revisão.** Esta decisão responde somente à lacuna `P01-MOD-02`, identificada na revisão independente de `PILOT-01`. O merge deste documento em `main` registra sua aprovação.

Nenhuma alteração de schema, migration, seed ou banco faz parte desta etapa.

## Por que esta relação pertence ao ChargeBR

O ChargeBR não pretende reconstruir toda a história de uma lei. A relação só será registrada quando for necessária para explicar um acontecimento materialmente relevante para a mobilidade elétrica no Brasil.

Em `PILOT-01`, saber que existe uma medida provisória, uma lei e um decreto não basta para reconstruir o que aconteceu. É necessário preservar duas afirmações mais precisas:

- a lei convalidou atos praticados com base na medida provisória;
- o decreto regulamentou o Programa Mover instituído pela lei.

Essas relações ajudam a entender a continuidade normativa de um programa que alcança veículos elétricos e híbridos, eficiência energética e descarbonização. Elas não autorizam ampliar o caso para atos ou temas sem essa relação material.

## Lacuna encontrada

Atualmente, convalidação e regulamentação aparecem em observações, evidências e acontecimentos. Não existem, porém, como relações tipadas entre os registros canônicos de `regulatory_instruments`.

Uma pessoa consegue interpretar os textos. Uma consulta automática não consegue responder com segurança:

- qual lei convalidou atos praticados com base em determinada medida provisória;
- qual decreto regulamentou o programa instituído por determinada lei;
- qual acontecimento, data e evidência sustentam cada relação.

| Campo | Valor |
| --- | --- |
| Caso que revelou a lacuna | `PILOT-01` |
| Identificador | `P01-MOD-02` |
| Categoria | `modelo` |
| Severidade | `bloqueante` |
| Critérios afetados | `E-04`, `R-03`, `R-04`, `R-05` e `R-06` |

## Decisão proposta

Depois da aprovação desta decisão, criar a tabela `regulatory_instrument_relations` com:

- referência obrigatória ao instrumento de origem;
- referência obrigatória ao instrumento de destino;
- tipo obrigatório e direcional da relação, na coluna `relationship_type`;
- referência obrigatória ao acontecimento que estabelece ou expressa a relação;
- notas opcionais somente para limitar ou esclarecer o significado;
- timestamps de criação e atualização;
- chave primária composta por instrumento de origem, instrumento de destino e tipo;
- índices para consultas pelo destino e pelo acontecimento;
- as mesmas restrições de acesso adotadas nas demais tabelas da fundação.

O instrumento de origem é aquele cujo texto estabelece ou expressa a relação. O instrumento de destino é o ato anterior citado ou alcançado por essa afirmação.

O acontecimento de estabelecimento fornece a data e o caminho de proveniência. Ele deverá possuir o instrumento de origem como `subject` em `event_regulatory_instruments` e ao menos uma evidência `supports` em `event_evidence`.

## Tipos admitidos inicialmente

Somente dois tipos serão aceitos nesta primeira versão:

| Tipo | Significado exato |
| --- | --- |
| `convalidates_acts_based_on` | O instrumento de origem convalida atos praticados com base no instrumento de destino. Não afirma convalidação integral, conversão ou substituição do ato de destino. |
| `regulates_program_established_by` | O instrumento de origem regulamenta um programa instituído pelo instrumento de destino. Não afirma que todo o conteúdo do ato de destino foi regulamentado. |

Os nomes mais específicos preservam a força exata das fontes. Tipos genéricos como `convalidates` ou `regulates` poderiam produzir respostas mais amplas que os textos oficiais sustentam.

## Aplicação em `PILOT-01`

A versão corrigida do caso deverá criar exatamente duas relações:

| Origem | Tipo | Destino | Acontecimento que estabelece | Sustentação |
| --- | --- | --- | --- | --- |
| Lei nº 14.902/2024 | `convalidates_acts_based_on` | MP nº 1.205/2023 | `pilot-01-lei-14902-convalidacao-mp-1205-2024-06-28` | Art. 33 da lei |
| Decreto nº 12.435/2025 | `regulates_program_established_by` | Lei nº 14.902/2024 | `pilot-01-decreto-12435-publicacao-2025-04-16` | Ementa do decreto |

A primeira relação afirma somente a convalidação dos atos praticados com base na MP. A segunda afirma somente que o decreto regulamenta o Programa Mover instituído pela lei.

Nenhuma das duas relações afirma que a lei converteu, substituiu ou sucedeu juridicamente a MP. Também não afirma que o decreto regulamentou integralmente a Lei nº 14.902/2024.

## Proveniência e validação entre tabelas

A relação não duplicará evidências. Sua sustentação será reconstruída pelo acontecimento obrigatório:

1. `regulatory_instrument_relations` identifica origem, destino, tipo e acontecimento;
2. `event_regulatory_instruments` confirma que o instrumento de origem é o objeto central daquele acontecimento;
3. `event_evidence` liga o acontecimento à evidência com `supports`;
4. a evidência deriva da observação e do documento oficial correspondente.

As chaves estrangeiras e restrições simples serão garantidas pelo banco. Duas condições que atravessam tabelas serão verificadas pelo processo de preparação e revisão:

- o acontecimento indicado precisa ter o instrumento de origem como `subject`;
- o acontecimento precisa ter ao menos uma evidência `supports` que sustente a relação e identifique o destino.

Essas condições não serão implementadas agora com gatilhos. Os registros do piloto serão validados de forma transacional, e qualquer ausência impedirá sua aceitação. Uma restrição automatizada só será proposta se casos posteriores demonstrarem que a validação de processo é insuficiente.

## Encerramento de vigência da MP

Esta decisão não cria um tipo `declares_expiry_of` entre o Ato Declaratório nº 35/2024 e a MP. No recorte atual, o encerramento já pode ser reconstruído pelo acontecimento ligado à MP como `subject` e pela evidência derivada do ato declaratório.

A lacuna restante desse acontecimento é outra: sua fase ainda usa `occurrence` em vez de uma fase específica para encerramento de vigência. Ela continuará reservada para `P01-RES-01`.

## Alternativas não adotadas

- **Manter a relação apenas em texto ou notas:** não permite integridade referencial nem consultas tipadas.
- **Adicionar colunas como `regulated_law_id` diretamente ao instrumento:** fixa uma relação específica, admite somente um destino e mistura estrutura com vocabulário.
- **Usar somente o vínculo acontecimento–instrumento:** identifica o objeto central do acontecimento, mas não expressa a direção nem o significado da relação entre dois atos.
- **Ligar a relação diretamente a uma única evidência:** duplicaria parte de `event_evidence` e limitaria a sustentação futura a uma evidência escolhida arbitrariamente.
- **Criar agora uma ontologia jurídica ampla:** anteciparia alteração, revogação, conversão, sucessão e outros tipos ainda não demonstrados por casos aprovados.
- **Usar tipos genéricos:** poderia afirmar convalidação da MP inteira ou regulamentação integral da lei, excedendo as fontes.

## Consequências

- `P01-MOD-02` permanecerá aberta até a aprovação e implementação desta decisão.
- A próxima etapa depois do merge será uma migration exclusiva para `regulatory_instrument_relations`.
- A migration e as duas relações de `PILOT-01` serão validadas em uma transação descartável.
- A tabela permanecerá vazia no banco até que os registros corrigidos do piloto sejam aprovados para uma etapa própria.
- RLS ficará habilitado, o acesso público permanecerá revogado e o acesso operacional continuará restrito ao `service_role`.
- Nenhuma alteração será aplicada ao Supabase antes do merge da migration.
- `P01-RES-01` continuará aberta para uma decisão separada sobre encerramento de vigência.

## Critérios para a implementação

A migration futura deverá comprovar que:

- origem, destino e acontecimento precisam existir;
- origem e destino não podem ser o mesmo instrumento;
- somente os dois tipos aprovados são aceitos;
- a mesma relação tipada não pode ser duplicada;
- exclusões não apagam silenciosamente relações históricas;
- consultas pelo destino e pelo acontecimento possuem índices adequados;
- notas vazias não são aceitas quando a coluna é preenchida;
- RLS permanece habilitado e o acesso público permanece revogado;
- as duas relações de `PILOT-01` percorrem acontecimentos com instrumento de origem e evidência `supports` compatíveis;
- a validação termina com rollback e não deixa dados do piloto no banco persistente.
