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

import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { RecaptchaType } from "@docspace/shared/enums";

import { LoginDispatchContext } from "@/components/Login";

import ForgotPasswordModalDialog from "./ForgotPasswordModalDialog";

interface IForgotContainer {
	cookieSettingsEnabled: boolean;
	isChecked: boolean;
	identifier: string;
	onChangeCheckbox: VoidFunction;
	reCaptchaPublicKey?: string;
	reCaptchaType?: RecaptchaType;
}

const ForgotContainer = ({
	cookieSettingsEnabled,
	isChecked,
	identifier,
	onChangeCheckbox,
	reCaptchaPublicKey,
	reCaptchaType,
}: IForgotContainer) => {
	const { setIsModalOpen } = useContext(LoginDispatchContext);
	const { t } = useTranslation(["Login", "Common"]);

	const [isDialogVisible, setIsDialogVisible] = useState(false);

	const onClick = () => {
		setIsDialogVisible(true);
		setIsModalOpen(true);
	};

	const onDialogClose = () => {
		setIsDialogVisible(false);
		setIsModalOpen(false);
	};

	return (
		<div className="login-forgot-wrapper">
			<div className="login-checkbox-wrapper">
				<div className="remember-wrapper">
					{!cookieSettingsEnabled ? (
						<Checkbox
							id="login_remember"
							className="login-checkbox"
							tabIndex={3}
							isChecked={isChecked}
							onChange={onChangeCheckbox}
							label={t("Common:Remember")}
							helpButton={
								<HelpButton
									id="login_remember-hint"
									className="help-button"
									offsetRight={0}
									tooltipContent={
										<Text fontSize="12px">{t("RememberHelper")}</Text>
									}
									tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
									dataTestId="remember_help_button"
								/>
							}
							dataTestId="remember_checkbox"
						/>
					) : null}
				</div>

				<Link
					fontSize="13px"
					className="login-link"
					type={LinkType.page}
					isHovered={false}
					onClick={onClick}
					id="login_forgot-password-link"
					dataTestId="forgot_password_link"
				>
					{t("ForgotPassword")}
				</Link>
			</div>

			{isDialogVisible ? (
				<ForgotPasswordModalDialog
					isVisible={isDialogVisible}
					userEmail={identifier}
					onDialogClose={onDialogClose}
					reCaptchaPublicKey={reCaptchaPublicKey}
					reCaptchaType={reCaptchaType}
				/>
			) : null}
		</div>
	);
};

export default ForgotContainer;
