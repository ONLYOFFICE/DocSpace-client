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
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TFile } from "@docspace/shared/api/files/types";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Text } from "@docspace/ui-kit/components/text";
import { getFolderPath } from "@docspace/shared/api/files";

import styles from "./CellStyles.module.scss";

type TPath = {
	id: number;
	title: string;
};

type LocationCellProps = {
	sideColor?: string;
	item: TFile;
};

const LocationCell = ({ sideColor, item }: LocationCellProps) => {
	const {
		originRoomTitle,
		originId: originFolderId,
		originRoomId,
		originTitle,
		id,
	} = item;

	const { t } = useTranslation("Common");
	const [path, setPath] = useState<TPath[]>([]);
	const [isPathLoading, setIsPathLoading] = useState(false);

	const title = item.requestToken
		? t("Common:ViaLink")
		: originRoomTitle || originTitle;
	const originId = originFolderId || originRoomId;
	const withTooltip = item.requestToken ? false : !!title;

	const getPath = useCallback(async () => {
		if (path.length || !originId || !title) return;

		setIsPathLoading(true);
		try {
			const folderPath = await getFolderPath(originId);
			setPath(folderPath);
		} catch (e) {
			console.error(e);
			setPath([{ id: 0, title }]);
		} finally {
			setIsPathLoading(false);
		}
	}, [path, originId, title]);

	return [
		<Text
			key="cell"
			fontSize="12px"
			fontWeight={600}
			color={sideColor}
			className={`${styles.styledText} row_update-text`}
			truncate
			data-tooltip-id={`${id}`}
			data-tip=""
		>
			{title || "—"}
		</Text>,

		withTooltip ? (
			<Tooltip
				place="bottom"
				key="tooltip"
				id={`${id}`}
				afterShow={getPath}
				getContent={() => (
					<span>
						{isPathLoading ? (
							<Loader
								color={globalColors.black}
								size="12px"
								type={LoaderTypes.track}
							/>
						) : (
							path.map((pathPart, i) => (
								<Text
									key={pathPart.id}
									isBold={i === 0}
									isInline
									fontSize="12px"
								>
									{i === 0 ? pathPart.title : `/${pathPart.title}`}
								</Text>
							))
						)}
					</span>
				)}
			/>
		) : null,
	];
};

export default LocationCell;
