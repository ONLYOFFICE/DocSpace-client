import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/logo.ashx**", async (route) => {
    await route.fulfill({
      contentType: "image/svg+xml",
      path: `../../public/images/logo/loginpage.svg`,
    });
  });
  await page.route(
    "*/**/login/_next/public/images/**/*",
    async (route, request) => {
      const imagePath = request
        .url()
        .split("/login/_next/public/images/")
        .at(-1)!
        .split("?")[0];
      await route.fulfill({
        contentType: "image/*",
        path: `../../public/images/${imagePath}`,
      });
    },
  );
});

test("render wizard", async ({ page }) => {
  await page.route("*/**/api/2.0/settings/wizard/complete", async (route) => {
    const json = [
      {
        status: 0,
        response: {
          Completed: true,
        },
      },
    ];
    await route.fulfill({ json });
  });

  await page.goto("/login/wizard");

  await page.fill("[name='wizard-email']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");
  await page.getByTestId("checkbox").click();

  await page.getByTestId("button").click();
  await expect(page).toHaveURL(/.*\//);
});
