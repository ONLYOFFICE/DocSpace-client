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
import { Trans, useTranslation } from "react-i18next";

import { EmailInput } from "@docspace/ui-kit/components/email-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import {
	InputSize,
	InputType,
	TextInput,
} from "@docspace/ui-kit/components/text-input";
import { TValidate } from "@docspace/ui-kit/components/email-input";

import ArrowIcon from "PUBLIC_DIR/images/arrow.left.react.svg?url";

import { DEFAULT_EMAIL_TEXT } from "@/utils/constants";
import { getBrandName } from "@docspace/shared/constants/brands";

interface IEmailContainer {
	emailFromInvitation?: string;
	isEmailErrorShow: boolean;
	errorText?: string;
	identifier: string;
	isLoading: boolean;

	onChangeLogin: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlurEmail: () => void;
	handleAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => void;
	onValidateEmail: (res: TValidate) => undefined;
	isLdapLogin: boolean;
	ldapDomain?: string;
}

const EmailContainer = ({
	emailFromInvitation,
	isEmailErrorShow,
	errorText,
	identifier,
	isLoading,

	onChangeLogin,
	onBlurEmail,
	onValidateEmail,
	isLdapLogin,
	ldapDomain,
	handleAnimationStart,
}: IEmailContainer) => {
	const { t } = useTranslation(["Login", "Common"]);

	if (emailFromInvitation) {
		const onClickBack = () => {
			window.history.go(-1);
		};

		return (
			<div className="invitation-info-container">
				<div className="sign-in-container">
					<div className="back-title">
						<IconButton
							size={16}
							iconName={ArrowIcon}
							onClick={onClickBack}
							dataTestId="email_invitation_back_button"
						/>
						<Text
							fontWeight={600}
							onClick={onClickBack}
							dataTestId="email_invitation_back_text"
						>
							{t("Common:Back")}
						</Text>
					</div>
					<Text fontWeight={600} fontSize="16px">
						{t("Common:LoginButton")}
					</Text>
				</div>
				<Text>
					<Trans
						t={t}
						i18nKey="UserIsAlreadyRegistered"
						ns="Login"
						defaults={DEFAULT_EMAIL_TEXT}
						values={{
							email: emailFromInvitation,
							productName: getBrandName("ProductName"),
						}}
						components={{
							1: (
								<Link
									key="component_key"
									fontWeight={600}
									className="login-link"
									type={LinkType.page}
									isHovered={false}
								/>
							),
						}}
					/>
				</Text>
			</div>
		);
	}

	return (
		<FieldContainer
			isVertical
			labelVisible={false}
			hasError={isEmailErrorShow}
			errorMessage={
				errorText
					// biome-ignore lint/plugin/no-dynamic-i18n-key: errorText is a runtime-provided key fragment composed with "Common:" prefix
					? t(`Common:${errorText}`, errorText)
					: t("Common:RequiredField")
			} // TODO: Add wrong login server error
			dataTestId="email_field"
		>
			{isLdapLogin ? (
				<TextInput
					id="login_username"
					name="login"
					type={InputType.text}
					hasError={isEmailErrorShow}
					value={identifier}
					placeholder={t("LDAPUsernamePlaceholder", {
						ldap_domain: ldapDomain,
					})}
					size={InputSize.large}
					scale
					isAutoFocussed
					tabIndex={1}
					isDisabled={isLoading}
					autoComplete="off"
					onChange={onChangeLogin}
					onBlur={onBlurEmail}
					testId="ldap_username_input"
				/>
			) : (
				<EmailInput
					id="login_username"
					name="login"
					hasError={isEmailErrorShow}
					value={identifier}
					placeholder={t("RegistrationEmailWatermark")}
					size={InputSize.large}
					scale
					isAutoFocussed
					tabIndex={1}
					isDisabled={isLoading}
					autoComplete="username"
					onChange={onChangeLogin}
					onBlur={onBlurEmail}
					onValidateInput={onValidateEmail}
					handleAnimationStart={handleAnimationStart}
				/>
			)}
		</FieldContainer>
	);
};

export default EmailContainer;
