// (c) Copyright Ascensio System SIA 2009-2025
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
import React from "react";

import { makeAutoObservable } from "mobx";
import isEqual from "lodash/isEqual";
import { TFunction } from "i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { isDesktop } from "@docspace/shared/utils";
import FilesFilter from "@docspace/shared/api/files/filter";
import { RoomsType, SearchArea } from "@docspace/shared/enums";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Nullable } from "@docspace/shared/types";
import { TWatermark } from "@docspace/shared/api/rooms/types";
import {
  addServersForRoom,
  createAIAgent,
  deleteServersForRoom,
} from "@docspace/shared/api/ai";
import {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import { TAgent, TAgentLogo } from "@docspace/shared/api/ai/types";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { calculateRoomLogoParams } from "SRC_DIR/helpers/filesUtils";
import { openMembersTab, showInfoPanel } from "SRC_DIR/helpers/info-panel";

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

  clientLoadingStore: Nullable<ClientLoadingStore> = null;

  dialogsStore: Nullable<DialogsStore> = null;

  avatarEditorDialogStore: Nullable<AvatarEditorDialogStore> = null;

  watermarksSettings: TWatermark = {} as TWatermark;

  initialWatermarksSettings: TWatermark | { enabled: boolean } =
    {} as TWatermark;

  isImageType: boolean = false;

  selectedRoomType: Nullable<RoomsType> = null;

  constructor(
    filesStore: FilesStore,
    filesActionsStore: FilesActionsStore,
    selectedFolderStore: SelectedFolderStore,
    tagsStore: TagsStore,
    settingsStore: SettingsStore,
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
    return console.log("onSaveEditAgent", newParams);

    const { cover, clearCoverProps } = this.dialogsStore!;
    const { uploadedFile, getUploadedLogoData } = this.avatarEditorDialogStore!;
    // const { changeRoomOwner } = this.filesActionsStore!;

    const { title, icon, agentId, prompt, providerId, modelId } = newParams;

    const isTitleChanged = !isEqual(title, agent.title);
    // const isOwnerChanged = roomOwner && roomOwner.id !== agent.createdBy.id;

    const tags = newParams.tags.map((tag) => tag.name);
    const prevTags = agent.tags.sort();
    const currTags = newParams.tags.map((p) => p.name).sort();
    const isTagsChanged = !isEqual(prevTags, currTags);

    const editAgentParams = {
      ...(isTitleChanged && {
        title: title || t("Common:NewRoom"),
      }),
      ...(isTagsChanged && {
        tags,
      }),
      ...((cover as { cover: string; color: string } | null) && {
        cover: (cover as { cover: string; color: string } | null)?.cover,
        color: (cover as { cover: string; color: string } | null)?.color,
      }),
      logo: undefined as unknown,
      ...((prompt || providerId || modelId) && {
        chatSettings: {
          prompt,
          providerId,
          modelId,
        },
      }),
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
      try {
        if (additionalRequest.length) {
          const [logoParamsData, uploadedData] =
            await Promise.all(additionalRequest);

          editAgentParams.logo = {
            tmpFile: (uploadedData as { responseData: { data: string } })
              .responseData.data,
            ...logoParamsData!,
          };
        }
      } catch (e) {
        toastr.error(e as string);
      }

      if (Object.keys(editAgentParams).length)
        await api.rooms.editRoom(agent.id, editAgentParams);

      if (isDeleteLogo) {
        requests.push(api.rooms.removeLogoFromRoom(agent.id));
      }

      const { mcpServers, mcpServersInitial } = newParams;

      if (mcpServers && mcpServersInitial) {
        const deletedServers = mcpServersInitial.filter(
          (id) => !mcpServers.includes(id),
        );
        const addedServers = mcpServers.filter(
          (id) => !mcpServersInitial.includes(id),
        );

        if (addedServers.length)
          requests.push(addServersForRoom(agentId!, addedServers));
        if (deletedServers.length)
          requests.push(deleteServersForRoom(agentId!, deletedServers));
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
    const agentParams = this.agentParams!;

    const { cover, clearCoverProps } = this.dialogsStore!;

    const { tags, title, icon, logo, prompt, providerId, modelId } =
      agentParams;

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

    const createAgentData = {
      title: title || t("Common:NewAgent"),
      ...logoCover,

      ...(tagsToAddList.length && {
        tags: tagsToAddList,
      }),

      logo: undefined as TAgentLogo | undefined,

      ...((prompt || providerId || modelId) && {
        chatSettings: {
          prompt,
          providerId,
          modelId,
        },
      }),
    };

    this.setIsLoading(true);

    try {
      if (icon.uploadedFile && typeof icon.uploadedFile !== "string") {
        const agentLogo = await this.getAgentLogo(icon);
        createAgentData.logo = agentLogo;
      }

      const agent = await createAIAgent(createAgentData);

      if ((agent as unknown as { errorMsg: string }).errorMsg) {
        return toastr.error(
          (agent as unknown as { errorMsg: string }).errorMsg,
        );
      }

      this.dialogsStore!.setIsNewRoomByCurrentUser(true);

      if (agentParams.mcpServers) {
        addServersForRoom(agent.id, agentParams.mcpServers);
      }

      // TODO: AI: Add open agent after creating
      // this.onOpenNewAgent(agent);

      if (successToast)
        toastr.success(successToast as unknown as React.ReactNode);
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
      isPublicRoomType: agent.roomType === RoomsType.PublicRoom,
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
