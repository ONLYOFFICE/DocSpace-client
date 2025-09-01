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

import {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import {
  TBreadCrumb,
  TSelectorHeader,
} from "@docspace/shared/components/selector/Selector.types";
import { DeviceType } from "@docspace/shared/enums";
import { TTheme } from "@docspace/shared/themes";

export type FilesSelectorProps = TSelectorHeader & {
  isPanelVisible: boolean;
  // withoutImmediatelyClose: boolean;
  isThirdParty: boolean;
  isSelectFolder: boolean;
  rootThirdPartyId?: string;
  isRoomsOnly: boolean;
  isUserOnly: boolean;
  isRoomBackup: boolean;
  isEditorDialog: boolean;
  currentDeviceType: DeviceType;
  setMoveToPublicRoomVisible: (visible: boolean, operationData: object) => void;
  setBackupToPublicRoomVisible: (visible: boolean, data: object) => void;
  getIcon: (size: number, fileExst: string) => string;

  onClose?: () => void;

  id?: string | number;
  withSearch: boolean;
  withBreadCrumbs: boolean;
  withSubtitle: boolean;
  withPadding?: boolean;

  isMove?: boolean;
  isCopy?: boolean;
  isRestore: boolean;
  isTemplate: boolean;
  isRestoreAll?: boolean;
  isSelect?: boolean;
  isFormRoom?: boolean;

  filterParam?: string;

  currentFolderId: number;
  fromFolderId?: number;
  parentId: number;
  rootFolderType: number;
  folderIsShared?: boolean;

  treeFolders?: TFolder[];

  theme: TTheme;

  selection: (TFolder | TFile)[];
  disabledItems: string[] | number[];
  setMoveToPanelVisible: (value: boolean) => void;
  setRestorePanelVisible: (value: boolean) => void;
  setCopyPanelVisible: (value: boolean) => void;
  setRestoreAllPanelVisible: (value: boolean) => void;
  setMovingInProgress: (value: boolean) => void;
  setIsDataReady?: (value: boolean) => void;
  setSelected: (selected: "close" | "none", clearBuffer?: boolean) => void;
  setConflictDialogData: (conflicts: unknown, operationData: unknown) => void;
  itemOperationToFolder: (operationData: unknown) => Promise<void>;
  clearActiveOperations: (
    folderIds: string[] | number[],
    fileIds: string[] | number[],
  ) => void;
  checkFileConflicts: (
    selectedItemId: string | number | undefined,
    folderIds: string[] | number[],
    fileIds: string[] | number[],
  ) => Promise<unknown>;

  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  onSetNewFolderPath?: (value: number | string | undefined) => void;
  onSelectFolder?: (
    value: number | string | undefined,
    breadCrumbs: TBreadCrumb[],
  ) => void;
  onSelectTreeNode?: (treeNode: TFolder) => void;
  onSave?: (
    e: unknown,
    folderId: string | number,
    fileTitle: string,
    openNewTab: boolean,
  ) => void;
  onSelectFile?: (
    fileInfo: {
      id: string | number;
      title: string;
      path?: string[];
      fileExst?: string;
      inPublic?: boolean;
    },
    breadCrumbs: TBreadCrumb[],
  ) => void;

  setInfoPanelIsMobileHidden: (arg: boolean) => void;

  withFooterInput: boolean;
  withFooterCheckbox: boolean;
  footerInputHeader?: string;
  currentFooterInputValue?: string;
  footerCheckboxLabel?: string;

  descriptionText?: string;
  setSelectedItems: () => void;

  includeFolder?: boolean;

  embedded: boolean;
  withHeader: boolean;
  withCancelButton: boolean;
  cancelButtonLabel: string;
  acceptButtonLabel: string;
  settings: unknown;

  roomsFolderId?: number;
  openRoot?: boolean;

  filesSettings: TFilesSettings;

  withCreate?: boolean;
  checkCreating?: boolean;
  logoText: string;
  isPortalView?: boolean;
  withoutDescriptionText?: boolean;
};
