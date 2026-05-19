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
import { makeAutoObservable, when } from "mobx";
import isEqual from "lodash/isEqual";
import { TFunction } from "i18next";

import { OPERATIONS_NAME } from "@docspace/ui-kit/constants";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
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
import { addServersForRoom } from "@docspace/shared/api/ai";
import { startDbSync } from "@docspace/shared/api/rooms";
import { DbSyncService } from "@docspace/shared/services/db-sync.service";

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

  watermarksSettings: TWatermark = {} as TWatermark;

  initialWatermarksSettings: TWatermark | { enabled: boolean } =
    {} as TWatermark;

  isImageType: boolean = false;

  selectedRoomType: Nullable<RoomsType> = null;

  constructor(
    public filesStore: FilesStore,
    public filesActionsStore: FilesActionsStore,
    public selectedFolderStore: SelectedFolderStore,
    public tagsStore: TagsStore,
    public thirdPartyStore: ThirdPartyStore,
    public settingsStore: SettingsStore,
    public currentQuotaStore: CurrentQuotasStore,
    public clientLoadingStore: ClientLoadingStore,
    public dialogsStore: DialogsStore,
    public avatarEditorDialogStore: AvatarEditorDialogStore,
  ) {
    makeAutoObservable(this);
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
    options?: {
      cb?: (room: TRoom) => void;
    },
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
      sendFormToExternalDB,
      saveFormAsXLSX,
    } = newParams;

    const quotaLimit = quota || room.quotaLimit;
    const isTitleChanged = !isEqual(title, room.title);
    const isDenyDownloadChanged = denyDownload !== room.denyDownload;
    const isIndexingChanged = indexing !== room.indexing;
    const isQuotaChanged = quotaLimit !== room.quotaLimit;
    const isLifetimeChanged = !isEqual(lifetime, room.lifetime);
    const isOwnerChanged = roomOwner && roomOwner.id !== room.createdBy.id;
    const isWatermarkChanged = !isEqual(watermark, room.watermark);
    const isSendFormToExternalDBChanged =
      sendFormToExternalDB !== room.sendFormToExternalDB;
    const isSaveFormAsXLSXChanged = saveFormAsXLSX !== room.saveFormAsXLSX;

    const tags = newParams.tags.map((tag) => tag.name);
    const prevTags = room.tags.sort();
    const currTags = newParams.tags.map((p) => p.name).sort();
    const isTagsChanged = !isEqual(prevTags, currTags);

    const editRoomParams = {
      ...(isSendFormToExternalDBChanged && {
        sendFormToExternalDB,
      }),
      ...(isSaveFormAsXLSXChanged && {
        saveFormAsXLSX,
      }),
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

      if (Object.keys(editRoomParams).length) {
        const updatedRoom = await api.rooms.editRoom(room.id, editRoomParams);
        options?.cb?.(updatedRoom);
      }

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

      if (room.isTemplate && isAvailable !== undefined) {
        requests.push(setTemplateAvailable(roomId, isAvailable));
      }

      if (requests.length) {
        await Promise.all(requests);
      }

      if (
        (isSendFormToExternalDBChanged && sendFormToExternalDB) ||
        (isSaveFormAsXLSXChanged && saveFormAsXLSX)
      ) {
        this.syncWithDatabase(room.id, t);
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
    const { setRoomCreated } = this.filesStore!;
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
    const isDeleteLogo = !item.logo.original && !icon.uploadedFile;

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
        share: unknown;
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
      await this.onOpenNewRoom({
        id: progressData.templateId,
        title,
        roomType,
        rootFolderType: FolderType.RoomTemplates,
      } as unknown as TRoom);
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
    const { createRoom, selection, bufferSelection } = this.filesStore!;
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
      saveFormAsXLSX,
      sendFormToExternalDB,
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
      saveFormAsXLSX,
      sendFormToExternalDB,
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

      await this.onOpenNewRoom(room);
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
    const { setSelection, selectedFolderStore } = this.filesStore!;
    const state = {
      isRoot: false,
      title: room.title,
      isRoom: true,
      isPublicRoomType: room.roomType === RoomsType.PublicRoom,
      rootFolderType: room.rootFolderType,
    };

    setSelection([]);

    const newFilter = FilesFilter.getDefault();
    newFilter.folder = room.id.toString();

    setIsSectionBodyLoading(true);

    const path = getCategoryUrl(CategoryType.SharedRoom, room.id);

    window.DocSpace.navigate(`${path}?${newFilter.toUrlParams()}`, { state });

    if (isDesktop()) {
      await when(() => selectedFolderStore.id === room.id, {
        timeout: 10000,
      }).catch((error) => {
        console.error(error);
      });

      showInfoPanel();
      openMembersTab();
    }
  };

  syncWithDatabase = async (roomId: number, t: TFunction) => {
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      this.filesActionsStore.uploadDataStore.secondaryProgressDataStore;

    try {
      const res = await startDbSync(roomId);

      if (!res) return;

      if (res.isCompleted) {
        DbSyncService.assertTaskSucceeded(res);
        toastr.success(t("Files:SyncWithDatabaseSuccess"));
        return;
      }

      const basePayload = {
        operation: OPERATIONS_NAME.syncDatabase,
        label: t("Files:SyncWithDatabase"),
        operationId: roomId,
        showPanel: () => this.dialogsStore.setIsSyncDbPanelVisible(true),
      };

      setSecondaryProgressBarData({ ...basePayload, percent: 0 });

      const finalTask = await DbSyncService.poll(roomId, (progress) => {
        setSecondaryProgressBarData({
          ...basePayload,
          percent: progress.percentage ?? 0,
          completed: progress.isCompleted ?? false,
          alert: false,
        });
      }).catch((error) => {
        clearSecondaryProgressData(roomId, OPERATIONS_NAME.syncDatabase);
        throw error;
      });

      this.dialogsStore.setSyncDbForms({
        operationId: roomId,
        forms: finalTask.forms,
      });

      const { forms } = finalTask;
      const successCount = forms.filter((f) => f.success).length;
      const errorCount = forms.filter((f) => !f.success && !!f.error).length;
      const total = forms.length;
      const pendingCount = total - successCount;

      const statusLabel = t("Files:SyncWithDatabaseStatus", {
        success: successCount,
        total,
      });
      const pendingLabel =
        pendingCount > 0
          ? t("Files:SyncWithDatabasePending", { count: pendingCount })
          : undefined;

      setSecondaryProgressBarData({
        ...basePayload,
        label: statusLabel,
        description: pendingLabel,
        percent: 100,
        completed: true,
        alert: errorCount > 0,
      });

      if (errorCount === 0) {
        toastr.success(t("Files:SyncWithDatabaseSuccess"));
      }
    } catch (error) {
      toastr.error(t("Files:SyncWithDatabaseError"));
      console.error(error);
    }
  };
}

export default CreateEditRoomStore;
