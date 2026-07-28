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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getConstName } from "@docspace/shared/constants/consts";

const AdvancedSettings = ({
	isLdapEnabled,
	isUIDisabled,
	isSendWelcomeEmail,
	setIsSendWelcomeEmail,
	disableEmailVerification,
	setDisableEmailVerification,
}) => {
	const { t } = useTranslation("Ldap");

	const onChangeSendWelcomeEmail = (e) => {
		const checked = e.target.checked;
		setIsSendWelcomeEmail(checked);
	};

	const onChangeDisableEmailVerification = (e) => {
		const checked = e.target.checked;
		setDisableEmailVerification(checked);
	};

	return (
		<div className="ldap_advanced-settings">
			<Text fontWeight={600} fontSize="14px">
				{t("LdapAdvancedSettings")}
			</Text>

			<div className="ldap_advanced-settings-header">
				<Checkbox
					className="ldap_checkbox-send-welcome-email"
					label={t("LdapSendWelcomeLetter")}
					isChecked={isSendWelcomeEmail}
					onChange={onChangeSendWelcomeEmail}
					isDisabled={!isLdapEnabled || isUIDisabled}
				/>
				<HelpButton tooltipContent={t("LdapSendWelcomeLetterTooltip")} />
			</div>

			<div className="ldap_advanced-settings-header">
				<Checkbox
					className="ldap_checkbox-disable-email-verification"
					label={t("Settings:DisableEmailVerification")}
					isChecked={disableEmailVerification}
					onChange={onChangeDisableEmailVerification}
					isDisabled={!isLdapEnabled || isUIDisabled}
				/>
				<HelpButton
					tooltipContent={t("Settings:DisableEmailDescription", {
						sectionName: getConstName("LDAP"),
						productName: getBrandName("ProductName"),
					})}
				/>
			</div>
		</div>
	);
};

export default inject(({ ldapStore }) => {
	const {
		disableEmailVerification,
		setDisableEmailVerification,
		isLdapEnabled,
		isUIDisabled,
		setIsSendWelcomeEmail,
		isSendWelcomeEmail,
	} = ldapStore;
	return {
		isLdapEnabled,
		isUIDisabled,
		setIsSendWelcomeEmail,
		isSendWelcomeEmail,
		disableEmailVerification,
		setDisableEmailVerification,
	};
})(observer(AdvancedSettings));
