import type { BlockReason } from "../domain/block-reason";
import type { EvidencePath } from "../domain/value-with-provenance/value-with-provenance";
import type { VocabularyOverrides } from "../vocabulary/vocabulary";
import type { SeriesLimit } from "./palette";
import type { ChartShape } from "./shapes";

// Um ponto de uma série. Os três estados vêm das restrições de domínio e não
// são graus da mesma coisa:
//
// - `resolved`: valor resolvido, com caminho até a evidência.
// - `unresolved`: valor legítimo cuja normalização não se resolveu. Permanece
//   visível, recebe hachura, e nunca é ligado nem somado a valor resolvido.
// - `missing`: não há valor. Não vira zero, não é interpolado e não some em
//   silêncio — a ausência é declarada.
export const POINT_KINDS = ["resolved", "unresolved", "missing"] as const;
export type PointKind = (typeof POINT_KINDS)[number];

interface PointPosition {
  /** Categoria em que o ponto cai, em PT-BR. É dado, não vocabulário. */
  category: string;
}

export interface ResolvedPoint extends PointPosition {
  kind: "resolved";
  value: number;
  /** Caminho até a evidência. Obrigatório: número sem proveniência não é exibível. */
  evidence: EvidencePath;
}

export interface UnresolvedPoint extends PointPosition {
  kind: "unresolved";
  value: number;
  evidence: EvidencePath;
}

export interface MissingPoint extends PointPosition {
  kind: "missing";
}

export type ChartPoint = ResolvedPoint | UnresolvedPoint | MissingPoint;

export function hasValue(
  point: ChartPoint,
): point is ResolvedPoint | UnresolvedPoint {
  return point.kind !== "missing";
}

export interface ChartSeries<Measure extends string = string> {
  /** Nome visível da série, em PT-BR. É dado recebido, não vocabulário. */
  name: string;
  /** Escala de valor a que a série pertence. */
  measure: Measure;
  points: readonly ChartPoint[];
}

export interface ChartMeasure<Measure extends string = string> {
  /** Identificador da escala de valor; o mesmo que cada série declara. */
  id: Measure;
  /** Nome visível da escala, em PT-BR. */
  label: string;
  /** Formatação dos valores; o padrão é a de pt-BR sem casa forçada. */
  format?: Intl.NumberFormatOptions;
}

// Tupla de N elementos, para comparar comprimentos no tipo.
type Tuple<N extends number, T extends unknown[] = []> = T["length"] extends N
  ? T
  : Tuple<N, [...T, unknown]>;

type ExceedsSeriesLimit<S extends readonly unknown[]> =
  Tuple<SeriesLimit> extends [...Tuple<S["length"] & number>, ...unknown[]]
    ? false
    : true;

// O limite de séries reprova em `verify:types`, nomeando o gráfico, a forma e
// o limite. A mensagem é o próprio tipo: quem excede o limite lê o que fazer,
// não só que algo não é atribuível.
export type SeriesLimitRule<
  Shape extends ChartShape,
  Title extends string,
  S extends readonly unknown[],
> =
  ExceedsSeriesLimit<S> extends true
    ? `O gráfico "${Title}", na forma ${Shape}, recebeu ${S["length"] & number} séries; a paleta validada sustenta ${SeriesLimit}. Agrupe o excedente ou use pequenos múltiplos.`
    : unknown;

// Uma escala de valor por gráfico. Série que declare outra escala reprova em
// `verify:types`, nomeando o gráfico e as duas escalas.
export type SingleMeasureRule<
  Title extends string,
  Measure extends string,
  S extends readonly { measure: string }[],
> = S[number]["measure"] extends Measure
  ? unknown
  : `O gráfico "${Title}" declara a escala de valor "${Measure}" e recebeu série na escala "${Exclude<S[number]["measure"], Measure>}". Um gráfico tem uma escala de valor: use dois gráficos.`;

export interface ChartCommonProps<
  Measure extends string,
  Title extends string,
> {
  /** Nome do gráfico, visível e usado nas mensagens de tipo. */
  title: Title;
  /** A escala de valor do gráfico. Uma só, por construção. */
  measure: ChartMeasure<Measure>;
  /** Sobrescrita termo a termo do vocabulário. */
  terms?: VocabularyOverrides;
}

// Um gráfico desenha suas séries ou é substituído pela projeção bloqueada.
// Nunca os dois: a forma da entrada não admite bloqueio com série, e o tipo
// recusa antes de qualquer decisão em execução.
export type ChartData<
  Shape extends ChartShape,
  S extends readonly ChartSeries<string>[],
  Measure extends string,
  Title extends string,
> =
  | {
      /** Razões do bloqueio, ao menos uma. Presente, substitui o gráfico. */
      blocked: readonly [BlockReason, ...BlockReason[]];
      series?: never;
    }
  | {
      blocked?: never;
      series: S &
        SeriesLimitRule<Shape, Title, S> &
        SingleMeasureRule<Title, Measure, S>;
    };

export type ShapeChartProps<
  Shape extends ChartShape,
  S extends readonly ChartSeries<string>[],
  Measure extends string,
  Title extends string,
> = ChartCommonProps<Measure, Title> & ChartData<Shape, S, Measure, Title>;

// A forma que o núcleo desenha, já sem as regras de tipo: elas batem na
// fronteira, uma vez, na forma que quem usa escreve.
export interface ChartDrawProps {
  title: string;
  measure: ChartMeasure;
  series?: readonly ChartSeries[];
  blocked?: readonly [BlockReason, ...BlockReason[]];
  terms?: VocabularyOverrides;
}

export interface ChartCoreProps extends ChartDrawProps {
  shape: ChartShape;
}
