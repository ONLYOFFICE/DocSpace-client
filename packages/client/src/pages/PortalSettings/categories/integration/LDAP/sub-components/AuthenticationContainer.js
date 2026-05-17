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

import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";
import LdapFieldComponent from "./LdapFieldComponent";

const LOGIN = "login";
const PASSWORD = "password";

const AuthenticationContainer = ({
	login,
	password,
	authentication,

	setLogin,
	setPassword,
	setIsAuthentication,

	errors,

	isLdapEnabled,
	isUIDisabled,
}) => {
	const { t } = useTranslation(["Ldap", "Common"]);
	const onChangeValue = (e) => {
		const { value, name } = e.target;

		switch (name) {
			case LOGIN:
				setLogin(value);
				break;
			case PASSWORD:
				setPassword(value);
				break;
			default:
				break;
		}
	};

	return (
		<>
			<div className="ldap_authentication-header">
				<ToggleButton
					label={t("Common:Authentication")}
					className="toggle"
					isChecked={authentication}
					onChange={setIsAuthentication}
					isDisabled={!isLdapEnabled || isUIDisabled}
				/>
				<HelpButton tooltipContent={t("LdapAuthenticationTooltip")} />
			</div>
			<div className="ldap_authentication">
				<FieldContainer
					isVertical
					labelVisible
					errorMessage={t("Common:EmptyFieldError")}
					hasError={errors.login}
					labelText="Login"
					tooltipContent={t("LdapLoginTooltip")}
					inlineHelpButton
					isRequired
				>
					<LdapFieldComponent
						name={LOGIN}
						hasError={errors.login}
						onChange={onChangeValue}
						value={login}
						isDisabled={!isLdapEnabled || isUIDisabled || !authentication}
						scale
						tabIndex={18}
					/>
				</FieldContainer>

				<FieldContainer
					isVertical
					labelVisible
					errorMessage={t("Common:EmptyFieldError")}
					hasError={errors.password}
					labelText={t("Common:Password")}
					tooltipContent={t("LdapPasswordTooltip")}
					inlineHelpButton
					isRequired
				>
					<LdapFieldComponent
						isPassword
						name={PASSWORD}
						type="password"
						hasError={errors.password}
						onChange={onChangeValue}
						value={password}
						isDisabled={!isLdapEnabled || isUIDisabled || !authentication}
						scale
						tabIndex={19}
						simpleView
						size={InputSize.base}
						autoComplete="current-password"
						inputType={InputType.password}
						isDisableTooltip
					/>
				</FieldContainer>
			</div>
		</>
	);
};

export default inject(({ ldapStore }) => {
	const {
		setLogin,
		setPassword,
		setIsAuthentication,

		authentication,
		login,
		password,
		errors,

		isLdapEnabled,
		isUIDisabled,
	} = ldapStore;

	return {
		setLogin,
		setPassword,
		setIsAuthentication,

		login,
		password,
		authentication,

		errors,

		isLdapEnabled,
		isUIDisabled,
	};
})(observer(AuthenticationContainer));
