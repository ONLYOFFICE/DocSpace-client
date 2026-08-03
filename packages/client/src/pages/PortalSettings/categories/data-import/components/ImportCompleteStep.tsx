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

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
	ImportCompleteStepProps,
	InjectedImportCompleteStepProps,
} from "../types";
import styles from "../StyledDataImport.module.scss";

const ImportCompleteStep = (props: ImportCompleteStepProps) => {
	const {
		t,

		getMigrationLog,
		clearCheckedAccounts,
		sendWelcomeLetter,
		clearMigration,
		getMigrationStatus,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,
	} = props as InjectedImportCompleteStepProps;

	const [isChecked, setIsChecked] = useState(false);
	const [importResult, setImportResult] = useState<{
		succeedUsers: number;
		failedUsers: number;
		errors: string[];
	}>({
		succeedUsers: 0,
		failedUsers: 0,
		errors: [],
	});

	const onDownloadLog = async () => {
		try {
			await getMigrationLog()
				.then((response) => new Blob([response as BlobPart]))
				.then((blob) => {
					const a = document.createElement("a");
					const url = window.URL.createObjectURL(blob);
					a.href = url;
					a.download = "migration.log";
					a.click();
					window.URL.revokeObjectURL(url);
				});
		} catch (error) {
			toastr.error(error || t("Common:SomethingWentWrong"));
		}
	};

	const onChangeCheckbox = () => {
		setIsChecked((prev) => !prev);
	};

	const onFinishClick = () => {
		if (isChecked) {
			sendWelcomeLetter({ isSendWelcomeEmail: true });
		}
		clearCheckedAccounts();
		clearMigration();
		setStep(1);
		setWorkspace("");
		setMigratingWorkspace("");
		setMigrationPhase("");
	};

	useEffect(() => {
		try {
			getMigrationStatus()?.then((res) =>
				setImportResult({
					succeedUsers: res?.parseResult.successedUsers || 0,
					failedUsers: res?.parseResult.failedUsers || 0,
					errors: res?.parseResult.errors || [],
				}),
			);
		} catch (error) {
			toastr.error(error || t("Common:SomethingWentWrong"));
		}
	}, [getMigrationStatus, t]);

	return (
		<>
			<Text className={styles.infoText}>
				{t("Settings:ImportedUsers", {
					selectedUsers: importResult.succeedUsers,
					importedUsers: importResult.succeedUsers + importResult.failedUsers,
				})}
			</Text>

			{importResult.failedUsers > 0 ? (
				<Text className={styles.errorText}>
					{t("Settings:ErrorsWereFound", {
						errors: importResult.failedUsers,
					})}
				</Text>
			) : null}

			{importResult.errors?.length > 0 ? (
				<Text className={styles.errorText}>{t("Settings:ErrorOccuredDownloadLog")}</Text>
			) : null}

			<div className={styles.importCompleteWrapper}>
				<Checkbox
					label={t("Settings:SendInviteLetter")}
					isChecked={isChecked}
					onChange={onChangeCheckbox}
					dataTestId="send_invite_letter_checkbox"
				/>
				<HelpButton
					place="right"
					offsetRight={0}
					style={{ margin: "0px 5px" }}
					tooltipContent={
						<Text fontSize="12px">{t("Settings:InviteLetterTooltip")}</Text>
					}
					dataTestId="invite_letter_help_button"
				/>
			</div>

			<SaveCancelButtons
				className="save-cancel-buttons"
				onSaveClick={onFinishClick}
				onCancelClick={onDownloadLog}
				saveButtonLabel={t("Common:Finish")}
				cancelButtonLabel={t("Settings:DownloadLog")}
				displaySettings
				showReminder
				saveButtonDataTestId="finish_import_button"
				cancelButtonDataTestId="download_log_button"
			/>
		</>
	);
};

export default inject<TStore>(({ importAccountsStore }) => {
	const {
		getMigrationLog,
		clearCheckedAccounts,
		sendWelcomeLetter,
		clearMigration,
		getMigrationStatus,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,
	} = importAccountsStore;

	return {
		getMigrationLog,
		clearCheckedAccounts,
		sendWelcomeLetter,
		clearMigration,
		getMigrationStatus,
		setStep,
		setWorkspace,
		setMigratingWorkspace,
		setMigrationPhase,
	};
})(observer(ImportCompleteStep));
