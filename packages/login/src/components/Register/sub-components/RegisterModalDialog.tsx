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

import React from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { EmailInput } from "@docspace/shared/components/email-input";
import { Text } from "@docspace/shared/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { InputSize } from "@docspace/shared/components/text-input";
import { TenantTrustedDomainsType } from "@docspace/shared/enums";

import { RegisterModalDialogProps } from "@/types";

import ModalDialogContainer from "../../ModalDialogContainer";

const RegisterModalDialog = ({
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
}: RegisterModalDialogProps) => {
  const { t } = useTranslation(["Login", "Common"]);

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const getDomains = () => {
    if (trustedDomains)
      return trustedDomains.map((domain, i) => (
        <span key={domain}>
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
    ) : null;
  };

  return (
    <ModalDialog
      id="registration-modal"
      displayType={ModalDialogType.modal}
      visible={visible}
      onClose={onRegisterModalClose}
      isLarge
    >
      <ModalDialog.Header>{t("RegisterTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <ModalDialogContainer>
          <Text key="text-body" isBold={false} fontSize="13px">
            {getDomainsBlock()}
            {t("RegisterTextBodyAfterDomainsList")}
          </Text>

          <FieldContainer
            className="email-reg-field"
            key="e-mail"
            isVertical
            hasError={isShowError ? emailErr : undefined}
            labelVisible={false}
            errorMessage={
              errorText ? t(`Common:${errorText}`) : t("Common:RequiredField")
            }
            dataTestId="register_email_field"
          >
            <EmailInput
              hasError={isShowError ? emailErr : undefined}
              placeholder={t("Common:RegistrationEmail")}
              isAutoFocussed
              id="registration-modal_email"
              name="e-mail"
              size={InputSize.base}
              scale
              tabIndex={1}
              isDisabled={loading}
              value={email ?? ""}
              onChange={onChangeEmail}
              onValidateInput={onValidateEmail}
              onBlur={onBlurEmail}
              autoComplete="username"
            />
          </FieldContainer>
        </ModalDialogContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="registration-modal_send"
          className="modal-dialog-button"
          key="RegisterSendBtn"
          label={loading ? t("Common:Sending") : t("Common:SendRequest")}
          size={ButtonSize.normal}
          scale={false}
          primary
          onClick={onSendRegisterRequest}
          isLoading={loading}
          isDisabled={loading}
          tabIndex={3}
          testId="register_send_button"
        />

        <Button
          id="registration-modal_cancel"
          className="modal-dialog-button"
          key="CancelBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale={false}
          primary={false}
          onClick={onRegisterModalClose}
          isLoading={loading}
          isDisabled={loading}
          tabIndex={2}
          testId="register_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RegisterModalDialog;
