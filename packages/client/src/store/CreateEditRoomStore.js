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

import { makeAutoObservable } from "mobx";
import isEqual from "lodash/isEqual";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { isDesktop } from "@docspace/shared/utils";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { calculateRoomLogoParams } from "SRC_DIR/helpers/filesUtils";
import {
  createTemplate,
  getCreateTemplateProgress,
  setTemplateAvailable,
  updateRoomMemberRole,
} from "@docspace/shared/api/rooms";
import { openMembersTab, showInfoPanel } from "SRC_DIR/helpers/info-panel";

class CreateEditRoomStore {
  roomParams = null;

  isLoading = null;

  confirmDialogIsLoading = false;

  onClose = null;

  filesStore = null;

  tagsStore = null;

  selectedFolderStore = null;

  filesActionsStore = null;

  thirdPartyStore = null;

  settingsStore = null;

  currentQuotaStore = null;

  watermarksSettings = {};

  initialWatermarksSettings = {};

  isImageType = false;

  dialogsStore = null;

  selectedRoomType = null;

  constructor(
    filesStore,
    filesActionsStore,
    selectedFolderStore,
    tagsStore,
    thirdPartyStore,
    settingsStore,
    currentQuotaStore,
    clientLoadingStore,
    dialogsStore,
    avatarEditorDialogStore,
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

  setSelectedRoomType = (type) => {
    this.selectedRoomType = type;
  };

  setRoomParams = (roomParams) => {
    this.roomParams = roomParams;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setConfirmDialogIsLoading = (confirmDialogIsLoading) => {
    this.confirmDialogIsLoading = confirmDialogIsLoading;
  };

  setOnClose = (onClose) => {
    this.onClose = onClose;
  };

  setIsRoomCreatedByCurrentUser = (value) => {
    this.isRoomCreatedByCurrentUser = value;
  };

  setInitialWatermarks = (watermarksSettings) => {
    this.resetWatermarks();

    this.initialWatermarksSettings = !watermarksSettings
      ? { enabled: false }
      : watermarksSettings;

    this.initialWatermarksSettings.isImage =
      !!this.initialWatermarksSettings.imageUrl;

    this.initialWatermarksSettings.image = "";

    this.setWatermarks(this.initialWatermarksSettings);
  };

  setWatermarks = (object, isInit) => {
    if (isInit) {
      this.watermarksSettings = { ...object };
      return;
    }

    Object.keys(object).forEach((key) => {
      this.watermarksSettings[key] = object[key];
    });
  };

  resetWatermarks = () => {
    this.watermarksSettings = {};
    this.initialWatermarksSettings = {};
  };

  isCorrectWatermark = (watermarkSettings) => {
    if (!watermarkSettings) return true;

    return !(
      watermarkSettings.additions === 0 &&
      !watermarkSettings.image &&
      !watermarkSettings.imageUrl
    );
  };

  getWatermarkRequest = async (watermarksSettings) => {
    const watermarkImage = watermarksSettings.image;
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
        // imageId: watermarksSettings.image.id,
        imageWidth: watermarksSettings.imageWidth,
        imageHeight: watermarksSettings.imageHeight,
      });
    }

    const uploadWatermarkData = new FormData();
    uploadWatermarkData.append(0, watermarkImage);

    const response = await api.rooms.uploadRoomLogo(uploadWatermarkData);

    const getMeta = (url) => {
      // url for this.watermarksSettings.image.viewUrl
      return new Promise((resolve, reject) => {
        const img = new Image();
        const imgUrl = url ?? URL.createObjectURL(watermarkImage);
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = imgUrl;
      });
    };
    return getMeta().then((img) => {
      return {
        imageScale: watermarksSettings.imageScale,
        rotate: watermarksSettings.rotate,
        imageUrl: response.data,
        // imageId: watermarksSettings.image.id,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      };
    });
  };

  getLogoParams = (uploadedFile, icon) => {
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

  onSaveEditRoom = async (t, newParams, room) => {
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore;
    const { cover, clearCoverProps } = this.dialogsStore;
    const { uploadedFile, getUploadedLogoData } = this.avatarEditorDialogStore;
    const { changeRoomOwner, updateCurrentFolder } = this.filesActionsStore;

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
          quota: +quotaLimit,
        }),
      ...(cover && {
        cover: cover.cover,
        color: cover.color,
      }),
    };

    if (isWatermarkChanged && this.isCorrectWatermark(watermark)) {
      editRoomParams.watermark = watermark
        ? await this.getWatermarkRequest(watermark)
        : {
            enabled: false,
          };
    }

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
            tmpFile: uploadedData.responseData.data,
            ...logoParamsData,
          };
        }
      } catch (e) {
        toastr.error(e);
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

      if (room.isTemplate && isAvailable !== undefined) {
        requests.push(setTemplateAvailable(roomId, isAvailable));
      }

      if (requests.length) {
        await Promise.all(requests);
      }
    } catch (e) {
      toastr.error(e);
    }
  };

  onSaveAsTemplate = async (item, roomParams, openCreatedTemplate) => {
    this.filesStore.setRoomCreated(true);
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore;
    const { cover, clearCoverProps } = this.dialogsStore;

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
      ? { cover: cover.cover, color: cover.color }
      : logo
        ? { cover: logo.cover?.id, color: logo.color }
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

    const room = await createTemplate(roomData);
    progressData = room;

    isCompleted = progressData?.isCompleted;
    isError = progressData?.error;

    while (!isCompleted) {
      progressData = await this.getProgress(getCreateTemplateProgress);
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
      });
    }

    clearCoverProps();
    return Promise.resolve(progressData);
  };

  getRoomLogo = async (icon) => {
    try {
      const [logoParamsData, uploadedData] = await Promise.all([
        this.getLogoParams(icon.uploadedFile, icon),
        this.avatarEditorDialogStore.getUploadedLogoData(),
      ]);

      return {
        tmpFile: uploadedData.responseData.data,
        ...logoParamsData,
      };
    } catch (err) {
      toastr.error(err);
    }
  };

  onCreateRoom = async (t, withConfirm = false, successToast = null) => {
    const roomParams = this.roomParams;

    const {
      processCreatingRoomFromData,
      setProcessCreatingRoomFromData,
      preparingDataForCopyingToRoom,
    } = this.filesActionsStore;
    const { deleteThirdParty } = this.thirdPartyStore;
    const { createRoom, selection, bufferSelection } = this.filesStore;
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore;
    const { cover, clearCoverProps } = this.dialogsStore;

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
    } = roomParams;

    const isThirdparty = storageLocation.isThirdparty;
    const storageFolderId = storageLocation.storageFolderId;
    const thirdpartyAccount = storageLocation.thirdpartyAccount;
    const isThirdPartyRoom = isThirdparty && storageFolderId;

    const quotaLimit = isDefaultRoomsQuotaSet && !isThirdparty ? quota : null;

    const tagsToAddList = tags.map((tag) => tag.name);

    const logoCover = cover
      ? { cover: cover.cover, color: cover.color }
      : logo
        ? { cover: logo.cover?.id, color: logo.color }
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
    };

    if (watermark && this.isCorrectWatermark(watermark)) {
      createRoomData.watermark = await this.getWatermarkRequest(watermark);
    }

    this.setIsLoading(true);

    const isDeleteLogo = isTemplate
      ? !!logo?.original && !icon.uploadedFile
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

      let room = null;
      if (isThirdPartyRoom) {
        room = await api.rooms.createRoomInThirdpary(
          storageFolderId,
          createRoomData,
        );
      } else if (isTemplate) {
        room = await this.onCreateTemplateRoom({
          ...createRoomData,
          copyLogo: !!copyLogo,
        });
      } else {
        room = await createRoom(createRoomData);
      }

      if (room.errorMsg) {
        return toastr.error(room.errorMsg);
      }

      this.dialogsStore.setIsNewRoomByCurrentUser(true);

      // delete thirdparty account if not needed
      if (!isThirdparty && storageFolderId)
        deleteThirdParty(thirdpartyAccount.providerId);

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

      if (successToast) toastr.success(successToast);
    } catch (err) {
      toastr.error(err);
    } finally {
      this.setIsLoading(false);
      this.setConfirmDialogIsLoading(false);
      this.onClose();
      clearCoverProps();

      processCreatingRoomFromData && setProcessCreatingRoomFromData(false);
    }
  };

  getProgress = (request) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await request().then((res) => {
            resolve(res);
          });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  onCreateTemplateRoom = async (roomParams) => {
    this.filesStore.setRoomCreated(true);

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

      isFinished = progressData.isCompleted;
      errorMsg = progressData.error;
    }

    return {
      id: progressData.roomId,
      title: roomParams.title,
      roomType: roomParams.roomType,
      rootFolderType: FolderType.Rooms,
      errorMsg,
    };
  };

  onOpenNewRoom = async (room) => {
    const { setIsSectionBodyLoading } = this.clientLoadingStore;
    const { setSelection } = this.filesStore;
    const { getPublicKey } = this.filesActionsStore;

    const state = {
      isRoot: false,
      title: room.title,
      isRoom: true,
      isPublicRoomType: room.roomType === RoomsType.PublicRoom,
      rootFolderType: room.rootFolderType,
    };

    const newFilter = FilesFilter.getDefault();
    newFilter.folder = room.id;

    if (
      room.roomType === RoomsType.PublicRoom ||
      room.roomType === RoomsType.FormRoom
    ) {
      const shareKey = await getPublicKey({ ...room, shared: true });
      if (shareKey) newFilter.key = shareKey;
    }

    setIsSectionBodyLoading(true);

    const path = getCategoryUrl(CategoryType.SharedRoom, room.id);

    setSelection && setSelection([]);

    window.DocSpace.navigate(`${path}?${newFilter.toUrlParams()}`, { state });

    if (isDesktop()) {
      showInfoPanel();
      openMembersTab();
    }
  };
}

export default CreateEditRoomStore;
