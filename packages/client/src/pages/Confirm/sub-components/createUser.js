import SsoReactSvgUrl from "PUBLIC_DIR/images/sso.react.svg?url";
import React, { useEffect, useState, useCallback } from "react";
import { withTranslation, Trans } from "react-i18next";
import { createUser, signupOAuth } from "@docspace/common/api/people";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { useSearchParams } from "react-router-dom";
import { Avatar } from "@docspace/shared/components/avatar";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { SocialButton } from "@docspace/shared/components/social-button";
import { getUserFromConfirm } from "@docspace/common/api/people";
import {
  createPasswordHash,
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/common/utils";
import { login } from "@docspace/common/utils/loginUtils";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import withLoader from "../withLoader";
import MoreLoginModal from "@docspace/common/components/MoreLoginModal";
import { EmailInput } from "@docspace/shared/components/email-input";
import { getPasswordErrorMessage } from "../../../helpers/utils";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../DocspaceLogo";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { StyledPage, StyledContent } from "./StyledConfirm";
import {
  ButtonsWrapper,
  ConfirmContainer,
  GreetingContainer,
  RegisterContainer,
} from "./StyledCreateUser";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const CreateUserForm = (props) => {
  const {
    settings,
    t,
    greetingTitle,
    providers,
    isDesktop,
    linkData,
    roomData,
    capabilities,
    currentColorScheme,
    userNameRegex,
    defaultPage,
  } = props;
  const inputRef = React.useRef(null);

  const emailFromLink = linkData?.email ? linkData.email : "";
  const roomName = roomData?.title;

  const [moreAuthVisible, setMoreAuthVisible] = useState(false);
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

  const [showForm, setShowForm] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const focusInput = () => {
    if (inputRef) {
      inputRef.current.focus();
    }
  };

  const onCheckGreeting = () => {
    const isGreetingMode = oauthDataExists() && isMobile; /*!isDesktopUtil()*/
    setShowForm(!isGreetingMode);
  };

  const onGreetingJoin = () => {
    setShowForm(true);
    setShowGreeting(false);
  };

  const nameRegex = new RegExp(userNameRegex, "gu");

  /*useEffect(() => {
    window.addEventListener("resize", onCheckGreeting);
    return () => window.removeEventListener("resize", onCheckGreeting);
  }, []);*/

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

      onCheckGreeting();
      focusInput();
    };

    fetchData();
  }, []);

  const onSubmit = () => {
    const { linkData, hashSettings } = props;
    const type = parseInt(linkData.emplType);
    const culture = searchParams.get("culture");
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

    const emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$";
    const validationEmail = new RegExp(emailRegex);

    if (!validationEmail.test(email.trim())) {
      hasError = true;
      setEmailValid(!hasError);
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
      cultureName: culture,
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
    };

    signupOAuth(signupAccount)
      .then(() => {
        const url = roomData.roomId
          ? `/rooms/shared/filter?folder=${roomData.roomId}/`
          : defaultPage;
        window.location.replace(url);
      })
      .catch((e) => {
        toastr.error(e);
      });
  };

  const createConfirmUser = async (registerData, loginData, key) => {
    const { defaultPage } = props;

    const fromInviteLink = linkData.type === "LinkInvite" ? true : false;

    const data = Object.assign(
      { fromInviteLink: fromInviteLink },
      registerData,
      loginData
    );

    await createUser(data, key);

    const { userName, passwordHash } = loginData;

    const res = await login(userName, passwordHash);

    //console.log({ res });

    const finalUrl = roomData.roomId
      ? `/rooms/shared/filter?folder=${roomData.roomId}`
      : defaultPage;

    const isConfirm = typeof res === "string" && res.includes("confirm");

    if (isConfirm) {
      sessionStorage.setItem("referenceUrl", finalUrl);

      return window.location.replace(typeof res === "string" ? res : "/");
    }

    window.location.replace(finalUrl);
  };

  const moreAuthOpen = () => {
    setMoreAuthVisible(true);
  };

  const moreAuthClose = () => {
    setMoreAuthVisible(false);
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
      onSubmit();
    }
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
            "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
          );

      getOAuthToken(tokenGetterWin).then((code) => {
        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          })
        );

        tokenGetterWin.location.href = getLoginLink(token, code);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const providerButtons = () => {
    const providerButtons =
      providers &&
      providers.map((item, index) => {
        if (!PROVIDERS_DATA[item.provider]) return;
        if (index > 1) return;

        const { icon, label, iconOptions, className } =
          PROVIDERS_DATA[item.provider];

        return (
          <div className="buttonWrapper" key={`${item.provider}ProviderItem`}>
            <SocialButton
              iconName={icon}
              label={getProviderTranslation(label, t, false, true)}
              className={`socialButton ${className ? className : ""}`}
              $iconOptions={iconOptions}
              data-url={item.url}
              data-providername={item.provider}
              onClick={onSocialButtonClick}
            />
          </div>
        );
      });

    return providerButtons;
  };

  const ssoButton = () => {
    return (
      <div className="buttonWrapper">
        <SocialButton
          iconName={SsoReactSvgUrl}
          className="socialButton"
          label={
            capabilities?.ssoLabel ||
            getProviderTranslation("sso", t, false, true)
          }
          onClick={() => (window.location.href = capabilities?.ssoUrl)}
        />
      </div>
    );
  };

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

  const onValidatePassword = (res) => {
    setPasswordValid(res);
  };

  const onBlurEmail = () => {
    setIsEmailErrorShow(true);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const onSignIn = () => {
    return window.location.replace(
      combineUrl(window.DocSpaceConfig?.proxy?.url, "/login")
    );
  };

  const userAvatar = user && user.hasAvatar ? user.avatar : DefaultUserPhoto;

  return (
    <StyledPage>
      <StyledContent>
        <ConfirmContainer>
          <GreetingContainer>
            <DocspaceLogo className="docspace-logo" />
            <Text
              fontSize="23px"
              fontWeight={700}
              textAlign="left"
              className="greeting-title"
            >
              {greetingTitle}
            </Text>

            {showGreeting && (
              <>
                {user && (
                  <div className="greeting-block">
                    <Avatar
                      className="avatar"
                      role="user"
                      source={userAvatar}
                    />
                    <div className="user-info">
                      <Text fontSize="15px" fontWeight={600}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text fontSize="12px" fontWeight={600} color="#A3A9AE">
                        {user.department}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="tooltip">
                  <p className="tooltiptext">
                    {roomName ? (
                      <Trans
                        t={t}
                        i18nKey="WelcomeToRoom"
                        ns="Confirm"
                        key={roomName}
                      >
                        Welcome to the <strong>{{ roomName }}</strong> room!
                      </Trans>
                    ) : (
                      t("WelcomeToDocspace")
                    )}
                  </p>
                  <p className="tooltiptext">
                    {ssoExists() && !oauthDataExists()
                      ? t("WelcomeRegisterViaSSO")
                      : oauthDataExists()
                        ? t("WelcomeRegisterViaSocial")
                        : t("WelcomeRegister")}
                  </p>
                </div>
              </>
            )}
          </GreetingContainer>

          <FormWrapper>
            <RegisterContainer>
              {!emailFromLink && (
                <>
                  {ssoExists() && (
                    <ButtonsWrapper>{ssoButton()}</ButtonsWrapper>
                  )}

                  {oauthDataExists() && (
                    <>
                      <ButtonsWrapper>{providerButtons()}</ButtonsWrapper>
                      {providers && providers.length > 2 && (
                        <Link
                          isHovered
                          type="action"
                          fontSize="13px"
                          fontWeight="600"
                          color={currentColorScheme?.main?.accent}
                          className="more-label"
                          onClick={moreAuthOpen}
                        >
                          {t("Common:ShowMore")}
                        </Link>
                      )}
                    </>
                  )}

                  {(oauthDataExists() || ssoExists()) && (
                    <div className="line">
                      <Text color="#A3A9AE" className="or-label">
                        {t("Common:Or")}
                      </Text>
                    </div>
                  )}
                </>
              )}

              {showForm && (
                <form className="auth-form-container">
                  <div className="auth-form-fields">
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
                      errorMessage={`${t(
                        "Common:PasswordLimitMessage"
                      )}: ${getPasswordErrorMessage(t, settings)}`}
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
                          "Common:PasswordLimitMessage"
                        )}:`}
                        tooltipPasswordLength={`${t(
                          "Common:PasswordMinimumLength"
                        )}: ${settings ? settings.minLength : 8}`}
                        tooltipPasswordDigits={`${t(
                          "Common:PasswordLimitDigits"
                        )}`}
                        tooltipPasswordCapital={`${t(
                          "Common:PasswordLimitUpperCase"
                        )}`}
                        tooltipPasswordSpecial={`${t(
                          "Common:PasswordLimitSpecialSymbols"
                        )}`}
                        generatePasswordTitle={t("Wizard:GeneratePassword")}
                      />
                    </FieldContainer>

                    <Button
                      className="login-button"
                      primary
                      size="medium"
                      scale={true}
                      label={
                        isLoading
                          ? t("Common:LoadingProcessing")
                          : t("LoginRegistryButton")
                      }
                      tabIndex={1}
                      isDisabled={isLoading}
                      isLoading={isLoading}
                      onClick={onSubmit}
                    />
                  </div>
                  <div className="signin-container">
                    <Link
                      isHovered
                      type="action"
                      fontSize="13px"
                      fontWeight="600"
                      color={currentColorScheme?.main?.accent}
                      className="signin-button"
                      onClick={onSignIn}
                    >
                      {t("Common:LoginButton")}
                    </Link>
                  </div>
                </form>
              )}

              {!showForm && (
                <Button
                  className="login-button"
                  primary
                  size="medium"
                  scale={true}
                  label={
                    isLoading
                      ? t("Common:LoadingProcessing")
                      : t("LoginRegistryButton")
                  }
                  tabIndex={1}
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onClick={onGreetingJoin}
                />
              )}

              <MoreLoginModal
                t={t}
                visible={moreAuthVisible}
                onClose={moreAuthClose}
                providers={providers}
                onSocialLoginClick={onSocialButtonClick}
                ssoLabel={capabilities?.ssoLabel}
                ssoUrl={capabilities?.ssoUrl}
                isSignUp
              />
            </RegisterContainer>
          </FormWrapper>
        </ConfirmContainer>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ auth }) => {
  const { settingsStore, providers, thirdPartyLogin, capabilities } = auth;
  const {
    passwordSettings,
    greetingSettings,
    hashSettings,
    defaultPage,
    getSettings,
    getPortalPasswordSettings,
    currentColorScheme,
    userNameRegex,
  } = settingsStore;
  return {
    settings: passwordSettings,
    greetingTitle: greetingSettings,
    hashSettings,
    defaultPage,

    getSettings,
    getPortalPasswordSettings,
    thirdPartyLogin,
    providers,
    capabilities,
    currentColorScheme,
    userNameRegex,
  };
})(
  withTranslation(["Confirm", "Common", "Wizard"])(
    withLoader(observer(CreateUserForm))
  )
);
