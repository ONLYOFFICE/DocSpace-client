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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";

import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";

import { StartPageSetting } from "./sub-components/StartPageSetting";
import styles from "./FileManagement.module.scss";

type FileManagementProps = {
  logoText?: string;

  storeOriginalFiles?: boolean;
  setStoreOriginal?: FilesSettingsStore["setStoreOriginal"];

  confirmDelete?: boolean;
  setConfirmDelete?: FilesSettingsStore["setConfirmDelete"];

  keepNewFileName?: boolean;
  setKeepNewFileName?: FilesSettingsStore["setKeepNewFileName"];

  openEditorInSameTab?: boolean;
  setOpenEditorInSameTab?: FilesSettingsStore["setOpenEditorInSameTab"];

  displayFileExtension?: boolean;
  setDisplayFileExtension?: FilesSettingsStore["setDisplayFileExtension"];

  hideConfirmCancelOperation?: boolean;
  setHideConfirmCancelOperation?: FilesSettingsStore["setHideConfirmCancelOperation"];
};

const FileManagement = ({
  logoText,

  storeOriginalFiles,
  setStoreOriginal,

  confirmDelete,
  setConfirmDelete,

  keepNewFileName,
  setKeepNewFileName,

  openEditorInSameTab,
  setOpenEditorInSameTab,

  displayFileExtension,
  setDisplayFileExtension,

  hideConfirmCancelOperation,
  setHideConfirmCancelOperation,
}: FileManagementProps) => {
  const { t } = useTranslation(["FilesSettings", "Common"]);

  const onChangeOriginalCopy = React.useCallback(() => {
    setStoreOriginal?.(!storeOriginalFiles, "storeOriginalFiles");
  }, [setStoreOriginal, storeOriginalFiles]);

  const onChangeDeleteConfirm = React.useCallback(() => {
    setConfirmDelete?.(!confirmDelete, "confirmDelete");
  }, [setConfirmDelete, confirmDelete]);

  const onChangeKeepNewFileName = React.useCallback(() => {
    setKeepNewFileName?.(!keepNewFileName);
  }, [setKeepNewFileName, keepNewFileName]);

  const onChangeDisplayFileExtension = React.useCallback(() => {
    setDisplayFileExtension?.(!displayFileExtension);
    window.DocSpace.displayFileExtension = !displayFileExtension;
  }, [setDisplayFileExtension, displayFileExtension]);

  const onChangeCancellationNotification = React.useCallback(() => {
    setHideConfirmCancelOperation?.(!hideConfirmCancelOperation);
  }, [hideConfirmCancelOperation, setHideConfirmCancelOperation]);

  const onChangeOpenEditorInSameTab = React.useCallback(() => {
    setOpenEditorInSameTab?.(!openEditorInSameTab);
  }, [setOpenEditorInSameTab, openEditorInSameTab]);

  return (
    <div className={styles.styledWrapper}>
      <StartPageSetting />
      <div className={styles.settingsSection}>
        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames("ask-again", styles.toggleBtn)}
            onChange={onChangeKeepNewFileName}
            isChecked={keepNewFileName}
            dataTestId="ask_again_toggle_button"
          />
          <Text>{t("Common:DontAskAgain")}</Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames("save-copy-original ", styles.toggleBtn)}
            onChange={onChangeOriginalCopy}
            isChecked={storeOriginalFiles}
            dataTestId="save_copy_original_toggle_button"
          />
          <Text>{t("OriginalCopy")}</Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames("display-notification", styles.toggleBtn)}
            onChange={onChangeDeleteConfirm}
            isChecked={confirmDelete}
            dataTestId="display_notification_toggle_button"
          />
          <Text>
            {t("TrashMoveConfirmation", {
              sectionName: t("Common:TrashSection"),
            })}
          </Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames("open-same-tab", styles.toggleBtn)}
            onChange={onChangeOpenEditorInSameTab}
            isChecked={openEditorInSameTab}
            dataTestId="open_same_tab_toggle_button"
          />
          <Text>
            {t("OpenSameTab", {
              organizationName: logoText,
            })}
          </Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames("display-file-extension", styles.toggleBtn)}
            onChange={onChangeDisplayFileExtension}
            isChecked={displayFileExtension}
            dataTestId="display_file_extension_toggle_button"
          />
          <Text>{t("DisplayFileExtension")}</Text>
        </div>
        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={classNames(
              "cancelletion-notification",
              styles.toggleBtn,
            )}
            onChange={onChangeCancellationNotification}
            isChecked={hideConfirmCancelOperation}
            dataTestId="cancelletion_notification_toggle_button"
          />
          <Text>{t("CancellaionNotification")}</Text>
        </div>
      </div>
    </div>
  );
};

export default inject(
  ({ filesSettingsStore, treeFoldersStore, settingsStore }: TStore) => {
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
      logoText,
      hideConfirmCancelOperation,
      setHideConfirmCancelOperation,
    };
  },
)(observer(FileManagement));
