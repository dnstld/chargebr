// Usos que o tipo de `Button` recusa. Este arquivo não é executado: entra em
// `verify:types`, e cada supressão abaixo só compila enquanto o erro que ela
// anuncia continuar existindo. Se o tipo afrouxar, a supressão fica sem erro
// para suprimir e a verificação reprova (design.md, D6 — plantio por
// componente, sem a máquina de contrato/cobertura removida em 793d8e2).
import { Menu } from "lucide-react";
import { Button } from "./button";

// `size` só aceita os três degraus declarados — qualquer outro valor é erro de tipo.
export const buttonWithInvalidSize = (
  // @ts-expect-error "xl" não é um ButtonSize válido: só sm/md/lg compilam
  <Button size="xl">Confirmar</Button>
);

// Um botão sem rótulo visível e sem `aria-label` ficaria sem nome
// acessível — o tipo recusa a combinação, não só a revisão (replantado de
// `793d8e2`, ver design.md D6).
export const buttonWithoutAccessibleName = (
  // @ts-expect-error botão sem children nem aria-label não compila
  <Button icon={Menu} />
);
