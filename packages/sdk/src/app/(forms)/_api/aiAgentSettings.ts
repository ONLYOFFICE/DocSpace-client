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

import { request } from "@docspace/shared/api/client";
import { getProgress } from "@docspace/shared/api/files";
import type { TOperation } from "@docspace/shared/api/files/types";
import { FolderType } from "@docspace/shared/enums";

import {
  externalStorageGet,
  externalStorageSet,
  isExternalStorageAvailable,
} from "@/utils/externalStorage";

const FOLDER_AGENTS_STORAGE_KEY = "forms_folder_agents";
const AI_ENABLED_STORAGE_KEY = "forms_ai_enabled";
const ASK_FROM_DB_AGENT_KEY = "askFromDBAgent";
const USER_DISABLED_STORAGE_KEY = "forms_ai_user_disabled";
const PANEL_WIDTH_STORAGE_KEY = "forms_chat_panel_width";
const PANEL_POSITION_STORAGE_KEY = "forms_chat_panel_position";

const EXT_FOLDER_AGENTS = (roomId: string | number) =>
  `aiforms.folderAgents.${roomId}`;
const EXT_AI_ENABLED = (roomId: string | number) =>
  `aiforms.aiEnabled.${roomId}`;
const EXT_USER_DISABLED = (roomId: string | number) =>
  `aiforms.userDisabled.${roomId}`;
const EXT_ASK_FROM_DB = (roomId: string | number) =>
  `aiforms.askFromDB.${roomId}`;
const EXT_PANEL_WIDTH = (roomId: string | number) =>
  `aiforms.panelWidth.${roomId}`;
const EXT_PANEL_POSITION = "aiforms.panelPosition";

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
};

const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
};

export const tokenToHash = (token: string): string => {
  let h = 0;
  for (let i = 0; i < token.length; i++) {
    h = (Math.imul(31, h) + token.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
};

export const SERVICE_TAG_PREFIX = "aiforms-";

export const serviceTagForFolder = (folderId: number | string) =>
  `${SERVICE_TAG_PREFIX}f-${folderId}`;

export const serviceTagForAskDB = (roomId: number | string) =>
  `${SERVICE_TAG_PREFIX}askdb-r-${roomId}`;

export const isServiceTag = (tag: string): boolean =>
  tag.startsWith(SERVICE_TAG_PREFIX);

export type FolderAgentEntry = {
  agentId: number;
  knowledgeFolderId: number | null;
};

export type FolderAgentsMap = Record<number, FolderAgentEntry>;

const folderAgentsKey = (roomId: string | number, userHash?: string) =>
  userHash
    ? `${FOLDER_AGENTS_STORAGE_KEY}_${userHash}_${roomId}`
    : `${FOLDER_AGENTS_STORAGE_KEY}_${roomId}`;


export const saveFolderAgentsMap = (
  roomId: string | number,
  map: FolderAgentsMap,
  userHash?: string,
) => {
  safeSet(folderAgentsKey(roomId, userHash), JSON.stringify(map));
  void externalStorageSet(EXT_FOLDER_AGENTS(roomId), map);
};

const parseFolderAgents = (raw: string): FolderAgentsMap | null => {
  try {
    return JSON.parse(raw) as FolderAgentsMap;
  } catch {
    return null;
  }
};

export const loadFolderAgentsMap = async (
  roomId: string | number,
  userHash?: string,
): Promise<FolderAgentsMap> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<FolderAgentsMap>(
      EXT_FOLDER_AGENTS(roomId),
    );
    if (ext !== null) return ext;

    const lsVal = safeGet(folderAgentsKey(roomId, userHash));
    if (lsVal !== null) {
      const parsed = parseFolderAgents(lsVal);
      if (parsed) {
        void externalStorageSet(EXT_FOLDER_AGENTS(roomId), parsed);
        return parsed;
      }
    }
    return {};
  }

  const val = safeGet(folderAgentsKey(roomId, userHash));
  if (!val) return {};
  return parseFolderAgents(val) ?? {};
};

export const clearFolderAgentsMap = (
  roomId: string | number,
  userHash?: string,
) => {
  safeRemove(folderAgentsKey(roomId, userHash));
  void externalStorageSet(EXT_FOLDER_AGENTS(roomId), {});
};


const aiEnabledKey = (roomId: string | number, userHash?: string) =>
  userHash
    ? `${AI_ENABLED_STORAGE_KEY}_${userHash}_${roomId}`
    : `${AI_ENABLED_STORAGE_KEY}_${roomId}`;

export const saveAiEnabled = (
  roomId: string | number,
  enabled: boolean,
  userHash?: string,
) => {
  safeSet(aiEnabledKey(roomId, userHash), String(enabled));
  void externalStorageSet(EXT_AI_ENABLED(roomId), enabled);
};

export const loadAiEnabled = async (
  roomId: string | number,
  userHash?: string,
): Promise<boolean> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<boolean>(EXT_AI_ENABLED(roomId));
    if (ext !== null) return ext;

    const lsVal = safeGet(aiEnabledKey(roomId, userHash));
    if (lsVal !== null) {
      const parsed = lsVal === "true";
      void externalStorageSet(EXT_AI_ENABLED(roomId), parsed);
      return parsed;
    }
    return false;
  }
  return safeGet(aiEnabledKey(roomId, userHash)) === "true";
};


const askFromDBAgentKey = (roomId: string | number, userHash?: string) =>
  userHash
    ? `${ASK_FROM_DB_AGENT_KEY}_${userHash}_${roomId}`
    : `${ASK_FROM_DB_AGENT_KEY}_${roomId}`;

export const saveAskFromDBAgentId = (
  roomId: string | number,
  agentId: number,
  userHash?: string,
) => {
  safeSet(askFromDBAgentKey(roomId, userHash), String(agentId));
  void externalStorageSet(EXT_ASK_FROM_DB(roomId), agentId);
};

export const loadAskFromDBAgentId = async (
  roomId: string | number,
  userHash?: string,
): Promise<number | null> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<number>(EXT_ASK_FROM_DB(roomId));
    if (ext !== null && Number.isFinite(ext)) return ext;

    const lsVal = safeGet(askFromDBAgentKey(roomId, userHash));
    if (lsVal !== null) {
      const parsed = Number(lsVal);
      if (Number.isFinite(parsed)) {
        void externalStorageSet(EXT_ASK_FROM_DB(roomId), parsed);
        return parsed;
      }
    }
    return null;
  }

  const val = safeGet(askFromDBAgentKey(roomId, userHash));
  if (!val) return null;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : null;
};

const userDisabledKey = (roomId: string | number, userHash?: string) =>
  userHash
    ? `${USER_DISABLED_STORAGE_KEY}_${userHash}_${roomId}`
    : `${USER_DISABLED_STORAGE_KEY}_${roomId}`;

export const saveUserExplicitlyDisabled = (
  roomId: string | number,
  disabled: boolean,
  userHash?: string,
) => {
  safeSet(userDisabledKey(roomId, userHash), String(disabled));
  void externalStorageSet(EXT_USER_DISABLED(roomId), disabled);
};

export const loadUserExplicitlyDisabled = async (
  roomId: string | number,
  userHash?: string,
): Promise<boolean> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<boolean>(EXT_USER_DISABLED(roomId));
    if (ext !== null) return ext;

    const lsVal = safeGet(userDisabledKey(roomId, userHash));
    if (lsVal !== null) {
      const parsed = lsVal === "true";
      void externalStorageSet(EXT_USER_DISABLED(roomId), parsed);
      return parsed;
    }
    return false;
  }
  return safeGet(userDisabledKey(roomId, userHash)) === "true";
};


export const getKnowledgeFolderId = async (
  agentId: number,
): Promise<number | null> => {
  const res = (await request({
    method: "get",
    url: `/files/${agentId}`,
  })) as {
    folders?: { id: number; type: number; title: string }[];
    current?: { id: number; security?: Record<string, boolean> };
  };

  const kbFolder = res?.folders?.find((f) => f.type === FolderType.Knowledge);
  return kbFolder?.id ?? null;
};

const pollOperation = async (
  opId: string,
  signal?: AbortSignal,
  maxAttempts = 30,
) => {
  let misses = 0;
  for (let i = 0; i < maxAttempts; i++) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 1000));
    if (signal?.aborted) return;
    const ops = await getProgress(opId);
    const op = ops?.find((o: TOperation) => o.id === opId);
    if (!op) {
      misses++;
      if (misses > 3) {
        throw new Error("Copy operation not found");
      }
      continue;
    }
    if (op.error) throw new Error(op.error);
    if (op.finished) return op;
  }
  throw new Error("Copy operation timed out");
};

export const copyFilesToAgentRoom = async (
  destFolderId: number,
  fileIds: number[],
  signal?: AbortSignal,
) => {
  const ops = (await request({
    method: "put",
    url: "/files/fileops/copy",
    data: {
      destFolderId,
      folderIds: [],
      fileIds,
      conflictResolveType: 0, // Skip if already exists
      deleteAfter: false,
      content: false,
    },
  })) as TOperation[];

  if (ops?.[0]?.id && !ops[0].finished) {
    await pollOperation(ops[0].id, signal);
  }
};

export const vectorizeFiles = async (fileIds: number[]) => {
  return request({
    method: "post",
    url: "/ai/vectorization/tasks",
    data: { files: fileIds },
  });
};


export const PANEL_MIN_WIDTH = 300;
export const PANEL_MAX_WIDTH = 600;
export const MIN_SECTION_WIDTH = 400;


export type PanelPosition = "left" | "right";

const panelWidthKey = (roomId: string | number, userHash?: string) =>
  userHash
    ? `${PANEL_WIDTH_STORAGE_KEY}_${userHash}_${roomId}`
    : `${PANEL_WIDTH_STORAGE_KEY}_${roomId}`;

const panelPositionKey = (userHash?: string) =>
  userHash
    ? `${PANEL_POSITION_STORAGE_KEY}_${userHash}`
    : PANEL_POSITION_STORAGE_KEY;

export const savePanelWidth = (
  roomId: string | number,
  width: number,
  userHash?: string,
) => {
  safeSet(panelWidthKey(roomId, userHash), String(width));
  void externalStorageSet(EXT_PANEL_WIDTH(roomId), width);
};

export const loadPanelWidth = async (
  roomId: string | number,
  userHash?: string,
): Promise<number | null> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<number>(EXT_PANEL_WIDTH(roomId));
    if (ext !== null && Number.isFinite(ext)) return ext;

    const lsVal = safeGet(panelWidthKey(roomId, userHash));
    if (lsVal !== null) {
      const parsed = Number(lsVal);
      if (Number.isFinite(parsed)) {
        void externalStorageSet(EXT_PANEL_WIDTH(roomId), parsed);
        return parsed;
      }
    }
    return null;
  }

  const val = safeGet(panelWidthKey(roomId, userHash));
  if (!val) return null;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : null;
};

export const savePanelPosition = (
  position: PanelPosition,
  userHash?: string,
) => {
  safeSet(panelPositionKey(userHash), position);
  void externalStorageSet(EXT_PANEL_POSITION, position);
};

export const loadPanelPosition = async (
  userHash?: string,
): Promise<PanelPosition> => {
  if (await isExternalStorageAvailable()) {
    const ext = await externalStorageGet<PanelPosition>(EXT_PANEL_POSITION);
    if (ext === "right" || ext === "left") return ext;

    const lsVal = safeGet(panelPositionKey(userHash));
    if (lsVal !== null) {
      const normalized: PanelPosition = lsVal === "right" ? "right" : "left";
      void externalStorageSet(EXT_PANEL_POSITION, normalized);
      return normalized;
    }
    return "left";
  }

  const val = safeGet(panelPositionKey(userHash));
  return val === "right" ? "right" : "left";
};


type KnowledgeFile = { id: number; title: string };

export const getKnowledgeFiles = async (
  knowledgeFolderId: number,
): Promise<KnowledgeFile[]> => {
  const res = (await request({
    method: "get",
    url: `/files/${knowledgeFolderId}`,
  })) as { files?: KnowledgeFile[] };
  return res?.files ?? [];
};
