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

import Security12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/security.react.svg?url";
import Lock12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";
import PrivateRoom32SvgUrl from "PUBLIC_DIR/images/icons/32/room/private.svg?url";

import React from "react";
import { ReactSVG } from "react-svg";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import type { TLogo } from "@docspace/ui-kit/types";
import { RoomIcon, type TModel } from "@docspace/ui-kit/components";

import styles from "./icons.module.scss";

type ItemIconProps = {
	icon?: string;
	fileExst?: string;
	isPrivacy?: boolean;
	isRoom?: boolean;
	isPrivateRoom?: boolean;
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
	encrypted?: boolean;
	hasEncryptionKeys?: boolean;
};

const ItemIcon = ({
	icon,
	fileExst,
	isPrivacy,
	isRoom,
	isPrivateRoom,
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
	encrypted,
	hasEncryptionKeys,
}: ItemIconProps) => {
	const { t } = useTranslation(["Common"]);
	const isLoadedRoomIcon = !!logo;
	const showDefaultRoomIcon = !isLoadedRoomIcon && isRoom;

	const showLegacyEncryptedBadge =
		(isPrivacy && !!fileExst) || (isRoom && !!isPrivateRoom && !isArchive);

	const isEncryptedFile = !!encrypted && !!fileExst;
	const showNoAccessBadge = isEncryptedFile && !hasEncryptionKeys;

	const showEncryptedBadge =
		showLegacyEncryptedBadge || isEncryptedFile;

	const showPrivateRoomDefaultIcon =
		!!isRoom && !!isPrivateRoom && !isArchive && !isLoadedRoomIcon && !isTemplate;

	const badgeSrc = showNoAccessBadge ? Lock12ReactSvgUrl : Security12ReactSvgUrl;
	const badgeTitle = showNoAccessBadge
		? t("Common:NoAccessToEncryptedFile")
		: isEncryptedFile
			? t("Common:EncryptedFile")
			: undefined;

	return (
		<div
			className={classNames(styles.iconWrapper, {
				[styles.isRoom]: isRoom,
				[styles.hasEncryptedBadge]: showEncryptedBadge,
			})}
		>
			{showPrivateRoomDefaultIcon ? (
				<ReactSVG
					className={classNames(className, styles.privateRoomDefaultIcon)}
					src={PrivateRoom32SvgUrl}
					data-testid={dataTestId ?? "private-room-icon"}
				/>
			) : (
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
			)}
			{showEncryptedBadge ? (
				<ReactSVG
					className={classNames(styles.encryptedFileIcon, {
						[styles.noAccessIcon]: showNoAccessBadge,
					})}
					src={badgeSrc}
					title={badgeTitle}
				/>
			) : null}
		</div>
	);
};

export default inject(({ treeFoldersStore, userStore }: TStore) => {
	const keys = userStore?.encryptionKeys;
	return {
		isPrivacy: treeFoldersStore.isPrivacyFolder,
		hasEncryptionKeys: Array.isArray(keys) && keys.length > 0,
	};
})(observer(ItemIcon));
