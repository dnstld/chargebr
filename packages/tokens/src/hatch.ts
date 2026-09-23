// Geometria da hachura: a definição compartilhada de onde derivam todas as
// implementações da textura de "não resolvido". Vive aqui, e não no átomo que
// a desenha em DOM, porque o gráfico precisa da mesma textura por outro
// mecanismo — um padrão SVG — e duas geometrias parecidas porém diferentes é
// exatamente o que a hachura como átomo próprio existe para impedir.
//
// Não é token DTCG: não é cor, espaço, raio nem tipografia, e não vira custom
// property. É a medida da textura, em unidades do espaço do usuário do SVG,
// consumida por quem a desenha.

// Período do padrão: um traço e um vão de mesma largura.
const PERIOD = 4;

// Quantos períodos precisam caber no menor lado para que a textura ainda seja
// lida como hachura, e não como cinza uniforme.
const MIN_PERIODS = 3;

export const HATCH = {
  /** Inclinação do traço, em graus. */
  angleDegrees: 45,
  /** Período do padrão, em unidades do espaço do usuário do SVG. */
  period: PERIOD,
  /** Espessura do traço: metade do período, para traço e vão iguais. */
  strokeWidth: PERIOD / 2,
  /** Menor lado em que a textura ainda é hachura: três períodos. */
  minSize: PERIOD * MIN_PERIODS,
  /** Períodos mínimos, para que quem verifica não reconstrua o número. */
  minPeriods: MIN_PERIODS,
} as const;

export type HatchGeometry = typeof HATCH;
