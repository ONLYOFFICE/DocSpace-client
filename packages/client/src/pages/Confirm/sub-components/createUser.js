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

import SsoReactSvg from "PUBLIC_DIR/images/sso.react.svg";

import React, { useEffect, useState, useCallback } from "react";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { EmailInput } from "@docspace/shared/components/email-input";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

import {
  getUserFromConfirm,
  createUser,
  signupOAuth,
  getUserByEmail,
} from "@docspace/shared/api/people";
import {
  createPasswordHash,
  getOAuthToken,
  getLoginLink,
} from "@docspace/shared/utils/common";
import { login } from "@docspace/shared/utils/loginUtils";
import {
  ALLOWED_PASSWORD_CHARACTERS,
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  PROVIDERS_DATA,
} from "@docspace/shared/constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { getPasswordErrorMessage } from "@docspace/shared/utils/getPasswordErrorMessage";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import withLoader from "../withLoader";

import { StyledPage } from "./StyledConfirm";
import {
  GreetingContainer,
  RegisterContainer,
  StyledCreateUserContent,
} from "./StyledCreateUser";
import GreetingUserContainer from "./GreetingUserContainer";
import LanguageComboboxWrapper from "./LanguageCombobox";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";

import { setCookie } from "@docspace/shared/utils/cookie";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

const DEFAULT_ROOM_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";
const DEFAULT_PORTAL_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";

const RegistrationFormGreeting = ({
  email,
  setRegistrationForm,
  type,
  emailFromLink,
}) => {
  const onClickBack = () => {
    setRegistrationForm(false);
  };

  return (
    <GreetingUserContainer
      type={type}
      emailFromLink={!!emailFromLink}
      email={email}
      onClickBack={onClickBack}
    />
  );
};
const CreateUserForm = (props) => {
  const {
    settings,
    t,
    providers,
    isDesktop,
    linkData,
    roomData,
    capabilities,
    currentColorScheme,
    userNameRegex,
    defaultPage,
    cultures,
    i18n,

    licenseUrl,
    legalTerms,
  } = props;

  const currentCultureName = i18n.language;

  const inputRef = React.useRef(null);

  const emailFromLink = linkData?.email ? linkData.email : "";
  const roomName = roomData?.title;
  const roomId = roomData?.roomId;

  const [email, setEmail] = useState(emailFromLink);
  const [emailValid, setEmailValid] = useState(true);
  const [emailErrorText, setEmailErrorText] = useState("");

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [fname, setFname] = useState("");
  const [fnameValid, setFnameValid] = useState(true);
  const [sname, setSname] = useState("");
  const [snameValid, setSnameValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [errorText, setErrorText] = useState("");

  const [user, setUser] = useState("");

  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [registrationForm, setRegistrationForm] = useState(emailFromLink);

  const focusInput = () => {
    if (inputRef) {
      inputRef.current.focus();
    }
  };

  const nameRegex = new RegExp(userNameRegex, "gu");

  useEffect(() => {
    const { linkData } = props;

    const fetchData = async () => {
      if (linkData.type === "LinkInvite") {
        const uid = linkData.uid;
        const confirmKey = linkData.confirmHeader;
        const user = await getUserFromConfirm(uid, confirmKey);
        setUser(user);
      }
      window.authCallback = authCallback;

      focusInput();
    };

    fetchData();
  }, []);

  const onContinue = async () => {
    const { linkData } = props;

    if (!emailValid) {
      setIsEmailErrorShow(true);
      return;
    }

    setIsLoading(true);

    const headerKey = linkData.confirmHeader;

    try {
      await getUserByEmail(email, headerKey);

      setCookie(LANGUAGE, currentCultureName, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      const finalUrl = roomId
        ? `/rooms/shared/${roomId}/filter?folder=${roomId}`
        : defaultPage;

      if (roomId) {
        sessionStorage.setItem("referenceUrl", finalUrl);
      }

      const loginData = JSON.stringify({
        type: "invitation",
        email,
        roomName,
        firstName: user.firstName,
        lastName: user.lastName,
        linkData: linkData,
      });

      sessionStorage.setItem("loginData", loginData);

      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        "/login",
      );
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;
      const isNotExistUser = status === 404;

      if (isNotExistUser) {
        setRegistrationForm(true);
      }
    }

    setIsLoading(false);
  };
  const onSubmit = () => {
    const { linkData, hashSettings } = props;
    const type = parseInt(linkData.emplType);

    setIsLoading(true);

    setErrorText("");

    let hasError = false;

    if (!fname.trim() || !fnameValid) {
      hasError = true;
      setFnameValid(!hasError);
    }

    if (!sname.trim() || !snameValid) {
      hasError = true;
      setSnameValid(!hasError);
    }

    if (!passwordValid || !password.trim()) {
      hasError = true;
      setPasswordValid(!hasError);
      setIsPasswordErrorShow(true);
    }

    if (hasError) {
      setIsLoading(false);
      return false;
    }

    const hash = createPasswordHash(password, hashSettings);

    const loginData = {
      userName: email,
      passwordHash: hash,
    };

    const personalData = {
      firstname: fname.trim(),
      lastname: sname.trim(),
      email: email,
      cultureName: currentCultureName,
    };

    if (!!type) {
      personalData.type = type;
    }

    if (!!linkData.key) {
      personalData.key = linkData.key;
    }

    const headerKey = linkData.confirmHeader;

    createConfirmUser(personalData, loginData, headerKey).catch((error) => {
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

      console.error("confirm error", errorMessage);
      setIsEmailErrorShow(true);
      setEmailErrorText(errorMessage);
      setEmailValid(false);
      setIsLoading(false);
    });
  };

  const authCallback = (profile) => {
    const signupAccount = {
      EmployeeType: linkData.emplType || null,
      Email: linkData.email,
      Key: linkData.key,
      SerializedProfile: profile,
      culture: currentCultureName,
    };

    const confirmKey = linkData.confirmHeader;

    signupOAuth(signupAccount, confirmKey)
      .then(() => {
        const url = roomData.roomId
          ? `/rooms/shared/${roomData.roomId}/filter?folder=${roomData.roomId}/`
          : defaultPage;
        window.location.replace(url);
      })
      .catch((e) => {
        toastr.error(e);
      });
  };

  const createConfirmUser = async (registerData, loginData, key) => {
    const { defaultPage } = props;

    const fromInviteLink =
      linkData.type === "LinkInvite" || linkData.type === "EmpInvite"
        ? true
        : false;

    const data = Object.assign({ fromInviteLink }, registerData, loginData);

    await createUser(data, key);

    const { userName, passwordHash } = loginData;

    const res = await login(userName, passwordHash);

    //console.log({ res });

    const finalUrl = roomData.roomId
      ? `/rooms/shared/${roomData.roomId}/filter?folder=${roomData.roomId}`
      : defaultPage;

    const isConfirm = typeof res === "string" && res.includes("confirm");

    if (isConfirm) {
      sessionStorage.setItem("referenceUrl", finalUrl);

      return window.location.replace(typeof res === "string" ? res : "/");
    }

    window.location.replace(finalUrl);
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
    setIsEmailErrorShow(false);
  };
  const onChangeFname = (e) => {
    setFname(e.target.value);
    setFnameValid(nameRegex.test(e.target.value.trim()));
    setErrorText("");
  };

  const onChangeSname = (e) => {
    setSname(e.target.value);
    setSnameValid(nameRegex.test(e.target.value.trim()));
    setErrorText("");
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
    setErrorText("");
    setIsPasswordErrorShow(false);
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      registrationForm ? onSubmit() : onContinue();
    }
  };
  const onValidatePassword = (res) => {
    setPasswordValid(res);
  };

  const onBlurEmail = () => {
    setIsEmailErrorShow(true);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const onSocialButtonClick = useCallback((e) => {
    const { target } = e;
    let targetElement = target;

    if (!(targetElement instanceof HTMLButtonElement) && target.parentElement) {
      targetElement = target.parentElement;
    }

    const providerName = targetElement.dataset.providername;
    const url = targetElement.dataset.url || "";

    try {
      const tokenGetterWin = isDesktop
        ? (window.location.href = url)
        : window.open(
            url,
            "login",
            "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no",
          );

      getOAuthToken(tokenGetterWin).then((code) => {
        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          }),
        );

        tokenGetterWin.location.href = getLoginLink(token, code);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const oauthDataExists = () => {
    if (!capabilities?.oauthEnabled) return false;

    let existProviders = 0;
    providers && providers.length > 0;
    providers.map((item) => {
      if (!PROVIDERS_DATA[item.provider]) return;
      existProviders++;
    });

    return !!existProviders;
  };

  const ssoExists = () => {
    if (capabilities?.ssoUrl) return true;
    else return false;
  };

  const onValidateEmail = (res) => {
    setEmailValid(res.isValid);
    setEmailErrorText(res.errors[0]);
  };

  const ssoProps = ssoExists()
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel: capabilities?.ssoLabel,
        ssoSVG: SsoReactSvg,
      }
    : {};

  const termsConditionsComponent = (
    <div className="terms-conditions">
      <Text fontSize={"12px"} textAlign="center">
        <Trans
          t={t}
          ns="Confirm"
          i18nKey="TermsAndConditions"
          components={{
            1: (
              <ColorTheme
                tag="a"
                themeId={ThemeId.Link}
                href={licenseUrl}
                target="_blank"
                fontSize={"12px"}
              />
            ),
            2: (
              <ColorTheme
                tag="a"
                themeId={ThemeId.Link}
                href={legalTerms}
                target="_blank"
                fontSize={"12px"}
              />
            ),
          }}
        />
      </Text>
    </div>
  );
  return (
    <StyledPage>
      <LanguageComboboxWrapper
        cultures={cultures}
        currentCultureName={currentCultureName}
      />

      <StyledCreateUserContent>
        <GreetingContainer>
          <PortalLogo className="portal-logo" />
          {linkData.type === "LinkInvite" && (
            <div className="tooltip">
              <Text fontSize="16px">
                {roomName ? (
                  <Trans
                    t={t}
                    i18nKey="InvitationToRoom"
                    ns="Common"
                    defaults={DEFAULT_ROOM_TEXT}
                    values={{
                      firstName: user.firstName,
                      lastName: user.lastName,
                      ...(roomName
                        ? { roomName }
                        : { spaceAddress: window.location.host }),
                    }}
                    components={{
                      1: <Text fontWeight={600} as="strong" fontSize="16px" />,
                    }}
                  />
                ) : (
                  <Trans
                    t={t}
                    i18nKey="InvitationToPortal"
                    ns="Common"
                    defaults={DEFAULT_PORTAL_TEXT}
                    values={{
                      firstName: user.firstName,
                      lastName: user.lastName,
                      productName: t("Common:ProductName"),
                      ...(roomName
                        ? { roomName }
                        : { spaceAddress: window.location.host }),
                    }}
                    components={{
                      1: <Text fontWeight={600} as="strong" fontSize="16px" />,
                    }}
                  />
                )}
              </Text>
            </div>
          )}
        </GreetingContainer>

        <FormWrapper>
          <RegisterContainer registrationForm={registrationForm}>
            <div className="auth-form-fields">
              <div className="email-container">
                <FieldContainer
                  className="form-field"
                  isVertical={true}
                  labelVisible={false}
                  hasError={isEmailErrorShow && !emailValid}
                  errorMessage={
                    emailErrorText
                      ? t(`Common:${emailErrorText}`)
                      : t("Common:RequiredField")
                  }
                >
                  <EmailInput
                    id="login"
                    name="login"
                    type="email"
                    hasError={isEmailErrorShow && !emailValid}
                    value={email}
                    placeholder={t("Common:Email")}
                    size="large"
                    scale={true}
                    isAutoFocussed={true}
                    tabIndex={1}
                    isDisabled={isLoading || !!emailFromLink}
                    autoComplete="username"
                    onChange={onChangeEmail}
                    onBlur={onBlurEmail}
                    onValidateInput={onValidateEmail}
                    forwardedRef={inputRef}
                    onKeyDown={onKeyPress}
                  />
                </FieldContainer>
                <Button
                  className="login-button"
                  primary
                  size="medium"
                  scale={true}
                  label={t("Common:ContinueButton")}
                  tabIndex={1}
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onClick={onContinue}
                />
              </div>

              {registrationForm && (
                <div>
                  <RegistrationFormGreeting
                    email={email}
                    setRegistrationForm={setRegistrationForm}
                    type={linkData.type}
                    emailFromLink={emailFromLink}
                  />
                  <FieldContainer
                    className="form-field"
                    isVertical={true}
                    labelVisible={false}
                    hasError={!fnameValid}
                    errorMessage={
                      errorText
                        ? errorText
                        : fname.trim().length === 0
                          ? t("Common:RequiredField")
                          : t("Common:IncorrectFirstName")
                    }
                  >
                    <TextInput
                      id="first-name"
                      name="first-name"
                      type="text"
                      hasError={!fnameValid}
                      value={fname}
                      placeholder={t("Common:FirstName")}
                      size="large"
                      scale={true}
                      tabIndex={1}
                      isDisabled={isLoading}
                      onChange={onChangeFname}
                      onKeyDown={onKeyPress}
                      isAutoFocussed
                    />
                  </FieldContainer>
                  <FieldContainer
                    className="form-field"
                    isVertical={true}
                    labelVisible={false}
                    hasError={!snameValid}
                    errorMessage={
                      errorText
                        ? errorText
                        : sname.trim().length === 0
                          ? t("Common:RequiredField")
                          : t("Common:IncorrectLastName")
                    }
                  >
                    <TextInput
                      id="last-name"
                      name="last-name"
                      type="text"
                      hasError={!snameValid}
                      value={sname}
                      placeholder={t("Common:LastName")}
                      size="large"
                      scale={true}
                      tabIndex={1}
                      isDisabled={isLoading}
                      onChange={onChangeSname}
                      onKeyDown={onKeyPress}
                    />
                  </FieldContainer>
                  <FieldContainer
                    className="form-field password-field"
                    isVertical={true}
                    labelVisible={false}
                    hasError={isPasswordErrorShow && !passwordValid}
                    errorMessage={
                      password
                        ? t("Common:IncorrectPassword")
                        : t("Common:RequiredField")
                    }
                  >
                    <PasswordInput
                      simpleView={false}
                      hideNewPasswordButton
                      showCopyLink={false}
                      passwordSettings={settings}
                      id="password"
                      inputName="password"
                      placeholder={t("Common:Password")}
                      type="password"
                      hasError={isPasswordErrorShow && !passwordValid}
                      inputValue={password}
                      size="large"
                      scale={true}
                      tabIndex={1}
                      isDisabled={isLoading}
                      autoComplete="current-password"
                      onChange={onChangePassword}
                      onBlur={onBlurPassword}
                      onKeyDown={onKeyPress}
                      onValidateInput={onValidatePassword}
                      tooltipPasswordTitle={`${t(
                        "Common:PasswordLimitMessage",
                      )}:`}
                      tooltipPasswordLength={`${t(
                        "Common:PasswordMinimumLength",
                      )}: ${settings ? settings.minLength : 8}`}
                      tooltipPasswordDigits={`${t(
                        "Common:PasswordLimitDigits",
                      )}`}
                      tooltipPasswordCapital={`${t(
                        "Common:PasswordLimitUpperCase",
                      )}`}
                      tooltipPasswordSpecial={`${t(
                        "Common:PasswordLimitSpecialSymbols",
                      )}`}
                      generatePasswordTitle={t("Wizard:GeneratePassword")}
                      tooltipAllowedCharacters={`${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`}
                    />
                  </FieldContainer>

                  {termsConditionsComponent}

                  <Button
                    className="login-button"
                    primary
                    size="medium"
                    scale={true}
                    label={
                      isLoading ? t("Common:LoadingProcessing") : t("SignUp")
                    }
                    tabIndex={1}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    onClick={onSubmit}
                  />
                </div>
              )}
            </div>

            {!emailFromLink && (oauthDataExists() || ssoExists()) && (
              <>
                <div className="line">
                  <Text color="#A3A9AE" className="or-label">
                    {t("Common:orContinueWith")}
                  </Text>
                </div>
                <SocialButtonsGroup
                  providers={providers}
                  onClick={onSocialButtonClick}
                  t={t}
                  isDisabled={isLoading}
                  {...ssoProps}
                />
              </>
            )}
          </RegisterContainer>
        </FormWrapper>
      </StyledCreateUserContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore, authStore }) => {
  const { providers, thirdPartyLogin, capabilities } = authStore;
  const {
    passwordSettings,
    hashSettings,
    defaultPage,
    getSettings,
    getPortalPasswordSettings,
    currentColorScheme,
    userNameRegex,
    cultures,
    licenseUrl,
    legalTerms,
  } = settingsStore;
  return {
    settings: passwordSettings,
    hashSettings,
    defaultPage,

    getSettings,
    getPortalPasswordSettings,
    thirdPartyLogin,
    providers,
    capabilities,
    currentColorScheme,
    userNameRegex,
    cultures,

    licenseUrl,
    legalTerms,
  };
})(
  withCultureNames(
    withTranslation(["Confirm", "Common", "Wizard"])(
      withLoader(observer(CreateUserForm)),
    ),
  ),
);
