import { expect, test } from "@playwright/test";

import BackgroundPatternReactSvgUrl from "PUBLIC_DIR/images/background.pattern.react.svg?url";

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
