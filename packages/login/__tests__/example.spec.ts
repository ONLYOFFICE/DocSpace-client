import { expect, test } from "@docspace/shared/__mocks__/e2e";

test("has title", async ({ page }) => {
  await page.goto("http://192.168.0.16/login");

  // // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Playwright/);
});

// test("get started link", async ({ page }) => {
//   await page.goto("https://playwright.dev/");

//   // Click the get started link.
//   await page.getByRole("link", { name: "Get started" }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(
//     page.getByRole("heading", { name: "Installation" }),
//   ).toBeVisible();
// });
