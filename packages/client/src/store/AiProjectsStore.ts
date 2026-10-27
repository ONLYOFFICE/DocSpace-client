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
import {
  AiProjectAccess,
  changeAiProjectOwner,
  createAiProject,
  deleteAiProject,
  getAiProject,
  getAiProjectKnowledge,
  getAiProjectLinks,
  getAiProjectMembers,
  getAiProjects,
  getAiProjectSkills,
  leaveAiProject,
  pinAiProject,
  setAiProjectLink,
  setAiProjectMembers,
  updateAiProject,
} from "@docspace/shared/api/ai/projects";
import type {
  TAiProject,
  TAiProjectAccess,
  TAiProjectInvitation,
  TAiProjectKnowledgeRoom,
  TAiProjectLink,
  TAiProjectMember,
  TAiProjectRequest,
  TAiProjectSkillsRoom,
  TAiProjectsQuery,
} from "@docspace/shared/api/ai/projects";

import type AiPresetsStore from "./AiPresetsStore";

export type TAiProjectsViewAs = "table" | "row" | "tile";
export type TAiProjectsSortBy = NonNullable<TAiProjectsQuery["sortBy"]>;

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

const errorMessage = (e: unknown): string => {
  if (typeof e === "object" && e !== null) {
    const err = e as { message?: string; response?: { data?: { error?: string } } };
    return err.response?.data?.error ?? err.message ?? String(e);
  }
  return String(e);
};

/**
 * AI Projects: the list the page shows, the project opened in the chat and
 * the dialogs around them. Talks to `/api/2.0/ai/projects` only; the chat
 * itself is handed the project through `AiPresetsStore.activePreset`, the
 * same hook a saved preset used, so the Shell wiring stays as it is.
 */
class AiProjectsStore {
  aiPresetsStore: AiPresetsStore;

  projects: TAiProject[] = [];

  total = 0;

  isLoading = false;

  isLoaded = false;

  filterValue = "";

  /** The role filter: `None` means any role. */
  roleFilter: TAiProjectAccess = AiProjectAccess.None;

  hasInstructionsFilter = false;

  hasKnowledgeFilter = false;

  sortBy: TAiProjectsSortBy = "DateAndTime";

  sortOrder: "ascending" | "descending" = "descending";

  viewAs: TAiProjectsViewAs = readViewAs();

  /** The project open in the chat; `null` on the list. */
  activeProject: TAiProject | null = null;

  members: TAiProjectMember[] = [];

  links: TAiProjectLink[] = [];

  skills: TAiProjectSkillsRoom[] = [];

  knowledge: TAiProjectKnowledgeRoom[] = [];

  projectDialog: TProjectDialogState | null = null;

  deleteFor: TAiProject | null = null;

  /** The project the "Leave the project" confirmation is open for. */
  leaveFor: TAiProject | null = null;

  private requestId = 0;

  constructor(aiPresetsStore: AiPresetsStore) {
    this.aiPresetsStore = aiPresetsStore;
    makeAutoObservable(this, { aiPresetsStore: false });
  }

  get isFiltered() {
    return this.filterValue.trim().length > 0 || this.hasFilterOptions;
  }

  /** Whether a filter option (role, rooms) is applied, apart from the search. */
  get hasFilterOptions() {
    return (
      this.roleFilter !== AiProjectAccess.None ||
      this.hasInstructionsFilter ||
      this.hasKnowledgeFilter
    );
  }

  get activeMembersCount() {
    return this.members.length;
  }

  /* ------------------------------- List -------------------------------- */

  fetchProjects = async () => {
    const id = ++this.requestId;
    this.isLoading = true;
    try {
      const page = await getAiProjects({
        filterValue: this.filterValue.trim() || undefined,
        role: this.roleFilter !== AiProjectAccess.None ? this.roleFilter : undefined,
        hasInstructions: this.hasInstructionsFilter || undefined,
        hasKnowledge: this.hasKnowledgeFilter || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        count: 100,
      });
      if (id !== this.requestId) return;
      runInAction(() => {
        this.projects = page.folders;
        this.total = page.total;
        this.isLoaded = true;
      });
    } catch (e) {
      if (id === this.requestId) toastr.error(errorMessage(e));
    } finally {
      if (id === this.requestId) runInAction(() => (this.isLoading = false));
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
    role?: TAiProjectAccess;
    hasInstructions?: boolean;
    hasKnowledge?: boolean;
  }) => {
    this.roleFilter = options.role ?? AiProjectAccess.None;
    this.hasInstructionsFilter = !!options.hasInstructions;
    this.hasKnowledgeFilter = !!options.hasKnowledge;
    void this.fetchProjects();
  };

  clearFilter = () => {
    this.filterValue = "";
    this.roleFilter = AiProjectAccess.None;
    this.hasInstructionsFilter = false;
    this.hasKnowledgeFilter = false;
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
    this.projects = this.projects.filter((p) => p.id !== id);
    this.total = Math.max(0, this.total - 1);
    if (this.activeProject?.id === id) this.closeProject();
  };

  /* ------------------------------ Project ------------------------------ */

  openProject = async (project: TAiProject) => {
    this.activeProject = project;
    this.skills = [];
    this.knowledge = [];
    this.members = [];
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
    this.aiPresetsStore.setActivePreset(null);
  };

  /**
   * The chat reads the project through the preset hook: its Instructions
   * rooms are the context (skills) rooms and its Knowledge rooms the
   * knowledge bases.
   */
  private syncPreset = (project: TAiProject) => {
    const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
    const toRoom = (room: { id: number; title: string }) => ({
      cloud: "docspace",
      id: String(room.id),
      name: room.title,
    });
    this.aiPresetsStore.setActivePreset({
      id: String(project.id),
      name: project.title,
      createdAt: project.created,
      profileId: profile?.id ?? null,
      profileName: profile?.name ?? null,
      contextRooms: instructionsRooms.map(toRoom),
      knowledgeRooms: knowledgeRooms.map(toRoom),
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
    runInAction(() => {
      this.projects = [project, ...this.projects];
      this.total += 1;
      this.isLoaded = true;
    });
    return project;
  };

  updateProject = async (id: number, data: TAiProjectRequest) => {
    const project = await updateAiProject(id, data);
    runInAction(() => this.replaceProject(project));
    if (this.activeProject?.id === id) {
      this.syncPreset(project);
      await Promise.all([this.fetchSkills(id), this.fetchKnowledge(id)]);
    }
    return project;
  };

  removeProject = async (project: TAiProject) => {
    await deleteAiProject(project.id);
    runInAction(() => this.dropProject(project.id));
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
    const updated = await changeAiProjectOwner(project.id, userId, keepAsManager);
    runInAction(() => {
      if (keepAsManager) this.replaceProject(updated);
      else this.dropProject(project.id);
    });
    if (this.activeProject?.id === project.id) await this.fetchMembers(project.id);
  };

  /* ------------------------------ Members ------------------------------ */

  fetchMembers = async (id: number) => {
    try {
      const members = await getAiProjectMembers(id);
      runInAction(() => (this.members = members));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  setMembers = async (
    project: TAiProject,
    invitations: TAiProjectInvitation[],
    notify = false,
    message = "",
  ) => {
    const result = await setAiProjectMembers(project.id, invitations, notify, message);
    runInAction(() => (this.members = result.members));
    if (result.warning) toastr.warning(result.warning);
    await this.refreshActiveProject();
    return result;
  };

  fetchLinks = async (id: number) => {
    try {
      const links = await getAiProjectLinks(id);
      runInAction(() => (this.links = links));
    } catch (e) {
      toastr.error(errorMessage(e));
    }
  };

  setLink = async (id: number, enabled: boolean) => {
    const link = await setAiProjectLink(id, enabled);
    runInAction(() => (this.links = link ? [link] : []));
    return link;
  };

  isMember = (userId: string | undefined, project: TAiProject | null) =>
    !!project && !!userId && project.inRoom;

  roleOf = (project: TAiProject) => project.access;

  isManagerOf = (project: TAiProject) =>
    project.access === AiProjectAccess.Owner ||
    project.access === AiProjectAccess.ProjectManager;

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
