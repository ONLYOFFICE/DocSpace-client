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

import { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import isEqual from "lodash/isEqual";

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { StyledEditLinkBodyContent } from "./StyledEditLinkPanel";

import LinkBlock from "./LinkBlock";
import ToggleBlock from "./ToggleBlock";
import PasswordAccessBlock from "./PasswordAccessBlock";
import LimitTimeBlock from "./LimitTimeBlock";
import { DeviceType } from "@docspace/shared/enums";
import moment from "moment";

const EditLinkPanel = (props) => {
  const {
    t,
    roomId,
    isEdit,
    visible,
    password,
    setIsVisible,
    editExternalLink,
    setExternalLink,
    shareLink,
    unsavedChangesDialogVisible,
    setUnsavedChangesDialog,
    isLocked,
    isDenyDownload,
    link,
    date,
    language,
    isPublic,
    isFormRoom,
    currentDeviceType,
    setLinkParams,
    passwordSettings,
    getPortalPasswordSettings,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [linkNameValue, setLinkNameValue] = useState(
    link?.sharedTo?.title || "",
  );
  const [passwordValue, setPasswordValue] = useState(password);
  const [expirationDate, setExpirationDate] = useState(date);
  const isExpiredDate = expirationDate
    ? new Date(expirationDate).getTime() <= new Date().getTime()
    : false;
  const [isExpired, setIsExpired] = useState(isExpiredDate);

  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [linkValue, setLinkValue] = useState(shareLink);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSameDate, setIsSameDate] = useState(false);

  const [passwordAccessIsChecked, setPasswordAccessIsChecked] =
    useState(isLocked);

  const [denyDownload, setDenyDownload] = useState(isDenyDownload);

  const onPasswordAccessChange = () =>
    setPasswordAccessIsChecked(!passwordAccessIsChecked);

  const onDenyDownloadChange = () => setDenyDownload(!denyDownload);

  const onClosePanel = () => {
    hasChanges ? setUnsavedChangesDialog(true) : onClose();
  };

  const onClose = () => setIsVisible(false);
  const onSave = () => {
    if (
      (!passwordValue.trim() || !isPasswordValid) &&
      passwordAccessIsChecked
    ) {
      setIsPasswordValid(false);
      setIsPasswordErrorShow(true);

      return;
    }

    const isExpired = expirationDate
      ? new Date(expirationDate).getTime() <= new Date().getTime()
      : false;
    if (isExpired) {
      setIsExpired(isExpired);
      return;
    }

    const externalLink = link ?? { access: 2, sharedTo: {} };

    const newLink = JSON.parse(JSON.stringify(externalLink));

    newLink.sharedTo.title = linkNameValue;
    newLink.sharedTo.password = passwordAccessIsChecked ? passwordValue : null;
    newLink.sharedTo.denyDownload = denyDownload;
    if (!isSameDate) newLink.sharedTo.expirationDate = expirationDate;

    setIsLoading(true);
    editExternalLink(roomId, newLink)
      .then((link) => {
        setExternalLink(link);
        setLinkParams({ link, roomId, isPublic, isFormRoom });

        if (isEdit) {
          copy(linkValue);
          toastr.success(t("Files:LinkEditedSuccessfully"));
        } else {
          copy(link?.sharedTo?.shareLink);

          toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
        }
        onClose();
      })
      .catch((err) => {
        const error = err?.response?.data?.error?.message ?? err?.message;
        toastr.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const initState = {
    passwordValue: password,
    passwordAccessIsChecked: isLocked,
    denyDownload: isDenyDownload,
    linkNameValue: link?.sharedTo?.title || "",
  };

  useEffect(() => {
    const data = {
      passwordValue,
      passwordAccessIsChecked,
      denyDownload,
      linkNameValue,
    };

    const isSameDate = moment(date).isSame(expirationDate);
    setIsSameDate(isSameDate);

    if (!isEqual(data, initState) || !isSameDate) {
      setHasChanges(true);
    } else setHasChanges(false);
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

  useEffect(() => {
    if (!passwordSettings) {
      getPasswordSettings();
    }
  }, [passwordSettings]);

  const linkNameIsValid = !!linkNameValue.trim();

  const expiredLinkText = isExpired
    ? t("Translations:LinkHasExpiredAndHasBeenDisabled")
    : expirationDate
      ? `${t("Files:LinkValidUntil")}:`
      : t("Files:ChooseExpirationDate");

  const isPrimary = link?.sharedTo?.primary;

  const isDisabledSaveButton =
    !hasChanges || isLoading || !linkNameIsValid || isExpired;

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
        {isEdit
          ? isPrimary
            ? t("Files:EditSharedLink")
            : isPublic
              ? t("Files:EditAdditionalLink")
              : t("Files:EditLink")
          : t("Files:CreateNewLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledEditLinkBodyContent className="edit-link_body">
          <LinkBlock
            t={t}
            isEdit={isEdit}
            isLoading={isLoading}
            shareLink={shareLink}
            linkNameValue={linkNameValue}
            setLinkNameValue={setLinkNameValue}
            linkValue={linkValue}
            setLinkValue={setLinkValue}
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
          {!isFormRoom && (
            <ToggleBlock
              isLoading={isLoading}
              headerText={t("Files:DisableDownload")}
              bodyText={t("Files:PreventDownloadFilesAndFolders")}
              isChecked={denyDownload}
              onChange={onDenyDownloadChange}
            />
          )}

          {!isPrimary && (
            <LimitTimeBlock
              isExpired={isExpired}
              isLoading={isLoading}
              headerText={t("Files:LimitByTimePeriod")}
              bodyText={expiredLinkText}
              expirationDate={expirationDate}
              setExpirationDate={setExpirationDate}
              setIsExpired={setIsExpired}
              language={language}
            />
          )}
        </StyledEditLinkBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          size="normal"
          label={isEdit ? t("Common:SaveButton") : t("Common:Create")}
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

    const { isEdit, roomId, isPublic, isFormRoom } = linkParams;

    const linkId = linkParams?.link?.sharedTo?.id;
    const link = externalLinks.find((l) => l?.sharedTo?.id === linkId);
    const shareLink = link?.sharedTo?.shareLink;

    return {
      visible: editLinkPanelIsVisible,
      setIsVisible: setEditLinkPanelIsVisible,
      isEdit,
      linkId: link?.sharedTo?.id,
      editExternalLink,
      roomId,
      setExternalLink,
      isLocked: !!link?.sharedTo?.password,
      password: link?.sharedTo?.password ?? "",
      date: link?.sharedTo?.expirationDate,
      isDenyDownload: link?.sharedTo?.denyDownload ?? false,
      shareLink,
      externalLinks,
      unsavedChangesDialogVisible,
      setUnsavedChangesDialog,
      link,
      language: authStore.language,
      isPublic,
      isFormRoom,
      currentDeviceType,
      setLinkParams,
      passwordSettings,
      getPortalPasswordSettings,
    };
  },
)(
  withTranslation(["SharingPanel", "Common", "Files"])(observer(EditLinkPanel)),
);
