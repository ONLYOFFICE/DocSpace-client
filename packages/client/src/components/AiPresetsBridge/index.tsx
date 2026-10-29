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

import React, { type ComponentType } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { reaction } from "mobx";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";

import type { TTranslation } from "@docspace/shared/types";

import DialogComponent from "SRC_DIR/components/GlobalEvents/sub-components/Dialog";
import type AiPresetsStore from "SRC_DIR/store/AiPresetsStore";
import { errorMessage } from "SRC_DIR/store/AiProjectsStore";
import { canManageProjects } from "SRC_DIR/pages/AiProjects/utils";

// The folder/file naming dialog is plain JS; only the props this dialog
// uses are typed here, the way CreatePluginFileEvent does it.
type TDialogProps = {
  t: TTranslation;
  withForm?: boolean;
  visible: boolean;
  title: string;
  testIdPrefix?: string;
  startValue?: string;
  onSave: (e: unknown, value: string) => void | Promise<void>;
  onCancel: () => void;
  onClose: () => void;
};

const Dialog = DialogComponent as unknown as ComponentType<TDialogProps>;

type AiPresetsBridgeProps = {
  aiPresetsStore: AiPresetsStore;
  userId: string | null;
  /** The user may create AI projects (owner, admins, room admins). */
  canCreateProjects: boolean;
};

/**
 * Wires the AI projects to a chat outside the projects page: the header's
 * save button creates a project from the chat's setup, the model picker's
 * project list is loaded for the signed-in user and read again whenever the
 * chat opens, and the project an open chat was started from is dropped when
 * the panel closes. Lives inside AiAgentProviders, where the panel store is
 * reachable.
 */
const AiPresetsBridge = ({ aiPresetsStore, userId, canCreateProjects }: AiPresetsBridgeProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const aiChatStore = useAiChatStore();

  React.useEffect(() => {
    aiPresetsStore.init(userId);
  }, [aiPresetsStore, userId]);

  // The save button creates a project from a plain chat, for those who may
  // create one. A chat opened from a project on the projects page already
  // is that project, so the header hides it there.
  const isProjectsPage = location.pathname.startsWith("/ai-projects");
  const isInsideProject = isProjectsPage && !!aiPresetsStore.activePreset;
  React.useEffect(() => {
    if (isInsideProject || !canCreateProjects) return undefined;
    aiChatStore.setOnSavePreset(aiPresetsStore.openSaveDialog);
    return () => aiChatStore.setOnSavePreset(null);
  }, [aiChatStore, aiPresetsStore, isInsideProject, canCreateProjects]);

  // The picker offers the projects as they are when the chat opens: one
  // created, renamed or left elsewhere meanwhile is picked up.
  React.useEffect(
    () =>
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (visible) void aiPresetsStore.fetchPresets();
        },
      ),
    [aiChatStore, aiPresetsStore],
  );

  // On the projects page the composer also shows its Context slot: any
  // folder connected as the round's context.
  React.useEffect(() => {
    aiChatStore.setFolderContextPickerEnabled(isProjectsPage);
    return () => aiChatStore.setFolderContextPickerEnabled(false);
  }, [aiChatStore, isProjectsPage]);

  // A chat started from a project carries the project's name as its title.
  React.useEffect(() => {
    const dispose = reaction(
      () => aiPresetsStore.activePreset?.name ?? null,
      (name) => aiChatStore.setProjectTitle(name),
      { fireImmediately: true },
    );
    return () => {
      dispose();
      aiChatStore.setProjectTitle(null);
    };
  }, [aiChatStore, aiPresetsStore]);

  // A preset picked in the model picker: applied to the open chat as it
  // stands, and made the active preset so its skills rooms reach the chat
  // as the context rooms (see Shell's `contextRoom`).
  React.useEffect(
    () =>
      reaction(
        () => aiPresetsStore.pendingApply,
        (pending) => {
          if (!pending) return;
          const preset = aiPresetsStore.consumePendingApply();
          if (!preset) return;
          aiPresetsStore.setActivePreset(preset);
          aiChatStore.applyPreset({
            profileId: preset.profileId,
            profileName: preset.profileName,
            contextRooms: preset.contextRooms,
            knowledgeRooms: preset.knowledgeRooms,
          });
        },
      ),
    [aiChatStore, aiPresetsStore],
  );

  React.useEffect(
    () =>
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (!visible) aiPresetsStore.setActivePreset(null);
        },
      ),
    [aiChatStore, aiPresetsStore],
  );

  const onSave = async (_e: unknown, value: string) => {
    try {
      const saved = await aiPresetsStore.savePreset(value);
      if (!saved) return;
      toastr.success(t("Common:AIProjectSaved", { name: saved.preset.name }));
      // A linked room that could not be shared with a member, and the like.
      saved.project.aiProject.warnings?.forEach((warning) => toastr.warning(warning.message));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  if (!aiPresetsStore.pendingSettings) return null;

  return (
    <Dialog
      t={t}
      withForm
      visible
      title={t("Common:SaveAIProject")}
      testIdPrefix="save_ai_preset"
      startValue={t("Common:AIProjectDefaultName")}
      onSave={onSave}
      onCancel={aiPresetsStore.closeSaveDialog}
      onClose={aiPresetsStore.closeSaveDialog}
    />
  );
};

export default inject(({ aiPresetsStore, userStore }: TStore) => ({
  aiPresetsStore,
  userId: userStore.user?.id ?? null,
  canCreateProjects: canManageProjects(userStore.user),
}))(observer(AiPresetsBridge));
