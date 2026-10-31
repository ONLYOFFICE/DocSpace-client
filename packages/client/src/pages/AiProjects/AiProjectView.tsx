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

import React from "react";
import { inject, observer } from "mobx-react";
import { reaction } from "mobx";
import classnames from "classnames";
import { useNavigate } from "react-router";

import { AiChatPanelBody } from "@onlyoffice/apps-ui-kit/ai-agent/ai-chat-panel";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import type { TAiProject } from "@docspace/shared/api/ai/projects";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "@docspace/shared/constants";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";

import { ProjectSources } from "./sub-components/project/ProjectSources";
import styles from "./AiProjectView.module.scss";

type AiProjectViewProps = {
  aiProjectsStore: AiProjectsStore;
  /** The id of the project room the section shows (the selected folder). */
  roomId: number;
  infoPanelVisible: boolean;
};

// The chat's shape of a project's linked rooms. A room the caller can no
// longer read is not connected.
const toChatRooms = (rooms: TAiProject["aiProject"]["knowledgeRooms"]) =>
  rooms
    .filter((room) => room.available)
    .map((room) => ({ cloud: "docspace", id: String(room.id), name: room.title }));

/**
 * The body of the AI Rooms section while an AI project room is open: the
 * project's chat with its sources column, drawn in place of the file list
 * (a project holds no files). The header stays the section's own, with the
 * room's title, menu and the chat toolbar.
 *
 * Opening reads the project (`GET ai/projects/{id}`) and starts a fresh
 * thread on its model and rooms; leaving the room resets the chat.
 */
const AiProjectView = ({ aiProjectsStore: store, roomId, infoPanelVisible }: AiProjectViewProps) => {
  const navigate = useNavigate();
  const aiChatStore = useAiChatStore();
  const isAiChatAvailable = useIsAiChatAvailable();
  const isDesktop = useIsDesktop();
  const { useRouter, useCloudsStore } = useStores();
  // The chat history takes the sources' place: while it is open they hide.
  const isHistoryOpen = useRouter((s: { currentPage: string }) => s.currentPage) === "history";

  // The room on screen is the project: read it and start its chat. Another
  // project room replaces it; the same room is left as it is.
  React.useEffect(() => {
    let cancelled = false;
    void store.openProjectById(roomId).then((project) => {
      if (cancelled || !project) return;
      const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
      aiChatStore.openProject({
        profileId: profile?.id ?? null,
        profileName: profile?.name ?? null,
        instructionsRooms: toChatRooms(instructionsRooms),
        knowledgeRooms: toChatRooms(knowledgeRooms),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [store, aiChatStore, roomId]);

  // Leaving the room (Back, another section, a deleted room) drops the open
  // project with it, and takes its settings out of the chat: the model goes
  // back to the default and its Instructions and Knowledge rooms are
  // disconnected, so a chat opened elsewhere starts clean.
  React.useEffect(
    () => () => {
      if (store.activeProject) {
        store.closeProject();
        aiChatStore.applyPreset({ profileId: null, profileName: null, contextRooms: [], knowledgeRooms: [] });
        aiChatStore.close();
      }
    },
    [store, aiChatStore],
  );

  // The project dropped under the open chat (left, or handed over without
  // staying in it): the section goes back to the list.
  React.useEffect(
    () =>
      reaction(
        () => store.activeProject,
        (project, previous) => {
          if (project === null && previous !== null) {
            navigate(getCategoryUrl(CategoryType.AiProjects));
          }
        },
      ),
    [store, navigate],
  );

  // An edit of the open project (here or by someone else) reaches its chat in
  // place: the model and the connected rooms follow, the thread stays.
  React.useEffect(
    () =>
      reaction(
        () => {
          const project = store.activeProject;
          if (!project) return null;
          const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
          const ids = (rooms: typeof knowledgeRooms) =>
            rooms
              .filter((room) => room.available)
              .map((room) => `${room.id}:${room.title}`)
              .join(",");
          return `${project.id}|${profile?.id ?? ""}|${ids(instructionsRooms)}|${ids(knowledgeRooms)}`;
        },
        (key, previous) => {
          const project = store.activeProject;
          if (!key || !previous || !project) return;
          // Opening another project applies its settings itself.
          if (key.split("|")[0] !== previous.split("|")[0]) return;
          const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
          aiChatStore.applyPreset({
            profileId: profile?.id ?? null,
            profileName: profile?.name ?? null,
            contextRooms: toChatRooms(instructionsRooms),
            knowledgeRooms: toChatRooms(knowledgeRooms),
          });
        },
      ),
    [aiChatStore, store],
  );

  // The sources column replaces the composer's chips while it is on screen.
  React.useEffect(() => {
    aiChatStore.setComposerContextHidden(true);
    return () => aiChatStore.setComposerContextHidden(false);
  }, [aiChatStore]);

  // The context folder is picked only in the project's sources column. Once
  // the project view is left, the folder would keep scoping every round with
  // nothing on screen to show or remove it, so it goes with the view.
  React.useEffect(() => () => useCloudsStore.getState().clearFolderContext(), [useCloudsStore]);

  const project = store.activeProject;
  if (!isAiChatAvailable || !project || project.id !== roomId) return null;

  return (
    // `chat-container` drops the body's vertical padding while the chat
    // shows, as for an agent's chat.
    <div className={classnames(styles.projectChat, "chat-container")}>
      {!isDesktop && !isHistoryOpen && !infoPanelVisible ? (
        <ProjectSources store={store} project={project} compact />
      ) : null}
      <div className={classnames(styles.panelBody, styles.projectBody)}>
        {/* The history and the info panel each take the sources' place. */}
        {isDesktop && !isHistoryOpen && !infoPanelVisible ? <ProjectSources store={store} project={project} /> : null}
        <div className={styles.panelChat}>
          <AiChatPanelBody />
        </div>
      </div>
    </div>
  );
};

export default inject(({ aiProjectsStore, infoPanelStore, selectedFolderStore }: TStore) => ({
  aiProjectsStore,
  roomId: Number(selectedFolderStore.id),
  infoPanelVisible: infoPanelStore.isVisible,
}))(observer(AiProjectView));
