# Seleção da resolução de conflito `0006`

## Estado

`PROPOSTA — EM REVISÃO`

Este documento seleciona um caso real para o [sexto ciclo do fluxo de inteligência](decisao-sexto-ciclo-fluxo-inteligencia.md). Ele não define a mudança de schema, não cria migration, não prepara a carga `0006` e não modifica dados no Supabase.

## Resultado da pesquisa

Foi localizado um caso diretamente relacionado à eletromobilidade brasileira, publicado e corrigido pela própria Associação Brasileira do Veículo Elétrico — ABVE.

Na primeira edição de uma publicação sobre os emplacamentos de 2024, os números de São Paulo foram trocados entre os rankings de estados e cidades. A ABVE corrigiu a página no dia seguinte e preservou uma nota que identifica:

- a existência do erro na primeira edição;
- a natureza do erro: troca entre os números estadual e municipal;
- o valor correto do Estado de São Paulo: `56.819`;
- o valor correto da cidade de São Paulo: `24.435`;
- a data e a hora da correção: 7 de janeiro de 2025, às 18h12.

Para manter o sexto ciclo limitado a um único conflito, a seleção propõe somente o valor do **Estado de São Paulo**:

| Fase | Valor atribuído ao estado | Situação factual proposta |
| --- | ---: | --- |
| Primeira edição | `24435` | Atribuição geográfica incorreta |
| Página corrigida | `56819` | Valor estadual declarado correto pela ABVE |

O valor municipal será preservado como contexto indispensável para explicar a troca, mas não será uma segunda métrica nem um segundo conflito na carga `0006`.

## Parâmetros da pesquisa

| Campo | Valor |
| --- | --- |
| Data da pesquisa | 8 de setembro de 2026 |
| Tema | Emplacamentos de veículos leves eletrificados em 2024 |
| Métrica selecionada | Emplacamentos no Estado de São Paulo |
| Período medido | 1º de janeiro a 31 de dezembro de 2024 |
| Fonte primária | Site oficial da ABVE |
| Publicação original | 6 de janeiro de 2025 |
| Correção | 7 de janeiro de 2025, às 18h12 |
| Tipo de resolução proposto | Correção material de atribuição geográfica |
| Dificuldade exclusiva | Preservar duas versões da mesma página e a transição do valor incorreto para o correto |

A pesquisa procurou um caso em que a própria autoridade documental declarasse a correção. Não foram usados proximidade numérica, soma, maioria de publicações ou preferência editorial para escolher o valor.

## Fonte primária selecionada

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024 |
| Data exibida | 6 de janeiro de 2025 |
| URL | <https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/> |
| Idioma | `pt-BR` |
| Natureza | Publicação institucional original |
| Correção declarada | 7 de janeiro de 2025, às 18h12 |
| Acessibilidade | Página acessível na data da pesquisa |

A página atual exibe `56.819` no texto sobre o Estado de São Paulo e no ranking estadual. Ela exibe `24.435` no ranking municipal.

Ao final, a própria ABVE informa que, na primeira edição, os números de São Paulo nos rankings de estados e cidades estavam trocados e declara expressamente o par correto.

Essa nota é a autoridade da resolução. A seleção não presume que uma edição posterior seja correta apenas por ser mais recente; usa a declaração explícita da própria publicadora sobre o erro e sua correção.

## Reconstrução da primeira edição

A página atual não mantém o corpo incorreto visível no ranking. Contudo, a nota oficial fornece três elementos combinados:

1. os números estadual e municipal estavam trocados na primeira edição;
2. o valor correto do estado é `56.819`;
3. o valor correto da cidade é `24.435`.

Assim, a primeira edição atribuía `24.435` ao Estado de São Paulo e `56.819` à cidade. Essa reconstrução decorre diretamente do significado de “trocados” e do par correto informado pela ABVE; não depende de cálculo ou fonte secundária para decidir o resultado.

Durante a pesquisa, foram encontradas reproduções secundárias que preservaram os rankings trocados. Elas servem apenas como conferência da reconstrução e não serão fontes, evidências ou autoridades canônicas. O caso deve permanecer revisável usando a página oficial e sua nota de correção.

Se a pessoa revisora considerar que a nota oficial não preserva de forma suficiente a afirmação inicial, a seleção deverá ser rejeitada. Uma reprodução secundária não poderá preencher essa lacuna.

## Demonstração do conflito estadual

| Dimensão | Primeira edição | Correção da ABVE | Avaliação |
| --- | --- | --- | --- |
| Entidade | Veículos leves eletrificados emplacados | Veículos leves eletrificados emplacados | Mesma entidade |
| Período | Janeiro a dezembro de 2024 | Janeiro a dezembro de 2024 | Mesmo período |
| Unidade | Emplacamento de veículo | Emplacamento de veículo | Mesma unidade |
| Geografia atribuída | Estado de São Paulo | Estado de São Paulo | Mesma geografia do valor selecionado |
| Valor | `24.435` | `56.819` | Conflito quantitativo |
| Autoridade documental | ABVE, primeira edição | ABVE, nota de correção | Mesma publicadora resolve o erro |

A diferença não decorre de período, tecnologia ou método distintos. A ABVE identifica uma troca de atribuição entre níveis geográficos.

O conflito selecionado é, portanto:

> Quantos veículos leves eletrificados foram emplacados no Estado de São Paulo entre janeiro e dezembro de 2024, segundo a classificação usada pela ABVE nessa publicação?

A primeira edição do ranking estadual atribuiu `24.435`; a correção oficial estabelece `56.819`.

## Por que o valor municipal não é outro conflito da carga

O número `24.435` continua correto para a cidade de São Paulo. Ele é incorreto somente quando associado ao Estado de São Paulo.

Da mesma forma, `56.819` não será tratado como valor municipal rejeitado dentro da carga `0006`, embora esse tenha sido o outro lado da troca. Incluir as duas geografias exigiria duas definições ou dois escopos de métrica e produziria dois conflitos resolvidos.

O recorte estadual usa o par municipal apenas para interpretar a nota da ABVE. Ele não criará:

- uma definição municipal;
- um valor municipal;
- uma observação quantitativa municipal;
- uma segunda transição de estado;
- uma conclusão sobre outros municípios ou estados do ranking.

Essa exclusão mantém o teste pequeno sem esconder a causa documentada do erro estadual.

## Classificação da resolução

A resolução é proposta como **correção material de atribuição geográfica**.

Ela não é:

- revisão metodológica, porque a ABVE não declara mudança no método de contagem;
- atualização de cobertura, porque não há incorporação de registros atrasados ou ampliação da base;
- nova medição, porque período e objeto permanecem iguais;
- simples substituição por recência, porque a página identifica expressamente o erro;
- corroboração independente, porque publicação e correção pertencem à mesma fonte.

Para o escopo estadual:

- `24435` deverá ser candidato a `rejected`, pois a ABVE o reconhece como atribuição incorreta ao estado;
- `56819` deverá ser candidato a `validated`, pois a ABVE o declara correto para o estado;
- `24435` não deverá ser marcado como globalmente inválido, pois o mesmo número permanece correto para o recorte municipal excluído.

Esses estados ainda não serão persistidos. A decisão de modelagem deverá definir como representar a validade restrita ao escopo, a transição e sua proveniência.

## Definição quantitativa candidata

| Campo | Valor proposto para orientar a modelagem |
| --- | --- |
| Chave conceitual | Emplacamentos anuais de veículos leves eletrificados no Estado de São Paulo |
| Domínio | `vehicle_market` |
| Tipo | `integer` |
| Unidade | `vehicle_registration` |
| Agregação | `count` |
| Granularidade temporal | `year` |
| Granularidade geográfica | `state` |
| Período inicial | `2024-01-01` |
| Período final | `2024-12-31` |
| Geografia | Estado de São Paulo, Brasil |

A definição deverá preservar a classificação usada pela ABVE na publicação de janeiro de 2025. O texto informa que, naquele momento, a associação considerava BEV, PHEV, HEV, HEV Flex e MHEV entre os eletrificados.

Essa definição não poderá ser reutilizada automaticamente para publicações posteriores a janeiro de 2025, quando a ABVE passou a separar MHEV de sua classificação principal. A mudança metodológica posterior não altera a correção geográfica selecionada, mas limita a continuidade da série.

Os termos “vendas” e “emplacamentos” aparecem na publicação. A afirmação quantitativa selecionada pertence ao ranking que usa explicitamente “emplacaram”; a unidade canônica proposta é, portanto, `vehicle_registration`, não venda contratada, veículo em circulação ou frota acumulada.

## Cronologia selecionada

| Momento | Ocorrência | Efeito proposto |
| --- | --- | --- |
| 6/1/2025 | ABVE publica o balanço de 2024 | A primeira edição associa `24.435` ao ranking estadual de São Paulo |
| 7/1/2025 às 18h12 | ABVE corrige a página | A ABVE declara `56.819` para o estado e `24.435` para a cidade |
| 8/9/2026 | ChargeBR pesquisa o caso | A página corrigida e a nota continuam acessíveis |

A data de publicação e o momento da correção não são intercambiáveis. A modelagem deverá preservar os dois, mesmo que as versões compartilhem a mesma URL.

## Proveniência e versões da página

O caso possui uma característica que não apareceu nas cargas anteriores: publicação e correção estão na mesma URL.

A representação futura precisará distinguir pelo menos:

- a identidade contínua da página;
- a versão inicial que continha a atribuição incorreta;
- a versão corrigida atualmente acessível;
- o momento conhecido da correção;
- a nota que descreve a relação entre as versões;
- as observações extraídas de cada estado do conteúdo.

Uma única linha atualizada de `content_items` não poderá fazer a página parecer correta desde 6 de janeiro. Duas linhas sem relação estruturada também não explicarão que são versões do mesmo item.

A seleção não decide se isso exigirá uma tabela de versões, uma relação entre itens de conteúdo ou outra estrutura. Essa decisão pertence à próxima etapa de modelagem.

## Requisitos de modelagem revelados

O caso exige que a etapa seguinte avalie como representar:

1. duas versões da mesma URL;
2. a publicação inicial e a correção como momentos diferentes;
3. duas observações quantitativas para o mesmo escopo;
4. uma resolução do tipo correção material de atribuição geográfica;
5. a ligação da correção à versão inicial e ao valor afetado;
6. a transição do valor estadual `24435` para `rejected`;
7. a transição do valor estadual `56819` para `validated`;
8. o fato de `24435` continuar válido em outro escopo não persistido;
9. a reconstrução dos estados anteriores sem depender apenas de `notes` ou `updated_at`;
10. a pessoa, a data e a decisão da revisão canônica.

A decisão de modelagem deverá separar fatos publicados, correção da fonte e decisão do ChargeBR. O acontecimento da ABVE em 7 de janeiro não é o mesmo que o aceite humano posterior da representação canônica.

## Fonte e organização existentes

Se o caso avançar futuramente para carga, deverá reutilizar:

- `sources.slug = 'abve'` como canal institucional;
- `organizations.slug = 'abve'` como organização publicadora.

Esses registros já foram aceitos e persistidos nas cargas anteriores. A etapa de modelagem e o pacote da carga deverão comparar todos os campos antes de reutilizá-los e interromper diante de divergência.

Nenhuma nova organização é necessária para o núcleo selecionado. A publicação menciona a Fenabrave para o total geral de mercado, mas a correção estadual é declarada pela ABVE e não requer criar uma segunda fonte ou atribuir corroboração independente.

## Conteúdo incluído

- a identidade da publicação da ABVE;
- a data da primeira edição;
- a nota e o momento da correção;
- `24.435` como valor inicialmente atribuído ao Estado de São Paulo;
- `56.819` como valor estadual declarado correto;
- o período de janeiro a dezembro de 2024;
- veículos leves eletrificados conforme a classificação usada na publicação;
- o contexto mínimo de que os números estadual e municipal foram trocados;
- a limitação de que `24.435` permanece correto para a cidade.

## Conteúdo excluído

- persistência do valor municipal;
- todos os demais estados e municípios dos rankings;
- total brasileiro de `177.358`;
- total sem micro-híbridos de `173.530`;
- valores nacionais por tecnologia;
- percentuais e participações de mercado;
- comparações com 2023;
- números mensais de dezembro;
- infraestrutura de recarga mencionada na publicação;
- previsões da ABVE;
- avaliação técnica sobre quais veículos deveriam ser chamados de eletrificados;
- aplicação retroativa da classificação adotada a partir de janeiro de 2025;
- reproduções secundárias da primeira edição como autoridade canônica;
- qualquer outro erro aparente existente na página;
- resolução do conflito da carga `0005`.

Os números excluídos poderão permanecer visíveis na fonte durante a revisão, mas não integram o caso `0006`.

## Limitações preservadas

- A página atual não oferece ao público um histórico completo de revisões nem o corpo integral da primeira versão.
- A afirmação inicial é reconstruída pela nota oficial que declara a troca e informa o par correto.
- Reproduções secundárias corroboram essa reconstrução, mas não substituem a fonte primária.
- A correção valida a atribuição publicada pela ABVE; não constitui auditoria independente da base de emplacamentos.
- A seleção não confirma a metodologia de coleta subjacente nem compara os números com uma base primária da Fenabrave ou do órgão de trânsito.
- A classificação de veículos eletrificados usada em 2024 não deve ser confundida com a metodologia principal adotada pela ABVE a partir de janeiro de 2025.
- O mesmo número pode estar rejeitado para uma geografia e válido para outra; o estado nunca deve ser interpretado sem o escopo do valor.

## Adequação à decisão do sexto ciclo

| Requisito | Avaliação |
| --- | --- |
| Um único conflito quantitativo | Atendido pelo recorte estadual |
| Mesma métrica, período, unidade e geografia | Atendido |
| Proveniência reconstruível | Atendida pela página e pela nota oficial, sujeita à revisão |
| Resolução autoritativa | Atendida pela correção da própria ABVE |
| Tipo de resolução distinguível | Correção material de atribuição geográfica |
| Valor histórico preservável | `24435`, restrito ao escopo estadual incorreto |
| Valor vigente identificável | `56819` para o Estado de São Paulo em 2024 |
| Ausência de tolerância ou preferência editorial | Atendida |
| Necessidade de modelagem demonstrada | Versões de conteúdo, resolução e transições ainda não são estruturadas |
| Elegibilidade para carga imediata | Não; exige decisão de modelagem e eventual migration antes |

O candidato atende ao objetivo factual do sexto ciclo e revela uma lacuna estrutural concreta. O aceite desta seleção autorizará somente a preparação da decisão de modelagem.

## Próxima etapa condicionada

Depois de `ACCEPTED` e do merge desta seleção, preparar uma decisão separada que compare o caso com o schema atual e proponha a menor representação necessária.

Essa próxima etapa não poderá criar a carga `0006`. Se concluir pela necessidade de alterar o schema, migration, validação descartável, revisão, aplicação e resultado ocorrerão em PRs próprios antes da carga canônica.

## Perguntas para revisão

### Factuais

1. A página oficial identifica claramente a ABVE, o título, a data de 6 de janeiro de 2025 e a URL?
2. A nota oficial declara que os números de São Paulo nos rankings estadual e municipal estavam trocados na primeira edição?
3. A nota declara `56.819` como o número correto do Estado de São Paulo e `24.435` como o número correto da cidade?
4. Está suficientemente sustentado que a primeira edição atribuiu `24.435` ao estado, mesmo que o corpo incorreto não permaneça visível na página atual?
5. O ranking selecionado trata de emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024?
6. A ABVE informa que a correção foi feita em 7 de janeiro de 2025, às 18h12?

### Metodológicas

7. Está correto limitar a carga futura ao conflito estadual e usar o valor municipal apenas como contexto da troca?
8. Está correto classificar o caso como correção material de atribuição geográfica, e não revisão metodológica, atualização de cobertura ou nova medição?
9. Está correto propor `24435` como candidato a `rejected` somente no escopo estadual e `56819` como candidato a `validated` nesse mesmo escopo?
10. Está claro que a correção confirma o que a ABVE passou a publicar, mas não representa auditoria independente da base subjacente?
11. A definição candidata preserva adequadamente período, geografia, unidade e a classificação de eletrificados usada na publicação?
12. Está correto impedir a reutilização automática dessa definição em publicações posteriores à mudança metodológica de janeiro de 2025?

### Operacionais

13. Está correto exigir representação de versões da mesma página, em vez de atualizar um único item e apagar o estado inicial?
14. Os dez requisitos de modelagem identificados são suficientes para orientar a próxima decisão sem escolher antecipadamente uma estrutura?
15. O caso atende à decisão do sexto ciclo e pode avançar somente para a decisão de modelagem, sem migration, carga ou alteração no Supabase nesta etapa?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A seleção não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Pendente |
| Data da revisão | Pendente |
| Resultado | `PENDING` |
