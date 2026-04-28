// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import classNames from "classnames";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { getRoomTypeTitleTranslation } from "@docspace/shared/components/room-type/RoomType.utils";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { createPluginFileHandlers } from "@docspace/shared/utils/plugin-file-utils";

import { DeviceType } from "@docspace/shared/enums";
import { TileContent } from "@docspace/ui-kit/components/tiles/tile-content";
import withContent from "../../../../../HOCs/withContent";
import withBadges from "../../../../../HOCs/withBadges";

import styles from "./FilesTileContent.module.scss";

const FilesTileContent = ({
	t,
	item,
	titleWithoutExt,
	linkStyles,
	theme,
	isRooms,
	currentDeviceType,
	displayFileExtension,
}) => {
	const { fileExst, title, isTemplate } = item;

	const roomType = getRoomTypeTitleTranslation(t, item.roomType);

	let linkProps = { ...linkStyles };

	if (item?.isPlugin) {
		linkProps = createPluginFileHandlers(item, linkProps);
	}

	const lineHeight = isRooms ? "22px" : "20px";
	const fontSize =
		(isRooms && "16px") ||
		(!isRooms && currentDeviceType === DeviceType.desktop ? "13px" : "14px");

	return (
		<TileContent
			className={classNames(styles.tileContent, {
				[styles.isRooms]: isRooms,
				[styles.isTemplate]: isTemplate,
			})}
			style={{
				"--tile-content-line-height": lineHeight,
				"--tile-content-font-size": fontSize,
			}}
			sideColor={theme.filesSection.tilesView.sideColor}
			isFile={fileExst}
		>
			<Link
				className="item-file-name"
				containerWidth="100%"
				type="page"
				title={title}
				fontWeight={isTemplate ? 700 : 600}
				target="_blank"
				{...linkProps}
				color={theme.filesSection.tilesView.color}
				isTextOverflow
				dir="auto"
				view="tile"
			>
				{titleWithoutExt}
				{displayFileExtension ? (
					<span className="item-file-exst">{fileExst}</span>
				) : null}
			</Link>
			{isTemplate ? (
				<Text
					className="item-file-sub-name"
					color={theme.filesSection.tilesView.subTextColor}
					fontSize="13px"
					fontWeight={400}
					truncate
				>
					{roomType}
				</Text>
			) : null}
		</TileContent>
	);
};

export default inject(({ settingsStore, treeFoldersStore }) => {
	const { isRoomsFolder, isArchiveFolder, isTemplatesFolder } =
		treeFoldersStore;

	const isRooms = isRoomsFolder || isArchiveFolder;

	return {
		theme: settingsStore.theme,
		currentDeviceType: settingsStore.currentDeviceType,
		isRooms,
		isTemplate: isTemplatesFolder,
	};
})(
	observer(
		withTranslation(["Files", "Translations", "Notifications"])(
			withContent(withBadges(FilesTileContent)),
		),
	),
);
