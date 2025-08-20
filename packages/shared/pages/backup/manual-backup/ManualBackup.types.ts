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

import type { TThirdParties } from "../../../api/files/types";
import type { DeviceType } from "../../../enums";
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  SelectedStorageType,
  StorageRegionsType,
  ThirdPartyAccountType,
  TTranslation,
} from "../../../types";
import type { TColorScheme } from "../../../themes";
import type { ButtonSize } from "../../../components/button";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "../../../components/selector/Selector.types";
import {
  DOCUMENTS,
  TEMPORARY_STORAGE,
  THIRD_PARTY_RESOURCE,
  THIRD_PARTY_STORAGE,
} from "./ManualBackup.constants";

type StorageParamsType = {
  key: string;
  value: string;
};

export type TStorageType =
  | typeof DOCUMENTS
  | typeof THIRD_PARTY_RESOURCE
  | typeof TEMPORARY_STORAGE
  | typeof THIRD_PARTY_STORAGE;

export interface ManualBackupProps {
  isManagement?: boolean;
  maxWidth?: string;
  buttonSize?: ButtonSize;
  isNeedFilePath?: boolean;
  isInitialLoading: boolean;
  settingsFileSelector: FilesSelectorSettings;
  isEmptyContentBeforeLoader: boolean;

  // backup store
  isValidForm?: boolean;
  defaultRegion: string; //  defaultFormSettings.region;
  downloadingProgress: number;
  temporaryLink: Nullable<string>;
  accounts: ThirdPartyAccountType[];
  isBackupProgressVisible?: boolean;
  isTheSameThirdPartyAccount: boolean;
  storageRegions: StorageRegionsType[];
  formSettings: Record<string, string>;
  thirdPartyStorage: SelectedStorageType[];
  errorsFieldsBeforeSafe: Record<string, boolean>;
  selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
  connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
  errorInformation: string;

  setIsBackupProgressVisible: (visible: boolean) => void;

  backupProgressError: string;
  setBackupProgressError: (error: string) => void;

  isFormReady: () => boolean;
  clearLocalStorage: VoidFunction;
  setErrorInformation: (error: unknown, t?: TTranslation) => void;
  setTemporaryLink: (link: string) => void;
  deleteValueFormSetting: (key: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  setDownloadingProgress: (progress: number) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
  addValueInFormSettings: (name: string, value: string) => void;
  setSelectedThirdPartyAccount: (
    elem: Nullable<Partial<ThirdPartyAccountType>>,
  ) => void;
  getStorageParams: (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: string | number,
    selectedStorageId?: string,
  ) => StorageParamsType[];
  saveToLocalStorage: (
    isStorage: boolean,
    moduleName: string,
    selectedId: string | number | undefined,
    selectedStorageTitle?: string,
  ) => void;
  setConnectedThirdPartyAccount: (
    account: Nullable<ConnectedThirdPartyAccountType>,
  ) => void;
  setCompletedFormFields: (
    values: Record<string, string>,
    module?: string,
  ) => void;
  // end back store

  // filesSelectorInput Store
  newPath: string;
  basePath: string;
  isErrorPath: boolean;
  toDefault: VoidFunction;
  setBasePath: (folders: TBreadCrumb[]) => void;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
  // end filesSelectorInput

  // SettingsStore store
  dataBackupUrl: string;
  pageIsDisabled: boolean; //  isManagement() && portals?.length === 1;
  currentDeviceType?: DeviceType;
  currentColorScheme?: TColorScheme;
  // end SettingsStore

  // dialogsStore Store
  connectDialogVisible: boolean;
  deleteThirdPartyDialogVisible: boolean;
  setConnectDialogVisible: (visible: boolean) => void;
  setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
  // end dialogsStore

  // currentTariffStatusStore Store
  isNotPaidPeriod: boolean;
  // end currentTariffStatusStore

  // selectedThirdPartyAccount from backupStore
  // removeItem from dialogsStore
  removeItem: ThirdPartyAccountType; // selectedThirdPartyAccount ?? removeItem

  // thirdPartyStore store
  providers: TThirdParties;
  deleteThirdParty: (id: string) => Promise<void>;
  setThirdPartyProviders: (providers: TThirdParties) => void;
  openConnectWindow: (
    serviceName: string,
    modal: Window | null,
  ) => Promise<Window | null>;
  // end thirdPartyStore
}
