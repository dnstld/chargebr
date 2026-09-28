// Usos que o tipo recusa. Este arquivo não é executado: entra em
// `verify:types`, e cada supressão abaixo só compila enquanto o erro que ela
// anuncia continuar existindo. Se a moldura passar a aceitar texto ausente, a
// supressão fica sem erro para suprimir e a verificação reprova.
//
// A importação é pelo subpath publicado, e não por caminho interno: é o mapa
// de exportações do pacote que é o contrato, e este arquivo o exercita.
import { AppFrame } from "@chargebr/ui/shell";

export const frameWithBothTexts = (
  <AppFrame productName="ChargeBR" skipLabel="Ir para o conteúdo">
    <p>Conteúdo</p>
  </AppFrame>
);

export const frameWithoutProductName = (
  // @ts-expect-error o nome do produto é obrigatório no tipo: moldura sem ele não compila
  <AppFrame skipLabel="Ir para o conteúdo">
    <p>Conteúdo</p>
  </AppFrame>
);

export const frameWithoutSkipLabel = (
  // @ts-expect-error o texto do salto é obrigatório no tipo: moldura sem ele não compila
  <AppFrame productName="ChargeBR">
    <p>Conteúdo</p>
  </AppFrame>
);
