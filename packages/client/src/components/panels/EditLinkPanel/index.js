import { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import isEqual from "lodash/isEqual";

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { StyledEditLinkPanel } from "./StyledEditLinkPanel";

import LinkBlock from "./LinkBlock";
import ToggleBlock from "./ToggleBlock";
import PasswordAccessBlock from "./PasswordAccessBlock";
import LimitTimeBlock from "./LimitTimeBlock";
import { RoomsType } from "@docspace/shared/enums";
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
    currentDeviceType,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [linkNameValue, setLinkNameValue] = useState(
    link?.sharedTo?.title || ""
  );
  const [passwordValue, setPasswordValue] = useState(password);
  const [expirationDate, setExpirationDate] = useState(date);
  const isExpiredDate = expirationDate
    ? new Date(expirationDate).getTime() <= new Date().getTime()
    : false;
  const [isExpired, setIsExpired] = useState(isExpiredDate);

  const [isPasswordValid, setIsPasswordValid] = useState(true);

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
    const isPasswordValid = !!passwordValue.trim();

    if (!isPasswordValid && passwordAccessIsChecked) {
      setIsPasswordValid(false);

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

        if (isEdit) {
          copy(linkValue);
          toastr.success(t("Files:LinkEditedSuccessfully"));
        } else {
          copy(link?.sharedTo?.shareLink);

          toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
        }
      })
      .catch((err) => toastr.error(err?.message))
      .finally(() => {
        setIsLoading(false);
        onClose();
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
    <StyledEditLinkPanel
      isExpired={isExpired}
      displayType="aside"
      visible={visible}
      onClose={onClosePanel}
      isLarge
      zIndex={310}
      withBodyScroll={true}
      withFooterBorder={true}
    >
      <ModalDialog.Header>
        {isEdit
          ? isPrimary
            ? t("Files:EditGeneralLink")
            : isPublic
              ? t("Files:EditAdditionalLink")
              : t("Files:EditLink")
          : t("Files:CreateNewLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="edit-link_body">
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
          />
          <ToggleBlock
            isLoading={isLoading}
            headerText={t("Files:DisableDownload")}
            bodyText={t("Files:PreventDownloadFilesAndFolders")}
            isChecked={denyDownload}
            onChange={onDenyDownloadChange}
          />
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
        </div>
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
    </StyledEditLinkPanel>
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

export default inject(({ auth, dialogsStore, publicRoomStore }) => {
  const { selectionParentRoom } = auth.infoPanelStore;
  const {
    editLinkPanelIsVisible,
    setEditLinkPanelIsVisible,
    unsavedChangesDialogVisible,
    setUnsavedChangesDialog,
    linkParams,
  } = dialogsStore;
  const { externalLinks, editExternalLink, setExternalLink } = publicRoomStore;
  const { isEdit } = linkParams;

  const linkId = linkParams?.link?.sharedTo?.id;
  const link = externalLinks.find((l) => l?.sharedTo?.id === linkId);

  const shareLink = link?.sharedTo?.shareLink;
  const isPublic = selectionParentRoom?.roomType === RoomsType.PublicRoom;

  return {
    visible: editLinkPanelIsVisible,
    setIsVisible: setEditLinkPanelIsVisible,
    isEdit,
    linkId: link?.sharedTo?.id,
    editExternalLink,
    roomId: selectionParentRoom.id,
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
    language: auth.language,
    isPublic,
    currentDeviceType: auth.settingsStore.currentDeviceType,
  };
})(
  withTranslation(["SharingPanel", "Common", "Files"])(observer(EditLinkPanel))
);
