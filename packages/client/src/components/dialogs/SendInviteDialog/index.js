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

// import AutoSizer from "react-virtualized-auto-sizer";
import { withTranslation } from "react-i18next";
import { resendUserInvites } from "@docspace/shared/api/people";

import { inject, observer } from "mobx-react";

class SendInviteDialogComponent extends React.Component {
	constructor(props) {
		super(props);

		const { userIds } = props;

		this.state = {
			isRequestRunning: false,
			userIds,
		};
	}

	onSendInvite = () => {
		const { t, setSelected, onClose } = this.props;
		const { userIds } = this.state;

		this.setState({ isRequestRunning: true }, () => {
			resendUserInvites(userIds)
				.then(() =>
					toastr.success(t("PeopleTranslations:SuccessSentInvitation")),
				)
				.catch((error) => toastr.error(error))
				.finally(() => {
					this.setState({ isRequestRunning: false }, () => {
						setSelected("close");
						onClose();
					});
				});
		});
	};

	render() {
		const { t, tReady, onClose, visible } = this.props;
		const { isRequestRunning, userIds } = this.state;

		// console.log("SendInviteDialog render");
		return (
			<ModalDialog
				isLoading={!tReady}
				visible={visible}
				onClose={onClose}
				autoMaxHeight
			>
				<ModalDialog.Header>
					{t("PeopleTranslations:SendInviteAgain")}
				</ModalDialog.Header>
				<ModalDialog.Body>
					<Text>{t("SendInviteAgainDialog")}</Text>
					<Text>{t("SendInviteAgainDialogMessage")}</Text>
				</ModalDialog.Body>
				<ModalDialog.Footer>
					<Button
						id="send-inite-again-modal_submit"
						label={t("Common:SendButton")}
						size="normal"
						scale
						primary
						onClick={this.onSendInvite}
						isLoading={isRequestRunning}
						isDisabled={!userIds.length}
					/>
					<Button
						id="send-inite-again-modal_cancel"
						label={t("Common:CancelButton")}
						size="normal"
						scale
						onClick={onClose}
						isDisabled={isRequestRunning}
					/>
				</ModalDialog.Footer>
			</ModalDialog>
		);
	}
}

const SendInviteDialog = withTranslation([
	"SendInviteDialog",
	"Common",
	"PeopleTranslations",
])(SendInviteDialogComponent);

SendInviteDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	userIds: PropTypes.arrayOf(PropTypes.string).isRequired,
	selectedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
	setSelected: PropTypes.func.isRequired,
};

export default inject(({ peopleStore }) => ({
	selectedUsers: peopleStore.usersStore.selection,
	setSelected: peopleStore.usersStore.setSelected,
	userIds: peopleStore.usersStore.getUsersToInviteIds,
}))(observer(SendInviteDialog));
