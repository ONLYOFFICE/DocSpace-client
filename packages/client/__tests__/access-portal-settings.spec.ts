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
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { tfaAppSettingsHandler } from "@docspace/shared/__mocks__/handlers/settings/tfaAppSettings";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/security/access-portal";
const SETTINGS_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings`;

const SAVED = "Settings have been successfully updated";
const UNSAVED = "You have unsaved changes";

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

type TCalls = { bodies: unknown[] };

const recordHandler = (
  method: "put" | "post",
  path: string,
  calls: TCalls,
  answer: (body: unknown) => unknown,
) =>
  http[method](`${SETTINGS_PATH}/${path}`, async ({ request }) => {
    const body = await request.json();
    calls.bodies.push(body);
    return json(answer(body));
  });

const tfaUnavailable = () =>
  http.get(`${SETTINGS_PATH}/tfaapp`, () =>
    json([
      { id: "sms", title: "By SMS", enabled: false, available: false },
      { id: "app", title: "By authenticator app", enabled: false, available: false },
    ]),
  );

const initHandlers = () => [
  http.get(`${SETTINGS_PATH}/security/password`, () =>
    json({ minLength: 8, upperCase: false, digits: false, specSymbols: false }),
  ),
  http.get(`${SETTINGS_PATH}/iprestrictions`, () => json([])),
  http.get(`${SETTINGS_PATH}/iprestrictions/settings`, () =>
    json({ enable: false }),
  ),
  http.get(`${SETTINGS_PATH}/cookiesettings`, () =>
    json({ enabled: false, lifeTime: 0 }),
  ),
  http.get(`${SETTINGS_PATH}/security/loginSettings`, () =>
    json({ attemptCount: 5, blockTime: 60, checkPeriod: 60 }),
  ),
  http.get(`${SETTINGS_PATH}/invitationsettings`, () =>
    json({ allowInvitingMembers: true, allowInvitingGuests: true }),
  ),
];

const radio = (page: Page, testId: string) =>
  page.getByTestId(testId).locator("input");

const openPage = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${URL}`);
  await expect(
    page.getByTestId("invitation_settings_guests_checkbox"),
  ).toBeVisible();
};

test.describe("Access portal sections", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      tfaAppSettingsHandler(TEST_PORT, false),
      ...initHandlers(),
    );
  });

  test("Two-factor authentication by app: saving it follows the confirmation link the server returns", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: TCalls = { bodies: [] };
    const confirmLink = `${baseUrl}/confirm/TfaActivation?type=TfaActivation`;
    mockRequest.use(
      tfaAppSettingsHandler(TEST_PORT, false),
      recordHandler("put", "tfaappwithlink", calls, () => confirmLink),
    );

    await openPage(page, baseUrl);

    await page.getByTestId("tfa_radio_button_app").click();
    await expect(page.getByText(UNSAVED)).toBeVisible();

    await page.getByTestId("tfa_save_button").click();

    await page.waitForURL(/\/confirm\/TfaActivation/);
    expect(calls.bodies).toEqual([{ type: "app" }]);
  });

  test("Two-factor authentication: switching it off saves without a link, Cancel restores the saved method, and an unavailable app cannot be chosen", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: TCalls = { bodies: [] };
    mockRequest.use(
      tfaAppSettingsHandler(TEST_PORT, true),
      recordHandler("put", "tfaappwithlink", calls, () => ""),
    );

    await openPage(page, baseUrl);

    await page.getByTestId("tfa_radio_button_disabled").click();
    await expect(page.getByText(UNSAVED)).toBeVisible();
    await page.getByTestId("tfa_cancel_button").click();
    await expect(page.getByText(UNSAVED)).toHaveCount(0);
    expect(calls.bodies).toHaveLength(0);

    await page.getByTestId("tfa_radio_button_disabled").click();
    await page.getByTestId("tfa_save_button").click();

    await expect(
      page.getByTestId("toast-content").getByText(SAVED),
    ).toBeVisible();
    expect(calls.bodies).toEqual([{ type: "none" }]);
    expect(page.url()).toBe(`${baseUrl}${URL}`);

    mockRequest.use(tfaUnavailable());
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(radio(page, "tfa_radio_button_app")).toBeDisabled();
  });

  test("Developer Tools access: Disabled limits the tools for users and is saved", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: TCalls = { bodies: [] };
    mockRequest.use(
      recordHandler("post", "devtoolsaccess", calls, () => true),
    );

    await openPage(page, baseUrl);

    await page.getByTestId("developer_tools_access_disabled").click();
    await page.getByTestId("developer_tools_access_save_button").click();

    await expect(
      page.getByTestId("toast-content").getByText(SAVED),
    ).toBeVisible();
    expect(calls.bodies).toEqual([{ limitedAccessForUsers: true }]);
  });

  test("Invitation settings: the contacts and guests checkboxes are saved, and Cancel restores them", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: TCalls = { bodies: [] };
    mockRequest.use(
      recordHandler("put", "invitationsettings", calls, (body) => body),
    );

    await openPage(page, baseUrl);

    const guests = page
      .getByTestId("invitation_settings_guests_checkbox")
      .locator("input");
    const contacts = page
      .getByTestId("invitation_settings_contacts_checkbox")
      .locator("input");
    await expect(guests).toBeChecked();
    await expect(contacts).toBeChecked();

    await page.getByTestId("invitation_settings_guests_checkbox").click();
    await expect(guests).not.toBeChecked();
    await page.getByTestId("invitation_settings_cancel_button").click();
    await expect(guests).toBeChecked();

    await page.getByTestId("invitation_settings_guests_checkbox").click();
    await page.getByTestId("invitation_settings_save_button").click();

    await expect.poll(() => calls.bodies).toEqual([
      { allowInvitingGuests: false, allowInvitingMembers: true },
    ]);
    await expect(
      page.getByTestId("toast-content").getByText(SAVED),
    ).toBeVisible();
  });

  test("Administrator message: Enabled is saved", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: TCalls = { bodies: [] };
    mockRequest.use(
      recordHandler("post", "messagesettings", calls, () => "Settings saved"),
    );

    await openPage(page, baseUrl);

    await page.getByTestId("administrator_message_enabled").click();
    await page.getByTestId("administrator_message_save_button").click();

    await expect.poll(() => calls.bodies).toEqual([{ turnOn: true }]);
    await expect(
      page.getByTestId("toast-content").getByText(SAVED),
    ).toBeVisible();
  });

  test("Each section keeps its own choice marked on the page", async ({
    page,
    baseUrl,
  }) => {
    await openPage(page, baseUrl);

    await expect(radio(page, "tfa_radio_button_disabled")).toBeChecked();
    await expect(radio(page, "developer_tools_access_enabled")).toBeChecked();
    await expect(radio(page, "ip_security_disabled")).toBeChecked();
    await expect(radio(page, "administrator_message_disabled")).toBeChecked();

    await page.getByTestId("developer_tools_access_disabled").click();
    await page.getByTestId("administrator_message_enabled").click();

    await expect(radio(page, "developer_tools_access_disabled")).toBeChecked();
    await expect(radio(page, "administrator_message_enabled")).toBeChecked();
    await expect(radio(page, "tfa_radio_button_disabled")).toBeChecked();
    await expect(radio(page, "ip_security_disabled")).toBeChecked();
  });

  test("A save the server refuses is reported as an error and keeps the change unsaved", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      http.post(`${SETTINGS_PATH}/messagesettings`, () =>
        Response.json({ error: { message: "Not allowed" } }, { status: 403 }),
      ),
      http.put(`${SETTINGS_PATH}/invitationsettings`, () =>
        Response.json({ error: { message: "Not allowed" } }, { status: 403 }),
      ),
    );

    await openPage(page, baseUrl);

    await page.getByTestId("administrator_message_enabled").click();
    await page.getByTestId("administrator_message_save_button").click();
    await page.getByTestId("invitation_settings_guests_checkbox").click();
    await page.getByTestId("invitation_settings_save_button").click();

    await expect(page.getByTestId("toast-content").first()).toBeVisible();
    await expect(page.getByText(SAVED)).toHaveCount(0);
    await expect(page.getByText(UNSAVED)).toHaveCount(2);
  });
});
