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

"use client";

import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import FilesSelectorComponent from "@docspace/shared/selectors/Files";
import { frameCallCommand } from "@docspace/shared/utils/common";
import {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { Nullable } from "@docspace/shared/types";
import { TFilesSelectorInit } from "@docspace/shared/selectors/Files/FilesSelector.types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type FilesSelectorClientProps = {
  items: (TFile | TFolder)[] | TRoom[];
  breadCrumbs: TBreadCrumb[];
  foldersTree: TFolder[];
  filesSettings: TFilesSettings;
  selectedItemType: "rooms" | "files";
  selectedItemId: string | number;
  searchValue: Nullable<string>;
  total: number;
  hasNextPage: boolean;
  currentFolderId: number | string;
  rootFolderType: FolderType;
  roomsFolderId?: number;
};

export default function FilesSelectorClient({
  items,
  breadCrumbs,
  foldersTree,
  filesSettings,
  selectedItemType,
  selectedItemId,
  searchValue,
  total,
  hasNextPage,
  rootFolderType,
  currentFolderId,
  roomsFolderId,
}: FilesSelectorClientProps) {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("JavascriptSdk:FileSelector");

  useEffect(() => frameCallCommand("setIsLoaded"), []);

  const onSubmit = useCallback(() => {}, []);

  const onCancel = useCallback(() => {}, []);

  const getIsDisabled = useCallback(() => false, []);

  const initValues: TFilesSelectorInit = {
    withInit: true,
    initItems: items,
    initBreadCrumbs: breadCrumbs,
    initSelectedItemType: selectedItemType,
    initSelectedItemId: selectedItemId,
    initSearchValue: searchValue,
    initTotal: total,
    initHasNextPage: hasNextPage,
  };

  return (
    <FilesSelectorComponent
      withBreadCrumbs
      withoutBackButton
      withSearch
      withHeader
      headerLabel="Label"
      cancelButtonLabel={t("Common:Cancel")}
      disabledItems={[]}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isRoomsOnly={false}
      isThirdParty={false}
      getIsDisabled={getIsDisabled}
      submitButtonLabel="Submit"
      withCancelButton={false}
      withCreate={true}
      withFooterInput={false}
      withFooterCheckbox={false}
      footerInputHeader=""
      footerCheckboxLabel=""
      currentFooterInputValue=""
      isPanelVisible
      headerProps={{
        headerLabel: "",
        isCloseable: false,
        onCloseClick: onCancel,
      }}
      filesSettings={filesSettings}
      treeFolders={foldersTree}
      currentDeviceType={DeviceType.desktop}
      currentFolderId={currentFolderId}
      rootFolderType={rootFolderType}
      descriptionText=""
      getFilesArchiveError={() => ""}
      embedded
      roomsFolderId={roomsFolderId}
      {...initValues}
    />
  );
}
