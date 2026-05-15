// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import dynamic from "next/dynamic";

import { setAuthToken } from "@docspace/shared/api/client";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TDefaultProvider } from "@docspace/shared/api/ai/types";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { useAiRoomStore } from "../_store/AiRoomStore";
import useOpenResultFile from "../_hooks/useOpenResultFile";

// @onlyoffice/ai-chat (consumed transitively by AiAgentProviders) touches
// `document` at the top of its module, which crashes Next.js server
// rendering. Force a client-only import to keep SSR for the rest of the
// page green.
const AiAgentProviders = dynamic(
  () => import("@docspace/ui-kit/ai-agent/providers"),
  { ssr: false },
);

export type AiAgentsCommonData = {
  authToken: string;
  roomId: string;
  socketUrl: string;
  filesSettings: TFilesSettings;
  user: TUser | undefined;
  defaultProvider: TDefaultProvider | undefined;
  portalSettings: TSettings | undefined;
};

type AiAgentsShellProps = {
  commonData: AiAgentsCommonData;
  children: React.ReactNode;
};

const AiAgentsShell = ({ commonData, children }: AiAgentsShellProps) => {
  const { sdkConfig } = useSDKConfig();
  const { isBase } = useTheme();
  const aiRoomStore = useAiRoomStore();
  const openResultFile = useOpenResultFile();

  const language =
    sdkConfig?.locale || commonData.user?.cultureName || "en";

  // Resolve the theme via the global ThemeContext set by the root SDK
  // layout (THEME_HEADER → user.theme → system). Falling back to sdkConfig
  // alone would briefly mount AiAgentProviders in "Base" before the parent
  // frame negotiates the theme, forcing the Zustand stores to rebuild.
  const theme = isBase ? "theme-portal-base" : "theme-portal-dark";

  // SDK is by definition embedded; treat as standalone w.r.t. AI chat host
  // toggles (hides onlyoffice-specific provider types in the chat UI).
  const standalone = true;

  const authTokenSet = React.useRef(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const token = commonData.authToken;
    if (token && !authTokenSet.current) {
      authTokenSet.current = true;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `asc_auth_key=${token}; path=/; SameSite=Lax${secure}`;
      setAuthToken(token);
    }
    setIsReady(true);
  }, [commonData.authToken]);

  // Stable callbacks for AiAgentProviders. Ports of Shell.jsx callbacks.
  const getAgentRoomId = React.useCallback(
    () => aiRoomStore.roomId ?? null,
    [aiRoomStore],
  );

  const closeEditorPanel = React.useCallback(() => {
    aiRoomStore.setSelectedResultFileId(null);
  }, [aiRoomStore]);

  // Mount AiAgentProviders only after the auth token has been written into
  // the cookie + http client, mirroring client Shell.jsx behavior (otherwise
  // standalone flips after first render → Zustand stores rebuild → every
  // hydration refetch fires twice).
  if (!isReady) return <>{children}</>;

  return (
    <AiAgentProviders
      locale={language}
      theme={theme}
      isStandalone={standalone}
      getAgentRoomId={getAgentRoomId}
      openResultFile={openResultFile}
      closeEditorPanel={closeEditorPanel}
    >
      {children}
    </AiAgentProviders>
  );
};

export default AiAgentsShell;
