import { test as base, Page } from "@playwright/test";
import { MockRequest } from "@docspace/shared/__mocks__/e2e";

export const test = base.extend<{
  page: Page;
  mockRequest: MockRequest;
}>({
  page: async ({ page }, use) => {
    await page.context().addCookies([
      {
        name: "asc_auth_key",
        value: "test",
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    await page.setExtraHTTPHeaders({
      "x-forwarded-host": "127.0.0.1:5115",
      "x-forwarded-proto": "http",
    });

    await page.route("*/**/static/scripts/config.json**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.route(
      "*/**/static/scripts/browserDetector.js**",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: "",
        });
      },
    );

    await page.route("*/**/logo.ashx**", async (route) => {
      try {
        await route.fulfill({
          path: `../../public/images/logo/loginpage.svg`,
        });
      } catch {
        await route.continue();
      }
    });

    await page.route(
      "*/**/management/_next/public/images/**",
      async (route, request) => {
        const imagePath = request
          .url()
          .split("/management/_next/public/images/")
          .at(-1)!
          .split("?")[0];

        try {
          await route.fulfill({
            path: `../../public/images/${imagePath}`,
          });
        } catch {
          await route.continue();
        }
      },
    );

    await use(page);
  },
  mockRequest: async ({ page }, use) => {
    const mockRequest = new MockRequest(page);
    await use(mockRequest);
  },
});

export { expect } from "@playwright/test";
