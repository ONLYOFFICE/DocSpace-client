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

import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import isEqual from "lodash/isEqual";
import { EditRoomDialog } from "../dialogs";
import { Encoder } from "@docspace/shared/utils/encoder";
import api from "@docspace/shared/api";
import {
  deleteWatermarkSettings,
  getRoomInfo,
  getWatermarkSettings,
} from "@docspace/shared/api/rooms";
import { toastr } from "@docspace/shared/components/toast";
import { setWatermarkSettings } from "@docspace/shared/api/rooms";

const EditRoomEvent = ({
  addActiveItems,
  setActiveFolders,

  visible,
  onClose,
  item,

  editRoom,
  addTagsToRoom,
  removeTagsFromRoom,

  createTag,
  fetchTags,

  getThirdPartyIcon,

  calculateRoomLogoParams,
  uploadRoomLogo,
  setFolder,
  getFolderIndex,
  updateFolder,

  removeLogoFromRoom,
  addLogoToRoom,

  currentFolderId,
  updateCurrentFolder,
  setCreateRoomDialogVisible,

  withPaging,

  updateEditedSelectedRoom,
  addDefaultLogoPaths,
  updateLogoPathsCacheBreaker,
  removeLogoPaths,

  updateInfoPanelSelection,
  changeRoomOwner,

  defaultRoomsQuota,
  isDefaultRoomsQuotaSet,
  changeRoomLifetime,
  setInitialWatermarks,
  getWatermarkRequest,
  watermarksSettings,
  isNotWatermarkSet,
  editRoomSettings,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [fetchedTags, setFetchedTags] = useState([]);
  const [fetchedImage, setFetchedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);

  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));

  const fetchedRoomParams = {
    title: item.title,
    type: item.roomType,
    tags: startObjTags,
    isThirdparty: !!item.providerKey,
    storageLocation: {
      title: item.title,
      parentId: item.parentId,
      providerKey: item.providerKey,
      iconSrc: getThirdPartyIcon(item.providerKey),
    },
    isPrivate: false,
    icon: {
      uploadedFile: item.logo.original,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    roomOwner: item.createdBy,
    indexing: item.indexing,
    lifetime: item.lifetime,
    denyDownload: item.denyDownload,

    ...(isDefaultRoomsQuotaSet && {
      quota: item.quotaLimit,
    }),
  };

  const updateRoom = (oldRoom, newRoom) => {
    // After rename of room with providerKey, it's id value changes too
    if (oldRoom.providerKey) {
      let index = getFolderIndex(oldRoom.id);

      if (index === -1) {
        index = getFolderIndex(newRoom.id);
      }

      return updateFolder(index, newRoom);
    }

    setFolder(newRoom);
  };

  const onSave = async (roomParams) => {
    const quotaLimit = roomParams?.quota || item.quotaLimit;

    const editRoomParams = {
      title: roomParams.title || t("Common:NewRoom"),
      ...(isDefaultRoomsQuotaSet && {
        quota: +quotaLimit,
      }),
    };

    const isTitleChanged = roomParams?.title !== item.title;
    const isQuotaChanged = quotaLimit !== item.quotaLimit;
    const isOwnerChanged = roomParams?.roomOwner?.id !== item.createdBy.id;
    const lifetimeChanged = !isEqual(roomParams.lifetime, item.lifetime);
    const denyDownloadChanged = roomParams?.denyDownload !== item.denyDownload;
    const indexingChanged = roomParams?.indexing !== item.indexing;

    const tags = roomParams.tags.map((tag) => tag.name);
    const newTags = roomParams.tags.filter((t) => t.isNew).map((t) => t.name);
    const removedTags = startTags.filter((sT) => !tags.includes(sT));

    const uploadLogoData = new FormData();
    uploadLogoData.append(0, roomParams.icon.uploadedFile);

    let room = null;

    try {
      setIsLoading(true);

      room =
        isTitleChanged || isQuotaChanged
          ? await editRoom(item.id, editRoomParams)
          : item;
      room.isLogoLoading = true;

      const createTagActions = [];
      for (let i = 0; i < newTags.length; i++) {
        createTagActions.push(createTag(newTags[i]));
      }
      if (!!createTagActions.length) {
        await Promise.all(createTagActions);
      }

      const actions = [];
      if (isOwnerChanged) {
        actions.push(changeRoomOwner(t, roomParams?.roomOwner?.id));
        room.createdBy = {
          ...room.createdBy,
          id: roomParams.roomOwner.id,
          avatarSmall: roomParams.roomOwner.avatar,
          hasAvatar: roomParams.roomOwner.hasAvatar,
          displayName: roomParams.roomOwner.label,
        };
      }

      if (lifetimeChanged) {
        actions.push(changeRoomLifetime(room.id, roomParams.lifetime));
        room.lifetime = roomParams.lifetime;
      }

      if (denyDownloadChanged) {
        actions.push(
          editRoomSettings(room.id, { denyDownload: roomParams.denyDownload }),
        );
        room.denyDownload = roomParams.denyDownload;
      }

      if (indexingChanged) {
        actions.push(
          editRoomSettings(room.id, { indexing: roomParams.indexing }),
        );
        room.indexing = roomParams.indexing;
      }

      if (tags.length) {
        const tagsToAddList = tags.filter((t) => !startTags.includes(t));
        actions.push(addTagsToRoom(room.id, tagsToAddList));
        room.tags = tags;
      }

      if (watermarksSettings && !isNotWatermarkSet()) {
        const request = getWatermarkRequest(room, watermarksSettings);

        actions.push(request);
      }

      if (removedTags.length) {
        actions.push(removeTagsFromRoom(room.id, removedTags));
        room.tags = tags;
      }

      if (!!actions.length) {
        await Promise.all(actions);
      }

      if (!!item.logo.original && !roomParams.icon.uploadedFile) {
        room = await removeLogoFromRoom(room.id);
      }

      if (roomParams.iconWasUpdated && roomParams.icon.uploadedFile) {
        updateRoom(item, {
          ...room,
          logo: { big: item.logo.original },
        });

        addActiveItems(null, [room.id]);

        const response = await uploadRoomLogo(uploadLogoData);
        const url = URL.createObjectURL(roomParams.icon.uploadedFile);
        const img = new Image();

        const promise = new Promise((resolve) => {
          img.onload = async () => {
            const { x, y, zoom } = roomParams.icon;

            try {
              room = await addLogoToRoom(room.id, {
                tmpFile: response.data,
                ...calculateRoomLogoParams(img, x, y, zoom),
              });
            } catch (e) {
              toastr.error(e);
            }

            !withPaging && updateRoom(item, room);
            // updateInfoPanelSelection();
            URL.revokeObjectURL(img.src);
            setActiveFolders([]);
            resolve();
          };

          img.src = url;
        });

        await promise;
      } else {
        !withPaging &&
          updateRoom(item, {
            ...room,
          });
        // updateInfoPanelSelection();
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (withPaging) await updateCurrentFolder(null, currentFolderId);

      if (item.id === currentFolderId) {
        updateEditedSelectedRoom({
          title: editRoomParams.title,
          tags,
          lifetime: roomParams.lifetime,
          indexing: roomParams.indexing,
          denyDownload: roomParams.denyDownload,
        });
        if (item.logo.original && !roomParams.icon.uploadedFile) {
          removeLogoPaths();
          // updateInfoPanelSelection();
        } else if (!item.logo.original && roomParams.icon.uploadedFile)
          addDefaultLogoPaths();
        else if (item.logo.original && roomParams.icon.uploadedFile)
          updateLogoPathsCacheBreaker();
      }

      updateInfoPanelSelection(room);
      setIsLoading(false);
      onClose();
    }
  };

  const fetchLogoAction = useCallback(async (logo) => {
    const imgExst = logo.slice(".")[1];
    const file = await fetch(logo)
      .then((res) => res.arrayBuffer())
      .then(
        (buf) =>
          new File([buf], "fetchedFile", {
            type: `image/${imgExst}`,
          }),
      );
    setFetchedImage(file);
  }, []);

  useEffect(() => {
    setCreateRoomDialogVisible(true);
    setIsInitLoading(true);

    const logo = item?.logo?.original ? item.logo.original : "";

    const requests = [fetchTags(), getWatermarkSettings(item.id)];

    if (logo) requests.push(fetchLogoAction);

    const fetchInfo = async () => {
      const [tags, watermarks] = await Promise.all(requests);

      setFetchedTags(tags);

      setInitialWatermarks(watermarks);

      setIsInitLoading(false);
    };

    fetchInfo();

    return () => setCreateRoomDialogVisible(false);
  }, []);

  return (
    <EditRoomDialog
      t={t}
      visible={visible}
      onClose={onClose}
      fetchedRoomParams={fetchedRoomParams}
      onSave={onSave}
      fetchedTags={fetchedTags}
      fetchedImage={fetchedImage}
      isLoading={isLoading}
      isInitLoading={isInitLoading}
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    tagsStore,
    filesActionsStore,
    selectedFolderStore,
    dialogsStore,
    filesSettingsStore,
    infoPanelStore,
    currentQuotaStore,
    createEditRoomStore,
  }) => {
    const {
      editRoom,
      addTagsToRoom,
      removeTagsFromRoom,
      calculateRoomLogoParams,
      uploadRoomLogo,
      setFolder,
      getFolderIndex,
      updateFolder,
      addLogoToRoom,
      removeLogoFromRoom,
      addActiveItems,
      setActiveFolders,
    } = filesStore;

    const { createTag, fetchTags } = tagsStore;
    const {
      id: currentFolderId,
      updateEditedSelectedRoom,
      addDefaultLogoPaths,
      removeLogoPaths,
      updateLogoPathsCacheBreaker,
    } = selectedFolderStore;
    const {
      updateCurrentFolder,
      changeRoomOwner,
      changeRoomLifetime,
      editRoomSettings,
    } = filesActionsStore;
    const { getThirdPartyIcon } = filesSettingsStore.thirdPartyStore;
    const { setCreateRoomDialogVisible } = dialogsStore;
    const { withPaging } = settingsStore;
    const { updateInfoPanelSelection } = infoPanelStore;

    const { defaultRoomsQuota, isDefaultRoomsQuotaSet } = currentQuotaStore;
    const {
      setInitialWatermarks,
      watermarksSettings,
      isNotWatermarkSet,
      getWatermarkRequest,
    } = createEditRoomStore;

    return {
      defaultRoomsQuota,
      isDefaultRoomsQuotaSet,
      addActiveItems,
      setActiveFolders,

      editRoom,
      addTagsToRoom,
      removeTagsFromRoom,

      createTag,
      fetchTags,

      getThirdPartyIcon,

      calculateRoomLogoParams,
      setFolder,
      getFolderIndex,
      updateFolder,
      uploadRoomLogo,
      removeLogoFromRoom,
      addLogoToRoom,

      currentFolderId,
      updateCurrentFolder,

      withPaging,
      setCreateRoomDialogVisible,

      updateEditedSelectedRoom,
      addDefaultLogoPaths,
      updateLogoPathsCacheBreaker,
      removeLogoPaths,

      updateInfoPanelSelection,
      changeRoomOwner,
      changeRoomLifetime,
      setInitialWatermarks,
      watermarksSettings,
      isNotWatermarkSet,
      getWatermarkRequest,
      editRoomSettings,
    };
  },
)(observer(EditRoomEvent));
