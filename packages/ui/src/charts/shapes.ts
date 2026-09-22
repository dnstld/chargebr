import type { PairScope } from "@chargebr/tokens/palette";

// As formas que a camada desenha, e o que cada uma declara sobre si. A lista
// de pares não é escolha de quem usa o gráfico: decorre de como a forma dispõe
// as marcas. Numa forma em que só vizinhos se tocam, a checagem de paleta
// compara pares adjacentes; numa forma em que qualquer marca pode encostar em
// qualquer outra, compara todos os pares.
export interface ChartShapeDefinition {
  /** Lista de pares que a checagem de paleta executa nesta forma. */
  readonly pairScope: PairScope;
  /** A forma liga pontos vizinhos da mesma série. Só nelas existe ligação a interromper. */
  readonly connectsPoints: boolean;
  /** A forma empilha marcas de séries diferentes sobre a mesma categoria. */
  readonly stacks: boolean;
  /** A forma desenha um painel por série, com a mesma escala de valor. */
  readonly panelsPerSeries: boolean;
}

export const CHART_SHAPES = {
  // Barras agrupadas: dentro de uma categoria, cada série ocupa uma posição
  // fixa, e só as vizinhas se tocam.
  bar: {
    pairScope: "adjacent",
    connectsPoints: false,
    stacks: false,
    panelsPerSeries: false,
  },
  // Barras empilhadas: cada série encosta na anterior e na seguinte, e em
  // nenhuma outra.
  "stacked-bar": {
    pairScope: "adjacent",
    connectsPoints: false,
    stacks: true,
    panelsPerSeries: false,
  },
  // Linhas: as séries correm em paralelo e podem se cruzar, mas o cruzamento
  // acontece entre linhas vizinhas na ordem de desenho.
  line: {
    pairScope: "adjacent",
    connectsPoints: true,
    stacks: false,
    panelsPerSeries: false,
  },
  // Dispersão por categoria: as marcas caem onde o valor as põe, e qualquer
  // marca pode encostar em qualquer outra.
  dot: {
    pairScope: "all",
    connectsPoints: false,
    stacks: false,
    panelsPerSeries: false,
  },
  // Pequenos múltiplos: um painel por série, com a mesma escala. As marcas
  // ficam próximas entre painéis, sem ordem que garanta vizinhança.
  "small-multiples": {
    pairScope: "all",
    connectsPoints: false,
    stacks: false,
    panelsPerSeries: true,
  },
} as const satisfies Record<string, ChartShapeDefinition>;

export type ChartShape = keyof typeof CHART_SHAPES;

export const CHART_SHAPE_IDS = Object.keys(
  CHART_SHAPES,
) as readonly ChartShape[];

export function shapeDefinition(shape: ChartShape): ChartShapeDefinition {
  return CHART_SHAPES[shape];
}
