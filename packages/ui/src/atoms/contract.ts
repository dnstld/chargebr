import type { ComponentType } from "react";

// Contrato de um átomo. Os estados são valor enumerável em tempo de execução,
// não união de tipos escondida em comentário: é isso que permite a verificação
// comparar o que o átomo declara com as histórias que existem (ver
// stories-coverage.test.ts). O tipo de cada estado deriva do valor, nunca o
// contrário.
export interface AtomContract<State extends string = string> {
  /** Nome do componente, como exportado pelo pacote. */
  readonly name: string;
  /** O próprio componente: é por identidade que a história é ligada ao átomo. */
  readonly component: ComponentType<never>;
  /** Estados que o átomo declara. Cada um precisa de história. */
  readonly states: readonly State[];
}

export type AtomState<Contract extends AtomContract> =
  Contract["states"][number];

// Prefixo da tag de história que declara qual estado ela exercita:
// `tags: ["state:primary"]`. A tag é texto literal porque o indexador do
// Storybook só lê literais; o teste de cobertura recusa estado não declarado.
export const STATE_TAG_PREFIX = "state:";

export function stateTag(state: string): `${typeof STATE_TAG_PREFIX}${string}` {
  return `${STATE_TAG_PREFIX}${state}`;
}

export function defineAtom<const State extends string>(contract: {
  readonly name: string;
  readonly component: ComponentType<never>;
  readonly states: readonly State[];
}): AtomContract<State> {
  const seen = new Set<string>();
  for (const state of contract.states) {
    if (seen.has(state)) {
      throw new Error(
        `Átomo ${contract.name} declara o estado "${state}" duas vezes`,
      );
    }
    seen.add(state);
  }
  return Object.freeze({
    name: contract.name,
    component: contract.component,
    states: Object.freeze([...contract.states]),
  });
}
