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

import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "../TenantPanel.module.scss";

interface ApplyToPortalDialogProps {
  visible: boolean;
  isSaving: boolean;
  onApply: () => void;
  onClose: () => void;
}

const ApplyToPortalDialog = ({
  visible,
  isSaving,
  onApply,
  onClose,
}: ApplyToPortalDialogProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={onClose}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:Confirmation")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.confirmDialogBody}>
          <Text fontWeight={600}>
            {t("DocsConnect:SwitchToEditorsQuestion", {
              service: t("DocsConnect:DocsConnect"),
            })}
          </Text>
          <Text fontSize="13px">
            {t("DocsConnect:SwitchToEditorsDescription", {
              organizationName: getBrandName("OrganizationName"),
              editorsName: getBrandName("ProductEditorsName"),
              service: t("DocsConnect:DocsConnect"),
            })}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("DocsConnect:SwitchEditors")}
          isLoading={isSaving}
          isDisabled={isSaving}
          onClick={onApply}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isSaving}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ApplyToPortalDialog;
