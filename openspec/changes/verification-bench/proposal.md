# Bancada de verificação

## Why

Os ciclos 4 a 7 entregam componentes, e a regra que o projeto quer cobrar deles —
nenhuma afirmação de acessibilidade sem execução — não tem hoje nenhum lugar onde
ser executada. Não existe renderização, não existe história e não existe checagem
de acessibilidade. Sem a bancada, o primeiro componente nasceria com acessibilidade
afirmada por inspeção, que é exatamente o que a metodologia recusa em qualquer
outro contexto.

## What Changes

- Instala a bancada: documentação viva a partir de histórias, execução dessas
  histórias como teste, e checagem de acessibilidade sobre o resultado renderizado.
- Liga a checagem de acessibilidade em modo de reprovação por padrão, e torna
  visível qualquer história que rebaixe esse modo.
- Executa cada história nos dois temas, para que violação que só aparece no escuro
  também reprove.
- **BREAKING** — corrige a regra de fronteira do ciclo 1, que hoje proíbe
  `react-dom` dentro de `packages/`. O requisito fala em framework de aplicação;
  `react-dom` é renderizador, e sem ele não há como renderizar história nem teste
  de componente. A implementação ficou mais estrita que o requisito.

## Capabilities

### New Capabilities

- `verification-bench` — o comportamento observável da bancada: o que executa uma
  história, quando a acessibilidade reprova, o que acontece nos dois temas, e o que
  a bancada não pode alterar no contrato de verificação já existente.

### Modified Capabilities

- `workspace-verification` — o requisito **Fronteira entre biblioteca e aplicação**
  passa a nomear o que é proibido, em vez de usar a expressão genérica "framework
  de aplicação", que na implementação virou uma lista que barrava o renderizador.

## Impact

- **Pacote:** `packages/ui` ganha o renderizador, a bancada e suas histórias.
- **Dependências novas:** biblioteca de renderização, ferramenta de documentação
  viva e seus complementos de teste e de acessibilidade. Justificadas no desenho.
- **Verificação:** a lista de importações proibidas em `packages/` muda; as
  histórias e a checagem de acessibilidade entram no estágio de testes já existente.
- **Intocados:** `packages/tokens`, `apps/`, `src/`, `tests/`, `data/`, `queries/`,
  `supabase/`.

## O que esta mudança não faz

Não cria nenhum átomo, primitiva de domínio ou gráfico. As histórias desta mudança
existem para provar a bancada, não para entregar interface. Não decide API de
componente, não toca em token e não acrescenta estágio a `pnpm verify`.
