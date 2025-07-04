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

import React, { useCallback, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";
import { Trans, useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { Text } from "../../components/text";
import { Button, ButtonSize } from "../../components/button";
import { toastr } from "../../components/toast";
import type { TContextMenuValueTypeOnClick } from "../../components/context-menu/ContextMenu.types";

import { DownloadContent } from "./sub-components/DownloadContent";
import { PasswordContent } from "./sub-components/PasswordContent";
import { OnePasswordRow } from "./sub-components/OnePasswordRow";
import {
  type DownloadDialogProps,
  isFile,
  type TDownloadedFile,
  type TSortedFiles,
} from "./DownloadDialog.types";
import { DownloadedDocumentType } from "./DownloadDialog.enums";
import styles from "./DownloadDialog.module.scss";

const LoadingPlaceholder = () => <div style={{ width: "96px" }} />;

const getInitialState = (sortedFiles: TSortedFiles) => {
  return {
    documents: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.documents,
    },
    spreadsheets: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.spreadsheets,
    },
    presentations: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.presentations,
    },
    masterForms: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.masterForms,
    },
    pdfForms: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.pdfForms,
    },
    diagrams: {
      isChecked: true,
      isIndeterminate: false,
      format: null,
      files: sortedFiles.diagrams,
    },
    other: {
      isChecked: true,
      isIndeterminate: false,
      format: null as string | null,
      files: sortedFiles.other,
    },
  };
};

const DownloadDialog = (props: DownloadDialogProps) => {
  const {
    sortedFiles,
    setDownloadItems,
    downloadItems,
    downloadFiles,
    getDownloadItems,
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
  const { t } = useTranslation(["Common"]);

  const isAllPasswordFilesSorted = sortedDownloadFiles.other?.length === 0;
  const needPassword = sortedPasswordFiles?.length > 0;
  const isLastItemSorted =
    sortedDownloadFiles?.remove?.length === 1 && downloadItems?.length === 1;
  const isOnePasswordFile = !isLastItemSorted && downloadItems?.length === 1;

  const getErrorsTranslation = useCallback(() => {
    const passwordError = (
      <Trans
        t={t}
        ns="Common"
        i18nKey="PasswordProtectedFiles"
        components={{ 1: <span /> }}
      />
    );
    const translations = {
      label: t("Common:ArchivingData"),
      error: t("Common:ErrorInternalServer"),
      passwordError,
    };

    return translations;
  }, [t]);

  const onClose = useCallback(() => {
    setSortedPasswordFiles({
      other: [],
      password: [],
      remove: [],
      original: [],
    });

    setDownloadDialogVisible(false);
  }, [setDownloadDialogVisible, setSortedPasswordFiles]);

  const onDownloadFunction = useCallback(
    (itemList?: TDownloadedFile[]) => {
      const files = itemList ?? downloadItems;
      const [fileConvertIds, folderIds] = getDownloadItems(files, t);
      downloadFiles(fileConvertIds, folderIds, getErrorsTranslation());
      onClose();
    },
    [
      downloadFiles,
      downloadItems,
      getDownloadItems,
      getErrorsTranslation,
      onClose,
      t,
    ],
  );

  const onDownload = useCallback(() => {
    const {
      documents,
      spreadsheets,
      presentations,
      masterForms,
      other,
      pdfForms,
      diagrams,
    } = state;

    const itemList = [
      ...documents.files,
      ...spreadsheets.files,
      ...presentations.files,
      ...masterForms.files,
      ...pdfForms.files,
      ...diagrams.files,
      ...other.files,
    ];

    if (itemList.length) {
      setDownloadItems(itemList);
      onDownloadFunction(itemList);
    }
  }, [onDownloadFunction, setDownloadItems, state]);

  const onReDownload = useCallback(() => {
    if (downloadItems.length > 0 && isAllPasswordFilesSorted) {
      toastr.clear();
      onDownloadFunction();
    }
  }, [downloadItems.length, isAllPasswordFilesSorted, onDownloadFunction]);

  const getNewArrayFiles = (
    fileId: number,
    array: TDownloadedFile[],
    format: string,
  ) => {
    // Set all documents format
    if (!fileId) {
      array.forEach((file) => {
        file.format =
          format === t("Common:CustomFormat") ||
          (isFile(file) && file.fileExst === format)
            ? t("Common:OriginalFormat")
            : format;
      });
      return array;
    }
    // Set single document format
    const newDoc = array.find((x) => x.id === fileId);

    if (newDoc && newDoc.format !== format) {
      newDoc.format = format;
    }
    return array;
  };

  const onSelectFormat = (e: TContextMenuValueTypeOnClick) => {
    if (!("currentTarget" in e)) return;
    if (!("dataset" in e.currentTarget)) return;

    const { format, type, fileId } = e.currentTarget.dataset as unknown as {
      format: string;
      type: DownloadedDocumentType;
      fileId: string;
    };
    const { files } = state[type];

    setState((prevState) => {
      const newState = { ...prevState };
      newState[type].files = getNewArrayFiles(+fileId, files, format);
      newState[type].format = !fileId ? format : t("Common:CustomFormat");

      const index = newState[type].files.findIndex(
        (f) => f.format && f.format !== t("Common:OriginalFormat"),
      );

      if (index === -1) {
        newState[type].format = t("Common:OriginalFormat");
      }

      return newState;
    });
  };

  const updateDocsState = (
    fieldStateName: DownloadedDocumentType,
    itemId: number | "All",
  ) => {
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

      if (file) {
        file.checked = !file.checked;
      }

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

  const onRowSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { itemId, type } = e.currentTarget.dataset as unknown as {
      itemId: number | "All";
      type: DownloadedDocumentType;
    };

    let id = itemId;

    if (id !== "All") {
      id = +id;
    }

    switch (type) {
      case "documents":
        updateDocsState(DownloadedDocumentType.Documents, id);
        break;
      case "spreadsheets":
        updateDocsState(DownloadedDocumentType.Spreadsheets, id);
        break;
      case "presentations":
        updateDocsState(DownloadedDocumentType.Presentations, id);
        break;
      case "masterForms":
        updateDocsState(DownloadedDocumentType.MasterForms, id);
        break;
      case "pdfForms":
        updateDocsState(DownloadedDocumentType.PdfForms, id);
        break;
      case "diagrams":
        updateDocsState(DownloadedDocumentType.Diagrams, id);
        break;
      case "other":
        updateDocsState(DownloadedDocumentType.Other, id);
        break;
      default:
        break;
    }
  };

  const getCheckedFileLength = useCallback(() => {
    const {
      documents,
      spreadsheets,
      presentations,
      masterForms,
      other,
      pdfForms,
      diagrams,
    } = state;

    return (
      documents.files.filter((f) => f.checked).length +
      spreadsheets.files.filter((f) => f.checked).length +
      presentations.files.filter((f) => f.checked).length +
      masterForms.files.filter((f) => f.checked).length +
      pdfForms.files.filter((f) => f.checked).length +
      diagrams.files.filter((f) => f.checked).length +
      other.files.filter((f) => f.checked).length
    );
  }, [state]);

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && needPassword) {
        if (!isAllPasswordFilesSorted) return;

        onReDownload();
        return;
      }

      if (event.key === "Enter" && getCheckedFileLength() > 0) {
        onDownload();
      }
    },
    [
      getCheckedFileLength,
      isAllPasswordFilesSorted,
      needPassword,
      onDownload,
      onReDownload,
    ],
  );

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

  const getItemIcon = (item: TDownloadedFile) => {
    const extension = "fileExst" in item && item?.fileExst;
    const icon = extension ? getIcon(32, extension) : getFolderIcon(32);

    return (
      <ReactSVG
        beforeInjection={(svg) => {
          svg.setAttribute(
            "style",
            "margin-top: 4px; margin-inline-end: 12px;",
          );
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

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  const mainContent = (
    <>
      <div className={styles.downloadDialogBodyContent}>
        <Text noSelect>{t("Common:ChooseFormatText")}.</Text>
        {!isSingleFile ? (
          <Text noSelect>
            <Trans t={t} ns="Common" i18nKey="ConvertToZip" />
          </Text>
        ) : null}
      </div>
      {state.documents.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.documents.isChecked}
          isIndeterminate={state.documents.isIndeterminate}
          items={state.documents.files}
          titleFormat={state.documents.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.Documents}
          title={t("Common:Documents")}
        />
      ) : null}
      {state.spreadsheets.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.spreadsheets.isChecked}
          isIndeterminate={state.spreadsheets.isIndeterminate}
          items={state.spreadsheets.files}
          titleFormat={state.spreadsheets.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.Spreadsheets}
          title={t("Common:Spreadsheets")}
        />
      ) : null}
      {state.presentations.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.presentations.isChecked}
          isIndeterminate={state.presentations.isIndeterminate}
          items={state.presentations.files}
          titleFormat={state.presentations.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.Presentations}
          title={t("Common:Presentations")}
        />
      ) : null}
      {state.masterForms.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.masterForms.isChecked}
          isIndeterminate={state.masterForms.isIndeterminate}
          items={state.masterForms.files}
          titleFormat={state.masterForms.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.MasterForms}
          title={t("Common:FormTemplates")}
        />
      ) : null}
      {state.pdfForms.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.pdfForms.isChecked}
          isIndeterminate={state.pdfForms.isIndeterminate}
          items={state.pdfForms.files}
          titleFormat={state.pdfForms.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.PdfForms}
          title={t("Common:Forms")}
        />
      ) : null}
      {state.diagrams.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.diagrams.isChecked}
          isIndeterminate={state.diagrams.isIndeterminate}
          items={state.diagrams.files}
          titleFormat={state.diagrams.format || t("Common:OriginalFormat")}
          type={DownloadedDocumentType.Diagrams}
          title={t("Common:Diagrams")}
        />
      ) : null}
      {state.other.files.length > 0 ? (
        <DownloadContent
          {...downloadContentProps}
          isChecked={state.other.isChecked}
          isIndeterminate={state.other.isIndeterminate}
          items={state.other.files}
          type={DownloadedDocumentType.Other}
          title={t("Common:Other")}
        />
      ) : null}
      <div className={styles.downloadDialogConvertMessage}>
        <Text noSelect>{t("Common:ConvertMessage")}</Text>
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
        downloadItems={downloadItems}
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
      withBodyScroll
      withoutPadding
    >
      <ModalDialog.Header>{t("Common:DownloadAs")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.modalBody}>
          {needPassword ? (
            <PasswordContent
              getItemIcon={getItemIcon}
              updateDownloadedFilePassword={updateDownloadedFilePassword}
              sortedDownloadFiles={sortedDownloadFiles}
              resetDownloadedFileFormat={resetDownloadedFileFormat}
              discardDownloadedFile={discardDownloadedFile}
            />
          ) : (
            mainContent
          )}
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          key="DownloadButton"
          label={
            needPassword ? t("Common:ContinueButton") : t("Common:Download")
          }
          size={ButtonSize.normal}
          primary
          onClick={needPassword ? onReDownload : onDownload}
          isDisabled={
            needPassword ? !isAllPasswordFilesSorted : checkedLength === 0
          }
          scale
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DownloadDialog;
