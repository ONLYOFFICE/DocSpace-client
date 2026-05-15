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

import { useState } from "react";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";

import styles from "./ConvertDialog.module.scss";

const ConvertDialogComponent = (props) => {
  const {
    t,
    tReady,
    visible,
    folderId,
    convertFileFromFiles,
    convertItem,
    setStoreOriginal,
    hideConfirmConvert,
    storeOriginalFiles,
    convertUploadedFiles,
    setConvertDialogVisible,
    rootFoldersTitles,
    isRecentFolder,
    isFavoritesFolder,
    isSharedWithMeFolder,

    createNewIfExist,
    isUploadAction,
    cancelUploadAction,
    conversionFiles,
  } = props;

  const options = [
    {
      label: t("Document"),
      value: ".docx",
    },
    {
      label: t("Spreadsheet"),
      value: ".xlsx",
    },
  ];

  const isXML = convertItem?.fileExst?.includes(".xml");

  let rootFolderTitle = "";
  const convertSingleFile = !!convertItem;
  const sortedFolder =
    isRecentFolder || isFavoritesFolder || isSharedWithMeFolder;

  if (convertSingleFile && sortedFolder) {
    rootFolderTitle = isSharedWithMeFolder
      ? t("Common:MyDocuments")
      : rootFoldersTitles[convertItem.rootFolderType]?.title;
  }

  const [hideMessage, setHideMessage] = useState(false);
  const [selectedOptionType, setSelectedOptionType] = useState(
    options[0].value,
  );

  const onChangeRadioButton = (e) => {
    setSelectedOptionType(e.target.value);
  };

  const onChangeFormat = () =>
    setStoreOriginal(!storeOriginalFiles, "storeOriginalFiles");
  const onChangeMessageVisible = () => setHideMessage(!hideMessage);

  const onClose = () => {
    setConvertDialogVisible(false);
  };

  const onCloseDialog = () => {
    if (isUploadAction && conversionFiles?.length) {
      cancelUploadAction(conversionFiles);
    }

    onClose();
  };

  const onConvert = () => {
    onClose();

    if (convertSingleFile) {
      const item = {
        fileId: convertItem.id,
        toFolderId: folderId,
        action: "convert",
      };

      if (isXML) {
        item.format = selectedOptionType;
      } else {
        item.format = null;
      }

      item.fileInfo = convertItem;
      convertFileFromFiles(item, t, convertItem.isOpen, true);
    } else {
      hideMessage && hideConfirmConvert();
      convertUploadedFiles(t, createNewIfExist);
    }
  };

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onCloseDialog}
      withFooterCheckboxes
      autoMaxHeight
    >
      <ModalDialog.Header>
        {convertSingleFile
          ? t("DocumentConversionTitle")
          : t("FileUploadTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body style={{ paddingBottom: "0px" }}>
        <Text>
          {convertSingleFile
            ? isXML
              ? t("ConversionXmlMessage")
              : t("OpenFileMessage")
            : t("ConversionMessage")}
        </Text>

        {isXML ? (
          <div style={{ boxSizing: "border-box", padding: "16px 0 0" }}>
            <Text>{t("SelectFileType")}</Text>
            <RadioButtonGroup
              orientation="vertical"
              options={options}
              name="convert-file-type"
              selected={selectedOptionType}
              onClick={onChangeRadioButton}
              spacing="12px"
              style={{ marginTop: "12px" }}
              dataTestId="convert_dialog_file_type_radio"
            />
          </div>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={classNames(styles.footer, "convert_dialog_footer")}>
          <div className={styles.convertDialogCheckboxes}>
            <Checkbox
              className="convert_dialog_checkbox"
              label={t("SaveOriginalFormatMessage")}
              isChecked={storeOriginalFiles}
              onChange={onChangeFormat}
              dataTestId="convert_dialog_save_original_checkbox"
            />
            {convertSingleFile && sortedFolder ? (
              <div
                className={`convert_dialog_file-destination ${
                  storeOriginalFiles ? "file-destination_visible" : ""
                }`}
              >
                <Trans
                  t={t}
                  i18nKey="ConvertedFileDestination"
                  ns="ConvertDialog"
                >
                  The file copy will be created in the
                  {{ folderTitle: rootFolderTitle }} folder
                </Trans>
              </div>
            ) : null}
            {!convertSingleFile ? (
              <Checkbox
                className="convert_dialog_checkbox"
                label={t("HideMessage")}
                isChecked={hideMessage}
                onChange={onChangeMessageVisible}
                dataTestId="convert_dialog_hide_message_checkbox"
              />
            ) : null}
          </div>
          <div className={styles.convertDialogButtons}>
            <Button
              key="ContinueButton"
              label={t("Common:ContinueButton")}
              size="normal"
              primary
              scale
              onClick={onConvert}
              testId="convert_dialog_continue_button"
            />
            <Button
              key="CloseButton"
              label={t("Common:CloseButton")}
              size="normal"
              scale
              onClick={onCloseDialog}
              testId="convert_dialog_close_button"
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const ConvertDialog = withTranslation(["ConvertDialog", "Common", "Files"])(
  ConvertDialogComponent,
);

export default inject(
  ({
    uploadDataStore,
    treeFoldersStore,
    dialogsStore,
    filesSettingsStore,
    selectedFolderStore,
  }) => {
    const {
      rootFoldersTitles,
      isRecentFolder,
      isFavoritesFolder,
      isSharedWithMeFolder,
    } = treeFoldersStore;
    const {
      convertUploadedFiles,
      convertFileFromFiles,

      cancelUploadAction,
    } = uploadDataStore;
    const { storeOriginalFiles, setStoreOriginal, hideConfirmConvert } =
      filesSettingsStore;
    const { id: folderId } = selectedFolderStore;
    const {
      convertDialogVisible: visible,
      convertDialogData,
      setConvertDialogVisible,
      convertItem,
    } = dialogsStore;

    const createNewIfExist = convertDialogData.createNewIfExist ?? true;
    const isUploadAction = convertDialogData.isUploadAction ?? false;

    return {
      visible,
      folderId,
      convertFileFromFiles,
      convertItem,
      setStoreOriginal,
      hideConfirmConvert,
      storeOriginalFiles,
      convertUploadedFiles,
      setConvertDialogVisible,
      rootFoldersTitles,
      isRecentFolder,
      isFavoritesFolder,
      isSharedWithMeFolder,
      createNewIfExist,
      isUploadAction,
      cancelUploadAction,
      conversionFiles: convertDialogData.files,
    };
  },
)(observer(ConvertDialog));
