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

import styles from "./CheckboxSet.module.scss";

const checkboxesNames = {
	idp: [
		"idpVerifyAuthResponsesSign",
		"idpVerifyLogoutRequestsSign",
		"idpVerifyLogoutResponsesSign",
	],
	sp: [
		"spSignAuthRequests",
		"spSignLogoutRequests",
		"spSignLogoutResponses",
		"spEncryptAssertions",
	],
};

const checkboxesDataTestId = {
	authRequestCheckbox: {
		idp: "idp_verify_auth_responses_sign_checkbox",
		sp: "sp_sign_auth_requests_checkbox",
	},
	logoutRequestCheckbox: {
		idp: "idp_verify_logout_requests_sign_checkbox",
		sp: "sp_sign_logout_requests_checkbox",
	},
	logoutResponseCheckbox: {
		idp: "idp_verify_logout_responses_sign_checkbox",
		sp: "sp_sign_logout_responses_checkbox",
	},
	encryptAssertionCheckbox: {
		sp: "sp_encrypt_assertions_checkbox",
	},
};

const CheckboxSet = (props) => {
	const { t } = useTranslation("SingleSignOn");
	const {
		prefix,
		idpVerifyAuthResponsesSign,
		idpVerifyLogoutRequestsSign,
		idpVerifyLogoutResponsesSign,
		spSignAuthRequests,
		spSignLogoutRequests,
		spSignLogoutResponses,
		spEncryptAssertions,
		setCheckbox,
		isDisabledSpSigning,
		isDisabledSpEncrypt,
		isDisabledIdpSigning,
	} = props;

	const isDisabled =
		prefix === "sp" ? isDisabledSpSigning : isDisabledIdpSigning;

	return (
		<div className={styles.styledWrapper}>
			<Checkbox
				id={
					prefix === "idp"
						? "idp-verify-auth-responses-sign"
						: "sp-sign-auth-requests"
				}
				className={styles.checkboxInput}
				isDisabled={isDisabled}
				onChange={setCheckbox}
				label={prefix === "idp" ? t("idpAuthRequest") : t("spAuthRequest")}
				name={checkboxesNames[prefix][0]}
				tabIndex={10}
				isChecked={
					prefix === "idp" ? idpVerifyAuthResponsesSign : spSignAuthRequests
				}
				dataTestId={checkboxesDataTestId.authRequestCheckbox[prefix]}
			/>
			<Checkbox
				id={
					prefix === "idp"
						? "idp-verify-logout-requests-sign"
						: "sp-sign-logout-requests"
				}
				className={styles.checkboxInput}
				isDisabled={isDisabled}
				onChange={setCheckbox}
				label={
					prefix === "idp" ? t("idpSignExitRequest") : t("spSignExitRequest")
				}
				name={checkboxesNames[prefix][1]}
				tabIndex={11}
				isChecked={
					prefix === "idp" ? idpVerifyLogoutRequestsSign : spSignLogoutRequests
				}
				dataTestId={checkboxesDataTestId.logoutRequestCheckbox[prefix]}
			/>
			<Checkbox
				id={
					prefix === "idp"
						? "idp-verify-logout-responses-sign"
						: "sp-sign-logout-responses"
				}
				className={styles.checkboxInput}
				isDisabled={isDisabled}
				onChange={setCheckbox}
				label={
					prefix === "idp"
						? t("idpSignResponseRequest")
						: t("spSignResponseRequest")
				}
				name={checkboxesNames[prefix][2]}
				tabIndex={12}
				isChecked={
					prefix === "idp"
						? idpVerifyLogoutResponsesSign
						: spSignLogoutResponses
				}
				dataTestId={checkboxesDataTestId.logoutResponseCheckbox[prefix]}
			/>

			{prefix === "sp" ? (
				<Checkbox
					id="sp-encrypt-assertions"
					className={styles.checkboxInput}
					isDisabled={isDisabledSpEncrypt}
					onChange={setCheckbox}
					label={t("spDecryptStatements")}
					name={checkboxesNames[prefix][3]}
					tabIndex={13}
					isChecked={spEncryptAssertions}
					dataTestId={checkboxesDataTestId.encryptAssertionCheckbox[prefix]}
				/>
			) : null}
		</div>
	);
};

export default inject(({ ssoStore }) => {
	const {
		idpVerifyAuthResponsesSign,
		idpVerifyLogoutRequestsSign,
		idpVerifyLogoutResponsesSign,
		spSignAuthRequests,
		spSignLogoutRequests,
		spSignLogoutResponses,
		spEncryptAssertions,
		setCheckbox,
		isDisabledSpSigning,
		isDisabledSpEncrypt,
		isDisabledIdpSigning,
	} = ssoStore;

	return {
		idpVerifyAuthResponsesSign,
		idpVerifyLogoutRequestsSign,
		idpVerifyLogoutResponsesSign,
		spSignAuthRequests,
		spSignLogoutRequests,
		spSignLogoutResponses,
		spEncryptAssertions,
		setCheckbox,
		isDisabledSpSigning,
		isDisabledSpEncrypt,
		isDisabledIdpSigning,
	};
})(observer(CheckboxSet));
