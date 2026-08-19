import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

const makeConfig = async () => {
  const resolvedConfig = await createJestConfig(config)();
  return {
    ...resolvedConfig,
    // next-intl / use-intl ship ESM-only builds; next/jest's own default
    // ignores all of node_modules, which leaves their `export` syntax
    // untranspiled unless explicitly carved out here.
    transformIgnorePatterns: [
      "/node_modules/(?!(next-intl|use-intl|@formatjs|intl-messageformat|tslib)/)",
    ],
  };
};

export default makeConfig;
