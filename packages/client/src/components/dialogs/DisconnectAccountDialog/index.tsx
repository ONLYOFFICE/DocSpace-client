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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import { getBrandName } from "@docspace/shared/constants/brands";

type DisconnectAccountDialogProps = {
	disconnectAccountDialogVisible?: DialogsStore["disconnectAccountDialogVisible"];
	setDisconnectAccountDialogVisible?: DialogsStore["setDisconnectAccountDialogVisible"];
	deleteTgLink?: TStore["telegramStore"]["deleteTgLink"];
	username?: TStore["telegramStore"]["username"];
};

const DisconnectAccountDialog = ({
	disconnectAccountDialogVisible,
	setDisconnectAccountDialogVisible,
	deleteTgLink,
	username,
}: DisconnectAccountDialogProps) => {
	const { t } = useTranslation(["Profile", "Notifications", "Common"]);

	const onClickDisconnect = () => {
		deleteTgLink?.();
		setDisconnectAccountDialogVisible?.(false);
		toastr.success(
			t("Notifications:SuccessDisconnected", {
				serviceName: getBrandName("ProviderTelegram"),
			}),
		);
	};

	const onClose = () => {
		setDisconnectAccountDialogVisible?.(false);
	};

	return (
		<ModalDialog
			visible={disconnectAccountDialogVisible}
			onClose={onClose}
			displayType={ModalDialogType.modal}
			autoMaxHeight
		>
			<ModalDialog.Header>
				{t("Profile:TelegramAccountDisconnect")}
			</ModalDialog.Header>
			<ModalDialog.Body>
				<Text fontSize="13px" fontWeight={400}>
					{t("Profile:TelegramAccountDisconnectDescription", {
						username,
					})}
				</Text>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					label={t("Common:Disconnect")}
					size={ButtonSize.normal}
					scale
					primary
					onClick={onClickDisconnect}
					testId="disconnect_account_dialog_submit"
				/>
				<Button
					label={t("Common:CancelButton")}
					size={ButtonSize.normal}
					scale
					onClick={onClose}
					testId="disconnect_account_dialog_cancel"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ dialogsStore, telegramStore }: TStore) => {
	const { disconnectAccountDialogVisible, setDisconnectAccountDialogVisible } =
		dialogsStore;

	const { deleteTgLink, username } = telegramStore;

	return {
		disconnectAccountDialogVisible,
		setDisconnectAccountDialogVisible,
		deleteTgLink,
		username,
	};
})(observer(DisconnectAccountDialog));
