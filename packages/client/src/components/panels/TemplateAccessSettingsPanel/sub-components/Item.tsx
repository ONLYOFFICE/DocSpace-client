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

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ReactSVG } from "react-svg";
import {
	Avatar,
	AvatarRole,
	AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import cloneDeep from "lodash/cloneDeep";
import { TTranslation } from "@docspace/shared/types";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import styles from "../TemplateAccessSettingsPanel.module.scss";

type ItemProps = {
	t: TTranslation;
	item: TSelectorItem;
	setInviteItems: (items: TSelectorItem[]) => void;
	inviteItems: TSelectorItem[];
	isDisabled: boolean;
	index?: number;
};

const Item = ({
	t,
	item,
	setInviteItems,
	inviteItems,
	isDisabled,
	index,
}: ItemProps) => {
	const { avatar, displayName, email, id, isGroup, name: groupName } = item;

	const name = isGroup
		? groupName
		: avatar
			? displayName !== ""
				? displayName
				: email
			: email;
	const source = avatar || (isGroup ? "" : AtReactSvgUrl);

	const removeItem = () => {
		const itemIndex = inviteItems.findIndex(
			(inviteItem) => inviteItem.id === id,
		);

		let newItems = cloneDeep(inviteItems);

		if (newItems[itemIndex].templateAccess) {
			newItems[itemIndex].templateAccess = ShareAccessRights.None;
		} else {
			newItems = newItems.filter((inviteItem) => inviteItem.id !== id);
		}

		setInviteItems(newItems);
	};

	const canDelete = !item.templateIsOwner && !isDisabled;

	return (
		<>
			<Avatar
				size={AvatarSize.min}
				role={AvatarRole.none}
				source={source}
				isGroup={isGroup}
				userName={groupName}
				className="invite-input-avatar"
				data-testid={`template_access_settings_avatar_${index ?? id}`}
			/>
			<div className={styles.inviteUserBody}>
				<div className="invite-input-item">
					<Text truncate className="invite-input-text">
						{Encoder.htmlDecode(name ?? "")}
					</Text>
					<Text truncate className="invite-input-text_me">
						{item.isOwner ? `(${t("Common:MeLabel")})` : null}
					</Text>
				</div>
			</div>
			{canDelete ? (
				<ReactSVG
					className="remove-icon"
					src={RemoveReactSvgUrl}
					onClick={removeItem}
					data-testid={`template_access_settings_remove_button_${index ?? id}`}
				/>
			) : null}
		</>
	);
};

export default Item;
