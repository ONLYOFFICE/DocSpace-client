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
import { PluginFileType } from "../../helpers/plugins/enums";
import type { IContextMenuItemClient } from "../../helpers/plugins/types";

const keysFor = (pluginItemIds: (number | string)[], itemId: number | string) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: {} } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );
  store.contextMenuItems.set("only-42", {
    key: "only-42",
    pluginName: "pinned-file",
    itemId: pluginItemIds,
  } as IContextMenuItemClient);

  return store.getContextMenuKeysByType(
    PluginFileType.file,
    ".docx",
    null,
    {},
    itemId,
  );
};

describe("PluginStore.getContextMenuKeysByType: itemId", () => {
  it("offers the item for a listed id", () => {
    expect(keysFor([42], 42)).toEqual(["only-42"]);
  });

  it("withholds it from an id that is not listed", () => {
    expect(keysFor([42], 43)).toBeNull();
  });

  it("matches an id the plugin listed as a string, as the info panel tabs do", () => {
    expect(keysFor(["42"], 42)).toEqual(["only-42"]);
  });

  it("matches a numeric id against a string item id", () => {
    expect(keysFor([42], "42")).toEqual(["only-42"]);
  });
});
