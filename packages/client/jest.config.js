module.exports = {
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],
  modulePaths: [
    "<rootDir>/src",
    "<rootDir>/../..",
    "<rootDir>/../../node_modules",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!(hex-rgb|other-esm-packages)/)"],
  moduleNameMapper: {
    "^PACKAGE_FILE$": "<rootDir>/package.json",
    "^SRC_DIR/(.*)$": "<rootDir>/src/$1",
    "^PUBLIC_DIR/images/flags/(.+)\\.react\\.svg\\?url$":
      "<rootDir>/__mocks__/svgMock.js",
    "^PUBLIC_DIR/(.*)$": "<rootDir>/../../public/$1",
    "^ASSETS_DIR(.*)$": "<rootDir>/public",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/setupTests.js",
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
  roots: ["<rootDir>/src"],
};
