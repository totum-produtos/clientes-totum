// ESLint flat config (ESLint 9 + Next 16).
// Next 16 removeu `next lint`; o lint roda via ESLint CLI (`eslint`).
// eslint-config-next 16 ja exporta flat configs (arrays), entao importamos
// direto — sem FlatCompat.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  // Reproduz o que o `next lint` excluia por padrao.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  // Regras NOVAS do eslint-plugin-react-hooks (era React Compiler) que o
  // Next 16 promoveu a erro. O codigo pre-existente as viola em 28 pontos;
  // corrigi-las e refactor de comportamento fora do escopo do upgrade de
  // seguranca. Mantidas como `warn` (visiveis, nao barram o build), como
  // eram efetivamente sob Next 15. Divida tecnica a tratar depois.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
