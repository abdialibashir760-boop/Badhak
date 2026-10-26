import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "flowtask-video/**", "card-transaction-video/**", "chile-rescue-video/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
