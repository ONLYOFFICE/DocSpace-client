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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { isMobileOnly } from "react-device-detect";
import { useTheme } from "styled-components";

import { FieldContainer } from "@docspace/shared/components/field-container";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { createPasswordHash } from "@docspace/shared/utils/common";
import { checkIsSSR } from "@docspace/shared/utils";
import { checkPwd } from "@docspace/shared/utils/desktop";
import { login } from "@docspace/shared/utils/loginUtils";
import { toastr } from "@docspace/shared/components/toast";
import { thirdPartyLogin } from "@docspace/shared/api/user";
import { setWithCredentialsStatus } from "@docspace/shared/api/client";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";

import { LoginFormProps } from "@/types";

import EmailContainer from "./sub-components/EmailContainer";
import ForgotPasswordModalDialog from "./sub-components/ForgotPasswordModalDialog";

import { StyledCaptcha } from "./LoginForm.styled";

const settings = {
  minLength: 6,
  upperCase: false,
  digits: false,
  specSymbols: false,
};

const LoginForm = ({
  isLoading,
  hashSettings,
  isDesktop,
  match,
  setIsLoading,
  cookieSettingsEnabled,
  recaptchaPublicKey,
  emailFromInvitation,
  capabilities,
}: LoginFormProps) => {
  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [identifier, setIdentifier] = useState(emailFromInvitation ?? "");
  const [passwordValid, setPasswordValid] = useState(true);
  const [identifierValid, setIdentifierValid] = useState(true);
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLdapLoginChecked, setIsLdapLoginChecked] = useState(
    capabilities?.ldapEnabled || false,
  );
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isCaptcha, setIsCaptcha] = useState(false);
  const [isCaptchaSuccessful, setIsCaptchaSuccess] = useState(false);
  const [isCaptchaError, setIsCaptchaError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const { t, ready } = useTranslation(["Login", "Common"]);
  const theme = useTheme();

  const { message, confirmedEmail, authError } = match || {
    message: "",
    confirmedEmail: "",
    authError: "",
  };

  const authCallback = useCallback(
    async (profile: string) => {
      localStorage.removeItem("profile");
      localStorage.removeItem("code");

      try {
        const response = (await thirdPartyLogin(profile)) as {
          confirmUrl: string;
          token: unknown;
        };

        if (
          !response ||
          (response && !response.token && !response.confirmUrl)
        ) {
          throw new Error("Empty API response");
        }

        setWithCredentialsStatus(true);

        if (response.confirmUrl) {
          return window.location.replace(response.confirmUrl);
        }

        const redirectPath = sessionStorage.getItem("referenceUrl");

        if (redirectPath) {
          sessionStorage.removeItem("referenceUrl");
          window.location.href = redirectPath;
        } else {
          window.location.replace("/");
        }
      } catch (e) {
        toastr.error(
          t("Common:ProviderNotConnected"),
          t("Common:ProviderLoginError"),
        );
      }
    },
    [t],
  );

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (!profile) return;

    authCallback(profile);
  }, [authCallback]);

  useEffect(() => {
    if (message) setErrorText(message);
    if (confirmedEmail) setIdentifier(confirmedEmail);

    const messageEmailConfirmed = t("MessageEmailConfirmed");
    const messageAuthorize = t("MessageAuthorize");

    const text = `${messageEmailConfirmed} ${messageAuthorize}`;

    if (confirmedEmail && ready) toastr.success(text);
    if (authError && ready) toastr.error(t("Common:ProviderLoginError"));

    focusInput();

    window.authCallback = authCallback;
  }, [message, confirmedEmail, t, ready, authError, authCallback]);

  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    //console.log("onChangeLogin", e.target.value);
    setIdentifier(e.target.value);
    setIsEmailErrorShow(false);
    onClearErrors();
  };

  const onClearErrors = () => {
    if (!passwordValid) setPasswordValid(true);
  };

  const onSubmit = () => {
    //errorText && setErrorText("");
    let captchaToken: string | undefined | null = "";

    if (recaptchaPublicKey && isCaptcha) {
      if (!isCaptchaSuccessful) {
        setIsCaptchaError(true);
        return;
      }

      captchaToken = captchaRef.current?.getValue();
    }

    let hasError = false;

    const user = identifier.trim();

    if (!user) {
      hasError = true;
      setIdentifierValid(false);
      setIsEmailErrorShow(true);
    }

    // if (IS_ROOMS_MODE && identifierValid) {
    //   window.location.replace("/login/code"); //TODO: confirm link?
    //   return;
    // }

    const pass = password.trim();

    if (!pass) {
      hasError = true;
      setPasswordValid(false);
    }

    if (!identifierValid) hasError = true;

    if (hasError) return;

    setIsLoading(true);

    const hash = !isLdapLoginChecked
      ? createPasswordHash(pass, hashSettings)
      : undefined;
    const pwd = isLdapLoginChecked ? pass : undefined;

    isDesktop && checkPwd();
    const session = !isChecked;

    login(user, hash, pwd, session, captchaToken)
      .then((res: string | object) => {
        const isConfirm = typeof res === "string" && res.includes("confirm");
        const redirectPath = sessionStorage.getItem("referenceUrl");
        if (redirectPath && !isConfirm) {
          sessionStorage.removeItem("referenceUrl");
          window.location.href = redirectPath;
          return;
        }

        if (typeof res === "string") window.location.replace(res);
        else window.location.replace("/"); //TODO: save { user, hash } for tfa
      })
      .catch((error) => {
        let errorMessage = "";
        if (typeof error === "object") {
          errorMessage =
            error?.response?.data?.error?.message ||
            error?.statusText ||
            error?.message ||
            "";
        } else {
          errorMessage = error;
        }

        if (recaptchaPublicKey && error?.response?.status === 403) {
          setIsCaptcha(true);
        }

        if (isCaptcha && captchaRef.current) {
          captchaRef.current.reset();
        }

        setIsEmailErrorShow(true);
        setErrorText(errorMessage);
        setPasswordValid(!errorMessage);
        setIsLoading(false);
        focusInput();
      });
  };

  const onBlurEmail = () => {
    !identifierValid && setIsEmailErrorShow(true);
  };

  const onValidateEmail = (res: TValidate) => {
    setIdentifierValid(res.isValid);
    setErrorText(res.errors?.[0] ?? "");

    return undefined;
  };

  const focusInput = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    onClearErrors();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onClearErrors();
      !isDisabled && onSubmit();
      e.preventDefault();
    }
  };

  const onChangeCheckbox = () => setIsChecked(!isChecked);

  const onChangeLdapLoginCheckbox = () =>
    setIsLdapLoginChecked(!isLdapLoginChecked);

  const onClick = () => {
    setIsDialogVisible(true);
    setIsDisabled(true);
  };

  const onDialogClose = () => {
    setIsDialogVisible(false);
    setIsDisabled(false);
    setIsLoading(false);
  };

  const onSuccessfullyComplete = () => {
    setIsCaptchaSuccess(true);
  };

  const errorMessage = () => {
    if (!password.trim()) {
      return t("Common:RequiredField");
    }
    if (emailFromInvitation) {
      return errorText ? t(`Common:${errorText}`) : t("Common:RequiredField");
    }
  };

  const passwordErrorMessage = errorMessage();

  let { ldapEnabled, ldapDomain } = capabilities || {
    ldapEnabled: false,
    ldapDomain: "",
  };

  return (
    <form className="auth-form-container">
      <EmailContainer
        emailFromInvitation={emailFromInvitation}
        isEmailErrorShow={isEmailErrorShow}
        errorText={errorText}
        identifier={identifier}
        isLoading={isLoading}
        onChangeLogin={onChangeLogin}
        onBlurEmail={onBlurEmail}
        onValidateEmail={onValidateEmail}
        isLdapLogin={isLdapLoginChecked}
      />

      <FieldContainer
        isVertical
        labelVisible={false}
        hasError={!passwordValid}
        errorMessage={passwordErrorMessage} //TODO: Add wrong password server error
      >
        <PasswordInput
          className="password-input"
          simpleView
          passwordSettings={settings}
          id="login_password"
          inputName="password"
          placeholder={t("Common:Password")}
          hasError={!passwordValid}
          inputValue={password}
          size={InputSize.large}
          scale
          tabIndex={1}
          isDisabled={isLoading}
          autoComplete="current-password"
          onChange={onChangePassword}
          isAutoFocussed={!!emailFromInvitation}
          inputType={InputType.password}
          isDisableTooltip
        />
      </FieldContainer>

      <div className="login-forgot-wrapper">
        <div className="login-checkbox-wrapper">
          <div className="remember-wrapper">
            {!cookieSettingsEnabled && (
              <Checkbox
                id="login_remember"
                className="login-checkbox"
                isChecked={isChecked}
                onChange={onChangeCheckbox}
                label={t("Common:Remember")}
                helpButton={
                  <HelpButton
                    id="login_remember-hint"
                    className="help-button"
                    offsetRight={0}
                    tooltipContent={
                      <Text fontSize="12px">{t("RememberHelper")}</Text>
                    }
                    tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
                  />
                }
              />
            )}
          </div>

          <Link
            fontSize="13px"
            className="login-link"
            type={LinkType.page}
            isHovered={false}
            onClick={onClick}
            id="login_forgot-password-link"
          >
            {t("ForgotPassword")}
          </Link>
        </div>
      </div>
      {ldapEnabled && ldapDomain && (
        <div className="login-forgot-wrapper">
          <div className="login-checkbox-wrapper">
            <Checkbox
              id="login_ldap-checkbox"
              className="login-checkbox"
              isChecked={isLdapLoginChecked}
              onChange={onChangeLdapLoginCheckbox}
              label={`Sign in to: ${ldapDomain}`} //TODO: Add translation
              helpButton={
                <HelpButton
                  id="login_ldap-hint"
                  className="help-button"
                  offsetRight={0}
                  tooltipContent={
                    <Text fontSize="12px">{t("SignInLdapHelper")}</Text> //TODO: Add ldap helper
                  }
                  tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
                />
              }
            />
          </div>
        </div>
      )}

      {isDialogVisible && (
        <ForgotPasswordModalDialog
          isVisible={isDialogVisible}
          userEmail={identifier}
          onDialogClose={onDialogClose}
        />
      )}
      {recaptchaPublicKey && isCaptcha && (
        <StyledCaptcha isCaptchaError={isCaptchaError}>
          <div className="captcha-wrapper">
            <ReCAPTCHA
              sitekey={recaptchaPublicKey}
              ref={captchaRef}
              theme={theme.isBase ? "light" : "dark"}
              onChange={onSuccessfullyComplete}
            />
          </div>
          {isCaptchaError && (
            <Text>{t("Errors:LoginWithBruteForceCaptcha")}</Text>
          )}
        </StyledCaptcha>
      )}

      <Button
        id="login_submit"
        className="login-button"
        primary
        size={ButtonSize.medium}
        scale
        label={
          isLoading ? t("Common:LoadingProcessing") : t("Common:LoginButton")
        }
        tabIndex={1}
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onSubmit}
      />
    </form>
  );
};

export default LoginForm;
