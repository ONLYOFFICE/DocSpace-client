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

import { getSettingsFiles } from "@docspace/shared/api/files";
import { getUser } from "@docspace/shared/api/people";
import { getDefaultProvider } from "@docspace/shared/api/ai";
import { getSettings } from "@docspace/shared/api/settings";
import type { TViewAs } from "@docspace/shared/types";

import { useOAuthSSRData } from "@/hooks/useOAuthSSRData";
import OAuthPageLoader from "@/components/OAuthPageLoader";

import AiAgentsRootLayout, {
  type AiAgentsCommonData,
} from "./layout.client";

async function loadCommonData(): Promise<AiAgentsCommonData | null> {
  const search =
    typeof window !== "undefined" ? window.location.search : "";
  const roomId = new URLSearchParams(search).get("roomId") || "";

  const [filesSettings, user, defaultProvider, portalSettings] =
    await Promise.all([
      getSettingsFiles(),
      getUser().catch(() => undefined),
      getDefaultProvider().catch(() => undefined),
      getSettings().catch(() => undefined),
    ]);

  if (!filesSettings) return null;

  const socketUrl =
    portalSettings && typeof portalSettings !== "string"
      ? (portalSettings.socketUrl ?? "")
      : "";

  return {
    authToken: "",
    roomId,
    socketUrl,
    filesSettings,
    user,
    defaultProvider,
    initialViewAs: "row" as TViewAs,
    portalSettings:
      portalSettings && typeof portalSettings !== "string"
        ? portalSettings
        : undefined,
    // No SSR snapshots in the OAuth frame path — the client-side fallback
    // fetches hydrate the AI config / agents list stores. See layout.tsx.
    initialAIConfig: null,
    initialAgentsData: null,
  };
}

export default function AiAgentsOAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: commonData, error } = useOAuthSSRData(loadCommonData);

  if (error) throw error;
  if (!commonData) return <OAuthPageLoader />;

  return (
    <AiAgentsRootLayout commonData={commonData}>
      {children}
    </AiAgentsRootLayout>
  );
}
