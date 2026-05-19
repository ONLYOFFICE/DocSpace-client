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

import React from "react";
import classNames from "classnames";

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import { TileSkeleton } from "./Tile";
import type { TilesSkeletonProps } from "./Tiles.types";
import styles from "./Tiles.module.scss";

export const TilesSkeleton = ({
	foldersCount = 2,
	filesCount = 8,
	withTitle = true,
	isRooms = false,
	...rest
}: TilesSkeletonProps) => {
	const folders = [];
	const files = [];

	for (let i = 0; i < foldersCount; i += 1) {
		folders.push(<TileSkeleton isFolder key={`tile-loader-${i}`} {...rest} />);
	}

	for (let i = 0; i < filesCount; i += 1) {
		files.push(<TileSkeleton key={`files-loader-${i}`} {...rest} />);
	}

	const tilesClassNames = classNames(styles.tilesSkeleton, {
		[styles.tilesSkeletonRooms]: isRooms,
	});

	return (
		<div className={styles.tilesWrapper}>
			{foldersCount > 0 ? (
				<RectangleSkeleton
					height="22px"
					width="78px"
					className="folders"
					animate
					{...rest}
				/>
			) : null}
			<div className={tilesClassNames}>{folders}</div>

			{filesCount > 0
				? withTitle && (
						<RectangleSkeleton
							height="22px"
							width="103px"
							className="files"
							animate
							{...rest}
						/>
					)
				: null}
			<div className={tilesClassNames}>{files}</div>
		</div>
	);
};
