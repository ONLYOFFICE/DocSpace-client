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

"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useLayoutEffect,
} from "react";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useTheme } from "styled-components";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "react-toastify";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  createPasswordHash,
  frameCallCommand,
} from "@docspace/shared/utils/common";
import { checkPwd } from "@docspace/shared/utils/desktop";
import { login } from "@docspace/shared/utils/loginUtils";
import { toastr } from "@docspace/shared/components/toast";
import { thirdPartyLogin, checkConfirmLink } from "@docspace/shared/api/user";
import { setWithCredentialsStatus } from "@docspace/shared/api/client";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import { ButtonKeys, RecaptchaType } from "@docspace/shared/enums";
import { getAvailablePortals } from "@docspace/shared/api/management";
import { getCookie } from "@docspace/shared/utils";
import { deleteCookie } from "@docspace/shared/utils/cookie";

import { LoginFormProps } from "@/types";
import {
  generateOAuth2ReferenceURl,
  getEmailFromInvitation,
  getConfirmDataFromInvitation,
} from "@/utils";

import EmailContainer from "./sub-components/EmailContainer";
import PasswordContainer from "./sub-components/PasswordContainer";
import ForgotContainer from "./sub-components/ForgotContainer";
import LDAPContainer from "./sub-components/LDAPContainer";

import { StyledCaptcha } from "./LoginForm.styled";
import { LoginDispatchContext, LoginValueContext } from "../Login";
import OAuthClientInfo from "../ConsentInfo";

// import { gitAvailablePortals } from "@/utils/actions";

let showToastr = true;

const LoginForm = ({
  hashSettings,
  cookieSettingsEnabled,
  reCaptchaPublicKey,
  clientId,
  client,
  reCaptchaType,
  ldapDomain,
  ldapEnabled,
}: LoginFormProps) => {
  const { isLoading, isModalOpen } = useContext(LoginValueContext);
  const { setIsLoading } = useContext(LoginDispatchContext);
  const toastId = useRef<Id>();

  const searchParams = useSearchParams();
  const router = useRouter();

  const theme = useTheme();

  const { t, ready, i18n } = useTranslation(["Login", "Common"]);
  const currentCulture = i18n.language;

  const message = searchParams.get("message");
  const confirmedEmail = searchParams.get("confirmedEmail");
  const authError = searchParams.get("authError");
  const loginData = searchParams.get("loginData");
  const referenceUrl = searchParams.get("referenceUrl");

  const isDesktop =
    typeof window !== "undefined" && window["AscDesktopEditor"] !== undefined;

  const [emailFromInvitation, setEmailFromInvitation] = useState(
    getEmailFromInvitation(loginData),
  );
  const [identifier, setIdentifier] = useState(
    getEmailFromInvitation(loginData),
  );

  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [passwordValid, setPasswordValid] = useState(true);
  const [identifierValid, setIdentifierValid] = useState(true);
  const [password, setPassword] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isLdapLoginChecked, setIsLdapLoginChecked] = useState(
    ldapEnabled || false,
  );
  const [isCaptcha, setIsCaptcha] = useState(false);
  const [isCaptchaSuccessful, setIsCaptchaSuccess] = useState(false);
  const [isCaptchaError, setIsCaptchaError] = useState(false);

  const captchaRef = useRef<ReCAPTCHA>(null);
  const hCaptchaRef = useRef<HCaptcha>(null);

  useLayoutEffect(() => {
    const email = getEmailFromInvitation(loginData);

    setIdentifier(email);
    setEmailFromInvitation(email);
    frameCallCommand("setIsLoaded");
  }, [loginData]);

  const authCallback = useCallback(
    async (profile: string) => {
      localStorage.removeItem("profile");
      localStorage.removeItem("code");

      try {
        const response = (await thirdPartyLogin(profile, currentCulture)) as {
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

        const redirectPath =
          referenceUrl || sessionStorage.getItem("referenceUrl");

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
    [t, referenceUrl, currentCulture],
  );

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (!profile) return;

    authCallback(profile);
  }, [authCallback]);

  useEffect(() => {
    window.authCallback = authCallback;
  }, [authCallback, currentCulture]);

  useEffect(() => {
    message && setErrorText(message);
    confirmedEmail && setIdentifier(confirmedEmail);

    const messageEmailConfirmed = t("MessageEmailConfirmed");
    const messageAuthorize = t("MessageAuthorize");

    const text = `${messageEmailConfirmed} ${messageAuthorize}`;

    if (
      confirmedEmail &&
      ready &&
      !toastr.isActive(toastId.current || "confirm-email-toast")
    )
      toastId.current = toastr.success(text);
  }, [message, confirmedEmail, t, ready, authCallback]);

  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    //console.log("onChangeLogin", e.target.value);
    setIdentifier(e.target.value);
    setIsEmailErrorShow(false);
    onClearErrors();
  };

  const onClearErrors = () => {
    if (!passwordValid) setPasswordValid(true);
  };

  const onSubmit = useCallback(async () => {
    //errorText && setErrorText("");
    let captchaToken: string | undefined | null = "";

    if (reCaptchaPublicKey && isCaptcha) {
      if (!isCaptchaSuccessful) {
        setIsCaptchaError(true);
        return;
      }

      captchaToken = captchaRef.current?.getValue();
      if (captchaToken) setIsCaptchaError(false);
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

    const confirmData = getConfirmDataFromInvitation(loginData);

    isDesktop && checkPwd();
    const session = !isChecked;

    if (client?.isPublic && hash) {
      const portals = await getAvailablePortals({
        Email: user,
        PasswordHash: hash,
      });

      if (portals.length === 1) {
        window.open(`${portals[0].portalLink}`, "_self");

        return;
      }

      const searchParams = new URLSearchParams();

      const portalsString = JSON.stringify({ portals });

      searchParams.set("portals", portalsString);
      searchParams.set("clientId", client.clientId);

      router.push(`/tenant-list?${searchParams.toString()}`);
      setIsLoading(false);
      return;
    }

    login(user, hash, pwd, session, captchaToken, currentCulture, reCaptchaType)
      .then(async (res: string | object) => {
        const redirectUrl = getCookie("x-redirect-authorization-uri");
        if (clientId && redirectUrl) {
          deleteCookie("x-redirect-authorization-uri");

          window.location.replace(redirectUrl);

          return;
        }

        try {
          if (confirmData) await checkConfirmLink(confirmData);
        } catch (e) {
          console.error(e);
        }
        return res;
      })
      .then((res: string | object) => {
        const isConfirm = typeof res === "string" && res.includes("confirm");
        const redirectPath =
          referenceUrl || sessionStorage.getItem("referenceUrl");
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

        if (reCaptchaPublicKey && error?.response?.status === 403) {
          setIsCaptcha(true);
        }

        if (isCaptcha && captchaRef.current) {
          captchaRef.current.reset();
        }

        setIsEmailErrorShow(true);
        setErrorText(errorMessage);
        setPasswordValid(!errorMessage);
        setIsLoading(false);
      });
  }, [
    reCaptchaPublicKey,
    isCaptcha,
    identifier,
    password,
    identifierValid,
    setIsLoading,
    isLdapLoginChecked,
    hashSettings,
    isDesktop,
    isChecked,
    client?.isPublic,
    client?.clientId,
    currentCulture,
    reCaptchaType,
    isCaptchaSuccessful,
    router,
    clientId,
    referenceUrl,
    loginData,
  ]);

  const onBlurEmail = () => {
    !identifierValid && setIsEmailErrorShow(true);
  };

  const onValidateEmail = (res: TValidate) => {
    setIdentifierValid(res.isValid);
    setErrorText(res.errors?.[0] ?? "");

    return undefined;
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    onClearErrors();
  };

  const onChangeCheckbox = () => setIsChecked(!isChecked);

  const onChangeLdapLoginCheckbox = () =>
    setIsLdapLoginChecked(!isLdapLoginChecked);

  const onSuccessfullyComplete = () => {
    setIsCaptchaSuccess(true);
    setIsCaptchaError(false);
  };

  const errorMessage = () => {
    if (!password.trim()) {
      return t("Common:RequiredField");
    }
    if (emailFromInvitation) {
      return errorText ? t(`Common:${errorText}`) : t("Common:RequiredField");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.enter) {
        if (isModalOpen) return;

        onSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen, onSubmit]);

  const passwordErrorMessage = errorMessage();

  if (authError && ready) {
    if (showToastr) toastr.error(t("Common:ProviderLoginError"));
    showToastr = false;
  }

  return (
    <form className="auth-form-container">
      {!emailFromInvitation && (
        <Text fontSize="16px" fontWeight="600" className="sign-in-subtitle">
          {t("Common:LoginButton")}
        </Text>
      )}

      {client && (
        <OAuthClientInfo
          name={client.name}
          logo={client.logo}
          websiteUrl={client.websiteUrl}
        />
      )}

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
        ldapDomain={ldapDomain}
      />
      <PasswordContainer
        isLoading={isLoading}
        emailFromInvitation={emailFromInvitation}
        passwordValid={passwordValid}
        passwordErrorMessage={passwordErrorMessage}
        password={password}
        onChangePassword={onChangePassword}
      />
      <ForgotContainer
        cookieSettingsEnabled={cookieSettingsEnabled}
        isChecked={isChecked}
        identifier={identifier}
        onChangeCheckbox={onChangeCheckbox}
      />

      {ldapDomain && ldapEnabled && (
        <LDAPContainer
          ldapDomain={ldapDomain}
          isLdapLoginChecked={isLdapLoginChecked}
          onChangeLdapLoginCheckbox={onChangeLdapLoginCheckbox}
        />
      )}

      {reCaptchaPublicKey && isCaptcha && (
        <StyledCaptcha isCaptchaError={isCaptchaError}>
          <div className="captcha-wrapper">
            {reCaptchaType === RecaptchaType.hCaptcha ? (
              <HCaptcha
                sitekey={reCaptchaPublicKey}
                ref={hCaptchaRef}
                onVerify={onSuccessfullyComplete}
                theme={theme.isBase ? "light" : "dark"}
                // onChange={onSuccessfullyComplete}
              />
            ) : (
              <ReCAPTCHA
                sitekey={reCaptchaPublicKey}
                ref={captchaRef}
                theme={theme.isBase ? "light" : "dark"}
                onChange={onSuccessfullyComplete}
              />
            )}
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
