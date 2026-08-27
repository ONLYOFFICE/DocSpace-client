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
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit";
import { toastr } from "@docspace/ui-kit/components/toast";
import AiAgentProviders, {
  useStores,
} from "@docspace/ui-kit/ai-agent/providers";
import type { Profile } from "@docspace/ui-kit/ai-agent/providers";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import { editAIAgent } from "@docspace/shared/api/ai";

import {
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useAiRoomStore,
} from "../../_store";
import { useAgentsCommonData } from "../../_store/AgentsCommonDataContext";
import useOpenResultFile from "../../_hooks/useOpenResultFile";

type AiAgentProvidersProps = React.ComponentProps<typeof AiAgentProviders>;

type AiAgentsAiChatProvidersProps = {
  children: React.ReactNode;
};

// Section-wide wrapper around the @onlyoffice/ai-chat provider stack (zustand).
// Mounted once for the whole (ai-agents) section so the chat lib stores —
// profiles in particular — are available on every route, including the agents
// list EmptyView (which gates its "AI provider is not available yet" copy on
// whether any AI profile exists).
//
// The chat is scoped to the current agent room via `entityId`, derived
// directly from the `[agentId]` route param (which equals the agent room id).
// `entityId` is fixed at mount in the chat lib ("live switching is not
// supported"), so `key={entityId}` forces a fresh provider subtree per agent:
//   - list / settings / recent / … routes (no agentId) → one shared, unscoped
//     provider (profiles load for the EmptyView);
//   - an agent route → a provider scoped to that agent, remounted on switch.
// `getAgentRoomId` is currently inert in the chat lib (AgentRoomIdSync is a
// no-op), wired here only for forward-compat.

// Mirrors the chat lib's profiles presence into the MobX
// AgentsAIConfigStore so layout-level observers that live OUTSIDE this
// provider subtree (RootFilter / quick actions in the section filter bar)
// can gate on `aiReady`. Must be mounted inside <AiAgentProviders> —
// useStores() reads its StoresProvider context.
const ProfilesBridge = () => {
  const aiConfigStore = useAgentsAIConfigStore();
  const stores = useStores();
  const profiles = stores.useProfilesStore((s) => s.profiles);

  React.useEffect(() => {
    aiConfigStore.setHasProfiles(profiles.length > 0);
  }, [aiConfigStore, profiles]);

  return null;
};

const AiAgentsAiChatProviders = ({
  children,
}: AiAgentsAiChatProvidersProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const aiRoomStore = useAiRoomStore();
  const { portalSettings } = useAgentsCommonData();
  // SSR user snapshot (AgentsUserStore is constructed with it) — `null`
  // means an anonymous SDK embed.
  const { user } = useAgentsUserStore();
  const openResultFile = useOpenResultFile();

  const params = useParams();
  const rawAgentId = params?.agentId;
  const agentId = Array.isArray(rawAgentId) ? rawAgentId[0] : rawAgentId;
  const entityId = agentId || undefined;
  const isAgentRoom = Boolean(entityId);
  const isStandalone = Boolean(portalSettings?.standalone);

  const { canEditAgentRoom } = aiRoomStore;

  const closeEditorPanel = React.useCallback(
    () => aiRoomStore.setSelectedResultFileId(null),
    [aiRoomStore],
  );

  // getAgentRoomId reads the current route param so a single closure always
  // returns the latest agent room id.
  const agentIdRef = React.useRef(agentId);
  agentIdRef.current = agentId;
  const getAgentRoomId = React.useCallback(() => {
    const id = agentIdRef.current;
    return id ? Number(id) : null;
  }, []);

  const onProfilePickerSelect = React.useCallback(
    (profile: Profile, actionId?: string) => {
      const id = agentIdRef.current;
      if (actionId || !profile?.id || !id) return;
      editAIAgent(Number(id), { profileId: profile.id }).catch((err) =>
        toastr.error(err),
      );
    },
    [],
  );

  const formatChatError = React.useCallback<
    NonNullable<AiAgentProvidersProps["formatChatError"]>
  >(
    (payload) => {
      if (payload?.code !== "insufficient_funds") return null;

      return {
        title: t("Common:WalletBalanceTooLow"),
        description: t("Common:InsufficientFundsContactPayerShort"),
        action: null,
      };
    },
    [t],
  );

  const callbacks = React.useMemo<AiAgentProvidersProps["callbacks"]>(
    () => ({
      onWebSearchSaved: () =>
        toastr.success(t("Common:ChangesSavedSuccessfully")),
      onError: ({ type, error, context }) => {
        console.error(`[ai-agent] ${context ?? type} failed`, error);
        const err = error as
          | { response?: { status?: number }; status?: number; message?: string }
          | undefined;
        const status = err?.response?.status ?? err?.status;
        const isForbidden =
          status === 403 || /\bHTTP\s+403\b/.test(err?.message ?? "");
        if (!isForbidden) toastr.error(t("Common:UnexpectedError"));
      },
    }),
    [t],
  );

  return (
    <AiAgentProviders
      key={entityId ?? "no-room"}
      theme={isBase ? PORTAL_BASE_THEME_ID : PORTAL_DARK_THEME_ID}
      locale={i18n.language}
      isStandalone={isStandalone}
      // Anonymous SDK embeds must not fire /api/2.0/ai fetches (401 spam).
      // Guests are intentionally NOT excluded here — the agents surface is
      // left untouched for now.
      canUseAi={!!user}
      callbacks={callbacks}
      entityId={entityId}
      formatChatError={formatChatError}
      hideProfilePicker={false}
      profilePickerReadOnly={isAgentRoom && !canEditAgentRoom}
      isAgentRoom={isAgentRoom}
      onProfilePickerSelect={isAgentRoom ? onProfilePickerSelect : undefined}
      getAgentRoomId={getAgentRoomId}
      openResultFile={openResultFile}
      closeEditorPanel={closeEditorPanel}
    >
      <ProfilesBridge />
      {children}
    </AiAgentProviders>
  );
};

export default AiAgentsAiChatProviders;
