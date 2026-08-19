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

import { useMemo, FC } from "react";
import { useTranslation } from "react-i18next";

import { isFile } from "../../../utils/typeGuards";
import { AnalyticsEvents, EmployeeStatus, ShareAccessRights } from "../../../enums";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { ShareLinkService } from "../../../services/share-link.service";
import type { TShareToUser } from "../../../api/files/types";


// import { SelectorAccessRightsMode } from "../../selector/Selector.enums";
import type {
	TAccessRight,
	TOnSubmit,
} from "@docspace/ui-kit/components/selector";

import { getShareAccessRightOptions } from "../Share.helpers";
import { toastr, TData } from "@docspace/ui-kit/components/toast";

import type { ShareSelectorProps } from "./Selector.types";

export const ShareSelector: FC<ShareSelectorProps> = ({
	item,
	onClose,
	onBackClick,
	onCloseClick,
	onSubmit,
	withAccessRights,
}) => {
	const { t } = useTranslation("Common");

	const getDefaultAccessRight = () => {
		const isForm = isFile(item) && item.isForm;

		const accessDefault = isForm
			? ShareAccessRights.FormFilling
			: ShareAccessRights.ReadOnly;

		return accessDefault;
	};

	const handleSubmit: TOnSubmit = async (selectedItems, accessRight) => {
		const share: TShareToUser[] = selectedItems.map((selectedItem) => {
			return {
				shareTo: selectedItem.id!.toString(),
				access:
					(accessRight?.access as ShareAccessRights) ?? getDefaultAccessRight(),
			};
		});

		try {
			const list = await ShareLinkService.shareItemToUser(share, item);

			onSubmit?.(list);

			const isRoomItem = "roomType" in item && item.roomType !== undefined;
			const isFileItem = isFile(item);
			if (isRoomItem || isFileItem) {
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					event: isRoomItem ? AnalyticsEvents.RoomShared : AnalyticsEvents.FileShared,
					id: item.id,
					parentId: isFileItem ? item.folderId : item.parentId,
				});
			}

			toastr.success(t("Common:RoomCreateUser"));
		} catch (error) {
			toastr.error(error as TData);
			console.error(error);
		} finally {
			onClose();
		}
	};

	const accessOptions = useMemo(
		() => getShareAccessRightOptions(t, item, false) as TAccessRight[],
		[t, item],
	);

	const selectedAccessRight = useMemo(() => {
		const isForm = isFile(item) && item.isForm;

		const accessDefault = isForm
			? ShareAccessRights.FormFilling
			: ShareAccessRights.ReadOnly;

		return accessOptions.find((a) => a.access === accessDefault) || null;
	}, [accessOptions]);

	const accessRightsProps = withAccessRights
		? ({
				withAccessRights: true,
				accessRights: accessOptions,
				selectedAccessRight,
				onAccessRightsChange: () => {},
				// accessRightsMode: isFile(item)
				//   ? SelectorAccessRightsMode.Compact
				//   : SelectorAccessRightsMode.Detailed,
			} as const)
		: {};

	const targetEntityType = isFile(item) ? "file" : "folder";

	const filter = useMemo(() => {
		return {
			employeeStatus: EmployeeStatus.Active,
		};
	}, []);

	return (
		<PeopleSelector
			withHeader
			withGuests
			withGroups
			isMultiSelect
			disableDisabledUsers
			useAside
			filter={filter}
			withBlur={false}
			roomId={item.id}
			withoutBackground={false}
			onClose={onClose}
			submitButtonLabel={t("Common:SelectAction")}
			disableSubmitButton={false}
			onSubmit={handleSubmit}
			targetEntityType={targetEntityType}
			data-test-id="share_to_people_selector"
			disabledInvitedText={t("Common:Shared")}
			{...accessRightsProps}
			headerProps={{
				headerLabel: t("Common:Contacts"),
				withoutBackButton: false,
				withoutBorder: true,
				isCloseable: true,
				onBackClick,
				onCloseClick,
			}}
		/>
	);
};
