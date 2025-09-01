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
import type { TBackupSchedule } from "../../../api/portal/types";
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  SelectedStorageType,
  StorageRegionsType,
  ThirdPartyAccountType,
  TTranslation,
  Option,
  TWeekdaysLabel,
} from "../../../types";
import type { TOption } from "../../../components/combobox";
import type { ButtonSize } from "../../../components/button";
import type { TColorScheme } from "../../../themes";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "../../../components/selector/Selector.types";
import type { TStorageBackup } from "../../../api/settings/types";
import type { TThirdParties } from "../../../api/files/types";

export interface AutomaticBackupProps {
  isManagement?: boolean;

  isInitialLoading?: boolean;
  isEmptyContentBeforeLoader?: boolean;
  settingsFileSelector: FilesSelectorSettings;
  buttonSize?: ButtonSize;
  removeItem: ThirdPartyAccountType;
  isNeedFilePath?: boolean;
  isInitialError?: boolean;
  isEnableAuto: boolean; //  checkEnablePortalSettings(isRestoreAndAutoBackupAvailable);

  // authStore
  language: string;
  // end authStore

  // backup store
  setDefaultOptions: (
    periodObj: TOption[],
    weekdayArr: TOption[],
    backupSchedule?: TBackupSchedule,
  ) => void;
  setDownloadingProgress: (progress: number) => void;
  setTemporaryLink: (link: string) => void;
  setThirdPartyStorage: (list: TStorageBackup[]) => void;
  setBackupSchedule: (list: TBackupSchedule) => void;

  setErrorInformation?: (error: unknown, t: TTranslation) => void;

  setConnectedThirdPartyAccount: (
    account: Nullable<ConnectedThirdPartyAccountType>,
  ) => void;
  seStorageType: (type: string) => void;
  setSelectedEnableSchedule: VoidFunction;
  toDefault: VoidFunction;
  errorInformation: string;
  selectedStorageType: Nullable<string>;
  selectedFolderId: Nullable<number | string>;
  isFormReady: () => boolean;
  selectedMaxCopiesNumber: string;
  selectedPeriodNumber: string;
  selectedWeekday: Nullable<string>;
  selectedHour: string;
  selectedMonthDay: string;
  selectedStorageId: Nullable<string>;
  selectedEnableSchedule: boolean;

  setSelectedFolder: (id: string) => void;

  getStorageParams: (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: Nullable<string | number>,
    selectedStorageId?: string | null,
  ) => Option[];

  deleteSchedule: (weekdayArr: TWeekdaysLabel[]) => void;
  downloadingProgress: number;

  isBackupProgressVisible: boolean;
  setIsBackupProgressVisible: (visible: boolean) => void;

  backupProgressError: string;
  setBackupProgressError: (error: string) => void;

  isChanged: boolean;
  isThirdStorageChanged: boolean;
  defaultStorageType: Nullable<string>;
  defaultFolderId: Nullable<string>;
  connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
  selectedPeriodLabel: string;
  selectedWeekdayLabel: string;

  setMaxCopies: (option: TOption) => void;
  setPeriod: (option: TOption) => void;
  setWeekday: (option: TOption) => void;
  setMonthNumber: (option: TOption) => void;
  setTime: (option: TOption) => void;
  setStorageId: (id: Nullable<string>) => void;
  thirdPartyStorage: SelectedStorageType[];
  defaultStorageId: Nullable<string>;
  setCompletedFormFields: (
    values: Record<string, string>,
    module?: string,
  ) => void;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  formSettings: Record<string, string>;
  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  storageRegions: StorageRegionsType[];
  defaultRegion: string; // defaultFormSettings.region;
  deleteValueFormSetting: (key: string) => void;
  clearLocalStorage: VoidFunction;
  setSelectedThirdPartyAccount: (
    elem: Nullable<Partial<ThirdPartyAccountType>>,
  ) => void;
  isTheSameThirdPartyAccount: boolean;
  selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
  accounts: ThirdPartyAccountType[];
  setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
  // end backup

  // settingsStore
  automaticBackupUrl?: string;
  currentColorScheme?: TColorScheme;
  // emd settingsStore

  // filesSelectorInput store
  basePath: string;
  newPath: string;
  resetNewFolderPath: VoidFunction;
  updateBaseFolderPath: VoidFunction;
  toDefaultFileSelector: VoidFunction; // toDefault from filesSelectorInput store
  isErrorPath: boolean;
  setBasePath: (folders: TBreadCrumb[]) => void;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
  // end filesSelectorInput

  // filesSettingsStore.thirdPartyStore
  openConnectWindow: (
    serviceName: string,
    modal: Window | null,
  ) => Promise<Window | null>;
  setThirdPartyProviders: (providers: TThirdParties) => void;
  providers: TThirdParties;
  deleteThirdParty: (id: string) => Promise<void>;
  // end filesSettingsStore.thirdPartyStore;

  // dialogsStore
  connectDialogVisible: boolean;
  deleteThirdPartyDialogVisible: boolean;
  setConnectDialogVisible: (visible: boolean) => void;
  setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
  // end dialogsStore
}
