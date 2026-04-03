// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import type { TAIRoomChatSettings } from "@docspace/shared/api/rooms/types";
import type {
  TAIConfig,
  TDefaultProvider,
} from "@docspace/shared/api/ai/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import {
  getAIAgent,
  getProviders,
  getAIConfig,
  createAIAgent,
  deleteAIAgent,
} from "@docspace/shared/api/ai";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  FilterType,
  FolderType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import {
  getRoomMembers,
  updateRoomMemberRole,
} from "@docspace/shared/api/rooms";

import {
  copyFilesToAgentRoom,
  vectorizeFiles,
  getKnowledgeFiles,
  getKnowledgeFolderId,
  loadFolderAgentsMap,
  saveFolderAgentsMap,
  clearFolderAgentsMap,
  saveAiEnabled,
  loadAiEnabled,
  loadAskFromDBAgentId,
  saveAskFromDBAgentId,
  saveUserExplicitlyDisabled,
  loadUserExplicitlyDisabled,
  savePanelWidth,
  loadPanelWidth,
  savePanelPosition,
  loadPanelPosition,
  type FolderAgentsMap,
  type FolderAgentEntry,
  type PanelPosition,
} from "../_api/aiAgentSettings";

class FormsAiAgentStore {
  isPanelVisible = false;
  overrideAgentId: number | null = null;
  pendingAttachmentFile: Partial<TFile> | null = null;
  askFromDBAgentId: number | null = null;
  folderAgentsMap: FolderAgentsMap = {};
  currentFolderId: number | null = null;
  agentChatSettings: TAIRoomChatSettings | undefined = undefined;
  aiAgentEnabled = false;
  aiProvidersAvailable = false;
  isCheckingProviders = false;
  vectorizationEnabled = false;
  aiConfig: TAIConfig | null = null;
  defaultProvider: TDefaultProvider | null = null;
  isSyncingKB = false;
  isCreatingAgents = false;
  isPreparingAgent = false;
  userExplicitlyDisabled = false;
  doneFolderId: number | null = null;
  panelPosition: PanelPosition = "left";
  panelWidth = 360;

  private _folderVersion = 0;
  private _roomId: string | number = "";
  private _userKey: string | undefined = undefined;
  private _pendingCreations = new Map<
    number,
    Promise<FolderAgentEntry | null>
  >();

  constructor() {
    makeAutoObservable(this, {
      _checkPromise: false,
      _folderVersion: false,
      _roomId: false,
      _userKey: false,
      _pendingCreations: false,
      _savePanelWidthTimer: false,
      _createAgentForFolderImpl: false,
    } as Record<string, false>);
  }

  setDefaultProvider = (provider: TDefaultProvider) => {
    this.defaultProvider = provider;
  };

  setAiAgentEnabled = (value: boolean) => {
    this.aiAgentEnabled = value;
    saveAiEnabled(this._roomId, value, this._userKey);
    if (value) {
      this.userExplicitlyDisabled = false;
      saveUserExplicitlyDisabled(this._roomId, false, this._userKey);
    }
  };

  disableAiAgents = async () => {
    const agentIds = Object.values(this.folderAgentsMap).map((e) => e.agentId);

    runInAction(() => {
      this.aiAgentEnabled = false;
      this.userExplicitlyDisabled = true;
      this.isPanelVisible = false;
      this.currentFolderId = null;
      this.agentChatSettings = undefined;
      this.folderAgentsMap = {};
      this.isSyncingKB = false;
      this.isCreatingAgents = false;
    });
    saveUserExplicitlyDisabled(this._roomId, true, this._userKey);

    const results = await Promise.allSettled(
      agentIds.map((id) => deleteAIAgent(id)),
    );

    const failedIds: number[] = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        failedIds.push(agentIds[i]);
      }
    });

    if (failedIds.length > 0) {
      const surviving: FolderAgentsMap = {};
      for (const [folderId, entry] of Object.entries(
        loadFolderAgentsMap(this._roomId, this._userKey),
      )) {
        if (failedIds.includes(entry.agentId)) {
          surviving[Number(folderId)] = entry;
        }
      }

      runInAction(() => {
        this.folderAgentsMap = surviving;
      });
      saveFolderAgentsMap(this._roomId, surviving, this._userKey);
    } else {
      clearFolderAgentsMap(this._roomId, this._userKey);
    }

    saveAiEnabled(this._roomId, false, this._userKey);
  };

  openPanel = () => {
    this.isPanelVisible = true;
  };

  openPanelWithAgent = (agentId: number, file?: Partial<TFile>) => {
    this.overrideAgentId = agentId;
    this.pendingAttachmentFile = file ?? null;
    this.isPanelVisible = true;
  };

  closePanel = () => {
    this.isPanelVisible = false;
    this.overrideAgentId = null;
    this.pendingAttachmentFile = null;
  };

  clearOverride = () => {
    this.overrideAgentId = null;
    this.pendingAttachmentFile = null;
  };

  setPreparingAgent = (value: boolean) => {
    this.isPreparingAgent = value;
  };

  togglePanel = () => {
    if (this.isPanelVisible) {
      this.closePanel();
    } else {
      this.isPanelVisible = true;
    }
  };

  setPanelPosition = (position: PanelPosition) => {
    this.panelPosition = position;
    savePanelPosition(position, this._userKey);
  };

  private _savePanelWidthTimer: ReturnType<typeof setTimeout> | null = null;

  setPanelWidth = (width: number) => {
    this.panelWidth = width;
    if (this._roomId) {
      if (this._savePanelWidthTimer) clearTimeout(this._savePanelWidthTimer);
      this._savePanelWidthTimer = setTimeout(() => {
        savePanelWidth(this._roomId, width, this._userKey);
        this._savePanelWidthTimer = null;
      }, 300);
    }
  };

  private _checkPromise: Promise<void> | null = null;

  checkAiAvailability = async () => {
    if (this._checkPromise !== null) {
      await this._checkPromise;
      return;
    }

    this.isCheckingProviders = true;

    const work = (async () => {
      try {
        const [providers, aiConfig] = await Promise.all([
          getProviders().catch(() => []),
          getAIConfig().catch(() => null),
        ]);

        runInAction(() => {
          this.aiProvidersAvailable = providers.length > 0;
          this.aiConfig = aiConfig ?? null;
          this.vectorizationEnabled = aiConfig?.vectorizationEnabled ?? false;
          this.isCheckingProviders = false;
        });
      } catch {
        runInAction(() => {
          this.aiProvidersAvailable = false;
          this.aiConfig = null;
          this.vectorizationEnabled = false;
          this.isCheckingProviders = false;
        });
      }
    })();

    this._checkPromise = work;
    await work;
    this._checkPromise = null;
  };

  initForRoom = (roomId: string | number, userId?: string | number) => {
    this._roomId = roomId;
    this._userKey = userId ? String(userId) : undefined;
    this.folderAgentsMap = loadFolderAgentsMap(roomId, this._userKey);
    this.aiAgentEnabled = loadAiEnabled(roomId, this._userKey);
    this.initAskFromDBAgent();
    this.userExplicitlyDisabled = loadUserExplicitlyDisabled(
      roomId,
      this._userKey,
    );
    this.panelPosition = loadPanelPosition(this._userKey);
    const savedWidth = loadPanelWidth(roomId, this._userKey);
    if (savedWidth !== null) {
      this.panelWidth = savedWidth;
    }
  };

  private initAskFromDBAgent = async () => {
    const saved = loadAskFromDBAgentId(this._roomId, this._userKey);
    if (saved) {
      const valid = await this.validateAgent(saved);
      if (valid) {
        runInAction(() => {
          this.askFromDBAgentId = saved;
        });
        this.syncAgentMembers(saved).catch(() => {});
        return;
      }
      // Saved agent is stale — fall through to create a new one
    }

    try {
      const agent = await createAIAgent({
        title: "Ask from DB",
        attachDefaultTools: true,
        ...(this.defaultProvider && {
          chatSettings: {
            providerId: this.defaultProvider.providerId,
            modelId: this.defaultProvider.defaultModel,
          },
        }),
      });

      saveAskFromDBAgentId(this._roomId, agent.id, this._userKey);
      runInAction(() => {
        this.askFromDBAgentId = agent.id;
      });
      await this.syncAgentMembers(agent.id);
    } catch {
      // best-effort
    }
  };

  setDoneFolderId = (id: number | null) => {
    this.doneFolderId = id;
  };

  get currentAgentId(): number | null {
    if (this.overrideAgentId) return this.overrideAgentId;
    if (!this.currentFolderId) return null;
    return this.folderAgentsMap[this.currentFolderId]?.agentId ?? null;
  }

  get currentKnowledgeFolderId(): number | null {
    if (!this.currentFolderId) return null;
    return (
      this.folderAgentsMap[this.currentFolderId]?.knowledgeFolderId ?? null
    );
  }

  setCurrentFolder = async (folderId: number | null) => {
    const version = ++this._folderVersion;
    this.currentFolderId = folderId;
    this.agentChatSettings = undefined;

    if (folderId) {
      this.overrideAgentId = null;
      this.pendingAttachmentFile = null;
      const entry = this.folderAgentsMap[folderId];
      if (entry?.agentId) {
        const valid = await this.validateAgent(entry.agentId);
        if (version !== this._folderVersion) return;
        if (valid) {
          this.isPanelVisible = true;
          await this.fetchAgentChatSettings(entry.agentId, version);
        } else {
          const { [folderId]: _, ...rest } = this.folderAgentsMap;
          this.folderAgentsMap = rest;
          this.persistMap();
        }
      }
    } else {
      this.closePanel();
    }
  };

  private persistMap = () => {
    if (this._roomId) {
      saveFolderAgentsMap(this._roomId, this.folderAgentsMap, this._userKey);
    }
  };

  createAgentForFolder = (
    folder: { id: number; title: string },
    files: { id: number; title: string }[],
  ): Promise<FolderAgentEntry | null> => {
    if (this.folderAgentsMap[folder.id]) return Promise.resolve(this.folderAgentsMap[folder.id]);

    const pending = this._pendingCreations.get(folder.id);
    if (pending) return pending;

    const promise = this._createAgentForFolderImpl(folder, files);
    this._pendingCreations.set(folder.id, promise);

    promise.finally(() => {
      this._pendingCreations.delete(folder.id);
    });

    return promise;
  };

  private _createAgentForFolderImpl = async (
    folder: { id: number; title: string },
    files: { id: number; title: string }[],
  ): Promise<FolderAgentEntry | null> => {
    let agent;
    try {
      agent = await createAIAgent({
        title: folder.title,
        attachDefaultTools: true,
        ...(this.defaultProvider && {
          chatSettings: {
            providerId: this.defaultProvider.providerId,
            modelId: this.defaultProvider.defaultModel,
          },
        }),
      });
    } catch {
      return null;
    }

    const kbFolderId = await getKnowledgeFolderId(agent.id).catch(() => null);

    const entry: FolderAgentEntry = {
      agentId: agent.id,
      knowledgeFolderId: kbFolderId,
    };

    runInAction(() => {
      this.folderAgentsMap = {
        ...this.folderAgentsMap,
        [folder.id]: entry,
      };
      this.persistMap();
    });

    // Sync room members → agent members + copy files to KB in parallel
    const tasks: Promise<unknown>[] = [this.syncAgentMembers(agent.id)];

    if (kbFolderId && files.length > 0) {
      tasks.push(
        copyFilesToAgentRoom(
          kbFolderId,
          files.map((f) => f.id),
        )
          .then(() => getKnowledgeFiles(kbFolderId))
          .then((kbFiles) => {
            if (kbFiles.length > 0) {
              return vectorizeFiles(kbFiles.map((f) => f.id));
            }
          })
          .catch(() => {}),
      );
    }

    await Promise.allSettled(tasks);

    return entry;
  };

  private validateAgent = async (agentId: number): Promise<boolean> => {
    try {
      await getAIAgent(agentId);
      return true;
    } catch {
      return false;
    }
  };

  ensureAgentsForFolders = async (
    foldersWithFiles: {
      folder: TFolder;
      files: { id: number; title: string }[];
    }[],
  ) => {
    if (this.isCreatingAgents) return;

    runInAction(() => {
      this.isCreatingAgents = true;
    });

    try {
      for (const { folder, files } of foldersWithFiles) {
        if (!this.aiAgentEnabled) break;

        const existing = this.folderAgentsMap[folder.id];

        if (existing) {
          const valid = await this.validateAgent(existing.agentId);
          if (valid) continue;

          runInAction(() => {
            const { [folder.id]: _, ...rest } = this.folderAgentsMap;
            this.folderAgentsMap = rest;
            this.persistMap();
          });
        }

        await this.createAgentForFolder(folder, files);
      }
    } finally {
      runInAction(() => {
        this.isCreatingAgents = false;
      });
    }
  };

  fetchAgentChatSettings = async (agentId: number, version?: number) => {
    try {
      const agent = await getAIAgent(agentId);
      runInAction(() => {
        if (version !== undefined && version !== this._folderVersion) return;
        this.agentChatSettings = agent.chatSettings;
      });
    } catch {
      // ignore
    }
  };

  syncCompletedForms = async (files: { id: number; title: string }[]) => {
    const agentId = this.currentAgentId;
    const kbFolderId = this.currentKnowledgeFolderId;
    const version = this._folderVersion;

    if (!agentId || !kbFolderId) return;
    if (files.length === 0) return;
    if (this.isSyncingKB) return;

    const isStale = () => version !== this._folderVersion;

    try {
      runInAction(() => {
        this.isSyncingKB = true;
      });

      const kbFiles = await getKnowledgeFiles(kbFolderId);
      if (isStale()) return;

      const kbTitles = new Set(kbFiles.map((f) => f.title));
      const newFiles = files.filter((f) => !kbTitles.has(f.title));

      if (newFiles.length > 0) {
        await copyFilesToAgentRoom(
          kbFolderId,
          newFiles.map((f) => f.id),
        );
        if (isStale()) return;

        const updatedKbFiles = await getKnowledgeFiles(kbFolderId);
        if (isStale()) return;

        const allKbFileIds = updatedKbFiles.map((f) => f.id);

        if (allKbFileIds.length > 0) {
          await vectorizeFiles(allKbFileIds).catch(() => {});
        }
      }
    } catch {
      // ignore
    } finally {
      runInAction(() => {
        this.isSyncingKB = false;
      });
    }
  };

  get isSyncing() {
    return this.isSyncingKB;
  }

  syncFolderFiles = async (
    folderId: number,
    files: { id: number; title: string }[],
  ) => {
    const entry = this.folderAgentsMap[folderId];
    if (!entry?.agentId || !entry?.knowledgeFolderId) return;
    if (files.length === 0) return;

    try {
      const kbFiles = await getKnowledgeFiles(entry.knowledgeFolderId);
      const kbTitles = new Set(kbFiles.map((f) => f.title));
      const newFiles = files.filter((f) => !kbTitles.has(f.title));

      if (newFiles.length > 0) {
        await copyFilesToAgentRoom(
          entry.knowledgeFolderId,
          newFiles.map((f) => f.id),
        );

        const updatedKbFiles = await getKnowledgeFiles(entry.knowledgeFolderId);
        if (updatedKbFiles.length > 0) {
          await vectorizeFiles(updatedKbFiles.map((f) => f.id)).catch(() => {});
        }
      }
    } catch {
      // best-effort
    }
  };

  private fetchDoneFoldersWithFiles = async () => {
    if (!this._roomId) return [];

    let doneFolderId = this.doneFolderId;

    if (!doneFolderId) {
      const roomFilter = FilesFilter.getDefault();
      roomFilter.page = 0;
      roomFilter.pageCount = 100;

      const roomRes = await api.files.getFolder(this._roomId, roomFilter);
      const doneFolder = roomRes.folders.find(
        (f: TFolder) => f.type === FolderType.Done,
      );
      if (!doneFolder) return [];

      doneFolderId = doneFolder.id;
      runInAction(() => {
        this.doneFolderId = doneFolderId;
      });
    }

    const folderFilter = FilesFilter.getDefault();
    folderFilter.page = 0;
    folderFilter.pageCount = 100;

    const fileFilter = FilesFilter.getDefault();
    fileFilter.page = 0;
    fileFilter.pageCount = 100;
    fileFilter.filterType = FilterType.PDFForm;
    fileFilter.withSubfolders = true;

    const [folderRes, fileRes] = await Promise.all([
      api.files.getFolder(doneFolderId, folderFilter),
      api.files.getFolder(doneFolderId, fileFilter),
    ]);

    const filesByFolder = new Map<number, { id: number; title: string }[]>();
    for (const f of fileRes.files) {
      const list = filesByFolder.get(f.folderId) ?? [];
      list.push({ id: f.id, title: f.title });
      filesByFolder.set(f.folderId, list);
    }

    return folderRes.folders.map((folder) => ({
      folder,
      files: filesByFolder.get(folder.id as number) ?? [],
    }));
  };

  private static MEMBER_ACCESS = new Set([
    ShareAccessRights.None, // Owner
    ShareAccessRights.FullAccess,
    ShareAccessRights.RoomManager,
    ShareAccessRights.Collaborator,
    ShareAccessRights.Editing,
  ]);

  syncAgentMembers = async (agentId: number) => {
    if (!this._roomId) return;

    try {
      const [roomRes, agentRes] = await Promise.all([
        getRoomMembers(this._roomId, { count: 100 }),
        getRoomMembers(agentId, { count: 100 }),
      ]);

      const roomUserIds = new Map<string, number>();
      for (const m of roomRes.items) {
        if (
          FormsAiAgentStore.MEMBER_ACCESS.has(m.access) &&
          "id" in m.sharedTo
        ) {
          roomUserIds.set(String(m.sharedTo.id), m.access);
        }
      }

      const agentUserIds = new Set<string>();
      for (const m of agentRes.items) {
        if ("id" in m.sharedTo) {
          agentUserIds.add(String(m.sharedTo.id));
        }
      }

      // Add room members missing from agent
      // None (0) = owner in room API, but 0 = "remove" in share API → map to FullAccess
      const toAdd = [...roomUserIds.keys()].filter(
        (id) => !agentUserIds.has(id),
      );
      if (toAdd.length > 0) {
        await updateRoomMemberRole(agentId, {
          invitations: toAdd.map((id) => ({
            id,
            access:
              roomUserIds.get(id) === ShareAccessRights.None
                ? ShareAccessRights.FullAccess
                : (roomUserIds.get(id) ?? ShareAccessRights.RoomManager),
          })),
          notify: false,
          sharingMessage: "",
        });
      }

      // Remove agent members no longer in room
      const toRemove = agentRes.items.filter(
        (m) =>
          !m.isOwner &&
          "id" in m.sharedTo &&
          !roomUserIds.has(String(m.sharedTo.id)),
      );
      if (toRemove.length > 0) {
        await updateRoomMemberRole(agentId, {
          invitations: toRemove.map((m) => ({
            id: String(m.sharedTo.id),
            access: ShareAccessRights.None,
          })),
          notify: false,
          sharingMessage: "",
        });
      }
    } catch {
      // best-effort
    }
  };

  syncAllAgentMembers = async () => {
    const entries = Object.values(this.folderAgentsMap);
    if (entries.length === 0) return;

    await Promise.allSettled(
      entries.map((e) => this.syncAgentMembers(e.agentId)),
    );
  };

  autoEnableIfAvailable = async () => {
    if (this.userExplicitlyDisabled) return;

    // AI already enabled — ensure agents exist for all Done subfolders
    if (this.aiAgentEnabled) {
      if (Object.keys(this.folderAgentsMap).length === 0) {
        try {
          const foldersWithFiles = await this.fetchDoneFoldersWithFiles();
          if (foldersWithFiles.length > 0) {
            await this.ensureAgentsForFolders(foldersWithFiles);
          }
        } catch {
          // best-effort
        }
      }
      return;
    }

    await this.checkAiAvailability();

    if (!this.aiProvidersAvailable || !this.vectorizationEnabled) return;

    runInAction(() => {
      this.aiAgentEnabled = true;
    });
    saveAiEnabled(this._roomId, true, this._userKey);

    try {
      const foldersWithFiles = await this.fetchDoneFoldersWithFiles();
      if (foldersWithFiles.length > 0) {
        await this.ensureAgentsForFolders(foldersWithFiles);
      }
    } catch {
      // best-effort — agents will be created on next event
    }
  };

  ensureAgentForNewFolder = async (folder: {
    id: number;
    title: string;
    parentId: number;
  }) => {
    if (!this.aiAgentEnabled) return;

    // Fast path: doneFolderId is known
    if (this.doneFolderId) {
      if (
        folder.parentId === this.doneFolderId &&
        !this.folderAgentsMap[folder.id]
      ) {
        await this.createAgentForFolder(
          { id: folder.id, title: folder.title },
          [],
        );
      }
      return;
    }

    // doneFolderId unknown — discover Done folder and ensure agents for all subfolders
    try {
      const foldersWithFiles = await this.fetchDoneFoldersWithFiles();
      if (foldersWithFiles.length > 0) {
        await this.ensureAgentsForFolders(foldersWithFiles);
      }
    } catch {
      // best-effort
    }
  };
}

export const FormsAiAgentStoreContext =
  React.createContext<FormsAiAgentStore | null>(null);

export const FormsAiAgentStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsAiAgentStore(), []);
  return (
    <FormsAiAgentStoreContext.Provider value={store}>
      {children}
    </FormsAiAgentStoreContext.Provider>
  );
};

export const useFormsAiAgentStore = () => {
  const store = React.useContext(FormsAiAgentStoreContext);
  if (!store)
    throw new Error(
      "useFormsAiAgentStore must be used within FormsAiAgentStoreContextProvider",
    );
  return store;
};
