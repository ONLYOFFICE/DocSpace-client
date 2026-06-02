// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { TViewAs } from "@docspace/shared/types";

import { getFilesSettings } from "@/api/files";
import { getDefaultProvider } from "@/api/ai";
import { getSelf } from "@/api/people";
import { getSettings } from "@/api/settings";
import {
  FILTER_HEADER,
  PATHNAME_HEADER,
  ROOM_ID_HEADER,
} from "@/utils/constants";

import AiAgentsRootLayout, {
  type AiAgentsCommonData,
} from "./layout.client";

export const dynamic = "force-dynamic";

type SlotProps = {
  children: React.ReactNode;
};

export default async function AiAgentsServerLayout({ children }: SlotProps) {
  const hdrs = await headers();
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

  const [filesSettings, user, defaultProvider, portalSettings] =
    await Promise.all([
      getFilesSettings(),
      getSelf(),
      getDefaultProvider(),
      getSettings().catch(() => undefined),
    ]);

  if (!user && providerName) {
    const proto = hdrs.get("x-forwarded-proto") || "https";
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
    const returnPath = pathname || "/ai-agents";
    const returnParams = new URLSearchParams();
    if (roomId) returnParams.set("roomId", roomId);
    const showMenu = filterParams.get("showMenu");
    if (showMenu) returnParams.set("showMenu", showMenu);
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
    defaultProvider,
    initialViewAs,
    portalSettings:
      portalSettings && typeof portalSettings !== "string"
        ? portalSettings
        : undefined,
  };

  return (
    <AiAgentsRootLayout commonData={commonData}>{children}</AiAgentsRootLayout>
  );
}
