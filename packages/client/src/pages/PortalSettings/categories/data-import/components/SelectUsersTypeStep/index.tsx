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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { TFunction } from "i18next";

import { SearchInput } from "@docspace/ui-kit/components/search-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { searchMigrationUsers } from "SRC_DIR/pages/PortalSettings/utils/importUtils";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../sub-components/AccountsPaging";

import styles from "../../StyledDataImport.module.scss";
import { InjectedTypeSelectProps, TypeSelectProps } from "../../types";
import { MigrationButtons } from "../../sub-components/MigrationButtons";
import AdminsInfoBlock from "../../sub-components/AdminsInfoBlock";

const PAGE_SIZE = 25;
const REFRESH_TIMEOUT = 100;

const SelectUsersTypeStep = (props: TypeSelectProps) => {
	const {
		t,

		incrementStep,
		decrementStep,
		users,
		searchValue,
		setSearchValue,
		filteredUsers,
		cancelMigration,
		clearCheckedAccounts,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,

		cancelUploadDialogVisible,
		setCancelUploadDialogVisible,
		totalUsedUsers,
		limitAdmins,
	} = props as InjectedTypeSelectProps;

	const [boundaries, setBoundaries] = useState([0, PAGE_SIZE]);
	const [dataPortion, setDataPortion] = useState(
		filteredUsers.slice(...boundaries),
	);

	useEffect(() => {
		setDataPortion(filteredUsers.slice(...boundaries));
	}, [boundaries, filteredUsers, users]);

	const handleDataChange = (leftBoundary: number, rightBoundary: number) => {
		setBoundaries([leftBoundary, rightBoundary]);
		setDataPortion(filteredUsers.slice(leftBoundary, rightBoundary));
	};

	const onChangeInput = (value: string) => {
		setSearchValue(value);
	};

	const onClearSearchInput = () => {
		setSearchValue("");
	};

	const filteredAccounts = searchMigrationUsers(dataPortion, searchValue);

	const onCancelMigration = () => {
		cancelMigration();
		clearCheckedAccounts();
		setStep(1);
		setWorkspace("");
		setMigratingWorkspace("");
		setMigrationPhase("");
	};

	const showCancelDialog = () => setCancelUploadDialogVisible(true);
	const hideCancelDialog = () => setCancelUploadDialogVisible(false);

	const isLimitsReached = limitAdmins ? totalUsedUsers > limitAdmins : false;

	const Buttons = (
		<MigrationButtons
			className="save-cancel-buttons"
			onSaveClick={incrementStep}
			onCancelClick={decrementStep}
			showReminder
			saveButtonLabel={t("Settings:NextStep")}
			cancelButtonLabel={t("Common:Back")}
			displaySettings
			migrationCancelLabel={t("Settings:CancelImport")}
			onMigrationCancelClick={showCancelDialog}
			saveButtonDisabled={isLimitsReached}
		/>
	);

	return (
		<div className={styles.wrapper}>
			{Buttons}

			{limitAdmins ? (
				<AdminsInfoBlock
					limitAdmins={limitAdmins}
					totalUsedUsers={totalUsedUsers}
				/>
			) : null}

			{filteredUsers.length > 0 ? (
				<>
					<SearchInput
						id="search-checkedUsers-type-input"
						className="importUsersSearch"
						placeholder={t("Common:Search")}
						value={searchValue}
						onChange={onChangeInput}
						refreshTimeout={REFRESH_TIMEOUT}
						onClearSearch={onClearSearchInput}
						size={InputSize.base}
					/>

					<AccountsTable accountsData={filteredAccounts} />

					{filteredUsers.length > PAGE_SIZE && filteredAccounts.length > 0 ? (
						<AccountsPaging
							t={t as TFunction}
							numberOfItems={filteredUsers.length}
							setDataPortion={handleDataChange}
							pagesPerPage={PAGE_SIZE}
						/>
					) : null}

					{filteredAccounts.length > 0 ? Buttons : null}
				</>
			) : null}

			{cancelUploadDialogVisible ? (
				<CancelUploadDialog
					visible={cancelUploadDialogVisible}
					onClose={hideCancelDialog}
					cancelMigration={onCancelMigration}
					loading={false}
					isFifthStep={false}
					isSixthStep={false}
				/>
			) : null}
		</div>
	);
};

export default inject<TStore>(({ importAccountsStore, dialogsStore }) => {
	const {
		users,
		incrementStep,
		decrementStep,
		searchValue,
		setSearchValue,
		filteredUsers,
		cancelMigration,
		clearCheckedAccounts,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,
		totalUsedUsers,
		limitAdmins,
	} = importAccountsStore;
	const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
		dialogsStore;

	return {
		users,
		incrementStep,
		decrementStep,
		searchValue,
		setSearchValue,
		filteredUsers,
		cancelMigration,
		clearCheckedAccounts,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,

		cancelUploadDialogVisible,
		setCancelUploadDialogVisible,
		totalUsedUsers,
		limitAdmins,
	};
})(observer(SelectUsersTypeStep));
