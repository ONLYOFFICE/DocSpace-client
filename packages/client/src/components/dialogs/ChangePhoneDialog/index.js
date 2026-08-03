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
import PropTypes from "prop-types";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import { withTranslation } from "react-i18next";

class ChangePhoneDialogComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isRequestRunning: false,
		};
	}

	// TODO: add real api request for executing change phone
	onChangePhone = () => {
		const { onClose, t } = this.props;
		this.setState({ isRequestRunning: true }, () => {
			toastr.success(t("ChangePhoneInstructionSent"));
			this.setState({ isRequestRunning: false }, () => onClose());
		});
	};

	render() {
		// console.log("ChangePhoneDialog render");

		const { t, tReady, visible, onClose } = this.props;
		const { isRequestRunning } = this.state;

		return (
			<ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
				<ModalDialog.Header>{t("MobilePhoneChangeTitle")}</ModalDialog.Header>
				<ModalDialog.Body>
					<Text>{t("MobilePhoneEraseDescription")}</Text>
				</ModalDialog.Body>
				<ModalDialog.Footer>
					<Button
						key="ChangePhoneSendBtn"
						label={t("Common:SendButton")}
						size="normal"
						scale
						primary
						onClick={this.onChangePhone}
						isLoading={isRequestRunning}
						testId="change_phone_send_button"
					/>
				</ModalDialog.Footer>
			</ModalDialog>
		);
	}
}

const ChangePhoneDialog = withTranslation(["ChangePhoneDialog", "Common"])(
	ChangePhoneDialogComponent,
);

ChangePhoneDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired,
};

export default ChangePhoneDialog;
