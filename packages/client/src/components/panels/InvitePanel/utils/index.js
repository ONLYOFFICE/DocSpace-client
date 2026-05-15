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

import {
	ShareAccessRights,
	EmployeeType,
	RoomsType,
} from "@docspace/shared/enums";

import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { checkIfAccessPaid } from "@docspace/shared/utils/filterPaidRoleOptions";
import { getBrandName } from "@docspace/shared/constants/brands";

export const getTopFreeRole = (t, roomType) => {
	const accesses = getAccessOptions(t, roomType);
	const freeAccesses = accesses.filter(
		(item) => !checkIfAccessPaid(item.access) && item.key !== "s1",
	);
	return freeAccesses[0];
};

export const getViewerRole = (t, roomType) => {
	const accesses = getAccessOptions(t, roomType);

	return accesses.find((item) => item.key === "viewer");
};

export const isPaidUserRole = (selectedAccess) => {
	return (
		selectedAccess === ShareAccessRights.FullAccess ||
		selectedAccess === ShareAccessRights.RoomManager
	);
};

export const getFreeUsersTypeArray = () => {
	return [EmployeeType.User];
};

export const getFreeUsersRoleArray = () => {
	return [
		ShareAccessRights.Comment,
		ShareAccessRights.Editing,
		ShareAccessRights.FormFilling,
		ShareAccessRights.ReadOnly,
		ShareAccessRights.Review,
		ShareAccessRights.Collaborator,
	];
};

export const makeFreeRole = (item, t, freeRole) => {
	if (!freeRole) return item;

	item.access = freeRole.access;
	item.warning = item.isGroup
		? t("GroupMaxAvailableRoleWarning", {
				roleName: freeRole.label,
			})
		: t("UserMaxAvailableRoleWarning", {
				productName: getBrandName("ProductName"),
			});
	return item;
};

export const makeViewerRole = (item, t, viewerRole) => {
	if (!viewerRole) return item;

	item.warning =
		item.access === ShareAccessRights.RoomManager
			? t("UserAgentMaxAvailableRoleWarning", {
					productName: getBrandName("ProductName"),
				})
			: t("GuestAgentMaxAvailableRoleWarning", {
					productName: getBrandName("ProductName"),
				});
	item.access = viewerRole.access;

	return item;
};

export const fixAccess = (item, t, roomType) => {
	if (item.isVisitor && roomType === RoomsType.AIRoom) {
		const viewerRole = getViewerRole(t, roomType);
		return makeViewerRole(item, t, viewerRole);
	} else {
		const topFreeRole = getTopFreeRole(t, roomType);
		return makeFreeRole(item, t, topFreeRole);
	}
};
