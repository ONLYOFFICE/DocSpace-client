import {
  endpoints,
  HEADER_EMPTY_PORTAL,
  HEADER_UNCOMPLETED_TENANT,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("Spaces", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([endpoints.colorTheme]);
  });

  test("should configuration spaces state", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [HEADER_EMPTY_PORTAL]);

    await page.goto("/management/spaces");

    await expect(
      page.getByTestId("configuration-spaces-wrapper"),
    ).toBeVisible();
    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-configuration-render.png",
    ]);
  });

  test("should multiple spaces state", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [
      HEADER_UNCOMPLETED_TENANT,
    ]);

    await page.goto("/management/spaces");

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();
    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-multiple-render.png",
    ]);
  });
});
