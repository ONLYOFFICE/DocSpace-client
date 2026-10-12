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

"use client";

import React from "react";

import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

// Non-reactive container for ai-agents layout commonData that descendant
// pages need but don't get via Next.js props. Used by `alias-files-list`
// to source `filesSettings.displayFileExtension` and `portalSettings.timezone`
// when rendering Knowledge / Result tabs (no SSR-prefetch path) — Recent /
// Favorites / Trash still receive these as explicit props from their own
// server components.
export type AgentsCommonDataValue = {
  filesSettings: TFilesSettings | null;
  portalSettings: TSettings | null;
};

const Ctx = React.createContext<AgentsCommonDataValue>({
  filesSettings: null,
  portalSettings: null,
});

export const AgentsCommonDataProvider = ({
  value,
  children,
}: {
  value: AgentsCommonDataValue;
  children: React.ReactNode;
}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;

export const useAgentsCommonData = () => React.useContext(Ctx);
