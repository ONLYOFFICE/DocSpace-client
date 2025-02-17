// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";
import { TTranslation } from "@docspace/shared/types";

interface ICancelOperationDialogProps {
  visible: boolean;
  setOperationCancelVisible: (visible: boolean) => void;
  cancelUpload: (t: TTranslation) => void;
  setHideConfirmCancelOperation: (hide: boolean) => void;
  isSecondaryProgressVisbile: boolean;
}

interface IStoreProps {
  dialogsStore: {
    operationCancelVisible: boolean;
    setOperationCancelVisible: (visible: boolean) => void;
  };
  uploadDataStore: {
    cancelUpload: (t: TTranslation) => void;
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
    cancelUpload(t);
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
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button label={t("Common:Yes")} onClick={onConfirm} primary scale />
        <Button label={t("Common:No")} onClick={onClose} scale />
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
