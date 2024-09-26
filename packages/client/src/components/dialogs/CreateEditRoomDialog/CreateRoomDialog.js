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

import React, { useState } from "react";
import styled, { css } from "styled-components";

import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import TagHandler from "./handlers/TagHandler";

import SetRoomParams from "./sub-components/SetRoomParams";
import RoomTypeList from "./sub-components/RoomTypeList";

const CreateRoomDialog = ({
  t,
  visible,
  title,
  onClose,
  onCreate,

  fetchedTags,
  isLoading,
  setIsLoading,

  deleteThirdParty,
  fetchThirdPartyProviders,
  enableThirdParty,
  startRoomType,
}) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isOauthWindowOpen, setIsOauthWindowOpen] = useState(false);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const isMountRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountRef.current = false;
    };
  });

  const startRoomParams = {
    type: startRoomType,
    title: title ?? "",
    tags: [],
    isPrivate: false,
    storageLocation: {
      isThirdparty: false,
      provider: null,
      thirdpartyAccount: null,
      storageFolderId: "",
      isSaveThirdpartyAccount: false,
    },
    icon: {
      uploadedFile: null,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    withCover: false,
  };

  const [roomParams, setRoomParams] = useState({ ...startRoomParams });
  const [isValidTitle, setIsValidTitle] = useState(true);

  const setRoomTags = (newTags) =>
    setRoomParams({ ...roomParams, tags: newTags });

  const tagHandler = new TagHandler(roomParams.tags, setRoomTags, fetchedTags);

  const setRoomType = (newRoomType) => {
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
      storageLocation: {
        isThirdparty: false,
      },
    }));
  };

  const isRoomTitleChanged = roomParams?.title?.trim() !== "" ? false : true;

  const onKeyUpHandler = (e) => {
    if (isWrongTitle) return;
    if (e.keyCode === 13) onCreateRoom();
  };

  const onCreateRoom = async () => {
    if (!roomParams?.title?.trim()) {
      setIsValidTitle(false);
      return;
    }

    await onCreate({ ...roomParams });
    if (isMountRef.current) {
      setRoomParams(startRoomParams);
    }
  };

  const goBack = () => {
    if (isLoading) return;
    setRoomParams({ ...startRoomParams });
  };

  const onCloseAndDisconnectThirdparty = async () => {
    if (isLoading) return;

    if (!!roomParams.storageLocation.thirdpartyAccount) {
      setIsLoading(true);
      await deleteThirdParty(
        roomParams.storageLocation.thirdpartyAccount.providerId,
      ).finally(() => setIsLoading(false));

      await fetchThirdPartyProviders();
    }
    onClose();
  };

  const dialogHeader = roomParams.type
    ? t("ChooseRoomType")
    : t("Files:CreateRoom");

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onCloseAndDisconnectThirdparty}
      isScrollLocked={isScrollLocked}
      withFooterBorder
      hideContent={isOauthWindowOpen}
      isBackButton={roomParams.type}
      onBackClick={goBack}
    >
      <ModalDialog.Header>{dialogHeader}</ModalDialog.Header>

      <ModalDialog.Body>
        {!roomParams.type ? (
          <RoomTypeList t={t} setRoomType={setRoomType} />
        ) : (
          <SetRoomParams
            t={t}
            disabledChangeRoomType={Boolean(startRoomType)}
            setIsOauthWindowOpen={setIsOauthWindowOpen}
            tagHandler={tagHandler}
            roomParams={roomParams}
            setRoomParams={setRoomParams}
            setRoomType={setRoomType}
            setIsScrollLocked={setIsScrollLocked}
            isDisabled={isLoading}
            isValidTitle={isValidTitle}
            isWrongTitle={isWrongTitle}
            setIsValidTitle={setIsValidTitle}
            setIsWrongTitle={setIsWrongTitle}
            enableThirdParty={enableThirdParty}
            onKeyUp={onKeyUpHandler}
          />
        )}
      </ModalDialog.Body>

      {!!roomParams.type && (
        <ModalDialog.Footer>
          <Button
            id="shared_create-room-modal_submit"
            tabIndex={5}
            label={t("Common:Create")}
            size="normal"
            primary
            scale
            onClick={onCreateRoom}
            isDisabled={isRoomTitleChanged || isWrongTitle}
            isLoading={isLoading}
          />
          <Button
            id="shared_create-room-modal_cancel"
            tabIndex={5}
            label={t("Common:CancelButton")}
            size="normal"
            scale
            isDisabled={isLoading}
            onClick={onCloseAndDisconnectThirdparty}
          />
        </ModalDialog.Footer>
      )}
    </ModalDialog>
  );
};

export default CreateRoomDialog;
