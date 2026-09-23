# Desenho — bancada de verificação

## Context

Ver `proposal.md` — Why. `packages/ui` é casca vazia desde o ciclo 1;
`@chargebr/tokens` publica CSS custom properties e constantes desde o ciclo 2.
`pnpm verify` tem quatro estágios, e o ciclo 1 provou que cada um falha
isoladamente nomeando-se.

A stack está fixada na decisão de configuração: Storybook 10 com o complemento de
Vitest e o de acessibilidade, React 19, CSS Modules.

## Goals / Non-Goals

**Goals**

- Acessibilidade provada por execução sobre o resultado renderizado, nunca por
  inspeção de código.
- Rebaixar a exigência num caso específico deve ser possível, caro e visível.
- Cobertura dos dois temas, porque contraste é a violação que só aparece num deles.

**Non-Goals**

- Qualquer átomo, primitiva de domínio ou gráfico. As histórias aqui existem para
  provar a bancada.
- Teste visual de regressão por imagem. Entra quando houver interface que valha
  fotografar.
- Publicação da documentação viva em endereço público.

## Decisions

**A checagem de acessibilidade roda no modo que reprova, ligado globalmente.** O
complemento de acessibilidade tem três modos: desligado, aviso e erro. Somente o
terceiro faz a violação reprovar na linha de comando e na integração contínua. Ele
é declarado uma vez, na configuração global da bancada, e não história por
história — o padrão precisa ser a exigência, não a exceção.

A alternativa — ligar por história — foi recusada: ela inverte o ônus, e a primeira
história que alguém esquecer de marcar passa sem verificação nenhuma.

**Rebaixar é declaração local e aparece na saída.** Uma história pode declarar o
modo de aviso quando a violação for conhecida e justificada. A verificação continua
passando, e lista a história como exceção. Sem essa listagem, rebaixar vira o
caminho fácil e silencioso.

**As histórias entram no estágio de testes que já existe.** O complemento de Vitest
transforma cada história em teste dentro da mesma execução. Nada de quinto estágio,
nada de mexer no workflow de CI, nada de alterar o contrato de resultado por etapa
que o ciclo 1 provou.

**Os dois temas custam duas execuções por história.** É o preço de pegar violação
de contraste que só existe no escuro. Com o punhado de histórias desta mudança o
custo é irrelevante; quando a biblioteca crescer, a decisão de reduzir escopo — por
exemplo, rodar os dois temas só onde há cor — é decisão própria, tomada com número
na mão, e não agora por antecipação.

**`react-dom` deixa de ser proibido em `packages/`.** O requisito do ciclo 1 fala
em framework de aplicação; a implementação transformou isso numa lista que incluía
o renderizador. Sem renderizador não há história, não há teste de componente e não
há acessibilidade verificada por execução — ou seja, a regra impedia justamente o
que a metodologia exige.

A correção mantém a fronteira onde ela importa: continua proibido importar de
`apps/` e continua proibido importar framework de aplicação, agora definido pelo
que ele tem — rotas, servidor, convenção de páginas. A alternativa de abrir exceção
apenas para arquivos de teste e história foi considerada e recusada: criaria duas
classes de arquivo dentro do mesmo pacote e uma regra que ninguém lembra ao mover
código de um lugar para outro.

## Risks / Trade-offs

- Resultado de acessibilidade pode variar se a tipografia não estiver carregada no
  momento da checagem, e contraste depende de cor resolvida → a bancada precisa
  garantir fonte e tokens resolvidos antes de medir, e o requisito de determinismo
  existe para que isso seja provado, não assumido.
- Rebaixar o modo é uma porta aberta → ela é estreita de propósito: declaração
  local, visível na saída, e nunca o padrão.
- Entram várias dependências de uma vez → todas são a bancada; nenhuma delas
  aparece no que a biblioteca publica para quem consome.
- Afrouxar a regra de fronteira pode ser lido como precedente → o requisito
  modificado nomeia o que é proibido em vez de generalizar, o que estreita a regra
  em precisão enquanto a afrouxa em alcance.

## Migration Plan

Aditiva. `packages/ui` está vazio. A única alteração em algo existente é a lista de
importações proibidas, e o requisito modificado descreve o novo estado por inteiro.
Reversão é o revert do commit.

## Open Questions

Nenhuma.
