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
import SocketHelper, {
  SocketCommands,
  SocketEvents,
  type TOptSocket,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import {
  changeAiProjectOwner,
  createAiProject,
  deleteAiProject,
  duplicateAiProject,
  getAiProject,
  getAiProjectKnowledge,
  getAiProjects,
  getAiProjectSkills,
  leaveAiProject,
  muteAiProject,
  pinAiProject,
  updateAiProject,
} from "@docspace/shared/api/ai/projects";
import type {
  TAiProject,
  TAiProjectKnowledgeRoom,
  TAiProjectRequest,
  TAiProjectSkillsRoom,
  TAiProjectSource,
  TAiProjectsQuery,
} from "@docspace/shared/api/ai/projects";
import type { TOperation } from "@docspace/shared/api/files/types";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";

import type AiPresetsStore from "./AiPresetsStore";

export type TAiProjectsViewAs = "table" | "row" | "tile";
export type TAiProjectsSortBy = NonNullable<TAiProjectsQuery["sortBy"]>;

/** A user or room a list filter is set to: its id, and the name its chip shows. */
export type TAiProjectsFilterEntity = { id: string; label: string };

export type TProjectDialogState =
  | { mode: "create" }
  | { mode: "edit"; project: TAiProject };

const VIEW_STORAGE_KEY = "aiProjectsViewAs";

const readViewAs = (): TAiProjectsViewAs => {
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "row" || v === "tile" || v === "table" ? v : "table";
  } catch {
    return "table";
  }
};

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

/** Follows a file operation (delete, duplicate) until it is finished. */
const waitForOperation = async (operation: TOperation | undefined) => {
  let current = operation;
  while (current && !current.finished) {
    current = await getOperationProgress(current.id, "", true);
  }
  if (current?.error) throw new Error(current.error);
};

/**
 * AI Projects: the list the page shows, the project opened in the chat and
 * the dialogs around them. Talks to `/api/2.0/ai/projects`; members, roles
 * and the invitation link go through the room panels. The chat
 * itself is handed the project through `AiPresetsStore.activePreset`, the
 * same hook a saved preset used, so the Shell wiring stays as it is.
 */
/** Projects per list page, as Files pages its lists. */
const PAGE_COUNT = 100;

// Socket changes are coalesced over this window, as the agents picker does:
// one change (a create with its logo, an update with its members) lands as
// several events, and each one costs a request.
const SOCKET_RELOAD_DELAY_MS = 300;

/** The JSON a `s:modify-folder` event carries, or `undefined` when it has none. */
const socketData = (opt: TOptSocket): { id?: unknown; parentId?: unknown } | undefined => {
  if (!opt.data) return undefined;
  try {
    const data: unknown = JSON.parse(opt.data);
    return data && typeof data === "object" ? (data as { id?: unknown; parentId?: unknown }) : undefined;
  } catch {
    return undefined;
  }
};

class AiProjectsStore {
  aiPresetsStore: AiPresetsStore;

  projects: TAiProject[] = [];

  total = 0;

  isLoading = false;

  isLoaded = false;

  /** A further page of the list is on its way (infinite scroll). */
  isFetchingMore = false;

  filterValue = "";


  /** The owner filter, with the name its chip shows; `null`: any owner. */
  ownerFilter: TAiProjectsFilterEntity | null = null;

  /** One linked Instructions room to filter by, with the title its chip shows; `null`: any. */
  instructionsRoomFilter: TAiProjectsFilterEntity | null = null;

  /** One linked Knowledge room to filter by, with the title its chip shows; `null`: any. */
  knowledgeRoomFilter: TAiProjectsFilterEntity | null = null;

  sortBy: TAiProjectsSortBy = "DateAndTime";

  sortOrder: "ascending" | "descending" = "descending";

  viewAs: TAiProjectsViewAs = readViewAs();

  /** The project open in the chat; `null` on the list. */
  activeProject: TAiProject | null = null;

  skills: TAiProjectSkillsRoom[] = [];

  knowledge: TAiProjectKnowledgeRoom[] = [];

  projectDialog: TProjectDialogState | null = null;

  deleteFor: TAiProject | null = null;

  /** The project the "Leave the project" confirmation is open for. */
  leaveFor: TAiProject | null = null;

  private requestId = 0;

  /** The projects root (`current.id` of the list), whose channel carries created projects. */
  rootId: number | null = null;

  /**
   * The open project when it was deleted or the caller lost access to it
   * while it was open, for the page to leave it; `null` otherwise.
   */
  lostProjectId: number | null = null;

  /** The page is mounted: the socket channels are held and listened to. */
  private isLive = false;

  /** The `DIR-{id}` channels this store subscribed to (and so may drop). */
  private ownedChannels: string[] = [];

  private listReloadTimer: ReturnType<typeof setTimeout> | null = null;

  private projectReloadTimers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(aiPresetsStore: AiPresetsStore) {
    this.aiPresetsStore = aiPresetsStore;
    makeAutoObservable(this, {
      aiPresetsStore: false,
      ownedChannels: false,
      listReloadTimer: false,
      projectReloadTimers: false,
    } as never);
  }

  get isFiltered() {
    return this.filterValue.trim().length > 0 || this.hasFilterOptions;
  }

  /** Whether a filter option (owner, rooms) is applied, apart from the search. */
  get hasFilterOptions() {
    return (
      this.ownerFilter !== null ||
      this.instructionsRoomFilter !== null ||
      this.knowledgeRoomFilter !== null
    );
  }

  /* ------------------------------- List -------------------------------- */

  /** The list query of the current search, filters and sort. */
  private listQuery = () => ({
    filterValue: this.filterValue.trim() || undefined,
    subjectId: this.ownerFilter?.id,
    instructionsRoomId: this.instructionsRoomFilter ? Number(this.instructionsRoomFilter.id) : undefined,
    knowledgeRoomId: this.knowledgeRoomFilter ? Number(this.knowledgeRoomFilter.id) : undefined,
    sortBy: this.sortBy,
    sortOrder: this.sortOrder,
  });

  /** Whether the server holds projects past the loaded ones (Files' hasMoreFiles). */
  get hasMoreProjects() {
    return this.isLoaded && this.projects.length < this.total;
  }

  /** The first page; the rest comes from fetchMoreProjects as the list scrolls. */
  fetchProjects = async () => {
    const id = ++this.requestId;
    this.isLoading = true;
    try {
      const page = await getAiProjects({ ...this.listQuery(), startIndex: 0, count: PAGE_COUNT });
      if (id !== this.requestId) return;
      runInAction(() => {
        this.projects = page.folders;
        this.total = page.total;
        this.isLoaded = true;
        if (page.current?.id) this.rootId = page.current.id;
      });
      this.syncChannels();
    } catch (e) {
      if (id === this.requestId) toastr.error(errorMessage(e));
    } finally {
      if (id === this.requestId) runInAction(() => (this.isLoading = false));
    }
  };

  /**
   * The next page, appended without duplicates, as Files' fetchMoreFiles does.
   * A new search (fetchProjects) wins over a page still on its way.
   */
  fetchMoreProjects = async () => {
    if (!this.hasMoreProjects || this.isLoading || this.isFetchingMore) return;
    const id = this.requestId;
    this.isFetchingMore = true;
    try {
      const page = await getAiProjects({
        ...this.listQuery(),
        startIndex: this.projects.length,
        count: PAGE_COUNT,
      });
      if (id !== this.requestId) return;
      runInAction(() => {
        const known = new Set(this.projects.map((p) => p.id));
        this.projects = [...this.projects, ...page.folders.filter((p) => !known.has(p.id))];
        this.total = page.total;
      });
    } catch (e) {
      if (id === this.requestId) toastr.error(errorMessage(e));
    } finally {
      runInAction(() => (this.isFetchingMore = false));
    }
  };

  setFilterValue = (value: string) => {
    this.filterValue = value;
    void this.fetchProjects();
  };

  setSort = (sortBy: TAiProjectsSortBy, sortOrder: "ascending" | "descending") => {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    void this.fetchProjects();
  };

  setFilterOptions = (options: {
    owner?: TAiProjectsFilterEntity | null;
    instructionsRoom?: TAiProjectsFilterEntity | null;
    knowledgeRoom?: TAiProjectsFilterEntity | null;
  }) => {
    this.ownerFilter = options.owner ?? null;
    this.instructionsRoomFilter = options.instructionsRoom ?? null;
    this.knowledgeRoomFilter = options.knowledgeRoom ?? null;
    void this.fetchProjects();
  };

  clearFilter = () => {
    this.filterValue = "";
    this.ownerFilter = null;
    this.instructionsRoomFilter = null;
    this.knowledgeRoomFilter = null;
    void this.fetchProjects();
  };

  setViewAs = (viewAs: TAiProjectsViewAs) => {
    this.viewAs = viewAs;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewAs);
    } catch {
      // The view still applies for the session.
    }
  };

  /** Replaces a project in every place the page keeps it. */
  private replaceProject = (project: TAiProject) => {
    this.projects = this.projects.map((p) => (p.id === project.id ? project : p));
    if (this.activeProject?.id === project.id) this.activeProject = project;
    if (this.projectDialog?.mode === "edit" && this.projectDialog.project.id === project.id) {
      this.projectDialog = { mode: "edit", project };
    }
  };

  private dropProject = (id: number) => {
    // A socket event can follow the caller's own delete or leave: count once.
    if (this.projects.some((p) => p.id === id)) {
      this.projects = this.projects.filter((p) => p.id !== id);
      this.total = Math.max(0, this.total - 1);
    }
    if (this.activeProject?.id === id) this.closeProject();
    // Handed over and left from its own Edit dialog: nothing is left to save.
    if (this.projectDialog?.mode === "edit" && this.projectDialog.project.id === id) {
      this.projectDialog = null;
    }
  };

  /* ---------------------------- Live updates ---------------------------- */

  /**
   * Holds the socket channels of the page and listens to `s:modify-folder`,
   * as the rooms do: the projects root (a project created, renamed, deleted
   * by someone else) and the open project. Called when the page mounts.
   */
  startLiveUpdates = () => {
    if (this.isLive) return;
    this.isLive = true;
    SocketHelper?.on(SocketEvents.ModifyFolder, this.onModifyFolder);
    this.syncChannels();
  };

  /** Drops the page's channels and stops listening; called when the page unmounts. */
  stopLiveUpdates = () => {
    if (!this.isLive) return;
    this.isLive = false;
    SocketHelper?.off(SocketEvents.ModifyFolder, this.onModifyFolder);
    if (this.listReloadTimer) clearTimeout(this.listReloadTimer);
    this.listReloadTimer = null;
    this.projectReloadTimers.forEach((timer) => clearTimeout(timer));
    this.projectReloadTimers.clear();
    this.syncChannels();
  };

  clearLostProject = () => {
    this.lostProjectId = null;
  };

  /**
   * Subscribes to the channels the page needs now and unsubscribes from the
   * ones it no longer does. A channel someone else already holds (the rooms
   * hold theirs while they are open) is used, never taken over or dropped.
   */
  private syncChannels = () => {
    const wanted = this.isLive
      ? [this.rootId, this.activeProject?.id]
          .filter((id): id is number => typeof id === "number")
          .map((id) => `DIR-${id}`)
      : [];
    const drop = this.ownedChannels.filter((channel) => !wanted.includes(channel));
    const add = wanted.filter(
      (channel) =>
        !this.ownedChannels.includes(channel) && !SocketHelper?.socketSubscribers.has(channel),
    );
    if (drop.length > 0) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, { roomParts: drop, individual: true });
    }
    if (add.length > 0) {
      SocketHelper?.emit(SocketCommands.Subscribe, { roomParts: add, individual: true });
    }
    this.ownedChannels = [...this.ownedChannels.filter((channel) => !drop.includes(channel)), ...add];
  };

  private onModifyFolder = (opt?: TOptSocket) => {
    if (!opt || opt.type !== "folder") return;
    const data = socketData(opt);
    const id = Number(opt.id ?? data?.id);
    if (!Number.isInteger(id)) return;
    const inRoot = this.rootId !== null && Number(data?.parentId) === this.rootId;
    const known = this.activeProject?.id === id || this.projects.some((p) => p.id === id);
    if (!inRoot && !known) return;

    if (opt.cmd === "delete") {
      runInAction(() => {
        if (this.activeProject?.id === id) this.lostProjectId = id;
        this.dropProject(id);
      });
      return;
    }
    if (opt.cmd === "create" || !known) {
      this.scheduleListReload();
      return;
    }
    this.scheduleProjectReload(id);
  };

  private scheduleListReload = () => {
    if (this.listReloadTimer) clearTimeout(this.listReloadTimer);
    this.listReloadTimer = setTimeout(() => {
      this.listReloadTimer = null;
      void this.fetchProjects();
    }, SOCKET_RELOAD_DELAY_MS);
  };

  private scheduleProjectReload = (id: number) => {
    const pending = this.projectReloadTimers.get(id);
    if (pending) clearTimeout(pending);
    this.projectReloadTimers.set(
      id,
      setTimeout(() => {
        this.projectReloadTimers.delete(id);
        void this.reloadProject(id);
      }, SOCKET_RELOAD_DELAY_MS),
    );
  };

  /**
   * Re-reads a project another user changed. The open one also re-syncs the
   * chat and its sources; a project the caller can no longer see (404) is
   * dropped, and an open one is left.
   */
  private reloadProject = async (id: number) => {
    try {
      const project = await getAiProject(id);
      const isActive = this.activeProject?.id === id;
      runInAction(() => this.replaceProject(project));
      if (isActive) {
        this.syncPreset(project);
        await Promise.all([this.fetchSkills(id), this.fetchKnowledge(id)]);
      }
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status !== 404 && status !== 403) return;
      runInAction(() => {
        if (this.activeProject?.id === id) this.lostProjectId = id;
        this.dropProject(id);
      });
    }
  };

  /* ------------------------------ Project ------------------------------ */

  openProject = async (project: TAiProject) => {
    this.activeProject = project;
    this.syncChannels();
    this.skills = [];
    this.knowledge = [];
    this.syncPreset(project);
    await Promise.all([this.fetchSkills(project.id), this.fetchKnowledge(project.id)]);
  };

  openProjectById = async (id: number) => {
    const known = this.projects.find((p) => p.id === id);
    if (known) return this.openProject(known);
    try {
      const project = await getAiProject(id);
      await this.openProject(project);
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  closeProject = () => {
    this.activeProject = null;
    this.syncChannels();
    this.aiPresetsStore.setActivePreset(null);
  };

  /**
   * The chat reads the project through the preset hook: its Instructions
   * rooms are the context (skills) rooms and its Knowledge rooms the
   * knowledge bases.
   */
  private syncPreset = (project: TAiProject) => {
    const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
    const toRooms = (rooms: TAiProjectSource[]) =>
      rooms
        .filter((room) => room.available)
        .map((room) => ({ cloud: "docspace", id: String(room.id), name: room.title }));
    this.aiPresetsStore.setActivePreset({
      id: String(project.id),
      name: project.title,
      createdAt: project.created,
      profileId: profile?.id ?? null,
      profileName: profile?.name ?? null,
      contextRooms: toRooms(instructionsRooms),
      knowledgeRooms: toRooms(knowledgeRooms),
    });
  };

  refreshActiveProject = async () => {
    if (!this.activeProject) return;
    try {
      const project = await getAiProject(this.activeProject.id);
      runInAction(() => this.replaceProject(project));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  fetchSkills = async (id: number) => {
    try {
      const rooms = await getAiProjectSkills(id);
      runInAction(() => {
        if (this.activeProject?.id === id) this.skills = rooms;
      });
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  fetchKnowledge = async (id: number) => {
    try {
      const rooms = await getAiProjectKnowledge(id);
      runInAction(() => {
        if (this.activeProject?.id === id) this.knowledge = rooms;
      });
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  /* ----------------------------- Mutations ----------------------------- */

  createProject = async (data: TAiProjectRequest) => {
    const project = await createAiProject(data);
    showWarnings(project);
    runInAction(() => {
      this.projects = [project, ...this.projects];
      this.total += 1;
      this.isLoaded = true;
    });
    return project;
  };

  updateProject = async (id: number, data: TAiProjectRequest) => {
    const project = await updateAiProject(id, data);
    showWarnings(project);
    runInAction(() => this.replaceProject(project));
    if (this.activeProject?.id === id) {
      this.syncPreset(project);
      await Promise.all([this.fetchSkills(id), this.fetchKnowledge(id)]);
    }
    return project;
  };

  removeProject = async (project: TAiProject) => {
    await waitForOperation(await deleteAiProject(project.id));
    runInAction(() => this.dropProject(project.id));
  };

  /** Copies the project (without its members); the copy shows on the list once made. */
  duplicateProject = async (project: TAiProject) => {
    try {
      await waitForOperation(await duplicateAiProject(project.id));
      await this.fetchProjects();
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  /** Turns the project's notifications off or back on for the caller. */
  toggleMute = async (project: TAiProject) => {
    const mute = !project.mute;
    await muteAiProject(project.id, mute);
    runInAction(() => this.replaceProject({ ...project, mute }));
  };

  togglePin = async (project: TAiProject) => {
    try {
      const updated = await pinAiProject(project.id, !project.pinned);
      runInAction(() => this.replaceProject(updated));
      await this.fetchProjects();
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  leaveProject = async (project: TAiProject) => {
    await leaveAiProject(project.id);
    runInAction(() => this.dropProject(project.id));
  };

  changeOwner = async (project: TAiProject, userId: string, keepAsManager: boolean) => {
    await changeAiProjectOwner(project.id, userId, keepAsManager);
    if (!keepAsManager) {
      runInAction(() => this.dropProject(project.id));
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

  closeProjectDialog = () => (this.projectDialog = null);

  openDelete = (project: TAiProject) => (this.deleteFor = project);

  closeDelete = () => (this.deleteFor = null);

  openLeave = (project: TAiProject) => (this.leaveFor = project);

  closeLeave = () => (this.leaveFor = null);

}

export default AiProjectsStore;
