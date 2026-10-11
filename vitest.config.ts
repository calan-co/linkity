import path from "path";

export default {
  test: {
    globals: true,
    environment: "node",
    clearMocks: true,
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "tests/**/*.test.ts",
        "scripts/__tests__/**",
        "**/*.config.ts",
      ],
    },
    //globalSetup: "tests/helper/globalSetup.ts",
    setupFiles: [
      //"dotenv/config",
      "tests/helper/setupTests.ts",
      //"tests/helper/setupTestEnvVars.ts",
      //"tests/helper/customMatchers/toHaveBeenCalledWithScopes.ts",
    ],
  },
  resolve: {
    alias: {
      linkity: "/src/index.ts",
      "@": path.resolve(__dirname, "lib"),
    },
  },
};
