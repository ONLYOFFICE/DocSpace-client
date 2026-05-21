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

import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";

import React from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import type { TLogo } from "@docspace/ui-kit/types";
import { RoomIcon, type TModel } from "@docspace/ui-kit/components";

import styles from "./icons.module.scss";

type ItemIconProps = {
	icon?: string;
	fileExst?: string;
	isPrivacy?: boolean;
	isRoom?: boolean;
	title: string;
	logo?: TLogo | string;
	color?: string;
	isArchive?: boolean;
	badgeUrl?: string;
	size?: string;
	radius?: string;
	withEditing?: boolean;
	showDefault?: boolean;
	imgClassName?: string;
	model?: TModel[];
	onChangeFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className: string;
	isTemplate?: boolean;
	dataTestId?: string;
};

const ItemIcon = ({
	icon,
	fileExst,
	isPrivacy,
	isRoom,
	title,
	logo,
	color,
	isArchive,
	badgeUrl,
	size,
	radius,
	withEditing,
	showDefault,
	imgClassName,
	model,
	onChangeFile,
	className,
	isTemplate,
	dataTestId,
}: ItemIconProps) => {
	const isLoadedRoomIcon = !!logo;
	const showDefaultRoomIcon = !isLoadedRoomIcon && isRoom;

	return (
		<>
			<div
				className={classNames(styles.iconWrapper, { [styles.isRoom]: isRoom })}
			>
				<RoomIcon
					color={color}
					title={title}
					size={size}
					radius={radius}
					isArchive={isArchive}
					showDefault={showDefault || showDefaultRoomIcon}
					imgClassName={imgClassName || "react-svg-icon"}
					logo={isRoom ? logo : icon}
					badgeUrl={badgeUrl || ""}
					isTemplate={isTemplate}
					withEditing={withEditing}
					model={model}
					onChangeFile={onChangeFile}
					className={className}
					dataTestId={dataTestId}
				/>
			</div>
			{isPrivacy && fileExst ? (
				<div
					className={styles.encryptedFileIcon}
					style={{ backgroundImage: `url(${SecuritySvgUrl})` }}
				/>
			) : null}
		</>
	);
};

export default inject(({ treeFoldersStore }: TStore) => {
	return { isPrivacy: treeFoldersStore.isPrivacyFolder };
})(observer(ItemIcon));
