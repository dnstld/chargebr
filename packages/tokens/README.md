# @chargebr/tokens

Camada de tokens do ChargeBR: cor, espaço, raio, sombra e tipografia, definidos
uma vez em formato DTCG e gerados para CSS e TypeScript.

## Estrutura

```text
tokens/
├── primitive/     valores literais: a única camada que pode ter literal
├── semantic/      papéis (superfície, texto, ação, gráfico…), só referências
│   ├── shared.json  vale nos dois temas
│   ├── light.json   tema claro
│   └── dark.json    tema escuro, mesmos tokens de light.json
└── component/     tokens por componente, só referências à camada semântica
generated/
├── tokens.css     custom properties; tema escuro por preferência do sistema
│                  ou por data-theme="dark" no elemento raiz
└── tokens.ts      constantes tipadas: { css, light, dark } por token
```

Cada camada só referencia a camada imediatamente abaixo. A verificação reprova
referência que salta camada, literal fora da primitiva, token presente num tema
e ausente no outro, e família tipográfica declarada fora da primitiva.

## Uso

```css
.card {
  background: var(--color-surface-raised);
  padding: var(--space-inset-md);
  border-radius: var(--radius-surface);
}
```

```ts
import { cssVar, tokens } from "@chargebr/tokens";

tokens["color-chart-series-1"].css; // "var(--color-chart-series-1)"
tokens["color-chart-series-1"].dark; // "#706fe2"
cssVar("color-surface-base"); // nome inexistente é erro de tipo
```

A folha de estilo entra uma vez, pela aplicação: `@chargebr/tokens/tokens.css`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm --filter @chargebr/tokens build` | confere a fonte e regrava `generated/` |
| `pnpm --filter @chargebr/tokens palette:report` | executa as seis checagens da paleta categórica nos dois temas e registra o pior par por tema |
| `pnpm verify` (raiz) | inclui os testes deste pacote; falha se `generated/` não corresponder à fonte |

`generated/` é versionado e nunca editado à mão: alterou a fonte, rode o build.

## Paleta categórica

As seis checagens — âncoras de matiz em ordem fixa, banda de luminosidade por
tema, piso de croma, separação sob protanopia e deuteranopia, piso de separação
para visão normal e contraste contra a superfície do tema — estão em
`src/palette.ts`, com o modelo de simulação e os limiares declarados no próprio
arquivo. Distâncias são ΔEok ×100 (euclidiana em OKLab, multiplicada por 100):
piso 6 e alvo 8 sob daltonismo, piso 15 para visão normal. Elas rodam como
teste, contra `color.chart.surface` de cada tema.
