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

import { makeAutoObservable, observable } from "mobx";

import type {
  AiChatPresetRoom,
  AiChatPresetSettings,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";

/** A saved AI chat setup: the model, the skills rooms and the knowledge bases. */
export type TAiPreset = AiChatPresetSettings & {
  id: string;
  name: string;
  createdAt: string;
};

export type { AiChatPresetRoom, AiChatPresetSettings };

const STORAGE_PREFIX = "docspace_ai_presets";

const storageKey = (userId: string) => `${STORAGE_PREFIX}_${userId}`;

const isRoom = (value: unknown): value is AiChatPresetRoom =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as AiChatPresetRoom).id === "string" &&
  typeof (value as AiChatPresetRoom).name === "string" &&
  typeof (value as AiChatPresetRoom).cloud === "string";

const isRoomList = (value: unknown): value is AiChatPresetRoom[] =>
  Array.isArray(value) && value.every(isRoom);

/**
 * A stored preset, in today's shape (room lists) or the first one (one
 * room of each kind, or `null`); anything else is dropped. The old shape
 * is read as lists of one, so a preset saved before survives the change.
 */
const readPreset = (value: unknown): TAiPreset | null => {
  if (typeof value !== "object" || value === null) return null;
  const preset = value as Record<string, unknown>;
  if (typeof preset.id !== "string" || typeof preset.name !== "string") {
    return null;
  }
  const rooms = (list: unknown, single: unknown): AiChatPresetRoom[] | null => {
    if (isRoomList(list)) return list;
    if (list !== undefined) return null;
    if (single === null || single === undefined) return [];
    return isRoom(single) ? [single] : null;
  };
  const contextRooms = rooms(preset.contextRooms, preset.contextRoom);
  const knowledgeRooms = rooms(preset.knowledgeRooms, preset.knowledgeRoom);
  if (!contextRooms || !knowledgeRooms) return null;
  return {
    id: preset.id,
    name: preset.name,
    createdAt: typeof preset.createdAt === "string" ? preset.createdAt : "",
    profileId: typeof preset.profileId === "string" ? preset.profileId : null,
    profileName:
      typeof preset.profileName === "string" ? preset.profileName : null,
    contextRooms,
    knowledgeRooms,
  };
};

const readPresets = (key: string): TAiPreset[] => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(readPreset)
      .filter((preset): preset is TAiPreset => preset !== null);
  } catch {
    return [];
  }
};

const writePresets = (key: string, presets: TAiPreset[]) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(presets));
  } catch {
    // Storage may be full or blocked (private mode): the in-memory list
    // still serves the session, the next successful write catches up.
  }
};

/**
 * AI chat presets: named snapshots of the chat setup the user saves from the
 * panel header and reopens from the AI Presets page. Kept in localStorage,
 * one list per user, so a preset never follows another account in the same
 * browser.
 */
class AiPresetsStore {
  presets: TAiPreset[] = [];

  userId: string | null = null;

  /** The settings the save dialog is open for; `null` while it is closed. */
  pendingSettings: AiChatPresetSettings | null = null;

  /**
   * The preset the open chat was started from. Its skills rooms are handed
   * to the chat as the context rooms instead of the room the user stands in,
   * until the panel closes.
   */
  activePreset: TAiPreset | null = null;

  /**
   * A preset picked in the chat's model picker ("Choose AI Preset"), waiting
   * for AiPresetsBridge to apply it to the open chat; `null` once applied.
   * The store only records the request: applying needs the chat stores a
   * MobX store cannot reach.
   */
  pendingApply: TAiPreset | null = null;

  constructor() {
    makeAutoObservable(this, { pendingApply: observable.ref });
  }

  init = (userId: string | null) => {
    if (this.userId === userId) return;
    this.userId = userId;
    this.presets = userId ? readPresets(storageKey(userId)) : [];
    this.activePreset = null;
  };

  openSaveDialog = (settings: AiChatPresetSettings) => {
    this.pendingSettings = settings;
  };

  closeSaveDialog = () => {
    this.pendingSettings = null;
  };

  savePreset = (name: string): TAiPreset | null => {
    const settings = this.pendingSettings;
    const title = name.trim();
    if (!settings || !title) return null;

    const preset: TAiPreset = {
      ...settings,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: title,
      createdAt: new Date().toISOString(),
    };
    this.presets = [...this.presets, preset];
    this.pendingSettings = null;
    if (this.userId) writePresets(storageKey(this.userId), this.presets);
    return preset;
  };

  setActivePreset = (preset: TAiPreset | null) => {
    this.activePreset = preset;
  };

  /**
   * Changes the rooms of the project the open chat runs on, from the
   * project view's sources column: the active project and its saved copy
   * both take the change, so the project reopens the same way.
   */
  updateActiveProject = (
    patch: Partial<Pick<TAiPreset, "contextRooms" | "knowledgeRooms">>,
  ) => {
    const active = this.activePreset;
    if (!active) return;
    const next: TAiPreset = { ...active, ...patch };
    this.activePreset = next;
    this.presets = this.presets.map((preset) =>
      preset.id === next.id ? next : preset,
    );
    if (this.userId) writePresets(storageKey(this.userId), this.presets);
  };

  requestApply = (preset: TAiPreset) => {
    this.pendingApply = preset;
  };

  consumePendingApply = (): TAiPreset | null => {
    const preset = this.pendingApply;
    this.pendingApply = null;
    return preset;
  };

  /** The active preset's skills rooms as the chat's context rooms; `null` outside a preset. */
  get activePresetContextRooms(): { id: string; name: string }[] | null {
    const rooms = this.activePreset?.contextRooms;
    return rooms ? rooms.map((room) => ({ id: room.id, name: room.name })) : null;
  }
}

export default AiPresetsStore;
