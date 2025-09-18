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
import { useTranslation } from "react-i18next";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files";

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
      rootFolderType={fileInfo.rootFolderType}
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
    />
  );
};

export default SelectFileDialog;
