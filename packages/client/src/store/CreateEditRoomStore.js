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

import { toastr } from "@docspace/shared/components/toast";
import { isDesktop } from "@docspace/shared/utils";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { RoomsType } from "@docspace/shared/enums";
import { setWatermarkSettings } from "@docspace/shared/api/rooms";

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

  setRoomIsCreated = (onClose) => {
    this.onClose = onClose;
  };

  setInitialWatermarks = (watermarksSettings) => {
    this.initialWatermarksSettings = !watermarksSettings
      ? { enabled: false }
      : watermarksSettings;

    this.initialWatermarksSettings.isImage =
      !!this.initialWatermarksSettings.imageUrl;

    this.setWatermarks(this.initialWatermarksSettings);
  };

  setWatermarks = (object) => {
    for (const [key, value] of Object.entries(object)) {
      this.watermarksSettings[key] = value;
    }
  };

  resetWatermarks = () => {
    this.watermarksSettings = {};
    this.initialWatermarksSettings = {};
  };

  isEqualWatermarkChanges = () => {
    return isEqual(this.watermarksSettings, this.initialWatermarksSettings);
  };

  isNotWatermarkSet = () => {
    console.log(
      "isNotWatermarkSet",
      this.watermarksSettings,
      this.watermarksSettings.enabled,
      this.watermarksSettings.isImage,
      !this.watermarksSettings.image,
      !this.watermarksSettings.imageUrl,
    );

    if (
      this.watermarksSettings.enabled &&
      this.watermarksSettings.isImage &&
      !this.watermarksSettings.image
    )
      return true;

    if (
      !this.watermarksSettings.isImage &&
      this.watermarksSettings.additions === 0
    )
      return true;

    return false;
  };

  getWatermarkRequest = async (room) => {
    if (!this.watermarksSettings.isImage) {
      return setWatermarkSettings(room.id, {
        enabled: this.watermarksSettings.enabled,
        rotate: this.watermarksSettings.rotate,
        text: this.watermarksSettings.text,
        additions: this.watermarksSettings.additions,
      });
    }

    const watermarkImage = this.watermarksSettings.image;
    const watermarksSettings = this.watermarksSettings;

    const getMeta = (url, onSetInfo) => {
      //url for this.watermarksSettings.image.viewUrl
      const img = new Image();
      const imgUrl = url ?? URL.createObjectURL(watermarkImage);
      img.src = imgUrl;

      img.onload = () => {
        URL.revokeObjectURL(imgUrl);
        onSetInfo(null, img);
      };

      img.onerror = (err) => onSetInfo(err);
    };

    console.log(
      !watermarkImage,
      !this.watermarksSettings.enabled,
      this.watermarksSettings.imageUrl,
    );

    if (
      !watermarkImage &&
      !this.watermarksSettings.enabled &&
      this.watermarksSettings.imageUrl
    ) {
      return setWatermarkSettings(room.id, {
        enabled: watermarksSettings.enabled,
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

    getMeta(null, (err, img) => {
      if (err) {
        toastr.error(err);
        return;
      }

      return setWatermarkSettings(room.id, {
        enabled: watermarksSettings.enabled,
        imageScale: watermarksSettings.imageScale,
        rotate: watermarksSettings.rotate,
        imageUrl: response.data,
        // imageId: watermarksSettings.image.id,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      });
    });
  };

  onCreateRoom = async (withConfirm = false, t) => {
    const roomParams = this.roomParams;

    const { createTag } = this.tagsStore;
    const { id: currentFolderId } = this.selectedFolderStore;
    const {
      updateCurrentFolder,
      processCreatingRoomFromData,
      setProcessCreatingRoomFromData,
      setSelectedItems,
    } = this.filesActionsStore;
    const { deleteThirdParty } = this.thirdPartyStore;
    const { withPaging } = this.settingsStore;
    const {
      createRoom,
      createRoomInThirdpary,
      addTagsToRoom,
      calculateRoomLogoParams,
      uploadRoomLogo,
      addLogoToRoom,
      selection,
      bufferSelection,
    } = this.filesStore;
    const { preparingDataForCopyingToRoom } = this.filesActionsStore;

    const { isDefaultRoomsQuotaSet } = this.currentQuotaStore;

    const isThirdparty = roomParams.storageLocation.isThirdparty;
    const quotaLimit =
      isDefaultRoomsQuotaSet && !isThirdparty ? roomParams.quota : null;

    const createRoomData = {
      roomType: roomParams.type,
      title: roomParams.title || t("Files:NewRoom"),
      indexing: roomParams.indexing,
      createAsNewFolder: roomParams.createAsNewFolder ?? true,
      ...(quotaLimit && {
        quota: +quotaLimit,
      }),
    };

    const createTagsData = roomParams.tags
      .filter((t) => t.isNew)
      .map((t) => t.name);
    const addTagsData = roomParams.tags.map((tag) => tag.name);

    const storageFolderId = roomParams.storageLocation.storageFolderId;
    const thirdpartyAccount = roomParams.storageLocation.thirdpartyAccount;

    const uploadLogoData = new FormData();
    uploadLogoData.append(0, roomParams.icon.uploadedFile);

    try {
      this.setIsLoading(true);
      withConfirm && this.setConfirmDialogIsLoading(true);

      // create room
      let room =
        isThirdparty && storageFolderId
          ? await createRoomInThirdpary(storageFolderId, createRoomData)
          : await createRoom(createRoomData);

      room.isLogoLoading = true;

      const actions = [];

      const requests = [];

      if (this.watermarksSettings.enabled && !this.isNotWatermarkSet()) {
        requests.push(this.getWatermarkRequest(room));
      }

      // delete thirdparty account if not needed
      if (!isThirdparty && storageFolderId)
        requests.push(deleteThirdParty(thirdpartyAccount.providerId));

      await Promise.all(requests);
      // create new tags
      for (let i = 0; i < createTagsData.length; i++) {
        actions.push(createTag(createTagsData[i]));
      }

      // add new tags to room
      if (!!addTagsData.length)
        room = await addTagsToRoom(room.id, addTagsData);

      // calculate and upload logo to room
      if (roomParams.icon.uploadedFile) {
        await uploadRoomLogo(uploadLogoData).then(async (response) => {
          const url = URL.createObjectURL(roomParams.icon.uploadedFile);
          const img = new Image();

          img.onload = async () => {
            const { x, y, zoom } = roomParams.icon;
            try {
              room = await addLogoToRoom(room.id, {
                tmpFile: response.data,
                ...calculateRoomLogoParams(img, x, y, zoom),
              });
            } catch (e) {
              toastr.error(e);
              this.setIsLoading(false);
              this.setConfirmDialogIsLoading(false);
              this.onClose();
            }

            !withPaging && this.onOpenNewRoom(room);
            URL.revokeObjectURL(img.src);
          };
          img.src = url;
        });
      } else !withPaging && this.onOpenNewRoom(room);

      if (processCreatingRoomFromData) {
        const selections =
          selection.length > 0 && selection[0] != null
            ? selection
            : bufferSelection != null
              ? [bufferSelection]
              : [];

        preparingDataForCopyingToRoom(room.id, selections, t);
      }

      this.roomIsCreated = true;
    } catch (err) {
      toastr.error(err);
      console.log(err);
      this.setIsLoading(false);
      this.setConfirmDialogIsLoading(false);
      this.onClose();
      this.roomIsCreated = true;
    } finally {
      processCreatingRoomFromData && setProcessCreatingRoomFromData(false);
      if (withPaging) await updateCurrentFolder(null, currentFolderId);
    }
  };

  onOpenNewRoom = async (room) => {
    const { setIsSectionFilterLoading } = this.clientLoadingStore;
    const { setSelection } = this.filesStore;
    const { setView, setIsVisible } = this.infoPanelStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    setView("info_members");

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

    isDesktop() && setIsVisible(true);

    this.setIsLoading(false);
    this.setConfirmDialogIsLoading(false);
    this.onClose();
  };
}

export default CreateEditRoomStore;
