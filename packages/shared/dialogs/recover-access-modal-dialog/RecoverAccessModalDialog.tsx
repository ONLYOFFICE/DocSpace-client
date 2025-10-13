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
import { useTheme } from "styled-components";

import { Text } from "../../components/text";
import { toastr } from "../../components/toast";
import { Button, ButtonSize } from "../../components/button";
import { Textarea } from "../../components/textarea";
import { EmailInput } from "../../components/email-input";
import { InputSize } from "../../components/text-input";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { FieldContainer } from "../../components/field-container";
import { TValidate } from "../../components/email-input/EmailInput.types";

import { sendRecoverRequest } from "../../api/settings";
import { useCaptcha } from "../../hooks/useCaptcha";
import Captcha from "../../components/captcha";

import type { RecoverAccessModalDialogProps } from "./RecoverAccessModalDialog.types";
import styles from "./RecoverAccessModalDialog.module.scss";

type TError =
  | {
      response?: {
        status?: number | string;
        data?: {
          error?: {
            message: string;
          };
        };
      };
      statusText?: string;
      message?: string;
    }
  | string;

const RecoverAccessModalDialog: React.FC<RecoverAccessModalDialogProps> = ({
  visible,
  onClose,
  textBody,
  emailPlaceholderText,
  id,
  reCaptchaPublicKey,
  reCaptchaType,
}) => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [description, setDescription] = useState("");
  const [descErr, setDescErr] = useState(false);

  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation(["Login", "Common"]);
  const theme = useTheme();

  const captcha = useCaptcha({
    publicKey: reCaptchaPublicKey,
    type: reCaptchaType,
  });

  React.useEffect(() => {
    if (visible && reCaptchaPublicKey) {
      captcha.request();
    } else if (!visible) {
      captcha.dismiss();
    }
  }, [visible, reCaptchaPublicKey, captcha.request, captcha.dismiss]);

  React.useEffect(() => {
    return () => {
      captcha.dismiss();
    };
  }, [captcha.dismiss]);

  const onRecoverModalClose = () => {
    setEmail("");
    setEmailErr(false);
    setDescription("");
    setDescErr(false);
    setIsShowError(false);
    onClose?.();
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
    setEmailErr(false);
    setIsShowError(false);
  };

  const onValidateEmail = (res: TValidate) => {
    setEmailErr(!res.isValid);
    setEmailErrorMessage(res.errors?.[0] ?? "");

    return undefined;
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  const onChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.currentTarget.value);
    setDescErr(false);
  };

  const onSendRecoverRequest = async () => {
    if (!email.trim() || emailErr) {
      setIsShowError(true);
      return setEmailErr(true);
    }
    if (!description.trim()) {
      return setDescErr(true);
    }

    const captchaValidation = captcha.validate();
    if (!captchaValidation.isValid) {
      return;
    }

    const captchaToken = captchaValidation.token ?? undefined;

    setLoading(true);

    try {
      const res = await sendRecoverRequest(
        email,
        description,
        captchaToken,
        reCaptchaType,
      );

      setLoading(false);
      if (typeof res === "string") toastr.success(res);
      onRecoverModalClose();
    } catch (e) {
      const error = e as TError;
      setLoading(false);

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
    }
  };

  return (
    <ModalDialog
      id={id}
      isLarge
      autoMaxHeight
      visible={visible}
      onClose={onRecoverModalClose}
      displayType={ModalDialogType.modal}
      aria-labelledby="recover-access-modal-title"
      dataTestId="recover_access_modal"
    >
      <ModalDialog.Header>{t("Common:RecoverTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <Text
            key="text-body"
            className={styles.textBody}
            isBold={false}
            fontSize="13px"
            dataTestId="recover_access_modal_text"
          >
            {textBody}
          </Text>
          <FieldContainer
            isVertical
            key="e-mail"
            labelVisible={false}
            hasError={isShowError ? emailErr : undefined}
            errorMessage={
              emailErrorMessage
                ? t(`Common:${emailErrorMessage}`)
                : t("Common:RequiredField")
            }
            dataTestId="recover_access_modal_email_container"
          >
            <EmailInput
              scale
              tabIndex={1}
              name="e-mail"
              value={email}
              isAutoFocussed
              isDisabled={loading}
              size={InputSize.base}
              autoComplete="username"
              id="recover-access-modal_email"
              hasError={isShowError ? emailErr : undefined}
              placeholder={emailPlaceholderText}
              onBlur={onBlurEmail}
              onChange={onChangeEmail}
              onValidateInput={onValidateEmail}
              maxLength={255}
              aria-label="Email input"
              aria-invalid={emailErr}
              aria-required="true"
              dataTestId="recover_access_modal_email_input"
            />
          </FieldContainer>
          <FieldContainer
            isVertical
            hasError={descErr}
            labelVisible={false}
            className={styles.textarea}
            key="text-description"
            errorMessage={t("Common:RequiredField")}
            dataTestId="recover_access_modal_description_container"
          >
            <Textarea
              tabIndex={2}
              hasError={descErr}
              heightScale={false}
              value={description}
              isDisabled={loading}
              heightTextArea="70px"
              id="recover-access-modal_description"
              placeholder={t("Common:RecoverDescribeYourProblemPlaceholder")}
              onChange={onChangeDescription}
              maxLength={255}
              aria-label="Problem description"
              aria-invalid={descErr}
              aria-required="true"
              dataTestId="recover_access_modal_description_textarea"
            />
          </FieldContainer>
          {captcha.shouldRender ? (
            <Captcha
              key="recover-access-captcha"
              id="recover-access-captcha-widget"
              type={captcha.captchaType}
              publicKey={reCaptchaPublicKey}
              themeMode={theme.isBase ? "light" : "dark"}
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
        <div className={styles.footer}>
          <Button
            primary
            tabIndex={3}
            isLoading={loading}
            isDisabled={loading}
            key="RecoverySendBtn"
            size={ButtonSize.normal}
            id="recover-access-modal_send"
            className={styles.recoverButtonDialog}
            label={loading ? t("Common:Sending") : t("Common:SendButton")}
            onClick={onSendRecoverRequest}
            aria-label="Send recover request"
            testId="recover_access_modal_submit_button"
          />
          <Button
            tabIndex={4}
            isLoading={loading}
            isDisabled={loading}
            size={ButtonSize.normal}
            key="SendBtn-recover-close"
            id="recover-access-modal_cancel"
            className={styles.recoverButtonDialog}
            label={t("Common:CancelButton")}
            onClick={onRecoverModalClose}
            testId="recover_access_modal_close_button"
          />
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RecoverAccessModalDialog;
