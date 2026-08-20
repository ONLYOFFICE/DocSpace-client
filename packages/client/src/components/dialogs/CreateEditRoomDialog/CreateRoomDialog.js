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

import React, { useCallback, useMemo, useRef, useState } from "react";

import {
  getFetchedRoomParams,
  getRoomCreationAdditionalParams,
  getStartRoomParams,
} from "@docspace/shared/utils/rooms";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import RoomSelector from "@docspace/ui-kit/selectors/Room";
import {
  FolderType,
  RoomsType,
  RoomsTypePrivate,
  RoomSearchArea,
} from "@docspace/shared/enums";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";

import TagHandler from "../../../helpers/TagHandler";
import SetRoomParams from "./sub-components/SetRoomParams";
import RoomTypeList from "./sub-components/RoomTypeList";
import { ConfirmationModal } from "@docspace/shared/dialogs/confirmation-modal";
import { useGenerateKeyFlow } from "@docspace/shared/dialogs/key-generation";

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
  isFormsCreate,
  processCreatingRoomFromData,
  setProcessCreatingRoomFromData,
  selectionItems,
  setSelectedRoomType,
  getThirdPartyIcon,
  isDefaultRoomsQuotaSet,
  isExternalShareRestricted,
  fetchedRoomParams,
  withTemplateSelector,
  encryptionKeys,
  userId,
  accountEmail,
  setUserEncryptionKeys,
}) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isOauthWindowOpen, setIsOauthWindowOpen] = useState(false);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  // `withTemplateSelector` opens the dialog straight on the template picker
  // (quick-actions "Room template" tile), skipping the room-type chooser.
  const [templateDialogIsVisible, setTemplateDialogIsVisible] = useState(
    !!withTemplateSelector,
  );
  const [keyConfirmVisible, setKeyConfirmVisible] = useState(false);
  const isMountRef = React.useRef(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
  const [isTemplateSelected, setIsTemplateSelected] =
    useState(!!fetchedRoomParams);
  const [templateItem, setTemplateItem] = useState(null);

  const setRoomTags = (newTags) =>
    setRoomParams({ ...roomParams, tags: newTags });

  const tagHandler = new TagHandler(roomParams.tags, setRoomTags, fetchedTags);

  const applyPrivateRoomType = useCallback(() => {
    const additionalParams = getRoomCreationAdditionalParams(RoomsTypePrivate);

    setSelectedRoomType(RoomsTypePrivate);
    setRoomParams((prev) => ({
      ...prev,
      type: RoomsTypePrivate,
      storageLocation: {
        isThirdparty: false,
      },
      ...additionalParams,
    }));
  }, [setSelectedRoomType]);

  const refreshKeysFromServer = useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setUserEncryptionKeys?.(fresh ?? []);
    } catch (error) {
      console.error("Failed to refresh keys:", error);
    }
  }, [setUserEncryptionKeys]);

  const generateKey = useGenerateKeyFlow({
    userId,
    accountLabel: accountEmail,
    refreshKeysFromServer,
    onSuccess: () => {
      if (!isMountRef.current) return;
      if (!roomParams.isPrivate) applyPrivateRoomType();
    },
    onError: () => {
      onCloseRef.current?.();
    },
  });

  const keyAutoPromptedRef = useRef(false);
  React.useEffect(() => {
    if (!isTemplateItem || !roomParams.isPrivate) return;
    if (encryptionKeys && encryptionKeys.length > 0) return;
    if (keyAutoPromptedRef.current) return;
    keyAutoPromptedRef.current = true;
    if (!globalThis.crypto?.subtle) {
      toastr.error(t("Common:EncryptionRequiresHttps"));
      onCloseRef.current?.();
      return;
    }
    setKeyConfirmVisible(true);
  }, [isTemplateItem, roomParams.isPrivate, encryptionKeys, t]);

  const setRoomType = (newRoomType) => {
    if (newRoomType === RoomsTypePrivate) {
      if (!globalThis.crypto?.subtle) {
        toastr.error(t("Common:EncryptionRequiresHttps"));
        return;
      }
      if (!encryptionKeys || encryptionKeys.length === 0) {
        setKeyConfirmVisible(true);
        return;
      }
    }

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

  const onConfirmGenerateKey = () => {
    setKeyConfirmVisible(false);
    generateKey.request();
  };

  const onCancelGenerateKey = () => {
    setKeyConfirmVisible(false);
    if (roomParams.isPrivate) onCloseRef.current?.();
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
    // Entered straight on the picker: there is no room-type chooser behind it
    // to fall back to, so leaving the picker closes the dialog altogether.
    if (withTemplateSelector) {
      onCloseRef.current?.();
      return;
    }

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

      // Opened straight on the picker: back goes to the picker, not to the
      // room-type chooser the user never saw.
      if (withTemplateSelector) setTemplateDialogIsVisible(true);
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

  const chooseTypeHeader = isFormsCreate
    ? t("ChooseSetType")
    : t("ChooseRoomType");

  const dialogHeader = !roomParams.type
    ? chooseTypeHeader
    : roomParams.type === RoomsType.FormRoom
      ? t("Common:CreateFormSpaceAction")
      : t("Common:CreateRoom");

  return (
    <>
      <ConfirmationModal
        visible={keyConfirmVisible}
        title={t("Common:PrivateRoomKeyRequiredTitle")}
        message={t("Common:PrivateRoomKeyRequiredDescription")}
        confirmLabel={t("Common:ContinueButton")}
        onConfirm={onConfirmGenerateKey}
        onCancel={onCancelGenerateKey}
        zIndex={410}
      />
      {generateKey.modals}
      <ModalDialog
        displayType="aside"
        withBodyScroll
        visible={visible}
        onClose={onCloseAndDisconnectThirdparty}
        isScrollLocked={isScrollLocked}
        hideContent={isOauthWindowOpen}
        isTemplate={isTemplate}
        isBackButton={roomParams.type && !startRoomType}
        onBackClick={roomParams.type && !startRoomType ? goBack : null}
        onSubmit={handleSubmit}
        withForm
        containerVisible={isTemplate ? templateDialogIsVisible : false}
      >
        {isTemplate ? (
          <ModalDialog.Container>
            <RoomSelector
              className="template-body_selector"
              onSubmit={onSubmitRoom}
              searchArea={
                isFormsCreate
                  ? RoomSearchArea.FormTemplates
                  : RoomSearchArea.Templates
              }
              roomType={isFormsCreate ? RoomsType.FormRoom : undefined}
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
              emptyScreenDescription={t(
                "Common:EmptyTemplatesRoomsDescription",
              )}
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
              processCreatingRoomFromData={processCreatingRoomFromData}
              isFormsCreate={isFormsCreate}
              setTemplateDialogIsVisible={setTemplateDialogIsVisible}
            />
          ) : (
            <SetRoomParams
              t={t}
              disabledChangeRoomType={Boolean(startRoomType) || isFormsCreate}
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
    </>
  );
};

export default CreateRoomDialog;

