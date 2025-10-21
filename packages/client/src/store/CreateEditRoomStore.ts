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
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";
import {
  createTemplate,
  getCreateTemplateProgress,
  setTemplateAvailable,
  updateRoomMemberRole,
} from "@docspace/shared/api/rooms";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { Nullable } from "@docspace/shared/types";
import { TRoomIconParams, TRoomParams } from "@docspace/shared/utils/rooms";
import { TRoom, TWatermark } from "@docspace/shared/api/rooms/types";
import {
  addServersForRoom,
  deleteServersForRoom,
} from "@docspace/shared/api/ai";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { calculateRoomLogoParams } from "SRC_DIR/helpers/filesUtils";
import { openMembersTab, showInfoPanel } from "SRC_DIR/helpers/info-panel";

import FilesStore from "./FilesStore";
import ClientLoadingStore from "./ClientLoadingStore";
import AvatarEditorDialogStore from "./AvatarEditorDialogStore";
import DialogsStore from "./DialogsStore";
import FilesActionsStore from "./FilesActionsStore";
import SelectedFolderStore from "./SelectedFolderStore";
import TagsStore from "./TagsStore";
import { ThirdPartyStore } from "./ThirdPartyStore";

class CreateEditRoomStore {
  roomParams: Nullable<TRoomParams> = null;

  isLoading: boolean = false;

  confirmDialogIsLoading: boolean = false;

  onClose: Nullable<VoidFunction> = null;

  filesStore: Nullable<FilesStore> = null;

  tagsStore: Nullable<TagsStore> = null;

  selectedFolderStore: Nullable<SelectedFolderStore> = null;

  filesActionsStore: Nullable<FilesActionsStore> = null;

  thirdPartyStore: Nullable<ThirdPartyStore> = null;

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

  constructor(
    filesStore: FilesStore,
    filesActionsStore: FilesActionsStore,
    selectedFolderStore: SelectedFolderStore,
    tagsStore: TagsStore,
    thirdPartyStore: ThirdPartyStore,
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
    this.thirdPartyStore = thirdPartyStore;
    this.settingsStore = settingsStore;
    this.currentQuotaStore = currentQuotaStore;
    this.clientLoadingStore = clientLoadingStore;
    this.dialogsStore = dialogsStore;
    this.avatarEditorDialogStore = avatarEditorDialogStore;
  }

  setSelectedRoomType = (type: RoomsType) => {
    this.selectedRoomType = type;
  };

  setRoomParams = (roomParams: TRoomParams) => {
    this.roomParams = roomParams;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setConfirmDialogIsLoading = (confirmDialogIsLoading: boolean) => {
    this.confirmDialogIsLoading = confirmDialogIsLoading;
  };

  setOnClose = (onClose: Nullable<VoidFunction>) => {
    this.onClose = onClose;
  };

  setWatermarks = (object: TWatermark) => {
    this.watermarksSettings = { ...object };
  };

  resetWatermarks = () => {
    this.watermarksSettings = {} as TWatermark;
    this.initialWatermarksSettings = {} as TWatermark;
  };

  setInitialWatermarks = (watermarksSettings: TWatermark) => {
    this.resetWatermarks();

    this.initialWatermarksSettings = !watermarksSettings
      ? { enabled: false }
      : watermarksSettings;

    if (!("enabled" in this.initialWatermarksSettings)) {
      this.initialWatermarksSettings.isImage =
        !!this.initialWatermarksSettings.imageUrl;

      this.initialWatermarksSettings.image = "";
    }

    this.setWatermarks(this.initialWatermarksSettings as TWatermark);
  };

  isCorrectWatermark = (watermarkSettings: TWatermark) => {
    if (!watermarkSettings) return true;

    return !(
      watermarkSettings.additions === 0 &&
      !watermarkSettings.image &&
      !watermarkSettings.imageUrl
    );
  };

  getWatermarkRequest = async (watermarksSettings: TWatermark) => {
    const watermarkImage = watermarksSettings.image as Blob;

    if (!watermarkImage && !watermarksSettings.imageUrl) {
      return Promise.resolve({
        rotate: watermarksSettings.rotate,
        text: watermarksSettings.text,
        additions: watermarksSettings.additions,
      });
    }
    if (!watermarkImage && watermarksSettings.imageUrl) {
      return Promise.resolve({
        imageScale: watermarksSettings.imageScale,
        rotate: watermarksSettings.rotate,
        imageUrl: watermarksSettings.imageUrl,
        imageWidth: watermarksSettings.imageWidth,
        imageHeight: watermarksSettings.imageHeight,
      });
    }

    const uploadWatermarkData = new FormData();
    uploadWatermarkData.append("0", watermarkImage);

    const response = await api.rooms.uploadRoomLogo(uploadWatermarkData);

    const getMeta = (url?: string): Promise<HTMLImageElement> => {
      // url for this.watermarksSettings.image.viewUrl
      return new Promise((resolve, reject) => {
        const img = new Image();
        const imgUrl = url ?? URL.createObjectURL(watermarkImage as File);
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = imgUrl;
      });
    };
    return getMeta().then((img: HTMLImageElement) => {
      return {
        imageScale: watermarksSettings.imageScale,
        rotate: watermarksSettings.rotate,
        imageUrl: (response as { data: string }).data,
        // imageId: watermarksSettings.image.id,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      };
    });
  };

  getLogoParams = (uploadedFile: File, icon: TRoomIconParams) => {
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

  onSaveEditRoom = async (
    t: TFunction,
    newParams: TRoomParams,
    room: TRoom,
  ) => {
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore!;
    const { cover, clearCoverProps } = this.dialogsStore!;
    const { uploadedFile, getUploadedLogoData } = this.avatarEditorDialogStore!;
    const { changeRoomOwner, updateCurrentFolder } = this.filesActionsStore!;

    const {
      quota,
      denyDownload,
      indexing,
      lifetime,
      watermark,
      title,
      roomOwner,
      icon,
      invitations,
      roomId,
      isAvailable,
      prompt,
      providerId,
      modelId,
    } = newParams;

    const quotaLimit = quota || room.quotaLimit;
    const isTitleChanged = !isEqual(title, room.title);
    const isDenyDownloadChanged = denyDownload !== room.denyDownload;
    const isIndexingChanged = indexing !== room.indexing;
    const isQuotaChanged = quotaLimit !== room.quotaLimit;
    const isLifetimeChanged = !isEqual(lifetime, room.lifetime);
    const isOwnerChanged = roomOwner && roomOwner.id !== room.createdBy.id;
    const isWatermarkChanged = !isEqual(watermark, room.watermark);

    const tags = newParams.tags.map((tag) => tag.name);
    const prevTags = room.tags.sort();
    const currTags = newParams.tags.map((p) => p.name).sort();
    const isTagsChanged = !isEqual(prevTags, currTags);

    const editRoomParams = {
      ...(isTitleChanged && {
        title: title || t("Common:NewRoom"),
      }),
      ...(isDenyDownloadChanged && {
        denyDownload,
      }),
      ...(isIndexingChanged && {
        indexing,
      }),
      ...(isTagsChanged && {
        tags,
      }),
      ...(isLifetimeChanged && {
        lifetime: lifetime ?? {
          enabled: false,
        },
      }),
      ...(isDefaultRoomsQuotaSet &&
        isQuotaChanged && {
          quota: +quotaLimit!,
        }),
      ...((cover as { cover: string; color: string } | null) && {
        cover: (cover as { cover: string; color: string } | null)?.cover,
        color: (cover as { cover: string; color: string } | null)?.color,
      }),
      ...(isWatermarkChanged &&
        this.isCorrectWatermark(watermark!) && {
          watermark: watermark
            ? ((await this.getWatermarkRequest(watermark)) as TWatermark)
            : {
                enabled: false,
              },
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

    const isDeleteLogo = !!room.logo.original && !icon.uploadedFile;
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

          editRoomParams.logo = {
            tmpFile: (uploadedData as { responseData: { data: string } })
              .responseData.data,
            ...logoParamsData!,
          };
        }
      } catch (e) {
        toastr.error(e as string);
      }

      if (Object.keys(editRoomParams).length)
        await api.rooms.editRoom(room.id, editRoomParams);

      if (isOwnerChanged) {
        requests.push(changeRoomOwner(t, roomOwner.id));
      }

      if (isDeleteLogo) {
        requests.push(api.rooms.removeLogoFromRoom(room.id));
      }

      if (isIndexingChanged) requests.push(updateCurrentFolder());

      if (room.isTemplate && invitations?.length) {
        requests.push(
          updateRoomMemberRole(roomId, {
            invitations,
            notify: false,
            sharingMessage: "",
          }),
        );
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
          requests.push(addServersForRoom(roomId, addedServers));
        if (deletedServers.length)
          requests.push(deleteServersForRoom(roomId, deletedServers));
      }

      if (room.isTemplate && isAvailable !== undefined) {
        requests.push(setTemplateAvailable(roomId, isAvailable));
      }

      if (requests.length) {
        await Promise.all(requests);
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  onSaveAsTemplate = async (
    item: TRoom,
    roomParams: TRoomParams,
    openCreatedTemplate: Nullable<() => void>,
  ) => {
    const { setSelection, setRoomCreated } = this.filesStore!;
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore!;
    const { cover, clearCoverProps } = this.dialogsStore!;

    setRoomCreated(true);

    const {
      title,
      icon,
      tags,
      invitations,
      roomType,
      isAvailable,
      quota,
      logo,
    } = roomParams;

    const logoCover = cover
      ? {
          cover: (cover as { cover: object }).cover,
          color: (cover as { color: string }).color,
        }
      : logo
        ? {
            cover: (logo as { cover: { id: string } }).cover?.id,
            color: (logo as { color: string }).color,
          }
        : null;

    const quotaLimit = isDefaultRoomsQuotaSet ? quota : null;

    const tagsToAddList = tags.map((tag) => tag.name);
    const isDeleteLogo = !!item.logo.original && !icon.uploadedFile;

    const roomData = {
      title,
      roomId: item.id,
      tags: tagsToAddList,
      public: isAvailable,
      copylogo: true,
      ...(quotaLimit && {
        quota: +quotaLimit,
      }),
      ...logoCover,
      logo: null as unknown,
    };

    if (isDeleteLogo) {
      roomData.logo = null;
      roomData.copylogo = false;
    }

    if (!isDeleteLogo && typeof icon.uploadedFile !== "string") {
      const roomLogo = await this.getRoomLogo(icon);
      roomData.logo = roomLogo;
      roomData.copylogo = false;
    }

    let isCompleted = false;
    let isError = false;
    let progressData;

    const room = await createTemplate(
      roomData as unknown as {
        roomId: number;
        title: string;
        logo: TRoom["logo"];
        share: any;
        tags: TRoom["tags"];
        public: boolean;
        quota: number;
      },
    );
    progressData = room as unknown as {
      isCompleted: boolean;
      error: boolean;
      templateId: string;
    };

    isCompleted = progressData?.isCompleted;
    isError = progressData?.error;

    while (!isCompleted) {
      progressData = (await this.getProgress(
        getCreateTemplateProgress,
      )) as unknown as {
        isCompleted: boolean;
        error: boolean;
        templateId: string;
      };
      isCompleted = progressData.isCompleted;
      isError = progressData.error;

      if (isError) break;
    }

    if (isError) {
      return Promise.reject(progressData.error);
    }

    if (!progressData) return;

    await updateRoomMemberRole(progressData.templateId, {
      invitations,
      notify: false,
      sharingMessage: "",
    });

    if (openCreatedTemplate) {
      this.onOpenNewRoom({
        id: progressData.templateId,
        title,
        roomType,
        rootFolderType: FolderType.RoomTemplates,
      } as unknown as TRoom);

      if (isDesktop()) {
        const roomInfo = await api.files.getFolderInfo(progressData.templateId);
        showInfoPanel();
        openMembersTab();
        setSelection([{ ...roomInfo, isRoom: true }]);
      }
    }

    clearCoverProps();
    return Promise.resolve(progressData);
  };

  getRoomLogo = async (icon: TRoomIconParams) => {
    try {
      const [logoParamsData, uploadedData] = await Promise.all([
        this.getLogoParams(icon.uploadedFile as unknown as File, icon),
        this.avatarEditorDialogStore!.getUploadedLogoData(),
      ]);

      return {
        tmpFile: (uploadedData as { responseData: { data: string } })
          .responseData.data,
        ...logoParamsData!,
      };
    } catch (err) {
      toastr.error(err as string);
    }
  };

  onCreateRoom = async (
    t: TFunction,
    withConfirm: boolean = false,
    successToast: Element | null = null,
  ) => {
    const roomParams = this.roomParams!;

    const {
      processCreatingRoomFromData,
      setProcessCreatingRoomFromData,
      preparingDataForCopyingToRoom,
    } = this.filesActionsStore!;
    const { deleteThirdParty } = this.thirdPartyStore!;
    const { createRoom, selection, bufferSelection, setBufferSelection } =
      this.filesStore!;
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore!;
    const { cover, clearCoverProps } = this.dialogsStore!;

    const {
      denyDownload,
      indexing,
      lifetime,
      tags,
      storageLocation,
      quota,
      type,
      title,
      createAsNewFolder,
      icon,
      watermark,
      isTemplate,
      roomId,
      logo,
      prompt,
      providerId,
      modelId,
    } = roomParams;

    const isThirdparty = storageLocation.isThirdparty;
    const storageFolderId = storageLocation.storageFolderId;
    const thirdpartyAccount = storageLocation.thirdpartyAccount;
    const isThirdPartyRoom = isThirdparty && storageFolderId;

    const quotaLimit = isDefaultRoomsQuotaSet && !isThirdparty ? quota : null;

    const tagsToAddList = tags.map((tag) => tag.name);

    const logoCover = cover
      ? {
          cover: (cover as { cover: object }).cover,
          color: (cover as { color: string }).color,
        }
      : logo
        ? {
            cover: (logo as { cover: { id: string } }).cover?.id,
            color: (logo as { color: string }).color,
          }
        : null;
    const createRoomData = {
      roomId,
      roomType: type,
      title: title || t("Common:NewRoom"),
      ...(isThirdPartyRoom && {
        createAsNewFolder: createAsNewFolder ?? true,
      }),
      ...(quotaLimit && {
        quota: +quotaLimit,
      }),
      ...logoCover,

      denyDownload,
      indexing,
      lifetime,

      ...(tagsToAddList.length && {
        tags: tagsToAddList,
      }),
      ...(watermark &&
        this.isCorrectWatermark(watermark) && {
          watermark: await this.getWatermarkRequest(watermark),
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

    this.setIsLoading(true);

    const isDeleteLogo = isTemplate
      ? !!(logo as { original?: string })?.original && !icon.uploadedFile
      : false;

    let copyLogo =
      !isDeleteLogo &&
      icon.uploadedFile &&
      typeof icon.uploadedFile === "string";

    try {
      if (icon.uploadedFile && typeof icon.uploadedFile !== "string") {
        const roomLogo = await this.getRoomLogo(icon);
        createRoomData.logo = roomLogo;
        copyLogo = false;
      }

      withConfirm && this.setConfirmDialogIsLoading(true);

      let room: Nullable<TRoom> = null;
      if (isThirdPartyRoom) {
        room = (await api.rooms.createRoomInThirdpary(
          storageFolderId,
          createRoomData,
        )) as TRoom;
      } else if (isTemplate) {
        room = (await this.onCreateTemplateRoom({
          ...createRoomData,
          copyLogo: !!copyLogo,
        } as unknown as TRoomParams)) as unknown as TRoom;
      } else {
        room = (await createRoom(createRoomData)) as TRoom;
      }

      if ((room as unknown as { errorMsg: string }).errorMsg) {
        return toastr.error((room as unknown as { errorMsg: string }).errorMsg);
      }

      this.dialogsStore!.setIsNewRoomByCurrentUser(true);

      // delete thirdparty account if not needed
      if (!isThirdparty && storageFolderId)
        deleteThirdParty(
          (thirdpartyAccount as { providerId: string })?.providerId,
        );

      if (roomParams.mcpServers) {
        addServersForRoom(room.id, roomParams.mcpServers);
      }

      this.onOpenNewRoom(room);

      if (processCreatingRoomFromData) {
        const selections =
          selection.length > 0 && selection[0] != null
            ? selection
            : bufferSelection != null
              ? [bufferSelection]
              : [];

        preparingDataForCopyingToRoom(room.id, selections, room).catch(
          (error) => console.error(error),
        );
      }

      if (isDesktop()) {
        let roomInfo = null;

        if (isTemplate) {
          roomInfo = await api.files.getFolderInfo(room.id);
        } else {
          roomInfo = room;
        }

        showInfoPanel();
        openMembersTab();
        setBufferSelection({ ...roomInfo, isRoom: true });
      }

      if (successToast)
        toastr.success(successToast as unknown as React.ReactNode);
    } catch (err) {
      toastr.error(err as string);
    } finally {
      this.setIsLoading(false);
      this.setConfirmDialogIsLoading(false);
      this.onClose?.();
      clearCoverProps();

      processCreatingRoomFromData && setProcessCreatingRoomFromData(false);
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

  onCreateTemplateRoom = async (roomParams: TRoomParams) => {
    this.filesStore!.setRoomCreated(true);

    const { roomId, ...rest } = roomParams;

    let isFinished = false;
    let errorMsg = false;
    let progressData;

    const room = await api.rooms.createRoomFromTemplate({
      templateId: roomId,
      ...rest,
    });

    progressData = room;

    while (!isFinished) {
      progressData = await this.getProgress(
        api.rooms.getCreateRoomFromTemplateProgress,
      );

      isFinished = (progressData as { isCompleted: boolean }).isCompleted;
      errorMsg = (progressData as { error: boolean }).error;
    }

    return {
      id: (progressData as { roomId: number }).roomId,
      title: roomParams.title,
      roomType: roomParams.roomType,
      rootFolderType: FolderType.Rooms,
      errorMsg,
    };
  };

  onOpenNewRoom = async (room: TRoom) => {
    const { setIsSectionBodyLoading } = this.clientLoadingStore!;
    const state = {
      isRoot: false,
      title: room.title,
      isRoom: true,
      isPublicRoomType: room.roomType === RoomsType.PublicRoom,
      rootFolderType: room.rootFolderType,
    };

    const newFilter = FilesFilter.getDefault();
    newFilter.folder = room.id.toString();

    setIsSectionBodyLoading(true);

    const path = getCategoryUrl(CategoryType.SharedRoom, room.id);

    window.DocSpace.navigate(`${path}?${newFilter.toUrlParams()}`, { state });
  };
}

export default CreateEditRoomStore;
