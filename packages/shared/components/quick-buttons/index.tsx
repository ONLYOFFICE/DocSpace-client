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
import { memo } from "react";
import isNil from "lodash/isNil";
import { Trans } from "react-i18next";
import { isTablet as isTabletDevice } from "react-device-detect";
import equal from "fast-deep-equal";

import FileActionsDownloadReactSvg from "PUBLIC_DIR/images/icons/16/download.react.svg";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import LifetimeReactSvgUrl from "PUBLIC_DIR/images/lifetime.react.svg?url";
import ExpirationLinkDateReactSvgUrl from "PUBLIC_DIR/images/icons/12/clock.svg?url";
import ShareSvgUrl from "PUBLIC_DIR/images/icons/12/share.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import LockedIconReactSvg from "PUBLIC_DIR/images/file.actions.locked.react.svg?url";
import LockedIconReact12Svg from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";
import FavoriteReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import FavoriteFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";

import { classNames, IconSizeType, isTablet, isDesktop } from "../../utils";
import {
	FolderType,
	RoomsType,
	ShareAccessRights,
	VectorizationStatus,
} from "../../enums";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Text } from "@docspace/ui-kit/components/text";
import { getDate, isExpired } from "../share/Share.helpers";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { isRoom } from "../../utils/typeGuards";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import type { QuickButtonsProps } from "./QuickButtons.types";
import { FailedVectorizationBadge } from "../failed-vectorization-badge";

export const QuickButtons = memo((props: QuickButtonsProps) => {
	const {
		t,
		item,
		onClickDownload,
		onCopyPrimaryLink,
		isDisabled,
		viewAs,
		isPublicRoom,
		onClickShare,
		isArchiveFolder,
		isIndexEditingMode,
		showLifetimeIcon,
		expiredDate,
		roomLifetime,
		onCreateRoom,
		isTemplatesFolder,
		onClickLock,
		onClickFavorite,
		onRetryVectorization,
		isTrashFolder,
		openShareTab,
	} = props;

	const { id, shared, security } = item;

	const isTile = viewAs === "tile";
	const desktopView = !isTile && isDesktop();

	const lockedBy = "lockedBy" in item ? (item.lockedBy as string) : undefined;
	const locked = "locked" in item ? item.locked : undefined;
	const iconLock = desktopView ? LockedIconReact12Svg : LockedIconReactSvg;
	const canLock = security && "Lock" in security ? security.Lock : undefined;

	const showShareIcon = !isNil(item.shareSettings?.PrimaryExternalLink);

	const tabletViewQuickButton = isTablet() || isTabletDevice;

	const sizeQuickButton: IconSizeType =
		isTile || tabletViewQuickButton ? IconSizeType.medium : IconSizeType.small;

	const isAvailableDownloadFile =
		isPublicRoom && item.security?.Download && viewAs === "tile";

	const isAvailableShareFile = item.canShare && !isRoom(item);

	const isAvailableShareForUser =
		item.canShare &&
		!isRoom(item) &&
		(item.rootFolderType === FolderType.USER ||
			item.rootFolderType === FolderType.SHARE);

	const isPublicRoomType =
		"roomType" in item &&
		(item.roomType === RoomsType.PublicRoom ||
			item.roomType === RoomsType.FormRoom ||
			item.roomType === RoomsType.CustomRoom);

	const haveLinksRight =
		item?.access === ShareAccessRights.RoomManager ||
		item?.access === ShareAccessRights.None;

	const showCopyLinkIcon =
		isPublicRoomType &&
		haveLinksRight &&
		item.shared &&
		!isArchiveFolder &&
		!isTile;

	const showFailedVectorizationBadge =
		isTile &&
		"vectorizationStatus" in item &&
		item.vectorizationStatus === VectorizationStatus.Failed;

	const hasRetryVectorizationAccess =
		security && "Vectorization" in security && security.Vectorization;
	const expirationLinkDate =
		item && "expirationDate" in item ? item.expirationDate : "";

	const getTooltipContent = () => {
		const text = roomLifetime?.deletePermanently
			? t("Common:FileWillBeDeletedPermanently", { date: expiredDate || "" })
			: t("Common:SectionMoveNotification", {
					sectionName: t("Common:TrashSection"),
					date: expiredDate || "",
				});
		return text;
	};

	const getLockTooltip = () => {
		return t("Common:LockedBy", { userName: lockedBy || "" });
	};

	const getExpirationLinkDateTooltipContent = () => {
		if (
			item.external &&
			(item.isLinkExpired ||
				(expirationLinkDate && isExpired(expirationLinkDate)))
		)
			return (
				<Text fontSize="12px" fontWeight={400} noSelect>
					{t("Common:LinkExpired")}
				</Text>
			);

		if (!expirationLinkDate) return null;

		const date = getDate(expirationLinkDate);

		return (
			<Text fontSize="12px" fontWeight={400} noSelect>
				<Trans
					t={t}
					ns="Common"
					values={{ date }}
					i18nKey="LinkExpirationDate"
					components={{ 1: <strong /> }}
				/>
			</Text>
		);
	};

	const getExpirationLinkDateText = () => {
		if (
			item.external &&
			(item.isLinkExpired ||
				(expirationLinkDate && isExpired(expirationLinkDate)))
		) {
			return t("Common:LinkExpired");
		}

		if (!expirationLinkDate) return null;

		// For complex content with Trans, we'll use custom Tooltip
		return null;
	};

	const expirationLinkDateText = getExpirationLinkDateText();
	const hasComplexExpirationContent =
		expirationLinkDate && !expirationLinkDateText;

	const onIconLockClick = () => {
		if (!canLock) {
			return;
		}

		if (onClickLock) onClickLock();
	};

	const showFavoriteIcon =
		!isRoom(item) && item?.isFavorite && !isPublicRoom && !isTrashFolder;

	return (
		<div className="badges additional-badges badges__quickButtons">
			{!isIndexEditingMode ? (
				<>
					{showLifetimeIcon ? (
						<div
							data-tooltip-id="info-tooltip"
							data-tooltip-content={getTooltipContent()}
							data-tooltip-place="bottom"
						>
							<IconButton
								iconName={LifetimeReactSvgUrl}
								className="badge file-lifetime icons-group"
								size={sizeQuickButton}
								isClickable
								isDisabled={isDisabled}
							/>
						</div>
					) : null}

					{isAvailableDownloadFile ? (
						<IconButton
							iconNode={<FileActionsDownloadReactSvg />}
							className="badge download-file icons-group"
							size={sizeQuickButton}
							onClick={onClickDownload}
							isDisabled={isDisabled}
							hoverColor="accent"
							title={t("Common:Download")}
						/>
					) : null}
					{isTemplatesFolder ? (
						<IconButton
							iconName={CreateRoomReactSvgUrl}
							className="badge create-room icons-group"
							size={IconSizeType.medium}
							onClick={onCreateRoom}
							isDisabled={isDisabled}
							hoverColor="accent"
							title={t("Common:CreateRoom")}
						/>
					) : null}
					{showCopyLinkIcon ? (
						<IconButton
							iconName={LinkReactSvgUrl}
							className="badge copy-link icons-group"
							size={sizeQuickButton}
							onClick={onCopyPrimaryLink}
							isDisabled={isDisabled}
							hoverColor="accent"
							title={t("Common:CopySharedLink")}
						/>
					) : null}
					{isAvailableShareFile && !isAvailableShareForUser ? (
						<IconButton
							iconName={LinkReactSvgUrl}
							className={classNames("badge copy-link icons-group", {
								"create-share-link": !item.shared && !showShareIcon,
								"link-shared": item.shared || showShareIcon,
							})}
							size={sizeQuickButton}
							onClick={onClickShare}
							color={shared || showShareIcon ? "accent" : undefined}
							isDisabled={isDisabled}
							hoverColor="accent"
							title={t("Common:CopySharedLink")}
						/>
					) : null}
					{isAvailableShareForUser ? (
						<IconButton
							iconName={ShareSvgUrl}
							className={classNames("badge copy-link icons-group", {
								"create-share-link": !item.sharedForUser && !item.shared,
								"link-shared": item.sharedForUser || item.shared,
							})}
							size={sizeQuickButton}
							onClick={openShareTab}
							color={item.sharedForUser || item.shared ? "accent" : undefined}
							isDisabled={isDisabled}
							hoverColor="accent"
						/>
					) : null}
					{locked && isTile ? (
						<div
							data-tooltip-id={
								lockedBy && !canLock ? "info-tooltip" : undefined
							}
							data-tooltip-content={
								lockedBy && !canLock ? getLockTooltip() : undefined
							}
							data-tooltip-place="bottom"
						>
							<IconButton
								iconName={iconLock}
								className={classNames("badge lock-file icons-group", {
									"file-locked": locked,
								})}
								size={sizeQuickButton}
								data-id={id}
								data-locked={!!locked}
								onClick={onIconLockClick}
								color="accent"
								title={t("Common:UnblockFile")}
							/>
						</div>
					) : null}

					{expirationLinkDate ? (
						<>
							<div
								data-tooltip-id={
									hasComplexExpirationContent ? undefined : "info-tooltip"
								}
								data-tooltip-content={
									!hasComplexExpirationContent
										? expirationLinkDateText
										: undefined
								}
								data-tooltip-place="bottom"
							>
								<IconButton
									iconName={ExpirationLinkDateReactSvgUrl}
									className="badge expiration-link-date icons-group"
									isClickable
									size={sizeQuickButton}
									isDisabled={isDisabled}
									data-tooltip-id={
										hasComplexExpirationContent
											? `expirationLinkDateTooltip${item.id}`
											: undefined
									}
									color={globalColors.lightErrorStatus}
								/>
							</div>
							{hasComplexExpirationContent ? (
								<Tooltip
									id={`expirationLinkDateTooltip${item.id}`}
									place="bottom"
									getContent={getExpirationLinkDateTooltipContent}
									maxWidth="300px"
								/>
							) : null}
						</>
					) : null}

					{showFavoriteIcon ? (
						<IconButton
							iconName={
								item?.isFavorite ? FavoriteFillReactSvgUrl : FavoriteReactSvgUrl
							}
							className={classNames("badge icons-group")}
							size={sizeQuickButton}
							onClick={onClickFavorite}
							color="accent"
							isDisabled={isDisabled}
							title={t("Common:Favorites")}
						/>
					) : null}

					{showFailedVectorizationBadge ? (
						<FailedVectorizationBadge
							className={classNames("badge icons-group")}
							size="medium"
							onRetryVectorization={onRetryVectorization}
							withRetryVectorization={hasRetryVectorizationAccess}
						/>
					) : null}
				</>
			) : null}
		</div>
	);
}, equal);
