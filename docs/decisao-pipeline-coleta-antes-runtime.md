# Decisão: pipeline de coleta antes do runtime

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento substitui a decisão de escolher agora o runtime do primeiro backend interno. A nova prioridade do ChargeBR é construir e validar o pipeline de coleta antes de selecionar hospedagem, backend ou forma definitiva de execução.

Esta etapa é somente documental. Ela não cria tabelas, migrations, código, credenciais ou infraestrutura e não altera o Supabase nem os dados canônicos.

## Resultado proposto

O ChargeBR seguirá uma direção **collection-first**:

```text
fontes conhecidas
  → endpoints de coleta
  → execuções registradas
  → conteúdo identificado e deduplicado
  → observações candidatas
  → revisão humana
  → persistência canônica em etapa posterior
```

A escolha de runtime e backend fica adiada. Ela será retomada somente quando o coletor manual e os primeiros conectores revelarem requisitos reais de frequência, duração, bibliotecas, memória, rede, concorrência, segredos e observabilidade.

## O que acontece com a fronteira privada `0001`

A fronteira instalada continua válida e inalterada. Seu login operacional permanecerá assim:

```text
chargebr_backend_methodology_0001
  LOGIN
  PASSWORD NULL
  limite de 5 conexões
```

Nenhuma senha ou connection string será criada. A identidade continuará sem uso operacional até existir um backend concreto e uma nova decisão de ativação.

O login `chargebr_backend_methodology_0001` não será reutilizado para a coleta. Ele foi desenhado para executar somente o contrato privado `0001`; um coletor futuro terá necessidades diferentes e deverá receber identidade e privilégios próprios em decisão separada.

## Por que coleta antes de hospedagem

Escolher uma plataforma agora exigiria supor características que ainda não foram medidas:

- quanto tempo cada fonte leva para ser coletada;
- se os conectores precisam apenas de HTTP ou também de navegador;
- quais formatos aparecem em cada fonte;
- qual volume precisa ser preservado por execução;
- com que frequência uma fonte muda;
- como revisões e correções são detectadas;
- quanta memória e CPU a extração exige;
- quais falhas precisam de repetição;
- quais segredos realmente existem;
- se o processo deve ser curto, persistente ou distribuído.

O pipeline manual permitirá observar essas propriedades antes de comparar Cloud Run, Edge Functions, workers persistentes ou outra plataforma. Assim, a futura escolha de runtime responderá ao trabalho real, não a uma arquitetura imaginada.

## Objetivo da próxima fase

A próxima fase deverá provar um caminho mínimo e reproduzível entre um endereço de fonte e uma observação pronta para revisão humana.

Ela terá seis componentes:

1. `source_endpoints`;
2. `collection_runs`;
3. coletor manual e local;
4. conectores iniciais para ABVE e ANEEL;
5. deduplicação e idempotência;
6. extração de `observations` com revisão humana.

Esses componentes serão decididos e implementados em PRs pequenos. Este documento define a ordem e os limites; não antecipa o schema ou o código.

## `source_endpoints`

`sources` representa quem publica ou mantém informação. `source_endpoints` representará onde e como o ChargeBR procura material nessa fonte.

Exemplos conceituais:

```text
fonte ABVE
  → página de notícias
  → publicação específica
  → feed, índice ou outra rota disponível

fonte ANEEL
  → página de notícias
  → pesquisa de atos ou documentos
  → conjunto de dados ou serviço oficial disponível
```

A futura decisão de modelagem deverá avaliar, sem definir colunas antecipadamente:

- identificador estável do endpoint;
- relação obrigatória com `sources`;
- endereço e tipo de acesso;
- situação ativa, pausada ou indisponível;
- frequência apenas sugerida, sem agenda automática;
- regras de retenção e limites da fonte;
- última coleta conhecida e próximo ponto de continuação, quando aplicável;
- configuração pública separada de qualquer segredo;
- notas sobre termos de uso, robots, rate limits e limitações técnicas.

Um endpoint não será confundido com `content_items`. O endpoint descreve o local observado; o item de conteúdo representa uma publicação ou documento específico encontrado ali.

## `collection_runs`

`collection_runs` registrará cada tentativa de coleta, inclusive quando ela falhar ou não encontrar conteúdo novo.

O registro conceitual deverá permitir reconstruir:

- qual endpoint foi consultado;
- quando a execução começou e terminou;
- quem ou qual processo a iniciou;
- qual versão do coletor foi usada;
- se terminou com sucesso, falha, resultado parcial ou nenhuma mudança;
- quantos itens foram encontrados, novos, repetidos, alterados ou rejeitados;
- qual cursor ou janela temporal foi usada;
- quais hashes e identificadores sustentam a deduplicação;
- qual erro ocorreu, sem guardar segredo ou conteúdo sensível no log;
- se a saída foi encaminhada para revisão humana.

Execuções repetidas não deverão ser apagadas como duplicatas. Elas são acontecimentos operacionais distintos. A idempotência deverá impedir efeitos duplicados nos conteúdos e observações produzidos, preservando o histórico de cada tentativa.

## Coletor manual e local

O primeiro coletor será executado manualmente em ambiente local controlado. Ele deverá ser pequeno, inspecionável e reproduzível.

Antes de qualquer persistência remota, deverá conseguir:

1. carregar uma configuração de endpoint sem segredo versionado;
2. buscar uma amostra autorizada;
3. preservar metadados suficientes da resposta;
4. calcular identificadores e hashes determinísticos;
5. reconhecer conteúdo já visto e conteúdo alterado;
6. produzir candidatos a `content_items` e `observations`;
7. gerar um relatório legível para revisão;
8. repetir a mesma entrada sem multiplicar a saída;
9. falhar de forma explícita diante de estrutura inesperada;
10. operar em modo de simulação antes de qualquer gravação.

“Local” descreve a primeira forma de execução, não o runtime definitivo. O coletor deverá evitar dependências desnecessárias do computador da pessoa pesquisadora para continuar portável.

## Primeiro conector: ABVE

O conector da ABVE será o primeiro caso porque o repositório já possui publicações, fontes, observações, métricas, correções e revisões metodológicas dessa organização.

O ensaio deverá verificar pelo menos:

- descoberta de uma publicação conhecida;
- identificação de título, URL e data de publicação;
- reconhecimento de uma página já coletada;
- detecção de mudança no conteúdo acessível;
- distinção entre data da publicação e período medido;
- preservação da linguagem usada pela fonte;
- extração candidata de uma afirmação quantitativa;
- bloqueio quando a estrutura da página não sustentar os campos esperados.

Os registros canônicos existentes funcionarão como exemplos de aceitação. O conector não poderá reimportá-los nem alterá-los durante o desenvolvimento.

## Segundo conector: ANEEL

O conector da ANEEL introduzirá uma fonte pública regulatória e documental diferente da ABVE.

Antes de implementá-lo, um PR de seleção deverá escolher endpoints oficiais concretos e registrar:

- tipo e estabilidade de cada endpoint;
- formato disponível;
- paginação, filtros, identificadores e datas;
- relação entre notícia, documento e ato regulatório;
- limites técnicos e condições de acesso;
- amostras adequadas para teste;
- campos que podem ser extraídos sem interpretação jurídica automática.

O objetivo inicial não será cobrir toda a ANEEL. Será provar que a arquitetura do pipeline suporta uma segunda fonte com estrutura e semântica diferentes.

## Deduplicação e idempotência

A deduplicação deverá ocorrer em camadas, sem tratar revisão legítima como repetição descartável:

| Camada | Pergunta |
| --- | --- |
| Endpoint | estamos consultando o mesmo endereço lógico? |
| Execução | esta tentativa já possui a mesma chave operacional? |
| Resposta | os bytes ou o conteúdo normalizado permanecem iguais? |
| Publicação | URL canônica ou identificador da fonte representam o mesmo item? |
| Versão | o mesmo item mudou de conteúdo ou metadados? |
| Observação | a mesma afirmação já possui fingerprint conhecido? |

Princípios obrigatórios:

- repetir a mesma entrada não cria outra publicação ou observação equivalente;
- uma alteração material cria ou propõe nova versão, sem sobrescrever silenciosamente a anterior;
- URLs diferentes não provam conteúdos diferentes;
- conteúdo igual não prova que duas fontes possuem linhagem independente;
- falha parcial não confirma sucesso dos itens incompletos;
- uma chave de idempotência não pode esconder conflito entre dados existentes e novos;
- o coletor deve interromper ou encaminhar divergências para revisão.

Os algoritmos, chaves e constraints exatos serão definidos na decisão de modelagem antes da migration.

## Extração de `observations`

A extração produzirá **candidatos**, não fatos automaticamente aceitos.

Cada candidato deverá preservar, quando disponível:

- afirmação da fonte;
- forma normalizada proposta;
- tipo de observação;
- data ou período da afirmação;
- geografia;
- termo usado pela fonte;
- vínculo com o conteúdo e sua versão;
- trecho ou localização que sustenta a extração;
- limitações, ambiguidades e campos ausentes;
- versão do extrator e confiança operacional, sem transformar confiança em veracidade.

O extrator não poderá decidir sozinho que uma afirmação é confirmada, corroborada, oficial no sentido factual ou metodologicamente comparável. Essas decisões permanecem no fluxo editorial e de revisão.

## Revisão humana

Nenhuma observação coletada entrará no conjunto canônico apenas porque o conector ou extrator a produziu.

A revisão deverá permitir responder:

1. a publicação correta foi identificada?
2. autor, publicador, título, data e URL estão sustentados?
3. a afirmação foi transcrita sem mudar unidade, período ou geografia?
4. a normalização preserva o significado da fonte?
5. há conteúdo anterior igual, corrigido ou conflitante?
6. a proveniência é direta, compartilhada ou incerta?
7. a fonte sustenta a afirmação ou apenas reproduz terceiro?
8. existe informação inacessível ou ambígua?
9. o candidato deve ser aceito, corrigido, rejeitado ou mantido pendente?

O primeiro formato de revisão poderá ser um artefato versionado no Git, desde que não copie conteúdo protegido além do necessário para a evidência e não exponha segredos.

## Ordem dos próximos PRs

Depois do aceite e merge desta decisão:

1. selecionar os endpoints iniciais da ABVE e da ANEEL;
2. decidir a modelagem de `source_endpoints` e `collection_runs`;
3. criar uma migration somente para essas estruturas, ainda não aplicada;
4. revisar e, depois do merge, aplicar a migration;
5. definir o contrato de entrada e saída do coletor manual/local;
6. implementar o núcleo do coletor com fixtures e modo de simulação;
7. implementar e validar o conector da ABVE;
8. implementar e validar o conector da ANEEL;
9. adicionar deduplicação e provas de idempotência;
10. adicionar extração candidata de `observations`;
11. validar o fluxo completo com revisão humana;
12. registrar duração, recursos, falhas, volume e necessidades de operação;
13. somente então retomar a seleção de runtime, backend e hospedagem.

Cada migration, aplicação de migration, conector e resultado de ensaio deverá permanecer em etapa pequena e revisável.

## Evidências necessárias antes de escolher runtime

A discussão de hospedagem só deverá ser retomada quando houver medições de pelo menos ABVE e ANEEL para:

- duração típica e pior duração observada;
- uso de CPU e memória;
- volume baixado e produzido;
- necessidade ou não de navegador;
- bibliotecas e binários exigidos;
- número de endpoints e frequência desejada;
- concorrência segura;
- comportamento de repetição e recuperação;
- segredos e permissões realmente necessários;
- formato dos artefatos de revisão;
- retenção dos resultados de execução;
- necessidade de execução manual, agendada ou contínua.

Com esses dados será possível comparar um job, uma função edge ou um worker persistente sem adivinhar a carga de trabalho.

## Critérios de sucesso da fase collection-first

A fase estará pronta para reconsiderar runtime quando:

1. os endpoints iniciais estiverem identificados e revisados;
2. `source_endpoints` separar fonte de local de coleta;
3. `collection_runs` preservar tentativas bem-sucedidas e falhas;
4. o coletor local executar em modo de simulação;
5. ABVE e ANEEL possuírem conectores reproduzíveis;
6. repetição não criar conteúdo ou observações duplicados;
7. mudança real de conteúdo não for perdida como duplicata;
8. observações forem produzidas como candidatas rastreáveis;
9. revisão humana decidir antes da persistência canônica;
10. falhas e bloqueios forem visíveis e recuperáveis;
11. nenhum segredo ou conteúdo integral indevido aparecer em Git ou logs;
12. requisitos operacionais forem medidos e documentados.

## Interrupções obrigatórias

A fase deverá parar se:

- um conector exigir contornar controle de acesso, robots ou condição de uso;
- a origem exata do conteúdo não puder ser preservada;
- uma repetição puder multiplicar registros equivalentes;
- uma alteração de conteúdo puder sobrescrever a versão anterior;
- a extração automática puder entrar diretamente no conjunto canônico;
- segredo precisar ser versionado;
- o coletor depender de `postgres`, `service_role` ou do login de leitura `0001`;
- uma migration misturar estruturas de coleta com automação ou produto público;
- falhas forem descartadas sem registro;
- ABVE e ANEEL exigirem regras incompatíveis que sejam escondidas numa abstração genérica;
- a implementação precisar escolher hospedagem antes de produzir medições.

## Fora de escopo por enquanto

- automação agendada;
- hospedagem;
- backend;
- ativação da fronteira privada `0001`;
- API;
- frontend;
- produto público;
- notificações e alertas;
- coleta em grande escala;
- classificação ou aceite editorial inteiramente automáticos;
- migração do Notion;
- alteração das migrations, do schema, do Supabase ou dos dados neste PR.

## Relação com o nono ciclo

O nono ciclo demonstrou e instalou uma fronteira privada de leitura para um futuro backend. Esse trabalho não é revertido. A verificação com a identidade real permanece pendente porque o backend continua inexistente e o login permanece sem senha.

A direção collection-first pausa a ativação operacional do nono ciclo. Quando o pipeline revelar o runtime adequado, o ChargeBR poderá retomar a seleção da hospedagem, ativar a identidade de forma controlada e concluir os testes restantes sem reabrir as decisões estruturais já aceitas.

## Perguntas para revisão

1. Está correto priorizar o pipeline de coleta antes de escolher runtime, backend ou hospedagem?
2. Está correto manter `chargebr_backend_methodology_0001` com `PASSWORD NULL` e não reutilizá-lo para coleta?
3. `source_endpoints` separa adequadamente a fonte dos locais concretos onde ela é coletada?
4. `collection_runs` deve preservar cada tentativa, inclusive falhas e execuções sem conteúdo novo?
5. Está correto começar com um coletor manual/local e modo de simulação?
6. ABVE e ANEEL formam um primeiro par adequado de conectores com características diferentes?
7. As camadas propostas distinguem repetição, duplicata, nova versão e conflito?
8. Está correto produzir `observations` apenas como candidatas antes da revisão?
9. As perguntas da revisão humana preservam conteúdo, contexto, proveniência e incerteza?
10. A ordem dos PRs mantém modelagem, migration, aplicação, conectores e resultados em etapas pequenas?
11. As evidências exigidas serão suficientes para escolher posteriormente entre job, função edge e worker persistente?
12. Está correto manter automação agendada, hospedagem, backend, API, frontend e produto público fora de escopo?
13. A pausa da ativação do nono ciclo está explicada sem invalidar a fronteira privada já instalada?
14. As interrupções impedem coleta indevida, duplicação, perda de versões e aceite automático?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. Este PR não deve ser incorporado antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 15 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a direção collection-first e não solicitou correções. O PR está liberado para merge. Depois do merge, a próxima etapa será selecionar os endpoints iniciais da ABVE e da ANEEL, mantendo runtime, backend, hospedagem e ativação da fronteira `0001` adiados.
