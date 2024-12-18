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
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  ProviderType,
  SelectedStorageType,
  StorageRegionsType,
  ThirdPartyAccountType,
  TTranslation,
} from "@docspace/shared/types";
import type { TOption } from "@docspace/shared/components/combobox";
import type { FolderType } from "@docspace/shared/enums";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { ButtonSize } from "@docspace/shared/components/button";
import type { TColorScheme } from "@docspace/shared/themes";
import type { FilesSelectorSettings } from "@docspace/shared/components/files-selector-input";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";

export type Option = {
  key: string;
  value: string;
};

export interface AutomaticBackupProps {
  setDocumentTitle: (title: string) => void; // SRC_DIR/helpers/utils
  settingsFileSelector: FilesSelectorSettings;
  buttonSize?: ButtonSize;
  removeItem: ThirdPartyAccountType;
  isNeedFilePath?: boolean;

  isEnableAuto: boolean; // checkEnablePortalSettings(isRestoreAndAutoBackupAvailable);

  // authStore
  language: string;
  // end authStore

  // backup store
  setDefaultOptions: (
    t: TTranslation,
    periodObj: TOption[],
    weekdayArr: TOption[],
  ) => void;
  clearProgressInterval: VoidFunction;
  setThirdPartyStorage: (list: unknown) => void;
  setBackupSchedule: (list: unknown) => void;
  getProgress: (t: TTranslation) => Promise<void>;
  setStorageRegions: (regions: unknown) => void;
  setConnectedThirdPartyAccount: (
    account: Nullable<ConnectedThirdPartyAccountType>,
  ) => void;
  seStorageType: (type: string) => void;
  setSelectedEnableSchedule: VoidFunction;
  toDefault: VoidFunction;
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

  deleteSchedule: (weekdayArr: TOption[]) => void;
  downloadingProgress: number;

  isBackupProgressVisible: boolean;
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
  setStorageId: (id: string) => void;
  thirdPartyStorage: SelectedStorageType[];
  defaultStorageId: Nullable<string>;
  setCompletedFormFields: (
    values: Record<string, unknown>,
    module?: unknown,
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

  // treeFoldersStore Store
  rootFoldersTitles: Partial<Record<FolderType, { title: string }>>;
  fetchTreeFolders: () => Promise<TFolder[] | undefined>;
  // end treeFoldersStore

  // settingsStore
  automaticBackupUrl: string;
  currentColorScheme: Nullable<TColorScheme>;
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
  setThirdPartyProviders: (providers: ProviderType[]) => void;
  providers: ProviderType[];
  deleteThirdParty: (id: string) => Promise<void>;
  // end filesSettingsStore.thirdPartyStore;

  // dialogsStore
  connectDialogVisible: boolean;
  deleteThirdPartyDialogVisible: boolean;
  setConnectDialogVisible: (visible: boolean) => void;
  setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
  // end dialogsStore
}
