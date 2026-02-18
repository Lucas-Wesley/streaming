import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: [
      // Permite import "../src/main.js" resolver para o .ts (nodenext)
      { find: new RegExp("^(\\.{1,2}/.*)\\.js$"), replacement: "$1" },
    ],
  },
});
