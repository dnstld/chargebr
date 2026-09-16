# Decisão: source canônica da ANEEL

## Estado e escopo

`PROPOSTA PARA REVISÃO`

Este documento define somente a identidade editorial da ANEEL em `public.sources`. Não cria ou seleciona `source_endpoints`, não decide regras de coleta e não altera schema, migration, Supabase ou dados.

As páginas oficiais citadas foram inspecionadas em 15 de setembro de 2026.

## Decisão

A source deve representar a **Agência Nacional de Energia Elétrica — ANEEL**, autoridade que publica, emite ou mantém o conteúdo, e não um de seus sistemas ou uma unidade interna.

A própria Agência se identifica como autarquia em regime especial vinculada ao Ministério de Minas e Energia, criada para regular o setor elétrico brasileiro. O catálogo de dados abertos atribui seus conjuntos à organização “Agência Nacional de Energia Elétrica”; no conjunto já selecionado pelo ChargeBR, `SGE/ANEEL` aparece como autor e `CEGDI/ANEEL` como mantenedor. Diretoria, SGE e CEGDI são, portanto, unidades ou papéis internos, não publicadores canônicos independentes para este cadastro.

O Portal de Dados Abertos também não deve ser uma source separada. Ele é um produto de publicação da Agência e declara disponibilizar dados produzidos ou custodiados pela ANEEL. Essa decisão segue a separação já adotada para a ABVE: a entidade ou canal institucional permanece uma source única, enquanto produtos e locais concretos de publicação não multiplicam o publicador.

## Homepage e superfícies oficiais

`https://www.gov.br/aneel/pt-br` é a homepage canônica porque é a entrada institucional corrente, identifica a Agência pelo nome completo e reúne notícias, estrutura, competências, serviços e links para superfícies especializadas. `https://dadosabertos.aneel.gov.br` cobre apenas o produto de dados abertos e, por isso, não representa sozinho toda a source.

Conteúdo publicado em `gov.br/aneel` e em domínios ou subdomínios oficiais da Agência — por exemplo `dadosabertos.aneel.gov.br`, `www2.aneel.gov.br`, `biblioteca.aneel.gov.br` e `reuniaodiretoria.aneel.gov.br` — pode pertencer à mesma source `aneel`. Cada URL futura ainda deverá ter sua vinculação institucional verificada; pertencer ao namespace `aneel.gov.br` é evidência forte, mas não substitui a atribuição do conteúdo. Mudanças de domínio ou de sistema não criam outra source. Plataformas externas apenas referenciadas pela ANEEL não são incorporadas automaticamente a ela.

## Classificação e natureza primária

`government_regulator` é a classificação adequada: regular, fiscalizar, estabelecer tarifas, decidir divergências administrativas e promover outorgas estão entre as atribuições oficiais da Agência. A vinculação ao Ministério de Minas e Energia não transfere a autoria institucional ao Ministério nem exige uma source por diretoria.

`is_primary_source = true` registra uma capacidade da fonte, não uma garantia sobre todo item. Atos, decisões, dados, comunicados e documentos produzidos, emitidos ou custodiados pela própria ANEEL podem sustentar evidência primária sobre o que a Agência decidiu, publicou ou mantém. Material de terceiros reproduzido em um canal da ANEEL continua sujeito à avaliação de proveniência do item.

`publisher_group = null` porque o ChargeBR ainda não possui uma semântica canônica suficientemente definida para o campo em fontes institucionais ou governamentais. O valor não deve ser inferido de fixture ou piloto. Ele permanecerá vazio até uma decisão própria estabelecer sua finalidade e granularidade, sem alterar que a source representa a ANEEL e não o Ministério de Minas e Energia.

Não há motivo documental para adiar o cadastro. A identidade, a natureza institucional, a homepage e a autoria do portal de dados estão confirmadas por páginas oficiais, e a fundação do pipeline já trata a ausência dessa source como pré-requisito. A persistência, porém, depende de aceite desta decisão e deve ocorrer isoladamente.

## Registro proposto completo

| Campo | Valor proposto |
| --- | --- |
| `name` | `ANEEL` |
| `slug` | `aneel` |
| `homepage_url` | `https://www.gov.br/aneel/pt-br` |
| `source_type` | `government_regulator` |
| `status` | `approved` |
| `country_code` | `BR` |
| `language_codes` | `['pt-BR', 'en']` |
| `is_primary_source` | `true` |
| `publisher_group` | `null` |
| `notes` | `Fonte institucional da Agência Nacional de Energia Elétrica em seus domínios e subdomínios oficiais, inclusive o Portal de Dados Abertos; a natureza primária depende de o conteúdo ter sido produzido, emitido ou custodiado pela própria Agência.` |

O nome curto segue o padrão da source `ABVE`: preserva a denominação institucional reconhecida, enquanto as notas explicitam o nome completo da Agência. O valor nulo do grupo publicador é deliberado e não representa dúvida sobre a identidade do publicador.

## Evidências utilizadas

- [Homepage institucional da ANEEL](https://www.gov.br/aneel/pt-br): identifica a Agência e liga, no mesmo portal, suas áreas institucionais e superfícies especializadas, inclusive Dados Abertos, Biblioteca Virtual e sistemas em subdomínios `aneel.gov.br`.
- [A ANEEL](https://www.gov.br/aneel/pt-br/acesso-a-informacao/institucional/a-aneel): declara que a Agência é autarquia em regime especial vinculada ao Ministério de Minas e Energia, criada para regular o setor elétrico, e enumera suas atribuições regulatórias e fiscalizatórias.
- [Histórico institucional](https://www.gov.br/aneel/pt-br/acesso-a-informacao/institucional/historico): registra a instituição da ANEEL pela Lei nº 9.427/1996, sua finalidade regulatória e fiscalizatória e sua estrutura aprovada pelo Decreto nº 2.335/1997.
- [Homepage institucional em inglês](https://www.gov.br/aneel/en): mantém uma seção oficial, ainda que resumida, publicada em inglês; sustenta `en` junto de `pt-BR` em `language_codes`.
- [Sobre o Portal de Dados Abertos](https://dadosabertos.aneel.gov.br/about): atribui à própria ANEEL o Plano de Dados Abertos e declara que o portal disponibiliza dados produzidos ou custodiados pela Agência.
- [Organização ANEEL no Portal de Dados Abertos](https://dadosabertos.aneel.gov.br/organization/agencia-nacional-de-energia-eletrica): agrupa os conjuntos sob “Agência Nacional de Energia Elétrica”, confirmando que o portal não é um publicador distinto.
- [Pautas e Atas das Reuniões Públicas da Diretoria](https://dadosabertos.aneel.gov.br/dataset/pautas-e-atas-das-reunioes-publicas-da-diretoria): atribui o conjunto à Agência e distingue `SGE/ANEEL` como autor e `CEGDI/ANEEL` como mantenedor, ambos internos à mesma source.
- Evidência interna: `supabase/migrations/20260831123209_sources.sql` define os vocabulários dos campos e permite `publisher_group` nulo; `data/canonical/0003_abve-bev-emplacamentos-julho-2026.sql` demonstra source aprovada com nome curto e produto institucional reunidos; `docs/fundacao-pipeline-coleta-v1.md` exige uma source ANEEL anterior a qualquer endpoint.

## Riscos ou ambiguidades

- `publisher_group` não possui semântica ou granularidade canônica suficiente para fontes institucionais ou governamentais. Mantê-lo nulo evita transformar um fixture de piloto em regra; uma decisão futura poderá defini-lo separadamente.
- A seção inglesa é oficial e atual, porém resumida. `en` registra idioma efetivamente publicado, sem prometer paridade de cobertura com `pt-BR`.
- Os domínios e sistemas da ANEEL podem ser migrados ou descontinuados. A homepage identifica a source; não funciona como lista permanente de endpoints autorizados.
- `is_primary_source = true` pode ser interpretado de forma ampla demais se for separado das notas. A natureza primária precisa continuar sendo avaliada por conteúdo e por afirmação.
- Esta decisão não cria uma organização ANEEL em outra tabela nem modela a relação administrativa com o Ministério de Minas e Energia.

## Critérios de aceite

1. A revisão confirma que a Agência Nacional de Energia Elétrica, e não o Portal de Dados Abertos, a Diretoria, a SGE, a CEGDI ou um domínio, é o publicador canônico.
2. O registro proposto satisfaz integralmente as constraints atuais de `public.sources`.
3. A homepage institucional corrente representa melhor a source inteira do que qualquer produto especializado.
4. `government_regulator`, `BR`, `['pt-BR', 'en']` e `is_primary_source = true` permanecem sustentados pelas evidências oficiais e pelas ressalvas documentadas.
5. `publisher_group = null` é preservado até uma decisão própria definir a semântica e a granularidade do campo para fontes institucionais ou governamentais.
6. Todos os domínios, subdomínios, portais e unidades internas permanecem subordinados à mesma source, sem criação de `source_endpoints` neste PR.
7. O diff contém apenas este documento e sua entrada em `docs/README.md`, sem SQL, migration, schema, Supabase, dados ou código.

## Próximo passo após o aceite

Se esta decisão for aceita, o próximo passo será **um PR separado para persistir exclusivamente a source ANEEL** com o registro acima. Esse PR não deverá criar endpoints, execuções de coleta ou coletor.
