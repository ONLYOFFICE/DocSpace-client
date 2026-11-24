// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { Page } from "@playwright/test";

import {
  capabilitiesHandler,
  filesSettingsHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";
import { fakePlugins, openWithPlugins } from "../helpers/plugins";

const PROFILE_URL = "/profile/login";
const PHONE = { width: 428, height: 830 };

type TFakeFieldPlugin = {
  name: string;
  access?: { usersTypes?: string[]; users?: string[]; groups?: string[] };
};

const fakePluginSource = (plugin: TFakeFieldPlugin) => `
import { jsx } from "react/jsx-runtime";
import { Button, Text } from "@onlyoffice/apps-ui-kit";
import { usePluginActions } from "@onlyoffice/docspace-plugin-sdk/react";

const config = ${JSON.stringify(plugin)};

const EmployeeId = () => jsx(Text, { fontWeight: 600, children: "EMP-0042" });

const ConnectTelegram = () => {
  const { showToast } = usePluginActions();

  return jsx(Button, {
    id: config.name + "-connect",
    size: "extraSmall",
    label: "Connect",
    onClick: () => showToast({ type: "success", title: "Telegram connected" }),
  });
};

const fields = new Map([
  [config.name + "-employee-id", { key: config.name + "-employee-id", label: "Employee ID", component: EmployeeId, ...config.access }],
  [config.name + "-telegram", { key: config.name + "-telegram", label: "Telegram", component: ConnectTelegram, ...config.access }],
]);

export default {
  status: "active",
  onLoadCallback: async () => {},
  updateStatus: () => {},
  getStatus: () => "active",
  setOnLoadCallback: () => {},
  profileFieldItems: fields,
  addProfileFieldItem: (item) => fields.set(item.key, item),
  getProfileFieldItems: () => fields,
  updateProfileFieldItem: (item) => fields.set(item.key, item),
};
`;

const fakePluginHandlers = (plugins: TFakeFieldPlugin[]) =>
  fakePlugins(plugins, "ProfileField", fakePluginSource);

const card = (page: Page) => page.getByTestId("main-profile");
const row = (page: Page, key: string) =>
  page.getByTestId(`profile-plugin-field-${key}`);

const cardBox = async (page: Page) => {
  const box = await card(page).boundingBox();

  if (!box) throw new Error("The profile card is not laid out");

  return box;
};

test.describe("Profile field plugin scope", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("The plugin's rows follow the portal's own in the card, values in the value column", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "hr" }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PROFILE_URL}`, plugins);

    const employeeId = row(page, "hr-employee-id");
    await expect(employeeId).toContainText("Employee ID");
    await expect(employeeId).toContainText("EMP-0042");
    await expect(row(page, "hr-telegram")).toContainText("Telegram");

    const valueBox = await employeeId.getByText("EMP-0042").boundingBox();
    const ownerBox = await card(page)
      .getByText("Owner", { exact: true })
      .first()
      .boundingBox();

    if (!valueBox || !ownerBox) throw new Error("The card is not laid out");

    expect(valueBox.x).toBeCloseTo(ownerBox.x, 0);
    expect(valueBox.y).toBeGreaterThan(ownerBox.y + ownerBox.height);

    await page.mouse.move(0, 0);
    await expectScreenshot(
      page,
      ["desktop", "plugins-profile-field", "profile-field_card.png"],
      { clip: await cardBox(page) },
    );

    await page.locator("#hr-connect").click();
    await expect(
      page.locator(".Toastify__toast").filter({ hasText: "Telegram connected" }),
    ).toBeVisible();
  });

  test("Rows whose filters leave the user out are not shown", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      { name: "hr", access: { users: ["someone-else"], groups: [] } },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PROFILE_URL}`, plugins);

    await expect(card(page).getByText("Owner", { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("profile-plugin-fields")).toHaveCount(0);
  });

  test("On a phone the rows become cards after the portal's own", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "hr" }];
    mockRequest.use(...fakePluginHandlers(plugins));
    await page.setViewportSize(PHONE);

    await openWithPlugins(page, `${baseUrl}${PROFILE_URL}`, plugins);

    const employeeId = row(page, "hr-employee-id");
    await expect(employeeId).toBeVisible();

    const language = await page
      .locator('[data-testid="language_combo_box"]:visible')
      .boundingBox();
    const rowBox = await employeeId.boundingBox();

    if (!language || !rowBox) throw new Error("The card is not laid out");

    expect(rowBox.y).toBeGreaterThan(language.y + language.height);

    await page.mouse.move(0, 0);
    await expectScreenshot(
      page,
      ["mobile", "plugins-profile-field", "profile-field_phone.png"],
      { clip: await cardBox(page) },
    );
  });
});
