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
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { withTranslation } from "react-i18next";
import { sendInstructionsToDelete } from "@docspace/shared/api/people";
import { Link } from "@docspace/ui-kit/components/link";

class DeleteSelfProfileDialogComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isRequestRunning: false,
		};
	}

	onDeleteSelfProfileInstructions = () => {
		const { onClose } = this.props;
		this.setState({ isRequestRunning: true }, () => {
			sendInstructionsToDelete()
				.then((res) => {
					toastr.success(
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
							dangerouslySetInnerHTML={{
								__html: res,
							}}
						/>,
					);
				})
				.catch((error) => toastr.error(error))
				.finally(() => {
					this.setState({ isRequestRunning: false }, () => onClose());
				});
		});
	};

	render() {
		console.log("DeleteSelfProfileDialog render");
		const { t, tReady, visible, email, onClose } = this.props;
		const { isRequestRunning } = this.state;

		return (
			<ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
				<ModalDialog.Header>{t("DeleteProfileTitle")}</ModalDialog.Header>
				<ModalDialog.Body>
					<Text fontSize="13px">
						{t("DeleteProfileInfo")}{" "}
						<Link
							type="page"
							href={`mailto:${email}`}
							noHover
							title={email}
							tag="a"
							color="accent"
							dataTestId="dialog_self_email_link"
						>
							{email}
						</Link>
					</Text>
				</ModalDialog.Body>
				<ModalDialog.Footer>
					<Button
						key="DeleteSelfSendBtn"
						label={t("Common:SendButton")}
						size="normal"
						scale
						primary
						onClick={this.onDeleteSelfProfileInstructions}
						isLoading={isRequestRunning}
						testId="dialog_delete_self_button"
					/>
					<Button
						key="CloseBtn"
						label={t("Common:CancelButton")}
						size="normal"
						scale
						onClick={onClose}
						isDisabled={isRequestRunning}
						testId="dialog_delete_self_cancel_button"
					/>
				</ModalDialog.Footer>
			</ModalDialog>
		);
	}
}

const DeleteSelfProfileDialog = inject(({ settingsStore }) => ({
	theme: settingsStore.theme,
}))(
	observer(
		withTranslation(["DeleteSelfProfileDialog", "Common"])(
			DeleteSelfProfileDialogComponent,
		),
	),
);

DeleteSelfProfileDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	email: PropTypes.string.isRequired,
};

export default DeleteSelfProfileDialog;
