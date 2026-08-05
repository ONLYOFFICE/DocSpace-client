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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { TTranslation } from "@docspace/shared/types";

interface ICancelOperationDialogProps {
  visible: boolean;
  setOperationCancelVisible: (visible: boolean) => void;
  cancelUpload: () => void;
  setHideConfirmCancelOperation: (hide: boolean) => void;
  isSecondaryProgressVisbile: boolean;
}

interface IStoreProps {
  dialogsStore: {
    operationCancelVisible: boolean;
    setOperationCancelVisible: (visible: boolean) => void;
  };
  uploadDataStore: {
    cancelUpload: () => void;
    secondaryProgressDataStore: {
      isSecondaryProgressVisbile: boolean;
    };
  };
  filesSettingsStore: {
    setHideConfirmCancelOperation: (hide: boolean) => void;
  };
}

const CancelOperationDialog: React.FC<ICancelOperationDialogProps> = ({
  visible,
  setOperationCancelVisible,
  cancelUpload,
  setHideConfirmCancelOperation,
  isSecondaryProgressVisbile,
}) => {
  const { t } = useTranslation(["UploadPanel", "Files", "Common"]);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const onClose = () => {
    setOperationCancelVisible(false);
  };

  const onConfirm = () => {
    cancelUpload();
    if (isChecked) setHideConfirmCancelOperation(true);
    setOperationCancelVisible(false);
  };

  const onChangeCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const bodyText = isSecondaryProgressVisbile
    ? t("Common:CancelUploadingProcess")
    : t("Common:CancelCurrentProcess");

  return (
    <ModalDialog visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Common:Confirmation")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{bodyText}</Text>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 0 0",
            boxSizing: "border-box",
          }}
        >
          <Checkbox
            label={t("Common:DontShowMessage")}
            isChecked={isChecked}
            onChange={onChangeCheckbox}
            dataTestId="cancel_operation_dont_show_checkbox"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button label={t("Common:Yes")} onClick={onConfirm} primary scale testId="cancel_operation_yes_button" />
        <Button label={t("Common:No")} onClick={onClose} scale testId="cancel_operation_no_button" />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ dialogsStore, uploadDataStore, filesSettingsStore }: IStoreProps) => {
    const { operationCancelVisible, setOperationCancelVisible } = dialogsStore;
    const { cancelUpload, secondaryProgressDataStore } = uploadDataStore;
    const { setHideConfirmCancelOperation } = filesSettingsStore;
    const { isSecondaryProgressVisbile } = secondaryProgressDataStore;

    return {
      visible: operationCancelVisible,
      setOperationCancelVisible,
      cancelUpload,
      setHideConfirmCancelOperation,
      isSecondaryProgressVisbile,
    };
  },
)(observer(CancelOperationDialog));
