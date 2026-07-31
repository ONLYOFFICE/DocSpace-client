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
import { isMobile } from "@docspace/shared/utils";

import { Row } from "@docspace/ui-kit/components/rows";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import SessionsRowContent from "./SessionsRowContent";

const SessionsRow = (props) => {
	const {
		item,
		sectionWidth,
		currentSession,
		setPlatformModalData,
		setLogoutDialogVisible,
	} = props;

	const showTickIcon = currentSession === item.id;

	const onRemoveClick = () => {
		setLogoutDialogVisible(true);
		setPlatformModalData({
			id: item?.id,
			platform: item?.platform,
			browser: item?.browser,
		});
	};

	const contentElement = showTickIcon ? (
		!isMobile() && (
			<IconButton
				size={16}
				iconName={TickSvgUrl}
				color={globalColors.tickColor}
			/>
		)
	) : (
		<IconButton
			size={20}
			iconName={RemoveSessionSvgUrl}
			isClickable
			onClick={onRemoveClick}
			dataTestId="session_remove_icon_button"
		/>
	);

	return (
		<Row
			key={item.id}
			data={item}
			sectionWidth={sectionWidth}
			contentElement={contentElement}
			dataTestId={`session_row_${item.id}`}
		>
			<SessionsRowContent
				id={item.id}
				platform={item.platform}
				browser={item.browser}
				date={item.date}
				country={item.country}
				city={item.city}
				ip={item.ip}
				sectionWidth={sectionWidth}
				showTickIcon={showTickIcon}
			/>
		</Row>
	);
};

export default inject(({ setup }) => {
	const { currentSession, setLogoutDialogVisible, setPlatformModalData } =
		setup;

	return {
		currentSession,
		setLogoutDialogVisible,
		setPlatformModalData,
	};
})(observer(SessionsRow));
