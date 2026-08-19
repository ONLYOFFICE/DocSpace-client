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

import PropTypes from "prop-types";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { withTranslation } from "react-i18next";

const ResetApplicationDialogComponent = (props) => {
	const { t, resetTfaApp, id, onClose, tReady, visible } = props;

	const resetApp = async () => {
		onClose && onClose();
		try {
			const res = await resetTfaApp(id);
			toastr.success(t("SuccessResetApplication"));

			if (res) window.location.replace(res);
		} catch (e) {
			toastr.error(e);
		}
	};

	return (
		<ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
			<ModalDialog.Header>{t("ResetApplicationTitle")}</ModalDialog.Header>
			<ModalDialog.Body>
				<Text>{t("ResetApplicationDescription")}</Text>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					key="ResetSendBtn"
					label={t("Common:ResetApplication")}
					size="normal"
					scale
					primary
					onClick={resetApp}
					testId="dialog_reset_app_button"
				/>
				<Button
					key="CloseBtn"
					label={t("Common:CancelButton")}
					size="normal"
					scale
					primary={false}
					onClick={onClose}
					testId="dialog_reset_app_cancel_button"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

const ResetApplicationDialog = withTranslation([
	"ResetApplicationDialog",
	"Common",
])(ResetApplicationDialogComponent);

ResetApplicationDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	resetTfaApp: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
};

export default ResetApplicationDialog;
