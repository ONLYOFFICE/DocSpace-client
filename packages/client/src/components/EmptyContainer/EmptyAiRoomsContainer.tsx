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

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { EmptyView } from "@onlyoffice/apps-ui-kit/components/empty-view";
import type { EmptyViewOptionsType } from "@onlyoffice/apps-ui-kit/components/empty-view";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { Events } from "@docspace/shared/enums";

import EmptyAiRoomsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import EmptyAiRoomsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import CreateRoomIcon from "PUBLIC_DIR/images/emptyview/create.room.svg";

import {
  mapChatNoAccessStores,
  useChatNoAccess,
  type ChatNoAccessStoreProps,
} from "SRC_DIR/Hooks/useChatNoAccess";
import { AI_SETTINGS_URL } from "SRC_DIR/helpers/constants";
import { canManageProjects } from "SRC_DIR/pages/AiProjects/utils";

import {
  getAIAgentsAIDisabledDescription,
  getAIAgentsAIDisabledTitle,
} from "./sub-components/EmptyViewContainer/EmptyViewContainer.utils";

type EmptyAiRoomsContainerProps = {
  /** `hub`: the "AI rooms" root; `projects`: the "AI Projects" root. */
  kind: "hub" | "projects";
  aiNoAccessStores: ChatNoAccessStoreProps;
  canManage: boolean;
  isAdmin: boolean;
  isWarningRoomsDialog: boolean;
  setQuotaWarningDialogVisible: (visible: boolean) => void;
  selectedFolderId?: number | string | null;
};

/**
 * The empty state of an AI root. A room admin can create an AI room (the
 * "AI rooms" chooser) or a project (the project form), a user or guest only
 * waits for an invitation. In "AI Projects", with AI not ready, the view is
 * the one the AI agents root had: the settings link on standalone,
 * activation on SaaS, "contact an admin" for everyone else, and the create
 * entry waits for AI to be ready, as the section's other create controls do.
 * Instructions and Knowledge rooms hold files and need no chat profile.
 */
const EmptyAiRoomsContainer = ({
  kind,
  aiNoAccessStores,
  canManage,
  isAdmin,
  isWarningRoomsDialog,
  setQuotaWarningDialogVisible,
  selectedFolderId,
}: EmptyAiRoomsContainerProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const navigate = useNavigate();
  const isAiChatAvailable = useIsAiChatAvailable();
  // Same readiness rule and activation flow as the AI chat: on a standalone
  // portal AI is ready once a chat profile exists, on SaaS once the AI
  // service is on. Until the profiles are loaded the state is unknown, so
  // the "AI is off" view is held back instead of flashing.
  const { aiReady, activation, topUpDialog } = useChatNoAccess(aiNoAccessStores);
  const { useProfilesStore } = useStores();
  const profilesInitialized = useProfilesStore((s: { initialized: boolean }) => s.initialized);
  const aiStateKnown = !aiNoAccessStores.standalone || profilesInitialized;
  const isProjects = kind === "projects";
  const showAiOff = isProjects && aiStateKnown && !aiReady;
  const standalone = !!aiNoAccessStores.standalone;

  const onCreate = () => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }
    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: selectedFolderId, context: "empty_state" },
    }) as CustomEvent & {
      payload?: { isAiRoomsCreate?: boolean; isAiProjectCreate?: boolean };
    };
    event.payload = isProjects
      ? { isAiProjectCreate: true }
      : { isAiRoomsCreate: true };
    window.dispatchEvent(event);
  };

  const icon = isBase ? <EmptyAiRoomsLightIcon /> : <EmptyAiRoomsDarkIcon />;

  if (showAiOff) {
    let options: EmptyViewOptionsType | null = null;
    if (isAdmin && standalone) {
      options = [
        {
          key: "go-to-ai-provider-settings",
          type: "button",
          title: t("Common:GoToSettings"),
          onClick: () => navigate(AI_SETTINGS_URL),
        },
      ];
    } else if (isAdmin) {
      options = aiNoAccessStores.isCardLinkedToPortal
        ? [
            {
              key: "activate-ai",
              type: "button",
              title: t("Common:Activate"),
              onClick: activation.onActivateAI,
              isLoading: activation.isActivating,
            },
          ]
        : [
            {
              key: "top-up-and-activate-ai",
              type: "button",
              title: t("Common:TopUpAndActivate"),
              onClick: activation.onTopUpAndActivateAI,
              isLoading: activation.isActivating,
            },
          ];
    }
    return (
      <>
        <EmptyView
          icon={icon}
          title={getAIAgentsAIDisabledTitle(t, standalone, isAdmin)}
          description={getAIAgentsAIDisabledDescription(t, standalone, isAdmin)}
          options={options}
        />
        {topUpDialog}
      </>
    );
  }

  const canCreate =
    canManage && (!isProjects || (isAiChatAvailable && aiReady));
  const options: EmptyViewOptionsType = canCreate
    ? [
        isProjects
          ? {
              key: "create-ai-project",
              title: t("Common:AIProjectCreate"),
              description: t("Common:AIProjectCreateDescription"),
              icon: <CreateRoomIcon />,
              onClick: onCreate,
            }
          : {
              key: "create-ai-room",
              title: t("Common:NewRoom"),
              description: t("Common:AiRoomsCreateDescription"),
              icon: <CreateRoomIcon />,
              onClick: onCreate,
            },
      ]
    : [];

  if (isProjects) {
    return (
      <EmptyView
        icon={icon}
        title={
          canManage ? t("Common:AIProjectsEmpty") : t("Common:AIProjectsEmptyUser")
        }
        description={
          canManage
            ? t("Common:AIProjectsEmptyDescription")
            : t("Common:AIProjectsEmptyUserDescription")
        }
        options={options}
      />
    );
  }

  return (
    <EmptyView
      icon={icon}
      title={canManage ? t("Common:AiRoomsEmpty") : t("Common:AiRoomsEmptyUser")}
      description={
        canManage
          ? t("Common:AiRoomsEmptyDescription")
          : t("Common:AiRoomsEmptyUserDescription")
      }
      options={options}
    />
  );
};

export default inject(
  ({
    settingsStore,
    userStore,
    paymentStore,
    authStore,
    currentQuotaStore,
    dialogsStore,
    selectedFolderStore,
  }: TStore) => ({
    aiNoAccessStores: mapChatNoAccessStores({
      settingsStore,
      userStore,
      paymentStore,
      authStore,
    } as TStore),
    canManage: canManageProjects(userStore.user),
    isAdmin: !!(userStore.user?.isOwner || userStore.user?.isAdmin),
    isWarningRoomsDialog: currentQuotaStore.isWarningRoomsDialog,
    setQuotaWarningDialogVisible: dialogsStore.setQuotaWarningDialogVisible,
    selectedFolderId: selectedFolderStore.id,
  }),
)(observer(EmptyAiRoomsContainer));
