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
import { use, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobile, isMobileOnly } from "react-device-detect";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import SendClockIcon from "PUBLIC_DIR/images/send.clock.react.svg";

import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Avatar, AvatarSize } from "@docspace/ui-kit/components/avatar";
import {
	ComboBoxSize,
	type TOption,
} from "@docspace/ui-kit/components/combobox";
import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";
import { getShareAccessRightOptions } from "../../../../components/share/Share.helpers";

import {
	updateFileMemberAccess,
	updateRoomMemberRole,
} from "../../../../api/rooms";

import { EmployeeStatus, ShareAccessRights } from "../../../../enums";
import {
	isFile,
	isNextImage,
	isRoom as isRoomCheck,
} from "../../../../utils/typeGuards";
import {
	getUserAvatarRoleByType,
	getUserType,
	getUserTypeTranslation,
} from "../../../../utils/common";

import type { TGroupMemberInvitedInRoom } from "../../../../api/groups/types";

import { getAccessOptions } from "../../../../utils/getAccessOptions";
import { filterPaidRoleOptions } from "../../../../utils/filterPaidRoleOptions";
import { getUserRoleOptions } from "../../../../utils/room-members/getUserRoleOptions";

import { EditGroupMembersDialogContext } from "../../EditGroupMembersDialog.provider";

import styles from "./GroupMember.module.scss";

interface GroupMemberProps {
	member: TGroupMemberInvitedInRoom;
}

const GroupMember = ({ member }: GroupMemberProps) => {
	const { user } = member;
	const isExpect = user.status === EmployeeStatus.Pending;

	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation("Common");

	const { infoPanelSelection, standalone } = use(EditGroupMembersDialogContext);

	const isRoom = isRoomCheck(infoPanelSelection);

	const roomType = isRoom ? infoPanelSelection.roomType : undefined;

	const options = useMemo(() => {
		if (isRoom) {
			const accessOptions = getAccessOptions(
				t,
				roomType,
				false,
				false,
				member.owner,
				user.isAdmin,
				standalone,
			);

			return user.isAdmin || user.isOwner || user.isRoomAdmin
				? accessOptions
				: filterPaidRoleOptions(
						accessOptions as {
							access: ShareAccessRights;
							key: string;
							label: string;
						}[],
					);
		}

		if (!infoPanelSelection) return [];

		return getShareAccessRightOptions(t, infoPanelSelection, false, false);
	}, [isRoom, roomType, member.owner, user.isAdmin, standalone]);

	const selectedAccessRight = useMemo(() => {
		return member.owner
			? getUserRoleOptions(t).portalAdmin
			: options.find(
					(option) =>
						"access" in option &&
						option.access === (member.userAccess || member.groupAccess),
				);
	}, [options, member.userAccess, member.groupAccess, isRoom]);

	const hasIndividualRightsInRoom =
		member.owner ||
		(member.userAccess && member.userAccess !== member.groupAccess);

	const type = getUserType(user);

	const avatarRole = getUserAvatarRoleByType(type);

	const typeLabel = getUserTypeTranslation(type, t);

	const manualWidth = isRoom ? "auto" : "400px";

	const defaultAvatar = isNextImage(DefaultUserPhotoUrl)
		? DefaultUserPhotoUrl.src
		: DefaultUserPhotoUrl;

	const onChangeRole = async (userRoleOption: TOption) => {
		setIsLoading(true);

		const response = isFile(infoPanelSelection)
			? updateFileMemberAccess(infoPanelSelection?.id, {
					share: [{ shareTo: user.id, access: userRoleOption.access }],
					notify: false,
					sharingMessage: "",
				})
			: updateRoomMemberRole(infoPanelSelection?.id, {
					invitations: [{ id: user.id, access: userRoleOption.access }],
					notify: false,
					sharingMessage: "",
				});

		response
			.then(() => {
				if (userRoleOption.access) {
					member.userAccess = userRoleOption.access;
				}
			})
			.catch((err) => toastr.error(err))
			.finally(() => setIsLoading(false));
	};

	return (
		<div
			className={`${styles.groupMember}${isExpect ? ` ${styles.groupMemberExpect}` : ""}`}
			key={user.id}
		>
			<Avatar
				role={avatarRole}
				className={styles.avatar}
				size={AvatarSize.min}
				userName={isExpect ? "" : user.displayName}
				source={
					isExpect
						? AtReactSvgUrl
						: user.hasAvatar
							? user.avatar
							: defaultAvatar
				}
			/>

			<div className={styles.userBodyWrapper}>
				<div className={styles.info}>
					<div className={styles.infoBox}>
						<Text
							className={styles.name}
							data-tooltip-id={`userTooltip_${Math.random()}`}
							noSelect
						>
							{decode(user.displayName)}
						</Text>
						{isExpect ? (
							<SendClockIcon className={styles.sendClockIcon} />
						) : null}
					</div>
					<Text className={styles.email} noSelect>
						<span dir="auto">{typeLabel}</span> |{" "}
						<span dir="ltr">{user.email}</span>
					</Text>
				</div>
			</div>

			<div className={styles.individualRightsTooltip}>
				{hasIndividualRightsInRoom ? (
					<HelpButton
						place="left"
						offsetRight={0}
						openOnClick={false}
						tooltipContent={
							<Text fontSize="12px" fontWeight={600}>
								{isRoom
									? t("Common:IndividualRights")
									: t("Common:IndividualRightsShare")}
							</Text>
						}
					/>
				) : null}
			</div>

			{selectedAccessRight && options ? (
				<div className={styles.roleWrapper}>
					{member.canEditAccess ? (
						<AccessRightSelect
							className="role-combobox"
							selectedOption={selectedAccessRight as TOption}
							accessOptions={options as TOption[]}
							scaled={false}
							withBackdrop={isMobile}
							size={ComboBoxSize.content}
							modernView
							title={t("Common:Role")}
							manualWidth={manualWidth}
							isMobileView={isMobileOnly}
							directionY="both"
							displaySelectedOption
							onSelect={onChangeRole}
							isLoading={isLoading}
						/>
					) : (
						<Text
							className={styles.disabledRoleCombobox}
							title={t("Common:Role")}
							fontWeight={600}
							noSelect
						>
							{"label" in selectedAccessRight
								? selectedAccessRight.label
								: false}
						</Text>
					)}
				</div>
			) : null}
		</div>
	);
};

export default GroupMember;

// export default inject(({ infoPanelStore, settingsStore }: TStore) => {
//   const { infoPanelSelection } = infoPanelStore;
//   const { standalone } = settingsStore;

//   return {
//     infoPanelSelection,
//     standalone,
//   };
// })(observer(GroupMember));
