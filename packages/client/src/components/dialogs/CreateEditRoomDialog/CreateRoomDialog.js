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

import React, { useMemo, useState } from "react";

import {
  getFetchedRoomParams,
  getRoomCreationAdditionalParams,
  getStartRoomParams,
} from "@docspace/shared/utils/rooms";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import RoomSelector from "@docspace/ui-kit/selectors/Room";
import { FolderType } from "@docspace/shared/enums";

import TagHandler from "../../../helpers/TagHandler";
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
  processCreatingRoomFromData,
  setProcessCreatingRoomFromData,
  selectionItems,
  setSelectedRoomType,
  getThirdPartyIcon,
  isDefaultRoomsQuotaSet,
  isExternalShareRestricted,
  fetchedRoomParams,
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

  const isTemplateItem = !!fetchedRoomParams;

  const startRoomParams = isTemplateItem
    ? { ...fetchedRoomParams, isTemplate: true }
    : getStartRoomParams(startRoomType, title);

  const [roomParams, setRoomParams] = useState({
    ...startRoomParams,
  });
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isTemplateSelected, setIsTemplateSelected] = useState(
    !!fetchedRoomParams,
  );
  const [templateItem, setTemplateItem] = useState(null);

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

  const isRoomTitleChanged = roomParams?.title?.trim() === "";

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

  const onKeyUpHandler = (e) => {
    if (isWrongTitle) return;
    if (e.keyCode === 13) onCreateRoom();
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

  const onCloseCreateFromTemplateDialog = () => {
    setRoomParams({ ...startRoomParams });
    setTemplateDialogIsVisible(false);
  };

  const goBack = () => {
    if (isLoading) return;
    if (isTemplateSelected) {
      setIsTemplateSelected(false);
      setTemplateItem(null);

      setRoomParams((prev) => ({
        ...prev,
        title: "",
        type: null,
      }));
      return;
    }

    if (isScrollLocked) setIsScrollLocked(false);
    setRoomParams({ ...startRoomParams });

    if (templateDialogIsVisible) onCloseCreateFromTemplateDialog();
  };

  const onCloseAndDisconnectThirdparty = async () => {
    if (isLoading) return;

    if (roomParams.storageLocation.thirdpartyAccount) {
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
    const item = items[0];
    setIsTemplateSelected(true);
    setTemplateItem({ ...item, title: item.label });

    const newRoomParams = getFetchedRoomParams(
      { ...roomParams, ...item },
      getThirdPartyIcon,
      isDefaultRoomsQuotaSet,
    );

    setRoomParams({
      ...newRoomParams,
      type: item?.roomType,
      logo: item?.logo,
      isTemplate: item.rootFolderType === FolderType.RoomTemplates,
    });
  };

  const isTemplate = !roomParams.type && !isTemplateSelected;

  const dialogHeader = !roomParams.type
    ? t("ChooseRoomType")
    : t("Common:CreateRoom");

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onCloseAndDisconnectThirdparty}
      isScrollLocked={isScrollLocked}
      hideContent={isOauthWindowOpen}
      isTemplate={isTemplate}
      isBackButton={roomParams.type}
      onBackClick={roomParams.type ? goBack : null}
      onSubmit={handleSubmit}
      withForm
      containerVisible={isTemplate ? templateDialogIsVisible : false}
    >
      {isTemplate ? (
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
      ) : null}
      <ModalDialog.Header>{dialogHeader}</ModalDialog.Header>

      <ModalDialog.Body>
        {!roomParams.type ? (
          <RoomTypeList
            t={t}
            setRoomType={setRoomType}
            disabledFormRoom={disabledFormRoom}
            isExternalShareRestricted={isExternalShareRestricted}
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
            templateItem={templateItem}
            fromTemplate={
              selectionItems.length
                ? selectionItems[0].isTemplate
                : isTemplateSelected
            }
          />
        )}
      </ModalDialog.Body>

      {roomParams.type && !isTemplate ? (
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
            testId="create_room_dialog_save"
          />
          <Button
            id="shared_create-room-modal_cancel"
            tabIndex={5}
            label={t("Common:CancelButton")}
            size="normal"
            scale
            isDisabled={isLoading}
            onClick={onCloseAndDisconnectThirdparty}
            testId="create_room_dialog_cancel"
          />
        </ModalDialog.Footer>
      ) : null}
    </ModalDialog>
  );
};

export default CreateRoomDialog;
