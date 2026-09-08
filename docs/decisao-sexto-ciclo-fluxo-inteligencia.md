# Decisão: sexto ciclo do fluxo de inteligência

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento propõe o objetivo e os controles do sexto ciclo. Ele não seleciona um conflito, não escolhe um valor correto, não cria SQL, não altera o schema e não modifica dados no Supabase.

## Contexto

O [quinto ciclo](conclusao-quinto-ciclo-fluxo-inteligencia.md) validou a persistência de duas afirmações quantitativas conflitantes para a mesma métrica, período e geografia. Os valores `21061` e `21060` permanecem separados e `provisional`, com proveniência própria e provável linhagem comum.

Esse resultado demonstrou como preservar um desacordo sem apagá-lo. Ainda não demonstrou como registrar uma resolução posterior quando uma autoridade publica uma errata, revisão ou substituição explícita.

O sexto ciclo introduzirá somente essa dificuldade: **resolver manualmente um único conflito quantitativo a partir de evidência autoritativa e preservar todo o histórico da decisão**.

## Decisão proposta

O sexto ciclo selecionará um caso fechado que contenha:

1. duas ou mais afirmações quantitativas realmente conflitantes;
2. a mesma métrica, período, unidade, cobertura e geografia;
3. proveniência reconstruível para cada afirmação;
4. um documento posterior e autoritativo que corrija, revise ou substitua explicitamente uma delas;
5. informação suficiente para distinguir o valor vigente dos valores históricos.

O ciclo não resolverá o conflito pela preferência do ChargeBR. A mudança de estado deverá decorrer do documento de resolução e representar exatamente o alcance declarado nele.

O caso da carga `0005` só poderá ser usado se a ABVE ou a Tupi publicar esclarecimento ou correção explícita sobre `21061` e `21060`. Na ausência dessa evidência, a seleção deverá localizar outro conflito quantitativo já resolvido documentalmente.

## Por que uma publicação mais convincente não basta

Um valor pode ter soma interna consistente, aparecer mais vezes ou vir de publicação mais recente. Esses fatores aumentam ou reduzem o suporte documental, mas não provam que houve correção formal.

Para este ciclo, uma resolução autoritativa precisa responder, de forma expressa ou documentalmente inequívoca:

- qual afirmação anterior está sendo corrigida, revista ou substituída;
- qual valor passa a representar o resultado reconhecido pela fonte;
- se a mudança corrige erro material, altera método, atualiza cobertura ou produz nova medição;
- a partir de quando e para qual período a decisão vale;
- quem possui autoridade sobre a série ou dado publicado.

Sem essas respostas, o conflito continua preservado, mesmo que um dos valores pareça mais plausível.

## Vocabulário de resolução

Os estados existentes serão interpretados assim, sujeitos à validação do caso e da modelagem:

| Estado | Uso pretendido | Exigência mínima |
| --- | --- | --- |
| `provisional` | Afirmação preservada cujo mérito ainda não foi reconciliado | Proveniência da afirmação |
| `validated` | Valor reconhecido como vigente para o escopo depois da resolução | Documento autoritativo que o confirme ou estabeleça |
| `superseded` | Valor historicamente publicado que foi substituído por outro | Relação explícita com a decisão e com o sucessor |
| `rejected` | Valor que a autoridade declarou incorreto ou inaplicável ao escopo | Justificativa autoritativa específica |

`superseded` e `rejected` não são sinônimos. Um valor substituído pode ter sido correto sob uma versão metodológica anterior; um valor rejeitado foi declarado inválido para o escopo considerado. Se a fonte não permitir distinguir os dois significados, o ciclo deverá parar.

## Auditoria do modelo atual

A tabela `metric_values` já possui:

- o estado atual em `value_status`;
- os estados permitidos `provisional`, `validated`, `superseded` e `rejected`;
- `notes` em texto livre;
- `created_at` e `updated_at`.

Isso permite armazenar um rótulo atual, mas não basta para demonstrar uma transição auditável. O modelo atual não registra de forma estruturada:

- o estado anterior e o estado posterior de cada transição;
- o momento efetivo da resolução;
- o documento, a evidência ou o acontecimento que autorizou a mudança;
- a pessoa revisora e a decisão canônica correspondente;
- o motivo tipificado da mudança;
- a relação entre o valor substituído e seu sucessor;
- se a mudança decorreu de correção material, revisão metodológica, atualização de cobertura ou nova medição.

`updated_at` informa apenas quando a linha foi alterada. Ele não informa o que mudou nem por quê. `notes` pode complementar a leitura humana, mas não substituirá relações, estados anteriores ou proveniência estruturada.

Portanto, **nenhum valor existente poderá receber uma simples atualização de `value_status` durante o sexto ciclo**. Fazer isso apagaria a história do estado anterior e deixaria a resolução dependente de texto livre.

## Consequência para o schema

O ciclo não aprova antecipadamente uma tabela ou migration. Primeiro deverá existir um caso real aceito, porque seus documentos revelarão quais distinções precisam ser representadas.

Depois da seleção, uma decisão de modelagem separada deverá comparar os requisitos do caso com o schema atual. Se a lacuna for confirmada, essa decisão definirá a menor estrutura capaz de preservar:

- transições imutáveis de estado;
- ligação da resolução à evidência e ao acontecimento correspondentes;
- relação entre valores quando houver substituição;
- tipo e alcance da resolução;
- data da decisão e, quando diferente, data a partir da qual ela produz efeito;
- reconstrução do estado atual a partir do histórico;
- proteção contra transição sem origem, sucessor inexistente ou ciclo incoerente.

Qualquer migration será criada, revisada, aplicada e documentada em etapas próprias antes da preparação da carga canônica. Os nomes das tabelas, colunas e restrições não serão decididos neste documento.

## Diferenças que a seleção precisa preservar

### Correção material

A fonte declara que um número anterior continha erro e fornece o número corrigido para o mesmo escopo. O valor anterior poderá se tornar `rejected` ou `superseded`, conforme a linguagem e o efeito da correção.

### Revisão metodológica

A fonte recalcula o mesmo período usando método, cobertura ou classificação diferentes. Os dois números podem continuar válidos sob versões metodológicas distintas. A seleção não deverá tratá-los como simples erro e correção.

### Atualização de cobertura

A fonte incorpora registros atrasados ou amplia a base referente ao mesmo período. O novo valor pode substituir o provisório sem declarar que a publicação anterior estava errada.

### Nova medição

A fonte publica outro número para período ou recorte diferente. Isso não resolve o conflito anterior e deve ser tratado como novo valor, não como transição de estado.

Se o documento candidato não permitir classificar a situação com segurança, ele não será elegível.

## Representação histórica obrigatória

Uma resolução aceita deverá manter consultáveis:

1. todas as publicações originais;
2. todas as observações e evidências originais;
3. todos os valores numéricos exatamente como publicados;
4. os estados anteriores e posteriores;
5. o documento que resolveu o conflito;
6. a interpretação limitada do efeito desse documento;
7. a pessoa e a data da revisão humana;
8. a relação entre os valores, quando a fonte realmente a sustentar.

Nenhuma publicação, observação, evidência, acontecimento ou valor aceito poderá ser apagado, sobrescrito ou reescrito para fazer o histórico parecer coerente desde o início.

## Fluxo proposto

### 1. Seleção do caso

Pesquisar fontes primárias e preparar `docs/selecao-resolucao-conflito-0006.md` com:

- as afirmações conflitantes;
- o documento de resolução;
- a autoridade de quem o publicou;
- a equivalência dos escopos;
- a classificação da resolução;
- a cronologia completa;
- os valores e interpretações excluídos;
- as exigências de representação observadas no caso.

Nenhum SQL será criado nessa etapa.

### 2. Decisão de modelagem

Depois do aceite e do merge da seleção, comparar o caso com o schema atual em um documento separado. A análise deverá demonstrar campo a campo o que pode ser reutilizado e o que não pode ser representado.

Se não houver lacuna, a decisão explicará como o histórico permanece estruturado sem alteração. Se houver lacuna, definirá a menor mudança de schema necessária, sujeita a revisão própria.

### 3. Mudança estrutural, se necessária

Somente depois do aceite da decisão de modelagem poderá ser preparada uma migration. Ela deverá ser validada de forma descartável, preservar todos os registros existentes, manter RLS e privilégios coerentes e ser incorporada ao GitHub antes de qualquer aplicação no Supabase.

A aplicação da migration e seu resultado serão documentados separadamente.

### 4. Preparação da carga `0006`

Somente com o modelo necessário disponível, preparar:

- `data/canonical/0006_<identificador>.sql`;
- `data/canonical/0006_<identificador>.verify.sql`;
- `docs/revisao-carga-canonica-0006.md`.

A carga deverá ser idempotente, interromper diante de estado inesperado e nunca apagar registros históricos.

### 5. Validação e revisão

Executar a carga duas vezes em transação descartável e aplicar `ROLLBACK`. A verificação deverá reconstruir o conflito, a resolução, as transições e as cargas anteriores.

O pacote só poderá seguir depois de `ACCEPTED` expresso.

### 6. Persistência e resultado

Depois do merge do pacote aceito, executar no Supabase exatamente os arquivos incorporados à `main`. A persistência ocorrerá uma vez, entre `BEGIN` e `COMMIT`, seguida pela mesma verificação e por um PR de resultado.

## Interrupções obrigatórias

O sexto ciclo deverá parar quando:

- não existir documento autoritativo de resolução;
- a suposta correção apenas repetir um dos valores;
- a autoridade do documento sobre a série não estiver demonstrada;
- os valores medirem escopos diferentes;
- o caso depender de aritmética, tolerância, maioria, recência ou preferência editorial;
- não for possível distinguir correção, revisão metodológica, cobertura atualizada e nova medição;
- a resolução exigir apagar ou sobrescrever registros aceitos;
- o histórico depender somente de `notes` ou `updated_at`;
- a mudança de estado não puder ser ligada estruturalmente à sua evidência;
- o caso exigir resolver mais de um conflito independente;
- uma migration for necessária, mas ainda não tiver decisão, revisão, aplicação e resultado próprios;
- qualquer carga canônica anterior não permanecer integralmente protegida.

Uma interrupção não autoriza simplificar o caso ou registrar a resolução apenas em documentação.

## Critérios de sucesso

O sexto ciclo será concluído quando:

1. um único conflito quantitativo e sua resolução autoritativa forem confirmados por revisão humana;
2. as afirmações conflitantes forem realmente comparáveis;
3. o tipo e o alcance da resolução estiverem documentados;
4. todas as afirmações originais permanecerem consultáveis;
5. cada transição de estado possuir origem, motivo, data e revisão reconstruíveis;
6. qualquer relação de substituição estiver explícita e acíclica;
7. o valor vigente puder ser identificado sem apagar os valores históricos;
8. nenhuma decisão depender de tolerância, soma, maioria ou preferência do ChargeBR;
9. o schema e todas as cargas anteriores permanecerem protegidos;
10. a execução e seu resultado forem documentados e aceitos.

## Fora do escopo

- resolver automaticamente conflitos;
- escolher o valor mais provável sem correção autoritativa;
- adotar margem de cinco ou outra tolerância;
- revisar todos os conflitos já registrados;
- alterar a carga `0005` sem nova evidência elegível;
- atualizar estados diretamente antes de existir histórico estruturado;
- calcular média, crescimento, tendência ou indicador derivado;
- auditar a base primária da organização publicadora;
- processar mais de um conflito;
- coleta recorrente, classificação automática ou pontuação de fontes;
- interface pública, alerta, newsletter ou produto pago;
- retomar a carga `0004` sem nova publicação elegível;
- importar dados do piloto ou do Notion.

## Próxima etapa após esta decisão

Depois do merge desta decisão, pesquisar um único caso quantitativo já resolvido por fonte autoritativa e preparar `docs/selecao-resolucao-conflito-0006.md`. A pesquisa poderá avaliar o caso da carga `0005`, mas deverá descartá-lo se continuar sem correção explícita.

Nenhuma migration, carga canônica ou alteração no Supabase será realizada durante a seleção.

## Perguntas para revisão

1. Está correto limitar o sexto ciclo à resolução manual de um único conflito quantitativo?
2. Está correto exigir correção, revisão ou substituição autoritativa, sem escolher o valor por plausibilidade?
3. A distinção entre `validated`, `superseded` e `rejected` está suficientemente clara para orientar a seleção?
4. Está correto concluir que `value_status`, `notes` e `updated_at`, isoladamente, não preservam uma transição auditável?
5. Está correto proibir a atualização direta dos valores existentes antes de haver histórico estruturado?
6. A separação entre seleção do caso, decisão de modelagem, eventual migration e carga canônica mantém as etapas pequenas e revisáveis?
7. Está correto decidir a estrutura somente depois de observar os requisitos de um caso real aceito?
8. A distinção entre correção material, revisão metodológica, atualização de cobertura e nova medição impede falsas resoluções?
9. Está correto manter a carga `0005` inalterada enquanto não houver esclarecimento explícito da ABVE ou da Tupi?
10. As interrupções e os critérios de sucesso protegem o histórico e impedem resolução por tolerância, aritmética, maioria ou preferência editorial?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 8 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A pesquisa e a seleção do caso `0006` só poderão começar depois que esta versão aceita estiver incorporada à `main`.
