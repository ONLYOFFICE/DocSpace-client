/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { useEffect, useState } from "react";
import { ReactSVG } from "react-svg";
import { Trans, useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { Text } from "../../components/text";
import { Button } from "../../components/button";
import { Scrollbar } from "../../components/scrollbar";
import { toastr } from "../../components/toast";

import { StyledBodyContent } from "./StyledDownloadDialog";
import { DownloadContent } from "./sub-components/DownloadContent";
import { PasswordContent } from "./sub-components/PasswordContent";
import { OnePasswordRow } from "./sub-components/OnePasswordRow";

const LoadingPlaceholder = () => <div style={{ width: "96px" }} />;

const getInitialState = (sortedFiles) => {
  return {
    documents: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.documents,
    },
    spreadsheets: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.spreadsheets,
    },
    presentations: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.presentations,
    },
    masterForms: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.masterForms,
    },
    other: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.other,
    },
  };
};

const DownloadDialog = (props) => {
  const {
    sortedFiles,
    setDownloadItems,
    downloadItems,
    downloadFiles,
    getDownloadItems,
    isAllPasswordFilesSorted,
    needPassword,
    isOnePasswordFile,
    sortedPasswordFiles,
    updateDownloadedFilePassword,
    sortedDownloadFiles,
    resetDownloadedFileFormat,
    discardDownloadedFile,
    visible,
    setDownloadDialogVisible,
    setSortedPasswordFiles,
    getIcon,
    getFolderIcon,
    extsConvertible,
  } = props;

  const [state, setState] = useState(getInitialState(sortedFiles));
  const { t, ready: tReady } = useTranslation([
    "DownloadDialog",
    "Common",
    "Translations",
  ]);

  const getErrorsTranslation = () => {
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

  const onClose = () => {
    setSortedPasswordFiles({
      other: [],
      password: [],
      remove: [],
      original: [],
    });

    setDownloadDialogVisible(false);
  };

  const onDownloadFunction = (itemList) => {
    const files = itemList ?? downloadItems;
    const [fileConvertIds, folderIds] = getDownloadItems(files, t);
    downloadFiles(fileConvertIds, folderIds, getErrorsTranslation());
    onClose();
  };

  const onDownload = () => {
    const { documents, spreadsheets, presentations, masterForms, other } =
      state;

    const itemList = [
      ...documents.files,
      ...spreadsheets.files,
      ...presentations.files,
      ...masterForms.files,
      ...other.files,
    ];

    if (itemList.length) {
      setDownloadItems(itemList);
      onDownloadFunction(itemList);
    }
  };

  const onReDownload = () => {
    if (downloadItems.length > 0 && isAllPasswordFilesSorted) {
      toastr.clear();
      onDownloadFunction();
    }
  };

  const getNewArrayFiles = (fileId, array, format) => {
    // Set all documents format
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
    const newDoc = array.find((x) => x.id === fileId);
    if (newDoc.format !== format) {
      newDoc.format = format;
    }
    return array;
  };

  const onSelectFormat = (e) => {
    const { format, type, fileId } = e.currentTarget.dataset;
    const { files } = state[type];

    setState((prevState) => {
      const newState = { ...prevState };
      newState[type].files = getNewArrayFiles(+fileId, files, format);
      newState[type].format = !fileId ? format : t("CustomFormat");

      const index = newState[type].files.findIndex(
        (f) => f.format && f.format !== t("OriginalFormat"),
      );

      if (index === -1) {
        newState[type].format = t("OriginalFormat");
      }

      return newState;
    });
  };

  const updateDocsState = (fieldStateName, itemId) => {
    const { isChecked, isIndeterminate, files } = state[fieldStateName];

    if (itemId === "All") {
      const checked = isIndeterminate ? false : !isChecked;
      files.forEach((file) => {
        file.checked = checked;
      });

      setState((prevState) => {
        const newState = { ...prevState };
        newState[fieldStateName].files = files;
        newState[fieldStateName].isIndeterminate = false;
        newState[fieldStateName].isChecked = checked;
        return newState;
      });
    } else {
      const file = files.find((x) => x.id === itemId);
      file.checked = !file.checked;

      const disableFiles = files.find((x) => x.checked === false);
      const activeFiles = files.find((x) => x.checked === true);

      setState((prevState) => {
        const newState = { ...prevState };

        newState[fieldStateName].files = files;
        newState[fieldStateName].isIndeterminate = !activeFiles
          ? false
          : !!disableFiles;
        newState[fieldStateName].isChecked = !disableFiles;

        return newState;
      });
    }
  };

  const onRowSelect = (e) => {
    const { itemId, type } = e.currentTarget.dataset;

    switch (type) {
      case "documents":
        updateDocsState("documents", +itemId);

        break;
      case "spreadsheets":
        updateDocsState("spreadsheets", +itemId);
        break;
      case "presentations":
        updateDocsState("presentations", +itemId);
        break;
      case "masterForms":
        updateDocsState("masterForms", +itemId);
        break;
      case "other":
        updateDocsState("other", +itemId);
        break;

      default:
        break;
    }
  };

  const getCheckedFileLength = () => {
    const { documents, spreadsheets, presentations, masterForms, other } =
      state;

    return (
      documents.files.filter((f) => f.checked).length +
      spreadsheets.files.filter((f) => f.checked).length +
      presentations.files.filter((f) => f.checked).length +
      masterForms.files.filter((f) => f.checked).length +
      other.files.filter((f) => f.checked).length
    );
  };

  const handleKeyUp = (event) => {
    if (event.key === "Enter" && needPassword) {
      if (!isAllPasswordFilesSorted) return;

      onReDownload();
      return;
    }

    if (event.key === "Enter" && getCheckedFileLength() > 0) {
      onDownload();
    }
  };

  const interruptingConversion = () => {
    setSortedPasswordFiles({
      other: [],
      password: [],
      remove: [],
      original: [],
    });

    setDownloadItems([]);
  };

  const onClosePanel = () => {
    interruptingConversion();

    setDownloadDialogVisible(false);
  };

  const getItemIcon = (item) => {
    const extension = item?.fileExst;
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

  const checkedLength = getCheckedFileLength();

  const isSingleFile = checkedLength <= 1;

  const downloadContentProps = {
    t,
    extsConvertible,
    onSelectFormat,
    onRowSelect,
    getItemIcon,
  };

  const totalItemsNum =
    state.documents.files.length +
    state.spreadsheets.files.length +
    state.presentations.files.length +
    state.masterForms.files.length +
    state.other.files.length +
    (state.documents.files.length > 1 && 1) +
    (state.spreadsheets.files.length > 1 && 1) +
    (state.presentations.files.length > 1 && 1) +
    (state.masterForms.files.length > 1 && 1) +
    (state.other.files.length > 1 && 1);

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const mainContent = (
    <>
      <StyledBodyContent className="download-dialog-description">
        <Text noSelect>{t("ChooseFormatText")}.</Text>
        {!isSingleFile ? (
          <Text noSelect>
            <Trans t={t} i18nKey="ConvertToZip" />
          </Text>
        ) : null}
      </StyledBodyContent>
      {state.documents.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.documents.isChecked}
          isIndeterminate={state.documents.isIndeterminate}
          items={state.documents.files}
          titleFormat={state.documents.format || t("OriginalFormat")}
          type="documents"
          title={t("Common:Documents")}
        />
      ) : null}

      {state.spreadsheets.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.spreadsheets.isChecked}
          isIndeterminate={state.spreadsheets.isIndeterminate}
          items={state.spreadsheets.files}
          titleFormat={state.spreadsheets.format || t("OriginalFormat")}
          type="spreadsheets"
          title={t("Translations:Spreadsheets")}
        />
      ) : null}

      {state.presentations.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.presentations.isChecked}
          isIndeterminate={state.presentations.isIndeterminate}
          items={state.presentations.files}
          titleFormat={state.presentations.format || t("OriginalFormat")}
          type="presentations"
          title={t("Translations:Presentations")}
        />
      ) : null}

      {state.masterForms.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.masterForms.isChecked}
          isIndeterminate={state.masterForms.isIndeterminate}
          items={state.masterForms.files}
          titleFormat={state.masterForms.format || t("OriginalFormat")}
          type="masterForms"
          title={t("Translations:FormTemplates")}
        />
      ) : null}

      {state.other.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.other.isChecked}
          isIndeterminate={state.other.isIndeterminate}
          items={state.other.files}
          type="other"
          title={t("Translations:Other")}
        />
      ) : null}

      <div className="download-dialog-convert-message">
        <Text noSelect>{t("ConvertMessage")}</Text>
      </div>
    </>
  );

  if (isOnePasswordFile) {
    return (
      <OnePasswordRow
        getItemIcon={getItemIcon}
        onDownload={onDownloadFunction}
        onClosePanel={onClosePanel}
        item={sortedPasswordFiles[0]}
        setDownloadItems={setDownloadItems}
        downloadItems={downloadItems}
        sortedPasswordFiles={sortedPasswordFiles}
        visible={visible}
      />
    );
  }

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClosePanel}
      autoMaxHeight
      autoMaxWidth
      isLarge
      isLoading={!tReady}
      withBodyScroll={totalItemsNum > 11}
    >
      <ModalDialog.Header>{t("Translations:DownloadAs")}</ModalDialog.Header>

      <ModalDialog.Body className="modalDialogToggle">
        <Scrollbar paddingAfterLastItem="0px">
          {needPassword ? (
            <PasswordContent
              getItemIcon={getItemIcon}
              onReDownload={onReDownload}
              sortedPasswordFiles={sortedPasswordFiles}
              updateDownloadedFilePassword={updateDownloadedFilePassword}
              sortedDownloadFiles={sortedDownloadFiles}
              resetDownloadedFileFormat={resetDownloadedFileFormat}
              discardDownloadedFile={discardDownloadedFile}
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
          onClick={needPassword ? onReDownload : onDownload}
          isDisabled={
            needPassword ? !isAllPasswordFilesSorted : checkedLength === 0
          }
          scale
        />
        <Button
          key="CancelButton"
          className="cancel-button"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DownloadDialog;
