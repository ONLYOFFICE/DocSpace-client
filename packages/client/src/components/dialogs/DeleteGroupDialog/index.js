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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getBrandName } from "@docspace/shared/constants/brands";

const DeleteGroupDialog = (props) => {
	const {
		t,
		visible,
		onClose,
		selection,
		bufferSelection,
		groupName,
		onDeleteGroup,
		onDeleteAllGroups,
		isLoading,
	} = props;

	const hasMoreGroups = selection.length > 1;

	const onDeleteAction = () => {
		try {
			if (hasMoreGroups) {
				onDeleteAllGroups(t);
			} else {
				onDeleteGroup(t, bufferSelection?.id || selection[0]?.id);
			}
		} catch (err) {
			toastr.error(err.message);
			console.error(err);
		}
	};

	const onKeyUp = (e) => {
		if (e.keyCode === 27) onClose();
		if (e.keyCode === 13 || e.which === 13) onDeleteAction();
	};

	useEffect(() => {
		document.addEventListener("keyup", onKeyUp, false);

		return () => {
			document.removeEventListener("keyup", onKeyUp, false);
		};
	}, []);

	return (
		<ModalDialog visible={visible} onClose={onClose} displayType="modal">
			<ModalDialog.Header>
				{hasMoreGroups
					? t("DeleteDialog:DeleteAllGroupsTitle")
					: t("DeleteDialog:DeleteGroupTitle")}
			</ModalDialog.Header>
			<ModalDialog.Body>
				<Text>
					{hasMoreGroups
						? t("DeleteDialog:DeleteAllGroupDescription", {
								productName: getBrandName("ProductName"),
							})
						: t("DeleteDialog:DeleteGroupDescription", {
								productName: getBrandName("ProductName"),
								groupName,
							})}
				</Text>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					id="group-modal_delete"
					key="Delete"
					label={t("Common:Delete")}
					size="normal"
					primary
					scale
					onClick={onDeleteAction}
					isLoading={isLoading}
					testId="delete_group_dialog_confirm"
				/>
				<Button
					id="group-modal_cancel"
					key="CancelButton"
					label={t("Common:CancelButton")}
					size="normal"
					scale
					onClick={onClose}
					testId="delete_group_dialog_cancel"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ peopleStore }) => {
	const {
		selection,
		bufferSelection,
		groupName,
		onDeleteGroup,
		onDeleteAllGroups,
		isLoading,
	} = peopleStore.groupsStore;

	return {
		selection,
		bufferSelection,
		groupName,
		onDeleteGroup,
		onDeleteAllGroups,
		isLoading,
	};
})(withTranslation(["Common", "DeleteDialog"])(observer(DeleteGroupDialog)));
