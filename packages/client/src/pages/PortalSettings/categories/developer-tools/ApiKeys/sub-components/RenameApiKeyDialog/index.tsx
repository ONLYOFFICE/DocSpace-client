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

import { useEffect, useState } from "react";

import { withTranslation } from "react-i18next";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { RenameApiKeyDialogProps } from "../../types";

const RenameApiKeyDialog = (props: RenameApiKeyDialogProps) => {
  const {
    t,
    tReady,
    isVisible,
    setIsVisible,
    item,
    onChangeApiKeyParams,
    isRequestRunning,
  } = props;

  const [inputValue, setInputValue] = useState(item.name);
  const [isValid, setIsValid] = useState(true);

  const onClose = () => {
    setIsVisible(false);
  };

  const onRename = () => {
    onChangeApiKeyParams(item.id, { name: inputValue });
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !isRequestRunning) {
      onRename();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [inputValue]);

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={isVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Settings:CreateNewSecretKey")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <TextInput
          value={inputValue}
          type={InputType.text}
          isAutoFocussed
          onChange={(e) => {
            setIsValid(true);
            setInputValue(e.target.value);
          }}
          hasError={!isValid}
          scale
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          primary
          onClick={onRename}
          scale
          isLoading={isRequestRunning}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
          isLoading={isRequestRunning}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Files", "Common"])(RenameApiKeyDialog);
