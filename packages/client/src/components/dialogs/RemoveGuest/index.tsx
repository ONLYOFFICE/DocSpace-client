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
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { ButtonKeys } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";

type RemoveGuestDialogProps = {
	visible: boolean;
	onClose: VoidFunction;

	guests: UsersStore["selection"];
	removeGuests: UsersStore["removeGuests"];
	setSelected: UsersStore["setSelected"];
};

const RemoveGuestDialog = ({
	visible,
	onClose,

	guests,
	removeGuests,
	setSelected,
}: RemoveGuestDialogProps) => {
	const { t } = useTranslation(["PeopleTranslations", "Common"]);

	const [isRequestRunning, setIsRequestRunning] = React.useState(false);

	const isMulti = guests.length > 1;

	const onRemove = React.useCallback(() => {
		if (isRequestRunning) return;
		setIsRequestRunning(true);

		const ids = guests.map((g) => g.id);

		removeGuests(ids)
			.then(() => {
				toastr.success(t("GuestsRemoved"));
				onClose();
			})
			.catch((e: unknown) => {
				toastr.error(e as string);
			})
			.finally(() => {
				setIsRequestRunning(false);
				setSelected("close");
			});
	}, [guests, isRequestRunning, onClose, removeGuests, setSelected, t]);

	const onCloseAction = React.useCallback(() => {
		if (isRequestRunning) return;
		onClose();
	}, [isRequestRunning, onClose]);

	const onKeyUpHandler = React.useCallback(
		(e: KeyboardEvent) => {
			if (e.key === ButtonKeys.esc) onCloseAction();
			if (e.key === ButtonKeys.enter) onRemove();
		},
		[onCloseAction, onRemove],
	);

	React.useEffect(() => {
		document.addEventListener("keyup", onKeyUpHandler, false);

		return () => {
			document.removeEventListener("keyup", onKeyUpHandler, false);
		};
	}, [onKeyUpHandler]);

	console.log(guests);

	return (
		<ModalDialog
			visible={visible}
			onClose={onClose}
			displayType={ModalDialogType.modal}
			autoMaxHeight
		>
			<ModalDialog.Header>
				{isMulti ? t("RemoveGuests") : t("RemoveGuest")}
			</ModalDialog.Header>
			<ModalDialog.Body>
				<Text>
					{!isMulti ? (
						<Trans
							i18nKey="RemoveGuestDescription"
							ns="PeopleTranslations"
							t={t}
							values={{ userName: guests[0]?.displayName }}
						/>
					) : (
						t("RemoveGuestsDescription")
					)}
				</Text>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					id="change-user-type-modal_submit"
					label={t("Common:Remove")}
					size={ButtonSize.normal}
					scale
					primary
					onClick={onRemove}
					isLoading={isRequestRunning}
				/>
				<Button
					id="change-user-type-modal_cancel"
					label={t("Common:CancelButton")}
					size={ButtonSize.normal}
					scale
					onClick={onCloseAction}
					isDisabled={isRequestRunning}
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ peopleStore }: TStore) => {
	const { removeGuests, selection, bufferSelection, setSelected } =
		peopleStore.usersStore!;

	const guests = selection.length ? selection : [bufferSelection];

	return { guests, removeGuests, setSelected };
})(observer(RemoveGuestDialog));
