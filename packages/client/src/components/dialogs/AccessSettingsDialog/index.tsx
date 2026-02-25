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

import React, { useCallback, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import styles from "./AccessSettingsDialog.module.scss";

type AccessSettingsDialogProps = {
  accessSettingsDialogVisible: boolean;
  setAccessSettingsDialogVisible: (visible: boolean) => void;
  onSubmit?: () => void;
};

const AccessSettingsDialog = ({
  accessSettingsDialogVisible,
  setAccessSettingsDialogVisible,
  onSubmit,
}: AccessSettingsDialogProps) => {
  const { t } = useTranslation(["Files", "Common"]);
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
    },
    [],
  );

  const onClose = () => {
    setAccessSettingsDialogVisible(false);
  };

  const handleSubmit = () => {
    if (isChecked) {
      localStorage.setItem("hideAccessSettingsDialog", "true");
    }
    onSubmit?.();
    setAccessSettingsDialogVisible(false);
  };

  return (
    <ModalDialog
      visible={accessSettingsDialogVisible}
      autoMaxHeight
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Files:AccessSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text className={styles.description}>
          {t("Files:StealthModeAccessDescription")}
        </Text>
        <Checkbox
          key="dont-show-again"
          label={t("Common:DontShowMessage")}
          isChecked={isChecked}
          onChange={onChangeCheckbox}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="submit"
          label={t("Files:AccessSettings")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={handleSubmit}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore }: TStore) => {
  const { accessSettingsDialogVisible, setAccessSettingsDialogVisible } =
    dialogsStore;

  return {
    accessSettingsDialogVisible,
    setAccessSettingsDialogVisible,
  };
})(observer(AccessSettingsDialog));
