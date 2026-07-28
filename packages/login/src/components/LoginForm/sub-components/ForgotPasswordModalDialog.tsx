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
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { EmailInput } from "@docspace/ui-kit/components/email-input";
import { Text } from "@docspace/ui-kit/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { toastr } from "@docspace/ui-kit/components/toast";
import { sendInstructionsToChangePassword } from "@docspace/shared/api/people";
import { TValidate } from "@docspace/ui-kit/components/email-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { ButtonKeys } from "@docspace/shared/enums";
import { useCaptcha } from "@docspace/shared/hooks/useCaptcha";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import Captcha from "@docspace/shared/components/captcha";

import { ForgotPasswordModalDialogProps, TError } from "@/types";

import styles from "../../modal.module.scss";

const ForgotPasswordModalDialog = ({
  isVisible,
  userEmail,
  onDialogClose,
  reCaptchaPublicKey,
  reCaptchaType,
}: ForgotPasswordModalDialogProps) => {
  const [email, setEmail] = useState(userEmail ?? "");
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation(["Login", "Common"]);
  const { isBase } = useTheme();

  const captcha = useCaptcha({
    publicKey: reCaptchaPublicKey,
    type: reCaptchaType,
  });

  React.useEffect(() => {
    if (isVisible && reCaptchaPublicKey) {
      captcha.request();
    } else if (!isVisible) {
      captcha.dismiss();
      setEmailError(false);
      setIsShowError(false);
      setErrorText("");
    }
  }, [isVisible, reCaptchaPublicKey, captcha.request, captcha.dismiss]);

  React.useEffect(() => {
    return () => {
      captcha.dismiss();
    };
  }, [captcha.dismiss]);

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
      const captchaValidation = captcha.validate();
      if (!captchaValidation.isValid) {
        return;
      }

      const captchaToken = captchaValidation.token;

      setIsLoading(true);

      try {
        const res = (await sendInstructionsToChangePassword(
          email,
          captchaToken,
          reCaptchaType,
        )) as string;
        toastr.success(res);
        onDialogClose();
      } catch (e) {
        const error = e as TError;

        let errorMessage = "";
        if (typeof error === "object") {
          errorMessage =
            error?.response?.data?.error?.message ||
            error?.statusText ||
            error?.message ||
            "";
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        if (errorMessage) {
          toastr.error(errorMessage);
        }

        const status =
          typeof error === "object" ? error?.response?.status : undefined;

        if (reCaptchaPublicKey && status === 403) {
          captcha.request();
        } else if (captcha.isVisible) {
          captcha.reset();
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    email,
    emailError,
    captcha.validate,
    captcha.request,
    captcha.reset,
    captcha.isVisible,
    onDialogClose,
    reCaptchaPublicKey,
    reCaptchaType,
  ]);

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
        <div className={styles.modalContainer}>
          <Text
            key="text-body"
            className="text-body"
            isBold={false}
            fontSize="13px"
          >
            {t("MessageSendPasswordRecoveryInstructionsOnEmail")}
          </Text>

          <FieldContainer
            className={styles.emailRegField}
            key="e-mail"
            isVertical
            hasError={isShowError ? emailError : undefined}
            labelVisible={false}
            errorMessage={
              errorText
                // biome-ignore lint/plugin/no-dynamic-i18n-key: errorText is a runtime-provided key fragment composed with "Common:" prefix
                ? t(`Common:${errorText}`)
                : t("Common:RequiredField")
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
          {captcha.shouldRender ? (
            <Captcha
              key="forgot-password-captcha"
              id="forgot-password-captcha-widget"
              type={captcha.captchaType}
              publicKey={reCaptchaPublicKey}
              themeMode={isBase ? "light" : "dark"}
              visible={captcha.isVisible}
              hasError={captcha.isError}
              errorText={t("Errors:LoginWithBruteForceCaptcha")}
              onTokenChange={captcha.onTokenChange}
              resetSignal={captcha.resetSignal}
            />
          ) : null}
        </div>
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
