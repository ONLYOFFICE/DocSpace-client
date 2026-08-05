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

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

export const SharedLinkHint = ({
	t,
	linkSettings,
	redirectToSelectedRoom,
	currentColorScheme,
}) => {
	const settingsTranslations = {
		password: t("Common:Password").toLowerCase(),
		denyDownload: t("FileContentCopy").toLowerCase(),
		expirationDate: t("LimitByTime").toLowerCase(),
	};

	return (
		linkSettings.length > 0 && (
			<div>
				<Text className="linkHelp" fontSize="12px" lineHeight="16px">
					{linkSettings.length === 2
						? t("LinkSetDescription2", {
								parameter1: settingsTranslations[linkSettings[0]],
								parameter2: settingsTranslations[linkSettings[1]],
							})
						: linkSettings.length === 3
							? t("LinkSetDescription3", {
									parameter1: settingsTranslations[linkSettings[0]],
									parameter2: settingsTranslations[linkSettings[1]],
									parameter3: settingsTranslations[linkSettings[2]],
								})
							: t("LinkSetDescription", {
									parameter: settingsTranslations[linkSettings[0]],
								})}
				</Text>
				<Link
					color={currentColorScheme?.main?.accent}
					fontSize="12px"
					lineHeight="16px"
					onClick={redirectToSelectedRoom}
				>
					{" "}
					{t("Common:GoToRoom")}.
				</Link>
			</div>
		)
	);
};
