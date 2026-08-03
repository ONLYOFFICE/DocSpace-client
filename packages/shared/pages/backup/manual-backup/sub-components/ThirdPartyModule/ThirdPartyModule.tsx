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

import { useTranslation } from "react-i18next";
import React, { useRef, useEffect, useState } from "react";
import classNames from "classnames";

import { BackupStorageType, ProvidersType } from "../../../../../enums";
import { isNullOrUndefined } from "../../../../../utils/typeGuards";
import { Button, type ButtonSize } from "@docspace/ui-kit/components/button";
import { getFromLocalStorage } from "../../../../../utils";
import { DirectThirdPartyConnection } from "../../../../../components/direct-third-party-connection";

import type {
	ConnectedThirdPartyAccountType,
	Nullable,
	ThirdPartyAccountType,
	TTranslation,
} from "../../../../../types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type { FilesSelectorSettings } from "../../../../../components/files-selector-input";
import type { TThirdParties } from "../../../../../api/files/types";

import styles from "../../ManualBackup.module.scss";
import NoteComponent from "../../../sub-components/NoteComponent";

interface ThirdPartyModuleProps {
	onMakeCopy: (
		selectedFolder: string | number,
		moduleName: string,
		moduleType: string,
		selectedStorageId?: string,
		selectedStorageTitle?: string,
	) => Promise<void>;
	isMaxProgress: boolean;
	buttonSize?: ButtonSize;
	isBackupPaid?: boolean;
	isFreeBackupsLimitReached?: boolean;

	connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
	isTheSameThirdPartyAccount: boolean;

	openConnectWindow: (
		serviceName: string,
		modal: Window | null,
	) => Promise<Window | null>;
	connectDialogVisible: boolean;
	deleteThirdPartyDialogVisible: boolean;
	setConnectDialogVisible: (visible: boolean) => void;
	setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
	clearLocalStorage: VoidFunction;
	setSelectedThirdPartyAccount: (
		elem: Nullable<Partial<ThirdPartyAccountType>>,
	) => void;
	selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
	accounts: ThirdPartyAccountType[];
	setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
	deleteThirdParty: (id: string) => Promise<void>;
	setConnectedThirdPartyAccount: (
		account: Nullable<ConnectedThirdPartyAccountType>,
	) => void;
	setThirdPartyProviders: (providers: TThirdParties) => void;
	providers: TThirdParties;
	removeItem: ThirdPartyAccountType;
	newPath: string;
	basePath: string;
	isErrorPath: boolean;
	filesSelectorSettings: FilesSelectorSettings;
	setBasePath: (folders: TBreadCrumb[]) => void;
	toDefault: VoidFunction;
	setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
}

const ThirdPartyResource = "ThirdPartyResource";

const ThirdPartyModule = ({
	onMakeCopy,
	isMaxProgress,
	buttonSize,
	connectedThirdPartyAccount,
	isTheSameThirdPartyAccount,

	openConnectWindow,
	connectDialogVisible,
	deleteThirdPartyDialogVisible,
	setConnectDialogVisible,
	setDeleteThirdPartyDialogVisible,
	clearLocalStorage,
	setSelectedThirdPartyAccount,
	selectedThirdPartyAccount,
	accounts,
	setThirdPartyAccountsInfo,
	deleteThirdParty,
	setConnectedThirdPartyAccount,
	setThirdPartyProviders,
	providers,
	removeItem,
	basePath,
	isErrorPath,
	newPath,
	filesSelectorSettings,
	setBasePath,
	setNewPath,
	toDefault,
	isBackupPaid,
	isFreeBackupsLimitReached,
}: ThirdPartyModuleProps) => {
	const isMountRef = useRef(false);
	const folderRef = useRef("");

	const [isError, setIsError] = useState(false);
	const [isStartCopy, setIsStartCopy] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState<string | number>(() => {
		folderRef.current = getFromLocalStorage("LocalCopyFolder") ?? "";
		const moduleType = getFromLocalStorage<string>("LocalCopyStorageType");
		return moduleType === ThirdPartyResource ? folderRef.current : "";
	});

	const { t } = useTranslation(["Common"]);

	useEffect(() => {
		isMountRef.current = true;

		return () => {
			isMountRef.current = false;
		};
	}, []);

	const onSelectFolder = (folderId: string | number | undefined) => {
		if (isMountRef.current && !isNullOrUndefined(folderId))
			setSelectedFolder(folderId);
	};

	const isInvalidForm = () => {
		if (selectedFolder) return false;

		setIsError(true);

		return true;
	};

	const handleMakeCopy = async () => {
		if (isInvalidForm()) return;

		if (isError) setIsError(false);

		setIsStartCopy(true);

		await onMakeCopy(
			selectedFolder,
			ThirdPartyResource,
			`${BackupStorageType.ResourcesModuleType}`,
		);

		setIsStartCopy(false);
	};

	const isModuleDisabled = !isMaxProgress || isStartCopy;

	const checkCreating = selectedThirdPartyAccount?.key === ProvidersType.WebDav;

	return (
		<>
			<div
				data-testid="third-party-module"
				className={classNames(
					styles.manualBackupThirdPartyModule,
					"manual-backup_third-party-module",
				)}
			>
				<DirectThirdPartyConnection
					checkCreating={checkCreating}
					openConnectWindow={openConnectWindow}
					connectDialogVisible={connectDialogVisible}
					deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
					connectedThirdPartyAccount={connectedThirdPartyAccount}
					setConnectDialogVisible={setConnectDialogVisible}
					setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
					clearLocalStorage={clearLocalStorage}
					setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
					isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
					selectedThirdPartyAccount={selectedThirdPartyAccount}
					accounts={accounts}
					setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
					deleteThirdParty={deleteThirdParty}
					setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
					setThirdPartyProviders={setThirdPartyProviders}
					providers={providers}
					removeItem={removeItem}
					newPath={newPath}
					basePath={basePath}
					isErrorPath={isErrorPath}
					filesSelectorSettings={filesSelectorSettings}
					setBasePath={setBasePath}
					toDefault={toDefault}
					setNewPath={setNewPath}
					onSelectFolder={onSelectFolder}
					isDisabled={isModuleDisabled}
					{...(selectedFolder && { id: selectedFolder })}
					withoutInitPath={!selectedFolder}
					isError={isError}
					buttonSize={buttonSize}
					isSelectFolder
					dataTestId="manual_backup"
				/>

				{connectedThirdPartyAccount?.id && isTheSameThirdPartyAccount ? (
					<Button
						primary
						size={buttonSize}
						onClick={handleMakeCopy}
						label={t("Common:CreateCopy")}
						isDisabled={isModuleDisabled || selectedFolder === ""}
						testId="third_party_create_copy_button"
					/>
				) : null}
			</div>
			<NoteComponent
				isVisible={Boolean(isBackupPaid && isFreeBackupsLimitReached)}
			/>
		</>
	);
};

export default ThirdPartyModule;
