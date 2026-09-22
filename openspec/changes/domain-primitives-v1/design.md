# Desenho — primitivas de domínio v1

## Context

Ver `proposal.md` — Why. Os seis átomos do ciclo 4 estão publicados, a bancada
executa cada história nos dois temas com acessibilidade em modo de reprovação, e
`@chargebr/tokens` fornece as três camadas. As restrições de domínio estão
declaradas em `openspec/config.yaml` e ainda não existem como componente.

## Goals / Non-Goals

**Goals**

- Regras de domínio impostas pelo tipo onde for possível, e por execução onde não for.
- Vocabulário auditável num arquivo só.
- Independência entre a biblioteca e o formato do banco.

**Non-Goals**

- Conflito entre fontes e par de redação original/normalizada, que ficam para
  quando houver dado real que os exercite.
- Qualquer tela, rota ou layout de página.
- Adaptador do contrato de leitura, enquanto houver um único consumidor previsto.

## Decisions

**Forma de entrada própria, sem adaptador publicado.** As primitivas definem seus
próprios tipos, e a tradução do contrato `chargebr-methodology-reading-v1` para
eles é responsabilidade de quem consome. Isso mantém `@chargebr/ui` independente
do banco: mudança de coluna ou de projeção não atravessa a camada de interface.

Publicar um adaptador junto foi considerado e adiado, não descartado. São dois os
consumidores previstos em `docs/estrategia-de-produto.md`: o back office, no
estágio 2, e o produto público de informação, no estágio 3. Com dois consumidores,
o argumento de evitar código sem usuário não se sustenta — o mapeamento será
escrito duas vezes se nada for compartilhado.

O que sustenta o adiamento é outra coisa: **não se sabe ainda se os dois leem a
mesma forma.** O back office consome o contrato metodológico, com proveniência,
contrafactual e estado de revisão. O produto público consome o que é publicável,
e ainda não existe contrato definido para ele. Um adaptador escrito agora
codificaria as suposições do primeiro consumidor e seria descoberto errado pelo
segundo, que é o pior dos dois mundos: código sem usuário **e** errado.

Revisão desta decisão: quando o contrato de leitura do produto público existir. Se
as formas coincidirem, o mapeamento do back office vira adaptador publicado; se
divergirem, cada consumidor mantém o seu, e o adiamento terá sido a escolha certa.

**Fixtures derivadas de saída real, não inventadas.** As histórias usam dados
moldados a partir do que o contrato de leitura já produz para a carga `0007`.
É o que permite entregar três primitivas sem inventar evidência — e é também a
razão de conflito e par de redação ficarem de fora deste ciclo.

**Vocabulário como módulo, com sobrescrita por propriedade.** Um dicionário
exportado, usado por padrão. Quem consome sobrescreve termo a termo, por
propriedade. Um provedor de contexto foi considerado e recusado por ora: acrescenta
estado implícito para resolver um problema que ainda não existe, já que há um
consumidor só.

**A obrigatoriedade mora no tipo sempre que puder.** Valor sem proveniência e
bloqueio sem razão reprovam em `verify:types`, não em execução. O que não cabe no
tipo — eixo omitido, rótulo declarado dentro da primitiva, importação do contrato —
é imposto por teste e por lint.

**Eixo sem valor é item declarado, não item ausente.** Omitir o eixo faria o leitor
ver dois itens onde existem três, e não haveria como distinguir "sem valor" de
"esse eixo não se aplica aqui". É o mesmo colapso que a restrição proíbe, só que
por subtração.

**O painel compõe o marcador do ciclo 4, sem reimplementá-lo.** Inclusive o eixo no
nome acessível, que já é garantia do átomo. O requisito aqui é sobre o conjunto:
três itens, três eixos, nenhum fundido.

## Risks / Trade-offs

- Sobrescrever vocabulário permite a quem consome renomear um termo para algo
  enganoso → nenhuma regra executável policia semântica; a mitigação é o padrão
  auditado num arquivo só, e a sobrescrita ser explícita termo a termo.
- A forma neutra empurra o mapeamento para o consumidor, que ainda não existe, e
  portanto não é exercitado → as fixtures derivam de saída real do contrato, de
  modo que a forma é confrontada com a realidade mesmo sem aplicação.
- Três primitivas podem não pressionar a camada de tokens o suficiente para
  revelar lacunas → aceito; a alternativa seria inventar as outras duas.
- A checagem de cobertura foi escrita para átomos → estendê-la a primitivas é
  tarefa deste ciclo, não consequência automática.

## Migration Plan

Aditiva. Nada existente é alterado além da checagem de cobertura, que passa a
varrer mais um diretório. Reversão é o revert do commit.

## Open Questions

Nenhuma.
