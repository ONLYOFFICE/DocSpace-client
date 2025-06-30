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

"use client";

import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import { sendRegisterRequest } from "@docspace/shared/api/settings";

import { RegisterProps } from "@/types";

import { LoginDispatchContext } from "../Login";

import RegisterModalDialog from "./sub-components/RegisterModalDialog";
import { StyledRegister } from "./Register.styled";

const Register = (props: RegisterProps) => {
  const {
    enabledJoin,
    isAuthenticated,
    trustedDomainsType,
    trustedDomains,

    id,
  } = props;

  const { setIsModalOpen } = useContext(LoginDispatchContext);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const theme = useTheme();

  const { t } = useTranslation("Login");

  const onRegisterClick = () => {
    setVisible(true);
    setIsModalOpen(true);
  };

  const onRegisterModalClose = useCallback(() => {
    setVisible(false);
    setEmail("");
    setEmailErr(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      setEmail(e.currentTarget.value);
      setEmailErr(false);
      setIsShowError(false);
    }
  };

  const onValidateEmail = (res: TValidate) => {
    setEmailErr(!res.isValid);
    setErrorText(res.errors ? res.errors[0] : "");
    return undefined;
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  const onSendRegisterRequest = React.useCallback(async () => {
    if (!email.trim() || emailErr) {
      setEmailErr(true);
      setIsShowError(true);
    } else {
      setLoading(true);
      try {
        const res = await sendRegisterRequest(email);
        setLoading(false);
        toastr.success(res as string);
      } catch (e) {
        setLoading(false);
        toastr.error(e as string);
      } finally {
        onRegisterModalClose();
      }
    }
  }, [email, emailErr, onRegisterModalClose]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onSendRegisterRequest();
        e.preventDefault();
      }
    },
    [onSendRegisterRequest],
  );

  return enabledJoin && !isAuthenticated ? (
    <>
      <StyledRegister id={id} onClick={onRegisterClick}>
        <Text
          as="span"
          color={theme.currentColorScheme?.main?.accent}
          lineHeight="20px"
        >
          {t("Register")}
        </Text>
      </StyledRegister>

      {visible ? (
        <RegisterModalDialog
          visible={visible}
          loading={loading}
          email={email}
          emailErr={emailErr}
          trustedDomainsType={trustedDomainsType}
          trustedDomains={trustedDomains}
          onChangeEmail={onChangeEmail}
          onValidateEmail={onValidateEmail}
          onBlurEmail={onBlurEmail}
          onRegisterModalClose={onRegisterModalClose}
          onSendRegisterRequest={onSendRegisterRequest}
          onKeyDown={onKeyDown}
          errorText={errorText}
          isShowError={isShowError}
        />
      ) : null}
    </>
  ) : null;
};

export default Register;
