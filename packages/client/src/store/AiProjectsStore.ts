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
  getAiProjectKnowledgeFiles,
  getAiProjectKnowledgeFilesCount,
  getAiProjectSkills,
  getAiProjectSummary,
  getDefaultChatModelName,
  refreshAiProjectSettings,
  toAiProject,
  toAiProjectSummary,
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
  TAiProjectKnowledgeFile,
  TAiProjectRequest,
  TAiProjectRoomDto,
  TAiProjectSkillsRoom,
  TAiProjectSource,
  TAiProjectSummary,
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

/** The project form can open on the project as it is: its settings and its model were read. */
const canOpenInForm = (project: TAiProject) =>
  !project.aiProject.partial && !project.aiProject.modelUnread;

/** The non-fatal problems the server reports on a changed project (a skipped Viewer grant, ...). */
const showWarnings = (project: TAiProject) => {
  project.aiProject.warnings?.forEach((warning) => toastr.warning(warning.message));
};

/**
 * The AI project that is open in the AI Rooms section, and the project form.
 *
 * The list of projects is the Files list: AI projects are rooms of the AI
 * Rooms root (`FolderType.AiHub`), listed, filtered, pinned and deleted by
 * the Files stores like any room. This store only holds what the Files
 * stores do not know about a room of type 12: its `aiProject` block (model
 * and linked rooms, from `files/rooms/{id}/sources`), the skills and
 * knowledge files of its sources, and the create / edit form that saves
 * through `files/rooms` (see `api/ai/projects`). The chat is handed the open project through
 * `AiPresetsStore.activePreset`, the same hook a saved preset used, so the
 * Shell wiring stays as it is.
 */
class AiProjectsStore {
  aiPresetsStore: AiPresetsStore;

  private userStore: UserStore;

  /** The project open in the chat; `null` outside a project. */
  activeProject: TAiProject | null = null;

  skills: TAiProjectSkillsRoom[] = [];

  /**
   * What the tiles of the list say about their projects, by project id: the
   * list answers the rooms without their settings, so each tile asks for
   * its own (`fetchTileSummary`).
   */
  tileSummaries: Record<number, TAiProjectSummary> = {};

  /**
   * Bumped each time the agents' list is read again: every tile reads its
   * summary again, showing the one it has until the answer lands.
   */
  tileSummariesRead = 0;

  /** The `tileSummariesRead` each summary, and the portal's model, was read in. */
  private summaryReads: Record<number, number> = {};

  private defaultModelRead = -1;

  /**
   * The model an agent without one of its own runs on, by name: what its
   * tile shows in place of a model. `null` until read, or when the portal
   * has no chat model bound.
   */
  defaultModelName: string | null = null;

  private defaultModelRequest: Promise<void> | null = null;

  /** The summary reads in flight, by project id. */
  private summaryRequests: Record<number, Promise<void>> = {};

  /** The files of each expanded Knowledge room, by room id. */
  knowledge: Record<number, TAiProjectKnowledgeFile[]> = {};

  /**
   * How many files each linked Knowledge room holds, by room id: what the
   * Knowledge card's title counts for a room whose files were not read.
   */
  knowledgeCounts: Record<number, number> = {};

  /**
   * A sources read in flight (`*Pending`) and one in flight long enough to
   * show (`*Loading`): the skeleton appears after `SHOW_LOADER_TIMER` and
   * stays at least `MIN_LOADER_TIMER` (`createLoader`), so a fast answer
   * flashes nothing and a slow one does not flicker. While a read is
   * pending the card shows neither the list nor its empty text.
   */
  skillsPending = false;

  skillsLoading = false;

  /** The latest skills read: only it ends `skills*`, an older one left over from another project or click does not. */
  private skillsRequest = 0;

  /** As `skills*`, per Knowledge room. */
  knowledgePending: Record<number, boolean> = {};

  knowledgeLoading: Record<number, boolean> = {};

  projectDialog: TProjectDialogState | null = null;

  /**
   * Bumped, by project id, each time a project is taken over as the server
   * has it after a change (a save here, an edit announced from elsewhere):
   * views that read a project on their own, as the Info panel's Context tab
   * does, read it again when its number moves.
   */
  projectRevisions: Record<number, number> = {};

  /**
   * Bumped by every open and close: a read by id that lands after another
   * open, or after the project was left, opens nothing.
   */
  private openRequest = 0;

  constructor(aiPresetsStore: AiPresetsStore, userStore: UserStore) {
    this.aiPresetsStore = aiPresetsStore;
    this.userStore = userStore;
    makeAutoObservable(this, {
      aiPresetsStore: false,
      openRequest: false,
      summaryRequests: false,
      summaryReads: false,
      defaultModelRead: false,
    } as never);
  }

  /* ------------------------------ Project ------------------------------ */

  /**
   * Sets the rooms of one kind linked to the open project, as its sources
   * column picked them. Only the links are written: the room itself, the
   * model and the instructions stay as they are.
   */
  setActiveRooms = async (kind: "instructions" | "knowledge", rooms: TAiProjectSource[]) => {
    const current = this.activeProject;
    if (!current) return;
    const instructions = kind === "instructions" ? rooms : current.aiProject.instructionsRooms;
    const knowledge = kind === "knowledge" ? rooms : current.aiProject.knowledgeRooms;
    try {
      const project = await updateAiProject(
        current.id,
        {
          aiProject: {
            instructionsRoomIds: instructions.map((room) => room.id),
            knowledgeRoomIds: knowledge.map((room) => room.id),
            rooms: [...instructions, ...knowledge],
          },
        },
        current,
      );
      showWarnings(project);
      runInAction(() => this.replaceProject(project));
      if (this.activeProject?.id === current.id) this.syncPreset(project);
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  private skillRoomsSaves: Promise<unknown> = Promise.resolve();

  /**
   * Links and unlinks Instructions rooms of the open project, as the chat's
   * slash menu connected and disconnected its Skill sets. Only the change is
   * applied, so a room the chat does not list (one without skills) stays
   * linked. Changes are saved one after another: each starts from the
   * project the one before it left. Resolves to `false` when nothing was
   * saved.
   */
  changeActiveSkillRooms = (change: { added: { id: string }[]; removed: string[] }): Promise<boolean> => {
    const save = this.skillRoomsSaves.then(async () => {
      const current = this.activeProject;
      if (!current?.aiProject.canEditSettings) return false;
      const { instructionsRooms, knowledgeRooms } = current.aiProject;
      const removed = new Set(change.removed.map(Number));
      const kept = instructionsRooms.map((room) => room.id).filter((id) => !removed.has(id));
      const added = change.added.map((room) => Number(room.id)).filter((id) => Number.isFinite(id) && !kept.includes(id));
      if (!added.length && kept.length === instructionsRooms.length) return true;
      try {
        const project = await updateAiProject(
          current.id,
          {
            aiProject: {
              instructionsRoomIds: [...kept, ...added],
              knowledgeRoomIds: knowledgeRooms.map((room) => room.id),
              // A newly linked room is not among these: it is read back.
              rooms: [...instructionsRooms, ...knowledgeRooms],
            },
          },
          current,
        );
        showWarnings(project);
        runInAction(() => this.replaceProject(project));
        if (this.activeProject?.id === current.id) this.syncPreset(project);
        return true;
      } catch (e) {
        toastr.error(errorMessage(e));
        return false;
      }
    });
    this.skillRoomsSaves = save;
    return save;
  };

  // The sources (skills, knowledge files) are not read here: the cards read
  // a room's list when its row is expanded (fetchSkills / fetchKnowledgeFiles),
  // and the chat takes the current skills from the server on every round.
  // A project from the Files list comes without its linked rooms
  // (`partial`): it is read on its own first, so the chat opens on the
  // project's rooms. Resolves to the project as opened; a failed read opens
  // what the list had.
  openProject = async (project: TAiProject): Promise<TAiProject> => {
    this.openRequest += 1;
    this.activeProject = project;
    this.skills = [];
    this.knowledge = {};
    this.knowledgeCounts = {};
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
    this.openRequest += 1;
    const request = this.openRequest;
    try {
      const project = await getAiProject(id);
      if (request !== this.openRequest) return null;
      return await this.openProject(project);
    } catch (e) {
      if (request === this.openRequest) toastr.error(errorMessage(e));
      return null;
    }
  };

  closeProject = () => {
    this.openRequest += 1;
    this.activeProject = null;
    this.skills = [];
    this.knowledge = {};
    this.knowledgeCounts = {};
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

  /**
   * Reads the summary a project's tile shows, once per read of the list:
   * later calls reuse the answer until the list is read again
   * (`refreshTileSummaries`), and a failed read is tried again by the next
   * tile that asks.
   */
  fetchTileSummary = (id: number): Promise<void> => {
    void this.fetchDefaultModel();
    if (this.tileSummaries[id] && this.summaryReads[id] === this.tileSummariesRead) return Promise.resolve();
    const pending = this.summaryRequests[id];
    if (pending) return pending;
    const read = this.tileSummariesRead;
    const request = getAiProjectSummary(id)
      .then((summary) => {
        runInAction(() => {
          this.tileSummaries[id] = summary;
          this.summaryReads[id] = read;
        });
      })
      .catch(() => undefined)
      .finally(() => {
        delete this.summaryRequests[id];
      });
    this.summaryRequests[id] = request;
    return request;
  };

  /**
   * The agents' list was read again: each tile reads its summary again, and
   * the portal's chat model is read again with them.
   */
  refreshTileSummaries = () => {
    this.tileSummariesRead += 1;
  };

  /** A project changed (its room was updated): its summary is read again if a tile showed it. */
  refreshTileSummary = (id: number): Promise<void> => {
    if (!this.tileSummaries[id]) return Promise.resolve();
    delete this.summaryReads[id];
    return this.fetchTileSummary(id);
  };

  /** A project is gone: its summary goes with it. */
  forgetTileSummary = (id: number) => {
    delete this.tileSummaries[id];
    delete this.summaryReads[id];
  };

  /**
   * Reads the portal's chat model once per read of the list; a read that
   * found none is tried again by the next tile.
   */
  fetchDefaultModel = (): Promise<void> => {
    if (this.defaultModelName && this.defaultModelRead === this.tileSummariesRead) return Promise.resolve();
    const read = this.tileSummariesRead;
    this.defaultModelRequest ??= getDefaultChatModelName()
      .then((name) => {
        runInAction(() => {
          this.defaultModelName = name;
          this.defaultModelRead = read;
        });
      })
      .finally(() => {
        this.defaultModelRequest = null;
      });
    return this.defaultModelRequest;
  };

  /** The open project (and the one in the edit form), as the server has it now. */
  private replaceProject = (project: TAiProject) => {
    this.projectRevisions[project.id] = (this.projectRevisions[project.id] ?? 0) + 1;
    // A project read in full is also what its tile shows.
    if (!project.aiProject.partial) {
      this.tileSummaries[project.id] = toAiProjectSummary(project);
      this.summaryReads[project.id] = this.tileSummariesRead;
    }
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

  /**
   * Follows an edit of the open project made elsewhere (the server announces
   * it as an update of the project room): the model and the linked rooms are
   * read again and, when they changed, reach the project and its chat. A
   * Knowledge room no longer linked drops its files and their count.
   */
  refreshActiveSettings = async () => {
    const project = this.activeProject;
    if (!project) return;
    try {
      const updated = await refreshAiProjectSettings(project);
      if (updated === project || this.activeProject !== project) return;
      runInAction(() => {
        this.replaceProject(updated);
        const linked = new Set(updated.aiProject.knowledgeRooms.map((room) => room.id));
        Object.keys(this.knowledge)
          .map(Number)
          .filter((id) => !linked.has(id))
          .forEach((id) => delete this.knowledge[id]);
        Object.keys(this.knowledgeCounts)
          .map(Number)
          .filter((id) => !linked.has(id))
          .forEach((id) => delete this.knowledgeCounts[id]);
      });
      this.syncPreset(updated);
    } catch {
      // The next open reads the project anyway.
    }
  };

  /**
   * Reads the skills of the project's Instructions rooms. A read nobody
   * asked for (`silent`: the card title's count) fails without a toast; an
   * expanded room reads again and says why.
   */
  fetchSkills = async (id: number, options?: { silent?: boolean }) => {
    const { startLoader, endLoader } = createLoader();
    this.skillsRequest += 1;
    const request = this.skillsRequest;
    this.skillsPending = true;
    startLoader(() =>
      runInAction(() => {
        if (request === this.skillsRequest) this.skillsLoading = true;
      }),
    );
    try {
      const rooms = await getAiProjectSkills(id);
      runInAction(() => {
        if (this.activeProject?.id === id) this.skills = rooms;
      });
    } catch (e) {
      if (!options?.silent) toastr.error(errorMessage(e));
    } finally {
      runInAction(() => {
        if (request === this.skillsRequest) this.skillsPending = false;
      });
      endLoader(() =>
        runInAction(() => {
          if (request === this.skillsRequest) this.skillsLoading = false;
        }),
      );
    }
  };

  /** Reads a linked Knowledge room's files when its row is expanded. */
  fetchKnowledgeFiles = async (roomId: number) => {
    if (this.knowledgePending[roomId]) return;
    const projectId = this.activeProject?.id;
    const { startLoader, endLoader } = createLoader();
    this.knowledgePending[roomId] = true;
    startLoader(() => runInAction(() => (this.knowledgeLoading[roomId] = true)));
    try {
      const files = await getAiProjectKnowledgeFiles(roomId);
      runInAction(() => {
        if (this.activeProject?.id === projectId) this.knowledge[roomId] = files;
      });
    } catch (e) {
      toastr.error(errorMessage(e));
    } finally {
      runInAction(() => (this.knowledgePending[roomId] = false));
      endLoader(() => runInAction(() => (this.knowledgeLoading[roomId] = false)));
    }
  };

  /**
   * Counts the files of the project's linked Knowledge rooms for the
   * Knowledge card's title, without reading the files themselves. Silent: a
   * room whose count cannot be read stays uncounted, and the title shows no
   * number rather than a wrong one.
   */
  fetchKnowledgeCounts = async (projectId: number, roomIds: number[]) => {
    await Promise.all(
      roomIds.map(async (roomId) => {
        try {
          const count = await getAiProjectKnowledgeFilesCount(roomId);
          runInAction(() => {
            if (this.activeProject?.id === projectId) this.knowledgeCounts[roomId] = count;
          });
        } catch {
          // Left uncounted.
        }
      }),
    );
  };

  /**
   * Queues a failed knowledge file for vectorization again from the Knowledge
   * card. The file turns to in progress at once and back to failed when the
   * request is refused.
   */
  retryKnowledgeFile = async (roomId: number, fileId: number) => {
    const setStatus = (status: VectorizationStatus) =>
      runInAction(() => {
        const file = this.knowledge[roomId]?.find((f) => f.id === fileId);
        if (file) file.vectorizationStatus = status;
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
    // The sidebar lists the latest projects under Agents.
    void this.aiPresetsStore.fetchPresets();
    return project;
  };

  /** Saves the edit form; `removeLogo` also drops the uploaded picture. */
  updateProject = async (id: number, data: TAiProjectRequest, options?: { removeLogo?: boolean }) => {
    const current = this.projectDialog?.mode === "edit" ? this.projectDialog.project : undefined;
    let project = await updateAiProject(id, data, current?.id === id ? current : undefined);
    // The logo route answers the bare room, without the model and the
    // linked rooms the update has just read.
    if (options?.removeLogo) {
      const room = toAiProject((await removeLogoFromRoom(id)) as TAiProjectRoomDto);
      project = { ...room, aiProject: project.aiProject };
    }
    showWarnings(project);
    runInAction(() => this.replaceProject(project));
    if (this.activeProject?.id === id) this.syncPreset(project);
    // A rename shows under Agents, and a change moves the project up there.
    void this.aiPresetsStore.fetchPresets();
    return project;
  };

  private leaveProject = async (project: TAiProject) => {
    await updateRoomMemberRole(project.id, {
      invitations: [{ id: this.userStore.user?.id, access: ShareAccessRights.None }],
    });
    if (this.activeProject?.id === project.id) this.closeProject();
    // A left project leaves the sidebar and the chat's agents menu.
    void this.aiPresetsStore.fetchPresets();
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

  /**
   * Opens the form on a project. The form saves the model it shows, so a
   * project read without its settings, or whose model could not be read, is
   * read again first (`openEditDialogById`).
   */
  openEditDialog = (project: TAiProject) => {
    if (!canOpenInForm(project)) {
      void this.openEditDialogById(project.id);
      return;
    }
    this.projectDialog = { mode: "edit", project };
  };

  /**
   * "Edit" on a project room of the Files list: the room comes without its
   * `aiProject` block, so the project is read first and the form opens on
   * the model and the rooms the server has. A model that cannot be read
   * opens no form: it would show none and could be saved over.
   */
  openEditDialogById = async (id: number) => {
    if (this.activeProject?.id === id && canOpenInForm(this.activeProject)) {
      this.openEditDialog(this.activeProject);
      return;
    }
    try {
      const project = await getAiProject(id, { requireModel: true });
      runInAction(() => this.openEditDialog(project));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  closeProjectDialog = () => (this.projectDialog = null);
}

export default AiProjectsStore;
