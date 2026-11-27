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

import { describe, it, expect } from "vitest";

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import type { TTranslation } from "@docspace/shared/types";

import {
  clashesWith,
  hasCspDomains,
  isUserPlugin,
  getPersonalPluginRows,
  findSettingsDialogPlugin,
  getOwnPluginInfo,
  getShadowedNote,
} from "SRC_DIR/helpers/plugins/personal";

const apiPlugin = (name: string, pluginName: string): TAPIPlugin =>
  ({ name, pluginName, personal: true }) as TAPIPlugin;

describe("clashesWith", () => {
  it("matches the same manifest name in any case", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "HELLO", pluginName: "Other" },
      ),
    ).toBe(true);
  });

  it("matches the same global under another name", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "greeter", pluginName: "Hello" },
      ),
    ).toBe(true);
  });

  it("keeps plugins with a different name and global apart", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "greeter", pluginName: "Greeter" },
      ),
    ).toBe(false);
  });
});

describe("getPersonalPluginRows", () => {
  it("takes the loaded personal plugin of the same name", () => {
    const loaded = [{ name: "hello", pluginName: "Hello", personal: true }];

    const [row] = getPersonalPluginRows([apiPlugin("hello", "Hello")], loaded);

    expect(row.loaded).toBe(loaded[0]);
    expect(row.shadowedBy).toBeUndefined();
  });

  it("names the portal plugin that took the name of a personal one", () => {
    const portal = { name: "hello", pluginName: "Hello", personal: false };

    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [portal],
    );

    expect(row.loaded).toBeUndefined();
    expect(row.shadowedBy).toBe(portal);
  });

  it("names the portal plugin that registers the same global", () => {
    const portal = { name: "greeter", pluginName: "Hello", personal: false };

    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [portal],
    );

    expect(row.shadowedBy).toBe(portal);
  });

  it("does not take a portal plugin for the personal one", () => {
    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [{ name: "other", pluginName: "Other", personal: false }],
    );

    expect(row.loaded).toBeUndefined();
    expect(row.shadowedBy).toBeUndefined();
  });
});

describe("hasCspDomains", () => {
  it("is true when the plugin lists a domain", () => {
    expect(hasCspDomains({ cspDomains: "https://api.example.com" })).toBe(true);
    expect(hasCspDomains({ cspDomains: " , https://api.example.com" })).toBe(
      true,
    );
  });

  it("is false when the plugin lists no domain", () => {
    expect(hasCspDomains({})).toBe(false);
    expect(hasCspDomains({ cspDomains: "" })).toBe(false);
    expect(hasCspDomains({ cspDomains: " , " })).toBe(false);
  });
});

describe("isUserPlugin", () => {
  const plugin = { name: "hello", createBy: { id: "u1" } } as TAPIPlugin;

  it("matches the plugin of that user by its name in any case", () => {
    expect(isUserPlugin(plugin, "u1", "Hello")).toBe(true);
  });

  it("does not match the plugin of the same name of another user", () => {
    expect(isUserPlugin(plugin, "u2", "hello")).toBe(false);
  });
});

describe("findSettingsDialogPlugin", () => {
  const portal = { name: "hello", pluginName: "Hello", personal: false };
  const own = apiPlugin("hello", "Hello");

  it("opens a workspace plugin by its name", () => {
    expect(
      findSettingsDialogPlugin({ pluginName: "hello" }, [own], [portal]),
    ).toEqual({ loaded: portal });
  });

  it("opens one's own copy, not the workspace plugin that shadows it", () => {
    const row = findSettingsDialogPlugin(
      { pluginName: "hello", personal: true },
      [own],
      [portal],
    );

    expect(row.own).toBe(own);
    expect(row.loaded).toBeUndefined();
    expect(row.shadowedBy).toBe(portal);
  });

  it("opens one's own loaded plugin", () => {
    const loaded = { name: "hello", pluginName: "Hello", personal: true };

    const row = findSettingsDialogPlugin(
      { pluginName: "HELLO", personal: true },
      [own],
      [loaded],
    );

    expect(row.loaded).toBe(loaded);
  });

  it("finds nothing for a plugin one does not have", () => {
    expect(
      findSettingsDialogPlugin({ pluginName: "other", personal: true }, [own], []),
    ).toEqual({});
  });
});

describe("getOwnPluginInfo", () => {
  it("takes the texts in the member's language and marks the plugin personal", () => {
    const info = getOwnPluginInfo(
      {
        ...apiPlugin("hello", "Hello"),
        nameLocale: { en: "Hello", ru: "Privet" },
        description: "Greets",
        descriptionLocale: { ru: "Privetstvuet" },
        system: true,
      },
      "ru",
      false,
    );

    expect(info).toMatchObject({
      name: "hello",
      nameLocale: "Privet",
      descriptionLocale: "Privetstvuet",
      compatible: false,
      system: false,
      personal: true,
    });
  });
});

describe("getShadowedNote", () => {
  const t = ((key: string, options?: Record<string, string>) =>
    `${key} ${JSON.stringify(options)}`) as unknown as TTranslation;

  it("names the version of a workspace plugin that is on", () => {
    expect(
      getShadowedNote(t, { nameLocale: "Hello", version: "2.0.0", enabled: true }),
    ).toBe(
      'WebPlugins:PersonalPluginShadowed {"pluginName":"Hello","version":"2.0.0"}',
    );
  });

  it("says that the workspace plugin is off", () => {
    expect(
      getShadowedNote(t, { nameLocale: "Hello", version: "2.0.0", enabled: false }),
    ).toBe('WebPlugins:PersonalPluginShadowedDisabled {"pluginName":"Hello"}');
  });
});
