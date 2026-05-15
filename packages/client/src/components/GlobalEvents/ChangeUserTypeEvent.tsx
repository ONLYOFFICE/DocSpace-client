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

import { useEffect, useCallback, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { ButtonKeys, EmployeeType } from "@docspace/shared/enums";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { downgradeUserType } from "@docspace/shared/api/people";
import { TUser } from "@docspace/shared/api/people/types";

import { TChangeUserTypeDialogData } from "SRC_DIR/helpers/contacts";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import { ChangeUserTypeDialog } from "../dialogs";
import PaidQuotaLimitError from "../PaidQuotaLimitError";

type ChangeUserTypeEventProps = {
	updateUserType: UsersStore["updateUserType"];
	setSelected: UsersStore["setSelected"];
	getPeopleListItem: UsersStore["getPeopleListItem"];
	needResetUserSelection: UsersStore["needResetUserSelection"];

	dialogData: TChangeUserTypeDialogData;

	onClose: VoidFunction;
};

const ChangeUserTypeEvent = ({
	dialogData,
	needResetUserSelection,

	updateUserType,
	setSelected,
	getPeopleListItem,

	onClose,
}: ChangeUserTypeEventProps) => {
	const { t } = useTranslation(["ChangeUserTypeDialog", "Common", "Payments"]);

	const [isRequestRunning, setIsRequestRunning] = useState(false);

	const { toType, fromType, userIDs, successCallback, abortCallback } =
		dialogData;

	const isGuestsDialog = fromType[0] === EmployeeType.Guest;

	const isDowngradeType =
		(toType === EmployeeType.Guest || toType === EmployeeType.User) &&
		fromType[0] !== EmployeeType.Guest;
	const isDowngradeToUser = toType === EmployeeType.User;

	const onCloseAction = useCallback(() => {
		if (isRequestRunning) return;
		abortCallback?.();
		onClose();
	}, [abortCallback, isRequestRunning, onClose]);

	const onChangeUserType = useCallback(() => {
		if (isRequestRunning) return;

		setIsRequestRunning(true);

		const updatePromise = isDowngradeType
			? downgradeUserType(toType, userIDs[0])
			: updateUserType(toType, userIDs);

		updatePromise
			.then((users) => {
				toastr.success(
					isGuestsDialog
						? t("SuccessChangeGuestType")
						: t("SuccessChangeUserType"),
				);

				successCallback?.(users as TUser[]);
			})
			.catch(() => {
				toastr.error(
					<PaidQuotaLimitError
						isRoomAdmin={undefined}
						setInvitePanelOptions={undefined}
						invitePanelVisible={undefined}
					/>,
					"",
					0,
					true,
					true,
				);

				abortCallback?.();
			})
			.finally(() => {
				if (needResetUserSelection) setSelected("close");
				setIsRequestRunning(false);
				onClose();
			});
	}, [
		abortCallback,
		getPeopleListItem,
		isGuestsDialog,
		isRequestRunning,
		needResetUserSelection,
		onClose,
		setSelected,
		successCallback,
		t,
		toType,
		updateUserType,
		userIDs,
	]);

	const onKeyUpHandler = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === ButtonKeys.esc) onCloseAction();
			if (e.key === ButtonKeys.enter) onChangeUserType();
		},
		[onChangeUserType, onCloseAction],
	);

	useEffect(() => {
		document.addEventListener("keyup", onKeyUpHandler, false);

		return () => {
			document.removeEventListener("keyup", onKeyUpHandler, false);
		};
	}, [onKeyUpHandler]);

	useEffect(() => {
		if (!toType) return onClose();

		return () => {
			onClose();
		};
	}, [onClose, toType]);

	const firstType =
		fromType?.length === 1 && fromType[0]
			? getUserTypeTranslation(fromType[0], t)
			: null;
	const secondType = getUserTypeTranslation(toType, t);

	return (
		<ChangeUserTypeDialog
			visible
			isGuestsDialog={isGuestsDialog}
			firstType={firstType ?? ""}
			secondType={secondType}
			onClose={onCloseAction}
			onChangeUserType={onChangeUserType}
			isRequestRunning={isRequestRunning}
			isDowngradeType={isDowngradeType}
			isDowngradeToUser={isDowngradeToUser}
		/>
	);
};

export default inject(({ peopleStore, infoPanelStore }: TStore) => {
	const { dialogStore, usersStore } = peopleStore;

	const { data: dialogData } = dialogStore!;

	const {
		updateUserType,
		getPeopleListItem,
		needResetUserSelection,
		setSelected,
	} = usersStore!;
	const { isVisible: infoPanelVisible } = infoPanelStore;

	return {
		needResetUserSelection: !infoPanelVisible || needResetUserSelection,

		getPeopleListItem,

		dialogData,
		updateUserType,
		setSelected,
	};
})(observer(ChangeUserTypeEvent));
