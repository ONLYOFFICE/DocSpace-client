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

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(dir, "..");

const envFile = path.resolve(rootDir, ".env");
if (existsSync(envFile)) {
  for (const raw of readFileSync(envFile, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
}

export const PORTAL_URL = (process.env.PORTAL_URL || "http://localhost:8092")
  .replace(/\/+$/, "");
export const PORT = Number(process.env.PORT) || 8888;
export const DEFAULT_LOGIN = process.env.DEFAULT_LOGIN || "";

export const STAND_ORIGIN = `http://localhost:${PORT}`;
export const REDIRECT_URI = `${STAND_ORIGIN}/auth/callback`;

export const EXTRA_CSP_ORIGINS = (
  process.env.EXTRA_CSP_ORIGINS ?? "http://localhost:5001"
)
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const SAME_HOST = new URL(PORTAL_URL).hostname === "localhost";

export const PORTAL_COOKIES = [
  "asc_auth_key",
  "x-signature",
  "client_state",
  "x-redirect-authorization-uri",
  "x-scopes",
  "x-url",
];
