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
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getTfaNewBackupCodes } from "@docspace/shared/api/settings";
import { withTranslation } from "react-i18next";
import { isDesktop } from "@docspace/shared/utils";

import styles from "./backup-codes.module.scss";

class BackupCodesDialogComponent extends React.Component {
	getNewBackupCodes = async () => {
		const { setBackupCodes } = this.props;
		try {
			const newCodes = await getTfaNewBackupCodes();
			setBackupCodes(newCodes);
		} catch (e) {
			toastr.error(e);
		}
	};

	printPage = () => {
		const { t } = this.props;
		const printContent = document.getElementById("backup-codes-print-content");
		const printWindow = window.open(
			"about:blank",
			"",
			"toolbar=0,scrollbars=1,status=0",
		);
		printWindow.document.write(`<h1>${t("BackupCodesTitle")}</h1>`);
		printWindow.document.write(printContent.innerHTML);
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
		printWindow.close();
	};

	render() {
		// console.log("Render BackupCodesDialog");
		const { t, tReady, visible, onClose, backupCodes, backupCodesCount } =
			this.props;

		return (
			<ModalDialog
				isLoading={!tReady}
				visible={visible}
				onClose={onClose}
				autoMaxHeight
				isLarge
			>
				<ModalDialog.Header>{t("BackupCodesTitle")}</ModalDialog.Header>
				<ModalDialog.Body>
					<div id="backup-codes-print-content">
						<Text className="backup-codes-description-one" lineHeight="20px">
							{t("BackupCodesDescription")}
						</Text>
						<Text className="backup-codes-description-two" lineHeight="20px">
							{t("BackupCodesSecondDescription")}
						</Text>

						<Text
							className={styles.backupCodesCounter}
							fontWeight={600}
							lineHeight="20px"
						>
							{backupCodesCount} {t("CodesCounter")}
						</Text>

						<Text
							className="backup-codes-codes"
							isBold
							dataTestId="backup_codes_container"
						>
							{backupCodes.length > 0
								? backupCodes.map((item, index) => {
										if (!item.isUsed) {
											return (
												<strong
													key={item.code}
													className={styles.backupCodesCode}
													data-testid={`backup_code_${index}`}
													dir="auto"
												>
													{item.code} <br />
												</strong>
											);
										}
										return null;
									})
								: null}
						</Text>
					</div>
				</ModalDialog.Body>
				<ModalDialog.Footer>
					<div className={styles.footer}>
						<Button
							key="RequestNewBtn"
							label={t("RequestNewButton")}
							size="normal"
							primary
							onClick={this.getNewBackupCodes}
							testId="request_new_backup_codes_button"
						/>
						<Button
							key="PrintBtn"
							label={t("Common:CancelButton")}
							size="normal"
							onClick={onClose}
							testId="backup_codes_cancel_button"
						/>
						{isDesktop() ? (
							<div className={styles.backupCodesPrintLinkWrapper}>
								<Link
									type="action"
									fontSize="13px"
									fontWeight={600}
									isHovered
									onClick={this.printPage}
									dataTestId="print_backup_codes_link"
								>
									{t("PrintButton")}
								</Link>
							</div>
						) : null}
					</div>
				</ModalDialog.Footer>
			</ModalDialog>
		);
	}
}

const BackupCodesDialog = withTranslation(
	"BackupCodesDialog",
	"Common",
)(BackupCodesDialogComponent);

BackupCodesDialog.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	backupCodes: PropTypes.array.isRequired,
	backupCodesCount: PropTypes.number.isRequired,
	setBackupCodes: PropTypes.func.isRequired,
};

export default BackupCodesDialog;
