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
import type { ButtonSize } from "@docspace/ui-kit/components/button";
import type { TenantStatus } from "../../../enums";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type { TThirdParties, TUploadBackup } from "../../../api/files/types";

export interface RestoreBackupProps {
	removeItem: ThirdPartyAccountType;
	buttonSize: ButtonSize;
	isEnableRestore: boolean;
	navigate: (path: string) => void;
	settingsFileSelector: FilesSelectorSettings;
	isInitialLoading: boolean;
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
