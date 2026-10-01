// Usos que o tipo de `AppFrame` recusa, e um que aceita de propósito. Este
// arquivo não é executado: entra em `verify:types`, e cada supressão só
// compila enquanto o erro que ela anuncia continuar existindo.
import { AppFrame } from "./app-frame";

// `productName`/`skipLabel` são obrigatórios — requisito vivo
// (specs/backoffice-shell/spec.md, "Moldura sem o texto exigido não
// compila"), sem prova em código até este arquivo existir: a máquina de
// contrato central que a teria (removida em 793d8e2) nunca migrou este
// caso para um arquivo por componente.
export const appFrameWithoutProductName = (
  // @ts-expect-error productName é obrigatório
  <AppFrame skipLabel="Ir para o conteúdo">
    <p>Conteúdo</p>
  </AppFrame>
);

export const appFrameWithoutSkipLabel = (
  // @ts-expect-error skipLabel é obrigatório
  <AppFrame productName="ChargeBR">
    <p>Conteúdo</p>
  </AppFrame>
);

// `nav` é opcional por inteiro — compila sem o slot preenchido. É o caso
// real de `apps/backoffice` hoje.
export const appFrameWithoutNav = (
  <AppFrame productName="ChargeBR" skipLabel="Ir para o conteúdo">
    <p>Conteúdo</p>
  </AppFrame>
);

// `rail` é independente do grupo controlado de navegação: não exige nenhuma
// das três propriedades do gatilho.
export const appFrameWithRailOnly = (
  <AppFrame
    productName="ChargeBR"
    skipLabel="Ir para o conteúdo"
    rail={<p>Trilha</p>}
  >
    <p>Conteúdo</p>
  </AppFrame>
);

// `nav`, `navToggleLabel`, `navOpen` e `onNavToggle` entram juntos ou
// nenhum — preencher só `nav` não compila.
export const appFrameWithPartialNav = (
  // @ts-expect-error nav sem navToggleLabel/navOpen/onNavToggle não compila
  <AppFrame
    productName="ChargeBR"
    skipLabel="Ir para o conteúdo"
    nav={<p>Navegação</p>}
  >
    <p>Conteúdo</p>
  </AppFrame>
);
