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

import type { TBreadCrumb } from "../selector/Selector.types";
import type { FilesSelectorProps } from "../../selectors/Files/FilesSelector.types";
import type { TGetIcon } from "../../selectors/utils/types";
import type { TFilesSettings } from "../../api/files/types";
import type { DeviceType } from "../../enums";
import type { BackupToPublicRoomOptionType } from "../../types";

export type FileInfoType = {
  id: string | number;
  title: string;
  path?: string[];
  fileExst?: string;
  inPublic?: boolean;
};

export type FilesSelectorSettings =
  | {
      getIcon: TGetIcon;
      filesSettings?: TFilesSettings;
    }
  | { getIcon?: never; filesSettings: TFilesSettings };

export type FilesSelectorInputProps = {
  newPath: string;
  basePath: string;
  isErrorPath: boolean;

  currentDeviceType?: DeviceType;
  openRoot?: boolean;
  withCreate?: boolean;
  id?: string | number;
  isThirdParty?: boolean;
  isRoomsOnly?: boolean;
  checkCreating?: boolean;
  isSelectFolder?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  maxWidth?: string;
  className?: string;
  withoutInitPath?: boolean;
  rootThirdPartyId?: string;
  filterParam?: string;
  descriptionText?: string;
  isSelect?: boolean;
  isRoomBackup?: boolean;
  isDocumentIcon?: boolean;
  filesSelectorSettings: FilesSelectorSettings;
  formProps?: FilesSelectorProps["formProps"];
  dataTestId?: string;

  setBasePath: (folders: TBreadCrumb[]) => void;
  toDefault: VoidFunction;
  onSelectFolder?: (
    value: number | string | undefined,
    breadCrumbs: TBreadCrumb,
  ) => void;
  onSelectFile?: (fileInfo: FileInfoType, breadCrumbs?: TBreadCrumb[]) => void;

  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;

  setBackupToPublicRoomVisible?: (
    visible: boolean,
    options: BackupToPublicRoomOptionType,
  ) => void;
};
