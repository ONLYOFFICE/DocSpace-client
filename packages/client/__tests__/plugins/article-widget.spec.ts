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

import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";
import { fakePlugins, openWithPlugins } from "../helpers/plugins";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";
const PORTAL_SETTINGS_URL = "/portal-settings/integration/plugins";
const PHONE = { width: 428, height: 830 };

type TFakeWidgetPlugin = {
  name: string;
  withIcon?: boolean;
  appears?: string[];
  access?: { usersTypes?: string[]; users?: string[]; groups?: string[] };
};

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M8.5 2a6.5 6.5 0 1 0 3.93 11.68l4.44 4.44a1 1 0 0 0 1.41-1.41l-4.44-4.44A6.5 6.5 0 0 0 8.5 2ZM4 8.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z"/></svg>';

const fakePluginSource = (plugin: TFakeWidgetPlugin) => `
import { jsx } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { SearchInput } from "@onlyoffice/apps-ui-kit";
import { usePluginActions } from "@onlyoffice/docspace-plugin-sdk/react";

const config = ${JSON.stringify(plugin)};
const pageKey = config.name + "-results";

let query = "";
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getQuery = () => query;
const setQuery = (value) => {
  query = value;
  listeners.forEach((listener) => listener());
};
const useQuery = () => useSyncExternalStore(subscribe, getQuery, getQuery);

const SearchWidget = () => {
  const { navigate } = usePluginActions();
  const value = useQuery();

  return jsx(SearchInput, {
    id: config.name + "-input",
    size: "base",
    scale: true,
    value,
    placeholder: "Search files",
    refreshTimeout: 100,
    onChange: (next) => {
      setQuery(next);
      if (next.trim()) navigate("/p/" + pageKey);
    },
    onClearSearch: () => setQuery(""),
  });
};

const ResultsPage = () => {
  const value = useQuery();

  return jsx("p", { id: pageKey + "-page", children: "Results for " + value });
};

const entries = new Map([
  [pageKey, { key: pageKey, label: "File search", icon: "icon.svg", component: ResultsPage }],
]);

export default {
  status: "active",
  onLoadCallback: async () => {},
  updateStatus: () => {},
  getStatus: () => "active",
  setOnLoadCallback: () => {},
  articleWidgetItem: {
    component: SearchWidget,
    ...(config.withIcon && { icon: "icon.svg" }),
    ...(config.appears && { appears: config.appears }),
    ...config.access,
  },
  setArticleWidgetItem(item) {
    this.articleWidgetItem = item;
  },
  getArticleWidgetItem() {
    return this.articleWidgetItem;
  },
  articleNavigationItems: entries,
  addArticleNavigationItem: (item) => entries.set(item.key, item),
  getArticleNavigationItems: () => entries,
  updateArticleNavigationItem: (item) => entries.set(item.key, item),
};
`;

const fakePluginHandlers = (plugins: TFakeWidgetPlugin[]) =>
  fakePlugins(plugins, "ArticleWidget,ArticleNavigation", fakePluginSource, ICON_SVG);

const collapseSidebar = (page: Page) =>
  page.addInitScript(() =>
    localStorage.setItem("home_showSidebarText", "false"),
  );

const slot = (page: Page) => page.getByTestId("article-plugin-widget");
const searchInput = (page: Page, name: string) =>
  page.locator(`input#${name}-input`);
const collapsedIcon = (page: Page) =>
  slot(page).locator('[data-item-id="article-plugin-widget"]');
const dropdown = (page: Page) =>
  page.getByTestId("article-plugin-widget-dropdown");

const sidebarTop = async (page: Page, height: number) => {
  const box = await page.locator("#article-container").boundingBox();

  if (!box) throw new Error("The sidebar is not laid out");

  return { x: box.x, y: box.y, width: box.width, height };
};

const search = async (page: Page, input: Locator, text: string) => {
  await input.fill(text);
  await page.waitForURL("**/p/*-results");
};

test.describe("Article Widget plugin scope", () => {
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

  // ── 1. Expanded sidebar ──────────────────────────────────────────────────────

  test("The widget sits under the logo, above the navigation", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "file-search", withIcon: true }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await expect(searchInput(page, "file-search")).toBeVisible();

    const slotBox = await slot(page).boundingBox();
    const firstEntryBox = await page
      .locator("#article-container [data-item-id]")
      .first()
      .boundingBox();

    if (!slotBox || !firstEntryBox)
      throw new Error("The sidebar is not laid out");

    expect(slotBox.y + slotBox.height).toBeLessThanOrEqual(firstEntryBox.y);

    await page.mouse.move(0, 0);
    await expectScreenshot(
      page,
      ["desktop", "plugins-article-widget", "article-widget_expanded.png"],
      { clip: await sidebarTop(page, 240) },
    );
  });

  test("Typing in the widget opens the plugin page with the query", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "file-search", withIcon: true }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);
    await search(page, searchInput(page, "file-search"), "report");

    await expect(page.locator("#file-search-results-page")).toHaveText(
      "Results for report",
    );
    await expect(searchInput(page, "file-search")).toHaveValue("report");
  });

  // ── 2. One slot ──────────────────────────────────────────────────────────────

  test("Of several widgets the sidebar shows the first plugin's by name", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "search-b" }, { name: "search-a" }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await expect(searchInput(page, "search-a")).toBeVisible();
    await expect(slot(page)).toHaveCount(1);
    await expect(searchInput(page, "search-b")).toHaveCount(0);
  });

  test("A widget whose filters leave the user out gives the slot to the next one", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [
      { name: "search-a", access: { users: ["someone-else"], groups: [] } },
      { name: "search-b" },
    ];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await expect(searchInput(page, "search-b")).toBeVisible();
    await expect(searchInput(page, "search-a")).toHaveCount(0);
  });

  // ── 3. Sections ──────────────────────────────────────────────────────────────

  test("A widget shows only in the sections it lists, under the back arrow there", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "settings-search", appears: ["Settings"] }];
    mockRequest.use(...fakePluginHandlers(plugins));

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);
    await expect(
      page.locator('#article-container [data-item-id^="plugin-navigation-"]'),
    ).toBeVisible();
    await expect(slot(page)).toHaveCount(0);

    await openWithPlugins(page, `${baseUrl}${PORTAL_SETTINGS_URL}`, plugins);
    await expect(searchInput(page, "settings-search")).toBeVisible();

    const backBox = await page
      .locator('#article-container [class*="backButtonWrapper"]')
      .boundingBox();
    const slotBox = await slot(page).boundingBox();

    if (!backBox || !slotBox) throw new Error("The sidebar is not laid out");

    expect(slotBox.y).toBeGreaterThanOrEqual(backBox.y + backBox.height);

    await page.mouse.move(0, 0);
    await expectScreenshot(
      page,
      ["desktop", "plugins-article-widget", "article-widget_settings.png"],
      { clip: await sidebarTop(page, 260) },
    );
  });

  test("The widget stays at the top while a long menu scrolls under it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "settings-search", appears: ["Settings"] }];
    mockRequest.use(...fakePluginHandlers(plugins));
    await page.setViewportSize({ width: 1280, height: 480 });

    await openWithPlugins(page, `${baseUrl}${PORTAL_SETTINGS_URL}`, plugins);
    await expect(searchInput(page, "settings-search")).toBeVisible();

    const scroller = page.locator("#article-container .article-scroller");
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });

    const scrollerBox = await scroller.boundingBox();
    const slotBox = await slot(page).boundingBox();

    if (!scrollerBox || !slotBox) throw new Error("The sidebar is not laid out");

    expect(Math.round(slotBox.y)).toBe(Math.round(scrollerBox.y));
    await expect(searchInput(page, "settings-search")).toBeInViewport();
  });

  // ── 4. Collapsed sidebar ─────────────────────────────────────────────────────

  test("In a collapsed sidebar the icon opens the widget in a dropdown", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "file-search", withIcon: true }];
    mockRequest.use(...fakePluginHandlers(plugins));
    await collapseSidebar(page);

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await expect(collapsedIcon(page)).toBeVisible();
    await expect(searchInput(page, "file-search")).toHaveCount(0);

    await collapsedIcon(page).click();

    const input = searchInput(page, "file-search");
    await expect(input).toBeVisible();

    const iconBox = await collapsedIcon(page).boundingBox();
    const dropdownBox = await dropdown(page).boundingBox();

    if (!iconBox || !dropdownBox)
      throw new Error("The dropdown is not laid out");

    expect(dropdownBox.x).toBeGreaterThan(iconBox.x + iconBox.width);

    await page.mouse.move(0, 0);
    await expectScreenshot(
      page,
      [
        "desktop",
        "plugins-article-widget",
        "article-widget_collapsed-dropdown.png",
      ],
      { clip: { x: 0, y: 0, width: 360, height: 240 } },
    );

    await search(page, input, "report");

    await expect(page.locator("#file-search-results-page")).toHaveText(
      "Results for report",
    );
    await expect(searchInput(page, "file-search")).toHaveCount(0);
  });

  test("Without an icon a collapsed sidebar shows no widget", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "file-search" }];
    mockRequest.use(...fakePluginHandlers(plugins));
    await collapseSidebar(page);

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await expect(
      page.locator('#article-container [data-item-id^="plugin-navigation-"]'),
    ).toBeVisible();
    await expect(slot(page)).toHaveCount(0);
  });

  // ── 5. Phone ─────────────────────────────────────────────────────────────────

  test("On a phone the widget heads the drawer, which closes once it navigates", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const plugins = [{ name: "file-search", withIcon: true }];
    mockRequest.use(...fakePluginHandlers(plugins));
    await page.setViewportSize(PHONE);

    await openWithPlugins(page, `${baseUrl}${PERSONAL_FOLDER_URL}`, plugins);

    await page.locator('[name="catalog-burger"]').click();

    const sidebar = page.locator("#article-container");
    await expect(sidebar).toHaveAttribute("data-open", "true");

    const input = searchInput(page, "file-search");
    await expect(input).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "mobile",
      "plugins-article-widget",
      "article-widget_phone-drawer.png",
    ]);

    await search(page, input, "report");

    await expect(sidebar).toHaveAttribute("data-open", "false");
    await expect(page.locator("#file-search-results-page")).toBeVisible();
  });
});
