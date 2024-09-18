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
import { EditRoomDialog } from "../dialogs";
import { Encoder } from "@docspace/shared/utils/encoder";
import api from "@docspace/shared/api";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import { toastr } from "@docspace/shared/components/toast";

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
  onSaveRoomLogo,
  uploadedFile,
  updateRoom,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [fetchedTags, setFetchedTags] = useState([]);
  const [fetchedImage, setFetchedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

    ...(isDefaultRoomsQuotaSet && {
      quota: item.quotaLimit,
    }),
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

    const tags = roomParams.tags.map((tag) => tag.name);
    const newTags = roomParams.tags.filter((t) => t.isNew).map((t) => t.name);
    const removedTags = startTags.filter((sT) => !tags.includes(sT));

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
      if (tags.length) {
        const tagsToAddList = tags.filter((t) => !startTags.includes(t));
        actions.push(addTagsToRoom(room.id, tagsToAddList));
        room.tags = tags;
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

      if (uploadedFile) {
        updateRoom(item, {
          ...room,
          logo: { big: item.logo.original },
        });

        addActiveItems(null, [room.id]);

        await onSaveRoomLogo(room.id, roomParams.icon, item);
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
        updateEditedSelectedRoom(editRoomParams.title, tags);
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
    const logo = item?.logo?.original ? item.logo.original : "";
    if (logo) {
      fetchLogoAction(logo);
    }
  }, []);

  const fetchTagsAction = useCallback(async () => {
    const tags = await fetchTags();
    setFetchedTags(tags);
  }, []);

  useEffect(() => {
    fetchTagsAction();
  }, [fetchTagsAction]);

  useEffect(() => {
    setCreateRoomDialogVisible(true);
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
    avatarEditorDialogStore,
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
      updateRoom,
    } = filesStore;

    const { uploadedFile, onSaveRoomLogo } = avatarEditorDialogStore;

    const { createTag, fetchTags } = tagsStore;
    const {
      id: currentFolderId,
      updateEditedSelectedRoom,
      addDefaultLogoPaths,
      removeLogoPaths,
      updateLogoPathsCacheBreaker,
    } = selectedFolderStore;
    const { updateCurrentFolder, changeRoomOwner } = filesActionsStore;
    const { getThirdPartyIcon } = filesSettingsStore.thirdPartyStore;
    const { setCreateRoomDialogVisible } = dialogsStore;
    const { withPaging } = settingsStore;
    const { updateInfoPanelSelection } = infoPanelStore;

    const { defaultRoomsQuota, isDefaultRoomsQuotaSet } = currentQuotaStore;

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
      uploadedFile,
      onSaveRoomLogo,
      updateRoom,
    };
  },
)(observer(EditRoomEvent));
