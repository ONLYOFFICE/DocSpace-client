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
import { http } from "msw";

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import {
  capabilitiesHandler,
  filesSettingsHandler,
  mockWorkspaceAppPlugin,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsListHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PROFILE_URL = "/profile/login";

type TFakeTabPlugin = {
  name: string;
  access?: { usersTypes?: string[]; users?: string[]; groups?: string[] };
};

const fakePluginSource = (plugin: TFakeTabPlugin) => `
import { jsx, jsxs } from "react/jsx-runtime";
import { Text } from "@onlyoffice/apps-ui-kit";
import { useCurrentUser } from "@onlyoffice/docspace-plugin-sdk/react";

const config = ${JSON.stringify(plugin)};

const CalendarTab = () => {
  const user = useCurrentUser();

  return jsxs("div", {
    id: config.name + "-tab",
    children: [
      jsx(Text, { fontSize: "16px", fontWeight: 700, children: "Calendar sync" }),
      jsx(Text, {
        children: "Events of " + (user ? user.displayName.trim() : "") + " are synced with the team calendar.",
      }),
    ],
  });
};

const tabs = new Map([
  [config.name + "-calendar", { key: config.name + "-calendar", label: "Calendar", component: CalendarTab, ...config.access }],
]);

export default {
  status: "active",
  onLoadCallback: async () => {},
  updateStatus: () => {},
  getStatus: () => "active",
  setOnLoadCallback: () => {},
  profileTabItems: tabs,
  addProfileTabItem: (item) => tabs.set(item.key, item),
  getProfileTabItems: () => tabs,
  updateProfileTabItem: (item) => tabs.set(item.key, item),
};
`;

const fakePluginManifest = (plugin: TFakeTabPlugin): TAPIPlugin => ({
  ...mockWorkspaceAppPlugin,
  name: plugin.name,
  version: "1.0.0",
  description: `${plugin.name} description`,
  pluginName: plugin.name.replace(/-/g, ""),
  scopes: "ProfileTab",
  image: "icon.svg",
  url: `/plugins/${plugin.name}/plugin.js`,
  settings: "",
});

const fakePluginHandlers = (plugins: TFakeTabPlugin[]) => [
  webPluginsListHandler(TEST_PORT, plugins.map(fakePluginManifest)),
  ...plugins.map((plugin) =>
    http.get(
      `*/plugins/${plugin.name}/plugin.js`,
      () =>
        new Response(fakePluginSource(plugin), {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        }),
    ),
  ),
];

const openWithPlugins = async (
  page: Page,
  url: string,
  plugins: TFakeTabPlugin[],
) => {
  const loaded = plugins.map(({ name }) =>
    page.waitForResponse(`**/plugins/${name}/plugin.js`),
  );
  await page.goto(url);
  await Promise.all(loaded);
};

const card = (page: Page) => page.getByTestId("main-profile");
const tab = (page: Page, name: string) => page.getByRole("tab", { name });

test.describe("Profile tab plugin scope", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("The plugin's tab follows the portal's own and fills the page under the tab bar", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "hr" }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PROFILE_URL}`, plugins);

    await expect(page.getByRole("tab").last()).toHaveText("Calendar");

    await tab(page, "Calendar").click();
    await page.waitForURL("**/profile/p/hr-calendar");

    const content = page.locator("#hr-tab");
    await expect(content).toContainText("Events of Administrator are synced");

    const contentBox = await content.boundingBox();
    const bodyBox = await page.locator(".tabs-body").boundingBox();

    if (!contentBox || !bodyBox) throw new Error("The tab is not laid out");

    expect(contentBox.width).toBeCloseTo(bodyBox.width, 0);

    await page.mouse.move(0, 0);
    const box = await card(page).boundingBox();

    if (!box) throw new Error("The profile card is not laid out");

    await expectScreenshot(
      page,
      ["desktop", "plugins-profile-tab", "profile-tab.png"],
      { clip: { x: box.x, y: box.y + box.height, width: 1000, height: 160 } },
    );
  });

  test("A link straight to the plugin's tab opens it once the plugins load", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "hr" }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}/profile/p/hr-calendar`, plugins);

    await expect(page.locator("#hr-tab")).toBeVisible();
    await expect(tab(page, "Calendar")).toHaveAttribute("aria-selected", "true");
  });

  test("A plugin tab address no plugin owns sends the user to the Login tab", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "hr" }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}/profile/p/no-such-tab`, plugins);

    await page.waitForURL("**/profile/login");
    await expect(card(page)).toBeVisible();
  });

  test("A tab whose filters leave the user out is not shown", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      { name: "hr", access: { users: ["someone-else"], groups: [] } },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PROFILE_URL}`, plugins);

    await expect(tab(page, "Notifications")).toBeVisible();
    await expect(tab(page, "Calendar")).toHaveCount(0);
  });
});
