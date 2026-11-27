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
import { quotaSuccess } from "@docspace/shared/__mocks__/handlers/portal/quota";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/integration/sso";
const SSO_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings/ssov2`;
const QUOTA_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/portal/payment/quota`;

const SSO_ROOT = `${BASE_URL}:${TEST_PORT}/sso`;

const POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";
const REDIRECT = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";

const ssoSettings = (enableSso = false) => ({
  enableSso,
  spLoginLabel: "Single Sign-on",
  uploadXmlUrl: "",
  idpSettings: {
    entityId: enableSso ? "https://idp.example.com/metadata" : "",
    ssoUrl: enableSso ? "https://idp.example.com/sso" : "",
    ssoBinding: POST,
    sloUrl: enableSso ? "https://idp.example.com/slo" : "",
    sloBinding: REDIRECT,
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
  usersType: 4,
});

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

const openWithSsoOn = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${URL}`);
  await expect(
    page.getByTestId("enable_sso_toggle_button").locator("input"),
  ).toBeChecked();
};

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

type TCertificate = { crt: string; key: string | null; action: string };

type TCalls = {
  saved?: TSaved;
  reset: number;
  metadataUrls: string[];
  uploads: number;
  validated: TCertificate[][];
};

const newCalls = (): TCalls => ({
  reset: 0,
  metadataUrls: [],
  uploads: 0,
  validated: [],
});

const IDP_CERTIFICATE = "MIIC-idp-signing-certificate";

const idpMetadata = {
  xmlString: "<EntityDescriptor/>",
  meta: {
    entityDescriptor: "",
    entityID: "https://idp.example.com/realms/portal",
    singleSignOnService: {
      [POST]: "https://idp.example.com/sso/post",
      [REDIRECT]: "https://idp.example.com/sso/redirect",
    },
    singleLogoutService: {
      [REDIRECT]: "https://idp.example.com/slo/redirect",
    },
    certificate: { signing: IDP_CERTIFICATE },
  },
};

const ssoHandlers = (enableSso: boolean, calls: TCalls) => [
  http.get(SSO_PATH, () => json(ssoSettings(enableSso))),
  http.post(SSO_PATH, async ({ request }) => {
    calls.saved = (await request.json()) as TSaved;
    return json(JSON.parse(calls.saved.serializeSettings ?? "{}"));
  }),
  http.delete(SSO_PATH, () => {
    calls.reset += 1;
    return json(ssoSettings(false));
  }),
  http.post(`${SSO_ROOT}/loadmetadata`, async ({ request }) => {
    const { url } = (await request.json()) as { url: string };
    calls.metadataUrls.push(url);
    return calls.metadataUrls.length === 1
      ? new Response("Metadata file not transferred", { status: 500 })
      : Response.json(idpMetadata);
  }),
  http.post(`${SSO_ROOT}/uploadmetadata`, () => {
    calls.uploads += 1;
    return Response.json(idpMetadata);
  }),
  http.post(`${SSO_ROOT}/validatecerts`, async ({ request }) => {
    const { certs } = (await request.json()) as { certs: TCertificate[] };
    calls.validated.push(certs);
    return Response.json(
      certs.map((cert) => ({
        ...cert,
        domainName: cert.key ? "portal.example.com" : "idp.example.com",
        startDate: "2026-01-01T00:00:00Z",
        expiredDate: "2036-01-01T00:00:00Z",
      })),
    );
  }),
  http.get(`${SSO_ROOT}/generatecert`, () =>
    Response.json({ crt: "MIIC-generated-crt", key: "MIIE-generated-key" }),
  ),
];

test.describe("Single sign-on", () => {
  test("Without the SSO feature the switch, saving and the metadata download are disabled and marked as paid", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
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
    const calls = newCalls();
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
    const calls = newCalls();
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
    const calls = newCalls();
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

  test("Provider metadata from an address: a malformed address is marked, an unreadable one reported, a readable one fills the provider and its certificate", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await openWithSsoOn(page, baseUrl);
    await page.getByTestId("sp_settings_hide_button").click();

    const address = page.getByTestId("upload_xml_input");
    const upload = page.getByTestId("upload_xml_button");

    await address.fill("idp.example.com/metadata");
    await upload.click();
    await expect(address).toHaveAttribute("data-error", "true");
    expect(calls.metadataUrls).toHaveLength(0);

    await address.fill("https://idp.example.com/metadata");
    await upload.click();
    await expect(
      page
        .getByTestId("toast-content")
        .getByText("Metadata file not transferred"),
    ).toBeVisible();

    await upload.click();
    await expect(page.getByTestId("entity_id_input")).toHaveValue(
      "https://idp.example.com/realms/portal",
    );
    await expect(page.getByTestId("sso_endpoint_url_input")).toHaveValue(
      "https://idp.example.com/sso/post",
    );
    await expect(page.getByTestId("slo_endpoint_url_input")).toHaveValue(
      "https://idp.example.com/slo/redirect",
    );
    expect(calls.metadataUrls).toEqual([
      "https://idp.example.com/metadata",
      "https://idp.example.com/metadata",
    ]);
    expect(calls.validated).toEqual([
      [{ crt: IDP_CERTIFICATE, key: null, action: "verification" }],
    ]);
    await expect(page.getByText("idp.example.com", { exact: true })).toBeVisible();
  });

  test("Provider metadata from a file: only an XML file is sent, and it fills the provider", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await openWithSsoOn(page, baseUrl);
    await page.getByTestId("sp_settings_hide_button").click();

    const file = page.locator('input[type="file"][accept=".xml"]');

    await file.setInputFiles({
      name: "metadata.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    });
    await file.setInputFiles({
      name: "metadata.xml",
      mimeType: "text/xml",
      buffer: Buffer.from("<EntityDescriptor/>"),
    });

    await expect(page.getByTestId("entity_id_input")).toHaveValue(
      "https://idp.example.com/realms/portal",
    );
    expect(calls.uploads).toBe(1);
  });

  test("A generated service provider certificate is validated, listed and saved; a second one of the same action is refused", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await openWithSsoOn(page, baseUrl);
    await page.getByTestId("sp_settings_hide_button").click();

    await page.getByTestId("sp_add_certificate_button").click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("Generate new self-signed certificate").click();
    await expect(dialog.locator("#sp-certificate")).toHaveValue(
      "MIIC-generated-crt",
    );
    await expect(dialog.locator("#sp-privateKey")).toHaveValue(
      "MIIE-generated-key",
    );
    await dialog.getByRole("button", { name: "OK" }).click();

    await expect(dialog).toBeHidden();
    expect(calls.validated).toEqual([
      [{ crt: "MIIC-generated-crt", key: "MIIE-generated-key", action: "signing" }],
    ]);
    await expect(
      page.getByText("portal.example.com", { exact: true }),
    ).toBeVisible();

    await page.getByTestId("sp_add_certificate_button").click();
    await dialog.locator("#sp-certificate").fill("MIIC-another-crt");
    await dialog.locator("#sp-privateKey").fill("MIIE-another-key");
    await dialog.getByRole("button", { name: "OK" }).click();
    await expect(
      page
        .getByTestId("toast-content")
        .getByText("Certificate with same action type already exists"),
    ).toBeVisible();
    expect(calls.validated).toHaveLength(1);
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await page.getByTestId("save_sso_settings_button").click();
    await expect.poll(() => calls.saved?.serializeSettings).toBeTruthy();
    const saved = JSON.parse(calls.saved!.serializeSettings!);
    expect(saved.spCertificates).toMatchObject([
      { crt: "MIIC-generated-crt", key: "MIIE-generated-key", action: "signing" },
    ]);
    expect(saved.spCertificateAdvanced).toMatchObject({
      signAuthRequests: true,
      signLogoutRequests: true,
    });
  });

  test("An identity provider certificate is added once, refused a second time and removed from its menu", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await openWithSsoOn(page, baseUrl);
    await page.getByTestId("sp_settings_hide_button").click();

    const dialog = page.getByRole("dialog");
    const row = page.getByText("idp.example.com", { exact: true });

    await page.getByTestId("idp_add_certificate_button").click();
    await dialog.locator("#idp-certificate").fill("MIIC-manual-crt");
    await dialog.getByRole("button", { name: "OK" }).click();

    await expect(dialog).toBeHidden();
    await expect(row).toBeVisible();
    expect(calls.validated[0]).toMatchObject([{ crt: "MIIC-manual-crt" }]);

    await page.getByTestId("idp_add_certificate_button").click();
    await dialog.locator("#idp-certificate").fill("MIIC-manual-crt");
    await dialog.getByRole("button", { name: "OK" }).click();
    await expect(
      page
        .getByTestId("toast-content")
        .getByText("Certificate with same action type already exists"),
    ).toBeVisible();
    expect(calls.validated).toHaveLength(1);
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await page.locator(".context-btn").first().click();
    await page.getByText("Delete", { exact: true }).click();
    await expect(row).toBeHidden();
  });

  test("The type of new users offers the types the administrator may grant and is saved", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, calls),
    );

    await openWithSsoOn(page, baseUrl);
    await page.getByTestId("sp_settings_hide_button").click();

    await page.getByRole("button", { name: "Role: User" }).click();
    await expect(page.getByText("Guest", { exact: true })).toHaveCount(0);
    await page.getByText("Room admin", { exact: true }).click();

    await page.getByTestId("save_sso_settings_button").click();
    await expect.poll(() => calls.saved?.serializeSettings).toBeTruthy();
    expect(JSON.parse(calls.saved!.serializeSettings!).usersType).toBe(1);
  });

  test("With SSO on the service provider metadata is shown, and its download opens the metadata in a new tab", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ssoHandlers(true, newCalls()),
    );

    await openWithSsoOn(page, baseUrl);

    const popup = page.waitForEvent("popup");
    await page.getByTestId("download_metadata_xml_button").click();

    await expect.poll(async () => (await popup).url()).toBe(
      `${baseUrl}/sso/metadata`,
    );
  });
});
