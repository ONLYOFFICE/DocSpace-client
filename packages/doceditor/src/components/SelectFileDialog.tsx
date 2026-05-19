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

import React from "react";
import { useTranslation } from "react-i18next";

import FilesSelectorWrapper from "@docspace/ui-kit/selectors/Files";
import type { SdkFolderType } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import { DeviceType, FilesSelectorFilterTypes } from "@docspace/shared/enums";

import { SelectFileDialogProps } from "@/types";

const SelectFileDialog = ({
  fileTypeDetection,
  getIsDisabled,
  isVisible,
  onClose,
  onSubmit,
  fileInfo,
  filesSettings,
  shareKey,
  selectedFolderId,
}: SelectFileDialogProps) => {
  const { t } = useTranslation();

  // const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const headerLabel = fileTypeDetection.filterParam
    ? (t?.("Common:SelectFile") ?? "")
    : (t?.("Common:SelectAction") ?? "");

  const getFileTypeTranslation = React.useCallback(() => {
    switch (fileTypeDetection.filterParam) {
      case FilesSelectorFilterTypes.XLSX:
        return t?.("Editor:MailMergeFileType") ?? "";
      case FilesSelectorFilterTypes.IMG:
        return t?.("Editor:ImageFileType") ?? "";
      case FilesSelectorFilterTypes.DOCX:
        return t?.("Editor:DocumentsFileType") ?? "";
      default:
        return "";
    }
  }, [fileTypeDetection.filterParam, t]);

  const selectFilesListTitle = React.useCallback(() => {
    const type = getFileTypeTranslation();
    return fileTypeDetection.filterParam === FilesSelectorFilterTypes.XLSX
      ? type
      : t
        ? t("Editor:SelectFilesType", { fileType: type })
        : "";
  }, [fileTypeDetection.filterParam, getFileTypeTranslation, t]);

  const listTitle = selectFilesListTitle();

  const openRoot = Boolean(shareKey);

  return (
    <FilesSelectorWrapper
      filesSettings={filesSettings}
      withoutBackButton
      withSearch
      withBreadCrumbs
      disabledItems={[]}
      isPanelVisible={isVisible}
      onCancel={onClose}
      onSubmit={onSubmit}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={openRoot ? "" : selectedFolderId!}
      rootFolderType={fileInfo.rootFolderType as SdkFolderType}
      withHeader
      headerProps={{ headerLabel, onCloseClick: onClose }}
      embedded={false}
      withFooterInput={false}
      withFooterCheckbox={false}
      footerCheckboxLabel=""
      footerInputHeader=""
      currentFooterInputValue=""
      submitButtonLabel={t?.("Common:SelectAction") ?? ""}
      cancelButtonLabel={t?.("Common:CancelButton") ?? ""}
      withCancelButton
      descriptionText={listTitle}
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
      submitButtonId="select-file-modal-submit"
      cancelButtonId="select-file-modal-cancel"
      {...fileTypeDetection}
      withCreate={false}
      shareKey={shareKey}
      openRoot={openRoot}
      withRecentTreeFolder
      withFavoritesTreeFolder
      withAIAgentsTreeFolder
    />
  );
};

export default SelectFileDialog;
