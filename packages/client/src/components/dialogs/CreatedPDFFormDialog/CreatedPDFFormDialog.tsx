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

import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import HeaderIcon from "PUBLIC_DIR/images/ready.pdf.form.modal.svg";
import HeaderDarkIcon from "PUBLIC_DIR/images/ready.pdf.form.modal.dark.svg";

import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { copyShareLink as clipboardCopy } from "@docspace/shared/utils/copy";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { getFileInfo } from "@docspace/shared/api/files";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import type {
	CreatedPDFFormDialogProps,
	InjectedCreatedPDFFormDialogProps,
} from "./CreatedPDFFormDialog.types";
import styles from "./CreatePDFForm.module.scss";

const CreatedPDFFormDialogComponent = ({
	file,
	localKey,
	onClose,
	visible,
	getItemUrl,
	getManageLinkOptions,
	getFilesListItems,
}: CreatedPDFFormDialogProps & InjectedCreatedPDFFormDialogProps) => {
	const { t } = useTranslation(["PDFFormDialog", "Common"]);
	const { isBase } = useTheme();

	const onSubmit = async () => {
		try {
			const currentFile = await getFileInfo(file.id);

			const [fileItem] = getFilesListItems([currentFile]);

			const primaryLink = await ShareLinkService.getFilePrimaryLink(fileItem);

			copyShareLink(fileItem, primaryLink, t, getManageLinkOptions(fileItem));
		} catch (error) {
			const url = getItemUrl(file.id, false, false, false);
			if (url) {
				clipboardCopy(url);
				toastr.success(t("Common:LinkCopySuccess"));
			}

			console.error(error);
		} finally {
			onClose();
		}
	};

	const handleChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		localStorage.setItem(localKey, event.target.checked.toString());
	};

	const description = t("PDFFormSuccessfullyCreatedDescription");
	const primaryButtonLabel = t("Common:CopyPublicLink");

	return (
		<ModalDialog
			autoMaxHeight
			visible={visible}
			onClose={onClose}
			displayType={ModalDialogType.modal}
		>
			<ModalDialog.Header>{t("PDFform")}</ModalDialog.Header>
			<ModalDialog.Body>
				<div className={styles.wrapper}>
					{isBase ? <HeaderIcon /> : <HeaderDarkIcon />}
					<span>{description}</span>
					<Checkbox
						className={styles.createdPdfCheckbox}
						onChange={handleChangeCheckbox}
						label={t("Common:DontShowAgain")}
						dataTestId="created_pdf_form_dialog_dont_show_again"
					/>
				</div>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					scale
					primary
					tabIndex={0}
					size={ButtonSize.normal}
					label={primaryButtonLabel}
					onClick={onSubmit}
					testId="created_pdf_form_dialog_copy_public_link"
				/>
				<Button
					tabIndex={0}
					onClick={onClose}
					size={ButtonSize.normal}
					label={t("Common:Later")}
					testId="created_pdf_form_dialog_later"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export const CreatedPDFFormDialog = inject<
	TStore,
	CreatedPDFFormDialogProps,
	InjectedCreatedPDFFormDialogProps
>((store) => ({
	getItemUrl: store.filesStore.getItemUrl,
	getManageLinkOptions: store.contextOptionsStore.getManageLinkOptions,
	getFilesListItems: store.filesStore.getFilesListItems,
}))(observer(CreatedPDFFormDialogComponent as FC<CreatedPDFFormDialogProps>));
