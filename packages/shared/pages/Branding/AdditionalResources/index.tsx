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

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";

import { IAdditionalResources } from "./AdditionalResources.types";
import styles from "./AdditionalResources.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const AdditionalResources = ({
	isSettingPaid,
	feedbackAndSupportEnabled,
	helpCenterEnabled,
	onSave,
	onRestore,
	isLoading,
	additionalResourcesIsDefault,
}: IAdditionalResources) => {
	const { t } = useTranslation("Common");
	const [feedbackEnabled, setFeedbackEnabled] = useState(
		feedbackAndSupportEnabled,
	);
	const [helpEnabled, setHelpEnabled] = useState(helpCenterEnabled);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (
			feedbackAndSupportEnabled === feedbackEnabled &&
			helpCenterEnabled === helpEnabled
		) {
			setHasChanges(false);
		} else {
			setHasChanges(true);
		}
	}, [
		feedbackEnabled,
		helpEnabled,
		feedbackAndSupportEnabled,
		helpCenterEnabled,
	]);

	useEffect(() => {
		setFeedbackEnabled(feedbackAndSupportEnabled);
		setHelpEnabled(helpCenterEnabled);
	}, [feedbackAndSupportEnabled, helpCenterEnabled]);

	const onSaveAction = () => {
		onSave(feedbackEnabled, helpEnabled);
	};

	return (
		<div
			className={classNames(styles.additionalResources, {
				["isEnableBranding"]: !isSettingPaid,
				["settings_unavailable"]: !isSettingPaid,
			})}
		>
			<div className={classNames(styles.header, "header")}>
				<div className={styles.additionalHeader}>
					{t("Common:AdditionalResources")}
				</div>
			</div>
			<div className={styles.additionalDescription}>
				{t("Common:AdditionalResourcesDescription", {
					productName: getBrandName("ProductName"),
				})}
			</div>
			<div className={classNames(styles.brandingCheckbox)}>
				<Checkbox
					data-testid="show-feedback-support"
					className={classNames(
						styles.checkbox,
						"show-feedback-support checkbox",
					)}
					isDisabled={!isSettingPaid}
					label={t("ShowFeedbackAndSupport")}
					isChecked={feedbackEnabled}
					onChange={() => setFeedbackEnabled(!feedbackEnabled)}
				/>

				<Checkbox
					data-testid="show-help-center"
					className={classNames(styles.checkbox)}
					isDisabled={!isSettingPaid}
					label={t("ShowHelpCenter")}
					isChecked={helpEnabled}
					onChange={() => setHelpEnabled(!helpEnabled)}
				/>
			</div>
			<SaveCancelButtons
				onSaveClick={onSaveAction}
				onCancelClick={onRestore}
				saveButtonLabel={t("Common:SaveButton")}
				cancelButtonLabel={t("Common:Restore")}
				displaySettings
				reminderText={t("Common:YouHaveUnsavedChanges")}
				showReminder={(isSettingPaid && hasChanges) || isLoading}
				disableRestoreToDefault={additionalResourcesIsDefault || isLoading}
				additionalClassSaveButton="additional-resources-save"
				additionalClassCancelButton="additional-resources-cancel"
				saveButtonDataTestId="additional-resources-save-button"
				cancelButtonDataTestId="additional-resources-cancel-button"
			/>
		</div>
	);
};
