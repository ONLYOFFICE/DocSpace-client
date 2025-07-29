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

/* eslint-disable jsx-a11y/tabindex-no-positive */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

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

import type { RecoverAccessModalDialogProps } from "./RecoverAccessModalDialog.types";
import styles from "./RecoverAccessModalDialog.module.scss";

const RecoverAccessModalDialog: React.FC<RecoverAccessModalDialogProps> = ({
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
    <ModalDialog
      id={id}
      isLarge
      visible={visible}
      onClose={onRecoverModalClose}
      displayType={ModalDialogType.modal}
      data-testid="recover-access-modal"
      aria-labelledby="recover-access-modal-title"
    >
      <ModalDialog.Header>{t("Common:RecoverTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <Text
            key="text-body"
            className={styles.textBody}
            isBold={false}
            fontSize="13px"
            noSelect
            data-testid="recover-access-modal-text"
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
            dataTestId="recover-access-modal-email-container"
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
              data-testid="recover-access-modal-email-input"
              aria-label="Email input"
              aria-invalid={emailErr}
              aria-required="true"
            />
          </FieldContainer>
          <FieldContainer
            isVertical
            hasError={descErr}
            labelVisible={false}
            className={styles.textarea}
            key="text-description"
            errorMessage={t("Common:RequiredField")}
            dataTestId="recover-access-modal-description-container"
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
              data-testid="recover-access-modal-description-input"
              aria-label="Problem description"
              aria-invalid={descErr}
              aria-required="true"
            />
          </FieldContainer>
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
            data-testid="recover-access-modal-submit"
            aria-label="Send recover request"
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
          />
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RecoverAccessModalDialog;
