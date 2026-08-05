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

import { Trans, useTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Link } from "@docspace/ui-kit/components/link";
import { sendDeletePortalEmail } from "@docspace/shared/api/portal";
import { getBrandName } from "@docspace/shared/constants/brands";

const DeletePortalDialog = (props) => {
	const { t, ready } = useTranslation("Settings", "Common");
	const { visible, onClose, owner, stripeUrl } = props;

	const onDeleteClick = async () => {
		try {
			await sendDeletePortalEmail();
			toastr.success(
				t("PortalDeletionEmailSended", { ownerEmail: owner.email }),
			);
			onClose();
		} catch (error) {
			toastr.error(error);
		}
	};

	return (
		<ModalDialog
			isLoading={!ready}
			visible={visible}
			onClose={onClose}
			displayType="modal"
		>
			<ModalDialog.Header>
				{t("Common:DeletePortal", { productName: getBrandName("ProductName") })}
			</ModalDialog.Header>
			<ModalDialog.Body>
				<Trans t={t} i18nKey="DeletePortalInfo" ns="Settings">
					Before you delete the portal, please make sure that automatic billing
					is turned off. You may check the status of automatic billing in
					<Link
						className="stripe-url-link"
						tag="a"
						fontSize="13px"
						fontWeight="600"
						href={stripeUrl}
						target="_blank"
						color="accent"
						dataTestId="stripe_url_link"
					>
						on your Stripe customer portal.
					</Link>
				</Trans>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					className="delete-button"
					key="DeletePortalBtn"
					label={t("Common:Delete")}
					size="normal"
					scale
					primary
					onClick={onDeleteClick}
					testId="submit_delete_portal_button"
				/>
				<Button
					className="cancel-button"
					key="CancelDeleteBtn"
					label={t("Common:CancelButton")}
					size="normal"
					scale
					onClick={onClose}
					testId="cancel_delete_portal_button"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default DeletePortalDialog;
