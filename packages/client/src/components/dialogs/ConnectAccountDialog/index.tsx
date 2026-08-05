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

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { InputType } from "@docspace/ui-kit/components/text-input";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { toastr } from "@docspace/ui-kit/components/toast";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import DialogsStore from "SRC_DIR/store/DialogsStore";

type ConnectAccountDialogProps = {
	connectAccountDialogVisible?: DialogsStore["connectAccountDialogVisible"];
	setConnectAccountDialogVisible?: DialogsStore["setConnectAccountDialogVisible"];
	getTgLink?: TStore["telegramStore"]["getTgLink"];
	botUrl?: TStore["telegramStore"]["botUrl"];
};

const ConnectAccountDialog = ({
	connectAccountDialogVisible,
	setConnectAccountDialogVisible,
	getTgLink,
	botUrl,
}: ConnectAccountDialogProps) => {
	const { t } = useTranslation(["Profile", "Common"]);

	useEffect(() => {
		getTgLink?.();
	}, []);

	const onClickConnect = () => {
		window.open(botUrl, "_blank");
		setConnectAccountDialogVisible?.(false);
	};

	const onClose = () => {
		setConnectAccountDialogVisible?.(false);
	};

	return (
		<ModalDialog
			visible={connectAccountDialogVisible}
			onClose={onClose}
			displayType={ModalDialogType.modal}
			autoMaxHeight
			isLoading={!botUrl}
		>
			<ModalDialog.Header>{t("Profile:TelegramAccount")}</ModalDialog.Header>
			<ModalDialog.Body>
				<Text fontSize="13px" fontWeight={400} style={{ marginBottom: "16px" }}>
					{t("Profile:TelegramAccountDescription")}
				</Text>
				<InputBlock
					value={botUrl || ""}
					type={InputType.text}
					isAutoFocussed
					isReadOnly
					onFocus={(e) => e.target.select()}
					scale
					iconName={CopyReactSvgUrl}
					iconColor={globalColors.lightGrayDark}
					isIconFill
					onIconClick={() => {
						copy(botUrl || "");
						toastr.success(t("Common:LinkCopySuccess"));
					}}
				/>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					label={t("Common:Connect")}
					size={ButtonSize.normal}
					scale
					primary
					onClick={onClickConnect}
					testId="connect_account_dialog_submit"
				/>
				<Button
					label={t("Common:CancelButton")}
					size={ButtonSize.normal}
					scale
					onClick={onClose}
					testId="connect_account_dialog_cancel"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ dialogsStore, telegramStore }: TStore) => {
	const { connectAccountDialogVisible, setConnectAccountDialogVisible } =
		dialogsStore;

	const { getTgLink, botUrl } = telegramStore;

	return {
		connectAccountDialogVisible,
		setConnectAccountDialogVisible,
		getTgLink,
		botUrl,
	};
})(observer(ConnectAccountDialog));
