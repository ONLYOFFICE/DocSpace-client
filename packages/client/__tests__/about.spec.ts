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


import type { Page } from "@playwright/test";

import {
  buildHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { buildSuccess } from "@docspace/shared/__mocks__/handlers/settings/build";
import { companyInfoSuccess } from "@docspace/shared/__mocks__/handlers/settings/companyInfo";
import { settingsAuth } from "@docspace/shared/__mocks__/handlers/settings/settings";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";
import { PAID_NOW } from "./helpers/billing";

/**
 * About this program, on a server and on SaaS.
 *
 * Every edition shares one layout: the logo with "Terms of use | Privacy
 * Policy" next to it, Docs and Apps as linked columns with their versions,
 * then the company block. There is no software license line any more.
 *
 * - A legal page without a URL in external resources is left out, together
 *   with the separator (servers ship no privacy entry today).
 * - AI Tools (a closed product: no link, a BETA badge) is listed only when the
 *   build API reports its version; without it the column is not rendered.
 *
 * On a phone the profile menu opens the /about page instead of the dialog.
 */

const MOBILE = { width: 390, height: 844 };
const AI_TOOLS_VERSION = "1.0.95.508";
const PRIVACY_POLICY_URL = "https://www.onlyoffice.com/Privacy.aspx";

type AboutCase = {
  name: string;
  isSaas: boolean;
  /** Version the build API reports for AI Tools; absent = not deployed. */
  aiTools?: string;
  /** External resources carry no privacy entry. */
  withoutPrivacy?: boolean;
};

const CASES: AboutCase[] = [
  { name: "server", isSaas: false },
  { name: "server-without-privacy", isSaas: false, withoutPrivacy: true },
  { name: "saas", isSaas: true, aiTools: AI_TOOLS_VERSION },
  { name: "saas-without-ai-tools", isSaas: true },
];

const externalResourcesWithoutPrivacy = () => {
  const { externalResources } = settingsAuth.response as unknown as {
    externalResources: {
      common: { entries: Record<string, string> };
    };
  };
  const { privacy: _privacy, ...entries } = externalResources.common.entries;

  return {
    ...externalResources,
    common: { ...externalResources.common, entries },
  };
};

const useCase = (mockRequest: WorkerFixture, about: AboutCase) => {
  mockRequest.use(
    settingsHandler(
      TEST_PORT,
      about.isSaas
        ? TypeSettings.AuthenticatedNoStandalone
        : TypeSettings.Authenticated,
      {
        displayAbout: true,
        ...(about.withoutPrivacy && {
          externalResources: externalResourcesWithoutPrivacy(),
        }),
      },
    ),
    buildHandler(
      TEST_PORT,
      about.aiTools ? { aiTools: about.aiTools } : undefined,
    ),
  );
};

const expectAboutContent = async (page: Page, about: AboutCase) => {
  await expect(
    page.getByRole("link", { name: "Docs", exact: true }),
  ).toHaveAttribute("href", "https://github.com/ONLYOFFICE/DocumentServer");
  await expect(
    page.getByRole("link", { name: "Apps", exact: true }),
  ).toHaveAttribute("href", "https://github.com/ONLYOFFICE/DocSpace");

  await expect(
    page.getByText(buildSuccess.response.documentServer, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(buildSuccess.response.docSpace, { exact: true }),
  ).toBeVisible();

  // The license line is gone in every edition.
  await expect(page.getByText("Software license")).toHaveCount(0);
  await expect(page.getByText("AGPL-3.0")).toHaveCount(0);

  await expect(page.getByRole("link", { name: "Terms of use" })).toBeVisible();

  const privacyPolicy = page.getByRole("link", { name: "Privacy Policy" });
  const separator = page.getByText("|", { exact: true });

  if (about.withoutPrivacy) {
    await expect(privacyPolicy).toHaveCount(0);
    await expect(separator).toHaveCount(0);
  } else {
    await expect(privacyPolicy).toHaveAttribute("href", PRIVACY_POLICY_URL);
    await expect(separator).toBeVisible();
  }

  const aiTools = page.getByText("AI Tools", { exact: true });

  await expect(
    page.getByTestId("about-products").getByTestId(/^about-product-/),
    "a missing AI Tools version must drop the column, not leave it empty",
  ).toHaveCount(about.aiTools ? 3 : 2);

  if (about.aiTools) {
    await expect(aiTools).toBeVisible();
    await expect(page.getByRole("link", { name: "AI Tools" })).toHaveCount(0);
    await expect(page.getByText("BETA", { exact: true })).toBeVisible();
    await expect(page.getByText(about.aiTools, { exact: true })).toBeVisible();
  } else {
    await expect(aiTools).toHaveCount(0);
    await expect(page.getByText("BETA", { exact: true })).toHaveCount(0);
  }

  await expect(
    page.getByText(`© ${companyInfoSuccess.response.companyName}`),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: companyInfoSuccess.response.email }),
  ).toHaveAttribute("href", `mailto:${companyInfoSuccess.response.email}`);
};

test.describe("About this program", () => {
  test.beforeEach(async ({ page }) => {
    // The mock tariff is due in mid-2026: freeze the clock before that, or
    // the header shows "Subscription expired" once the real date passes it.
    await page.clock.setSystemTime(PAID_NOW);
  });

  for (const about of CASES) {
    test(`dialog on ${about.name}`, async ({ page, baseUrl, mockRequest }) => {
      useCase(mockRequest, about);

      await page.goto(`${baseUrl}/rooms/shared/filter?action=about`);

      // The dialog opens a second after load (checkUrlActions).
      await expect(
        page.getByText("About this program", { exact: true }),
      ).toBeVisible();

      await expectAboutContent(page, about);

      await expectScreenshot(page, [
        "desktop",
        "about",
        `about-dialog-${about.name}.png`,
      ]);
    });

    test(`page on ${about.name}, mobile`, async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      useCase(mockRequest, about);
      await page.setViewportSize(MOBILE);

      await page.goto(`${baseUrl}/about`);

      await expectAboutContent(page, about);

      await expectScreenshot(page, [
        "mobile",
        "about",
        `about-page-${about.name}.png`,
      ]);
    });
  }
});
