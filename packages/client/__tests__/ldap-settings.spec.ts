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
import { LDAPCertificateProblem } from "@docspace/shared/enums";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { quotaSuccess } from "@docspace/shared/__mocks__/handlers/portal/quota";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/integration/ldap";
const LDAP_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings/ldap`;
const QUOTA_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/portal/payment/quota`;

const ldapSettings = (enabled: boolean) => ({
  enableLdapAuthentication: enabled,
  startTls: false,
  ssl: false,
  sendWelcomeEmail: false,
  disableEmailVerification: false,
  server: enabled ? "ldap.example.com" : "",
  userDN: enabled ? "ou=people,dc=example,dc=com" : "",
  portNumber: 389,
  userFilter: "(uid=*)",
  loginAttribute: "uid",
  ldapMapping: {
    FirstNameAttribute: "givenName",
    SecondNameAttribute: "sn",
    MailAttribute: "mail",
    AvatarAttribute: "jpegPhoto",
  },
  accessRights: {},
  groupMembership: false,
  groupDN: "",
  userAttribute: "",
  groupFilter: "",
  groupAttribute: "",
  groupNameAttribute: "",
  authentication: false,
  login: "",
  password: "",
  acceptCertificate: false,
  acceptCertificateHash: null,
});

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

const done = { id: "op", completed: true, percents: 100, error: "", status: "", source: "" };

type TCalls = {
  saved?: Record<string, unknown>;
  saves: Record<string, unknown>[];
  cron?: { Cron: string | null };
  syncs: number;
  statusChecks: number;
  certificateRequested?: boolean;
};

const CERTIFICATE_REQUEST = {
  Approved: false,
  Requested: true,
  SerialNumber: "0A1B2C3D",
  IssuerName: "CN=Example CA",
  SubjectName: "CN=ldap.example.com",
  ValidFrom: "2026-01-01T00:00:00",
  ValidUntil: "2027-01-01T00:00:00",
  Hash: "5F3A9C7E",
  CertificateErrors: [LDAPCertificateProblem.CertUntrustedCa],
};

const started = { id: "op", completed: false, percents: 0, error: "" };

const ldapHandlers = (enabled: boolean, calls: TCalls) => [
  http.get(LDAP_PATH, () => json(ldapSettings(enabled))),
  http.get(`${LDAP_PATH}/default`, () => json(ldapSettings(false))),
  http.get(`${LDAP_PATH}/cron`, () => json({ cron: null })),
  http.post(LDAP_PATH, async ({ request }) => {
    calls.saved = (await request.json()) as Record<string, unknown>;
    calls.saves.push(calls.saved);
    return calls.certificateRequested && calls.saves.length === 1
      ? json(started)
      : json(done);
  }),
  http.get(`${LDAP_PATH}/sync`, () => {
    calls.syncs += 1;
    return json(started);
  }),
  http.get(`${LDAP_PATH}/status`, () => {
    calls.statusChecks += 1;
    if (calls.certificateRequested) {
      return json({
        ...done,
        error: "Certificate verification",
        certificateConfirmRequest: JSON.stringify(CERTIFICATE_REQUEST),
        operationType: "SaveAndSync",
      });
    }
    return calls.statusChecks === 1
      ? json({
          id: "op",
          completed: false,
          percents: 40,
          error: "",
          status: "Syncing users",
          source: "",
          operationType: "Sync",
        })
      : json({ ...done, operationType: "Sync" });
  }),
  http.post(`${LDAP_PATH}/cron`, async ({ request }) => {
    calls.cron = (await request.json()) as { Cron: string | null };
    return json(null);
  }),
];

const quotaWithoutLdap = () =>
  http.get(QUOTA_PATH, () => {
    const body = quotaSuccess();
    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          features: body.response.features.map((feature) =>
            feature.id === "ldap" ? { ...feature, value: false } : feature,
          ),
        },
      }),
    );
  });

const newCalls = (): TCalls => ({ saves: [], syncs: 0, statusChecks: 0 });

const openSettingsWithLdapOn = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${URL}`);
  await expect(
    page.getByTestId("ldap_toggle_button").locator("input"),
  ).toBeChecked();
  await page.getByTestId("hide_show_ldap_link").click();
  await expect(page.getByTestId("server_field_input")).toHaveValue(
    "ldap.example.com",
  );
};

test.describe("LDAP", () => {
  test("Without the LDAP feature the switches and the sync are disabled and marked as paid", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      quotaWithoutLdap(),
      ...ldapHandlers(true, newCalls()),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggle = page.getByTestId("ldap_toggle_button").locator("input");
    await expect(toggle).toBeDisabled();
    await expect(page.getByText("Paid", { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("manual_sync_button")).toBeDisabled();
    await expect(
      page.getByTestId("auto_sync_toggle_button").locator("input"),
    ).toBeDisabled();
  });

  test("Turning LDAP on and saving waits for the required connection fields, then sends them", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(false, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page.getByText("LDAP Authentication", { exact: true }).click();

    const server = page.getByTestId("server_field_input");
    await expect(server).toBeVisible();

    const save = page.getByRole("button", { name: "Save", exact: true }).first();
    await save.click();
    await expect(server).toHaveAttribute("data-error", "true");
    expect(calls.saved).toBeUndefined();

    await server.fill("ldap://ldap.example.com");
    await page
      .getByTestId("user_dn_field_input")
      .fill("ou=people,dc=example,dc=com");
    await save.click();

    await expect.poll(() => calls.saved).toBeTruthy();
    expect(calls.saved).toMatchObject({
      EnableLdapAuthentication: true,
      Server: "ldap.example.com",
      UserDN: "ou=people,dc=example,dc=com",
    });
    await expect(
      page.getByText("Operation has been successfully completed."),
    ).toBeVisible();
  });

  test("Sync users starts a synchronization and shows its progress until it ends", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(true, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page.getByTestId("manual_sync_button").click();

    await expect(page.getByText("40% Syncing users")).toBeVisible();
    await expect(
      page.getByText("100% Operation has been successfully completed."),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("toast-content")
        .getByText("Operation has been successfully completed."),
    ).toBeVisible();
    expect(calls.syncs).toBe(1);
    expect(calls.statusChecks).toBeGreaterThan(1);
  });

  test("Auto sync shows the next run in UTC and saves the schedule", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(true, calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page.getByText("Auto sync", { exact: true }).click();

    await expect(page.getByTestId("next_sync_date")).toContainText(
      /Next synchronization: .+ UTC/,
    );
    await page.getByTestId("auto_sync_save_button").click();

    await expect.poll(() => calls.cron).toEqual({ Cron: "0 * * * * *" });
    await expect(
      page.getByText("Settings have been successfully updated"),
    ).toBeVisible();
  });

  test("Group membership makes its fields editable and required, and sends them", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(true, calls),
    );

    await openSettingsWithLdapOn(page, baseUrl);

    const groupDN = page.getByTestId("group_dn_field_input");
    await expect(groupDN).toBeDisabled();

    await page.getByText("Group Membership", { exact: true }).click();
    await expect(groupDN).toBeEnabled();

    const save = page.getByRole("button", { name: "Save", exact: true }).first();
    await save.click();
    await expect(groupDN).toHaveAttribute("data-error", "true");
    await expect(page.getByTestId("user_attribute_field_input")).toHaveAttribute(
      "data-error",
      "true",
    );

    await groupDN.fill("ou=groups,dc=example,dc=com");
    await page.getByTestId("user_attribute_field_input").fill("uid");
    await page
      .getByTestId("group_filter_field_textarea")
      .fill("(objectClass=groupOfNames)");
    await page.getByTestId("group_name_attribute_field_input").fill("cn");
    await page.getByTestId("group_attribute_field_input").fill("member");
    await save.click();

    await expect
      .poll(() => calls.saved?.GroupDN)
      .toBe("ou=groups,dc=example,dc=com");
    expect(calls.saved).toMatchObject({
      GroupMembership: true,
      UserAttribute: "uid",
      GroupFilter: "(objectClass=groupOfNames)",
      GroupNameAttribute: "cn",
      GroupAttribute: "member",
    });
  });

  test("Authentication makes the login and password required, then sends them", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(true, calls),
    );

    await openSettingsWithLdapOn(page, baseUrl);

    const login = page.locator('input[name="login"]');
    const password = page.locator('input[name="password"]');
    await expect(login).toBeDisabled();

    await page.getByText("Authentication", { exact: true }).click();
    await expect(login).toBeEnabled();

    const save = page.getByRole("button", { name: "Save", exact: true }).first();
    await save.click();
    await expect(login).toHaveAttribute("data-error", "true");
    expect(calls.saves).toHaveLength(0);

    await login.fill("cn=admin,dc=example,dc=com");
    await password.fill("secret");
    await save.click();

    await expect.poll(() => calls.saves.length).toBe(1);
    expect(calls.saved).toMatchObject({
      Authentication: true,
      Login: "cn=admin,dc=example,dc=com",
      Password: "secret",
    });
  });

  test("A certificate the server cannot trust is shown for confirmation, and confirming it saves again with its hash", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    calls.certificateRequested = true;
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...ldapHandlers(true, calls),
    );

    await openSettingsWithLdapOn(page, baseUrl);

    await page.getByTestId("server_field_input").fill("ldaps://ldap.example.org");
    await page.getByRole("button", { name: "Save", exact: true }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Confirm certificate")).toBeVisible();
    await expect(dialog.getByText("Serial number: 0A1B2C3D")).toBeVisible();
    await expect(dialog.getByText("Unique hash: 5F3A9C7E")).toBeVisible();
    await expect(
      dialog.getByText(
        "Certificate Authority who issued the certificate is not trusted",
      ),
    ).toBeVisible();
    expect(calls.saves).toHaveLength(1);
    expect(calls.saves[0]).toMatchObject({ AcceptCertificate: false });

    calls.certificateRequested = false;
    await dialog.getByRole("button", { name: "OK" }).click();

    await expect.poll(() => calls.saves.length).toBe(2);
    expect(calls.saves[1]).toMatchObject({
      AcceptCertificate: true,
      acceptCertificateHash: "5F3A9C7E",
    });
    await expect(dialog).toBeHidden();
  });
});
