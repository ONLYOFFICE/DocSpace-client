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

import { useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";

import type AiAgentsTourStore from "SRC_DIR/store/AiAgentsTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";
import WelcomeTourDialog, {
  type TourFeature,
} from "SRC_DIR/components/Tour/WelcomeTourDialog";

import AiAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import KnowledgeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import ChatReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-arbiter.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/icons/16/security.react.svg?url";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type AiAgentsTourProps = {
  aiAgentsTourStore: AiAgentsTourStore;
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isAiAgentsRoot: boolean;
  canCreateRooms: boolean;
  aiReady: boolean;
  showFilter: boolean;
  hasItems: boolean;
  isTableView: boolean;
  aiAgentsId: string | null;
  hasRecent: boolean;
  hasTrash: boolean;
};

const AiAgentsTour = ({
  aiAgentsTourStore,
  userId,
  audience,
  currentDeviceType,
  isFrame,
  firstLoad,
  isAiAgentsRoot,
  canCreateRooms,
  aiReady,
  showFilter,
  hasItems,
  isTableView,
  aiAgentsId,
  hasRecent,
  hasTrash,
}: AiAgentsTourProps) => {
  const { t } = useTranslation(["AiAgentsTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  // Agent creation gating mirrors Home: AI must be ready (or chat-lib profiles
  // already loaded, which can lead the portal /ai/config flag) and the user
  // able to manage agents. `useStores` is safe here — this host renders inside
  // Home, under the AiAgentProviders that also back the section itself.
  const { useProfilesStore } = useStores();
  const hasAiProfiles = useProfilesStore((s) => s.profiles.length > 0);
  const canCreate = (aiReady || hasAiProfiles) && canCreateRooms;

  useEffect(() => {
    if (userId) aiAgentsTourStore.hydrateForUser(userId);
  }, [userId, aiAgentsTourStore]);

  const flags = useMemo<TourStepFlags>(
    () => ({
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      isTableView,
      aiAgentsId,
      hasRecent,
      hasTrash,
    }),
    [
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      isTableView,
      aiAgentsId,
      hasRecent,
      hasTrash,
    ],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) => getTourSteps(t, callbacks, flags),
    [t, flags],
  );

  const { Tour } = useTour(
    aiAgentsTourStore,
    buildSteps,
    isMobileView,
    "ai agents tour",
  );

  // Configuring an agent and choosing who may use it are the owner's cards;
  // everyone else gets what using a ready-made agent gives them.
  const isAdminAudience = audience === "admin";

  const features = useMemo<TourFeature[]>(
    () => [
      {
        icon: AiAgentsReactSvgUrl,
        title: isAdminAudience
          ? t("AiAgentsTour:FeatureAgentsTitle")
          : t("AiAgentsTour:FeatureUseAgentsTitle"),
        description: isAdminAudience
          ? t("AiAgentsTour:FeatureAgents")
          : t("AiAgentsTour:FeatureUseAgents"),
      },
      {
        icon: KnowledgeReactSvgUrl,
        title: t("AiAgentsTour:FeatureKnowledgeTitle"),
        description: t("AiAgentsTour:FeatureKnowledge"),
      },
      {
        icon: ChatReactSvgUrl,
        title: t("AiAgentsTour:FeatureChatTitle"),
        description: t("AiAgentsTour:FeatureChat"),
      },
      {
        icon: SecurityReactSvgUrl,
        title: isAdminAudience
          ? t("AiAgentsTour:FeatureControlTitle")
          : t("AiAgentsTour:FeatureAgentAccessTitle"),
        description: isAdminAudience
          ? t("AiAgentsTour:FeatureControl")
          : t("AiAgentsTour:FeatureAgentAccess"),
      },
    ],
    [t, isAdminAudience],
  );

  if (isFrame || !userId) return null;

  const welcomeVisible =
    !firstLoad &&
    isAiAgentsRoot &&
    aiAgentsTourStore.isHydrated &&
    !aiAgentsTourStore.tourCompleted &&
    !aiAgentsTourStore.isRunning;

  const onStart = () => {
    if (isMobileView) {
      aiAgentsTourStore.completeTour();
      return;
    }
    aiAgentsTourStore.startTour();
  };

  const onSkip = () => {
    aiAgentsTourStore.completeTour();
  };

  return (
    <>
      <WelcomeTourDialog
        visible={welcomeVisible}
        title={t("AiAgentsTour:AgentsWelcomeTitle")}
        features={features}
        canTakeTour={!isMobileView}
        onStart={onStart}
        onSkip={onSkip}
      />
      {Tour ? createPortal(Tour, document.body) : null}
    </>
  );
};

export default inject(
  ({
    userStore,
    settingsStore,
    filesStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    aiAgentsTourStore,
  }: TStore) => {
    const {
      aiAgentsFolderId,
      recentFolderId,
      recycleBinFolderId,
      isAIAgentsFolderRoot,
      isRoot,
    } = treeFoldersStore;

    const audience = getTourAudience(userStore?.user);

    return {
      aiAgentsTourStore,
      userId: userStore?.user?.id,
      audience,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isAiAgentsRoot:
        isAIAgentsFolderRoot && isRoot && !publicRoomStore.isPublicRoom,
      canCreateRooms: audience === "admin",
      aiReady: !!settingsStore.aiConfig?.aiReady,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      isTableView: filesStore.viewAs === "table",
      // Sidebar anchor (ClientArticleSidebar → NavMenu data-item-id). The AI
      // Agents parent item id is the tree folder id.
      aiAgentsId: aiAgentsFolderId != null ? String(aiAgentsFolderId) : null,
      // The agents sub-items reuse the portal-wide aliases and are only
      // rendered when those folders exist, so mirror the sidebar's own gating.
      hasRecent: recentFolderId != null,
      hasTrash: recycleBinFolderId != null,
    };
  },
)(observer(AiAgentsTour));
