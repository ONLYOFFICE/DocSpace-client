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

"use client";

import { observer } from "mobx-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import AutomaticBackup from "@docspace/shared/pages/backup/auto-backup";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import type { FilesSettingsDto } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";

import { useDefaultOptions } from "@docspace/shared/pages/backup/auto-backup/hooks";

import type {
	SettingsThirdPartyType,
	TFilesSettings,
} from "@docspace/shared/api/files/types";
import type {
	TBackupProgress,
	TBackupSchedule,
	TPaymentFeature,
	TStorageRegion,
} from "@docspace/shared/api/portal/types";

import type { TError } from "@docspace/shared/utils/axiosClient";
import type { ThirdPartyAccountType } from "@docspace/shared/types";
import type { TPortals } from "@docspace/shared/api/management/types";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";

import { useBackup } from "@/hooks/useBackup";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";
import { useStores } from "@/hooks/useStores";
import useAppState from "@/hooks/useAppState";
import { getAutomaticBackupUrl } from "@/lib";

interface AutoBackupProps {
	account: SettingsThirdPartyType | undefined;
	backupScheduleResponse: TBackupSchedule | undefined;
	backupStorageResponse: TStorageBackup[];
	newStorageRegions: TStorageRegion[];
	portals: TPortals[];
	features: TPaymentFeature[];
	filesSettings: TFilesSettings;
	backupProgress: TBackupProgress | TError | undefined;
}

const AutoBackup = ({
	account,
	backupScheduleResponse,
	backupStorageResponse,
	newStorageRegions,
	portals,
	features,
	filesSettings,
	backupProgress,
}: AutoBackupProps) => {
	const { t } = useTranslation(["Common"]);

	const { currentColorScheme } = useTheme();
	const { backupStore, spacesStore } = useStores();
	const { user, settings } = useAppState();

	const language = user?.cultureName || "en";

	const {
		accounts,
		toDefault,
		setErrorInformation,
		errorInformation,
		defaults,
		selected,

		isThirdStorageChanged,
		setIsThirdStorageChanged,
		setDefaultOptions,

		setDownloadingProgress,
		downloadingProgress,

		setTemporaryLink,

		setBackupSchedule,

		thirdPartyStorage,
		setThirdPartyStorage,

		connectedThirdPartyAccount,
		setConnectedThirdPartyAccount,

		setterSelectedEnableSchedule,

		errorsFieldsBeforeSafe,
		isFormReady,
		getStorageParams,
		deleteSchedule,
		isBackupProgressVisible,
		isChanged,
		setMaxCopies,
		setPeriod,
		setWeekday,
		setMonthNumber,
		setTime,
		setCompletedFormFields,
		addValueInFormSettings,
		setRequiredFormSettings,
		deleteValueFormSetting,
		clearLocalStorage,
		selectedThirdPartyAccount,
		setSelectedThirdPartyAccount,
		isTheSameThirdPartyAccount,
		setThirdPartyAccountsInfo,
		resetDownloadingProgress,
		seStorageType,
		setSelectedFolder,
		setStorageId,
		deleteThirdPartyDialogVisible,
		setDeleteThirdPartyDialogVisible,
		getProgress,
		deleteThirdParty,
		openConnectWindow,

		defaultRegion,
		checkEnablePortalSettings,

		backupProgressError,
		setBackupProgressError,
		setIsBackupProgressVisible,
		backupProgressWarning,
		setBackupProgressWarning,
	} = useBackup({
		account,
		backupScheduleResponse,
		backupStorageResponse,
		backupProgress,
		features,
	});

	const { periodsObject, weekdaysLabelArray } = useDefaultOptions(t, language);
	const {
		basePath,
		newPath,
		isErrorPath,
		setBasePath,
		setNewPath,
		toDefaultFileSelector,
		resetNewFolderPath,
		updateBaseFolderPath,
	} = useFilesSelectorInput();

	useUnmount(() => {
		resetDownloadingProgress();
	});

	useDidMount(() => {
		getProgress();
		setDefaultOptions(periodsObject, weekdaysLabelArray);
	});

	const automaticBackupUrl = useMemo(
		() => getAutomaticBackupUrl(settings),
		[settings],
	);

	const isEnableAuto = checkEnablePortalSettings(portals);

	return (
		<AutomaticBackup
			isManagement
			isInitialError={false}
			isInitialLoading={false}
			isEmptyContentBeforeLoader={false}
			settingsFileSelector={{
				filesSettings: filesSettings as unknown as FilesSettingsDto,
			}}
			removeItem={selectedThirdPartyAccount as ThirdPartyAccountType}
			language={language}
			// backup
			setDefaultOptions={setDefaultOptions}
			setDownloadingProgress={setDownloadingProgress}
			setTemporaryLink={setTemporaryLink}
			setThirdPartyStorage={setThirdPartyStorage}
			setBackupSchedule={setBackupSchedule}
			setErrorInformation={setErrorInformation}
			setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
			setStorageId={setStorageId}
			seStorageType={seStorageType}
			setSelectedFolder={setSelectedFolder}
			setSelectedEnableSchedule={setterSelectedEnableSchedule}
			toDefault={toDefault}
			errorInformation={errorInformation}
			selectedStorageType={selected.storageType}
			selectedFolderId={selected.folderId}
			isFormReady={isFormReady}
			selectedMaxCopiesNumber={selected.maxCopiesNumber}
			selectedPeriodNumber={selected.periodNumber}
			selectedWeekday={selected.weekday}
			selectedHour={selected.hour}
			selectedMonthDay={selected.monthDay}
			selectedStorageId={selected.storageId}
			selectedEnableSchedule={selected.enableSchedule}
			getStorageParams={getStorageParams}
			deleteSchedule={deleteSchedule}
			downloadingProgress={downloadingProgress}
			isBackupProgressVisible={isBackupProgressVisible}
			isChanged={isChanged}
			isThirdStorageChanged={isThirdStorageChanged}
			defaultStorageType={defaults.storageType}
			defaultFolderId={defaults.folderId}
			connectedThirdPartyAccount={connectedThirdPartyAccount}
			selectedPeriodLabel={selected.periodLabel}
			selectedWeekdayLabel={selected.weekdayLabel}
			setMaxCopies={setMaxCopies}
			setPeriod={setPeriod}
			setWeekday={setWeekday}
			setMonthNumber={setMonthNumber}
			setTime={setTime}
			thirdPartyStorage={thirdPartyStorage}
			defaultStorageId={defaults.storageId}
			setCompletedFormFields={setCompletedFormFields}
			errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
			formSettings={selected.formSettings}
			addValueInFormSettings={addValueInFormSettings}
			setRequiredFormSettings={setRequiredFormSettings}
			setIsThirdStorageChanged={setIsThirdStorageChanged}
			storageRegions={newStorageRegions}
			deleteValueFormSetting={deleteValueFormSetting}
			clearLocalStorage={clearLocalStorage}
			setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
			selectedThirdPartyAccount={
				selectedThirdPartyAccount as ThirdPartyAccountType
			}
			accounts={accounts}
			isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
			setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
			defaultRegion={defaultRegion}
			setIsBackupProgressVisible={setIsBackupProgressVisible}
			backupProgressError={backupProgressError}
			setBackupProgressError={setBackupProgressError}
			// settingsStore
			automaticBackupUrl={automaticBackupUrl}
			currentColorScheme={currentColorScheme}
			isEnableAuto={isEnableAuto}
			// filesSelectorInput
			basePath={basePath}
			newPath={newPath}
			resetNewFolderPath={resetNewFolderPath}
			updateBaseFolderPath={updateBaseFolderPath}
			toDefaultFileSelector={toDefaultFileSelector}
			isErrorPath={isErrorPath}
			setBasePath={setBasePath}
			setNewPath={setNewPath}
			// thirdPartyStore
			openConnectWindow={openConnectWindow}
			setThirdPartyProviders={backupStore.setThirdPartyProviders}
			providers={backupStore.providers}
			deleteThirdParty={deleteThirdParty}
			// dialogsStore
			deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
			setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
			connectDialogVisible={spacesStore.connectDialogVisible}
			setConnectDialogVisible={spacesStore.setConnectDialogVisible}
			backupProgressWarning={backupProgressWarning}
			setBackupProgressWarning={setBackupProgressWarning}
		/>
	);
};

export default observer(AutoBackup);
