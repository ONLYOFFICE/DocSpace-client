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

const URL = "/portal-settings/integration/third-party-services";
const AUTH_SERVICE_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/settings/authservice`;
const QUOTA_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/portal/payment/quota`;

type TProp = {
  name: string;
  title: string;
  type?: string;
  value: string;
  options?: string[];
  dependsOn?: string;
  dependsOnValue?: string;
  dependsOnValues?: string[];
};

type TConsumer = {
  name: string;
  title: string;
  description: string;
  instruction: string;
  canSet: boolean;
  paid: boolean;
  props?: TProp[];
};

type TSavedKeys = { name: string; props: { name: string; value: string }[] };

type TCalls = {
  saved: TSavedKeys[];
  tested: Record<string, unknown>[];
  testAnswers: { success: boolean; error?: string }[];
};

const newCalls = (): TCalls => ({ saved: [], tested: [], testAnswers: [] });

const google = (clientId = ""): TConsumer => ({
  name: "google",
  title: "Google",
  description: "Sign in with a Google account",
  instruction: "",
  canSet: true,
  paid: false,
  props: [
    { name: "googleClientId", title: "Client ID", type: "text", value: clientId },
    {
      name: "googleClientSecret",
      title: "Client Secret",
      type: "text",
      value: clientId ? "secret" : "",
    },
  ],
});

const fixedService: TConsumer = {
  name: "facebook",
  title: "Facebook",
  description: "Keys fixed by the installation",
  instruction: "",
  canSet: false,
  paid: false,
};

const paidStorage: TConsumer = {
  name: "dropbox",
  title: "Dropbox",
  description: "Connect Dropbox as a storage",
  instruction: "",
  canSet: true,
  paid: true,
  props: [
    { name: "dropboxClientId", title: "App key", type: "text", value: "" },
    { name: "dropboxClientSecret", title: "App secret", type: "text", value: "" },
  ],
};

const SQL_SERVERS = ["mysql", "postgresql"];

const sqlField = (prop: Omit<TProp, "dependsOn" | "dependsOnValue" | "dependsOnValues">): TProp => ({
  ...prop,
  dependsOn: "databaseType",
  dependsOnValue: "mysql",
  dependsOnValues: SQL_SERVERS,
});

const externalDb: TConsumer = {
  name: "externaldb",
  title: "External database",
  description: "Sync form results to an external database",
  instruction: "",
  canSet: true,
  paid: false,
  props: [
    {
      name: "databaseType",
      title: "Database type",
      type: "select",
      value: "",
      options: ["mysql", "postgresql", "sqlite"],
    },
    sqlField({ name: "dbHost", title: "Host", type: "text", value: "" }),
    sqlField({ name: "dbPort", title: "Port", type: "number", value: "" }),
    sqlField({ name: "dbName", title: "Database", type: "text", value: "" }),
    sqlField({ name: "dbUser", title: "User", type: "text", value: "" }),
    sqlField({ name: "dbPassword", title: "Password", type: "password", value: "" }),
    sqlField({ name: "dbSsl", title: "Use SSL", type: "toggle", value: "" }),
    {
      name: "sqliteFilePath",
      title: "SQLite file path",
      type: "text",
      value: "",
      dependsOn: "databaseType",
      dependsOnValue: "sqlite",
      dependsOnValues: ["sqlite"],
    },
  ],
};

const json = (response: unknown) =>
  new Response(JSON.stringify({ response }), {
    headers: { "Content-Type": "application/json" },
  });

const authServiceHandlers = (consumers: () => TConsumer[], calls: TCalls) => [
  http.get(AUTH_SERVICE_PATH, () => json(consumers())),
  http.post(AUTH_SERVICE_PATH, async ({ request }) => {
    calls.saved.push((await request.json()) as TSavedKeys);
    return json(true);
  }),
  http.post(`${AUTH_SERVICE_PATH}/externaldb/test`, async ({ request }) => {
    calls.tested.push((await request.json()) as Record<string, unknown>);
    return json(calls.testAnswers.shift() ?? { success: true });
  }),
];

const quotaWithoutThirdParty = () =>
  http.get(QUOTA_PATH, () => {
    const body = quotaSuccess();
    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          features: body.response.features.map((feature) =>
            feature.id === "thirdparty" ? { ...feature, value: false } : feature,
          ),
        },
      }),
    );
  });

test.describe("Third-party services", () => {
  test("Each service shows whether it is on: a service with keys and one fixed by the installation are on, the fixed one locked", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...authServiceHandlers(
        () => [google("client-id"), fixedService, paidStorage],
        newCalls(),
      ),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggle = (name: string, testId = `${name}_item`) =>
      page.getByTestId(testId).getByTestId("consumer_toggle_button").locator("input");

    await expect(toggle("google")).toBeChecked();
    await expect(toggle("google")).toBeEnabled();
    await expect(toggle("facebook")).toBeChecked();
    await expect(toggle("facebook")).toBeDisabled();
    await expect(toggle("dropbox", "consumer_dropbox_item")).not.toBeChecked();
    await expect(toggle("dropbox", "consumer_dropbox_item")).toBeEnabled();
    await expect(page.getByText("Included in Business plan")).toHaveCount(0);
  });

  test("In the cloud without the feature the paid services follow Included in Business plan with the paid badge and cannot be switched on", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      quotaWithoutThirdParty(),
      ...authServiceHandlers(() => [google(), paidStorage], newCalls()),
    );

    await page.goto(`${baseUrl}${URL}`);

    await expect(page.getByText("Included in Business plan")).toBeVisible();
    await expect(page.getByText("Paid", { exact: true })).toBeVisible();
    await expect(
      page
        .getByTestId("consumer_dropbox_item")
        .getByTestId("consumer_toggle_button")
        .locator("input"),
    ).toBeDisabled();
    await expect(
      page
        .getByTestId("google_item")
        .getByTestId("consumer_toggle_button")
        .locator("input"),
    ).toBeEnabled();
  });

  test("On a server installation the paid services can be switched on without the feature", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      quotaWithoutThirdParty(),
      ...authServiceHandlers(() => [google(), paidStorage], newCalls()),
    );

    await page.goto(`${baseUrl}${URL}`);

    await expect(
      page
        .getByTestId("consumer_dropbox_item")
        .getByTestId("consumer_toggle_button")
        .locator("input"),
    ).toBeEnabled();
  });

  test("Switching a service on asks for every key, sends them without spaces and shows the service on", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...authServiceHandlers(
        () => [calls.saved.length ? google("client-id") : google()],
        calls,
      ),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggle = page
      .getByTestId("google_item")
      .getByTestId("consumer_toggle_button");
    await toggle.click();

    const enable = page.getByTestId("consumer_dialog_enable_button");
    await expect(enable).toBeDisabled();

    await page.getByTestId("googleClientId_input").fill("client id");
    await expect(enable).toBeDisabled();
    await page.getByTestId("googleClientSecret_input").fill("secret");
    await enable.click();

    await expect(
      page.getByTestId("toast-content").getByText("Updated successfully"),
    ).toBeVisible();
    expect(calls.saved).toEqual([
      {
        name: "google",
        props: [
          { name: "googleClientId", value: "clientid" },
          { name: "googleClientSecret", value: "secret" },
        ],
      },
    ]);
    await expect(toggle.locator("input")).toBeChecked();
  });

  test("Switching a service off clears its keys", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...authServiceHandlers(
        () => [calls.saved.length ? google() : google("client-id")],
        calls,
      ),
    );

    await page.goto(`${baseUrl}${URL}`);

    const toggle = page
      .getByTestId("google_item")
      .getByTestId("consumer_toggle_button");
    await expect(toggle.locator("input")).toBeChecked();
    await toggle.click();

    await expect(
      page.getByTestId("toast-content").getByText("Deactivated successfully"),
    ).toBeVisible();
    expect(calls.saved).toEqual([
      {
        name: "google",
        props: [
          { name: "googleClientId", value: "" },
          { name: "googleClientSecret", value: "" },
        ],
      },
    ]);
    await expect(toggle.locator("input")).not.toBeChecked();
  });

  test("An external database shows the fields of its type, tests the connection and is saved only after a successful test", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const calls = newCalls();
    calls.testAnswers.push({ success: false, error: "Access denied for user" });
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...authServiceHandlers(() => [externalDb], calls),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page
      .getByTestId("externaldb_item")
      .getByTestId("consumer_toggle_button")
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("#dbHost")).toBeVisible();
    await expect(dialog.locator("#sqliteFilePath")).toHaveCount(0);

    const testConnection = dialog.getByRole("button", {
      name: "Test connection",
    });
    const enable = dialog.getByRole("button", { name: "Enable" });
    await expect(testConnection).toBeDisabled();

    await dialog.locator("#dbHost").fill("db.example.com");
    await dialog.locator("#dbPort").fill("3306");
    await dialog.locator("#dbName").fill("forms");
    await dialog.locator("#dbUser").fill("docspace");
    await dialog.locator("#dbPassword").fill("wrong");

    await testConnection.click();
    await expect(dialog.getByText("Connection failed")).toBeVisible();
    await expect(
      page.getByTestId("toast-content").getByText("Access denied for user"),
    ).toBeVisible();
    await expect(enable).toBeDisabled();

    await dialog.locator("#dbPassword").fill("right");
    await expect(dialog.getByText("Connection failed")).toHaveCount(0);
    await testConnection.click();
    await expect(dialog.getByText("Connected", { exact: true })).toBeVisible();
    expect(calls.tested[1]).toEqual({
      databaseType: "mysql",
      dbHost: "db.example.com",
      dbPort: 3306,
      dbName: "forms",
      dbUser: "docspace",
      dbPassword: "right",
      dbSsl: false,
    });

    await enable.click();

    await expect.poll(() => calls.saved.length).toBe(1);
    expect(calls.tested).toHaveLength(3);
    expect(calls.saved[0].name).toBe("externaldb");
    expect(calls.saved[0].props).toContainEqual({
      name: "dbPort",
      value: "3306",
    });
    expect(
      calls.saved[0].props.map((prop) => prop.name),
    ).not.toContain("sqliteFilePath");
    await expect(
      page.getByTestId("toast-content").getByText("Updated successfully"),
    ).toBeVisible();
  });

  test("An external database of the SQLite type asks for the file path alone", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...authServiceHandlers(() => [externalDb], newCalls()),
    );

    await page.goto(`${baseUrl}${URL}`);

    await page
      .getByTestId("externaldb_item")
      .getByTestId("consumer_toggle_button")
      .click();

    const dialog = page.getByRole("dialog");
    await dialog.getByText("mysql", { exact: true }).click();
    await page.getByText("sqlite", { exact: true }).click();

    await expect(dialog.locator("#sqliteFilePath")).toBeVisible();
    await expect(dialog.locator("#dbHost")).toHaveCount(0);
  });
});
