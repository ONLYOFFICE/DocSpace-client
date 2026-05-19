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

"use client";

import React from "react";
import { observer } from "mobx-react";

import DownloadDialogComponent from "@docspace/shared/dialogs/download-dialog";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { useDownloadDialogData } from "@/app/(docspace)/_components/dialogs/components/download-dialog/hooks/useDownloadDialogData";

const DownloadDialog = () => {
  const { closeDialog, openDialog } = useDialogsStore();
  const {
    sortedFiles,
    sortedPasswordFiles,
    sortedDownloadFiles,
    downloadItems,
    extsConvertible,
    setDownloadItems,
    getDownloadItems,
    setSortedDownloadFiles,
    resetDownloadedFileFormat,
    updateDownloadedFilePassword,
    discardDownloadedFile,
    onDownload,
    getIcon,
    getFolderIcon,
  } = useDownloadDialogData();

  const setDialogVisible = (value: boolean) => {
    if (value) {
      openDialog(SDKDialogs.DownloadDialog);
    } else {
      closeDialog(SDKDialogs.DownloadDialog);
    }
  };

  return (
    <DownloadDialogComponent
      visible
      sortedFiles={sortedFiles}
      sortedPasswordFiles={sortedPasswordFiles}
      sortedDownloadFiles={sortedDownloadFiles}
      downloadItems={downloadItems}
      extsConvertible={extsConvertible}
      setDownloadItems={setDownloadItems}
      getDownloadItems={getDownloadItems}
      getIcon={getIcon}
      getFolderIcon={getFolderIcon}
      setDownloadDialogVisible={setDialogVisible}
      setSortedPasswordFiles={setSortedDownloadFiles}
      resetDownloadedFileFormat={resetDownloadedFileFormat}
      updateDownloadedFilePassword={updateDownloadedFilePassword}
      discardDownloadedFile={discardDownloadedFile}
      downloadFiles={onDownload}
    />
  );
};

export default observer(DownloadDialog);
