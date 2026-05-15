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

import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";

import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { Text } from "@docspace/ui-kit/components/text";
import { RowContent } from "@docspace/ui-kit/components/rows";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import styles from "../../active-sessions.module.scss";

const SessionsRowContent = ({
	id,
	platform,
	browser,
	date,
	country,
	city,
	ip,
	sectionWidth,
	showTickIcon,
	theme,
	locale,
}) => {
	return (
		<RowContent
			className={styles.rowContent}
			key={id}
			sectionWidth={sectionWidth}
			sideColor={theme.profile.activeSessions.tableCellColor}
		>
			<Text fontSize="14px" fontWeight="600" dataTestId="session_platform">
				{platform}{" "}
				<span className={styles.sessionBrowser}>{`(${browser})`}</span>
			</Text>
			{isMobile() && showTickIcon ? (
				<IconButton
					size={12}
					iconName={TickSvgUrl}
					color={globalColors.tickColor}
				/>
			) : null}
			<Text truncate dataTestId="session_date">
				{getCorrectDate(locale, date)}
			</Text>
			{country || city ? (
				<Text fontSize="12px" fontWeight="600" dataTestId="session_location">
					{country}
					{country && city ? ` ${city}` : null}
				</Text>
			) : null}
			<Text truncate containerWidth="160px" dataTestId="session_ip">
				{ip}
			</Text>
		</RowContent>
	);
};

export default inject(({ settingsStore, userStore }) => {
	const { theme, culture } = settingsStore;

	const { user } = userStore;
	const locale = (user && user.cultureName) || culture || "en";

	return { theme, locale };
})(observer(SessionsRowContent));
