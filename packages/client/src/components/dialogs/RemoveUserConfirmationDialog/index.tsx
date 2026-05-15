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

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { useState } from "react";
import { toastr } from "@docspace/ui-kit/components/toast";

type Props = {
  setRemoveUserConfirmation: (
    visible: boolean,
    callback?: () => Promise<void>,
  ) => void;
  removeUserConfirmation: {
    visible: boolean;
    callback: () => Promise<void> | null;
  };
};

const RemoveUserConfirmationDialog = ({
  removeUserConfirmation,
  setRemoveUserConfirmation,
}: Props) => {
  const { t, ready } = useTranslation(["People", "Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    if (isLoading) return;
    setRemoveUserConfirmation(false);
  };

  const onDelete = async () => {
    if (removeUserConfirmation.callback) {
      try {
        setIsLoading(true);
        await removeUserConfirmation.callback();
      } catch (error) {
        toastr.error(error as Error);
        console.error(error);
      } finally {
        setIsLoading(false);
        onClose();
      }
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={removeUserConfirmation.visible}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("People:RemoveUser")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("People:RemoveUserConfirmationText")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={t("Common:Remove")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onDelete}
          isLoading={isLoading}
          testId="remove_user_confirmation_dialog_ok_button"
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isLoading={isLoading}
          testId="remove_user_confirmation_dialog_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const { setRemoveUserConfirmation, removeUserConfirmation } = dialogsStore;

  return {
    setRemoveUserConfirmation,
    removeUserConfirmation,
  };
})(observer(RemoveUserConfirmationDialog as React.FC));
