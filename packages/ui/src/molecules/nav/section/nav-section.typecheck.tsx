// Usos que o tipo de `NavSection` recusa. Este arquivo não é executado: entra
// em `verify:types`, e a supressão abaixo só compila enquanto o erro que ela
// anuncia continuar existindo.
import { NavSection } from "./nav-section";

// `items` é uma tupla com ao menos um elemento — uma seção sem folha não
// compila, por tipo, não por checagem em tempo de execução.
export const navSectionWithoutLeaf = (
  // @ts-expect-error items vazio não satisfaz [NavSectionItem, ...NavSectionItem[]]
  <NavSection label="Fontes" items={[]} />
);
