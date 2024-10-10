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

import { inject, observer } from "mobx-react";
import { useState, useEffect, useRef } from "react";

import isEqual from "lodash/isEqual";
import TagHandler from "./handlers/TagHandler";
import SetRoomParams from "./sub-components/SetRoomParams";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import ChangeRoomOwnerPanel from "../../panels/ChangeRoomOwnerPanel";

const EditRoomDialog = ({
  t,
  visible,
  onClose,
  onSave,
  isLoading,
  fetchedRoomParams,
  fetchedTags,
  fetchedImage,
  isInitLoading,

  cover,
}) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [changeRoomOwnerIsVisible, setChangeRoomOwnerIsVisible] =
    useState(false);

  const [roomParams, setRoomParams] = useState({
    ...fetchedRoomParams,
  });

  const prevRoomParams = useRef(
    Object.freeze({
      ...roomParams,
    }),
  );

  const compareRoomParams = (prevParams, currentParams) => {
    return (
      prevParams.title === currentParams.title &&
      prevParams.roomOwner.id === currentParams.roomOwner.id &&
      prevParams.tags
        .map((t) => t.name)
        .sort()
        .join("|")
        .toLowerCase() ===
        currentParams.tags
          .map((t) => t.name)
          .sort()
          .join("|")
          .toLowerCase() &&
      ((prevParams.icon.uploadedFile === "" &&
        (currentParams.icon.uploadedFile === null ||
          currentParams.icon.uploadedFile === undefined)) ||
        prevParams.icon.uploadedFile === currentParams.icon.uploadedFile) &&
      prevParams.quota === currentParams.quota &&
      prevParams.indexing === currentParams.indexing &&
      prevParams.denyDownload === currentParams.denyDownload &&
      isEqual(prevParams.lifetime, currentParams.lifetime) &&
      isEqual(prevParams.watermark, currentParams.watermark)
    );
  };

  const setRoomTags = (newTags) =>
    setRoomParams({ ...roomParams, tags: newTags });

  const tagHandler = new TagHandler(roomParams.tags, setRoomTags, fetchedTags);

  const setRoomType = (newRoomType) =>
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
    }));

  const onKeyUpHandler = (e) => {
    if (isWrongTitle) return;
    if (e.keyCode === 13) onEditRoom();
  };

  const onEditRoom = () => {
    if (!roomParams.title.trim()) {
      setIsValidTitle(false);
      return;
    }

    onSave(roomParams);
  };

  useEffect(() => {
    if (fetchedImage) {
      setRoomParams({
        ...roomParams,
        icon: { ...roomParams.icon, uploadedFile: fetchedImage },
      });
      prevRoomParams.current = {
        ...roomParams,
        icon: { ...roomParams.icon, uploadedFile: fetchedImage },
      };
    }
  }, [fetchedImage]);

  const onCloseAction = () => {
    if (isLoading) return;

    onClose && onClose();
  };

  const onOwnerChange = () => {
    setChangeRoomOwnerIsVisible(true);
  };

  const onSetNewOwner = (roomOwner) => {
    setChangeRoomOwnerIsVisible(false);
    setRoomParams({ ...roomParams, roomOwner });
  };

  const onCloseRoomOwnerPanel = () => {
    setChangeRoomOwnerIsVisible(false);
  };

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onCloseAction}
      isScrollLocked={isScrollLocked}
      isLoading={isInitLoading}
      containerVisible={changeRoomOwnerIsVisible}
    >
      {changeRoomOwnerIsVisible && (
        <ModalDialog.Container>
          <ChangeRoomOwnerPanel
            useModal={false}
            roomOwner={roomParams.roomOwner}
            onOwnerChange={onSetNewOwner}
            showBackButton
            onClose={onCloseRoomOwnerPanel}
          />
        </ModalDialog.Container>
      )}

      <ModalDialog.Header>{t("RoomEditing")}</ModalDialog.Header>

      <ModalDialog.Body>
        <SetRoomParams
          t={t}
          tagHandler={tagHandler}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          setRoomType={setRoomType}
          setIsScrollLocked={setIsScrollLocked}
          isEdit
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUpHandler}
          onOwnerChange={onOwnerChange}
          canChangeOwner={roomParams?.security?.ChangeOwner}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          tabIndex={5}
          label={t("Common:SaveButton")}
          size="normal"
          primary
          scale
          onClick={onEditRoom}
          isDisabled={
            !cover &&
            (isWrongTitle ||
              compareRoomParams(prevRoomParams.current, roomParams))
          }
          isLoading={isLoading}
        />
        <Button
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditRoomDialog;
