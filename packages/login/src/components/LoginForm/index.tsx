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

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useLayoutEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { isSafari } from "react-device-detect";
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
import { ButtonKeys } from "@docspace/shared/enums";
import { getCookie } from "@docspace/shared/utils";
import { PUBLIC_STORAGE_KEY } from "@docspace/shared/constants";

import { LoginFormProps } from "@/types";
import {
  getAvailablePortals,
  getEmailFromInvitation,
  getRedirectURL,
} from "@/utils";
import { useCaptcha } from "@docspace/shared/hooks/useCaptcha";
import Captcha from "@docspace/shared/components/captcha";

import EmailContainer from "./sub-components/EmailContainer";
import PasswordContainer from "./sub-components/PasswordContainer";
import ForgotContainer from "./sub-components/ForgotContainer";
import LDAPContainer from "./sub-components/LDAPContainer";

import { LoginDispatchContext, LoginValueContext } from "../Login";
import OAuthClientInfo from "../ConsentInfo";

const LoginForm = ({
  hashSettings,
  cookieSettingsEnabled,
  reCaptchaPublicKey,
  clientId,
  client,
  reCaptchaType,
  ldapDomain,
  ldapEnabled,
  baseDomain,
}: LoginFormProps) => {
  const { isLoading, isModalOpen } = useContext(LoginValueContext);
  const { setIsLoading } = useContext(LoginDispatchContext);

  const emailConfirmedToastShown = useRef<boolean>(false);
  const passwordChangedToastShown = useRef<boolean>(false);
  const authToastId = useRef<Id>("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const theme = useTheme();

  const { t, ready, i18n } = useTranslation(["Login", "Common"]);
  const currentCulture = i18n.language;

  const message = searchParams?.get("message");
  const authError = searchParams?.get("authError");
  const referenceUrl = searchParams?.get("referenceUrl");
  const loginData = searchParams?.get("loginData") ?? null;
  const linkData = searchParams?.get("linkData");
  const isPublicAuth = searchParams?.get("publicAuth");
  const passwordChanged = searchParams?.get("passwordChanged");

  const isDesktop =
    typeof window !== "undefined" && window.AscDesktopEditor !== undefined;

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

  const [isChecked, setIsChecked] = useState(true);
  const [isLdapLoginChecked, setIsLdapLoginChecked] = useState(
    ldapEnabled || false,
  );

  const captcha = useCaptcha({
    publicKey: reCaptchaPublicKey,
    type: reCaptchaType,
  });

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

        if (isPublicAuth) {
          localStorage.setItem(PUBLIC_STORAGE_KEY, "true");
          window.close();
        }

        const loggedOutUserId = sessionStorage.getItem("loggedOutUserId");
        const redirectPathStorage = loggedOutUserId
          ? null
          : sessionStorage.getItem("referenceUrl");

        const redirectPath = referenceUrl || redirectPathStorage;

        if (redirectPathStorage) {
          sessionStorage.removeItem("referenceUrl");
        }

        if (redirectPath) {
          window.location.href = redirectPath;
        } else {
          window.location.replace("/");
        }
      } catch (e) {
        console.error(e);
        toastr.error(
          t("Common:ProviderNotConnected"),
          t("Common:ProviderLoginError"),
        );
      }
    },
    [t, referenceUrl, currentCulture, isPublicAuth],
  );

  useEffect(() => {
    if (authError && ready && !toastr.isActive(authToastId.current))
      authToastId.current = toastr.error(t("Common:ProviderLoginError"));
  }, [authError, ready, t]);

  useEffect(() => {
    if (isModalOpen) {
      captcha.dismiss();
    }
  }, [isModalOpen, captcha]);

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (!profile) return;

    authCallback(profile);
  }, [authCallback]);

  useEffect(() => {
    window.authCallback = authCallback;
  }, [authCallback, currentCulture]);

  useEffect(() => {
    if (message) setErrorText(message);
    const confirmedData = sessionStorage?.getItem("confirmedData");
    let email;

    if (confirmedData) {
      email = JSON.parse(atob(confirmedData));
      setIdentifier(email);
      sessionStorage.removeItem("confirmedData");
    }

    if (email && ready && !emailConfirmedToastShown.current) {
      const messageEmailConfirmed = t("MessageEmailConfirmed");
      const messageAuthorize = t("MessageAuthorize");
      const text = `${messageEmailConfirmed} ${messageAuthorize}`;

      toastr.success(text);
      emailConfirmedToastShown.current = true;
    }
  }, [message, t, ready, authCallback]);

  useEffect(() => {
    if (passwordChanged && ready && !passwordChangedToastShown.current) {
      toastr.success(t("ChangePasswordSuccess"));
      passwordChangedToastShown.current = true;
    }
  }, [passwordChanged, t, ready]);

  const onClearErrors = () => {
    if (!passwordValid) setPasswordValid(true);
  };

  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("onChangeLogin", e.target.value);
    setIdentifier(e.target.value);
    setIsEmailErrorShow(false);
    onClearErrors();
  };

  const onSubmit = useCallback(async () => {
    const captchaValidation = captcha.validate();
    if (!captchaValidation.isValid) {
      return;
    }

    const captchaToken = captchaValidation.token;

    let hasError = false;

    const user =
      typeof identifier === "string" ? identifier.trim() : identifier[0].trim();

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
    let confirmData = "";

    try {
      if (linkData) confirmData = JSON.parse(atob(linkData));
    } catch (e) {
      console.error("parse error", e);
    }

    if (isDesktop) checkPwd();
    const session = !isChecked;

    if (client?.isPublic && hash) {
      const portals = await getAvailablePortals({
        Email: user,
        PasswordHash: hash,
        recaptchaResponse: captchaToken,
        recaptchaType: reCaptchaType,
      });

      if (portals.error) {
        const error = portals;

        let errorMessage = "";
        if (typeof error === "object") {
          errorMessage =
            (error as { response: { data: { message: string } } })?.response
              ?.data?.message ||
            (error as { statusText: string })?.statusText ||
            (error as { message: string })?.message ||
            "";
        } else {
          errorMessage = error as string;
        }

        if (
          reCaptchaPublicKey &&
          (error as { response: { status: number } })?.response?.status === 403
        ) {
          captcha.request();
        } else if (captcha.isVisible) {
          captcha.reset();
        }

        setIsEmailErrorShow(true);
        setErrorText(errorMessage);
        setPasswordValid(!errorMessage);
        setIsLoading(false);
        return;
      }

      if (portals?.length === 1) {
        const name =
          !baseDomain || portals[0].portalName.includes(baseDomain)
            ? portals[0].portalName
            : `${portals[0].portalName}.${baseDomain}`;

        let redirectUrl = getRedirectURL();
        let portalLink = portals[0].portalLink;

        const isLocalhost = name === "http://localhost";

        if (!isLocalhost && redirectUrl)
          redirectUrl = redirectUrl.replace(window.location.origin, name);

        if (isLocalhost)
          portalLink = portalLink.replace(name, window.location.origin);

        // deleteCookie("x-redirect-authorization-uri");

        window.open(`${portalLink}&referenceUrl=${redirectUrl}`, "_self");

        return;
      }

      const newSearchParams = new URLSearchParams();

      const portalsString = JSON.stringify({ portals });

      newSearchParams.set("clientId", client.clientId);

      sessionStorage.setItem("tenant-list", portalsString);

      router.push(`/tenant-list?${newSearchParams.toString()}`);

      setIsLoading(false);
      return;
    }

    login(user, hash, pwd, session, captchaToken, currentCulture, reCaptchaType)
      .then(async (res: string | object) => {
        let redirectUrl = getCookie("x-redirect-authorization-uri");
        if (clientId && redirectUrl) {
          redirectUrl = window.atob(
            redirectUrl!.replace(/-/g, "+").replace(/_/g, "/"),
          );

          window.location.replace(redirectUrl);

          return;
        }

        const isConfirm = typeof res === "string" && res.includes("confirm");
        try {
          if (confirmData && !isConfirm) await checkConfirmLink(confirmData);
        } catch (e) {
          console.error(e);
        }
        return res;
      })
      .then(async (res: string | object | undefined) => {
        const tfaIsEnabled =
          typeof res === "string" ? true : (res as { tfa?: boolean })?.tfa;

        if (isPublicAuth && !tfaIsEnabled) {
          localStorage.setItem(PUBLIC_STORAGE_KEY, "true");
          window.close();
        }

        const isConfirm = typeof res === "string" && res.includes("confirm");

        const loggedOutUserId = sessionStorage.getItem("loggedOutUserId");
        const redirectPathStorage = loggedOutUserId
          ? null
          : sessionStorage.getItem("referenceUrl");

        const redirectPath = referenceUrl || redirectPathStorage;

        if (redirectPathStorage && !isConfirm) {
          sessionStorage.removeItem("referenceUrl");
        }

        if (redirectPath && !isConfirm) {
          window.location.href = redirectPath;
          return;
        }

        if (typeof res === "string") {
          let redirectUrl = `${res}`;

          if (linkData) {
            redirectUrl += `&linkData=${linkData}`;
          }

          if (isPublicAuth) {
            redirectUrl += `&publicAuth=${isPublicAuth}`;
          }

          window.location.replace(redirectUrl);
        } else window.location.replace("/"); // TODO: save { user, hash } for tfa
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
          captcha.request();
        } else if (captcha.isVisible) {
          captcha.reset();
        }

        setIsEmailErrorShow(true);
        setErrorText(errorMessage);
        setPasswordValid(!errorMessage);
        setIsLoading(false);
      });
  }, [
    reCaptchaPublicKey,
    captcha,
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
    linkData,
    router,
    baseDomain,
    clientId,
    isPublicAuth,
    referenceUrl,
  ]);

  const onBlurEmail = () => {
    if (!identifierValid) setIsEmailErrorShow(true);
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

  const errorMessage = () => {
    if (!password.trim()) {
      return t("Common:RequiredField");
    }
    if (emailFromInvitation) {
      return errorText || t("Common:RequiredField");
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

  const handleAnimationStart = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (!isSafari) return;
    if (e.animationName === "autofill") {
      onSubmit();
    }
  };

  const passwordErrorMessage = errorMessage() || "";

  return (
    <form className="auth-form-container">
      {!emailFromInvitation && !client ? (
        <Text fontSize="16px" fontWeight="600" className="sign-in-subtitle">
          {t("Common:LoginButton")}
        </Text>
      ) : null}

      {client ? (
        <OAuthClientInfo
          name={client.name}
          logo={client.logo}
          websiteUrl={client.websiteUrl}
        />
      ) : null}

      <EmailContainer
        emailFromInvitation={
          typeof emailFromInvitation === "string"
            ? emailFromInvitation
            : emailFromInvitation[0]
        }
        isEmailErrorShow={isEmailErrorShow}
        errorText={errorText}
        identifier={typeof identifier === "string" ? identifier : identifier[0]}
        isLoading={isLoading}
        onChangeLogin={onChangeLogin}
        onBlurEmail={onBlurEmail}
        onValidateEmail={onValidateEmail}
        isLdapLogin={isLdapLoginChecked}
        ldapDomain={ldapDomain}
        handleAnimationStart={handleAnimationStart}
      />
      <PasswordContainer
        isLoading={isLoading}
        emailFromInvitation={
          typeof emailFromInvitation === "string"
            ? emailFromInvitation
            : emailFromInvitation[0]
        }
        passwordValid={passwordValid}
        passwordErrorMessage={passwordErrorMessage}
        password={password}
        onChangePassword={onChangePassword}
      />
      <ForgotContainer
        cookieSettingsEnabled={cookieSettingsEnabled}
        isChecked={isChecked}
        identifier={typeof identifier === "string" ? identifier : identifier[0]}
        onChangeCheckbox={onChangeCheckbox}
        reCaptchaPublicKey={reCaptchaPublicKey}
        reCaptchaType={reCaptchaType}
      />

      {ldapDomain && ldapEnabled ? (
        <LDAPContainer
          ldapDomain={ldapDomain}
          isLdapLoginChecked={isLdapLoginChecked}
          onChangeLdapLoginCheckbox={onChangeLdapLoginCheckbox}
        />
      ) : null}

      {!isModalOpen && captcha.shouldRender ? (
        <Captcha
          key="login-form-captcha"
          type={captcha.captchaType}
          publicKey={reCaptchaPublicKey}
          themeMode={theme.isBase ? "light" : "dark"}
          visible={captcha.isVisible}
          hasError={captcha.isError}
          errorText={t("Errors:LoginWithBruteForceCaptcha")}
          onTokenChange={captcha.onTokenChange}
          resetSignal={captcha.resetSignal}
        />
      ) : null}
      <Button
        id="login_submit"
        className="login-button"
        primary
        size={ButtonSize.medium}
        scale
        label={
          isLoading ? t("Common:LoadingProcessing") : t("Common:LoginButton")
        }
        tabIndex={5}
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onSubmit}
        testId="login_button"
      />
    </form>
  );
};

export default LoginForm;
