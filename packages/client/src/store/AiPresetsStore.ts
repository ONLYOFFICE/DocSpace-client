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

import { makeAutoObservable, observable, runInAction } from "mobx";

import type {
  AiChatPresetRoom,
  AiChatPresetSettings,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";

import {
  createAiProject,
  deleteAiProject,
  getAiProject,
  getAiProjects,
  type TAiProject,
  type TAiProjectLogo,
  type TAiProjectSource,
} from "@docspace/shared/api/ai/projects";

/**
 * An AI project as the chat takes it: the model, its Instructions rooms as
 * the skills (context) rooms and its Knowledge rooms as the knowledge bases.
 */
export type TAiPreset = AiChatPresetSettings & {
  id: string;
  name: string;
  createdAt: string;
  /** The project's logo, for the sidebar's list under Agents. */
  logo?: TAiProjectLogo;
  /** What the user may do with the project: the chat panel's "Agent actions". */
  rights: TAiPresetRights;
};

export type TAiPresetRights = {
  /** Change the project's settings (the owner and the project managers). */
  edit: boolean;
  /** Invite to the project and change its members. */
  share: boolean;
  delete: boolean;
};

export type { AiChatPresetRoom, AiChatPresetSettings };

/**
 * How a pick ended: handed to the bridge, refused because the project is
 * gone, or overtaken by a later pick (or called off) before its read came
 * back - then it is dropped without a word.
 */
/** How long a read list counts as current for the chat's own re-reads. */
export const PRESETS_FRESH_MS = 10_000;

export type TAiPresetApplyResult = "applied" | "gone" | "superseded";

/** How many projects the chat panel's agents menu offers, the most recent first. */
const PICKER_PROJECTS_COUNT = 100;

// A linked room the caller can no longer read is not connected.
const toChatRooms = (rooms: TAiProjectSource[]): AiChatPresetRoom[] =>
  rooms
    .filter((room) => room.available && room.title)
    .map((room) => ({ cloud: "docspace", id: String(room.id), name: room.title }));

export const toAiPreset = (project: TAiProject): TAiPreset => {
  const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
  return {
    id: String(project.id),
    name: project.title,
    createdAt: project.created,
    logo: project.logo,
    profileId: profile?.id ?? null,
    profileName: profile?.name ?? null,
    contextRooms: toChatRooms(instructionsRooms),
    knowledgeRooms: toChatRooms(knowledgeRooms),
    rights: {
      edit: !!project.aiProject.canEditSettings,
      share: !!project.security?.EditAccess,
      delete: !!project.security?.Delete,
    },
  };
};

// The DocSpace room ids of a chat's rooms; rooms of another cloud are not
// linked to a project.
const toRoomIds = (rooms: AiChatPresetRoom[]) =>
  rooms
    .filter((room) => room.cloud === "docspace")
    .map((room) => Number(room.id))
    .filter((id) => Number.isInteger(id) && id > 0);

/**
 * The AI projects in a chat outside the projects page: the panel title's
 * agents menu lists them (`ai/projects`), picking one carries its
 * model, skills and knowledge bases into the open chat, and the panel
 * header's save button creates a project from the chat's setup.
 */
class AiPresetsStore {
  presets: TAiPreset[] = [];

  userId: string | null = null;

  /** The settings the save dialog is open for; `null` while it is closed. */
  pendingSettings: AiChatPresetSettings | null = null;

  /**
   * The project the open chat runs on. Its Instructions rooms are handed to
   * the chat as the context rooms instead of the room the user stands in,
   * until the panel closes.
   */
  activePreset: TAiPreset | null = null;

  /**
   * A project picked in the chat's agents menu, waiting for AiPresetsBridge
   * to apply it to the open chat; `null` once applied. The store only
   * records the request: applying needs the chat stores a MobX store cannot
   * reach.
   */
  pendingApply: TAiPreset | null = null;

  private requestId = 0;

  // When the list was last read, and the read on its way: the chat's own
  // re-reads (`refreshPresets`) skip a list that is current or coming.
  private lastReadAt = 0;

  private reading: Promise<void> | null = null;

  // The latest pick: a read that comes back for an older one is dropped.
  private applyRequestId = 0;

  constructor() {
    makeAutoObservable<this, "lastReadAt" | "reading">(this, {
      pendingApply: observable.ref,
      lastReadAt: false,
      reading: false,
    });
  }

  init = (userId: string | null) => {
    if (this.userId === userId) return;
    this.userId = userId;
    this.presets = [];
    this.activePreset = null;
    this.lastReadAt = 0;
    if (userId) void this.fetchPresets();
  };

  /**
   * Re-reads the projects the menu offers; a failed read keeps the last
   * list. Always reads: for a list known to have changed (a project created
   * or edited here).
   */
  fetchPresets = (): Promise<void> => {
    if (!this.userId) return Promise.resolve();
    const read = this.readPresets();
    this.reading = read;
    void read.finally(() => {
      if (this.reading === read) this.reading = null;
    });
    return read;
  };

  /**
   * Re-reads the projects unless they were read a moment ago or a read is
   * on its way: what the chat does when it or its agents menu opens, so
   * opening the panel and then the menu reads once.
   */
  refreshPresets = (): Promise<void> => {
    if (this.reading !== null) return this.reading;
    if (Date.now() - this.lastReadAt < PRESETS_FRESH_MS) return Promise.resolve();
    return this.fetchPresets();
  };

  private readPresets = async () => {
    const id = ++this.requestId;
    try {
      const page = await getAiProjects({
        sortBy: "DateAndTime",
        sortOrder: "descending",
        count: PICKER_PROJECTS_COUNT,
      });
      runInAction(() => {
        if (id !== this.requestId) return;
        this.presets = page.folders.map(toAiPreset);
        this.lastReadAt = Date.now();
      });
    } catch {
      // AI or the projects may be unavailable to the caller: no picker entry.
    }
  };

  openSaveDialog = (settings: AiChatPresetSettings) => {
    this.pendingSettings = settings;
  };

  closeSaveDialog = () => {
    this.pendingSettings = null;
  };

  /**
   * Creates an AI project from the chat's setup. Resolves to the new
   * project, or `null` without a name or an open dialog; a refused create
   * rejects and leaves the dialog open.
   */
  savePreset = async (name: string): Promise<{ preset: TAiPreset; project: TAiProject } | null> => {
    const settings = this.pendingSettings;
    const title = name.trim();
    if (!settings || !title) return null;

    const project = await createAiProject({
      title,
      aiProject: {
        profileId: settings.profileId,
        instructionsRoomIds: toRoomIds(settings.contextRooms),
        knowledgeRoomIds: toRoomIds(settings.knowledgeRooms),
      },
    });
    const preset = toAiPreset(project);
    runInAction(() => {
      this.presets = [preset, ...this.presets.filter((p) => p.id !== preset.id)];
      this.pendingSettings = null;
    });
    return { preset, project };
  };

  setActivePreset = (preset: TAiPreset | null) => {
    this.activePreset = preset;
  };

  /**
   * Deletes a project for good, from the chat panel's "Agent actions": once
   * the server's delete operation has ended it leaves the list, and the chat
   * if it runs on it. A refused or failed delete rejects and changes nothing.
   */
  deletePreset = async (id: string) => {
    await deleteAiProject(Number(id));
    runInAction(() => {
      this.presets = this.presets.filter((preset) => preset.id !== id);
      if (this.activePreset?.id === id) this.activePreset = null;
    });
  };

  /**
   * A project picked in the agents menu: read again, so the chat gets the
   * project as it is now, then handed to the bridge. A project that is gone
   * leaves the list and is not applied. A read that fails otherwise rejects
   * with its error and applies nothing: the list's copy has neither the
   * model nor the rooms. Only the latest pick is applied: a read that comes
   * back after another pick, or after `cancelApply`, is dropped.
   */
  requestApply = async (preset: TAiPreset): Promise<TAiPresetApplyResult> => {
    const id = ++this.applyRequestId;
    let fresh: TAiPreset;
    try {
      fresh = toAiPreset(await getAiProject(Number(preset.id)));
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 403) {
        runInAction(() => {
          this.presets = this.presets.filter((p) => p.id !== preset.id);
        });
        return id === this.applyRequestId ? "gone" : "superseded";
      }
      if (id !== this.applyRequestId) return "superseded";
      throw e;
    }
    if (id !== this.applyRequestId) return "superseded";
    runInAction(() => {
      this.presets = this.presets.map((p) => (p.id === fresh.id ? fresh : p));
      this.pendingApply = fresh;
    });
    return "applied";
  };

  /**
   * Calls off a pick still being read, and one read but not yet applied:
   * the default agent picked, the current agent picked again, the panel
   * closed.
   */
  cancelApply = () => {
    this.applyRequestId += 1;
    this.pendingApply = null;
  };

  consumePendingApply = (): TAiPreset | null => {
    const preset = this.pendingApply;
    this.pendingApply = null;
    return preset;
  };

  /** The active project's Instructions rooms as the chat's context rooms; `null` outside a project. */
  get activePresetContextRooms(): { id: string; name: string }[] | null {
    const rooms = this.activePreset?.contextRooms;
    return rooms ? rooms.map((room) => ({ id: room.id, name: room.name })) : null;
  }
}

export default AiPresetsStore;
