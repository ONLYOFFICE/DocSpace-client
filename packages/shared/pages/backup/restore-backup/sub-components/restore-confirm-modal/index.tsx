// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";

import type { TTranslation } from "../../../../../types";
import styles from "./RestoreConfirmModal.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type RestoreConfirmModalProps = {
  visible: boolean;
  isLoading: boolean;
  isRestoreAcknowledged: boolean;
  onClose: () => void;
  onChangeRestoreAcknowledged: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  t: TTranslation;
};

const RestoreConfirmModal = ({
  visible,
  isLoading,
  isRestoreAcknowledged,
  onClose,
  onChangeRestoreAcknowledged,
  onConfirm,
  t,
}: RestoreConfirmModalProps) => {
  return (
    <ModalDialog
      className={styles.restoreBackupConfirmDialog}
      displayType={ModalDialogType.modal}
      visible={visible}
      onClose={onClose}
      isCloseable={!isLoading}
      isLarge
      dataTestId="restore_backup_confirm_dialog"
    >
      <ModalDialog.Header>
        {t("Common:RestoreBackupConfirmTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div
          className={styles.restoreBackupConfirmModalBody}
          data-testid="restore_backup_confirm_modal"
        >
          <Text
            as="p"
            fontWeight={600}
            className={styles.restoreBackupConfirmText}
          >
            {t("Common:RestoreBackupConfirmBoldText", {
              productName: getBrandName("ProductName"),
            })}
          </Text>
          <Text as="p" className={styles.restoreBackupConfirmText}>
            {t("Common:RestoreBackupConfirmReplaceText")}
          </Text>
          <Text as="p" className={styles.restoreBackupConfirmText}>
            {t("Common:RestoreBackupConfirmAccessText")}
          </Text>

          <Checkbox
            name="restoreBackupConfirmAcknowledge"
            className={styles.restoreBackupConfirmCheckbox}
            onChange={onChangeRestoreAcknowledged}
            isChecked={isRestoreAcknowledged}
            label={t("Common:RestoreBackupConfirmAcknowledge")}
            dataTestId="restore_backup_confirm_checkbox"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:Restore")}
          onClick={onConfirm}
          isDisabled={!isRestoreAcknowledged || isLoading}
          isLoading={isLoading}
          testId="restore_backup_confirm_button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={onClose}
          isDisabled={isLoading}
          testId="restore_backup_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RestoreConfirmModal;
