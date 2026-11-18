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

import { describe, it, expect, vi } from "vitest";
import { runInAction } from "mobx";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  default: { emit: vi.fn(), on: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { plugins: { updatePlugin: vi.fn() } },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";
import { PluginUserRole } from "../../helpers/plugins/enums";

const Widget = () => null;

const plugin = (
  name: string,
  {
    navigation = [],
    widgets = [],
  }: {
    navigation?: Record<string, unknown>[];
    widgets?: Record<string, unknown>[];
  },
) => ({
  name,
  enabled: true,
  version: "1.0.0",
  nameLocale: `${name} title`,
  descriptionLocale: `${name} description`,
  iconUrl: `https://portal.test/plugins/${name}`,
  getArticleNavigationItems: () =>
    new Map(navigation.map((item) => [item.key as string, item])),
  getDashboardWidgetItems: () =>
    new Map(widgets.map((item) => [item.key as string, item])),
});

const createStore = (
  plugins: ReturnType<typeof plugin>[],
  user: Record<string, unknown> | null = { id: "employee", isOwner: true },
) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  runInAction(() => {
    store.plugins = plugins as unknown as TPlugin[];
  });

  for (const { name } of plugins) {
    store.updateArticleNavigationItems(name);
    store.updateDashboardWidgetItems(name);
  }

  return store;
};

const widgetKeys = (store: PluginStore) =>
  store.dashboardWidgetItemsList.map(({ key }) => key);

describe("PluginStore Home page card", () => {
  it("takes the plugin description for a card that has none", () => {
    const store = createStore([
      plugin("crm", {
        navigation: [{ key: "deals", label: "Deals", icon: "deals.svg", dashboardCard: {} }],
      }),
    ]);

    expect(store.articleNavigationItemsList?.[0].value.dashboardCard).toEqual({
      description: "crm description",
    });
  });

  it("keeps the description a card sets itself and leaves an item without a card alone", () => {
    const store = createStore([
      plugin("crm", {
        navigation: [
          { key: "deals", label: "Deals", icon: "deals.svg", dashboardCard: { description: "Pipeline" } },
          { key: "reports", label: "Reports", icon: "reports.svg" },
        ],
      }),
    ]);

    const cards = store.articleNavigationItemsList?.map(({ value }) => value.dashboardCard);

    expect(cards).toEqual([{ description: "Pipeline" }, undefined]);
  });
});

describe("PluginStore Home page widgets", () => {
  it("titles a widget with the plugin name unless it has its own", () => {
    const store = createStore([
      plugin("crm", {
        widgets: [
          { key: "pipeline", component: Widget },
          { key: "forecast", title: "Forecast", component: Widget },
        ],
      }),
    ]);

    expect(store.dashboardWidgetItemsList.map(({ value }) => value.title)).toEqual([
      "crm title",
      "Forecast",
    ]);
  });

  it("drops the widgets the user has no access to", () => {
    const plugins = [
      plugin("crm", {
        widgets: [{ key: "pipeline", component: Widget, groups: ["sales"], users: ["director"] }],
      }),
    ];

    expect(widgetKeys(createStore(plugins, { id: "employee", isOwner: true, groups: [{ id: "support" }] }))).toEqual([]);
    expect(widgetKeys(createStore(plugins, { id: "seller", isOwner: true, groups: [{ id: "sales" }] }))).toEqual(["pipeline"]);
    expect(widgetKeys(createStore(plugins, { id: "director", isOwner: true }))).toEqual(["pipeline"]);
  });

  it("drops a widget meant for other roles", () => {
    const store = createStore(
      [
        plugin("monitoring", {
          widgets: [{ key: "cpu", component: Widget, usersTypes: [PluginUserRole.owner, PluginUserRole.fullAdmin] }],
        }),
      ],
      { id: "employee", isCollaborator: true },
    );

    expect(widgetKeys(store)).toEqual([]);
  });

  it("lists the widgets by plugin name, not by the order the plugins loaded in", () => {
    const store = createStore([
      plugin("cws-03-mail", { widgets: [{ key: "inbox", component: Widget }] }),
      plugin("cws-01-chat", { widgets: [{ key: "unread", component: Widget }] }),
    ]);

    expect(widgetKeys(store)).toEqual(["unread", "inbox"]);
  });

  it("takes a plugin's widgets back when it is deactivated", () => {
    const crm = plugin("crm", { widgets: [{ key: "pipeline", component: Widget }] });
    const store = createStore([crm]);

    store.deactivateDashboardWidgetItems(crm as unknown as TPlugin);

    expect(widgetKeys(store)).toEqual([]);
  });

  it("puts a re-enabled plugin's entries, cards and widgets back in plugin name order", () => {
    const chat = plugin("cws-01-chat", {
      navigation: [{ key: "chat", label: "Chat", icon: "chat.svg", dashboardCard: {} }],
      widgets: [{ key: "unread", component: Widget }],
    });
    const crm = plugin("cws-02-crm", {
      navigation: [{ key: "deals", label: "Deals", icon: "deals.svg", dashboardCard: {} }],
      widgets: [{ key: "pipeline", component: Widget }],
    });
    const mail = plugin("cws-03-mail", {
      navigation: [{ key: "mail", label: "Mail", icon: "mail.svg", dashboardCard: {} }],
      widgets: [{ key: "inbox", component: Widget }],
    });
    const store = createStore([chat, crm, mail]);

    store.deactivateArticleNavigationItems(crm as unknown as TPlugin);
    store.deactivateDashboardWidgetItems(crm as unknown as TPlugin);

    expect(store.articleNavigationItemsList?.map(({ key }) => key)).toEqual(["chat", "mail"]);
    expect(widgetKeys(store)).toEqual(["unread", "inbox"]);

    store.updateArticleNavigationItems(crm.name);
    store.updateDashboardWidgetItems(crm.name);

    expect(store.articleNavigationItemsList?.map(({ key }) => key)).toEqual(["chat", "deals", "mail"]);
    expect(widgetKeys(store)).toEqual(["unread", "pipeline", "inbox"]);
  });
});
