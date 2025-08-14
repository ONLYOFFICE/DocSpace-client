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
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { EmailInput } from "@docspace/shared/components/email-input";
import { Text } from "@docspace/shared/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { sendInstructionsToChangePassword } from "@docspace/shared/api/people";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import { InputSize } from "@docspace/shared/components/text-input";
import { ButtonKeys } from "@docspace/shared/enums";

import { ForgotPasswordModalDialogProps } from "@/types";

import ModalDialogContainer from "../../ModalDialogContainer";

const ForgotPasswordModalDialog = ({
  isVisible,
  userEmail,
  onDialogClose,
}: ForgotPasswordModalDialogProps) => {
  const [email, setEmail] = useState(userEmail ?? "");
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation(["Login", "Common"]);

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("onChangeEmail", event.target.value);
    setEmail(event.target.value);
    setEmailError(false);
    setIsShowError(false);
  };

  const onSendPasswordInstructions = React.useCallback(async () => {
    if (!email || !email.trim() || emailError) {
      setEmailError(true);
      setIsShowError(true);
    } else {
      setIsLoading(true);

      try {
        const res = (await sendInstructionsToChangePassword(email)) as string;
        toastr.success(res);
      } catch (e) {
        toastr.error(e as string);
      } finally {
        onDialogClose();
      }
    }
  }, [email, emailError, onDialogClose]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.enter) {
        onSendPasswordInstructions();
        e.preventDefault();
      }
    },
    [onSendPasswordInstructions],
  );

  const onValidateEmail = (res: TValidate) => {
    setEmailError(!res.isValid);
    setErrorText(res.errors?.[0] ?? "");

    return undefined;
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <ModalDialog
      displayType={ModalDialogType.modal}
      autoMaxHeight
      visible={isVisible}
      onClose={onDialogClose}
      id="forgot-password-modal"
    >
      <ModalDialog.Header>{t("PasswordRecoveryTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <ModalDialogContainer>
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
            isVertical
            hasError={isShowError ? emailError : undefined}
            labelVisible={false}
            errorMessage={
              errorText ? t(`Common:${errorText}`) : t("Common:RequiredField")
            }
            dataTestId="email_input_field"
          >
            <EmailInput
              hasError={isShowError ? emailError : undefined}
              placeholder={t("Common:RegistrationEmail")}
              isAutoFocussed
              id="forgot-password-modal_email"
              name="e-mail"
              size={InputSize.base}
              scale
              tabIndex={2}
              isDisabled={isLoading}
              value={email}
              onChange={onChangeEmail}
              onValidateInput={onValidateEmail}
              onBlur={onBlurEmail}
            />
          </FieldContainer>
        </ModalDialogContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="forgot-password-modal_send"
          className="modal-dialog-button"
          key="ForgotSendBtn"
          label={
            isLoading ? t("Common:LoadingProcessing") : t("Common:SendButton")
          }
          size={ButtonSize.normal}
          scale
          primary
          onClick={onSendPasswordInstructions}
          isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={2}
          testId="forgot_password_send_button"
        />
        <Button
          id="forgot-password-modal_cancel"
          className="modal-dialog-button"
          key="CancelBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          primary={false}
          onClick={onDialogClose}
          // isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={2}
          testId="forgot_password_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ForgotPasswordModalDialog;
