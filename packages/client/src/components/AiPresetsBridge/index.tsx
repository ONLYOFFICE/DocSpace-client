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
import { useLocation, useNavigate } from "react-router";
import { reaction } from "mobx";

import type {
  AiChatAgentAction,
  AiChatAgentPickerItem,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import type { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import DialogComponent from "SRC_DIR/components/GlobalEvents/sub-components/Dialog";
import type AiPresetsStore from "SRC_DIR/store/AiPresetsStore";
import { errorMessage } from "SRC_DIR/store/AiProjectsStore";
import { canManageProjects } from "SRC_DIR/pages/AiProjects/utils";
import { ProjectLogo } from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";
import { InfoPanelView, showInfoPanel } from "SRC_DIR/helpers/info-panel";
import { aiProjectToRoom, getAiProject } from "@docspace/shared/api/ai/projects";

import DeleteAgentDialog from "./DeleteAgentDialog";

import styles from "./AiPresetsBridge.module.scss";

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
  /**
   * AI requests are allowed (see Shell's `canUseAi`): off on an unpaid
   * portal and with AI services switched off, so no project list is read.
   */
  enabled: boolean;
  aiPresetsStore: AiPresetsStore;
  userId: string | null;
  /** The user may create AI projects (owner, admins, room admins). */
  canCreateProjects: boolean;
  /** Vectorization is on for the portal: Knowledge rooms can be picked as a knowledge base. */
  vectorizationEnabled: boolean;
  standalone: boolean;
  /** SaaS: the AI service is on for the portal. */
  isAIReady: boolean;
  setAiReady: (aiReady: boolean | null) => void;
  /** An AI project is open on the projects page (its room, with its own chat). */
  isAiProjectOpen: boolean;
  /** Opens the edit form of a project, read first. */
  openEditAiProject: (id: number) => void | Promise<void>;
  /** Opens the invite panel of a room. */
  inviteToRoom: (roomId: number, roomType: RoomsType) => void;
  /**
   * Makes a room what the Info panel shows, in place of the list's
   * selection; `null` hands the panel back to the list.
   */
  selectForInfoPanel: (room: ReturnType<typeof aiProjectToRoom> | null) => void;
  setInfoPanelView: (view: InfoPanelView) => void;
  /** The Info panel: whether it is on screen (observable). */
  infoPanelStore: { isVisible: boolean };
};

// A project read without its logo is drawn with its initials.
const NO_PROJECT_LOGO = { color: "" };

// The settings that take a chat off a project: the default model, no rooms.
const NO_PRESET = {
  profileId: null,
  profileName: null,
  contextRooms: [],
  knowledgeRooms: [],
};

/**
 * Wires the AI projects to a chat outside the projects page: the header's
 * save button creates a project from the chat's setup, the panel title's
 * agents menu lists the projects (loaded for the signed-in user, read again
 * whenever the menu opens), and the project an open chat was started from
 * is dropped when the panel closes. Lives inside AiAgentProviders, where the panel store is
 * reachable.
 */
const AiPresetsBridge = ({
  enabled,
  aiPresetsStore,
  userId,
  canCreateProjects,
  vectorizationEnabled,
  standalone,
  isAIReady,
  setAiReady,
  isAiProjectOpen,
  openEditAiProject,
  inviteToRoom,
  selectForInfoPanel,
  setInfoPanelView,
  infoPanelStore,
}: AiPresetsBridgeProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const aiChatStore = useAiChatStore();

  // Whether AI is set up, by the chat's own rule, for the AI rooms section
  // outside the providers: a chat profile on standalone (unknown until the
  // profiles are loaded), the AI service on SaaS.
  const { useProfilesStore } = useStores();
  const profilesInitialized = useProfilesStore((s: { initialized: boolean }) => s.initialized);
  const hasProfiles = useProfilesStore((s: { hasProfiles: boolean }) => s.hasProfiles);
  const aiReady = standalone ? (profilesInitialized ? hasProfiles : null) : isAIReady;
  React.useEffect(() => {
    setAiReady(aiReady);
  }, [setAiReady, aiReady]);

  React.useEffect(() => {
    aiPresetsStore.init(enabled ? userId : null);
  }, [aiPresetsStore, enabled, userId]);

  // "Save as new agent", the last row of the panel title's menu, creates a
  // project from a plain chat, for those who may create one. A chat opened
  // from a project in the AI rooms section already is that project, so it
  // is not offered there.
  const isAiRoomsPage = location.pathname.startsWith("/ai-rooms/");
  const isInsideProject = isAiRoomsPage && !!aiPresetsStore.activePreset;
  React.useEffect(() => {
    if (isInsideProject || !canCreateProjects) return undefined;
    aiChatStore.setOnSavePreset(aiPresetsStore.openSaveDialog);
    return () => aiChatStore.setOnSavePreset(null);
  }, [aiChatStore, aiPresetsStore, isInsideProject, canCreateProjects]);

  // The panel title's agents menu: the default agent, then the AI projects
  // (the agents the sidebar lists), the most recent first. Picking one
  // applies it to the open chat; the default agent takes the chat off its
  // project. The menu opens on the current project list: one created,
  // renamed or left elsewhere meanwhile is picked up. Not offered in an
  // open project's own chat, which is that project. Without projects it is
  // handed over all the same: the panel shows it only to a user who may
  // save the chat as a new agent, and a plain title to everyone else.
  const { presets, activePreset } = aiPresetsStore;
  const selectedAgentId = activePreset?.id ?? null;
  const isInsideOpenProject = isAiRoomsPage && isAiProjectOpen;
  // The project the chat runs on stays in the menu, first, even once the
  // list has lost it (deleted or left elsewhere, or past the projects the
  // list reads): the title and the checkmark go on naming it, and the menu
  // stays to take the chat off it with the default agent.
  const agents = React.useMemo<AiChatAgentPickerItem[]>(
    () =>
      (activePreset && !presets.some((p) => p.id === activePreset.id)
        ? [activePreset, ...presets]
        : presets
      ).map((preset) => ({
        id: preset.id,
        name: preset.name,
        icon: (
          <ProjectLogo
            project={{ title: preset.name, logo: preset.logo ?? NO_PROJECT_LOGO }}
            size="20px"
            radius="4px"
            className={styles.agentLogo}
          />
        ),
      })),
    [presets, activePreset],
  );

  // Only the latest pick counts: picking the default agent or the agent the
  // chat already runs on calls off a pick whose project is still being read.
  const onAgentSelect = React.useCallback(
    (id: string | null) => {
      const { activePreset: current } = aiPresetsStore;
      if (id === null || id === current?.id) {
        aiPresetsStore.cancelApply();
        if (id !== null || !current) return;
        aiPresetsStore.setActivePreset(null);
        aiChatStore.applyPreset(NO_PRESET);
        return;
      }
      const preset = aiPresetsStore.presets.find((p) => p.id === id);
      if (!preset) return;
      void aiPresetsStore.requestApply(preset).then((result) => {
        if (result === "gone") toastr.info(t("Common:AIProjectNotAvailable"));
      });
    },
    [aiChatStore, aiPresetsStore, t],
  );

  React.useEffect(() => {
    if (isInsideOpenProject) return undefined;
    aiChatStore.setAgentPicker({
      agents,
      selectedId: selectedAgentId,
      onSelect: onAgentSelect,
      onOpen: aiPresetsStore.refreshPresets,
    });
    return () => aiChatStore.setAgentPicker(null);
  }, [aiChatStore, aiPresetsStore, agents, selectedAgentId, onAgentSelect, isInsideOpenProject]);

  // The "Agent actions" menu of the panel header, for the agent the chat
  // runs on: what the user's rights in that project allow. The panel adds
  // Expand and "Save as new agent" itself. Edit and Share open over the page
  // the user is on. Agent info opens the Info panel on the agent where the
  // user is, in place of the chat (the two panels share the side of the
  // screen); only a page that has no Info panel goes to the agent's own page.
  // Closing that Info panel brings the chat back, still on its agent: the
  // chat it replaced is not the user's own close (see `agentInfoOpen`).
  const agentInfoOpen = React.useRef(false);
  // Handed over as a new function on every render: read through a ref, so
  // the effects below do not run again for it.
  const selectForInfoPanelRef = React.useRef(selectForInfoPanel);
  selectForInfoPanelRef.current = selectForInfoPanel;
  const [agentToDelete, setAgentToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const activeAgentId = activePreset?.id ?? null;
  const activeAgentName = activePreset?.name ?? "";
  const canEditAgent = !!activePreset?.rights.edit;
  const canShareAgent = !!activePreset?.rights.share;
  const canDeleteAgent = !!activePreset?.rights.delete;
  React.useEffect(() => {
    if (isInsideOpenProject || activeAgentId === null) return undefined;
    const id = activeAgentId;
    const actions: AiChatAgentAction[] = [];
    if (canEditAgent) {
      actions.push({
        id: "edit",
        label: t("Common:EditAgent"),
        icon: PencilReactSvgUrl,
        onClick: () => void openEditAiProject(Number(id)),
      });
    }
    if (canShareAgent) {
      actions.push({
        id: "share",
        label: t("Common:ShareAgent"),
        icon: ShareReactSvgUrl,
        onClick: () => inviteToRoom(Number(id), RoomsType.AiProjectRoom),
      });
    }
    actions.push({
      id: "info",
      label: t("Common:AgentInfo"),
      icon: InfoOutlineReactSvgUrl,
      onClick: async () => {
        try {
          selectForInfoPanelRef.current(aiProjectToRoom(await getAiProject(Number(id))));
        } catch (e) {
          toastr.error(errorMessage(e));
          return;
        }
        setInfoPanelView(InfoPanelView.infoDetails);
        // Set first: the panel showing closes the chat at once.
        agentInfoOpen.current = true;
        showInfoPanel();
        if (infoPanelStore.isVisible) return;
        // No Info panel here: the agent's page has its own chat, and
        // nothing comes back.
        agentInfoOpen.current = false;
        navigate(`/ai-rooms/${id}/filter?folder=${id}`);
        showInfoPanel();
      },
    });
    if (canDeleteAgent) {
      actions.push({
        id: "delete",
        label: t("Common:DeleteAgent"),
        icon: TrashReactSvgUrl,
        isDanger: true,
        onClick: () => setAgentToDelete({ id, name: activeAgentName }),
      });
    }
    aiChatStore.setAgentActions(actions);
    return () => aiChatStore.setAgentActions(null);
  }, [
    aiChatStore,
    t,
    navigate,
    openEditAiProject,
    inviteToRoom,
    setInfoPanelView,
    infoPanelStore,
    isInsideOpenProject,
    activeAgentId,
    activeAgentName,
    canEditAgent,
    canShareAgent,
    canDeleteAgent,
  ]);

  // The agent deleted from the panel: the chat goes back to the default one.
  const onDeleteAgent = async () => {
    if (!agentToDelete) return;
    const wasActive = aiPresetsStore.activePreset?.id === agentToDelete.id;
    try {
      await aiPresetsStore.deletePreset(agentToDelete.id);
      if (wasActive) aiChatStore.applyPreset(NO_PRESET);
      setAgentToDelete(null);
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  // With vectorization off no Knowledge room can be searched, so the
  // "+" menu's Knowledge bases loses Manage; a base connected earlier stays
  // listed there and can still be disconnected.
  React.useEffect(() => {
    aiChatStore.setKnowledgePickerHidden(!vectorizationEnabled);
    return () => aiChatStore.setKnowledgePickerHidden(false);
  }, [aiChatStore, vectorizationEnabled]);

  // A project picked in the agents menu: applied to the open chat as it
  // stands, and made the active preset so its skills rooms reach the chat
  // as the context rooms (see Shell's `contextRoom`).
  React.useEffect(
    () =>
      reaction(
        () => aiPresetsStore.pendingApply,
        (pending) => {
          if (!pending) return;
          const preset = aiPresetsStore.consumePendingApply();
          // A closed chat takes no project (closing calls off a pick, this
          // is the guard behind it).
          if (!preset || !aiChatStore.isVisible) return;
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

  // Opening the chat reads the projects again, so one created or shared
  // elsewhere meanwhile reaches the agents menu (and the sidebar), even for
  // a user who had none - without projects there is no menu to open.
  //
  // Closing the chat drops the project it runs on, all of it: the model goes
  // back to the default and the project's Instructions and Knowledge rooms
  // are disconnected, so the chat opens clean next time (as the projects page
  // resets it when a project is left); a pick still being read is called
  // off. A chat no project was applied to keeps the model and rooms the user
  // chose.
  React.useEffect(
    () =>
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (visible) {
            void aiPresetsStore.refreshPresets();
            return;
          }
          aiPresetsStore.cancelApply();
          // Closed by "Agent info", not by the user: the chat comes back
          // with its agent once the Info panel closes.
          if (agentInfoOpen.current) return;
          if (!aiPresetsStore.activePreset) return;
          aiPresetsStore.setActivePreset(null);
          aiChatStore.applyPreset(NO_PRESET);
        },
      ),
    [aiChatStore, aiPresetsStore],
  );

  // The Info panel opened by "Agent info" closes: the list gets its
  // selection back, and so does the chat its place - unless the user is
  // already somewhere the chat does not follow (the agent's own page).
  React.useEffect(
    () =>
      reaction(
        () => infoPanelStore.isVisible,
        (visible) => {
          if (visible || !agentInfoOpen.current) return;
          agentInfoOpen.current = false;
          selectForInfoPanelRef.current(null);
          if (!aiChatStore.isVisible) aiChatStore.open();
        },
      ),
    [aiChatStore, infoPanelStore],
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

  if (agentToDelete) {
    return (
      <DeleteAgentDialog
        agentName={agentToDelete.name}
        onDelete={onDeleteAgent}
        onClose={() => setAgentToDelete(null)}
      />
    );
  }

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

export default inject(
  ({
    aiPresetsStore,
    aiProjectsStore,
    contextOptionsStore,
    filesStore,
    infoPanelStore,
    userStore,
    settingsStore,
    paymentStore,
  }: TStore) => ({
  aiPresetsStore,
  isAiProjectOpen: aiProjectsStore.activeProject !== null,
  openEditAiProject: aiProjectsStore.openEditDialogById,
  inviteToRoom: contextOptionsStore.onClickInviteUsers,
  // The Info panel shows the list's selection: the agent takes its place.
  selectForInfoPanel: (room: ReturnType<typeof aiProjectToRoom> | null) => {
    if (room) filesStore.setSelection([]);
    filesStore.setBufferSelection(room as unknown as Parameters<typeof filesStore.setBufferSelection>[0]);
  },
  setInfoPanelView: infoPanelStore.setView,
  infoPanelStore,
  userId: userStore.user?.id ?? null,
  canCreateProjects: canManageProjects(userStore.user),
  // The AI config is read only while AI services are on; until it arrives
  // the picker stays, as the server refuses to link a room anyway.
  vectorizationEnabled: settingsStore.aiConfig?.vectorizationEnabled !== false,
  standalone: !!settingsStore.standalone,
  isAIReady: !!paymentStore.isAIReady,
  setAiReady: settingsStore.setAiReady,
  }),
)(observer(AiPresetsBridge));
