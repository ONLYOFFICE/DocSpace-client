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

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

const HideButton = (props) => {
	const { t } = useTranslation("SingleSignOn");
	const { text, isAdditionalParameters, value, setIsSettingsShown } = props;
	const marginProp = isAdditionalParameters ? null : "24px 0 8px 0px";

	const onClick = () => {
		setIsSettingsShown(!value);
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				flexDirection: "row",
				margin: marginProp,
			}}
		>
			{!isAdditionalParameters ? (
				<Text
					as="h2"
					fontSize="16px"
					fontWeight={700}
					className="settings_unavailable"
				>
					{text}
				</Text>
			) : null}

			<Link
				className="hide-button settings_unavailable"
				isHovered
				onClick={onClick}
				type="action"
				dataTestId="hide_show_ldap_link"
			>
				{value
					? isAdditionalParameters
						? t("HideAdditionalParameters")
						: t("Hide")
					: isAdditionalParameters
						? t("ShowAdditionalParameters")
						: t("Show")}
			</Link>
		</div>
	);
};

export default inject(({ ldapStore }) => {
	const { setIsSettingsShown } = ldapStore;

	return {
		setIsSettingsShown,
	};
})(observer(HideButton));
