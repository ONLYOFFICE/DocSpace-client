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

import { http } from "msw";
import type { Page } from "@playwright/test";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";
import {
  aiConfigHandler,
  filesSettingsHandler,
  peopleListHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfHandlerWithCulture,
  settingsHandler,
  tariffHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { quotaSuccess } from "@docspace/shared/__mocks__/handlers/portal/quota";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The warning a paid portal shows when an admin is invited past the plan's
 * admin limit: People -> Invite -> Room admin with every admin seat taken.
 *
 * Its footer pairs "Upgrade plan" with Cancel in a 400px modal. Half of that
 * footer is too narrow for the label in several locales, and ui-kit clips an
 * overflowing button label at both ends, so the Russian one lost its first
 * and last letters. The footer now keeps the two buttons on one line,
 * equal while the label fits, and lets the primary one take what Cancel does
 * not need. The cultures below are English (the equal case), Russian (the
 * report) and the two longest translations of the label.
 */

type Case = {
  culture: string;
  label: string;
  cancel: string;
  /** Whether both buttons are expected to be the same width. */
  equal: boolean;
};

const CASES: Case[] = [
  { culture: "en-US", label: "Upgrade plan", cancel: "Cancel", equal: true },
  {
    culture: "ru-RU",
    label: "Обновить тарифный план",
    cancel: "Отменить",
    equal: false,
  },
  {
    culture: "fr-FR",
    label: "Mettre à jour le plan tarifaire",
    cancel: "Annuler",
    equal: false,
  },
  {
    culture: "bg",
    label: "Надграждане на абонамента",
    cancel: "Отказ",
    equal: false,
  },
];

const DESKTOP = { width: 1440, height: 1024 };

const ADMIN_LIMIT = 3;

/** A paid plan whose admin seats are all taken. */
const adminLimitQuotaHandler = () =>
  http.get(`${BASE_URL}:${TEST_PORT}/${API_PREFIX}/portal/payment/quota`, () => {
    const body = quotaSuccess();

    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          features: body.response.features.map((feature) =>
            feature.id === "manager"
              ? {
                  ...feature,
                  value: ADMIN_LIMIT,
                  used: { ...feature.used, value: ADMIN_LIMIT },
                }
              : feature,
          ),
        },
      }),
    );
  });

/**
 * The dialog's content box. The test id sits on the modal's outer wrapper,
 * which has no box of its own, so the content inside it is what is visible.
 */
const dialog = (page: Page) =>
  page.getByTestId("invite-quota-warning-dialog").getByTestId("modal-dialog");

const primaryButton = (page: Page) =>
  dialog(page).getByTestId("invite-quota-warning-primary");

const cancelButton = (page: Page) =>
  dialog(page).getByTestId("invite-quota-warning-cancel");

for (const testCase of CASES) {
  test(`Admin limit warning keeps the upgrade label whole in ${testCase.culture}`, async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The page's own handlers go first, as in invite.spec.ts: registered after
    // the quota and culture ones, the people list never leaves its skeleton.
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleListHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfHandlerWithCulture(TEST_PORT, testCase.culture),
      aiConfigHandler(TEST_PORT),
      tariffHandler(TEST_PORT),
      adminLimitQuotaHandler(),
    );

    await page.setViewportSize(DESKTOP);
    // `asc_language` is what the client reads the language off on the first
    // paint; the culture on /people/@self keeps it there after the stores load.
    await page.context().addCookies([
      {
        name: "asc_language",
        value: testCase.culture,
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(`${baseUrl}/accounts/people`);

    await page.getByTestId("main-button").click();
    await page.getByTestId("manager").click();

    await expect(dialog(page)).toBeVisible();
    await expect(primaryButton(page)).toHaveText(testCase.label);
    await expect(cancelButton(page)).toHaveText(testCase.cancel);

    const primaryBox = await primaryButton(page).boundingBox();
    const cancelBox = await cancelButton(page).boundingBox();
    expect(primaryBox).not.toBeNull();
    expect(cancelBox).not.toBeNull();

    // One line, never stacked.
    expect(Math.abs(primaryBox!.y - cancelBox!.y)).toBeLessThan(1);
    expect(cancelBox!.x).toBeGreaterThan(primaryBox!.x + primaryBox!.width);

    if (testCase.equal) {
      expect(Math.abs(primaryBox!.width - cancelBox!.width)).toBeLessThan(1);
    } else {
      expect(primaryBox!.width).toBeGreaterThan(cancelBox!.width);
    }

    // The label fits inside its button: it was wider than the button and
    // clipped at both ends before.
    const labelBox = await primaryButton(page)
      .getByText(testCase.label, { exact: true })
      .boundingBox();
    expect(labelBox).not.toBeNull();
    expect(labelBox!.x).toBeGreaterThanOrEqual(primaryBox!.x);
    expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(
      primaryBox!.x + primaryBox!.width,
    );

    await expectScreenshot(page, [
      "desktop",
      "invite-quota-warning-dialog",
      `${testCase.culture}.png`,
    ]);
  });
}
