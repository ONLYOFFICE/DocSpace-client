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

import { decode } from "he";
import { useId, useState } from "react";
import classNames from "classnames";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { isMobileOnly, isMobile } from "react-device-detect";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import EmailPlusReactSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";
import EveryoneIconUrl from "PUBLIC_DIR/images/icons/16/departments.react.svg?url";

import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import { getUserType, getUserTypeTranslation } from "../../../utils/common";
import { TUser } from "../../../api/people/types";
import { isNextImage } from "../../../utils/typeGuards";
import type { StaticImageData } from "../../../types";
import { createLoader } from "../../../utils/createLoader";

import {
	Avatar,
	AvatarRole,
	AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import {
	ComboBoxSize,
	type TOption,
} from "@docspace/ui-kit/components/combobox";
import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";

import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

import styles from "../Share.module.scss";
import type { UserProps } from "../Share.types";
import { getBrandName } from "@docspace/shared/constants/brands";

export const User = ({
	user,
	currentUser,

	showInviteIcon,
	onRepeatInvitation,

	onClickGroup,

	options,
	hideCombobox,
	selectedOption,
	onSelectOption,
}: UserProps) => {
	const id = useId();
	const theme = useTheme();
	const { t } = useTranslation(["Common"]);

	const [isLoading, setIsLoading] = useState(false);

	const handleSelectOption = async (option: TOption) => {
		if (!onSelectOption) return;

		const { endLoader, startLoader } = createLoader();

		startLoader(() => {
			setIsLoading(true);
		});

		onSelectOption(option).finally(() => {
			endLoader(() => {
				setIsLoading(false);
			});
		});
	};

	if (
		"displayName" in user &&
		!user.displayName &&
		"name" in user &&
		!user.name &&
		"email" in user &&
		!user.email
	)
		return null;

	const isExpect = user.isExpect;
	const isSystem = "isSystem" in user && user.isSystem;
	const canChangeUserRole = "canEditAccess" in user && user.canEditAccess;

	const type = getUserType(user as unknown as TUser);
	const typeLabel = getUserTypeTranslation(type, t);

	const userPhotoUrl = isNextImage(DefaultUserPhotoUrl)
		? (DefaultUserPhotoUrl as StaticImageData).src
		: DefaultUserPhotoUrl;

	const userAvatar =
		"hasAvatar" in user && user.hasAvatar
			? user.avatar
			: "isGroup" in user && user.isGroup
				? ""
				: userPhotoUrl;

	const withTooltip = "isOwner" in user && (user.isOwner || user.isAdmin);

	const uniqueTooltipId = `userTooltip_${id}`;

	const tooltipContent = `${
		"isOwner" in user && user.isOwner
			? t("Common:PortalOwner", { productName: getBrandName("ProductName") })
			: t("Common:PortalAdmin", { productName: getBrandName("ProductName") })
	}. ${t("Common:HasFullAccess")}`;

	const itemAvatar = isSystem
		? EveryoneIconUrl
		: isExpect
			? AtReactSvgUrl
			: userAvatar || "";

	if ("isTitle" in user && user.isTitle) {
		return (
			<div
				className={classNames(styles.userTypeHeader, {
					[styles.isExpect]: isExpect,
				})}
				data-testid="info_panel_members_user_type_header"
			>
				<Text className="title">
					{"displayName" in user ? user.displayName : ""}
				</Text>

				{showInviteIcon ? (
					<IconButton
						className="icon"
						title={t("Common:RepeatInvitation")}
						iconName={EmailPlusReactSvgUrl}
						isFill
						onClick={onRepeatInvitation}
						size={16}
						data-testid="info_panel_members_repeat_invitation_button"
					/>
				) : null}
			</div>
		);
	}

	return (
		<div
			className={classNames(styles.user, {
				[styles.isExpect]: isExpect,
				[styles.isSystem]: isSystem,
			})}
			key={user.id}
			data-testid="info_panel_members_user"
		>
			<Avatar
				role={type as unknown as AvatarRole}
				className="avatar"
				size={AvatarSize.min}
				source={itemAvatar}
				userName={
					isExpect ? "" : "displayName" in user ? user.displayName : user.name
				}
				withTooltip={withTooltip}
				tooltipContent={tooltipContent}
				hideRoleIcon={!withTooltip}
				isGroup={"isGroup" in user ? user.isGroup : false}
				dataTestId="info_panel_members_user_avatar"
			/>
			<div className="user_body-wrapper">
				<div className="name-wrapper">
					{"isGroup" in user && user.isGroup ? (
						<Link
							className="name"
							type={LinkType.action}
							onClick={() => onClickGroup?.(user)}
							title={decode(user.name)}
							noHover={isSystem}
							dataTestId="info_panel_members_user_group_link"
						>
							{decode(user.name)}
						</Link>
					) : (
						<Text className="name" data-tooltip-id={uniqueTooltipId}>
							{"displayName" in user && user.displayName
								? decode(user.displayName)
								: null}
						</Text>
					)}

					{currentUser?.id === user.id ? (
						<div className="me-label">&nbsp;{`(${t("Common:MeLabel")})`}</div>
					) : null}
				</div>
				{!("isGroup" in user && user.isGroup) ? (
					<div className="role-email" style={{ display: "flex" }}>
						<Text
							className="label"
							fontWeight={400}
							fontSize="12px"
							truncate
							color={theme.infoPanel.members.subtitleColor}
							dir="auto"
						>
							{`${typeLabel} | ${(user as TUser).email}`}
						</Text>
					</div>
				) : null}
			</div>

			{selectedOption && options && !hideCombobox ? (
				<div className="role-wrapper">
					{canChangeUserRole ? (
						<AccessRightSelect
							modernView
							className="role-combobox"
							selectedOption={selectedOption}
							usePortalBackdrop
							onSelect={handleSelectOption}
							accessOptions={options}
							noSelect={false}
							manualWidth="300px"
							directionY="both"
							size={ComboBoxSize.content}
							scaled={false}
							scaledOptions={false}
							isAside={isMobile}
							withBlur={isMobile}
							isLoading={isLoading}
							isMobileView={isMobileOnly}
							// fixedDirection={isMobile}
							shouldShowBackdrop={isMobile}
							dataTestId="info_panel_members_user_role_combobox"
						/>
					) : (
						<TooltipContainer
							as="div"
							className="disabled-role-combobox"
							title={t("Common:Role")}
						>
							{selectedOption.label}
						</TooltipContainer>
					)}
				</div>
			) : null}
		</div>
	);
};
