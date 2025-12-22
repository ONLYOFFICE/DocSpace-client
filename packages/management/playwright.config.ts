import { defineConfig, devices } from "@playwright/test";

import { BASE_URL } from "@docspace/shared/__mocks__/e2e";

const PORT = 5115;

export default defineConfig({
  testDir: "./__tests__",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      process.env.CI ? "dot" : "html",
      {
        outputFolder: "../../playwright-report/management",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile: "../../playwright-report/management/test-results.json",
      },
    ],
  ],
  use: {
    baseURL: `${BASE_URL}:${PORT}`,
    trace: "on-first-retry",
  },
  snapshotPathTemplate: "{testDir}/screenshots{/projectName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      threshold: 0.16,
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
      },
    },
  ],
  webServer: {
    command: "pnpm run test:start",
    port: PORT,
    timeout: 1000 * 60 * 5,
  },
});
