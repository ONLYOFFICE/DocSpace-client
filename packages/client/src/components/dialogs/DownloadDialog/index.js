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

import React from "react";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import DownloadContent from "./DownloadContent";
import PasswordContent from "./PasswordContent";
import { StyledBodyContent } from "./StyledDownloadDialog";
import OnePasswordRow from "./OnePasswordRow";

const LoadingPlaceholder = () => <div style={{ width: "96px" }} />;

class DownloadDialogComponent extends React.Component {
  constructor(props) {
    super(props);

    const { sortedFiles } = this.props;
    const { documents, spreadsheets, presentations, masterForms, other } =
      sortedFiles;

    this.state = {
      documents: {
        isChecked: true,
        isIndeterminate: false,
        format: null,
        files: documents,
      },
      spreadsheets: {
        isChecked: true,
        isIndeterminate: false,
        format: null,
        files: spreadsheets,
      },
      presentations: {
        isChecked: true,
        isIndeterminate: false,
        format: null,
        files: presentations,
      },
      masterForms: {
        isChecked: true,
        isIndeterminate: false,
        format: null,
        files: masterForms,
      },
      other: {
        isChecked: true,
        isIndeterminate: false,
        files: other,
      },
      modalDialogToggle: "modalDialogToggle",
    };
  }

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  onDownload = () => {
    const { setDownloadItems } = this.props;
    const { documents, spreadsheets, presentations, masterForms, other } =
      this.state;

    const itemList = [
      ...documents.files,
      ...spreadsheets.files,
      ...presentations.files,
      ...masterForms.files,
      ...other.files,
    ];

    if (itemList.length) {
      setDownloadItems(itemList);

      this.onDownloadFunction(itemList);
    }
  };

  onDownloadFunction = (itemList) => {
    const { downloadItems, downloadFiles, getDownloadItems, t } = this.props;

    const files = itemList ?? downloadItems;

    const [fileConvertIds, folderIds] = getDownloadItems(files, t);

    downloadFiles(fileConvertIds, folderIds, this.getErrorsTranslation());

    this.onClose();
  };

  onReDownload = () => {
    const { downloadItems, isAllPasswordFilesSorted } = this.props;

    if (downloadItems.length > 0 && isAllPasswordFilesSorted) {
      this.onDownloadFunction();
    }
  };

  getNewArrayFiles = (fileId, array, format) => {
    // Set all documents format
    const { t } = this.props;

    if (!fileId) {
      array.forEach((file) => {
        file.format =
          format === t("CustomFormat") || file.fileExst === format
            ? t("OriginalFormat")
            : format;
      });

      return array;
    }
    // Set single document format
    const newDoc = array.find((x) => x.id == fileId);
    if (newDoc.format !== format) {
      newDoc.format = format;
    }
    return array;
  };

  onSelectFormat = (e) => {
    const { format, type, fileId } = e.currentTarget.dataset;
    const files = this.state[type].files; // eslint-disable-line react/destructuring-assignment
    const { t } = this.props;

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState[type].files = this.getNewArrayFiles(fileId, files, format);
      newState[type].format = !fileId ? format : t("CustomFormat");

      const index = newState[type].files.findIndex(
        (f) => f.format && f.format !== t("OriginalFormat"),
      );

      if (index === -1) {
        newState[type].format = t("OriginalFormat");
      }

      return { ...prevState, ...newState };
    });
  };

  updateDocsState = (fieldStateName, itemId) => {
    const { isChecked, isIndeterminate, files } = this.state[fieldStateName]; // eslint-disable-line react/destructuring-assignment

    if (itemId === "All") {
      const checked = isIndeterminate ? false : !isChecked;
      files.forEach((file) => {
        file.checked = checked;
      });

      this.setState((prevState) => {
        const newState = { ...prevState };

        newState[fieldStateName].files = files;
        newState[fieldStateName].isIndeterminate = false;
        newState[fieldStateName].isChecked = checked;

        return { ...prevState, ...newState };
      });
    } else {
      const file = files.find((x) => x.id == itemId);
      file.checked = !file.checked;

      const disableFiles = files.find((x) => x.checked === false);
      const activeFiles = files.find((x) => x.checked === true);
      const isIndeterminate = !activeFiles ? false : !!disableFiles;
      const isChecked = !disableFiles;

      this.setState((prevState) => {
        const newState = { ...prevState };

        newState[fieldStateName].files = files;
        newState[fieldStateName].isIndeterminate = isIndeterminate;
        newState[fieldStateName].isChecked = isChecked;

        return { ...prevState, ...newState };
      });
    }
  };

  onRowSelect = (e) => {
    const { itemId, type } = e.currentTarget.dataset;

    switch (type) {
      case "documents":
        this.updateDocsState("documents", itemId);

        break;
      case "spreadsheets":
        this.updateDocsState("spreadsheets", itemId);
        break;
      case "presentations":
        this.updateDocsState("presentations", itemId);
        break;
      case "masterForms":
        this.updateDocsState("masterForms", itemId);
        break;
      case "other":
        this.updateDocsState("other", itemId);
        break;

      default:
        break;
    }
  };

  /**
   * @returns {number}
   */
  getCheckedFileLength = () => {
    const { documents, spreadsheets, presentations, masterForms, other } =
      this.state;

    return (
      documents.files.filter((f) => f.checked).length +
      spreadsheets.files.filter((f) => f.checked).length +
      presentations.files.filter((f) => f.checked).length +
      masterForms.files.filter((f) => f.checked).length +
      other.files.filter((f) => f.checked).length
    );
  };

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyUp = (event) => {
    const { isAllPasswordFilesSorted, needPassword } = this.props;

    if (event.key === "Enter" && needPassword) {
      if (!isAllPasswordFilesSorted) return;

      this.onReDownload();
      return;
    }

    if (event.key === "Enter" && this.getCheckedFileLength() > 0) {
      this.onDownload();
    }
  };

  getErrorsTranslation = () => {
    const { t } = this.props;
    const passwordError = (
      <Trans
        t={t}
        ns="Files"
        i18nKey="PasswordProtectedFiles"
        components={{ 1: <span /> }}
      />
    );
    const translations = {
      label: t("Translations:ArchivingData"),
      error: t("Common:ErrorInternalServer"),
      passwordError,
    };

    return translations;
  };

  onClose = () => {
    const { setDownloadDialogVisible, setSortedPasswordFiles } = this.props;

    setSortedPasswordFiles({
      other: [],
      password: [],
      remove: [],
      original: [],
    });

    setDownloadDialogVisible(false);
  };

  onClosePanel = () => {
    const { setDownloadDialogVisible } = this.props;

    this.interruptingConversion();

    setDownloadDialogVisible(false);
  };

  interruptingConversion = () => {
    const { setSortedPasswordFiles, setDownloadItems } = this.props;

    setSortedPasswordFiles({
      other: [],
      password: [],
      remove: [],
      original: [],
    });

    setDownloadItems([]);
  };

  getItemIcon = (item) => {
    const { getIcon, getFolderIcon } = this.props;
    const extension = item.fileExst;
    const icon = extension ? getIcon(32, extension) : getFolderIcon(32);

    return (
      <ReactSVG
        beforeInjection={(svg) => {
          svg.setAttribute("style", "margin-top: 4px; margin-right: 12px;");
        }}
        src={icon}
        loading={LoadingPlaceholder}
      />
    );
  };

  render() {
    const {
      t,
      tReady,
      visible,
      extsConvertible,
      theme,
      needPassword,
      isAllPasswordFilesSorted,
      isOnePasswordFile,
    } = this.props;

    const { documents, spreadsheets, presentations, masterForms, other } =
      this.state;
    const {
      isChecked: checkedDocTitle,
      isIndeterminate: indeterminateDocTitle,
      format: documentsTitleFormat,
    } = documents;

    const {
      isChecked: checkedSpreadsheetTitle,
      isIndeterminate: isIndeterminateSpreadsheetTitle,
      format: spreadsheetsTitleFormat,
    } = spreadsheets;

    const {
      isChecked: checkedPresentationTitle,
      isIndeterminate: indeterminatePresentationTitle,
      format: presentationsTitleFormat,
    } = presentations;

    const {
      isChecked: checkedMasterFormsTitle,
      isIndeterminate: indeterminateMasterFormsTitle,
      format: masterFormsTitleFormat,
    } = masterForms;

    const {
      isChecked: checkedOtherTitle,
      isIndeterminate: indeterminateOtherTitle,
    } = other;

    const isCheckedLength = this.getCheckedFileLength();

    const isSingleFile = isCheckedLength <= 1;

    const downloadContentProps = {
      t,
      theme,
      extsConvertible,
      onSelectFormat: this.onSelectFormat,
      onRowSelect: this.onRowSelect,
      getItemIcon: this.getItemIcon,
    };

    const totalItemsNum =
      documents.files.length +
      spreadsheets.files.length +
      presentations.files.length +
      masterForms.files.length +
      other.files.length +
      (documents.files.length > 1 && 1) +
      (spreadsheets.files.length > 1 && 1) +
      (presentations.files.length > 1 && 1) +
      (masterForms.files.length > 1 && 1) +
      (other.files.length > 1 && 1);

    const mainContent = (
      <>
        <StyledBodyContent className="download-dialog-description">
          <Text noSelect>{t("ChooseFormatText")}.</Text>
          {!isSingleFile && (
            <Text noSelect>
              <Trans t={t} i18nKey="ConvertToZip" />
            </Text>
          )}
        </StyledBodyContent>
        {documents.length > 0 && (
          <DownloadContent
            {...downloadContentProps}
            isChecked={checkedDocTitle}
            isIndeterminate={indeterminateDocTitle}
            items={documents}
            titleFormat={documentsTitleFormat || t("OriginalFormat")}
            type="documents"
            title={t("Common:Documents")}
          />
        )}

        {spreadsheets.length > 0 && (
          <DownloadContent
            {...downloadContentProps}
            isChecked={checkedSpreadsheetTitle}
            isIndeterminate={isIndeterminateSpreadsheetTitle}
            items={spreadsheets}
            titleFormat={spreadsheetsTitleFormat || t("OriginalFormat")}
            type="spreadsheets"
            title={t("Translations:Spreadsheets")}
          />
        )}

        {presentations.length > 0 && (
          <DownloadContent
            {...downloadContentProps}
            isChecked={checkedPresentationTitle}
            isIndeterminate={indeterminatePresentationTitle}
            items={presentations}
            titleFormat={presentationsTitleFormat || t("OriginalFormat")}
            type="presentations"
            title={t("Translations:Presentations")}
          />
        )}

        {masterForms.length > 0 && (
          <DownloadContent
            {...downloadContentProps}
            isChecked={checkedMasterFormsTitle}
            isIndeterminate={indeterminateMasterFormsTitle}
            items={masterForms}
            titleFormat={masterFormsTitleFormat || t("OriginalFormat")}
            type="masterForms"
            title={t("Translations:FormTemplates")}
          />
        )}

        {other.length > 0 && (
          <DownloadContent
            {...downloadContentProps}
            isChecked={checkedOtherTitle}
            isIndeterminate={indeterminateOtherTitle}
            items={other}
            type="other"
            title={t("Translations:Other")}
          />
        )}

        <div className="download-dialog-convert-message">
          <Text noSelect>{t("ConvertMessage")}</Text>
        </div>
      </>
    );

    if (isOnePasswordFile) {
      return (
        <OnePasswordRow
          getItemIcon={this.getItemIcon}
          onDownload={this.onDownloadFunction}
          onClosePanel={this.onClosePanel}
        />
      );
    }

    return (
      <ModalDialog
        visible={visible}
        displayType={ModalDialogType.aside}
        onClose={this.onClosePanel}
        autoMaxHeight
        autoMaxWidth
        isLarge
        isLoading={!tReady}
        withBodyScroll={totalItemsNum > 11}
      >
        <ModalDialog.Header>{t("Translations:DownloadAs")}</ModalDialog.Header>

        <ModalDialog.Body className="modalDialogToggle">
          <Scrollbar bodyPadding="0px">
            {needPassword ? (
              <PasswordContent
                getItemIcon={this.getItemIcon}
                onReDownload={this.onReDownload}
              />
            ) : (
              mainContent
            )}
          </Scrollbar>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            key="DownloadButton"
            className="download-button"
            label={
              needPassword ? t("Common:ContinueButton") : t("Common:Download")
            }
            size="normal"
            primary
            onClick={needPassword ? this.onReDownload : this.onDownload}
            isDisabled={
              needPassword ? !isAllPasswordFilesSorted : isCheckedLength === 0
            }
            scale
          />
          <Button
            key="CancelButton"
            className="cancel-button"
            label={t("Common:CancelButton")}
            size="normal"
            onClick={this.onClose}
            scale
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const DownloadDialog = withTranslation([
  "DownloadDialog",
  "Common",
  "Translations",
])(DownloadDialogComponent);

export default inject(
  ({
    filesStore,
    dialogsStore,
    filesActionsStore,
    filesSettingsStore,
    settingsStore,
    uploadDataStore,
  }) => {
    const { sortedFiles, setSelected } = filesStore;
    const { extsConvertible, getIcon, getFolderIcon } = filesSettingsStore;
    const { theme, openUrl } = settingsStore;

    const {
      downloadDialogVisible: visible,
      setDownloadDialogVisible,

      setSortedPasswordFiles,
      sortedDownloadFiles,
      getDownloadItems,
      setDownloadItems,
      sortedPasswordFiles,
      downloadItems,
    } = dialogsStore;

    const { downloadFiles } = filesActionsStore;

    const { clearActiveOperations } = uploadDataStore;

    const isAllPasswordFilesSorted = sortedDownloadFiles.other?.length === 0;
    const needPassword = sortedPasswordFiles?.length > 0;

    const isSortedFile =
      sortedDownloadFiles?.remove?.length === 1 && downloadItems?.length === 1;

    const isOnePasswordFile = !isSortedFile && downloadItems?.length === 1;

    return {
      sortedFiles,
      visible,
      extsConvertible,

      setDownloadDialogVisible,
      setSelected,
      downloadFiles,

      theme,
      openUrl,
      sortedPasswordFiles,

      setSortedPasswordFiles,
      isAllPasswordFilesSorted,
      clearActiveOperations,
      getDownloadItems,
      setDownloadItems,
      downloadItems,
      getIcon,
      getFolderIcon,
      isOnePasswordFile,
      needPassword,
    };
  },
)(observer(DownloadDialog));
