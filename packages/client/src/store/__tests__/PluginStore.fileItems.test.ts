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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: { emit: vi.fn(), on: vi.fn() },
  SocketCommands: { Subscribe: "subscribe" },
  SocketEvents: { ChangeWebPlugin: "change-web-plugin" },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
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

const PLUGIN = "Sample";
const ICON_URL = "https://portal.test/plugins/sample";

const withFileItem = (item: Record<string, unknown>) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  const plugin = {
    name: PLUGIN,
    enabled: true,
    version: "1.0.0",
    iconUrl: ICON_URL,
    getFileItems: () => new Map([[".md", { extension: ".md", ...item }]]),
  };

  runInAction(() => {
    store.plugins = [plugin as unknown as TPlugin];
  });

  store.updateFileItems(PLUGIN);

  return store.fileItems.get(".md");
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PluginStore file item icons", () => {
  it("builds both urls when the plugin ships both icons", () => {
    const item = withFileItem({
      fileRowIcon: "md-32.svg",
      fileTileIcon: "md-96.svg",
    });

    expect(item?.fileIcon).toBe(`${ICON_URL}/assets/md-32.svg?hash=1.0.0`);
    expect(item?.fileIconTile).toBe(`${ICON_URL}/assets/md-96.svg?hash=1.0.0`);
  });

  it("falls back to the row icon when no tile icon is declared", () => {
    const item = withFileItem({ fileRowIcon: "md-32.svg" });

    expect(item?.fileIconTile).toBe(`${ICON_URL}/assets/md-32.svg?hash=1.0.0`);
  });

  it("leaves both urls empty when the plugin ships no icon", () => {
    const item = withFileItem({ fileTypeName: "Markdown" });

    expect(item?.fileIcon).toBeUndefined();
    expect(item?.fileIconTile).toBeUndefined();
  });
});
