/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { ButtonSize } from "@docspace/ui-kit/components/button";
import type { TColorScheme } from "@docspace/ui-kit/providers/theme";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type { TStorageBackup } from "../../../api/settings/types";
import type { TThirdParties } from "../../../api/files/types";

export interface AutomaticBackupProps {
	isManagement?: boolean;
	isBackupPaid?: boolean;

	isInitialLoading: boolean;
	isEmptyContentBeforeLoader: boolean;
	settingsFileSelector: FilesSelectorSettings;
	buttonSize?: ButtonSize;
	removeItem: ThirdPartyAccountType;
	isNeedFilePath?: boolean;
	isInitialError: boolean;
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

	setErrorInformation: (error: unknown, t: TTranslation) => void;

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

	backupProgressWarning: string;
	setBackupProgressWarning: (warning: string) => void;

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

	setDefaultFolderId?: (id: string | number | null) => void;
}
