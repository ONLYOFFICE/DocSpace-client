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
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

interface RemoveSubscriptionDialogProps {
  visible?: boolean;
  removeSubscription?: () => Promise<void>;
  closeRemoveSubscriptionDialog?: () => void;
}

const RemoveSubscriptionDialog = ({
  visible,
  removeSubscription,
  closeRemoveSubscriptionDialog,
}: RemoveSubscriptionDialogProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await removeSubscription?.();
      closeRemoveSubscriptionDialog?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={() => closeRemoveSubscriptionDialog?.()}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Common:RemoveSubscription")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px">
          {t("DocsConnect:RemoveSubscriptionConfirm", {
            service: t("DocsConnect:DocsConnect"),
          })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:Remove")}
          onClick={onConfirm}
          isLoading={submitting}
          isDisabled={submitting}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={() => closeRemoveSubscriptionDialog?.()}
          isDisabled={submitting}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  visible: docsConnectStore.removeSubscriptionDialogVisible,
  removeSubscription: docsConnectStore.cancelPlan,
  closeRemoveSubscriptionDialog: docsConnectStore.closeRemoveSubscriptionDialog,
}))(observer(RemoveSubscriptionDialog));
