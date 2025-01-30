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

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import FilesSelector from "@docspace/shared/selectors/Files";
import { frameCallEvent } from "@docspace/shared/utils/common";
import { DeviceType, FolderType, RoomsType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import type { Nullable } from "@docspace/shared/types";
import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TFilesSelectorInit } from "@docspace/shared/selectors/Files/FilesSelector.types";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import useSDK from "@/hooks/useSDK";

type FilesSelectorClientProps = {
  baseConfig: {
    acceptLabel?: string;
    breadCrumbs?: boolean;
    cancel?: boolean;
    cancelLabel?: string;
    filter?: string;
    header?: boolean;
    id?: string;
    roomType?: RoomsType | RoomsType[] | null;
    search?: boolean;
    selectorType?: string;
    subtitle?: boolean;
  };
  breadCrumbs: TBreadCrumb[];
  currentFolderId: number | string;
  filesSettings: TFilesSettings;
  foldersTree: TFolder[];
  hasNextPage: boolean;
  items: (TFile | TFolder)[] | TRoom[];
  roomsFolderId?: number;
  rootFolderType: FolderType;
  searchValue: Nullable<string>;
  selectedItemId: string | number;
  selectedItemType: "rooms" | "files";
  total: number;
};

export default function FilesSelectorClient({
  baseConfig,
  breadCrumbs,
  currentFolderId,
  filesSettings,
  foldersTree,
  hasNextPage,
  items,
  roomsFolderId,
  rootFolderType,
  searchValue,
  selectedItemId,
  selectedItemType,
  total,
}: FilesSelectorClientProps) {
  const { sdkConfig } = useSDK();

  const { t } = useTranslation(["Common"]);

  useDocumentTitle("FileSelector");

  const onSubmit = useCallback(() => {}, []);

  const onCancel = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
    // DON`N REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
    console.log("onCloseCallback");
  }, []);

  const getIsDisabled = useCallback(() => false, []);

  const getFilesArchiveError = useCallback(() => "", []);

  const initProps: TFilesSelectorInit = {
    initBreadCrumbs: breadCrumbs,
    initHasNextPage: hasNextPage,
    initItems: items,
    initSearchValue: searchValue,
    initSelectedItemId: selectedItemId,
    initSelectedItemType: selectedItemType,
    initTotal: total,
    withInit: true,
  };

  const roomTypeProps = baseConfig?.roomType
    ? { roomType: baseConfig.roomType }
    : {};

  const headerProps = baseConfig?.header
    ? {
        withHeader: true as true,
        headerProps: {
          headerLabel: t("SelectAction"),
          isCloseable: false,
          onCloseClick: onCancel,
        },
      }
    : {};

  const {
    acceptLabel,
    breadCrumbs: showBreadCrumbs,
    cancel,
    cancelLabel,
    filter,
    search,
    selectorType,
    subtitle,
  } = baseConfig;

  const selectorProps = {
    cancelButtonLabel: cancelLabel || t("CancelButton"),
    currentDeviceType: DeviceType.desktop,
    currentFolderId,
    currentFooterInputValue: "",
    descriptionText: !subtitle || !filter || filter === "ALL" ? "" : filter,
    disabledItems: [],
    embedded: true,
    filesSettings,
    footerCheckboxLabel: "",
    footerInputHeader: "",
    getFilesArchiveError,
    isPanelVisible: true,
    isRoomsOnly: selectorType === "roomsOnly",
    isThirdParty: false,
    roomsFolderId,
    rootFolderType,
    submitButtonLabel: acceptLabel || t("SelectAction"),
    treeFolders: foldersTree,
    withBreadCrumbs: showBreadCrumbs as boolean,
    withCancelButton: cancel as boolean,
    withCreate: false,
    withFooterCheckbox: false,
    withFooterInput: false,
    withoutBackButton: true,
    withSearch: search as boolean,
  };

  const newProps = {
    ...headerProps,
    ...initProps,
    ...roomTypeProps,
    ...selectorProps,
  };

  return (
    <FilesSelector
      {...newProps}
      getIsDisabled={getIsDisabled}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}
