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

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import styles from "./AdvancedSettings.module.scss";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getConstName } from "@docspace/shared/constants/consts";

interface InjectedProps {
	hideAuthPage: boolean;
	disableEmailVerification: boolean;
	enableSso: boolean;
	isLoadingXml: boolean;
	setCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const AdvancedSettings = (props: InjectedProps) => {
	const {
		hideAuthPage,
		disableEmailVerification,
		enableSso,
		isLoadingXml,
		setCheckbox,
	} = props;
	const { t } = useTranslation(["SingleSignOn", "Settings", "Common"]);
	return (
		<div className={styles.styledWrapper}>
			<Text className={styles.advancedTitle} fontWeight={600} fontSize="14px">
				{t("Common:AdvancedSettings")}
			</Text>

			<div className={styles.advancedBlock}>
				<Checkbox
					id="hide-auth-page"
					className={styles.checkboxInput}
					label={t("HideAuthPage")}
					name="hideAuthPage"
					isChecked={hideAuthPage}
					isDisabled={!enableSso || isLoadingXml}
					onChange={setCheckbox}
					dataTestId="hide_auth_page_checkbox"
				/>
				<HelpButton
					tooltipContent={t("AdvancedSettingsTooltip")}
					dataTestId="hide_auth_page_help_button"
				/>
			</div>

			<div className={styles.advancedBlock}>
				<Checkbox
					id="disable-email-verification"
					className={styles.checkboxInput}
					label={t("Settings:DisableEmailVerification")}
					name="disableEmailVerification"
					isChecked={disableEmailVerification}
					isDisabled={!enableSso || isLoadingXml}
					onChange={setCheckbox}
					dataTestId="disable_email_verification_checkbox"
				/>
				<HelpButton
					tooltipContent={t("Settings:DisableEmailDescription", {
						sectionName: getConstName("SSO"),
						productName: getBrandName("ProductName"),
					})}
					dataTestId="disable_email_verification_help_button"
				/>
			</div>
		</div>
	);
};

export default inject<TStore>(({ ssoStore }) => {
	const {
		hideAuthPage,
		disableEmailVerification,
		enableSso,
		isLoadingXml,
		setCheckbox,
	} = ssoStore;

	return {
		hideAuthPage,
		disableEmailVerification,
		enableSso,
		isLoadingXml,
		setCheckbox,
	};
})(observer(AdvancedSettings));
