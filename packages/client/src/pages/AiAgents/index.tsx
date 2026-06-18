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

import React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import AiAgentsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import AiAgentsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import { TTheme } from "@docspace/ui-kit/providers/theme/themes";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";

// Sub-sections inside the iframe that the host URL exposes via
// `?section=...`. Agent detail lives under `?agentId=N&tab=T` instead.
const VALID_SECTIONS = new Set(["recent", "favorites", "trash", "settings"]);

// The AI Agents settings section was moved out of the (iframe-bound) SDK app
// into DocSpace portal settings. Any navigation that resolves to the agents
// "settings" section — host deep link, sidebar, or an "Open settings" action
// the SDK reports back — is redirected here instead of rendered in the frame.
const AI_SETTINGS_URL = "/portal-settings/ai-settings";
const SETTINGS_NAV_KEY = "section:settings";

// Translate the parent's query string into the SDK navigation key the
// frame bridge understands. Returns a stable string we can dedupe on so
// we don't re-emit the same `navigateSection` after the SDK reported it
// back via `onNavigate`.
type NavKey = {
  key: string;
  payload: { section?: string; agentId?: string; tab?: string };
};

const buildNavKey = (params: URLSearchParams): NavKey => {
  const agentId = params.get("agentId");
  if (agentId) {
    const tab = params.get("tab") ?? "chat";
    return {
      key: `agent:${agentId}:${tab}`,
      payload: { agentId, tab },
    };
  }
  const section = params.get("section") ?? "";
  if (VALID_SECTIONS.has(section)) {
    return { key: `section:${section}`, payload: { section } };
  }
  return { key: "root", payload: {} };
};

// Translate the iframe-reported path into the parent's section key so
// `lastSdkKeyRef` can deduplicate the resulting `setSearchParams` round-
// trip. The SDK is mounted at Next's basePath `/sdk`.
const navKeyFromPath = (
  pathname: string | undefined,
  search: string | undefined,
): { key: string; nextSearch: string } => {
  if (!pathname) return { key: "root", nextSearch: "" };
  const stripped = pathname.replace(/^\/sdk/, "");
  const detailMatch = stripped.match(/^\/ai-agents\/(\d+)(?:\/|$)/);
  if (detailMatch) {
    const agentId = detailMatch[1];
    const inner = new URLSearchParams(search?.replace(/^\?/, "") ?? "");
    const tab = inner.get("tab") ?? "chat";
    return {
      key: `agent:${agentId}:${tab}`,
      nextSearch: `?agentId=${agentId}&tab=${encodeURIComponent(tab)}`,
    };
  }
  const sectionMatch = stripped.match(
    /^\/ai-agents\/(recent|favorites|trash|settings)(?:\/|$)/,
  );
  if (sectionMatch) {
    return {
      key: `section:${sectionMatch[1]}`,
      nextSearch: `?section=${sectionMatch[1]}`,
    };
  }
  return { key: "root", nextSearch: "" };
};

type AiAgentsProps = {
  canManageAgents?: boolean;
  theme?: TTheme;
};

const AiAgentsComponent = ({ canManageAgents, theme }: AiAgentsProps) => {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:DashboardAIChatAgentsTitle");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const lastSdkKeyRef = React.useRef<string | null>(null);

  const searchParamsRef = React.useRef(searchParams);
  searchParamsRef.current = searchParams;
  const setSearchParamsRef = React.useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  // Iframe -> parent: SDK reports its current location via postMessage on
  // every internal navigation. We mirror it into the host's URL via
  // setSearchParams (no `src` change, so the iframe does NOT remount).
  const handleSdkNavigate = React.useCallback(
    (_section: string, extra?: { pathname?: string; search?: string }) => {
      const { key, nextSearch } = navKeyFromPath(
        extra?.pathname,
        extra?.search,
      );

      // The SDK navigated to its (now removed) settings section — e.g. an
      // "Open settings" / "Add AI provider" action. Send the user to the
      // portal AI settings page instead of mirroring it into the host URL.
      if (key === SETTINGS_NAV_KEY) {
        navigate(AI_SETTINGS_URL);
        return;
      }

      lastSdkKeyRef.current = key;

      const sp = searchParamsRef.current;
      const currentSearch = sp.toString() ? `?${sp.toString()}` : "";
      if (currentSearch === nextSearch) return;

      const next = new URLSearchParams(
        nextSearch.replace(/^\?/, ""),
      ) as unknown as URLSearchParamsInit;
      setSearchParamsRef.current(next, { replace: true });
    },
    [],
  );

  // The host owns the iframe and freezes `src` on first show; all subsequent
  // navigations flow through postMessage so it stays mounted, keeping the
  // SDK's warmed runtime / MobX stores / socket across host navigations.
  const apiRef = useSdkFrame({
    appId: "ai-agents",
    enabled: !!canManageAgents,
    title: t("Common:DashboardAIChatAgentsTitle"),
    getSrc: () => {
      const { payload } = buildNavKey(searchParamsRef.current);
      if (payload.agentId) {
        return `/sdk/ai-agents/${payload.agentId}?tab=${encodeURIComponent(
          payload.tab ?? "chat",
        )}`;
      }
      if (payload.section) return `/sdk/ai-agents/${payload.section}`;
      return "/sdk/ai-agents";
    },
    onNavigate: handleSdkNavigate,
  });

  // Parent -> iframe: when the host URL changes (sidebar click, deep link
  // navigation, etc.), tell the SDK to route internally rather than
  // reloading the frame. Skip if the SDK just reported this exact key —
  // that's the iframe-driven case echoing back.
  const navKey = buildNavKey(searchParams);
  React.useEffect(() => {
    if (!canManageAgents) return;
    // Host URL resolves to the agents "settings" section (sidebar click or
    // deep link) — redirect to the portal AI settings page rather than
    // forwarding it into the iframe.
    if (navKey.key === SETTINGS_NAV_KEY) {
      navigate(AI_SETTINGS_URL, { replace: true });
      return;
    }
    if (lastSdkKeyRef.current === navKey.key) return;
    apiRef.current?.call("navigateSection", navKey.payload);
  }, [canManageAgents, navKey.key, navKey.payload, apiRef, navigate]);

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

  // The frame is rendered by the persistent host (see useSdkFrame above).
  return null;
};

// Local alias for the react-router `URLSearchParamsInit` shape (string |
// URLSearchParams | Record<string, string | string[]>). Inlined to avoid
// pulling in `@remix-run/router` type plumbing for one call site.
type URLSearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | string[]>;

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
