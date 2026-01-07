import { defineConfig } from "eslint/config";
import nextConfig from "eslint-config-next/core-web-vitals.js";
import nextTsConfig from "eslint-config-next/typescript.js";

export default defineConfig([
  ...nextConfig,
  ...nextTsConfig,
]);
