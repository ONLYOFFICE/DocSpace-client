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

import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import { inject, observer } from "mobx-react";

const StyledBodyContent = styled.div`
  display: contents;

  .text-body {
    margin-bottom: 16px;
  }
`;

const SalesDepartmentRequestDialog = ({
  visible,
  onClose,
  sendPaymentRequest,
}) => {
  const { t, ready } = useTranslation([
    "SalesDepartmentRequestDialog",
    "Common",
  ]);

  // TODO: setIsLoading is useless
  const [isLoading, setIsLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);

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

    await sendPaymentRequest(email, name, description);
    onClose && onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseModal}
      autoMaxHeight
      isLarge
      isLoading={!ready}
    >
      <ModalDialog.Header>
        <Text isBold fontSize="21px">
          {t("SalesDepartmentRequest")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <Text
            key="text-body"
            className="text-body"
            isBold={false}
            fontSize="13px"
          >
            {t("YouWillBeContacted")}
          </Text>

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
            errorMessage={t("Common:RequiredField")}
          >
            <TextInput
              hasError={!isValidEmail}
              id="registration-email"
              name="e-mail"
              type="text"
              size="base"
              scale
              tabIndex={2}
              placeholder={t("Common:RegistrationEmail")}
              isDisabled={isLoading}
              value={email}
              onChange={onChangeEmail}
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
            />
          </FieldContainer>
        </StyledBodyContent>
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
