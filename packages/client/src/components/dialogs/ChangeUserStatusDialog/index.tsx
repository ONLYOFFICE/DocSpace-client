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

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ButtonKeys, EmployeeStatus } from "@docspace/shared/enums";

import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import { TChangeUserStatusDialogData } from "SRC_DIR/helpers/contacts";
import { getBrandName } from "@docspace/shared/constants/brands";

type ChangeUserStatusDialogComponentProps = {
	getPeopleListItem: UsersStore["getPeopleListItem"];
	updateUserStatus: UsersStore["updateUserStatus"];
	setSelected: UsersStore["setSelected"];
	needResetUserSelection: UsersStore["needResetUserSelection"];

	infoPanelVisible: InfoPanelStore["isVisible"];
	setSelection: UsersStore["setSelection"];

	visible: boolean;

	onClose: VoidFunction;
} & TChangeUserStatusDialogData;

const ChangeUserStatusDialogComponent = ({
	getPeopleListItem,
	updateUserStatus,
	setSelected,
	needResetUserSelection,
	infoPanelVisible,
	setSelection,
	status,
	userIDs,
	visible,
	isGuests,
	onClose,
}: ChangeUserStatusDialogComponentProps) => {
	const [isRequestRunning, setIsRequestRunning] = React.useState(false);

	const { t } = useTranslation([
		"ChangeUserStatusDialog",
		"Common",
		"PeopleTranslations",
	]);

	const onChangeUserStatus = React.useCallback(() => {
		if (isRequestRunning) return;

		setIsRequestRunning(true);

		updateUserStatus(status, userIDs)
			.then((users) => {
				if (users.length === 1 && infoPanelVisible) {
					const user = getPeopleListItem(users[0]);

					setSelection([user]);
				}

				toastr.success(
					isGuests
						? t("PeopleTranslations:SuccessChangeGuestStatus")
						: t("PeopleTranslations:SuccessChangeUserStatus"),
				);
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
			})
			.finally(() => {
				setIsRequestRunning(false);
				if (needResetUserSelection) setSelected("close");
				onClose();
			});
	}, [
		getPeopleListItem,
		infoPanelVisible,
		isGuests,
		isRequestRunning,
		needResetUserSelection,
		onClose,
		setSelected,
		status,
		t,
		updateUserStatus,
		userIDs,
	]);

	const onCloseAction = React.useCallback(() => {
		if (isRequestRunning) return;

		onClose();
	}, [isRequestRunning, onClose]);

	const onKeyUpHandler = React.useCallback(
		(e: KeyboardEvent) => {
			if (e.key === ButtonKeys.esc) onCloseAction();
			if (e.key === ButtonKeys.enter) onChangeUserStatus();
		},
		[onChangeUserStatus, onCloseAction],
	);

	React.useEffect(() => {
		document.addEventListener("keyup", onKeyUpHandler, false);

		return () => {
			document.removeEventListener("keyup", onKeyUpHandler, false);
		};
	}, [onKeyUpHandler]);

	const needDisabled = status === EmployeeStatus.Disabled;
	const onlyOneUser = userIDs.length === 1;

	let header = "";
	let bodyText = "";
	let buttonLabelSave = "";

	if (needDisabled) {
		header = onlyOneUser
			? isGuests
				? t("DisableGuest")
				: t("DisableUser")
			: isGuests
				? t("DisableGuests")
				: t("DisableUsers");

		bodyText = onlyOneUser
			? isGuests
				? t("DisableGuestDescription", { productName: getBrandName("ProductName") })
				: t("DisableUserDescription", { productName: getBrandName("ProductName") })
			: isGuests
				? t("DisableGuestsDescription", {
						productName: getBrandName("ProductName"),
					})
				: t("DisableUsersDescription", {
						productName: getBrandName("ProductName"),
					});

		bodyText += isGuests
			? t("DisableGuestsGeneralDescription")
			: t("DisableGeneralDescription");

		buttonLabelSave = isGuests
			? t("Common:Disable")
			: t("PeopleTranslations:DisableUserButton");
	} else {
		header = onlyOneUser
			? isGuests
				? t("EnableGuest")
				: t("EnableUser")
			: isGuests
				? t("EnableGuests")
				: t("EnableUsers");

		bodyText = onlyOneUser
			? isGuests
				? t("EnableGuestDescription", { productName: getBrandName("ProductName") })
				: t("EnableUserDescription", { productName: getBrandName("ProductName") })
			: isGuests
				? t("EnableGuestsDescription", { productName: getBrandName("ProductName") })
				: t("EnableUsersDescription", { productName: getBrandName("ProductName") });

		buttonLabelSave = t("Common:Enable");
	}

	return (
		<ModalDialog
			visible={visible}
			onClose={onCloseAction}
			displayType={ModalDialogType.modal}
			autoMaxHeight
			dataTestId="change_user_status_dialog"
		>
			<ModalDialog.Header>{header}</ModalDialog.Header>
			<ModalDialog.Body>
				<Text>{bodyText}</Text>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					id="change-user-status-modal_submit"
					label={buttonLabelSave}
					size={ButtonSize.normal}
					primary
					scale
					onClick={onChangeUserStatus}
					isLoading={isRequestRunning}
					isDisabled={userIDs.length === 0}
					testId="change_user_status_dialog_submit"
				/>
				<Button
					id="change-user-status-modal_cancel"
					label={t("Common:CancelButton")}
					size={ButtonSize.normal}
					scale
					onClick={onCloseAction}
					isDisabled={isRequestRunning}
					testId="change_user_status_dialog_cancel"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

const ChangeUserStatusDialog = ChangeUserStatusDialogComponent;

export default inject(({ peopleStore, infoPanelStore }: TStore) => {
	const {
		getPeopleListItem,
		updateUserStatus,
		needResetUserSelection,
		setSelected,
		setSelection,
	} = peopleStore.usersStore!;

	const { isVisible: infoPanelVisible } = infoPanelStore;

	return {
		needResetUserSelection: !infoPanelVisible || needResetUserSelection,
		updateUserStatus,

		setSelected,

		getPeopleListItem,

		infoPanelVisible,
		setSelection,
	};
})(observer(ChangeUserStatusDialog));
