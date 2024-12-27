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

/* eslint-disable jsx-a11y/tabindex-no-positive */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "../text";
import { toastr } from "../toast";
import { Button, ButtonSize } from "../button";
import { Textarea } from "../textarea";
import { EmailInput } from "../email-input";
import { InputSize, InputType } from "../text-input";
import { ModalDialog, ModalDialogType } from "../modal-dialog";
import { FieldContainer } from "../field-container";
import { TValidate } from "../email-input/EmailInput.types";

import { sendRecoverRequest } from "../../api/settings";

import {
  StyledBodyContent,
  StyledFooterContent,
} from "./RecoverAccessModalDialog.styled";
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
    <ModalDialog
      id={id}
      isLarge
      visible={visible}
      onClose={onRecoverModalClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:RecoverTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
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
            hasError={isShowError ? emailErr : null}
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
              hasError={isShowError ? emailErr : null}
              placeholder={emailPlaceholderText}
              onBlur={onBlurEmail}
              onChange={onChangeEmail}
              onValidateInput={onValidateEmail}
              maxLength={255}
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
              maxLength={255}
            />
          </FieldContainer>
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <StyledFooterContent>
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
        </StyledFooterContent>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RecoverAccessModalDialog;
