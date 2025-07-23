import { defineConfig, devices } from "@playwright/test";

import { BASE_URL } from "@docspace/shared/__mocks__/e2e";

const PORT = 5111;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./__tests__",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      process.env.CI ? "dot" : "html",
      {
        outputFolder: "../../playwright-report/login",
        open: "never",
      },
    ],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `${BASE_URL}:${PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  snapshotPathTemplate: "{testDir}/screenshots{/projectName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      threshold: 0.16,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
      },
    },
    /*     {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },  */
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn test:start",
    port: PORT,
    timeout: 1000 * 60 * 5,
  },
});
