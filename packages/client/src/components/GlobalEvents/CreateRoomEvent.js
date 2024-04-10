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
import { CreateRoomDialog } from "../dialogs";

const CreateRoomEvent = ({
  title,
  visible,
  onClose,

  fetchTags,
  setRoomParams,
  onCreateRoom,
  createRoomConfirmDialogVisible,
  setCreateRoomConfirmDialogVisible,
  confirmDialogIsLoading,
  connectDialogVisible,

  isLoading,
  setIsLoading,
  setOnClose,
  setCreateRoomDialogVisible,

  fetchThirdPartyProviders,
  enableThirdParty,
  deleteThirdParty,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);
  const [fetchedTags, setFetchedTags] = useState([]);

  const onCreate = (roomParams) => {
    setRoomParams(roomParams);
    setOnClose(onClose);

    if (
      roomParams.storageLocation.isThirdparty &&
      !roomParams.storageLocation.storageFolderId
    ) {
      setCreateRoomConfirmDialogVisible(true);
    } else {
      onCreateRoom(false, t);
    }
  };

  const fetchTagsAction = useCallback(async () => {
    let tags = await fetchTags();
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
    <CreateRoomDialog
      title={title}
      t={t}
      visible={
        visible &&
        !connectDialogVisible &&
        !createRoomConfirmDialogVisible &&
        !confirmDialogIsLoading
      }
      onClose={onClose}
      onCreate={onCreate}
      fetchedTags={fetchedTags}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      deleteThirdParty={deleteThirdParty}
      fetchThirdPartyProviders={fetchThirdPartyProviders}
      enableThirdParty={enableThirdParty}
    />
  );
};

export default inject(
  ({
    createEditRoomStore,

    tagsStore,
    dialogsStore,
    filesSettingsStore,
  }) => {
    const { fetchTags } = tagsStore;

    const { deleteThirdParty, fetchThirdPartyProviders } =
      filesSettingsStore.thirdPartyStore;
    const { enableThirdParty } = filesSettingsStore;

    const {
      createRoomConfirmDialogVisible,
      setCreateRoomConfirmDialogVisible,
      connectDialogVisible,
      setCreateRoomDialogVisible,
    } = dialogsStore;

    const {
      setRoomParams,
      onCreateRoom,
      isLoading,
      setIsLoading,
      setOnClose,
      confirmDialogIsLoading,
    } = createEditRoomStore;

    return {
      fetchTags,
      setRoomParams,
      onCreateRoom,
      createRoomConfirmDialogVisible,
      setCreateRoomConfirmDialogVisible,
      connectDialogVisible,
      isLoading,
      setIsLoading,
      setOnClose,
      confirmDialogIsLoading,
      setCreateRoomDialogVisible,
      fetchThirdPartyProviders,
      enableThirdParty,
      deleteThirdParty,
    };
  },
)(observer(CreateRoomEvent));
