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


import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

type RevokePrivateLinkDialogProps = {
  visible: boolean;
  onConfirm: () => Promise<void>;
  onClose: VoidFunction;
};

/**
 * Asks before an external link of a private item is revoked, and says what a
 * revocation does not take back.
 *
 * Spec: private-rooms/room-membership, "Revoking an external link"
 */
export const RevokePrivateLinkDialog = ({
  visible,
  onConfirm,
  onClose,
}: RevokePrivateLinkDialogProps) => {
  const { t } = useTranslation("Common");
  const [isLoading, setIsLoading] = useState(false);

  const onRevoke = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={isLoading ? undefined : onClose}
      displayType={ModalDialogType.modal}
      dataTestId="revoke_private_link_dialog"
    >
      <ModalDialog.Header>{t("Common:RevokeLink")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("Common:PrivateLinkRevokeDescription")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:RevokeLink")}
          onClick={onRevoke}
          isLoading={isLoading}
          testId="revoke_private_link_dialog_submit"
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={onClose}
          isDisabled={isLoading}
          testId="revoke_private_link_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
