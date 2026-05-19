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

import { Button } from "@docspace/ui-kit/components/button";
import { Link } from "@docspace/ui-kit/components/link";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Textarea } from "@docspace/ui-kit/components/textarea";

import ModalComboBox from "./ModalComboBox";
import StyledBodyContent from "../styled-containers/StyledModalDialog";

const AddSpCertificateModal = (props) => {
	const { t, ready } = useTranslation(["SingleSignOn", "Common"]);
	const {
		closeSpModal,
		addSpCertificate,
		spIsModalVisible,
		generateCertificate,
		setInput,
		spCertificate,
		spPrivateKey,
		isGeneratedCertificate,
		isCertificateLoading,
	} = props;

	const onGenerate = () => {
		if (isGeneratedCertificate) return;
		generateCertificate();
	};

	return (
		<ModalDialog
			zIndex={310}
			isLoading={!ready}
			autoMaxHeight
			autoMaxWidth
			onClose={closeSpModal}
			visible={spIsModalVisible}
		>
			<ModalDialog.Header>{t("NewCertificate")}</ModalDialog.Header>

			<ModalDialog.Body>
				<StyledBodyContent>
					<Link
						className="generate"
						isHovered
						onClick={onGenerate}
						type="action"
					>
						{t("GenerateCertificate")}
					</Link>
					<Text isBold className="text-area-label">
						{t("OpenCertificate")}
					</Text>

					<Textarea
						id="sp-certificate"
						className="text-area"
						name="spCertificate"
						onChange={setInput}
						value={spCertificate}
						isDisabled={isGeneratedCertificate}
						placeholder={t("PlaceholderCert")}
						heightTextArea="72px"
					/>

					<Text isBold className="text-area-label">
						{t("PrivateKey")}
					</Text>

					<Textarea
						id="sp-privateKey"
						className="text-area"
						name="spPrivateKey"
						onChange={setInput}
						value={spPrivateKey}
						isDisabled={isGeneratedCertificate}
						placeholder={t("PlaceholderCert")}
						heightTextArea="72px"
					/>

					<ModalComboBox
						className="modal-combo"
						isDisabled={isGeneratedCertificate}
					/>
				</StyledBodyContent>
			</ModalDialog.Body>

			<ModalDialog.Footer>
				<Button
					id="ok-button"
					label={t("Common:OKButton")}
					onClick={() => addSpCertificate(t)}
					primary
					size="normal"
					isLoading={isCertificateLoading}
					isDisabled={isGeneratedCertificate || !spCertificate || !spPrivateKey}
				/>
				<Button
					id="cancel-button"
					label={t("Common:CancelButton")}
					onClick={closeSpModal}
					size="normal"
					isDisabled={isGeneratedCertificate || isCertificateLoading}
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ ssoStore }) => {
	const {
		closeSpModal,
		addSpCertificate,
		spIsModalVisible,
		generateCertificate,
		setInput,
		spCertificate,
		spPrivateKey,
		isGeneratedCertificate,
		isCertificateLoading,
	} = ssoStore;

	return {
		closeSpModal,
		addSpCertificate,
		spIsModalVisible,
		generateCertificate,
		setInput,
		spCertificate,
		spPrivateKey,
		isGeneratedCertificate,
		isCertificateLoading,
	};
})(observer(AddSpCertificateModal));
