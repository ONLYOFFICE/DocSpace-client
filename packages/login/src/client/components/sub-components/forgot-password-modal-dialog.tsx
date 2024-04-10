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

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@docspace/shared/components/button";
import { EmailInput } from "@docspace/shared/components/email-input";
import { Text } from "@docspace/shared/components/text";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import ModalDialogContainer from "./modal-dialog-container";
import { sendInstructionsToChangePassword } from "@docspace/shared/api/people";
import { useTranslation } from "react-i18next";

interface IForgotPasswordDialogProps {
  isVisible: boolean;
  userEmail?: string;
  onDialogClose: VoidFunction;
}

const ForgotPasswordModalDialog: React.FC<IForgotPasswordDialogProps> = ({
  isVisible,
  userEmail,
  onDialogClose,
}) => {
  const [email, setEmail] = useState(userEmail);
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation("Login");

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    //console.log("onChangeEmail", event.target.value);
    setEmail(event.target.value);
    setEmailError(false);
    setIsShowError(false);
  };

  const onSendPasswordInstructions = () => {
    if (!email || !email.trim() || emailError) {
      setEmailError(true);
      setIsShowError(true);
    } else {
      setIsLoading(true);
      sendInstructionsToChangePassword(email)
        .then(
          (res: string) => toastr.success(res),
          (message: string) => toastr.error(message)
        )
        .finally(onDialogClose());
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    //console.log("onKeyDown", e.key);
    if (e.key === "Enter") {
      onSendPasswordInstructions();
      e.preventDefault();
    }
  };

  const onValidateEmail = (res: IEmailValid) => {
    setEmailError(!res.isValid);
    setErrorText(res.errors[0]);
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  return (
    <ModalDialogContainer
      displayType="modal"
      autoMaxHeight
      visible={isVisible}
      modalBodyPadding="12px 0 0 0"
      asideBodyPadding="16px 0 0 0"
      onClose={onDialogClose}
      id="forgot-password-modal"
    >
      <ModalDialog.Header>
        <Text isBold={true} fontSize="21px">
          {t("PasswordRecoveryTitle")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text
          key="text-body"
          className="text-body"
          isBold={false}
          fontSize="13px"
          noSelect
        >
          {t("MessageSendPasswordRecoveryInstructionsOnEmail")}
        </Text>

        <FieldContainer
          className="email-reg-field"
          key="e-mail"
          isVertical={true}
          hasError={isShowError && emailError}
          labelVisible={false}
          errorMessage={
            errorText ? t(`Common:${errorText}`) : t("Common:RequiredField")
          }
        >
          <EmailInput
            hasError={isShowError && emailError}
            placeholder={t("Common:RegistrationEmail")}
            isAutoFocussed={true}
            id="forgot-password-modal_email"
            name="e-mail"
            type="text"
            size="base"
            scale={true}
            tabIndex={2}
            isDisabled={isLoading}
            value={email}
            onChange={onChangeEmail}
            onKeyDown={onKeyDown}
            onValidateInput={onValidateEmail}
            onBlur={onBlurEmail}
          />
        </FieldContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="forgot-password-modal_send"
          className="modal-dialog-button"
          key="ForgotSendBtn"
          label={
            isLoading ? t("Common:LoadingProcessing") : t("Common:SendButton")
          }
          size="normal"
          scale
          primary={true}
          onClick={onSendPasswordInstructions}
          isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={2}
        />
        <Button
          id="forgot-password-modal_cancel"
          className="modal-dialog-button"
          key="CancelBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          primary={false}
          onClick={onDialogClose}
          isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={2}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

ForgotPasswordModalDialog.propTypes = {
  userEmail: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  onDialogClose: PropTypes.func.isRequired,
};

export default ForgotPasswordModalDialog;
