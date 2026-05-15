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
import type { TColorScheme } from "@docspace/ui-kit/providers/theme";
import type { ButtonSize } from "@docspace/ui-kit/components/button";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
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
	isFreeBackupsLimitReached?: boolean;
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
	errorInformation: string | React.ReactNode;

	setIsBackupProgressVisible: (visible: boolean) => void;

	backupProgressError: string;
	setBackupProgressError: (error: string) => void;

	backupProgressWarning: string;
	setBackupProgressWarning: (warning: string) => void;

	isFormReady: () => boolean;
	clearLocalStorage: VoidFunction;

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
	isPayer?: boolean;
	walletCustomerEmail?: string | null;
	// end currentTariffStatusStore

	isBackupPaid?: boolean;
	maxFreeBackups?: number;

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

	isThirdPartyAvailable?: boolean;
	backupServicePrice?: number;
}
