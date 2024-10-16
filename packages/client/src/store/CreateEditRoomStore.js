// (c) Copyright Ascensio System SIA 2009-2024
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
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { RoomsType } from "@docspace/shared/enums";

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
  infoPanelStore = null;
  currentQuotaStore = null;
  watermarksSettings = {};
  initialWatermarksSettings = {};
  isImageType = false;
  dialogsStore = null;

  constructor(
    filesStore,
    filesActionsStore,
    selectedFolderStore,
    tagsStore,
    thirdPartyStore,
    settingsStore,
    infoPanelStore,
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
    this.infoPanelStore = infoPanelStore;
    this.currentQuotaStore = currentQuotaStore;
    this.clientLoadingStore = clientLoadingStore;
    this.dialogsStore = dialogsStore;
    this.avatarEditorDialogStore = avatarEditorDialogStore;
  }

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

    for (const [key, value] of Object.entries(object)) {
      this.watermarksSettings[key] = value;
    }
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

    const { uploadRoomLogo } = this.filesStore;

    const uploadWatermarkData = new FormData();
    uploadWatermarkData.append(0, watermarkImage);

    const response = await uploadRoomLogo(uploadWatermarkData);

    const getMeta = (url) => {
      //url for this.watermarksSettings.image.viewUrl
      return new Promise((resolve, reject) => {
        const img = new Image();
        const imgUrl = url ?? URL.createObjectURL(watermarkImage);
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = imgUrl;
      });
    };
    return await getMeta().then((img) => {
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
    const { calculateRoomLogoParams } = this.filesStore;

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
    const { cover } = this.dialogsStore;
    const { editRoom, removeLogoFromRoom } = this.filesStore;
    const { uploadedFile, getUploadedLogoData } = this.avatarEditorDialogStore;
    const { changeRoomOwner, updateCurrentFolder } = this.filesActionsStore;

    const { id: currentFolderId } = this.selectedFolderStore;

    const editRoomParams = {};

    const quotaLimit = newParams?.quota || room.quotaLimit;
    const isTitleChanged = !isEqual(newParams.title, room.title);
    const denyDownloadChanged = newParams?.denyDownload !== room.denyDownload;
    const indexingChanged = newParams?.indexing !== room.indexing;
    const isQuotaChanged = quotaLimit !== room.quotaLimit;
    const lifetimeChanged = !isEqual(newParams.lifetime, room.lifetime);
    const isOwnerChanged = newParams?.roomOwner?.id !== room.createdBy.id;
    const isWatermarkChanged = !isEqual(newParams.watermark, room.watermark);

    if (isDefaultRoomsQuotaSet && isQuotaChanged) {
      editRoomParams.quota = +quotaLimit;
    }

    if (isTitleChanged) {
      editRoomParams.title = newParams.title || t("Common:NewRoom");
    }

    if (denyDownloadChanged) {
      editRoomParams.denyDownload = newParams.denyDownload;
    }

    if (indexingChanged) {
      editRoomParams.indexing = newParams.indexing;
    }

    if (lifetimeChanged) {
      editRoomParams.lifetime = newParams.lifetime ?? {
        enabled: false,
      };
    }

    if (isWatermarkChanged && this.isCorrectWatermark(newParams.watermark)) {
      editRoomParams.watermark = newParams.watermark
        ? await this.getWatermarkRequest(newParams.watermark)
        : {
            enabled: false,
          };
    }

    const tags = newParams.tags.map((tag) => tag.name);
    const prevTags = room.tags.sort();
    const currTags = newParams.tags.map((t) => t.name).sort();

    const isTagsChanged = !isEqual(prevTags, currTags);

    const isUpdatelogo = uploadedFile;
    const isDeleteLogo = !!room.logo.original && !newParams.icon.uploadedFile;
    const additionalRequest = [];

    if (isUpdatelogo) {
      additionalRequest.push(
        this.getLogoParams(uploadedFile, newParams.icon),
        getUploadedLogoData(),
      );
    }

    if (isTagsChanged) {
      editRoomParams.tags = tags;
    }

    if (cover) {
      editRoomParams.cover = cover.cover;
      editRoomParams.color = cover.color;
    }

    const requests = [];

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
        await editRoom(room.id, editRoomParams);

      if (isOwnerChanged) {
        requests.push(changeRoomOwner(t, newParams?.roomOwner?.id));
      }

      if (isDeleteLogo) {
        requests.push(removeLogoFromRoom(room.id));
      }

      if (indexingChanged)
        requests.push(updateCurrentFolder(null, currentFolderId));

      if (!!requests.length) {
        await Promise.all(requests);
      }
    } catch (e) {
      toastr.error(e);
    }
  };

  onCreateRoom = async (withConfirm = false, t) => {
    const roomParams = this.roomParams;

    const { processCreatingRoomFromData, setProcessCreatingRoomFromData } =
      this.filesActionsStore;
    const { deleteThirdParty } = this.thirdPartyStore;
    const { createRoom, createRoomInThirdpary, selection, bufferSelection } =
      this.filesStore;
    const { preparingDataForCopyingToRoom } = this.filesActionsStore;
    const { getUploadedLogoData } = this.avatarEditorDialogStore;
    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore;
    const { cover } = this.dialogsStore;

    const isThirdparty = roomParams.storageLocation.isThirdparty;
    const quotaLimit =
      isDefaultRoomsQuotaSet && !isThirdparty ? roomParams.quota : null;

    const createRoomData = {
      roomType: roomParams.type,
      title: roomParams.title || t("Common:NewRoom"),
      indexing: roomParams.indexing,
      denyDownload: roomParams.denyDownload,
      createAsNewFolder: roomParams.createAsNewFolder ?? true,
      ...(quotaLimit && {
        quota: +quotaLimit,
      }),
      ...(cover && {
        cover: cover.cover,
        color: cover.color,
      }),
    };

    const tagsToAddList = roomParams.tags.map((tag) => tag.name);

    const storageFolderId = roomParams.storageLocation.storageFolderId;
    const thirdpartyAccount = roomParams.storageLocation.thirdpartyAccount;

    const uploadLogoData = new FormData();
    uploadLogoData.append(0, roomParams.icon.uploadedFile);

    if (roomParams.lifetime) {
      createRoomData.lifetime = roomParams.lifetime;
    }

    if (roomParams.watermark && this.isCorrectWatermark(roomParams.watermark)) {
      createRoomData.watermark = await this.getWatermarkRequest(
        roomParams.watermark,
      );
    }

    if (tagsToAddList.length) {
      createRoomData.tags = tagsToAddList;
    }

    const additionalRequest = [];

    const isUpdatelogo = roomParams.icon.uploadedFile;

    if (isUpdatelogo) {
      additionalRequest.push(
        this.getLogoParams(roomParams.icon.uploadedFile, roomParams.icon),
        getUploadedLogoData(),
      );
    }

    this.setIsLoading(true);

    try {
      try {
        if (additionalRequest.length) {
          const [logoParamsData, uploadedData] =
            await Promise.all(additionalRequest);

          createRoomData.logo = {
            tmpFile: uploadedData.responseData.data,
            ...logoParamsData,
          };
        }
      } catch (e) {
        toastr.error(e);
      }

      withConfirm && this.setConfirmDialogIsLoading(true);

      // create room
      let room =
        isThirdparty && storageFolderId
          ? await createRoomInThirdpary(storageFolderId, createRoomData)
          : await createRoom(createRoomData);

      this.dialogsStore.setIsNewRoomByCurrentUser(true);

      // delete thirdparty account if not needed
      if (!isThirdparty && storageFolderId)
        await deleteThirdParty(thirdpartyAccount.providerId);

      this.onOpenNewRoom(room);

      if (processCreatingRoomFromData) {
        const selections =
          selection.length > 0 && selection[0] != null
            ? selection
            : bufferSelection != null
              ? [bufferSelection]
              : [];

        preparingDataForCopyingToRoom(room.id, selections, t).catch((error) =>
          toastr.error(error),
        );
      }
    } catch (err) {
      toastr.error(err);

      this.setIsLoading(false);
      this.setConfirmDialogIsLoading(false);
      this.onClose();
    } finally {
      processCreatingRoomFromData && setProcessCreatingRoomFromData(false);
    }
  };

  onOpenNewRoom = async (room) => {
    const { setIsSectionFilterLoading } = this.clientLoadingStore;
    const { setSelection } = this.filesStore;
    const { setView, setIsVisible } = this.infoPanelStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const state = {
      isRoot: false,
      title: room.title,
      isRoom: true,
      isPublicRoomType: room.roomType === RoomsType.PublicRoom,
      rootFolderType: room.rootFolderType,
    };

    const newFilter = FilesFilter.getDefault();
    newFilter.folder = room.id;
    setIsLoading(true);

    const path = getCategoryUrl(CategoryType.SharedRoom, room.id);

    setSelection && setSelection([]);

    window.DocSpace.navigate(`${path}?${newFilter.toUrlParams()}`, { state });

    if (isDesktop()) {
      setIsVisible(true);
      setView("info_members");
    }

    this.setIsLoading(false);
    this.setConfirmDialogIsLoading(false);
    this.onClose();
  };
}

export default CreateEditRoomStore;
