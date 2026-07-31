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

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType } from "@docspace/shared/enums";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import type { TOnSubmit } from "@docspace/ui-kit/components/selector";
import type {
	PeopleSelectorProps,
	PeopleFilter,
} from "@docspace/ui-kit/selectors/People/PeopleSelector.types";
import { getBrandName } from "@docspace/shared/constants/brands";

const PEOPLE_TAB_ID = "0";

type TemplateAccessSelectorProps = {
	roomId: string | number;
	onSubmit: TOnSubmit;
	onClose?: () => void;
	onBackClick: () => void;
	onCloseClick: () => void;
	checkIfUserInvited?: PeopleSelectorProps["checkIfUserInvited"];
	disableInvitedUsers?: string[];
};

const TemplateAccessSelector = ({
	roomId,
	onSubmit,
	onClose,
	onBackClick,
	onCloseClick,
	checkIfUserInvited,
	disableInvitedUsers,
}: TemplateAccessSelectorProps) => {
	const [selectedTab, setSelectedTab] = useState(PEOPLE_TAB_ID);

	const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

	const getSelectedTab = (id: string) => setSelectedTab(id);

	const getInfoText = () => {
		return selectedTab === PEOPLE_TAB_ID ? (
			<Trans
				t={t}
				ns="Files"
				i18nKey="AddUsersOrGroupsInfo"
				values={{ productName: getBrandName("ProductName") }}
				components={{ 1: <strong /> }}
			/>
		) : (
			<Trans
				t={t}
				ns="Files"
				i18nKey="AddUsersOrGroupsInfoGroups"
				values={{ productName: getBrandName("ProductName") }}
				components={{ 1: <strong /> }}
			/>
		);
	};

	const infoText = getInfoText() as unknown as string;

	const filter = Filter.getDefault();
	filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];

	return (
		<PeopleSelector
			useAside
			onClose={onClose!}
			onSubmit={onSubmit}
			submitButtonLabel={t("Common:AddButton")}
			disableSubmitButton={false}
			isMultiSelect
			disableDisabledUsers
			withGroups
			withInfo
			infoText={infoText}
			withInfoBadge
			roomId={roomId}
			disableInvitedUsers={disableInvitedUsers}
			checkIfUserInvited={checkIfUserInvited}
			withHeader
			filter={filter as unknown as PeopleFilter}
			headerProps={{
				headerLabel: t("Common:Contacts"),
				withoutBackButton: false,
				withoutBorder: true,
				isCloseable: true,
				onBackClick,
				onCloseClick,
			}}
			setActiveTab={getSelectedTab}
		/>
	);
};

export default TemplateAccessSelector;
