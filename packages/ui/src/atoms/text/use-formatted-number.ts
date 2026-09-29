import { useMemo } from "react";

// Formata um número para exibição. Sem `format`, o padrão é `String(value)`:
// nenhum locale é decidido aqui — decisão de quem compõe, não do átomo.
export function useFormattedNumber(
  value: number,
  format?: (value: number) => string,
): string {
  return useMemo(
    () => (format ? format(value) : String(value)),
    [value, format],
  );
}
