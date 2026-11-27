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
import { quotaSuccess } from "@docspace/shared/__mocks__/handlers/portal/quota";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/integration/sso";
const SSO_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings/ssov2`;
const QUOTA_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/portal/payment/quota`;

const POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

const ssoSettings = (enableSso = false) => ({
  enableSso,
  spLoginLabel: "Single Sign-on",
  uploadXmlUrl: "",
  idpSettings: {
    entityId: enableSso ? "https://idp.example.com/metadata" : "",
    ssoUrl: enableSso ? "https://idp.example.com/sso" : "",
    ssoBinding: POST,
    sloUrl: "",
    sloBinding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
    nameIdFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
  },
  idpCertificates: [],
  idpCertificateAdvanced: {
    verifyAlgorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
    verifyAuthResponsesSign: false,
    verifyLogoutRequestsSign: false,
    verifyLogoutResponsesSign: false,
    decryptAlgorithm: "http://www.w3.org/2001/04/xmlenc#aes128-cbc",
    decryptAssertions: false,
  },
  spCertificates: [],
  spCertificateAdvanced: {
    signingAlgorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
    signAuthRequests: false,
    signLogoutRequests: false,
    signLogoutResponses: false,
    encryptAlgorithm: "http://www.w3.org/2001/04/xmlenc#aes128-cbc",
    decryptAlgorithm: "http://www.w3.org/2001/04/xmlenc#aes128-cbc",
    encryptAssertions: false,
  },
  fieldMapping: {
    firstName: "givenName",
    lastName: "sn",
    email: "mail",
    title: "title",
    location: "l",
    phone: "mobile",
  },
  hideAuthPage: false,
  disableEmailVerification: false,
  usersType: 2,
});

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

const quotaWithoutSso = () =>
  http.get(QUOTA_PATH, () => {
    const body = quotaSuccess();
    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          features: body.response.features.map((feature) =>
            feature.id === "sso" ? { ...feature, value: false } : feature,
          ),
        },
      }),
    );
  });

type TSaved = { serializeSettings?: string };

const ssoHandlers = (enableSso: boolean, calls: { saved?: TSaved; reset: number }) => [
  http.get(SSO_PATH, () => json(ssoSettings(enableSso))),
  http.post(SSO_PATH, async ({ request }) => {
    calls.saved = (await request.json()) as TSaved;
    return json(JSON.parse(calls.saved.serializeSettings ?? "{}"));
  }),
  http.delete(SSO_PATH, () => {
    calls.reset += 1;
    return json(ssoSettings(false));
  }),
];

test.describe("Single sign-on", () => {
  test("Without the SSO feature the switch, saving and the metadata download are disabled and marked as paid", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = { reset: 0 };
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      quotaWithoutSso(),
      ...ssoHandlers(false, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggle = page.getByTestId("enable_sso_toggle_button");
    await expect(toggle).toBeVisible();
    await expect(toggle.locator("input")).toBeDisabled();
    await expect(page.getByText("Paid", { exact: true })).toBeVisible();

    await page.getByTestId("sp_settings_hide_button").click();
    await expect(page.getByTestId("save_sso_settings_button")).toBeDisabled();
    await expect(page.getByTestId("restore_sso_settings_button")).toBeDisabled();

    await page.getByTestId("sp_metadata_hide_button").click();
    await expect(page.getByTestId("download_metadata_xml_button")).toBeDisabled();
  });

  test("Turning SSO on opens the provider settings; saving waits for the required fields and sends them", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls: { saved?: TSaved; reset: number } = { reset: 0 };
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(false, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page
      .getByText("Enable single sign-on authentication", { exact: true })
      .click();

    const entityId = page.getByTestId("entity_id_input");
    await expect(entityId).toBeVisible();

    const save = page.getByTestId("save_sso_settings_button");
    await expect(save).toBeDisabled();

    await entityId.fill("https://idp.example.com/metadata");
    await page
      .getByTestId("sso_endpoint_url_input")
      .fill("https://idp.example.com/sso");
    await expect(save).toBeDisabled();
    await page
      .getByTestId("slo_endpoint_url_input")
      .fill("https://idp.example.com/slo");

    await expect(save).toBeEnabled();
    await save.click();

    await expect.poll(() => calls.saved?.serializeSettings).toBeTruthy();
    const saved = JSON.parse(calls.saved!.serializeSettings!);
    expect(saved.enableSso).toBe(true);
    expect(saved.idpSettings).toMatchObject({
      entityId: "https://idp.example.com/metadata",
      ssoUrl: "https://idp.example.com/sso",
      ssoBinding: POST,
      sloUrl: "https://idp.example.com/slo",
    });
    expect(saved.fieldMapping).toMatchObject({
      firstName: "givenName",
      lastName: "sn",
      email: "mail",
    });
  });

  test("Default settings with SSO off resets the form at once", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = { reset: 0 };
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(false, calls),
    );

    await page.goto(`${baseUrl}${URL}`);
    await page.getByTestId("sp_settings_hide_button").click();
    await page.getByTestId("restore_sso_settings_button").click();

    await expect.poll(() => calls.reset).toBe(1);
  });

  test("Default settings with SSO on asks first and turns SSO off once confirmed", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = { reset: 0 };
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggleInput = page
      .getByTestId("enable_sso_toggle_button")
      .locator("input");
    await expect(toggleInput).toBeChecked();

    await page.getByTestId("sp_settings_hide_button").click();
    await page.getByTestId("restore_sso_settings_button").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(calls.reset).toBe(0);

    await dialog.getByRole("button", { name: "OK" }).click();

    await expect.poll(() => calls.reset).toBe(1);
    await expect(toggleInput).not.toBeChecked();
  });
});
