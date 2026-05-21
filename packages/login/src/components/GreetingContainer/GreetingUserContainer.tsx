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

"use client";

import { useTranslation, Trans } from "react-i18next";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";

import ArrowIcon from "PUBLIC_DIR/images/arrow.left.react.svg?url";
import { Link } from "@docspace/ui-kit/components/link";
import { getBrandName } from "@docspace/shared/constants/brands";

const DEFAULT_CREATION_TEXT =
	"A {{productName}} account will be created for {{email}}. Please, complete your registration:";

type GreetingUserContainerProps = {
	email: string;
	emailFromLink: string;
	type?: string;
	onClickBack?(): void;
};

export const GreetingUserContainer = ({
	email,
	onClickBack,
	emailFromLink,
	type,
}: GreetingUserContainerProps) => {
	const { t } = useTranslation(["Confirm", "Common"]);

	return (
		<div className="invitation-info-container">
			<div className="sign-in-container">
				{type === "LinkInvite" && !emailFromLink ? (
					<div className="back-title">
						<IconButton
							size={16}
							iconName={ArrowIcon}
							onClick={onClickBack}
							dataTestId="greeting_back_icon_button"
						/>
						<Text
							fontWeight={600}
							onClick={onClickBack}
							dataTestId="greeting_back_text"
						>
							{t("Common:Back")}
						</Text>
					</div>
				) : null}

				<Text fontWeight={600} fontSize="16px">
					{t("SignUp")}
				</Text>
			</div>
			<Text>
				<Trans
					t={t}
					i18nKey="AccountWillBeCreated"
					ns="Confirm"
					defaults={DEFAULT_CREATION_TEXT}
					values={{
						email,
						productName: getBrandName("ProductName"),
					}}
					components={{
						1: (
							<Link
								key="component_key"
								tag="a"
								isHovered={false}
								color="accent"
								dataTestId="confirm_registration_link"
							/>
						),
					}}
				/>
			</Text>
		</div>
	);
};
