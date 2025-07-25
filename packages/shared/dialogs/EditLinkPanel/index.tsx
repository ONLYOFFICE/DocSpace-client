// (c) Copyright Ascensio System SIA 2009-2025
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

import isNil from "lodash/isNil";
import moment from "moment";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useState, useEffect, useMemo } from "react";

import isEqual from "lodash/isEqual";

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import {
  copyRoomShareLink,
  getAccessOptions,
  getRoomAccessOptions,
  getShareOptions,
} from "@docspace/shared/components/share/Share.helpers";

import {
  editExternalFolderLink,
  editExternalLink as editExternalFileLink,
} from "@docspace/shared/api/files";

import {
  DeviceType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { StyledEditLinkBodyContent } from "./StyledEditLinkPanel";

// import LinkBlock from "./LinkBlock";
import ToggleBlock from "./ToggleBlock";
import PasswordAccessBlock from "./PasswordAccessBlock";
import LimitTimeBlock from "./LimitTimeBlock";
import { RoleLinkBlock } from "./RoleLinkBlock";
import { AccessSelectorBlock } from "./AccessSelectorBlock";

const EditLinkPanel = (props) => {
  const {
    t,
    link,
    item,
    language,

    visible,
    setIsVisible,

    editExternalLink,
    setExternalLink,
    setLinkParams,

    unsavedChangesDialogVisible,
    setUnsavedChangesDialog,

    currentDeviceType,
    passwordSettings,
    getPortalPasswordSettings,
    updateLink,
  } = props;

  const itemId = item.id;
  const accessLink = link?.access;
  const isLocked = !!link?.sharedTo?.password;
  const password = link?.sharedTo?.password ?? "";
  const date = link?.sharedTo?.expirationDate ?? null;
  const isDenyDownload = link?.sharedTo?.denyDownload ?? false;

  const isPublic = item.roomType === RoomsType.PublicRoom;
  const isFormRoom = item.roomType === RoomsType.FormRoom;
  const isCustomRoom = item.roomType === RoomsType.CustomRoom;

  const accessOptions = useMemo(() => {
    if (item.isRoom || item.isFolder) return getRoomAccessOptions(t);

    return getAccessOptions(t, item.availableExternalRights);
  }, [t, item]);
  const [searchParams, setSearchParams] = useSearchParams();
  const linkAccessOptions = useMemo(() => getShareOptions(t), [t]);

  console.log({ accessOptions });

  const [selectedLinkAccess, setSelectedLinkAccess] = useState(() => {
    return (
      linkAccessOptions.find(
        (option) => option.internal === link?.sharedTo.internal,
      ) ?? linkAccessOptions[0]
    );
  });

  const [selectedAccessOption, setSelectedAccessOption] = useState(() => {
    if (isFormRoom) {
      return {
        key: "form-filling",
        access: ShareAccessRights.FormFilling,
      };
    }

    return (
      accessOptions.find((option) => option.access === accessLink) ??
      accessOptions.at(-1) ??
      {}
    );
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState(password);
  const [expirationDate, setExpirationDate] = useState(date);
  const [isExpired, setIsExpired] = useState(() =>
    expirationDate
      ? new Date(expirationDate).getTime() <= new Date().getTime()
      : false,
  );

  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [isSameDate, setIsSameDate] = useState(false);

  const [passwordAccessIsChecked, setPasswordAccessIsChecked] =
    useState(isLocked);

  const [denyDownload, setDenyDownload] = useState(isDenyDownload);

  const onPasswordAccessChange = () =>
    setPasswordAccessIsChecked(!passwordAccessIsChecked);

  const onDenyDownloadChange = () => setDenyDownload(!denyDownload);

  const onClose = () => setIsVisible(false);

  const onClosePanel = () => {
    hasChanges ? setUnsavedChangesDialog(true) : onClose();
  };

  const handleSelectLinkAccess = (option) => {
    setSelectedLinkAccess(option);
  };

  const validateInputs = () => {
    const errors = [];

    if (
      passwordAccessIsChecked &&
      (!passwordValue.trim() || !isPasswordValid)
    ) {
      errors.push("password");
    }

    if (
      expirationDate &&
      new Date(expirationDate).getTime() <= new Date().getTime()
    ) {
      errors.push("expiration");
    }

    return errors;
  };

  const handleValidationErrors = (errors) => {
    if (errors.includes("password")) {
      setIsPasswordValid(false);
      setIsPasswordErrorShow(true);
    }
    if (errors.includes("expiration")) {
      setIsExpired(true);
    }
  };

  const buildUpdatedLink = () => {
    const externalLink = link ?? { access: 2, sharedTo: {} };

    const updatedLink = {
      ...externalLink,
      access: selectedAccessOption.access,
      sharedTo: {
        ...externalLink.sharedTo,
        password: passwordAccessIsChecked ? passwordValue : null,
        denyDownload,
        internal: selectedLinkAccess.internal,
        ...(!isSameDate && expirationDate && { expirationDate }),
      },
    };

    return updatedLink;
  };

  const executeApiCall = async (updatedLink) => {
    if (item.isRoom) {
      const response = await editExternalLink(itemId, updatedLink);
      setExternalLink(response, searchParams, setSearchParams, isCustomRoom);
      setLinkParams({ link: response, item });
      copyRoomShareLink(response, t);
      return response;
    }

    const isFile = !isNil(item.fileType) || !isNil(item.fileExst);

    if (item.isFolder || isFile) {
      const editApi = item.isFolder
        ? editExternalFolderLink
        : editExternalFileLink;

      const response = await editApi(
        itemId,
        updatedLink.sharedTo.id,
        updatedLink.access,
        updatedLink.sharedTo.primary,
        updatedLink.sharedTo.internal,
        expirationDate,
        updatedLink.sharedTo.password,
        denyDownload,
      );

      setLinkParams({ item, link: response });
      updateLink?.(response);
      return response;
    }

    throw new Error("Unknown type", { cause: item });
  };

  const handleApiError = (err) => {
    const error = err?.response?.data?.error?.message ?? err?.message;
    toastr.error(error);
  };

  const onSave = async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      handleValidationErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const updatedLink = buildUpdatedLink();

      await executeApiCall(updatedLink);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const initState = {
    passwordValue: password,
    passwordAccessIsChecked: isLocked,
    denyDownload: isDenyDownload,
    accessLink: accessLink ?? ShareAccessRights.ReadOnly,
    internal: link?.sharedTo?.internal ?? false,
  };

  useEffect(() => {
    const data = {
      passwordValue,
      passwordAccessIsChecked,
      denyDownload,
      accessLink: selectedAccessOption.access,
      internal: selectedLinkAccess.internal,
    };

    const isSameDateCheck =
      date || expirationDate ? moment(date).isSame(expirationDate) : true;

    setIsSameDate(isSameDateCheck);

    setHasChanges(!isEqual(data, initState) || !isSameDateCheck);
  });

  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      !unsavedChangesDialogVisible && onSave();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);

    return () => window.removeEventListener("keydown", onKeyPress);
  }, [onKeyPress]);

  const getPasswordSettings = async () => {
    setIsLoading(true);
    await getPortalPasswordSettings();
    setIsLoading(false);
  };

  const getExpiredLinkText = () => {
    if (link?.sharedTo?.primary) {
      if (isFormRoom) return t("Files:LimitTimeBlockFormRoomDescription");
      if (isPublic) return t("Files:LimitTimeBlockPublicRoomDescription");
      if (isCustomRoom) return t("Files:LimitTimeBlockCustomRoomDescription");

      return "";
    }

    if (isExpired) {
      return t("Translations:LinkHasExpiredAndHasBeenDisabled");
    }

    return expirationDate
      ? `${t("Files:LinkValidUntil")}:`
      : t("Files:ChooseExpirationDate");
  };

  useEffect(() => {
    if (!passwordSettings) {
      getPasswordSettings();
    }
  }, [passwordSettings]);

  /**
   * @param {import("@docspace/shared/components/combobox").TOption} option
   */
  const handleSelectAccessOption = (option) => {
    setSelectedAccessOption(option);
  };

  const expiredLinkText = getExpiredLinkText();

  const isPrimary = link?.sharedTo?.primary;

  const isDisabledSaveButton = !hasChanges || isLoading || isExpired;

  const canChangeLifetime = !isPrimary || !item.isRoom;

  console.log(
    { link, isPublic, isFormRoom, item },
    link?.canEditDenyDownload === false,
  );
  const disabledDenyDownload = link?.canEditDenyDownload === false;

  const editLinkPanelComponent = (
    <ModalDialog
      isExpired={isExpired}
      displayType="aside"
      visible={visible}
      onClose={onClosePanel}
      isLarge
      zIndex={310}
      withBodyScroll
      withoutPadding
    >
      <ModalDialog.Header>
        {isPrimary
          ? t("Files:EditSharedLink")
          : isPublic || isFormRoom
            ? t("Files:EditAdditionalLink")
            : t("Files:EditLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledEditLinkBodyContent className="edit-link_body">
          {!isFormRoom ? (
            <RoleLinkBlock
              t={t}
              accessOptions={accessOptions}
              selectedOption={selectedAccessOption}
              currentDeviceType={currentDeviceType}
              onSelect={handleSelectAccessOption}
            />
          ) : null}
          <AccessSelectorBlock
            options={linkAccessOptions}
            selectedOption={selectedLinkAccess}
            onSelect={handleSelectLinkAccess}
          />

          <PasswordAccessBlock
            t={t}
            isLoading={isLoading}
            headerText={t("Files:PasswordAccess")}
            bodyText={t("Files:PasswordLink")}
            isChecked={passwordAccessIsChecked}
            isPasswordValid={isPasswordValid}
            passwordValue={passwordValue}
            setPasswordValue={setPasswordValue}
            setIsPasswordValid={setIsPasswordValid}
            onChange={onPasswordAccessChange}
            passwordSettings={passwordSettings}
            isPasswordErrorShow={isPasswordErrorShow}
            setIsPasswordErrorShow={setIsPasswordErrorShow}
          />
          {!isFormRoom ? (
            <ToggleBlock
              isLoading={isLoading}
              headerText={t("Files:DisableDownload")}
              bodyText={t("Files:PreventDownloadFilesAndFolders")}
              isChecked={denyDownload || disabledDenyDownload}
              onChange={onDenyDownloadChange}
              isDisabled={disabledDenyDownload}
              tooltipContent={t("Common:RestrictionDownloadCopyRoom")}
            />
          ) : null}

          <LimitTimeBlock
            isExpired={isExpired}
            isLoading={isLoading}
            headerText={t("Files:LimitByTimePeriod")}
            bodyText={expiredLinkText}
            expirationDate={expirationDate}
            setExpirationDate={setExpirationDate}
            setIsExpired={setIsExpired}
            language={language}
            canChangeLifetime={canChangeLifetime}
          />
        </StyledEditLinkBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          size="normal"
          label={t("Common:SaveButton")}
          isDisabled={isDisabledSaveButton}
          onClick={onSave}
        />
        <Button
          scale
          size="normal"
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );

  const renderPortal = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={editLinkPanelComponent}
        appendTo={rootElement}
        visible={visible}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortal()
    : editLinkPanelComponent;
};

export default inject(
  /**
   * @param {TStore} param0
   * @returns
   */
  ({ authStore, settingsStore, dialogsStore, publicRoomStore }) => {
    const {
      editLinkPanelIsVisible,
      setEditLinkPanelIsVisible,
      unsavedChangesDialogVisible,
      setUnsavedChangesDialog,
      linkParams,
      setLinkParams,
    } = dialogsStore;
    const { externalLinks, editExternalLink, setExternalLink } =
      publicRoomStore;
    const { currentDeviceType, passwordSettings, getPortalPasswordSettings } =
      settingsStore;

    const { item, updateLink } = linkParams ?? {};
    const linkId = linkParams.link?.sharedTo?.id;

    const link = item.isRoom
      ? externalLinks.find((l) => l?.sharedTo?.id === linkId)
      : linkParams.link;

    return {
      link,
      item,
      language: authStore.language,
      passwordSettings,

      visible: editLinkPanelIsVisible,
      setIsVisible: setEditLinkPanelIsVisible,
      updateLink,
      setLinkParams,
      editExternalLink,
      setExternalLink,

      unsavedChangesDialogVisible,
      setUnsavedChangesDialog,

      currentDeviceType,
      getPortalPasswordSettings,
    };
  },
)(
  withTranslation(["SharingPanel", "Common", "Files"])(observer(EditLinkPanel)),
);
