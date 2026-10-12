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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getFilesSettings, getFolder, getFoldersTree } from "@/api/files";
import { getSettings } from "@/api/settings";
import { getSelf } from "@/api/people";

import DocsPage from "./page.client";
import DocsOAuth from "./page.oauth.client";
import {
  loadPersonalFilesData,
  type PersonalFilesDeps,
} from "./loadData";

const ssrDeps = {
  getFoldersTree,
  getFolder,
  getFilesSettings,
  getSettings,
  getSelf,
} as unknown as PersonalFilesDeps;

export default async function Docs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  if (params.auth === "oauth") {
    return <DocsOAuth params={params} />;
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value || "";

  const result = await loadPersonalFilesData(ssrDeps, params);

  if (!result) throw new Error("Failed to load required settings");
  if ("redirectTo" in result) redirect(result.redirectTo);

  return <DocsPage authToken={authToken} {...result.data} />;
}
