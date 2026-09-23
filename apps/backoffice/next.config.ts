import type { NextConfig } from "next";

// Os pacotes do workspace publicam fonte TypeScript pelo mapa de exportações,
// e não artefato construído: é a aplicação que os transpila.
//
// Rotas tipadas ficam desligadas por decisão: o recurso gera tipos dentro do
// diretório de artefatos da construção, e `verify:types` passaria a depender de
// uma construção ter rodado antes — isto é, do estágio de testes.
const config: NextConfig = {
  transpilePackages: ["@chargebr/tokens", "@chargebr/ui"],
  typedRoutes: false,
};

export default config;
