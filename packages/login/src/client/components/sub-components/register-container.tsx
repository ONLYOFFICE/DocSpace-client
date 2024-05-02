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

import React, { useState } from "react";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import RegisterModalDialog from "./register-modal-dialog";
import styled from "styled-components";
import { sendRegisterRequest } from "@docspace/shared/api/settings";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";

interface IRegisterProps {
  language?: string;
  isAuthenticated?: boolean;
  enabledJoin: boolean;
  trustedDomainsType?: number;
  trustedDomains?: string[];
  theme?: any;
  currentColorScheme?: ITheme;
  id?: string;
}

const StyledRegister = styled(Box)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 184;
  width: 100%;
  height: 68px;
  padding: 1.5em;
  bottom: 0;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 0;` : `right: 0;`}
  background-color: ${(props) => props.theme.login.register.backgroundColor};
  cursor: pointer;
`;

StyledRegister.defaultProps = { theme: Base };

const Register: React.FC<IRegisterProps> = (props) => {
  const {
    enabledJoin,
    isAuthenticated,
    trustedDomainsType,
    trustedDomains,
    theme,
    currentColorScheme,
    id,
  } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const { t } = useTranslation("Login");

  const onRegisterClick = () => {
    setVisible(true);
  };

  const onRegisterModalClose = () => {
    setVisible(false);
    setEmail("");
    setEmailErr(false);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      setEmail(e.currentTarget.value);
      setEmailErr(false);
      setIsShowError(false);
    }
  };

  const onValidateEmail = (res: IEmailValid) => {
    setEmailErr(!res.isValid);
    setErrorText(res.errors[0]);
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  const onSendRegisterRequest = () => {
    if (!email.trim() || emailErr) {
      setEmailErr(true);
      setIsShowError(true);
    } else {
      setLoading(true);
      sendRegisterRequest(email)
        .then((res: string) => {
          setLoading(false);
          toastr.success(res);
        })
        .catch((error: any) => {
          setLoading(false);
          toastr.error(error);
        })
        .finally(onRegisterModalClose);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onSendRegisterRequest();
      e.preventDefault();
    }
  };

  return enabledJoin && !isAuthenticated ? (
    <>
      <StyledRegister id={id} onClick={onRegisterClick}>
        <Text as="span" color={currentColorScheme?.main?.accent}>
          {t("Register")}
        </Text>
      </StyledRegister>

      {visible && (
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
      )}
    </>
  ) : (
    <></>
  );
};

export default inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, language } = authStore;
  const { theme } = settingsStore;
  return {
    theme,
    isAuthenticated,
    language,
  };
})(observer(Register));
