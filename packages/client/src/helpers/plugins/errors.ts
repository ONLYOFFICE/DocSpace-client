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

import type { TTranslation } from "@docspace/shared/types";

import type { TPluginError } from "./types";

const describePluginError = (error: TPluginError) => {
  switch (error.kind) {
    case "script":
      return `Failed to load the script ${error.url}`;
    case "unregistered":
      return `The script did not register window.Plugins["${error.pluginName}"]`;
    case "http":
      return `HTTP ${error.status} fetching ${error.url}`;
    case "no-default-export":
      return "Module plugin has no default export";
    default:
      return error.message;
  }
};

export class PluginLoadError extends Error {
  readonly descriptor: TPluginError;

  constructor(descriptor: TPluginError) {
    super(describePluginError(descriptor));
    this.name = "PluginLoadError";
    this.descriptor = descriptor;
  }
}

export const toPluginError = (error: unknown): TPluginError => {
  if (error instanceof PluginLoadError) return error.descriptor;

  return {
    kind: "thrown",
    message: error instanceof Error ? error.message : String(error),
  };
};

export const getPluginErrorText = (t: TTranslation, error: TPluginError) => {
  switch (error.kind) {
    case "script":
      return t("WebPlugins:PluginScriptLoadFailed", { url: error.url });
    case "unregistered":
      return t("WebPlugins:PluginNotRegistered", {
        pluginName: error.pluginName,
      });
    case "http":
      return t("WebPlugins:PluginBundleRequestFailed", {
        status: error.status,
        url: error.url,
      });
    case "no-default-export":
      return t("WebPlugins:PluginNoDefaultExport");
    default:
      return error.message || t("Common:UnknownError");
  }
};
