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

import type { TFolder } from "api/files/types";
import type { FolderType } from "../../enums";
import type { Nullable, TTranslation } from "../../types";
import type { TColorScheme } from "../../themes";
import type { ButtonSize } from "../../components/button";

type StorageParamsType = {
  key: string;
  value: string;
};

export interface ManualBackupProps {
  isNotPaidPeriod: boolean;
  rootFoldersTitles: Partial<Record<FolderType, { title: string }>>;
  temporaryLink: Nullable<string>;
  downloadingProgress: number;
  pageIsDisabled: boolean;

  dataBackupUrl: string;
  currentColorScheme: TColorScheme;
  buttonSize?: ButtonSize;

  saveToLocalStorage: (
    isStorage: boolean,
    moduleName: string,
    selectedId: string | number | undefined,
    selectedStorageTitle?: string,
  ) => void;
  getStorageParams: (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: string | number,
    selectedStorageId?: string,
  ) => StorageParamsType[];

  setDocumentTitle: (title: string) => void;
  setTemporaryLink: (link: string) => void;
  setDownloadingProgress: (progress: number) => void;
  getIntervalProgress: (t: TTranslation) => void;
  clearLocalStorage: VoidFunction;
  clearProgressInterval: VoidFunction;
  fetchTreeFolders: () => Promise<TFolder[] | undefined>;
  getProgress: (t: TTranslation) => Promise<void>;
  setThirdPartyStorage: (list: unknown) => void;
  setStorageRegions: (regions: unknown) => void;
  setConnectedThirdPartyAccount: (account: unknown) => void;
}

export interface StyledModulesProps {
  isDisabled?: boolean;
}