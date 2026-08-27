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

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { TViewAs } from "@docspace/shared/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

import { getFilesSettings } from "@/api/files";
import { getAIAgents, getAIConfig } from "@/api/ai";
import { getSelf } from "@/api/people";
import { getSettings } from "@/api/settings";
import {
  FILTER_HEADER,
  OAUTH_FRAME_HEADER,
  PATHNAME_HEADER,
  ROOM_ID_HEADER,
} from "@/utils/constants";

import AiAgentsRootLayout, {
  type AiAgentsCommonData,
} from "./layout.client";
import AiAgentsOAuthLayout from "./layout.oauth.client";

export const dynamic = "force-dynamic";

type SlotProps = {
  children: React.ReactNode;
};

export default async function AiAgentsServerLayout({ children }: SlotProps) {
  const hdrs = await headers();

  if (hdrs.get(OAUTH_FRAME_HEADER) === "1")
    return <AiAgentsOAuthLayout>{children}</AiAgentsOAuthLayout>;

  const cookieStore = await cookies();

  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const roomId = hdrs.get(ROOM_ID_HEADER) || "";
  const pathname = hdrs.get(PATHNAME_HEADER) ?? "";
  // viewAs cookie is shared with (docspace) — drives the row/tile/table
  // selector in the alias files List as well as the Filter view-switch.
  const initialViewAs = (cookieStore.get("viewAs")?.value || "row") as TViewAs;

  const filterHeader = hdrs.get(FILTER_HEADER) || "";
  const filterParams = new URLSearchParams(filterHeader);
  const providerName = filterParams.get("providerName") || "";
  const inviteKey = filterParams.get("inviteKey") || "";
  const emplType = filterParams.get("emplType") || "";
  const uid = filterParams.get("uid") || "";

  // SSR data for the agents list / AI config stores — fetched here (not in
  // the page) so the store providers below can construct the MobX stores
  // already hydrated. Hydrating during the page's render mutated observables
  // that mounted observers (section header/filter) were already tracking and
  // crashed with "Cannot update a component while rendering". The agents
  // list itself is only needed on the root list route; aiConfig is used by
  // every (ai-agents) route. On failure (e.g. 401) we pass null and the
  // client-side fallback fetches take over.
  const isRootList = pathname === "/ai-agents";
  const initialSearch = filterParams.get("search") ?? "";
  const agentsFilter = RoomsFilter.getDefault(
    undefined,
    RoomSearchArea.AIAgents,
  );
  if (initialSearch) agentsFilter.filterValue = initialSearch;

  const [filesSettings, user, portalSettings, aiConfig, agentsData] =
    await Promise.all([
      getFilesSettings(),
      getSelf(),
      getSettings().catch(() => undefined),
      getAIConfig().catch(() => null),
      isRootList ? getAIAgents(agentsFilter).catch(() => null) : null,
    ]);

  if (!user && providerName) {
    const proto = hdrs.get("x-forwarded-proto") || "https";
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
    const returnPath = pathname || "/ai-agents";
    const returnParams = new URLSearchParams();
    if (roomId) returnParams.set("roomId", roomId);
    const showMenu = filterParams.get("showMenu");
    if (showMenu) returnParams.set("showMenu", showMenu);
    const tab = filterParams.get("tab");
    if (tab) returnParams.set("tab", tab);
    const returnQs = returnParams.toString();
    const successRedirectURL = `${proto}://${host}/sdk${returnPath}${returnQs ? `?${returnQs}` : ""}`;

    const authParams = new URLSearchParams();
    authParams.set("providerName", providerName);
    if (inviteKey) authParams.set("inviteKey", inviteKey);
    if (emplType) authParams.set("emplType", emplType);
    if (uid) authParams.set("uid", uid);
    authParams.set("successRedirectURL", successRedirectURL);

    redirect(`/auth?${authParams.toString()}`);
  }

  const socketUrl =
    portalSettings && typeof portalSettings !== "string"
      ? (portalSettings.socketUrl ?? "")
      : "";

  const commonData: AiAgentsCommonData = {
    authToken,
    roomId,
    socketUrl,
    filesSettings: filesSettings!,
    user,
    initialViewAs,
    portalSettings:
      portalSettings && typeof portalSettings !== "string"
        ? portalSettings
        : undefined,
    initialAIConfig: aiConfig ?? null,
    initialAgentsData: agentsData
      ? {
          agents: agentsData.folders ?? [],
          total: agentsData.total ?? 0,
          rootFolderId: agentsData.current?.id ?? null,
          search: initialSearch || undefined,
        }
      : null,
  };

  return (
    <AiAgentsRootLayout commonData={commonData}>{children}</AiAgentsRootLayout>
  );
}
