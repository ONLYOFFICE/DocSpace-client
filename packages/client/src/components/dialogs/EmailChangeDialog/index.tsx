// (c) Copyright Ascensio System SIA 2009-2024
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

import styled from "styled-components";

import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { EmailInput } from "@docspace/shared/components/email-input";
import { InputType } from "@docspace/shared/components/text-input";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import { Text } from "@docspace/shared/components/text";

const DialogBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface EmailChangeDialogProps {
  visible: boolean;
  onClose: () => void;
  tempEmail: string;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateEmail: (res: TValidate) => {
    isValid: boolean;
    errors: string[];
  };
  hasError: boolean;
  checkEmailValidity: () => void;
  handleSave: () => void;
  displayName: string;
}

const EmailChangeDialog = ({
  visible,
  onClose,
  tempEmail,
  handleEmailChange,
  onValidateEmail,
  hasError,
  checkEmailValidity,
  handleSave,
  displayName,
}: EmailChangeDialogProps) => {
  const { t } = useTranslation(["Settings", "SMTPSettings", "Common"]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("AddEmail")}</ModalDialog.Header>
      <ModalDialog.Body>
        <DialogBodyWrapper>
          <Text>{displayName}</Text>
          <EmailInput
            placeholder={t("SMTPSettings:EnterEmail")}
            className="import-email-input"
            value={tempEmail}
            onChange={handleEmailChange}
            type={InputType.email}
            onValidateInput={onValidateEmail}
            hasError={hasError}
            onBlur={checkEmailValidity}
            isAutoFocussed
            scale
          />
        </DialogBodyWrapper>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={handleSave}
          isDisabled={hasError}
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EmailChangeDialog;
