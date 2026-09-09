# Seleção da revisão metodológica `0007`

## Estado

`INTERROMPIDA — EM REVISÃO`

Este documento registra uma pesquisa sem caso elegível para o [sétimo ciclo do fluxo de inteligência](decisao-setimo-ciclo-fluxo-inteligencia.md). A pesquisa confirmou mudanças metodológicas relevantes à eletromobilidade brasileira, mas não localizou, nas fontes primárias examinadas, um par que demonstre simultaneamente um valor anterior corrente e sua substituição por outro valor para o mesmo período, unidade, geografia e pergunta conceitual.

A interrupção evita marcar como `superseded` um número que nunca foi a representação corrente da série e evita calcular um valor revisado que a própria mantenedora não publicou. Esta etapa não cria SQL, não decide mudança de schema e não consulta nem modifica o Supabase.

## Parâmetros da pesquisa

| Campo | Valor |
| --- | --- |
| Data da pesquisa | 9 de setembro de 2026 |
| Tema principal | Classificação dos veículos leves eletrificados pela ABVE Data |
| Geografia obrigatória | Brasil |
| Objeto procurado | Um valor quantitativo anterior e outro revisado para o mesmo recorte |
| Fonte obrigatória | Publicação primária da mantenedora da série |
| Revisão obrigatória | Mudança declarada de método ou classificação, sem erro material |
| Resultado | Nenhum par elegível localizado |
| Regra aplicada | Interromper sem forçar `superseded`, série paralela ou valor derivado |

A pesquisa concentrou-se na ABVE Data porque a associação mantém uma série diretamente relacionada ao mercado brasileiro de veículos eletrificados e publicou uma explicação explícita de mudança de classificação. Como conferência adicional, foi examinada a atualização metodológica do E-BUS RADAR/ICCT para emissões evitadas por ônibus elétricos.

## Candidato principal: mudança da classificação da ABVE Data

A ABVE anunciou no balanço de 2024 e formalizou em fevereiro de 2025 uma nova classificação para suas estatísticas principais de veículos leves eletrificados.

Pelo critério adotado a partir de janeiro de 2025, o total principal passou a reunir BEV, PHEV, HEV e HEV Flex. Os micro-híbridos MHEV de 12 V e 48 V deixaram de integrar esse total, embora continuassem divulgados separadamente.

Essa é uma **revisão metodológica real e autoritativa**. O impedimento não está na existência da mudança, mas na relação documental entre os valores disponíveis.

## Fontes primárias examinadas

### Balanço de 2024 e anúncio da mudança

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024 |
| Data exibida | 6 de janeiro de 2025 |
| URL | <https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/> |
| Papel | Publica os números de 2024 e anuncia a mudança a partir de janeiro de 2025 |

A página apresenta:

- `177.358` veículos leves eletrificados emplacados no Brasil entre janeiro e dezembro de 2024;
- `173.530` no mesmo período depois da exclusão de `3.828` micro-híbridos recém-lançados no último trimestre;
- `16.185` MHEV no quadro anual por tecnologia;
- a classificação então usada, que incluía BEV, PHEV, HEV, HEV Flex e MHEV;
- o anúncio de que, a partir dos números de janeiro de 2025, os requisitos passariam a considerar voltagem da bateria, tração elétrica, potência e contribuição à redução de emissões;
- a continuidade da publicação de todas as categorias híbridas em tabelas separadas.

### Formalização e primeiro resultado da classificação nova

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números |
| Data exibida | 10 de fevereiro de 2025 |
| URL | <https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/> |
| Papel | Define a classificação nova e publica o resultado de janeiro de 2025 |

A página declara:

- `12.556` eletrificados leves em janeiro de 2025 pela classificação nova;
- `16.502` como total que seria obtido pelo critério anterior, incluindo MHEV;
- `3.946` MHEV no mês, dos quais `2.883` de 12 V e `1.063` de 48 V;
- exclusão dos MHEV do total principal para acompanhar a evolução da eletromobilidade;
- início da nova série histórica naquele mês;
- permanência dos MHEV em quadros separados.

O par é aritmeticamente verificável dentro da própria página: `12.556 + 3.946 = 16.502`. Essa igualdade apenas confirma a transcrição e o efeito quantitativo da classificação; ela não transforma `16.502` em um valor corrente anterior.

### Uso posterior do resultado de janeiro de 2025

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Eletrificados leves atingem 15% de participação de mercado em janeiro |
| Data exibida | 9 de fevereiro de 2026 |
| URL | <https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/> |
| Papel | Confirma `12.556` como referência histórica de janeiro de 2025 sob os critérios vigentes |

Ao comparar janeiro de 2026 com janeiro de 2025, a ABVE reutiliza `12.556`. A mesma página reafirma que, pelos critérios vigentes desde janeiro de 2025, MHEV não são considerados eletrificados no total principal.

Essa evidência sustenta qual valor integra a série nova. Ela não demonstra que `16.502` tenha integrado a série antiga como resultado corrente antes de ser substituído.

### Uso posterior do total de 2024

| Campo | Valor observado |
| --- | --- |
| Publicador | Associação Brasileira do Veículo Elétrico — ABVE |
| Título | Eletrificados crescem dez vezes mais do que o conjunto do mercado, e vendas chegam a 224 mil veículos em 2025 |
| Data exibida | 6 de janeiro de 2026 |
| URL | <https://abve.org.br/eletrificados-crescem-dez-vezes-mais-do-que-conjunto-do-mercado-em-2025-com-224-mil-veiculos-vendidos/> |
| Papel | Mostra que a ABVE continua usando `177.358` como total histórico de 2024 |

Embora defina os eletrificados de 2025 como BEV, PHEV, HEV e HEV Flex, excluindo MHEV, a publicação compara `223.912` em 2025 com `177.358` em 2024. Portanto, a fonte não trata `173.530` — nem outro total recalculado — como substituto corrente e inequívoco de `177.358` para 2024.

## Por que `16.502` não pode ser marcado como `superseded`

O par de janeiro de 2025 preserva a mesma:

- pergunta conceitual geral: quantidade de emplacamentos que seriam classificados como eletrificados;
- unidade: emplacamentos de veículos leves;
- geografia: Brasil;
- período: janeiro de 2025.

Também identifica claramente os dois critérios. Apesar disso, `16.502` aparece pela primeira vez na mesma publicação que apresenta `12.556`, formulado como o total que **seria** obtido pelo critério anterior.

Não foi localizada uma publicação anterior da ABVE que tivesse apresentado `16.502` como valor corrente de janeiro de 2025. Ao contrário, a ABVE afirma que a série histórica nova começa naquele mês.

Assim:

- `12.556` é o resultado corrente publicado sob a metodologia nova;
- `16.502` é uma comparação contrafactual calculada pela própria ABVE sob o critério antigo;
- a diferença metodológica é autoritativa;
- não existe transição documental de `16.502` como valor corrente para `12.556` como substituto;
- marcar `16.502` como `superseded` inventaria um estado histórico que a fonte não publicou.

O valor contrafactual pode ser relevante como afirmação metodológica da fonte, mas isso é diferente de representar a substituição de um valor anteriormente corrente.

## Por que `177.358` e `173.530` não formam o par revisado

À primeira vista, os dois totais anuais de 2024 parecem oferecer a versão antiga e a nova. A leitura integral da página mostra que essa conclusão não é sustentável.

O valor `173.530` exclui somente os `3.828` micro-híbridos de 12 V recém-lançados no último trimestre. A classificação formalizada em fevereiro de 2025, porém, exclui do total principal os MHEV de 12 V **e** 48 V.

A própria tabela anual informa `16.185` MHEV em 2024. Logo, `173.530` não representa uma aplicação integral e demonstrada do critério que passaria a vigorar em janeiro de 2025.

Além disso, a ABVE voltou a usar `177.358` em janeiro de 2026 como referência para 2024. Não há declaração de que `173.530` substituiu `177.358` como representação corrente daquele ano.

Seria possível somar BEV, PHEV, HEV e HEV Flex publicados na tabela de 2024 para produzir outro total. O ChargeBR não fará isso nesta seleção porque:

- a ABVE não publicou esse resultado como revisão oficial do total anual;
- a soma seria um valor derivado pelo ChargeBR;
- a tabela possui irregularidades de arredondamento e totalização que exigiriam interpretação adicional;
- a decisão do ciclo proíbe usar aritmética para preencher a falta de uma resolução autoritativa.

## Classificação correta do candidato

| Possibilidade | Avaliação |
| --- | --- |
| `material_correction` | Não; a ABVE declara mudança de classificação, não erro no valor antigo |
| `methodology_revision` | Sim, para a mudança aplicada a partir de janeiro de 2025 |
| `superseded` para `16.502` | Não demonstrado; o valor antigo é contrafactual, não um resultado corrente anterior |
| `superseded` para `177.358` | Não demonstrado; a ABVE continua reutilizando esse total para 2024 |
| Séries paralelas | Parcialmente; MHEV continuam publicados separadamente, mas a fonte não mantém `16.502` como série agregada paralela |
| Revisão retroativa de 2024 | Não demonstrada integralmente |
| Mudança prospectiva | Demonstrada a partir de janeiro de 2025 |
| Caso elegível para a carga `0007` | Não, porque falta o valor corrente anterior posteriormente substituído |

O candidato ensina uma distinção importante: **um valor calculado sob o critério anterior não é automaticamente um valor anterior da série**. Para existir `superseded`, é necessário demonstrar o papel corrente que o valor exercia antes da revisão.

## Conferência adicional: E-BUS RADAR/ICCT

Também foi examinada a publicação [Quantificação das emissões de gases de efeito estufa evitadas por ônibus elétricos na América Latina: uma metodologia simplificada de avaliação do ciclo de vida](https://theicct.org/publication/pt-quantifying-avoided-ghg-emissions-by-e-buses-in-latin-america-aug24/), publicada pelo ICCT em 7 de agosto de 2024.

O documento apresenta uma atualização metodológica real para o E-BUS RADAR. O cálculo passa a considerar o ciclo de vida, incluindo fabricação do veículo e da bateria, manutenção e produção de combustível e eletricidade, com parâmetros específicos por país.

Entretanto, a documentação examinada não publica, para um mesmo período e recorte brasileiro, um valor anterior corrente e outro recalculado sob o método novo. Ela explica o método atualizado e apresenta resultados novos, mas não preserva o par quantitativo necessário para decidir uma transição para `superseded`.

A nota de 23 de agosto de 2024 sobre coeficientes de biodiesel é uma correção de valores na tabela metodológica. Ela não foi usada porque uma correção material está fora da dificuldade definida para este ciclo.

## Resultado da seleção

**Nenhum caso foi selecionado para modelagem ou carga canônica `0007`.**

A ABVE oferece a mudança metodológica mais próxima dos requisitos, mas os pares disponíveis falham por razões diferentes:

1. `16.502` e `12.556`, janeiro de 2025: mesmo recorte e critérios identificáveis, porém o primeiro é contrafactual e nunca aparece como valor corrente anterior;
2. `177.358` e `173.530`, ano de 2024: o segundo não aplica integralmente a classificação posterior e não substitui o primeiro na prática editorial subsequente da ABVE;
3. qualquer total anual de 2024 obtido pela soma das categorias aceitas em 2025: não foi diretamente publicado como revisão pela mantenedora e seria derivado pelo ChargeBR;
4. resultados do E-BUS RADAR: método novo identificado, mas sem par antigo e revisado para o mesmo recorte brasileiro nas fontes primárias examinadas.

Prosseguir exigiria inventar uma cronologia, inferir uma substituição ou calcular um valor não publicado. As três ações são proibidas pela decisão aceita do sétimo ciclo.

## Motivo da interrupção obrigatória

A decisão do ciclo determina a parada quando:

- não houver valor quantitativo anterior e revisado para o mesmo recorte;
- a mudança for apenas prospectiva sem substituir o valor anterior selecionado;
- não estiver claro se a série antiga foi substituída ou mantida em paralelo;
- a decisão depender de aritmética ou interpretação não declarada pela autoridade.

O candidato da ABVE aciona todas essas cautelas. A mudança é prospectiva; o único par exato para janeiro nasce junto; o total anual intermediário não corresponde integralmente ao critério novo; e a fonte continua reutilizando o total antigo de 2024.

A interrupção não rejeita a metodologia da ABVE nem afirma que algum número esteja errado. Ela apenas reconhece que a evidência disponível não sustenta a transição histórica exigida pelo teste `0007`.

## Efeito sobre o repositório e o banco

Esta etapa acrescenta somente este registro documental e seu vínculo no índice.

Não serão criados:

- decisão de modelagem do caso `0007`;
- migration ou alteração de schema;
- arquivo SQL de carga;
- consulta de verificação;
- fonte, publicação, observação, evidência, acontecimento ou valor métrico;
- resolução ou transição de estado;
- alteração no seed.

O Supabase não foi consultado nem modificado. Todas as cargas anteriores permanecem inalteradas.

## Condições para retomar a seleção

A seleção poderá ser retomada quando uma fonte primária diretamente relevante à eletromobilidade brasileira publicar evidência que satisfaça simultaneamente:

1. um valor anterior que tenha exercido o papel de resultado corrente da série;
2. um valor revisado para a mesma pergunta conceitual, período, unidade e geografia;
3. identificação do método ou classificação de cada valor;
4. declaração da mantenedora de que houve mudança metodológica, não erro material;
5. indicação de qual método passa a orientar a série corrente;
6. relação explícita entre o valor anterior e o revisado;
7. clareza sobre aplicação prospectiva, retroativa ou ambas;
8. preservação documental suficiente para reconstruir as duas versões sem cálculo próprio;
9. evidência sobre substituição da versão anterior ou manutenção de séries paralelas;
10. ausência de dependência de fonte secundária, tolerância, preferência ou recência.

Uma nova pesquisa deverá substituir esta interrupção somente depois de confirmar todos esses pontos. Não será suficiente encontrar outra mudança de metodologia sem o par quantitativo e a cronologia exigidos.

## Perguntas para revisão

### Factuais

1. A publicação de 10 de fevereiro de 2025 apresenta `12.556` pela classificação nova, `16.502` pelo critério anterior e `3.946` MHEV para janeiro de 2025?
2. A ABVE declara que a série sob a classificação nova começa em janeiro de 2025 e que os MHEV continuam divulgados separadamente?
3. A publicação de 9 de fevereiro de 2026 reutiliza `12.556` como referência para janeiro de 2025 sob os critérios vigentes?
4. A publicação anual de janeiro de 2026 continua usando `177.358` como referência de 2024, mesmo ao definir o total de 2025 sem MHEV?
5. O documento do ICCT apresenta metodologia atualizada de ciclo de vida, mas não fornece o par antigo e revisado necessário para o mesmo recorte brasileiro?

### Metodológicas

6. Está correto não tratar `16.502` como `superseded`, já que ele aparece como contrafactual na mesma publicação do resultado corrente `12.556`?
7. Está correto não tratar `173.530` como aplicação integral da classificação nova a 2024, pois ele exclui apenas `3.828` dos `16.185` MHEV informados no ano?
8. Está correto não derivar um novo total anual de 2024 pela soma das categorias, já que a ABVE não o publicou como revisão corrente?
9. A interrupção distingue adequadamente mudança metodológica real de substituição documental de um valor corrente?
10. As condições de retomada impedem que uma futura seleção dependa de cronologia inventada, aritmética própria ou fonte secundária?

### Operacionais

11. Está correto não iniciar decisão de modelagem, migration, carga `0007` ou consulta ao Supabase sem um caso elegível?
12. Está correto manter o sétimo ciclo interrompido e retomar a pesquisa somente quando surgir evidência primária que satisfaça todos os requisitos?

Se todas as respostas forem `sim`, registre `ACCEPTED`. O aceite confirmará que a interrupção foi corretamente documentada; ele não autorizará modelagem, SQL ou persistência da carga `0007`.

Se alguma resposta for `não`, indique o número e a correção necessária. Este documento não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | — |
| Data da revisão | — |
| Resultado | `PENDING` |
