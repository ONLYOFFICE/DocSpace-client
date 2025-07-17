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

import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { FieldContainer } from "@docspace/shared/components/field-container";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { EmailInput } from "@docspace/shared/components/email-input";
import { ErrorKeys } from "@docspace/shared/enums";

const SalesDepartmentRequestDialog = ({
  visible,
  onClose,
  sendPaymentRequest,
}) => {
  const { t, ready } = useTranslation([
    "SalesDepartmentRequestDialog",
    "Common",
    "SMTPSettings",
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [emailError, setEmailError] = useState("");

  const [description, setDescription] = useState("");
  const [isValidDescription, setIsValidDescription] = useState(true);

  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState(true);

  const onCloseModal = () => {
    onClose && onClose();
  };

  const onChangeEmail = (e) => {
    setEmail(e.currentTarget.value);
    setIsValidEmail(true);
  };

  const onChangeDescription = (e) => {
    setDescription(e.currentTarget.value);
    setIsValidName(true);
  };
  const onChangeName = (e) => {
    setName(e.currentTarget.value);
    setIsValidDescription(true);
  };
  const onSendRequest = async () => {
    const isEmailValid = email.trim();
    const isDescriptionValid = description.trim();
    const isNameValid = name.trim();

    if (!isEmailValid || !isDescriptionValid || !isNameValid) {
      setIsValidEmail(isEmailValid);
      setIsValidName(isNameValid);
      setIsValidDescription(isDescriptionValid);
      return;
    }

    if (emailError) {
      setIsValidEmail(false);
      return;
    }

    setIsLoading(true);

    await sendPaymentRequest(email, name, description, t);

    onClose && onClose();
  };

  const onValidateEmailInput = (result) => {
    if (result.isValid) {
      setEmailError("");
      return;
    }

    const translatedErrors = result.errors.map((errorKey) => {
      switch (errorKey) {
        case ErrorKeys.LocalDomain:
          return t("Common:LocalDomain");
        case ErrorKeys.IncorrectDomain:
          return t("Common:IncorrectDomain");
        case ErrorKeys.DomainIpAddress:
          return t("Common:DomainIpAddress");
        case ErrorKeys.PunycodeDomain:
          return t("Common:PunycodeDomain");
        case ErrorKeys.PunycodeLocalPart:
          return t("Common:PunycodeLocalPart");
        case ErrorKeys.IncorrectLocalPart:
          return t("Common:IncorrectLocalPart");
        case ErrorKeys.SpacesInLocalPart:
          return t("Common:SpacesInLocalPart");
        case ErrorKeys.MaxLengthExceeded:
          return t("Common:MaxLengthExceeded");
        case ErrorKeys.IncorrectEmail:
          return t("Common:IncorrectEmail");
        case ErrorKeys.ManyEmails:
          return t("Common:ManyEmails");
        case ErrorKeys.EmptyEmail:
          return t("Common:EmptyEmail");
        default:
          throw new Error("Unknown translation key");
      }
    });

    setEmailError(translatedErrors[0]);
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseModal}
      autoMaxHeight
      isLoading={!ready}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        <Text isBold fontSize="21px">
          {t("SalesDepartmentRequest")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text
          key="text-body"
          className="text-body"
          isBold={false}
          fontSize="13px"
        >
          {t("YouWillBeContacted")}
        </Text>

        <br />
        <FieldContainer
          className="name_field"
          key="name"
          isVertical
          hasError={!isValidName}
          labelVisible={false}
          errorMessage={t("Common:RequiredField")}
        >
          <TextInput
            id="your-name"
            hasError={!isValidName}
            name="name"
            type="text"
            size="base"
            scale
            tabIndex={1}
            placeholder={t("YourName")}
            isAutoFocussed
            isDisabled={isLoading}
            value={name}
            onChange={onChangeName}
          />
        </FieldContainer>

        <FieldContainer
          className="e-mail_field"
          key="e-mail"
          isVertical
          labelVisible={false}
          hasError={!isValidEmail}
          errorMessage={emailError}
        >
          <EmailInput
            id="registration-email"
            name="e-mail"
            scale
            value={email}
            onChange={onChangeEmail}
            onValidateInput={onValidateEmailInput}
            hasError={!isValidEmail}
            placeholder={t("SMTPSettings:EnterEmail")}
          />
        </FieldContainer>

        <FieldContainer
          className="description_field"
          key="text-description"
          isVertical
          hasError={!isValidDescription}
          labelVisible={false}
          errorMessage={t("Common:RequiredField")}
        >
          <Textarea
            id="request-details"
            heightScale={false}
            hasError={!isValidDescription}
            placeholder={t("RequestDetails")}
            tabIndex={3}
            value={description}
            onChange={onChangeDescription}
            isDisabled={isLoading}
            heightTextArea={100}
            maxLength={255}
          />
        </FieldContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-button"
          label={isLoading ? t("Common:Sending") : t("Common:SendButton")}
          size="normal"
          primary
          onClick={onSendRequest}
          isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={3}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseModal}
          isLoading={isLoading}
          isDisabled={isLoading}
          tabIndex={3}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

SalesDepartmentRequestDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default inject(({ paymentStore }) => {
  const { sendPaymentRequest } = paymentStore;

  return {
    sendPaymentRequest,
  };
})(observer(SalesDepartmentRequestDialog));
