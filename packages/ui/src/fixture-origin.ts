// De onde vem uma fixture. A distinção não é burocrática: uma fixture derivada
// do contrato de leitura afirma um estado do domínio que existe; uma fixture
// sintética afirma apenas que um componente sabe desenhar aquela forma.
//
// Esta mudança entrega mais formas de gráfico do que o contrato hoje produz
// dado para exercitar, e a trava que autoriza isso é a declaração: toda
// fixture diz, no próprio arquivo, de onde veio. A checagem em
// tools/checks/fixture-origin.test.ts reprova arquivo de fixture sem as duas
// declarações, e é ela que impede que uma fixture sintética seja lida depois
// como derivada do contrato.
export const FIXTURE_ORIGINS = ["contract", "synthetic"] as const;
export type FixtureOrigin = (typeof FIXTURE_ORIGINS)[number];
