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

import type { Locator, Page } from "@playwright/test";
import { http } from "msw";

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import {
  filesSettingsHandler,
  groupHandler,
  groupsHandler,
  mockWorkspaceAppPlugin,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  selfInGroupsHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
  webPluginsListHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/workspace-app/plugin.js";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";
const DASHBOARD_URL = "/dashboard";
const PORTAL_SETTINGS_URL = "/portal-settings/integration/plugins";

const DEALS_KEY = "workspace-app-sample-deals";
const PIPELINE_KEY = "workspace-app-sample-pipeline";

const navItem = (page: Page) =>
  page.locator(`[data-item-id="plugin-navigation-${DEALS_KEY}"]`);
const dealsCard = (page: Page) =>
  page.locator(`[data-tour-id="dashboard-app-card-plugin-${DEALS_KEY}"]`);
const pipelineWidget = (page: Page) =>
  page.getByTestId(`dashboard-plugin-widget-${PIPELINE_KEY}`);

const openWithPlugin = async (page: Page, url: string) => {
  const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
  await page.goto(url);
  await pluginLoaded;
};

const screenshotOf = async (page: Page, locator: Locator, name: string) => {
  await locator.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);

  const clip = await locator.boundingBox();

  if (!clip) throw new Error(`${name}: the element has no box to capture`);

  await expectScreenshot(page, ["desktop", "plugins-workspace-app", name], {
    clip,
  });
};

test.describe("Workspace App Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      groupsHandler(TEST_PORT),
      groupHandler(TEST_PORT),
      webPluginsHandler(TEST_PORT, "withWorkspaceAppPlugin"),
    );
  });

  // ── 1. Home page card and widget ─────────────────────────────────────────────

  test("The navigation item's card joins the apps block of the Home page", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${DASHBOARD_URL}`);

    const card = dealsCard(page);

    await expect(card).toBeVisible();
    await expect(card).toContainText("Deals");
    await expect(card).toContainText(
      "Follow the deals of your sales team from proposal to won.",
    );
    await expect(
      card.getByTestId(`dashboard-app-open-plugin-${DEALS_KEY}`),
    ).toHaveText("Open deals");

    // Built-in cards come first; the plugin card is the last one in the grid.
    await expect(
      page.locator('[data-tour-id^="dashboard-app-card-"]').last(),
    ).toHaveAttribute("data-tour-id", `dashboard-app-card-plugin-${DEALS_KEY}`);

    await screenshotOf(page, card, "workspace-app_dashboard-card.png");
  });

  test("The card button opens the navigation item's page", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${DASHBOARD_URL}`);

    await dealsCard(page)
      .getByTestId(`dashboard-app-open-plugin-${DEALS_KEY}`)
      .click();

    await page.waitForURL(`**/p/${DEALS_KEY}`);
    await expect(page.locator(`#${DEALS_KEY}-page`)).toBeVisible();
  });

  test("The widget is a Home page block headed by its title and subtitle", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${DASHBOARD_URL}`);

    const widget = pipelineWidget(page);

    await expect(widget).toBeVisible();
    await expect(widget).toContainText("Pipeline");
    await expect(widget).toContainText("Open deals by stage");
    await expect(widget.locator(`#${PIPELINE_KEY}`)).toContainText("$13,000");

    await screenshotOf(page, widget, "workspace-app_dashboard-widget.png");
  });

  // ── 2. Access from the plugin settings ───────────────────────────────────────

  test("A member of a listed group sees the entry, the card and the widget", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      webPluginsHandler(TEST_PORT, "withRestrictedWorkspaceAppPlugin"),
      selfInGroupsHandler(TEST_PORT, "regular", [
        { id: "sales-group-id", name: "Sales" },
      ]),
    );

    await openWithPlugin(page, `${baseUrl}${PERSONAL_FOLDER_URL}`);
    await expect(navItem(page)).toBeVisible();

    await openWithPlugin(page, `${baseUrl}${DASHBOARD_URL}`);
    await expect(dealsCard(page)).toBeVisible();
    await expect(pipelineWidget(page)).toBeVisible();
  });

  test("Someone outside the lists sees none of them", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      webPluginsHandler(TEST_PORT, "withRestrictedWorkspaceAppPlugin"),
      selfInGroupsHandler(TEST_PORT, "regular", [
        { id: "support-group-id", name: "Support" },
      ]),
    );

    await openWithPlugin(page, `${baseUrl}${PERSONAL_FOLDER_URL}`);
    await expect(page.locator("[data-item-id]").first()).toBeVisible();
    await expect(navItem(page)).toHaveCount(0);

    await openWithPlugin(page, `${baseUrl}${DASHBOARD_URL}`);
    await expect(
      page.locator('[data-tour-id="dashboard-app-card-ai-files"]'),
    ).toBeVisible();
    await expect(dealsCard(page)).toHaveCount(0);
    await expect(pipelineWidget(page)).toHaveCount(0);
  });

  // ── 3. Picking groups in the plugin settings ─────────────────────────────────

  test("The selector opens over the settings dialog and the picked group lands in the form", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${PORTAL_SETTINGS_URL}`);

    await page.getByTestId("open_settings_icon_button").first().click();

    const dialog = page
      .getByTestId("settings-plugin-dialog")
      .getByTestId("modal-dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByTestId("toggle-button-container").click();
    await dialog.getByRole("button", { name: "Add groups" }).click();

    const selectorHeader = page.getByText("Add groups", { exact: true }).last();
    await expect(selectorHeader).toBeVisible();
    await page.locator('.selector-item_label[aria-label="Sales"]').click();
    await page.getByRole("button", { name: "Add (1)", exact: true }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Sales", { exact: true })).toBeVisible();
    await expect(dialog.getByText("No one is listed")).toHaveCount(0);

    await screenshotOf(page, dialog, "workspace-app_settings-access.png");
  });
});

// ─── Several Home page plugins ────────────────────────────────────────────────
//
// Each fake plugin is a small ES module served straight from this spec: one
// sidebar entry (with or without a Home page card) and one widget, with the
// filters a test needs. Its keys start with the plugin name, so several of them
// can be installed side by side.

type TFakeAccess = {
  users?: string[];
  groups?: string[];
  usersTypes?: string[];
};

type TFakePlugin = {
  name: string;
  enabled?: boolean;
  entry?: {
    label: string;
    card?: { description?: string; buttonLabel?: string };
    cardToast?: string;
    access?: TFakeAccess;
  };
  widget?: {
    title?: string;
    description?: string;
    text: string;
    access?: TFakeAccess;
  };
};

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="3" fill="currentColor"/></svg>';

const fakePluginSource = (plugin: TFakePlugin) => `
import { jsx } from "react/jsx-runtime";

const config = ${JSON.stringify(plugin)};
const entries = new Map();
const widgets = new Map();

if (config.entry) {
  const key = config.name + "-entry";
  const { label, card, cardToast, access } = config.entry;

  entries.set(key, {
    key,
    label,
    icon: "icon.svg",
    component: () => jsx("div", { id: key + "-page", children: label }),
    ...access,
    ...(card && {
      dashboardCard: {
        ...card,
        ...(cardToast && {
          onClick: () => ({
            actions: ["show-toast"],
            toastProps: [{ type: "success", title: cardToast }],
          }),
        }),
      },
    }),
  });
}

if (config.widget) {
  const key = config.name + "-widget";
  const { title, description, text, access } = config.widget;

  widgets.set(key, {
    key,
    title,
    description,
    component: () => jsx("p", { id: key + "-content", children: text }),
    ...access,
  });
}

export default {
  status: "active",
  onLoadCallback: async () => {},
  updateStatus: () => {},
  getStatus: () => "active",
  setOnLoadCallback: () => {},
  articleNavigationItems: entries,
  addArticleNavigationItem: (item) => entries.set(item.key, item),
  getArticleNavigationItems: () => entries,
  updateArticleNavigationItem: (item) => entries.set(item.key, item),
  dashboardWidgetItems: widgets,
  addDashboardWidgetItem: (item) => widgets.set(item.key, item),
  getDashboardWidgetItems: () => widgets,
  updateDashboardWidgetItem: (item) => widgets.set(item.key, item),
};
`;

const fakePluginManifest = (plugin: TFakePlugin): TAPIPlugin => ({
  ...mockWorkspaceAppPlugin,
  name: plugin.name,
  version: "1.0.0",
  description: `${plugin.name} description`,
  pluginName: plugin.name.replace(/-/g, ""),
  scopes: "ArticleNavigation,DashboardWidget",
  image: "icon.svg",
  url: `/plugins/${plugin.name}/plugin.js`,
  enabled: plugin.enabled ?? true,
  settings: "",
});

const fakePluginHandlers = (plugins: TFakePlugin[]) => [
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
  http.get(
    "*/plugins/:pluginName/assets/icon.svg",
    () =>
      new Response(ICON_SVG, { headers: { "Content-Type": "image/svg+xml" } }),
  ),
];

const openWithPlugins = async (
  page: Page,
  url: string,
  plugins: TFakePlugin[],
) => {
  const loaded = plugins.map(({ name }) =>
    page.waitForResponse(`**/plugins/${name}/plugin.js`),
  );
  await page.goto(url);
  await Promise.all(loaded);
};

const keysOf = (page: Page, attribute: string, prefix: string) =>
  page
    .locator(`[${attribute}^="${prefix}"]`)
    .evaluateAll(
      (elements, [name, start]) =>
        elements.map((element) =>
          (element.getAttribute(name) ?? "").slice(start.length),
        ),
      [attribute, prefix],
    );

const entryKeys = (page: Page) =>
  keysOf(page, "data-item-id", "plugin-navigation-");
const cardKeys = (page: Page) =>
  keysOf(page, "data-tour-id", "dashboard-app-card-plugin-");
const widgetKeys = (page: Page) =>
  keysOf(page, "data-testid", "dashboard-plugin-widget-");

const fakeEntry = (page: Page, name: string) =>
  page.locator(`[data-item-id="plugin-navigation-${name}-entry"]`);
const fakeCard = (page: Page, name: string) =>
  page.locator(`[data-tour-id="dashboard-app-card-plugin-${name}-entry"]`);
const fakeWidget = (page: Page, name: string) =>
  page.getByTestId(`dashboard-plugin-widget-${name}-widget`);

const appPlugin = (name: string, access?: TFakeAccess): TFakePlugin => ({
  name,
  entry: {
    label: name,
    card: { buttonLabel: "Open", description: `All about ${name}` },
    access,
  },
  widget: { title: `${name} widget`, text: `${name} content`, access },
});

test.describe("Several Home page plugins", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("Entries, cards and widgets follow the plugin names, not the order the plugins load in", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      appPlugin("cws-03-mail"),
      appPlugin("cws-01-chat"),
      appPlugin("cws-02-crm"),
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);
    await expect(fakeEntry(page, "cws-03-mail")).toBeVisible();
    expect(await entryKeys(page)).toEqual([
      "cws-01-chat-entry",
      "cws-02-crm-entry",
      "cws-03-mail-entry",
    ]);

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-03-mail")).toBeVisible();
    expect(await cardKeys(page)).toEqual([
      "cws-01-chat-entry",
      "cws-02-crm-entry",
      "cws-03-mail-entry",
    ]);
    expect(await widgetKeys(page)).toEqual([
      "cws-01-chat-widget",
      "cws-02-crm-widget",
      "cws-03-mail-widget",
    ]);

    await screenshotOf(
      page,
      page.locator('[data-tour-id="dashboard-apps"]'),
      "workspace-app_dashboard-several-cards.png",
    );
  });

  test("Each plugin's access is applied on its own", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      appPlugin("cws-01-chat"),
      appPlugin("cws-02-crm", { groups: ["sales-group-id"] }),
      appPlugin("cws-03-mail", { users: ["someone-else-id"] }),
      appPlugin("cws-04-hr", { users: ["regular-user-id"] }),
    ];
    mockRequest.use(
      ...fakePluginHandlers(plugins),
      selfInGroupsHandler(TEST_PORT, "regular", [
        { id: "sales-group-id", name: "Sales" },
      ]),
    );

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);
    await expect(fakeEntry(page, "cws-04-hr")).toBeVisible();
    expect(await entryKeys(page)).toEqual([
      "cws-01-chat-entry",
      "cws-02-crm-entry",
      "cws-04-hr-entry",
    ]);

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-04-hr")).toBeVisible();
    expect(await cardKeys(page)).toEqual([
      "cws-01-chat-entry",
      "cws-02-crm-entry",
      "cws-04-hr-entry",
    ]);
    expect(await widgetKeys(page)).toEqual([
      "cws-01-chat-widget",
      "cws-02-crm-widget",
      "cws-04-hr-widget",
    ]);
  });

  test("A role filter on a widget keeps it for the listed roles only", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins: TFakePlugin[] = [
      appPlugin("cws-01-chat"),
      {
        name: "cws-02-monitoring",
        widget: {
          title: "Server load",
          text: "CPU 42%",
          access: { usersTypes: ["Owner", "FullAdmin"] },
        },
      },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-02-monitoring")).toContainText(
      "CPU 42%",
    );

    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-01-chat")).toBeVisible();
    await expect(fakeWidget(page, "cws-02-monitoring")).toHaveCount(0);
  });

  test("Only entries with a card reach the apps block, and a widget needs no entry", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins: TFakePlugin[] = [
      appPlugin("cws-01-chat"),
      { name: "cws-02-wiki", entry: { label: "Wiki" } },
      {
        name: "cws-03-links",
        widget: { title: "Company links", text: "Intranet, HR portal" },
      },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);
    await expect(fakeEntry(page, "cws-02-wiki")).toBeVisible();
    expect(await entryKeys(page)).toEqual([
      "cws-01-chat-entry",
      "cws-02-wiki-entry",
    ]);

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-03-links")).toContainText(
      "Intranet, HR portal",
    );
    expect(await cardKeys(page)).toEqual(["cws-01-chat-entry"]);
    expect(await widgetKeys(page)).toEqual([
      "cws-01-chat-widget",
      "cws-03-links-widget",
    ]);
  });

  test("A disabled plugin adds nothing", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      appPlugin("cws-01-chat"),
      { ...appPlugin("cws-02-crm"), enabled: false },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);
    await expect(fakeWidget(page, "cws-01-chat")).toBeVisible();
    expect(await cardKeys(page)).toEqual(["cws-01-chat-entry"]);
    expect(await widgetKeys(page)).toEqual(["cws-01-chat-widget"]);
  });

  test("A card and a widget take from the plugin manifest what they leave out", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins: TFakePlugin[] = [
      {
        name: "cws-01-notes",
        entry: { label: "Notes", card: {} },
        widget: { text: "Two notes today" },
      },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);

    const card = fakeCard(page, "cws-01-notes");
    const cardButton = card.getByTestId(
      "dashboard-app-open-plugin-cws-01-notes-entry",
    );
    await expect(card).toContainText("Notes");
    await expect(card).toContainText("cws-01-notes description");
    await expect(cardButton).toHaveText("Open");

    const widget = fakeWidget(page, "cws-01-notes");
    await expect(widget).toContainText("cws-01-notes");
    await expect(widget).toContainText("Two notes today");

    await cardButton.click();
    await page.waitForURL("**/p/cws-01-notes-entry");
    await expect(page.locator("#cws-01-notes-entry-page")).toBeVisible();
  });

  test("A card with its own action runs it instead of opening the page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins: TFakePlugin[] = [
      {
        name: "cws-01-mail",
        entry: {
          label: "Mail",
          card: { buttonLabel: "Write a letter" },
          cardToast: "New letter",
        },
      },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);

    const cardButton = fakeCard(page, "cws-01-mail").getByTestId(
      "dashboard-app-open-plugin-cws-01-mail-entry",
    );
    await expect(cardButton).toHaveText("Write a letter");
    await cardButton.click();

    await expect(
      page.getByTestId("toast-content").filter({ hasText: "New letter" }),
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(DASHBOARD_URL);
  });

  test("Several widgets stack one under another at full width", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins: TFakePlugin[] = [
      {
        name: "cws-01-day",
        widget: {
          title: "My day",
          description: "What is planned for today",
          text: "3 meetings, 2 tasks",
        },
      },
      {
        name: "cws-02-links",
        widget: { title: "Company links", text: "Intranet, HR portal" },
      },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${DASHBOARD_URL}`, plugins);

    const first = fakeWidget(page, "cws-01-day");
    const second = fakeWidget(page, "cws-02-links");
    await expect(second).toBeVisible();

    const firstBox = await first.boundingBox();
    const secondBox = await second.boundingBox();

    if (!firstBox || !secondBox) throw new Error("A widget has no box");

    expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
    expect(secondBox.x).toBe(firstBox.x);
    expect(secondBox.width).toBe(firstBox.width);

    await expect(first).toContainText("What is planned for today");
    await screenshotOf(
      page,
      first,
      "workspace-app_dashboard-widget-with-subtitle.png",
    );
  });
});
