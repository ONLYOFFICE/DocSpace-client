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

"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files";
import { DeviceType } from "@docspace/shared/enums";

import { SelectFolderDialogProps } from "@/types";
import { TSelectorCancelButton } from "@docspace/shared/components/selector/Selector.types";

const SelectFolderDialog = ({
  onSubmit,
  onClose,
  isVisible,
  titleSelectorFolder,
  fileInfo,
  getIsDisabled,
  filesSettings,

  fileSaveAsExtension,
  organizationName,
  selectedFolderId,
}: SelectFolderDialogProps) => {
  const { t } = useTranslation(["Common", "Editor"]);
  // const sessionPath = sessionStorage.getItem("filesSelectorPath");

  const cancelButtonProps: TSelectorCancelButton = {
    withCancelButton: true,
    onCancel: onClose,
    cancelButtonLabel: t("Common:CancelButton"),
    cancelButtonId: "select-file-modal-cancel",
  };

  const withFooterCheckbox =
    fileSaveAsExtension !== "zip" && fileInfo.fileExst !== "fb2";

  const formProps = useMemo(() => {
    return {
      message: t("Common:WarningCopyToFormRoom", {
        organizationName,
      }),
      isRoomFormAccessible:
        Boolean(fileInfo.isForm) && fileSaveAsExtension === "pdf",
    };
  }, [fileInfo.isForm, t, fileSaveAsExtension, organizationName]);

  return (
    <FilesSelectorWrapper
      filesSettings={filesSettings}
      {...cancelButtonProps}
      withHeader
      headerProps={{
        headerLabel: t("Common:SaveButton"),
        onCloseClick: onClose,
      }}
      withBreadCrumbs
      withSearch
      withoutBackButton
      withCancelButton
      disabledItems={[]}
      onSubmit={onSubmit}
      submitButtonLabel={t("Common:SaveHereButton")}
      submitButtonId="select-file-modal-submit"
      footerInputHeader={t("Common:FileName")}
      currentFooterInputValue={titleSelectorFolder}
      footerCheckboxLabel={t("Common:OpenSavedDocument")}
      isPanelVisible={isVisible}
      isRoomsOnly={false}
      isThirdParty={false}
      currentFolderId={selectedFolderId!}
      rootFolderType={fileInfo.rootFolderType}
      embedded={false}
      withFooterInput
      withFooterCheckbox={withFooterCheckbox}
      descriptionText=""
      currentDeviceType={DeviceType.desktop}
      getFilesArchiveError={() => ""}
      parentId={0}
      getIsDisabled={getIsDisabled}
      withCreate
      formProps={formProps}
    />
  );
};

export default SelectFolderDialog;
