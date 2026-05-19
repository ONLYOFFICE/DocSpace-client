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
import { withTranslation } from "react-i18next";
import { isTablet } from "@docspace/shared/utils";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { FilesRowContent as SimpleFilesRowContent } from "@docspace/shared/components/files-row";
import { getSpaceQuotaAsText } from "@docspace/shared/utils/common";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { createPluginFileHandlers } from "@docspace/shared/utils/plugin-file-utils";

import { SortByFieldName } from "@docspace/shared/enums";
import withContent from "../../../../../HOCs/withContent";

import {
	connectedCloudsTypeTitleTranslation,
	getRoomTypeName,
} from "../../../../../helpers/filesUtils";

const FilesRowContent = ({
	t,
	item,
	sectionWidth,
	titleWithoutExt,
	updatedDate,
	linkStyles,
	badgesComponent,
	quickButtons,
	theme,
	isRooms,
	isAIAgentsFolder,
	isTrashFolder,
	filterSortBy,
	createdDate,
	fileOwner,
	isDefaultRoomsQuotaSet,
	isIndexing,
	displayFileExtension,
	isPersonalReadOnly,
}) => {
	const {
		contentLength,
		fileExst,
		providerKey,
		title,
		isRoom,
		daysRemaining,
		fileType,
		tags,
		quotaLimit,
		usedSpace,
		order,
		roomType,
	} = item;

	const contentComponent = () => {
		switch (filterSortBy) {
			case SortByFieldName.Size:
				if (!contentLength) return "";
				return contentLength;

			case SortByFieldName.CreationDate:
				return createdDate;

			case SortByFieldName.Author:
				return fileOwner;

			case SortByFieldName.Type:
				return getFileTypeName(fileType, t);

			case SortByFieldName.RoomType:
				return getRoomTypeName(roomType, t);

			case SortByFieldName.Tags:
				if (tags?.length === 0) return "";
				return tags?.map((elem) => {
					return elem;
				});

			case SortByFieldName.UsedSpace:
				if (providerKey)
					return connectedCloudsTypeTitleTranslation(providerKey, t);
				if (usedSpace === undefined) return "";

				return getSpaceQuotaAsText(
					t,
					usedSpace,
					quotaLimit,
					isDefaultRoomsQuotaSet,
				);

			default:
				if (isTrashFolder || isPersonalReadOnly)
					return t("Files:DaysRemaining", {
						daysRemaining,
					});

				return updatedDate;
		}
	};

	const mainInfo = contentComponent();

	let linkProps = { ...linkStyles };

	if (item?.isPlugin) {
		linkProps = createPluginFileHandlers(item, linkProps);
	}

	return (
		<SimpleFilesRowContent
			sectionWidth={sectionWidth}
			isMobile={!isTablet()}
			isFile={fileExst || contentLength}
			sideColor={theme.filesSection.rowView.sideColor}
		>
			<Link
				className="row-content-link"
				containerWidth="55%"
				type="page"
				title={title}
				fontWeight="600"
				fontSize="15px"
				target="_blank"
				{...linkProps}
				isTextOverflow
				dir="auto"
				truncate
			>
				{titleWithoutExt}
				{displayFileExtension ? (
					<span className="item-file-exst">{fileExst}</span>
				) : null}
			</Link>
			<div className="badges">
				{badgesComponent}
				{!isRoom && !isRooms && !isAIAgentsFolder ? quickButtons : null}
			</div>

			{isIndexing ? (
				<Text
					containerMinWidth="200px"
					containerWidth="15%"
					fontSize="12px"
					fontWeight={400}
					className="row_update-text"
				>
					{`${t("Files:Index")} ${order}`}
				</Text>
			) : null}
			{mainInfo ? (
				<Text
					containerMinWidth="200px"
					containerWidth="15%"
					fontSize="12px"
					fontWeight={400}
					className="row_update-text"
				>
					{mainInfo}
				</Text>
			) : null}
		</SimpleFilesRowContent>
	);
};

export default inject(
	({
		currentQuotaStore,
		settingsStore,
		treeFoldersStore,
		filesStore,
		selectedFolderStore,
	}) => {
		const { filter, roomsFilter } = filesStore;
		const {
			isRecycleBinFolder,
			isRoomsFolder,
			isArchiveFolder,
			isTemplatesFolder,
			isPersonalReadOnly,
			isAIAgentsFolder,
		} = treeFoldersStore;
		const { isIndexedFolder } = selectedFolderStore;

		const isRooms = isRoomsFolder || isArchiveFolder || isTemplatesFolder;
		const filterSortBy =
			isRooms || isAIAgentsFolder ? roomsFilter.sortBy : filter.sortBy;

		const { isDefaultRoomsQuotaSet } = currentQuotaStore;

		return {
			filterSortBy,
			theme: settingsStore.theme,
			isTrashFolder: isRecycleBinFolder,
			isDefaultRoomsQuotaSet,
			isIndexing: isIndexedFolder,
			isPersonalReadOnly,
		};
	},
)(
	observer(
		withTranslation(["Files", "Translations", "Notifications", "Common"])(
			withContent(FilesRowContent),
		),
	),
);
