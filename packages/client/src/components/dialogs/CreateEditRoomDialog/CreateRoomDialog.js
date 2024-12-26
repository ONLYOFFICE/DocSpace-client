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

import React, { useMemo, useState } from "react";

import {
  getRoomCreationAdditionalParams,
  getStartRoomParams,
} from "@docspace/shared/utils/rooms";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import TagHandler from "./handlers/TagHandler";
import SetRoomParams from "./sub-components/SetRoomParams";
import RoomTypeList from "./sub-components/RoomTypeList";
import RoomSelector from "@docspace/shared/selectors/Room";
import { FolderType } from "@docspace/shared/enums";

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
  processCreatingRoomFromData,
  setProcessCreatingRoomFromData,
  selectionItems,
  setSelectedRoomType,
}) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isOauthWindowOpen, setIsOauthWindowOpen] = useState(false);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [templateDialogIsVisible, setTemplateDialogIsVisible] = useState(false);
  const isMountRef = React.useRef(true);

  const disabledFormRoom = useMemo(() => {
    if (
      !processCreatingRoomFromData ||
      !selectionItems ||
      selectionItems.length === 0
    )
      return false;

    return !selectionItems.every((item) => item?.isPDFForm);
  }, [selectionItems, processCreatingRoomFromData]);

  React.useEffect(() => {
    return () => {
      isMountRef.current = false;
    };
  });

  const startRoomParams = getStartRoomParams(startRoomType, title);

  const [roomParams, setRoomParams] = useState({
    ...startRoomParams,
  });
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isTemplateSelected, setIsTemplateSelected] = useState(false);

  const setRoomTags = (newTags) =>
    setRoomParams({ ...roomParams, tags: newTags });

  const tagHandler = new TagHandler(roomParams.tags, setRoomTags, fetchedTags);

  const setRoomType = (newRoomType) => {
    const additionalParams = getRoomCreationAdditionalParams(newRoomType);

    setSelectedRoomType(newRoomType);
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
      storageLocation: {
        isThirdparty: false,
      },
      ...additionalParams,
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

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = (event) => {
    /**
     * @type {HTMLInputElement=}
     */
    const tagInput = event.currentTarget.tagInput;

    if (!tagInput) onCreateRoom();

    const value = tagInput.value ?? "";
    const hasFocus = tagInput === document.activeElement;

    if ((hasFocus && value.length === 0) || !hasFocus) onCreateRoom();
  };

  const goBack = () => {
    if (isLoading) return;
    if (isTemplateSelected) {
      setIsTemplateSelected(false);
      setRoomParams((prev) => ({
        ...prev,
        title: "",
        type: null,
      }));
      return;
    }
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

    if (processCreatingRoomFromData) {
      setProcessCreatingRoomFromData(false);
    }

    onClose();
  };

  const onSubmitRoom = (items) => {
    console.log("onSubmitRoom", items);
    const item = items[0];
    setIsTemplateSelected(item);

    setRoomParams((prev) => ({
      ...prev,
      title: item?.label,
      type: item?.roomType,
      roomId: item?.id,
      isTemplate: item.rootFolderType === FolderType.RoomTemplates,
    }));
  };

  const onCloseCreateFromTemplateDialog = () => {
    setRoomParams({ ...startRoomParams });
    setTemplateDialogIsVisible(false);
  };

  const isTemplate = !roomParams.type && !isTemplateSelected;

  const dialogHeader = !roomParams.type
    ? t("ChooseRoomType")
    : t("Files:CreateRoom");

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll={!isTemplate}
      visible={visible}
      onClose={onCloseAndDisconnectThirdparty}
      isScrollLocked={isScrollLocked}
      hideContent={isOauthWindowOpen}
      isTemplate={isTemplate}
      isBackButton={roomParams.type}
      onBackClick={goBack}
      onSubmit={handleSubmit}
      withForm
      containerVisible={isTemplate && templateDialogIsVisible}
    >
      {isTemplate && (
        <ModalDialog.Container>
          <RoomSelector
            className="template-body_selector"
            onSubmit={onSubmitRoom}
            searchArea="Templates"
            isMultiSelect={false}
            withHeader
            headerProps={{
              onBackClick: onCloseCreateFromTemplateDialog,
              onCloseClick: onCloseCreateFromTemplateDialog,
              headerLabel: t("Common:FromTemplate"),
              withoutBackButton: false,
              withoutBorder: false,
            }}
            withSearch
            emptyScreenHeader={t("Common:EmptyTemplatesRoomsHeader")}
            emptyScreenDescription={t("Common:EmptyTemplatesRoomsDescription")}
          />
        </ModalDialog.Container>
      )}
      <ModalDialog.Header>{dialogHeader}</ModalDialog.Header>

      <ModalDialog.Body>
        {!roomParams.type ? (
          <RoomTypeList
            t={t}
            setRoomType={setRoomType}
            disabledFormRoom={disabledFormRoom}
            setTemplateDialogIsVisible={setTemplateDialogIsVisible}
          />
        ) : (
          <SetRoomParams
            t={t}
            disabledChangeRoomType={Boolean(startRoomType)}
            isTemplateSelected={isTemplateSelected}
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

      {!!roomParams.type && !isTemplate && (
        <ModalDialog.Footer>
          <Button
            id="shared_create-room-modal_submit"
            tabIndex={5}
            label={t("Common:Create")}
            size="normal"
            primary
            scale
            isDisabled={isRoomTitleChanged || isWrongTitle}
            isLoading={isLoading}
            type="submit"
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
