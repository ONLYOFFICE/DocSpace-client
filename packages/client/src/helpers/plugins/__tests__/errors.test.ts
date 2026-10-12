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

import type { TTranslation } from "@docspace/shared/types";

import {
  PluginLoadError,
  getPluginErrorText,
  toPluginError,
} from "../errors";

const URL = "https://portal.test/plugins/sample/plugin.js";

const translate = () => {
  const t = vi.fn((key: string) => key);

  return { t: t as unknown as TTranslation, calls: t };
};

describe("PluginLoadError", () => {
  it("names the status and the url a failed bundle request carries", () => {
    expect(new PluginLoadError({ kind: "http", status: 404, url: URL }).message)
      .toBe(`HTTP 404 fetching ${URL}`);
  });

  it("names the script a failed load carries", () => {
    expect(new PluginLoadError({ kind: "script", url: URL }).message).toBe(
      `Failed to load the script ${URL}`,
    );
  });

  it("names the registration a script never made", () => {
    expect(
      new PluginLoadError({ kind: "unregistered", pluginName: "Sample" })
        .message,
    ).toBe('The script did not register window.Plugins["Sample"]');
  });

  it("spells out a module without a default export", () => {
    expect(new PluginLoadError({ kind: "no-default-export" }).message).toBe(
      "Module plugin has no default export",
    );
  });

  it("keeps the message a plugin threw", () => {
    expect(
      new PluginLoadError({ kind: "thrown", message: "locale bundle missing" })
        .message,
    ).toBe("locale bundle missing");
  });
});

describe("toPluginError", () => {
  it("unwraps the descriptor the portal attached to its own failure", () => {
    const descriptor = { kind: "http", status: 404, url: URL } as const;

    expect(toPluginError(new PluginLoadError(descriptor))).toBe(descriptor);
  });

  it("keeps the message of an error the plugin threw", () => {
    expect(toPluginError(new Error("locale bundle missing"))).toEqual({
      kind: "thrown",
      message: "locale bundle missing",
    });
  });

  it("stringifies a thrown value that is not an error", () => {
    expect(toPluginError("plain string")).toEqual({
      kind: "thrown",
      message: "plain string",
    });
  });

  it("keeps an empty message instead of hiding the failure", () => {
    expect(toPluginError(new Error())).toEqual({ kind: "thrown", message: "" });
  });
});

describe("getPluginErrorText", () => {
  it("translates a script that could not be loaded with its url", () => {
    const { t, calls } = translate();

    getPluginErrorText(t, { kind: "script", url: URL });

    expect(calls).toHaveBeenCalledWith("WebPlugins:PluginScriptLoadFailed", {
      url: URL,
    });
  });

  it("translates a script that never registered itself with its name", () => {
    const { t, calls } = translate();

    getPluginErrorText(t, { kind: "unregistered", pluginName: "Sample" });

    expect(calls).toHaveBeenCalledWith("WebPlugins:PluginNotRegistered", {
      pluginName: "Sample",
    });
  });

  it("translates a failed bundle request with its status and url", () => {
    const { t, calls } = translate();

    getPluginErrorText(t, { kind: "http", status: 404, url: URL });

    expect(calls).toHaveBeenCalledWith(
      "WebPlugins:PluginBundleRequestFailed",
      { status: 404, url: URL },
    );
  });

  it("translates a module without a default export", () => {
    const { t, calls } = translate();

    getPluginErrorText(t, { kind: "no-default-export" });

    expect(calls).toHaveBeenCalledWith("WebPlugins:PluginNoDefaultExport");
  });

  it("shows what the plugin threw as it is", () => {
    const { t, calls } = translate();

    const text = getPluginErrorText(t, {
      kind: "thrown",
      message: "locale bundle missing",
    });

    expect(text).toBe("locale bundle missing");
    expect(calls).not.toHaveBeenCalled();
  });

  it("falls back to the shared unknown-error text when the plugin threw nothing readable", () => {
    const { t } = translate();

    expect(getPluginErrorText(t, { kind: "thrown", message: "" })).toBe(
      "Common:UnknownError",
    );
  });
});
