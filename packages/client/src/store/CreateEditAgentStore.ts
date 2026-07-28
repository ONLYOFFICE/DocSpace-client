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

import { makeAutoObservable } from "mobx";
import isEqual from "lodash/isEqual";
import { TFunction } from "i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isDesktop } from "@docspace/shared/utils";
import FilesFilter from "@docspace/shared/api/files/filter";
import { AnalyticsEvents, RoomsType, SearchArea } from "@docspace/shared/enums";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Nullable } from "@docspace/shared/types";
import { TWatermark } from "@docspace/shared/api/rooms/types";
import {
  addEntityMcpServer,
  createAIAgentWithProfile,
  editNewAiAgent,
  removeEntityMcpServer,
} from "@docspace/shared/api/ai";
import {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import {
  TAgent,
  TAgentLogo,
  TChatSettings,
  TCreateAgentData,
  TCreateAgentWithProfileData,
  TEditAgentData,
} from "@docspace/shared/api/ai/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "@docspace/shared/constants";
import { calculateRoomLogoParams } from "@docspace/ui-kit/utils";
import { openMembersTab, showInfoPanel } from "SRC_DIR/helpers/info-panel";
import { modelCache } from "SRC_DIR/components/dialogs/CreateEditAgentDialog/sub-components/modelCache";

import FilesStore from "./FilesStore";
import ClientLoadingStore from "./ClientLoadingStore";
import AvatarEditorDialogStore from "./AvatarEditorDialogStore";
import DialogsStore from "./DialogsStore";
import FilesActionsStore from "./FilesActionsStore";
import SelectedFolderStore from "./SelectedFolderStore";
import TagsStore from "./TagsStore";

class CreateEditRoomStore {
  agentParams: Nullable<TAgentParams> = null;

  isLoading: boolean = false;

  onClose: Nullable<VoidFunction> = null;

  filesStore: Nullable<FilesStore> = null;

  tagsStore: Nullable<TagsStore> = null;

  selectedFolderStore: Nullable<SelectedFolderStore> = null;

  filesActionsStore: Nullable<FilesActionsStore> = null;

  settingsStore: Nullable<SettingsStore> = null;

  currentQuotaStore: Nullable<CurrentQuotasStore> = null;

  clientLoadingStore: Nullable<ClientLoadingStore> = null;

  dialogsStore: Nullable<DialogsStore> = null;

  avatarEditorDialogStore: Nullable<AvatarEditorDialogStore> = null;

  watermarksSettings: TWatermark = {} as TWatermark;

  initialWatermarksSettings: TWatermark | { enabled: boolean } =
    {} as TWatermark;

  isImageType: boolean = false;

  selectedRoomType: Nullable<RoomsType> = null;

  openContext: string = "";

  setOpenContext = (context: string) => {
    this.openContext = context;
  };

  constructor(
    filesStore: FilesStore,
    filesActionsStore: FilesActionsStore,
    selectedFolderStore: SelectedFolderStore,
    tagsStore: TagsStore,
    settingsStore: SettingsStore,
    currentQuotaStore: CurrentQuotasStore,
    clientLoadingStore: ClientLoadingStore,
    dialogsStore: DialogsStore,
    avatarEditorDialogStore: AvatarEditorDialogStore,
  ) {
    makeAutoObservable(this);

    this.filesStore = filesStore;
    this.tagsStore = tagsStore;
    this.selectedFolderStore = selectedFolderStore;
    this.filesActionsStore = filesActionsStore;
    this.settingsStore = settingsStore;
    this.currentQuotaStore = currentQuotaStore;
    this.clientLoadingStore = clientLoadingStore;
    this.dialogsStore = dialogsStore;
    this.avatarEditorDialogStore = avatarEditorDialogStore;
  }

  setAgentParams = (agentParams: TAgentParams) => {
    this.agentParams = agentParams;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setOnClose = (onClose: Nullable<VoidFunction>) => {
    this.onClose = onClose;
  };

  getLogoParams = (uploadedFile: File, icon: TAgentIconParams) => {
    const img = new Image();
    const url = URL.createObjectURL(uploadedFile);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const { x, y, zoom } = icon;

        return resolve({ ...calculateRoomLogoParams(img, x, y, zoom) });
      };
      img.onerror = (err) => reject(err);

      img.src = url;
    });
  };

  onSaveEditAgent = async (
    t: TFunction,
    newParams: TAgentParams,
    agent: TAgent,
  ) => {
    const { isDefaultAIAgentsQuotaSet } = this.currentQuotaStore!;
    const { cover, clearCoverProps } = this.dialogsStore!;
    const { uploadedFile, getUploadedLogoData } = this.avatarEditorDialogStore!;
    const { changeRoomOwner } = this.filesActionsStore!;

    const { title, icon, agentId, prompt, agentOwner, quota, profileId } =
      newParams;

    // new-ai service rebinds the agent's Chat-action profile when a
    // profileId is sent; only include it when actually changed.
    const isProfileChanged = !!profileId && profileId !== agent.profileId;

    const quotaLimit = quota || agent.quotaLimit;
    const isQuotaChanged = quotaLimit !== agent.quotaLimit;
    const isTitleChanged = !isEqual(title, agent.title);
    const isOwnerChanged = agentOwner && agentOwner.id !== agent.createdBy.id;

    const tags = newParams.tags.map((tag) => tag.name);
    const prevTags = agent.tags.sort();
    const currTags = newParams.tags.map((p) => p.name).sort();
    const isTagsChanged = !isEqual(prevTags, currTags);

    const editAgentParams: TEditAgentData = {
      ...(isTitleChanged && {
        title: title || t("Common:NewRoom"),
      }),

      ...(isTagsChanged && {
        tags,
      }),

      ...(isDefaultAIAgentsQuotaSet &&
        isQuotaChanged && {
          quota: +quotaLimit!,
        }),

      ...((cover as { cover: string; color: string } | null) && {
        cover: (cover as { cover: string; color: string } | null)?.cover,
        color: (cover as { cover: string; color: string } | null)?.color,
      }),

      logo: undefined as TAgentLogo | undefined,

      ...(prompt && {
        chatSettings: { prompt } satisfies TChatSettings,
      }),

      ...(isProfileChanged && { profileId }),
    };

    const isDeleteLogo = !!agent.logo.original && !icon.uploadedFile;
    const additionalRequest = [];

    if (uploadedFile) {
      additionalRequest.push(
        this.getLogoParams(uploadedFile, icon),
        getUploadedLogoData(),
      );
    }

    const requests = [];
    clearCoverProps();

    try {
      if (additionalRequest.length) {
        const [logoParamsData, uploadedData] =
          await Promise.all(additionalRequest);

        editAgentParams.logo = {
          tmpFile: (uploadedData as { responseData: { data: string } })
            .responseData.data,
          ...logoParamsData!,
        } as TAgentLogo;
      }
    } catch (e) {
      toastr.error(e as string);
    }

    try {
      if (Object.keys(editAgentParams).length) {
        await editNewAiAgent(agent.id, editAgentParams);
      }

      if (isOwnerChanged) {
        requests.push(changeRoomOwner(t, agentOwner.id));
      }

      if (isDeleteLogo) {
        requests.push(api.rooms.removeLogoFromRoom(agent.id));
      }

      const { mcpServers, mcpServersInitial } = newParams;

      if (mcpServers && mcpServersInitial) {
        // Servers are keyed by name in the new-ai model: enabling one for an
        // agent writes an entry into the agent's per-entity map (the config
        // is resolved server-side), disabling removes it.
        const deletedServers = mcpServersInitial.filter(
          (name) => !mcpServers.includes(name),
        );
        const addedServers = mcpServers.filter(
          (name) => !mcpServersInitial.includes(name),
        );

        requests.push(
          ...addedServers.map((name) =>
            addEntityMcpServer(name, String(agentId!)),
          ),
          ...deletedServers.map((name) =>
            removeEntityMcpServer(name, String(agentId!)),
          ),
        );
      }

      if (requests.length) {
        await Promise.all(requests);
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  getAgentLogo = async (icon: TAgentIconParams) => {
    try {
      const [logoParamsData, uploadedData] = await Promise.all([
        this.getLogoParams(icon.uploadedFile as unknown as File, icon),
        this.avatarEditorDialogStore!.getUploadedLogoData(),
      ]);

      return {
        tmpFile: (uploadedData as { responseData: { data: string } })
          .responseData.data,
        ...logoParamsData!,
      } as TAgentLogo;
    } catch (err) {
      toastr.error(err as string);
    }
  };

  onCreateAgent = async (t: TFunction, successToast: Element | null = null) => {
    // Re-entry guard: the create dialog can fire this twice in one click
    // (submit button is both `type="submit"` and has an onClick), which would
    // POST two agents. `isLoading` is set synchronously below before the first
    // await, so the second call bails here.
    if (this.isLoading) return;

    const agentParams = this.agentParams!;

    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore!;
    const { cover, clearCoverProps } = this.dialogsStore!;

    const { tags, title, icon, logo, prompt, profileId, quota } = agentParams;

    // The agent is bound to a chat-lib profile (profileId), which is
    // mandatory before we create.
    if (!profileId) {
      toastr.error(t("Common:RequiredField"));
      return;
    }

    const quotaLimit = isDefaultRoomsQuotaSet ? quota : null;

    const tagsToAddList = tags.map((tag) => tag.name);

    const logoCover = cover
      ? {
          cover: (cover as { cover: string }).cover,
          color: (cover as { color: string }).color,
        }
      : logo
        ? {
            cover: (logo as { cover: { id: string } }).cover?.id,
            color: (logo as { color: string }).color,
          }
        : null;

    const baseAgentData = {
      title: title || t("Common:NewAgent"),

      ...(quotaLimit && {
        quota: +quotaLimit,
      }),

      ...logoCover,

      ...(tagsToAddList.length && {
        tags: tagsToAddList,
      }),

      logo: undefined as TAgentLogo | undefined,

      // MCP enablement (including the system portal server) is written to
      // the agent's per-entity map after creation — never let the .NET
      // service attach servers through the legacy room-links store.
      attachDefaultTools: false,
    };

    const createAgentData: TCreateAgentWithProfileData | TCreateAgentData = {
      ...baseAgentData,
      profileId: profileId!,
      prompt: prompt ?? "",
    } satisfies TCreateAgentWithProfileData;

    this.setIsLoading(true);

    try {
      if (icon.uploadedFile && typeof icon.uploadedFile !== "string") {
        const agentLogo = await this.getAgentLogo(icon);
        createAgentData.logo = agentLogo;
      }

      const agent = await createAIAgentWithProfile(
        createAgentData as TCreateAgentWithProfileData,
      );

      if ((agent as unknown as { errorMsg: string }).errorMsg) {
        return toastr.error(
          (agent as unknown as { errorMsg: string }).errorMsg,
        );
      }

      this.dialogsStore!.setIsNewRoomByCurrentUser(true);

      if (agentParams.mcpServers?.length) {
        await Promise.all(
          agentParams.mcpServers.map((name) =>
            addEntityMcpServer(name, String(agent.id)),
          ),
        ).catch((err) => toastr.error(err as string));
      }

      this.onOpenNewAgent(agent);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: AnalyticsEvents.AgentCreated,
        id: agent.id,
        parentId: agent.parentId,
        context: this.openContext,
      });

      if (successToast)
        toastr.success(successToast as unknown as React.ReactNode);

      modelCache.clear();
    } catch (err) {
      toastr.error(err as string);
    } finally {
      this.setIsLoading(false);
      this.onClose?.();
      clearCoverProps();
    }
  };

  getProgress = (request: () => Promise<unknown> | undefined) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await request()?.then((res) => {
            resolve(res);
          });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  onOpenNewAgent = async (agent: TAgent) => {
    const { setIsSectionBodyLoading } = this.clientLoadingStore!;
    const { setSelection } = this.filesStore!;

    const state = {
      isRoot: false,
      title: agent.title,
      isRoom: true,
      rootFolderType: agent.rootFolderType,
    };

    const newFilter = FilesFilter.getDefault();
    newFilter.folder = agent.id.toString();

    setIsSectionBodyLoading(true);

    setSelection && setSelection([]);

    const path = getCategoryUrl(CategoryType.Chat, agent.id);

    newFilter.searchArea = SearchArea.Any;

    window.DocSpace.navigate(`${path}?${newFilter.toUrlParams()}`, { state });

    if (isDesktop()) {
      showInfoPanel();
      openMembersTab();
    }
  };
}

export default CreateEditRoomStore;
