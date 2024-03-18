// (c) Copyright Ascensio System SIA 2010-2024
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

import React from "react";
import { Button } from "@docspace/shared/components/button";
import { EmailInput } from "@docspace/shared/components/email-input";
import { Text } from "@docspace/shared/components/text";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { useTranslation } from "react-i18next";
import ModalDialogContainer from "./modal-dialog-container";
import { TenantTrustedDomainsType } from "@docspace/shared/enums";

interface IRegisterModalDialogProps {
  visible: boolean;
  loading: boolean;
  email?: string;
  emailErr: boolean;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateEmail: (res: IEmailValid) => void;
  onBlurEmail: () => void;
  onSendRegisterRequest: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onRegisterModalClose: () => void;
  trustedDomainsType?: number;
  trustedDomains?: string[];
  errorText?: string;
  isShowError?: boolean;
}

const RegisterModalDialog: React.FC<IRegisterModalDialogProps> = ({
  visible,
  loading,
  email,
  emailErr,
  onChangeEmail,
  onValidateEmail,
  onBlurEmail,
  onRegisterModalClose,
  onSendRegisterRequest,
  onKeyDown,
  trustedDomainsType,
  trustedDomains,
  errorText,
  isShowError,
}) => {
  const { t } = useTranslation("Login");

  const getDomains = () => {
    if (trustedDomains)
      return trustedDomains.map((domain, i) => (
        <span key={i}>
          <b>
            {domain}
            {i === trustedDomains.length - 1 ? "." : ", "}
          </b>
        </span>
      ));
  };

  const getDomainsBlock = () => {
    return trustedDomainsType === TenantTrustedDomainsType.Custom ? (
      <>
        {t("RegisterTextBodyBeforeDomainsList")} {getDomains()}{" "}
      </>
    ) : (
      <></>
    );
  };

  return (
    <ModalDialogContainer
      id="registration-modal"
      displayType="modal"
      visible={visible}
      onClose={onRegisterModalClose}
      isLarge
    >
      <ModalDialog.Header>
        <Text isBold={true} fontSize="21px">
          {t("RegisterTitle")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text key="text-body" isBold={false} fontSize="13px" noSelect>
          {getDomainsBlock()}
          {t("RegisterTextBodyAfterDomainsList")}
        </Text>

        <FieldContainer
          className="email-reg-field"
          key="e-mail"
          isVertical={true}
          hasError={isShowError && emailErr}
          labelVisible={false}
          errorMessage={
            errorText ? t(`Common:${errorText}`) : t("Common:RequiredField")
          }
        >
          <EmailInput
            hasError={isShowError && emailErr}
            placeholder={t("Common:RegistrationEmail")}
            isAutoFocussed={true}
            id="registration-modal_email"
            name="e-mail"
            type="email"
            size="base"
            scale={true}
            tabIndex={1}
            isDisabled={loading}
            value={email}
            onChange={onChangeEmail}
            onValidateInput={onValidateEmail}
            onBlur={onBlurEmail}
            autoComplete="username"
            onKeyDown={onKeyDown}
          />
        </FieldContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="registration-modal_send"
          className="modal-dialog-button"
          key="RegisterSendBtn"
          label={loading ? t("Common:Sending") : t("Common:SendRequest")}
          size="normal"
          scale={false}
          primary={true}
          onClick={onSendRegisterRequest}
          isLoading={loading}
          isDisabled={loading}
          tabIndex={3}
        />

        <Button
          id="registration-modal_cancel"
          className="modal-dialog-button"
          key="CancelBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale={false}
          primary={false}
          onClick={onRegisterModalClose}
          isLoading={loading}
          isDisabled={loading}
          tabIndex={2}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default RegisterModalDialog;
