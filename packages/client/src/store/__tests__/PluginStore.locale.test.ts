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

vi.mock("@docspace/shared/api", () => ({ default: { plugins: {} } }));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";

const storeIn = (culture: string) =>
  new PluginStore(
    { culture } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

const plugin = (extra: Partial<TPlugin> = {}) =>
  ({
    name: "my-notes",
    description: "my-notes description",
    nameLocaleMap: { "en-US": "My notes", ru: "Заметки" },
    descriptionLocaleMap: { "en-US": "Keeps notes", ru: "Хранит заметки" },
    ...extra,
  }) as unknown as TPlugin;

describe("initLocalePlugin", () => {
  it("names a plugin from another region of the interface language", () => {
    const loaded = plugin();

    storeIn("en-GB").initLocalePlugin(loaded);

    expect(loaded.nameLocale).toBe("My notes");
    expect(loaded.descriptionLocale).toBe("Keeps notes");
  });

  it("takes the language the plugin reports for itself", () => {
    const loaded = plugin({ getLanguage: () => "ru" } as Partial<TPlugin>);

    storeIn("en-GB").initLocalePlugin(loaded);

    expect(loaded.nameLocale).toBe("Заметки");
  });

  it("falls back to the manifest name and description", () => {
    const loaded = plugin();

    storeIn("de").initLocalePlugin(loaded);

    expect(loaded.nameLocale).toBe("my-notes");
    expect(loaded.descriptionLocale).toBe("my-notes description");
  });
});
