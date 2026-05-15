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

import CatalogShareSmallReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.share.small.react.svg?url";
import CatalogSharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import React from "react";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import { inject, observer } from "mobx-react";

const SharedButton = ({
	t,
	id,
	isFolder,
	shared,
	onSelectItem,
	setSharingPanelVisible,
	isSmallIcon = false,
	theme,
}) => {
	const color = shared
		? theme.filesSharedButton.sharedColor
		: theme.filesSharedButton.color;

	const onClickShare = () => {
		onSelectItem({ id, isFolder });
		setSharingPanelVisible(true);
	};

	const icon = isSmallIcon
		? CatalogShareSmallReactSvgUrl
		: CatalogSharedReactSvgUrl;

	return (
		<Text
			className="share-button"
			as="span"
			title={t("Share")}
			fontSize="12px"
			fontWeight={600}
			color={color}
			display="inline-flex"
			onClick={onClickShare}
		>
			<IconButton
				className="share-button-icon"
				color={color}
				hoverColor={theme.filesSharedButton.sharedColor}
				size={isSmallIcon ? 12 : 16}
				iconName={icon}
			/>
			{t("Share")}
		</Text>
	);
};

export default inject(({ settingsStore, filesActionsStore, dialogsStore }) => {
	return {
		theme: settingsStore.theme,
		onSelectItem: filesActionsStore.onSelectItem,
		setSharingPanelVisible: dialogsStore.setSharingPanelVisible,
	};
})(observer(SharedButton));
