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

import type { AxiosResponse } from "axios";
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  Option,
  SelectedStorageType,
  StorageRegionsType,
  ThirdPartyAccountType,
  TTranslation,
} from "../../../types";
import type { ButtonSize } from "../../../components/button";
import type { TenantStatus } from "../../../enums";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "../../../components/selector/Selector.types";
import type { TThirdParties, TUploadBackup } from "../../../api/files/types";

export interface RestoreBackupProps {
  removeItem: ThirdPartyAccountType;
  buttonSize: ButtonSize;
  isEnableRestore: boolean;
  navigate: (path: string) => void;
  settingsFileSelector: FilesSelectorSettings;
  //isInitialLoading: boolean;
  // settingsStore
  standalone: boolean;
  setTenantStatus: (tenantStatus: TenantStatus) => void;

  // backup
  errorInformation: string;
  isBackupProgressVisible: boolean;
  restoreResource: Nullable<File | number | string>;
  formSettings: Record<string, string>;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  thirdPartyStorage: SelectedStorageType[];
  storageRegions: StorageRegionsType[];
  defaultRegion: string; // defaultFormSettings.region;
  accounts: ThirdPartyAccountType[];
  selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
  isTheSameThirdPartyAccount: boolean;
  downloadingProgress: number;
  connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
  setErrorInformation: (error: unknown, t?: TTranslation) => void;
  setTemporaryLink: (link: string) => void;
  setDownloadingProgress: (progress: number) => void;
  setConnectedThirdPartyAccount: (
    account: Nullable<ConnectedThirdPartyAccountType>,
  ) => void;
  setRestoreResource: (resource: Nullable<File | string | number>) => void;
  clearLocalStorage: VoidFunction;
  setSelectedThirdPartyAccount: (
    elem: Nullable<Partial<ThirdPartyAccountType>>,
  ) => void;
  setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
  setCompletedFormFields: (
    values: Record<string, string>,
    module?: string,
  ) => void;
  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  deleteValueFormSetting: (key: string) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  isFormReady: () => boolean;
  getStorageParams: (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: Nullable<string | number>,
    selectedStorageId?: Nullable<string>,
  ) => Option[];
  uploadLocalFile: () => Promise<
    false | AxiosResponse<TUploadBackup> | undefined | null
  >;

  // filesSelectorInput store
  basePath: string;
  newPath: string;
  isErrorPath: boolean;
  toDefault: VoidFunction;
  setBasePath: (folders: TBreadCrumb[]) => void;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;

  // filesSettingsStore.thirdPartyStore;
  providers: TThirdParties;
  deleteThirdParty: (id: string) => Promise<void>;
  openConnectWindow: (
    serviceName: string,
    modal: Window | null,
  ) => Promise<Window | null>;
  setThirdPartyProviders: (providers: TThirdParties) => void;

  // dialogsStore
  connectDialogVisible: boolean;
  setConnectDialogVisible: (visible: boolean) => void;
  deleteThirdPartyDialogVisible: boolean;
  setDeleteThirdPartyDialogVisible: (visible: boolean) => void;

  setIsBackupProgressVisible: (visible: boolean) => void;

  backupProgressError: string;
  setBackupProgressError: (error: string) => void;
}
