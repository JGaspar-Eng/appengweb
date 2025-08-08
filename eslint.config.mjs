// eslint.config.mjs

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Suporte para __dirname e __filename em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compatibiliza configuração tradicional (.eslintrc) com o novo sistema "flat config"
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Configuração principal do ESLint
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",   // Regras recomendadas Next.js (inclui performance/acessibilidade)
    "next/typescript",        // Regras para projetos Next.js + TypeScript
    "plugin:react-hooks/recommended" // Recomendações para React Hooks (opcional)
  ),
  // Você pode adicionar regras customizadas aqui se desejar:
  // {
  //   rules: {
  //     // Exemplo: "no-console": "warn"
  //   }
  // }
];

// Exporta a configuração final
export default eslintConfig;
