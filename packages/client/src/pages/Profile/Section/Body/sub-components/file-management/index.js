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

import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { SettingsCommonSkeleton } from "@docspace/shared/skeletons/settings";

import StyledWrapper from "./styled-file-management";
import { StartPageSetting } from "./sub-components/StartPageSetting";

const FileManagement = ({
  storeOriginalFiles,
  confirmDelete,

  setStoreOriginal,

  setConfirmDelete,

  showTitle,

  showAdminSettings,

  keepNewFileName,
  setKeepNewFileName,

  openEditorInSameTab,
  setOpenEditorInSameTab,

  displayFileExtension,
  setDisplayFileExtension,
  getFilesSettings,
  logoText,
  hideConfirmCancelOperation,
  setHideConfirmCancelOperation,
}) => {
  const { t, ready } = useTranslation(["FilesSettings", "Common"]);

  const getData = () => getFilesSettings();

  useEffect(() => {
    const prefix =
      window.DocSpace.location.pathname.includes("portal-settings");

    if (prefix) getData();
  }, []);

  const onChangeOriginalCopy = React.useCallback(() => {
    setStoreOriginal(!storeOriginalFiles, "storeOriginalFiles");
  }, [setStoreOriginal, storeOriginalFiles]);

  const onChangeDeleteConfirm = React.useCallback(() => {
    setConfirmDelete(!confirmDelete, "confirmDelete");
  }, [setConfirmDelete, confirmDelete]);

  const onChangeKeepNewFileName = React.useCallback(() => {
    setKeepNewFileName(!keepNewFileName);
  }, [setKeepNewFileName, keepNewFileName]);

  const onChangeDisplayFileExtension = React.useCallback(() => {
    setDisplayFileExtension(!displayFileExtension);
    window.DocSpace.displayFileExtension = !displayFileExtension;
  }, [setDisplayFileExtension, displayFileExtension]);

  const onChangeCancellationNotification = React.useCallback(() => {
    setHideConfirmCancelOperation(!hideConfirmCancelOperation);
  }, [hideConfirmCancelOperation, setHideConfirmCancelOperation]);

  const onChangeOpenEditorInSameTab = React.useCallback(() => {
    setOpenEditorInSameTab(!openEditorInSameTab);
  }, [setOpenEditorInSameTab, openEditorInSameTab]);

  if (!ready) return <SettingsCommonSkeleton />;

  return (
    <StyledWrapper showTitle={showTitle} hideAdminSettings={!showAdminSettings}>
      <StartPageSetting />
      <div className="settings-section">
        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="ask-again toggle-btn"
            onChange={onChangeKeepNewFileName}
            isChecked={keepNewFileName}
          />
          <Text>{t("Common:DontAskAgain")}</Text>
        </div>

        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="save-copy-original toggle-btn"
            onChange={onChangeOriginalCopy}
            isChecked={storeOriginalFiles}
          />
          <Text>{t("OriginalCopy")}</Text>
        </div>

        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="display-notification toggle-btn"
            onChange={onChangeDeleteConfirm}
            isChecked={confirmDelete}
          />
          <Text>
            {t("TrashMoveConfirmation", {
              sectionName: t("Common:TrashSection"),
            })}
          </Text>
        </div>

        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="open-same-tab toggle-btn"
            onChange={onChangeOpenEditorInSameTab}
            isChecked={openEditorInSameTab}
          />
          <Text>
            {t("OpenSameTab", {
              organizationName: logoText,
            })}
          </Text>
        </div>

        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="display-file-extension toggle-btn"
            onChange={onChangeDisplayFileExtension}
            isChecked={displayFileExtension}
          />
          <Text>{t("DisplayFileExtension")}</Text>
        </div>
        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="cancelletion-notification toggle-btn"
            onChange={onChangeCancellationNotification}
            isChecked={hideConfirmCancelOperation}
          />
          <Text>{t("CancellaionNotification")}</Text>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default inject(
  ({ filesSettingsStore, treeFoldersStore, settingsStore }) => {
    const {
      storeOriginalFiles,
      confirmDelete,

      setStoreOriginal,

      setConfirmDelete,

      favoritesSection,
      recentSection,

      keepNewFileName,
      setKeepNewFileName,

      openEditorInSameTab,
      setOpenEditorInSameTab,

      displayFileExtension,
      setDisplayFileExtension,
      getFilesSettings,
      hideConfirmCancelOperation,
      setHideConfirmCancelOperation,
    } = filesSettingsStore;
    const { logoText } = settingsStore;

    const { myFolderId, commonFolderId } = treeFoldersStore;

    return {
      storeOriginalFiles,
      confirmDelete,

      myFolderId,
      commonFolderId,

      favoritesSection,
      recentSection,

      setStoreOriginal,

      setConfirmDelete,

      keepNewFileName,
      setKeepNewFileName,

      openEditorInSameTab,
      setOpenEditorInSameTab,

      displayFileExtension,
      setDisplayFileExtension,
      getFilesSettings,
      logoText,
      hideConfirmCancelOperation,
      setHideConfirmCancelOperation,
    };
  },
)(observer(FileManagement));
