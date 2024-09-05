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

import React, { useState, useEffect } from "react";
import ModalDialogContainer from "../ModalDialogContainer";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";

import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { FolderType } from "@docspace/shared/enums";

const ConvertDialogComponent = (props) => {
  const {
    t,
    tReady,
    visible,
    folderId,
    convertFile,
    convertItem,
    setStoreOriginal,
    hideConfirmConvert,
    storeOriginalFiles,
    convertUploadedFiles,
    setConvertDialogVisible,
    rootFoldersTitles,
    isRecentFolder,
    isFavoritesFolder,
    isShareFolder,
    setIsConvertSingleFile,
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
  const sortedFolder = isRecentFolder || isFavoritesFolder || isShareFolder;

  if (convertSingleFile && sortedFolder) {
    rootFolderTitle = isShareFolder
      ? rootFoldersTitles[FolderType.USER]?.title
      : rootFoldersTitles[convertItem.rootFolderType]?.title;
  }

  const [hideMessage, setHideMessage] = useState(false);
  const [selectedOptionType, setSelectedOptionType] = useState(
    options[0].value,
  );

  const onChangeRadioButton = (e) => {
    setSelectedOptionType(e.target.value);
    setIsConvertSingleFile(false);
  };

  const onChangeFormat = () =>
    setStoreOriginal(!storeOriginalFiles, "storeOriginalFiles");
  const onChangeMessageVisible = () => setHideMessage(!hideMessage);

  const onClose = () => {
    setConvertDialogVisible(false);
    setIsConvertSingleFile(false);
  };

  const onConvert = () => {
    onClose();

    if (convertSingleFile) {
      setIsConvertSingleFile(true);
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
      convertFile(item, t, convertItem.isOpen);
    } else {
      hideMessage && hideConfirmConvert();
      convertUploadedFiles(t);
    }
  };

  return (
    <ModalDialogContainer
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
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

        {isXML && (
          <Box paddingProp="16px 0 0">
            <Text>{t("SelectFileType")}</Text>
            <RadioButtonGroup
              orientation="vertical"
              options={options}
              name="convert-file-type"
              selected={selectedOptionType}
              onClick={onChangeRadioButton}
              spacing="12px"
              style={{ marginTop: "12px" }}
            />
          </Box>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className="convert_dialog_footer">
          <div className="convert_dialog_checkboxes">
            <Checkbox
              className="convert_dialog_checkbox"
              label={t("SaveOriginalFormatMessage")}
              isChecked={storeOriginalFiles}
              onChange={onChangeFormat}
            />
            {convertSingleFile && sortedFolder && (
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
            )}
            {!convertSingleFile && (
              <Checkbox
                className="convert_dialog_checkbox"
                label={t("HideMessage")}
                isChecked={hideMessage}
                onChange={onChangeMessageVisible}
              />
            )}
          </div>
          <div className="convert_dialog_buttons">
            <Button
              key="ContinueButton"
              label={t("Common:ContinueButton")}
              size="normal"
              primary
              scale
              onClick={onConvert}
            />
            <Button
              key="CloseButton"
              label={t("Common:CloseButton")}
              size="normal"
              scale
              onClick={onClose}
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialogContainer>
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
      isShareFolder,
    } = treeFoldersStore;
    const { convertUploadedFiles, convertFile, setIsConvertSingleFile } =
      uploadDataStore;
    const { storeOriginalFiles, setStoreOriginal, hideConfirmConvert } =
      filesSettingsStore;
    const { id: folderId } = selectedFolderStore;
    const {
      convertDialogVisible: visible,
      setConvertDialogVisible,
      convertItem,
    } = dialogsStore;

    return {
      visible,
      folderId,
      convertFile,
      convertItem,
      setStoreOriginal,
      hideConfirmConvert,
      storeOriginalFiles,
      convertUploadedFiles,
      setConvertDialogVisible,
      rootFoldersTitles,
      isRecentFolder,
      isFavoritesFolder,
      isShareFolder,
      setIsConvertSingleFile,
    };
  },
)(observer(ConvertDialog));
