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

import { withTranslation } from "react-i18next";
import {
	Avatar,
	AvatarRole,
	AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { TCreatedBy, TTranslation } from "@docspace/shared/types";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import styles from "./TemplateAccess.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const MAX_AVATARS_COUNT = 3;

type TemplateAccessType = {
	t: TTranslation;
	roomOwner: TCreatedBy;
	inviteItems: TSelectorItem[];
	onOpenAccessSettings: VoidFunction;
	isAvailable: boolean;
};

const TemplateAccess = ({
	t,
	roomOwner,
	inviteItems: listItems,
	onOpenAccessSettings,
	isAvailable = false,
}: TemplateAccessType) => {
	const inviteItems = [...listItems].filter(
		(l) => l.templateAccess !== ShareAccessRights.None,
	);

	const userName = Encoder.htmlDecode(roomOwner.displayName ?? "");

	const usersList = inviteItems.filter((i) => !i.isGroup && !i.templateIsOwner);

	const groupsList = inviteItems.filter((i) => i.isGroup);

	const avatarList = [];

	const itemsLength = inviteItems.length;

	const getItemAvatarSource = (item: TSelectorItem | TCreatedBy) =>
		item?.hasAvatar
			? item.avatar
			: ("avatarSmall" in item && item?.avatarSmall) || "";

	const maxAvatarsCount =
		itemsLength >= MAX_AVATARS_COUNT ? MAX_AVATARS_COUNT : itemsLength;

	let index = 0;
	while (avatarList.length !== maxAvatarsCount) {
		const item = inviteItems[index];

		avatarList.push(
			<Avatar
				className={styles.templateAccessAvatar}
				size={AvatarSize.min}
				role={AvatarRole.none}
				isDefaultSource={roomOwner.hasAvatar}
				source={getItemAvatarSource(item)}
				isGroup={item?.isGroup}
				userName={(("userName" in item && item?.userName) || item.name) ?? ""}
				key={index}
			/>,
		);
		index++;
	}

	const getAccessLabel = () => {
		if (usersList.length) {
			if (groupsList.length) {
				return t("Files:MeAndMembersAndGroups", {
					membersCount: `${usersList.length}`,
					groupsCount: `${groupsList.length}`,
				});
			}
			return t("Files:MeAndMembers", { membersCount: `${usersList.length}` });
		}
		if (groupsList.length) {
			return t("Files:MeAndGroups", { groupsCount: `${groupsList.length}` });
		}

		return "";
	};

	const accessLabel = getAccessLabel();

	return (
		<div className={styles.templateAccess}>
			<Text
				className={styles.templateAccessLabel}
				fontWeight={600}
				fontSize="13px"
			>
				{`${t("Files:AccessToTemplate")}:`}
			</Text>

			{isAvailable ? (
				<PublicRoomBar
					headerText={t("Files:TemplateAvailable")}
					bodyText={
						<>
							<div className={styles.templateAccessDescription}>
								{t("Files:TemplateAvailableDescription", {
									productName: getBrandName("ProductName"),
								})}
							</div>
							<Link
								className="template-access_link"
								isHovered
								type={LinkType.action}
								fontWeight={600}
								fontSize="13px"
								onClick={onOpenAccessSettings}
							>
								{t("Files:AccessSettingsTitle")}
							</Link>
						</>
					}
				/>
			) : (
				<div className={styles.templateAccessWrapper}>
					<div className={styles.templateAccessAvatarContainer}>
						{itemsLength === 1 ? (
							<>
								<Avatar
									size={AvatarSize.min}
									role={AvatarRole.none}
									isDefaultSource={roomOwner.hasAvatar}
									source={getItemAvatarSource(roomOwner)}
									userName={userName}
								/>
								<div className={styles.templateAccessDisplayName}>
									<Text fontWeight={600} fontSize="13px">
										{userName}
									</Text>
									<Text className={styles.meLabel}>
										({t("Common:MeLabel")})
									</Text>
								</div>
							</>
						) : (
							<>
								<div className={styles.accessAvatarContainer}>{avatarList}</div>
								<Text fontWeight={600} fontSize="14px">
									{accessLabel}
								</Text>
							</>
						)}
					</div>

					<Link
						className={styles.templateAccessLink}
						isHovered
						type={LinkType.action}
						fontWeight={600}
						fontSize="13px"
						onClick={onOpenAccessSettings}
					>
						{t("Files:AccessSettingsTitle")}
					</Link>
				</div>
			)}
		</div>
	);
};

export default withTranslation(["Common", "Files"])(TemplateAccess);
