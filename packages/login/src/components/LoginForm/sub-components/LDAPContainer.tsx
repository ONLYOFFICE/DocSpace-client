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
import { isMobileOnly } from "react-device-detect";

import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

interface ILDAPContainer {
	isLdapLoginChecked: boolean;
	ldapDomain: string;
	onChangeLdapLoginCheckbox: VoidFunction;
}

const LDAPContainer = ({
	isLdapLoginChecked,
	ldapDomain,
	onChangeLdapLoginCheckbox,
}: ILDAPContainer) => {
	const { t } = useTranslation(["Login", "Common"]);

	return (
		<div className="login-forgot-wrapper">
			<div className="login-checkbox-wrapper">
				<Checkbox
					id="login_ldap-checkbox"
					className="login-checkbox"
					tabIndex={4}
					isChecked={isLdapLoginChecked}
					onChange={onChangeLdapLoginCheckbox}
					label={t("SignInLDAP", { ldap_domain: ldapDomain })}
					helpButton={
						<HelpButton
							id="login_ldap-hint"
							className="help-button"
							offsetRight={0}
							tooltipContent={
								<Text fontSize="12px">{t("SignInLdapHelper")}</Text>
							}
							tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
							dataTestId="ldap_login_help_button"
						/>
					}
					dataTestId="ldap_login_checkbox"
				/>
			</div>
		</div>
	);
};

export default LDAPContainer;
