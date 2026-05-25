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

import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import AiAgentsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import AiAgentsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { TTheme } from "@docspace/ui-kit/providers/theme/themes";

import SdkIframe from "SRC_DIR/components/SdkIframe";

const SECTION_TO_PATH: Record<string, string> = {
  recent: "/sdk/ai-agents/recent",
  favorites: "/sdk/ai-agents/favorites",
  trash: "/sdk/ai-agents/trash",
  settings: "/sdk/ai-agents/settings",
};

// Build the iframe `src` from the parent URL query params. Honors
// `?agentId=N&tab=T` for direct-link / refresh of a specific agent;
// `?section=...` for the list sub-pages; falls back to the root list.
const buildSrc = (params: URLSearchParams): string => {
  const agentId = params.get("agentId");
  if (agentId) {
    const tab = params.get("tab") ?? "chat";
    return `/sdk/ai-agents/${agentId}?tab=${encodeURIComponent(tab)}`;
  }
  const section = params.get("section") ?? "";
  return SECTION_TO_PATH[section] ?? "/sdk/ai-agents";
};

// Translate the iframe's reported path back into the parent's query shape.
// The SDK is mounted at Next's basePath `/sdk`, so `window.location.pathname`
// inside the iframe looks like `/sdk/ai-agents/123` — strip that prefix
// before matching.
const buildParentSearch = (
  pathname: string | undefined,
  search: string | undefined,
): string => {
  if (!pathname) return "";
  const stripped = pathname.replace(/^\/sdk/, "");
  const detailMatch = stripped.match(/^\/ai-agents\/(\d+)(?:\/|$)/);
  if (detailMatch) {
    const agentId = detailMatch[1];
    const inner = new URLSearchParams(search?.replace(/^\?/, "") ?? "");
    const tab = inner.get("tab") ?? "chat";
    return `?agentId=${agentId}&tab=${encodeURIComponent(tab)}`;
  }
  const sectionMatch = stripped.match(
    /^\/ai-agents\/(recent|favorites|trash|settings)(?:\/|$)/,
  );
  if (sectionMatch) return `?section=${sectionMatch[1]}`;
  return "";
};

type AiAgentsProps = {
  canManageAgents?: boolean;
  theme?: TTheme;
};

const AiAgentsComponent = ({ canManageAgents, theme }: AiAgentsProps) => {
  const { t } = useTranslation(["Common"]);
  const [searchParams] = useSearchParams();

  // `src` stays a derived value: parent-driven nav (sidebar menu, router
  // push) flows through React Router → useSearchParams → buildSrc and
  // remounts the iframe at the right URL. Iframe-driven nav is handled
  // below via raw replaceState so it does NOT trigger a re-render here
  // (which would otherwise reload the iframe right after it navigated).
  const src = buildSrc(searchParams);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      let parsed: unknown;
      try {
        parsed =
          typeof e.data === "string" ? JSON.parse(e.data) : (e.data as unknown);
      } catch {
        return;
      }
      if (!parsed || typeof parsed !== "object") return;
      const envelope = parsed as {
        type?: string;
        eventReturnData?: {
          event?: string;
          data?: { pathname?: string; search?: string };
        };
      };
      if (envelope.type !== "onEventReturn") return;
      if (envelope.eventReturnData?.event !== "onNavigate") return;

      const { pathname, search } = envelope.eventReturnData.data ?? {};
      const nextSearch = buildParentSearch(pathname, search);
      const next = `${window.location.pathname}${nextSearch}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== next) {
        // replaceState is intentional: it updates the address bar so the
        // user sees / can share / can refresh on the correct URL, but it
        // does NOT trigger a React Router update (and therefore does not
        // re-render this component or remount the iframe).
        window.history.replaceState(null, "", next);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!canManageAgents) {
    return (
      <EmptyView
        title={t("Common:DashboardAIChatAgentsTitle")}
        description={t("Common:AIAgentsNonAdminDescription")}
        icon={
          theme?.isBase !== false ? (
            <AiAgentsLightIcon />
          ) : (
            <AiAgentsDarkIcon />
          )
        }
        options={[]}
      />
    );
  }

  return (
    <SdkIframe src={src} title={t("Common:DashboardAIChatAgentsTitle")} />
  );
};

export const AiAgents = inject<TStore>(
  ({ userStore, settingsStore }) => ({
    canManageAgents: !!(
      userStore.user?.isAdmin ||
      userStore.user?.isOwner ||
      userStore.user?.isRoomAdmin
    ),
    theme: settingsStore.theme,
  }),
)(observer(AiAgentsComponent));

export default AiAgents;
