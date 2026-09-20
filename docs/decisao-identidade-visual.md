# Decisão: identidade visual e tipografia

## Estado

`PROPOSTA PARA REVISÃO`

Este documento fecha três das quatro decisões que a decisão de criação da
interface deixou em aberto. Não cria token, componente, pacote ou dependência,
e não altera código.

## Lacuna encontrada

A fase Criação da interface abriu com quatro decisões em aberto. Três são de
identidade e bloqueiam o ciclo 03, que define os tokens: qual cor é primária,
qual família tipográfica e quais variantes de logo existem. Enquanto elas
estiverem abertas, a camada primitiva de tokens não pode ser fechada sem
suposição.

## Decisão proposta

### Cor primária

`brand.primary = #302681`.

O índigo é a cor primária mesmo não aparecendo no logo, que usa apenas
`#009440` e `#FFCB00`. Marca e sistema de interface são camadas distintas: o
logo carrega a identidade, o índigo carrega a interface.

### Tipografia

**Inter é a única família do sistema.** Alumni Sans sai.

O logo não é afetado: seus SVGs contêm contornos vetoriais, não texto vivo, e
portanto não dependem de nenhuma fonte instalada.

### Logo

Nenhuma variante adicional nesta fase. Área de proteção equivalente a um terço
da altura do logo.

## Medições que sustentam a decisão tipográfica

Os dois arquivos foram inspecionados diretamente, pelas tabelas OpenType e
pelas métricas de glifo.

| Medida | Alumni Sans | Inter |
| --- | --- | --- |
| Largura média de minúscula | `0,314 em` | `0,536 em` |
| Altura-x | `0,495 em` | `0,546 em` |
| Largura de `0` / `O` | `0,404` / `0,409` | `0,631` / `0,765` |
| Zero cortado (`zero`) | ausente | presente |
| Algarismos tabulares (`tnum`) | presente | presente |
| Eixos variáveis | `wght` | `wght`, `opsz` |

Alumni Sans declara `tnum`, ao contrário do que a suposição inicial afirmava.
O problema não é a ausência do recurso, e sim a densidade: suas letras têm
cerca de 58% da largura de uma sans de interface, herança declarada do Impact.
Em texto de tabela a 13px o resultado deixa de ser legível com conforto.

A ausência de zero cortado, somada a `0` e `O` com larguras praticamente
idênticas, cria risco concreto de leitura errada num sistema que exibe
identificadores como `CA-01`, `0001`, `run_key` e hashes.

Inter cobre integralmente o PT-BR e os sinais técnicos verificados, com 2.933
glifos.

## Alternativas não adotadas

**Alumni Sans em todo o sistema, com piso de 16px.** Funcionaria, mas o back
office é uma bancada de revisão densa; elevar o piso reduz quanto cabe na tela
sem resolver o zero cortado.

**Duas famílias, Alumni Sans para display e Inter para texto.** Preservaria a
voz da marca nos títulos ao custo de duas famílias carregadas e de uma regra de
uso que precisa ser lembrada a cada componente. A decisão preferiu um sistema
tipográfico único.

## Consequências

- A interface é liderada pelo índigo enquanto a marca é verde e amarela. É
  deliberado, não inconsistência.
- Os tokens de dado numérico devem ativar `tnum` e `zero`; sem isso, os
  algarismos de Inter são proporcionais por padrão e a coluna não alinha.
- O eixo `opsz` de Inter deve ser usado, não ignorado: ele ajusta o desenho por
  tamanho e melhora a leitura em corpo pequeno.
- Sem variante monocromática, o logo sobre superfície escura permanece verde e
  amarelo. Fica registrado como limitação conhecida, a ser reaberta se e quando
  uma superfície escura precisar exibi-lo.
- Nenhuma referência a Alumni Sans pode permanecer em token, componente ou
  documentação.

## Critérios para a implementação

1. A família tipográfica aparece somente na camada primitiva de tokens.
2. Tokens de dado numérico ativam `tnum` e `zero`.
3. O componente de logo expressa a área de proteção como token de espaçamento
   derivado da própria altura, não como valor fixo.
4. Nenhum componente referencia cor de marca diretamente.

## Perguntas para revisão

1. Está correto manter `#302681` como primária mesmo ausente do logo?
2. Está correto adotar Inter como família única e remover Alumni Sans?
3. As medições sustentam a decisão tipográfica sem depender de preferência?
4. Está correto registrar a ausência de variante monocromática como limitação
   conhecida em vez de resolvê-la agora?
5. Os critérios de implementação impedem que a decisão seja diluída no ciclo 03?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma for `não`,
indique o número e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | |
| Data da revisão | |
| Resultado | |
