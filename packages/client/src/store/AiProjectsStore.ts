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

import { makeAutoObservable, runInAction } from "mobx";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { retryVectorization } from "@docspace/shared/api/ai";
import { ShareAccessRights, VectorizationStatus } from "@docspace/shared/enums";
import {
  createAiProject,
  getAiProject,
  getAiProjectKnowledge,
  getAiProjectSkills,
  toAiProject,
  updateAiProject,
} from "@docspace/shared/api/ai/projects";
// A project is a room: what it shares with a room goes through the room routes.
import { setFileOwner } from "@docspace/shared/api/files";
import {
  removeLogoFromRoom,
  updateRoomMemberRole,
} from "@docspace/shared/api/rooms";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type {
  TAiProject,
  TAiProjectKnowledgeRoom,
  TAiProjectRequest,
  TAiProjectRoomDto,
  TAiProjectSkillsRoom,
} from "@docspace/shared/api/ai/projects";
import { createLoader } from "@docspace/shared/utils/createLoader";

import type AiPresetsStore from "./AiPresetsStore";
import { toAiPreset } from "./AiPresetsStore";

export type TProjectDialogState =
  | { mode: "create" }
  | { mode: "edit"; project: TAiProject };

/** The server's text of a failed request (Node `{error}` or C# `{error: {message}}`), else the error's own. */
export const errorMessage = (e: unknown): string => {
  if (typeof e === "object" && e !== null) {
    const err = e as {
      message?: string;
      response?: { data?: { error?: string | { message?: string } } };
    };
    const error = err.response?.data?.error;
    const serverText = typeof error === "string" ? error : error?.message;
    return serverText || err.message || String(e);
  }
  return String(e);
};

/** The non-fatal problems the server reports on a changed project (a skipped Viewer grant, ...). */
const showWarnings = (project: TAiProject) => {
  project.aiProject.warnings?.forEach((warning) => toastr.warning(warning.message));
};

/**
 * The AI project that is open in the AI Rooms section, and the project form.
 *
 * The list of projects is the Files list: AI projects are rooms of the AI
 * Rooms root (`FolderType.AiProjects`), listed, filtered, pinned, archived
 * and deleted by the Files stores like any room. This store only holds what
 * the Files stores do not know about a room of type 12: its `aiProject`
 * block (model and linked rooms) read from `/api/2.0/ai/projects/{id}`, the
 * skills and knowledge files of its sources, and the create / edit form that
 * saves through the same API. The chat is handed the open project through
 * `AiPresetsStore.activePreset`, the same hook a saved preset used, so the
 * Shell wiring stays as it is.
 */
class AiProjectsStore {
  aiPresetsStore: AiPresetsStore;

  private userStore: UserStore;

  /** The project open in the chat; `null` outside a project. */
  activeProject: TAiProject | null = null;

  skills: TAiProjectSkillsRoom[] = [];

  knowledge: TAiProjectKnowledgeRoom[] = [];

  /**
   * A sources read in flight (`*Pending`) and one in flight long enough to
   * show (`*Loading`): the skeleton appears after `SHOW_LOADER_TIMER` and
   * stays at least `MIN_LOADER_TIMER` (`createLoader`), so a fast answer
   * flashes nothing and a slow one does not flicker. While a read is
   * pending the card shows neither the list nor its empty text.
   */
  skillsPending = false;

  skillsLoading = false;

  knowledgePending = false;

  knowledgeLoading = false;

  projectDialog: TProjectDialogState | null = null;

  constructor(aiPresetsStore: AiPresetsStore, userStore: UserStore) {
    this.aiPresetsStore = aiPresetsStore;
    this.userStore = userStore;
    makeAutoObservable(this, { aiPresetsStore: false } as never);
  }

  /* ------------------------------ Project ------------------------------ */

  // The sources (skills, knowledge files) are not read here: the cards read
  // a room's list when its row is expanded (fetchSkills / fetchKnowledge),
  // and the chat takes the current skills from the server on every round.
  // A project from the Files list comes without its linked rooms
  // (`partial`): it is read on its own first, so the chat opens on the
  // project's rooms. Resolves to the project as opened; a failed read opens
  // what the list had.
  openProject = async (project: TAiProject): Promise<TAiProject> => {
    this.activeProject = project;
    this.skills = [];
    this.knowledge = [];
    let opened = project;
    if (project.aiProject.partial) {
      try {
        opened = await getAiProject(project.id);
      } catch (e) {
        toastr.error(errorMessage(e));
      }
      if (this.activeProject?.id !== project.id) return opened;
      runInAction(() => this.replaceProject(opened));
    }
    this.syncPreset(opened);
    return opened;
  };

  /** Opens the project the section shows (its room is the selected folder). */
  openProjectById = async (id: number): Promise<TAiProject | null> => {
    if (this.activeProject?.id === id) return this.activeProject;
    try {
      const project = await getAiProject(id);
      return await this.openProject(project);
    } catch (e) {
      toastr.error(errorMessage(e));
      return null;
    }
  };

  closeProject = () => {
    this.activeProject = null;
    this.skills = [];
    this.knowledge = [];
    this.aiPresetsStore.setActivePreset(null);
  };

  /**
   * The chat reads the project through the preset hook: its Instructions
   * rooms are the context (skills) rooms and its Knowledge rooms the
   * knowledge bases.
   */
  private syncPreset = (project: TAiProject) => {
    this.aiPresetsStore.setActivePreset(toAiPreset(project));
  };

  /** The open project (and the one in the edit form), as the server has it now. */
  private replaceProject = (project: TAiProject) => {
    if (this.activeProject?.id === project.id) this.activeProject = project;
    if (this.projectDialog?.mode === "edit" && this.projectDialog.project.id === project.id) {
      this.projectDialog = { mode: "edit", project };
    }
  };

  refreshActiveProject = async () => {
    if (!this.activeProject) return;
    try {
      const project = await getAiProject(this.activeProject.id);
      runInAction(() => this.replaceProject(project));
      this.syncPreset(project);
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  fetchSkills = async (id: number) => {
    const { startLoader, endLoader } = createLoader();
    this.skillsPending = true;
    startLoader(() => runInAction(() => (this.skillsLoading = true)));
    try {
      const rooms = await getAiProjectSkills(id);
      runInAction(() => {
        if (this.activeProject?.id === id) this.skills = rooms;
      });
    } catch (e) {
      toastr.error(errorMessage(e));
    } finally {
      runInAction(() => (this.skillsPending = false));
      endLoader(() => runInAction(() => (this.skillsLoading = false)));
    }
  };

  fetchKnowledge = async (id: number) => {
    const { startLoader, endLoader } = createLoader();
    this.knowledgePending = true;
    startLoader(() => runInAction(() => (this.knowledgeLoading = true)));
    try {
      const rooms = await getAiProjectKnowledge(id);
      runInAction(() => {
        if (this.activeProject?.id === id) this.knowledge = rooms;
      });
    } catch (e) {
      toastr.error(errorMessage(e));
    } finally {
      runInAction(() => (this.knowledgePending = false));
      endLoader(() => runInAction(() => (this.knowledgeLoading = false)));
    }
  };

  /**
   * Queues a failed knowledge file for vectorization again from the Knowledge
   * card. The file turns to in progress at once and back to failed when the
   * request is refused.
   */
  retryKnowledgeFile = async (roomId: number, fileId: number) => {
    const setStatus = (status: VectorizationStatus) =>
      runInAction(() => {
        const room = this.knowledge.find((r) => r.id === roomId);
        const file = room?.files.find((f) => f.id === fileId);
        if (!room || !file) return;
        file.vectorizationStatus = status;
        room.failedFiles = room.files.filter((f) => f.vectorizationStatus === VectorizationStatus.Failed).length;
      });
    setStatus(VectorizationStatus.InProgress);
    try {
      await retryVectorization([fileId]);
    } catch (e) {
      setStatus(VectorizationStatus.Failed);
      toastr.error(errorMessage(e));
    }
  };

  /* ----------------------------- Mutations ----------------------------- */

  /** Saves the create form. The Files list learns of the new room over the socket. */
  createProject = async (data: TAiProjectRequest) => {
    const project = await createAiProject(data);
    showWarnings(project);
    return project;
  };

  /** Saves the edit form; `removeLogo` also drops the uploaded picture. */
  updateProject = async (id: number, data: TAiProjectRequest, options?: { removeLogo?: boolean }) => {
    let project = await updateAiProject(id, data);
    if (options?.removeLogo) project = toAiProject((await removeLogoFromRoom(id)) as TAiProjectRoomDto);
    showWarnings(project);
    runInAction(() => this.replaceProject(project));
    if (this.activeProject?.id === id) this.syncPreset(project);
    return project;
  };

  private leaveProject = async (project: TAiProject) => {
    await updateRoomMemberRole(project.id, {
      invitations: [{ id: this.userStore.user?.id, access: ShareAccessRights.None }],
    });
    if (this.activeProject?.id === project.id) this.closeProject();
  };

  /** The owner hands the project over from the project form or its intro. */
  changeOwner = async (project: TAiProject, userId: string, keepAsManager: boolean) => {
    // The former owner stays as a Project manager, as a room keeps its former
    // owner as a room manager; leaving is a separate step.
    await setFileOwner(userId, [project.id]);
    if (!keepAsManager) {
      await this.leaveProject(project);
      return;
    }
    try {
      const updated = await getAiProject(project.id);
      runInAction(() => this.replaceProject(updated));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  /* ------------------------------ Dialogs ------------------------------ */

  openCreateDialog = () => (this.projectDialog = { mode: "create" });

  openEditDialog = (project: TAiProject) =>
    (this.projectDialog = { mode: "edit", project });

  /**
   * "Edit" on a project room of the Files list: the room comes without its
   * `aiProject` block, so the project is read first and the form opens on
   * the model and the rooms the server has.
   */
  openEditDialogById = async (id: number) => {
    if (this.activeProject?.id === id && !this.activeProject.aiProject.partial) {
      this.openEditDialog(this.activeProject);
      return;
    }
    try {
      const project = await getAiProject(id);
      runInAction(() => this.openEditDialog(project));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  closeProjectDialog = () => (this.projectDialog = null);
}

export default AiProjectsStore;
