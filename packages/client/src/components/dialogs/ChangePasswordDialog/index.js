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
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import { withTranslation, Trans } from "react-i18next";
import { sendInstructionsToChangePassword } from "@docspace/shared/api/people";

class ChangePasswordDialogComponent extends React.Component {
	constructor() {
		super();

		this.state = {
			isRequestRunning: false,
		};
	}

	componentDidMount() {
		window.addEventListener("keydown", this.keyPress, false);
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyPress, false);
	}

	keyPress = (e) => {
		if (e.keyCode === 13) {
			this.onSendPasswordChangeInstructions();
		}
	};

	onSendPasswordChangeInstructions = () => {
		const { email, onClose } = this.props;

		this.setState({ isRequestRunning: true }, () => {
			sendInstructionsToChangePassword(email)
				.then((res) => {
					toastr.success(res);
				})
				.catch((error) => toastr.error(error))
				.finally(() => {
					this.setState({ isRequestRunning: false }, () => onClose());
				});
		});
	};

	onClose = () => {
		const { onClose } = this.props;
		const { isRequestRunning } = this.state;

		if (!isRequestRunning) {
			onClose();
		}
	};

	render() {
		// console.log("ChangePasswordDialog render");
		const { t, tReady, visible, email, onClose, currentColorScheme } =
			this.props;
		const { isRequestRunning } = this.state;

		return (
			<ModalDialog
				isLoading={!tReady}
				visible={visible}
				onClose={this.onClose}
				displayType="modal"
			>
				<ModalDialog.Header>{t("PasswordChangeTitle")}</ModalDialog.Header>
				<ModalDialog.Body>
					<Text fontSize="13px">
						<Trans
							i18nKey="MessageSendPasswordChangeInstructionsOnEmail"
							ns="ChangePasswordDialog"
							t={t}
						>
							Send the password change instructions to the
							<Link
								className="email-link"
								type="page"
								href={`mailto:${email}`}
								noHover
								color={currentColorScheme.main?.accent}
								title={email}
								dataTestId="change_password_self_email_link"
							>
								{{ email }}
							</Link>
							email address
						</Trans>
					</Text>
				</ModalDialog.Body>
				<ModalDialog.Footer>
					<Button
						className="send"
						key="ChangePasswordSendBtn"
						label={t("Common:SendButton")}
						size="normal"
						scale
						primary
						onClick={this.onSendPasswordChangeInstructions}
						isLoading={isRequestRunning}
						testId="change_password_send_button"
					/>
					<Button
						className="cancel-button"
						key="CloseBtn"
						label={t("Common:CancelButton")}
						size="normal"
						scale
						onClick={onClose}
						isDisabled={isRequestRunning}
						testId="change_password_cancel_button"
					/>
				</ModalDialog.Footer>
			</ModalDialog>
		);
	}
}

const ChangePasswordDialog = inject(({ settingsStore }) => ({
	currentColorScheme: settingsStore.currentColorScheme,
}))(
	observer(
		withTranslation(["ChangePasswordDialog", "Common"])(
			ChangePasswordDialogComponent,
		),
	),
);

ChangePasswordDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	email: PropTypes.string.isRequired,
};

export default ChangePasswordDialog;
