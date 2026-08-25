/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  colorThemeHandler,
  settingsHandler,
  TypeSettings,
  docsConnectHandlers,
  docsConnectServerErrorHandler,
  DOCS_CONNECT_FROZEN_NOW,
  DOCS_CONNECT_SECRET,
  DOCS_CONNECT_TENANT_ADDRESS,
  PATH_DOCS_CONNECT_CONFIG,
} from "@docspace/shared/__mocks__/handlers";
import type { BrowserContext } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

test.use({ timezoneId: "UTC" });

const SETTINGS_ROUTE = "/developer-tools/docs-connect/settings";
const PREVIEW_ROUTE = "/developer-tools/docs-connect/preview";
const FROZEN_NOW_MS = new Date(DOCS_CONNECT_FROZEN_NOW).getTime();
const FIRST_RENDER_TIMEOUT = 15_000;

const freezeTime = async (context: BrowserContext, frozenNowMs: number) => {
  await context.addInitScript((now: number) => {
    const OriginalDate = Date;

    window.timezone = "UTC";

    Date.now = () => now;
    Math.random = () => 0.5;

    (globalThis as unknown as Record<string, unknown>).Date = class extends (
      OriginalDate
    ) {
      constructor(...args: unknown[]) {
        if (!args.length) {
          super(now);
          return;
        }

        const value = args[0];

        if (value instanceof OriginalDate) {
          super(value);
          return;
        }

        if (typeof value === "string" || typeof value === "number") {
          super(value);
          return;
        }

        super(now);
      }

      static now() {
        return now;
      }
    };
  }, frozenNowMs);
};

const usePaidPreset = (mockRequest: WorkerFixture) => {
  mockRequest.use(
    settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
    colorThemeHandler(TEST_PORT),
    ...docsConnectHandlers(TEST_PORT, "paid"),
  );
};

const waitForConfigUpdate = (page: import("@playwright/test").Page) =>
  page.waitForRequest(
    (request) =>
      request.method() === "PUT" &&
      request.url().includes(PATH_DOCS_CONNECT_CONFIG),
  );

test.beforeEach(async ({ context, mockRequest }) => {
  await freezeTime(context, FROZEN_NOW_MS);
  usePaidPreset(mockRequest);
});

test.describe("Docs Connect settings tab", () => {
  test("renders settings via deep link", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    await expect(
      page.getByTestId("docs_connect_settings_header_input"),
    ).toHaveValue("AuthorizationJwt", { timeout: FIRST_RENDER_TIMEOUT });

    await expectScreenshot(page, [
      "desktop",
      "docs-connect",
      "settings.png",
    ]);
  });

  test("saves general settings", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    const headerInput = page.getByTestId("docs_connect_settings_header_input");
    await expect(headerInput).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await headerInput.fill("CustomAuthHeader");
    await page.getByTestId("docs_connect_wopi_toggle").click();
    await page.getByTestId("docs_connect_settings_limit_input").fill("1024");

    const configRequest = waitForConfigUpdate(page);

    await page.getByTestId("save-button").click();

    const body = (await configRequest).postDataJSON() as {
      security: { secret: string; header: string };
      wopi: { enable: boolean };
      server: { isAnonymousSupport: boolean; fileSizeLimit: number };
    };

    expect(body.security).toEqual({
      secret: DOCS_CONNECT_SECRET,
      header: "CustomAuthHeader",
    });
    expect(body.wopi).toEqual({ enable: true });
    expect(body.server).toEqual({
      isAnonymousSupport: true,
      fileSizeLimit: 1024,
    });

    await expect(
      page.getByText("Settings have been successfully updated"),
    ).toBeVisible();
  });

  test("disables save when secret is empty", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    const secretInput = page.getByTestId("docs_connect_settings_secret_input");
    await expect(secretInput).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await secretInput.fill("");

    await expect(page.getByText("You have unsaved changes")).toBeVisible();
    await expect(page.getByTestId("save-button")).toBeDisabled();
  });

  test("reverts changes on cancel", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    const headerInput = page.getByTestId("docs_connect_settings_header_input");
    await expect(headerInput).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await headerInput.fill("CustomAuthHeader");
    await page.getByTestId("cancel-button").click();

    await expect(headerInput).toHaveValue("AuthorizationJwt");
  });

  test("adds IP filter rule and rolls back failed deletion", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    const addRuleButton = page.getByRole("button", {
      name: "Add Rule",
      exact: true,
    });
    await expect(addRuleButton).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await addRuleButton.click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByPlaceholder("Enter IP address, range, or host")
      .fill("192.168.0.0/24");

    const addRequest = waitForConfigUpdate(page);

    await dialog.getByRole("button", { name: "Add", exact: true }).click();

    const body = (await addRequest).postDataJSON() as {
      ipFilter: { rules: { address: string; allowed: boolean }[] };
    };

    expect(body.ipFilter.rules).toEqual([
      { address: "192.168.0.0/24", allowed: true },
    ]);

    await expect(page.getByText("192.168.0.0/24")).toBeVisible();

    mockRequest.use(
      docsConnectServerErrorHandler(TEST_PORT, PATH_DOCS_CONNECT_CONFIG, "put"),
    );

    const failedDelete = page.waitForResponse(
      (response) =>
        response.url().includes(PATH_DOCS_CONNECT_CONFIG) &&
        response.request().method() === "PUT" &&
        response.status() === 500,
    );

    await page.getByTestId("docs_connect_rule_delete").click();
    await failedDelete;

    await expect(page.getByText("192.168.0.0/24")).toBeVisible();
  });

  test("copies secret key to clipboard", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${SETTINGS_ROUTE}`);

    const copyButton = page.getByTestId("docs_connect_settings_copy_secret");
    await expect(copyButton).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await copyButton.click();

    await expect(page.getByText("Copied")).toBeVisible();
  });
});

test.describe("Docs Connect preview tab", () => {
  test("renders demo code and copies it", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${PREVIEW_ROUTE}`);

    const demoCodeTab = page.getByText("Demo code");
    await expect(demoCodeTab).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await demoCodeTab.click();

    await expect(page.locator("pre")).toContainText(
      `https://${DOCS_CONNECT_TENANT_ADDRESS}/web-apps/apps/api/documents/api.js`,
    );

    await page.mouse.move(0, 0);

    await expectScreenshot(page, 
      ["desktop", "docs-connect", "preview-code.png"],
      {
        mask: [
          page.getByText("Editor", { exact: true }),
          page.getByText("Demo code"),
        ],
      },
    );

    await page.getByTestId("docs_connect_demo_code_copy").click();

    await expect(page.getByText("Copied")).toBeVisible();
  });

  test("shows fallback when Document Server is unreachable", async ({
    page,
    baseUrl,
  }) => {
    await page.route("**/web-apps/apps/api/documents/api.js", (route) =>
      route.abort(),
    );

    await page.goto(`${baseUrl}${PREVIEW_ROUTE}`);

    // api.js is blocked, so the editor cannot load: the empty view offers a
    // page reload, which is what unblocks the tenant script.
    await expect(page.getByText("Something went wrong")).toBeVisible({
      timeout: FIRST_RENDER_TIMEOUT,
    });
    // The option renders "Reload page" as both its title and its description.
    await expect(page.getByText("Reload page").first()).toBeVisible();
  });

  test("shows a configuration hint when the preview token cannot be signed", async ({
    page,
    baseUrl,
  }) => {
    // Break the HMAC signing of the preview config the same way an unusable
    // secret key would: a reload cannot fix this, so no reload action is shown.
    await page.addInitScript(() => {
      if (!crypto?.subtle) return;
      crypto.subtle.importKey = () =>
        Promise.reject(new Error("importKey disabled for test"));
    });

    await page.goto(`${baseUrl}${PREVIEW_ROUTE}`);

    await expect(
      page.getByText(
        "Failed to load the editor preview. Check the instance address and secret key.",
      ),
    ).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await expect(page.getByText("Reload page")).toBeHidden();
  });
});
