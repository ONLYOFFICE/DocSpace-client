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
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/security/access-portal";
const IP_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings/iprestrictions`;

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

test.describe("IP Security", () => {
  // Bug 80905: saving with Disabled kept the allowed list (duplicates
  // included), so enabling IP Security again brought the old addresses back.
  test("saving with Disabled clears the allowed IP list", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const saved: { body?: { IpRestrictions: unknown[]; enable: boolean } } =
      {};

    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      http.get(IP_PATH, () =>
        json([{ ip: "192.168.0.1" }, { ip: "192.168.0.1" }]),
      ),
      http.get(`${IP_PATH}/settings`, () => json({ enable: true })),
      http.put(IP_PATH, async ({ request }) => {
        saved.body = (await request.json()) as typeof saved.body;
        return json({
          ipRestrictions: saved.body?.IpRestrictions ?? [],
          enable: saved.body?.enable ?? false,
        });
      }),
    );

    await page.goto(`${baseUrl}${URL}`);

    const inputs = page.getByTestId("ip_security_ip_input");
    await expect(inputs).toHaveCount(2);

    await page.getByTestId("ip_security_disabled").click();
    await expect(inputs).toHaveCount(0);

    const saveButton = page.getByTestId("ip_security_save_button");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect.poll(() => saved.body).toEqual({
      IpRestrictions: [],
      enable: false,
    });

    await page.getByTestId("ip_security_enabled").click();
    await expect(page.getByTestId("ip_security_add_ip_button")).toBeVisible();
    await expect(inputs).toHaveCount(0);
  });
});
