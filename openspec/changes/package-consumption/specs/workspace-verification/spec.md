# Spec Delta

## ADDED Requirements

### Requirement: Subpath publicado é provado sob a construção da aplicação

O conjunto de subpaths publicados SHALL ser descoberto do mapa de exportações de
cada pacote sob `packages/`, e SHALL NOT ser escrito à mão em lugar nenhum da
verificação.

Todo subpath descoberto SHALL ser importado por um arquivo da aplicação que a
construção alcança, e a construção da aplicação SHALL ser executada sobre a
árvore que contém essas importações. A verificação SHALL reprovar quando a
construção falhar, com o especificador que não resolveu.

A verificação SHALL comparar o conjunto descoberto com o conjunto de subpaths
importados pelo arquivo de consumo declarado, **nos dois sentidos**, e SHALL
reprovar nomeando o subpath que está num conjunto e não no outro.

A verificação SHALL reprovar quando o conjunto descoberto for vazio, e SHALL NOT
tratar ausência de mapa de exportações como pacote sem subpath a provar — pacote
sob `packages/` sem mapa de exportações reprova, nomeando o pacote.

**Por quê:** subpath publicado é o contrato do pacote, e até esta mudança nada
provava que ele **resolve e compila** para quem o consome. Dos oito subpaths
publicados hoje, a aplicação consumia dois; os outros seis eram verificados só
pela bancada, que é um consumidor de outro empacotador. Os dois defeitos deste
ciclo moravam exatamente nesse vão: a marca que não carrega e o barril de átomos
que não resolve. **Medido:** com o defeito presente, `pnpm verify` ficava verde
porque nenhum arquivo da aplicação importava o subpath quebrado, e
`pnpm --filter @chargebr/backoffice build` reprovava com três especificadores —
`../generated/tokens.js`, `./hatch.js` e `./source.js`.

**Por que a prova é a construção, e não uma verificação de resolução.** Resolver
não é compilar. Medido sobre a mesma árvore, com o defeito presente:

| Verificação | Veredito |
| --- | --- |
| Resolução pelo mapa de exportações, a partir da aplicação | **8 de 8 resolvidos** |
| Importação em Node sob `tsx` | 2 de 8 importados — os 6 que falharam, por extensão `.css`, e os 2 que passaram são exatamente os que a construção reprova |
| `pnpm -r exec tsc --noEmit` | **passa** |
| `next build` da aplicação | **reprova**, nomeando os três especificadores |

Só a construção é oráculo: a resolução pelo mapa não segue o grafo, a importação
em Node erra nos dois sentidos — não carrega folha de estilo nem módulo de
estilo, e resolve `.js` para `.ts`, que o empacotador da aplicação não resolve —,
e a checagem de tipos resolve pelas regras de TypeScript, não pelas do
empacotador.

**Por que a lista é descoberta e não declarada.** Lista de entrada escrita à mão
é afirmação sobre o código e tem duas provas próprias
(`openspec/config.yaml`, `rules.specs`). Aqui a fonte existe e é única — o mapa de
exportações —, então a cobertura é obtida por construção: subpath novo entra no
conjunto descoberto sem ninguém editar a verificação, e a comparação nos dois
sentidos nomeia o que ficou sem importação. O conjunto vazio reprova porque lista
vazia passa calada, que é o defeito medido no ciclo `nav-frame-contrast` e
registrado em `proof-falsifiability`.

**O que esta obrigação não exige:** que a aplicação **use** o que importa. Importar
é o que a construção precisa para resolver e compilar; usar é decisão de produto.
O custo dessa importação sobre o documento entregue é escolha de desenho, medida e
registrada no design do ciclo que criou o arquivo de consumo, não obrigação deste
requisito.

#### Scenario: Subpath publicado que não resolve reprova

- **WHEN** um subpath publicado não resolve sob a construção da aplicação
- **THEN** a verificação falha com o especificador que não resolveu
- **Prova:** especificador de módulo inexistente plantado num arquivo alcançável por subpath publicado, a construção dentro do preparo da verificação falhando com o especificador nomeado, plantio revertido

#### Scenario: Subpath publicado sem importação reprova

- **WHEN** o mapa de exportações de um pacote publica um subpath que o arquivo de consumo declarado não importa
- **THEN** a verificação falha nomeando o subpath descoberto e não importado
- **Prova:** subpath novo plantado no mapa de exportações de um pacote, teste de cobertura falhando com o subpath nomeado, plantio revertido

#### Scenario: Importação de subpath que o pacote não publica reprova

- **WHEN** o arquivo de consumo declarado importa um especificador de pacote do repositório que nenhum mapa de exportações publica
- **THEN** a verificação falha nomeando o subpath importado e não publicado
- **Prova:** importação de subpath inexistente plantada no arquivo de consumo, teste de cobertura falhando com o subpath nomeado, plantio revertido

#### Scenario: Conjunto descoberto vazio reprova

- **WHEN** a descoberta não encontra nenhum subpath publicado, ou um pacote sob `packages/` não tem mapa de exportações
- **THEN** a verificação falha, nomeando o pacote sem mapa ou dizendo que o conjunto ficou vazio
- **Prova:** mapa de exportações removido por plantio de um dos pacotes, teste de cobertura falhando com o pacote nomeado, plantio revertido

#### Scenario: Todos os subpaths publicados da árvore corrente estão provados

- **WHEN** a verificação é executada sobre a árvore corrente
- **THEN** o conjunto descoberto coincide com o importado, e a construção da aplicação conclui
- **Prova:** execução do teste de cobertura e da construção no preparo, com a contagem de subpaths descobertos registrada na saída
