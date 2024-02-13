/* eslint-disable jsx-a11y/tabindex-no-positive */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Textarea } from "@docspace/shared/components/textarea";
import { EmailInput } from "@docspace/shared/components/email-input";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";

import { sendRecoverRequest } from "@docspace/shared/api/settings";

import { ModalDialogContainer } from "./RecoverAccessModalDialog.styled";
import type { IRecoverAccessModalDialogProps } from "./RecoverAccessModalDialog.types";

const RecoverAccessModalDialog: React.FC<IRecoverAccessModalDialogProps> = ({
  visible,
  onClose,
  textBody,
  emailPlaceholderText,
  id,
}) => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [description, setDescription] = useState("");
  const [descErr, setDescErr] = useState(false);

  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation(["Login", "Common"]);

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

  const onSendRecoverRequest = () => {
    if (!email.trim() || emailErr) {
      setIsShowError(true);
      return setEmailErr(true);
    }
    if (!description.trim()) {
      return setDescErr(true);
    }

    setLoading(true);
    sendRecoverRequest(email, description)
      ?.then((res) => {
        setLoading(false);
        if (typeof res === "string") toastr.success(res);
      })
      ?.catch((error) => {
        setLoading(false);
        toastr.error(error);
      })
      .finally(onRecoverModalClose);
  };

  return (
    <ModalDialogContainer
      id={id}
      isLarge
      visible={visible}
      onClose={onRecoverModalClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        <Text isBold fontSize="21px">
          {t("Common:RecoverTitle")}
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
          {textBody}
        </Text>
        <FieldContainer
          isVertical
          key="e-mail"
          labelVisible={false}
          hasError={isShowError && emailErr}
          errorMessage={
            emailErrorMessage
              ? t(`Common:${emailErrorMessage}`)
              : t("Common:RequiredField")
          }
        >
          <EmailInput
            scale
            tabIndex={1}
            name="e-mail"
            value={email}
            isAutoFocussed
            isDisabled={loading}
            size={InputSize.base}
            type={InputType.email}
            autoComplete="username"
            id="recover-access-modal_email"
            hasError={isShowError && emailErr}
            placeholder={emailPlaceholderText}
            onBlur={onBlurEmail}
            onChange={onChangeEmail}
            onValidateInput={onValidateEmail}
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          hasError={descErr}
          labelVisible={false}
          className="textarea"
          key="text-description"
          errorMessage={t("Common:RequiredField")}
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
          />
        </FieldContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          tabIndex={3}
          isLoading={loading}
          isDisabled={loading}
          key="RecoverySendBtn"
          size={ButtonSize.normal}
          id="recover-access-modal_send"
          className="recover-button-dialog"
          label={loading ? t("Common:Sending") : t("Common:SendButton")}
          onClick={onSendRecoverRequest}
        />
        <Button
          tabIndex={4}
          isLoading={loading}
          isDisabled={loading}
          size={ButtonSize.normal}
          key="SendBtn-recover-close"
          id="recover-access-modal_cancel"
          className="recover-button-dialog"
          label={t("Common:CancelButton")}
          onClick={onRecoverModalClose}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default RecoverAccessModalDialog;
