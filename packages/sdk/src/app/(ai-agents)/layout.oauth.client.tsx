// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { getSettingsFiles } from "@docspace/shared/api/files";
import { getUser } from "@docspace/shared/api/people";
import { getDefaultProvider } from "@docspace/shared/api/ai";
import { getSettings } from "@docspace/shared/api/settings";
import type { TViewAs } from "@docspace/shared/types";

import { useOAuthSSRData } from "@/hooks/useOAuthSSRData";

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
  };
}

export default function AiAgentsOAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const commonData = useOAuthSSRData(loadCommonData);

  if (!commonData) return null;

  return (
    <AiAgentsRootLayout commonData={commonData}>
      {children}
    </AiAgentsRootLayout>
  );
}
