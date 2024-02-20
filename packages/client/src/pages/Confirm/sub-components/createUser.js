import SsoReactSvgUrl from "PUBLIC_DIR/images/sso.react.svg?url";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import React, { useEffect, useState, useCallback } from "react";
import { withTranslation, Trans } from "react-i18next";
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
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import MoreLoginModal from "@docspace/shared/components/more-login-modal";
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
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/shared/utils/common";
import { login } from "@docspace/shared/utils/loginUtils";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { getPasswordErrorMessage } from "@docspace/shared/utils/getPasswordErrorMessage";
import DocspaceLogo from "SRC_DIR/components/DocspaceLogoWrapper";
import withLoader from "../withLoader";

import { StyledPage, StyledContent } from "./StyledConfirm";
import {
  ButtonsWrapper,
  ConfirmContainer,
  GreetingContainer,
  RegisterContainer,
} from "./StyledCreateUser";

const DEFAULT_ROOM_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";
const DEFAULT_PORTAL_TEXT =
  "<strong>{{firstName}} {{lastName}}</strong> invites you to join the room <strong>{{roomName}}</strong> for secure document collaboration.";

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
  } = props;
  const inputRef = React.useRef(null);

  const emailFromLink = linkData?.email ? linkData.email : "";
  const roomName = roomData?.title;

  const [email, setEmail] = useState(emailFromLink);
  const [emailValid, setEmailValid] = useState(true);
  const [emailErrorText, setEmailErrorText] = useState("");

  // const [password, setPassword] = useState("");
  // const [passwordValid, setPasswordValid] = useState(true);

  // const [fname, setFname] = useState("");
  // const [fnameValid, setFnameValid] = useState(true);
  // const [sname, setSname] = useState("");
  // const [snameValid, setSnameValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState("");

  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);
  // const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [showForm, setShowForm] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  //const [searchParams, setSearchParams] = useSearchParams();

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

  const onContinue = async () => {
    const { linkData, hashSettings } = props;
    setIsLoading(true);

    let hasError = false;

    const emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$";
    const validationEmail = new RegExp(emailRegex);

    if (!validationEmail.test(email.trim())) {
      hasError = true;
      setEmailValid(!hasError);
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    const headerKey = linkData.confirmHeader;

    try {
      const user = await getUserByEmail(email, headerKey);

      console.log("roomName", roomName);

      window.location.href = combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        "/login",
        `?type=invitation&email=${email}&roomName=${roomName}&firstName=${user.firstName}&lastName=${user.lastName}`,
      );

   
    } catch (err) {
      const status = err?.response?.status;
      const isNotExistUser = status === 404;

      if (isNotExistUser) {
       
      }
    }

    setIsLoading(false);
  };
  // const onSubmit = () => {
  //   const { linkData, hashSettings } = props;
  //   const type = parseInt(linkData.emplType);
  //   const culture = searchParams.get("culture");
  //   setIsLoading(true);

  //   setErrorText("");

  //   let hasError = false;

  //   if (!fname.trim() || !fnameValid) {
  //     hasError = true;
  //     setFnameValid(!hasError);
  //   }

  //   if (!sname.trim() || !snameValid) {
  //     hasError = true;
  //     setSnameValid(!hasError);
  //   }

  //   const emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$";
  //   const validationEmail = new RegExp(emailRegex);

  //   if (!validationEmail.test(email.trim())) {
  //     hasError = true;
  //     setEmailValid(!hasError);
  //   }

  //   if (!passwordValid || !password.trim()) {
  //     hasError = true;
  //     setPasswordValid(!hasError);
  //     setIsPasswordErrorShow(true);
  //   }

  //   if (hasError) {
  //     setIsLoading(false);
  //     return false;
  //   }

  //   const hash = createPasswordHash(password, hashSettings);

  //   const loginData = {
  //     userName: email,
  //     passwordHash: hash,
  //   };

  //   const personalData = {
  //     firstname: fname.trim(),
  //     lastname: sname.trim(),
  //     email: email,
  //     cultureName: culture,
  //   };

  //   if (!!type) {
  //     personalData.type = type;
  //   }

  //   if (!!linkData.key) {
  //     personalData.key = linkData.key;
  //   }

  //   const headerKey = linkData.confirmHeader;

  //   createConfirmUser(personalData, loginData, headerKey).catch((error) => {
  //     let errorMessage = "";
  //     if (typeof error === "object") {
  //       errorMessage =
  //         error?.response?.data?.error?.message ||
  //         error?.statusText ||
  //         error?.message ||
  //         "";
  //     } else {
  //       errorMessage = error;
  //     }

  //     console.error("confirm error", errorMessage);
  //     setIsEmailErrorShow(true);
  //     setEmailErrorText(errorMessage);
  //     setEmailValid(false);
  //     setIsLoading(false);
  //   });
  // };

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

  // const createConfirmUser = async (registerData, loginData, key) => {
  //   const { defaultPage } = props;

  //   const fromInviteLink = linkData.type === "LinkInvite" ? true : false;

  //   const data = Object.assign(
  //     { fromInviteLink: fromInviteLink },
  //     registerData,
  //     loginData,
  //   );

  //   await createUser(data, key);

  //   const { userName, passwordHash } = loginData;

  //   const res = await login(userName, passwordHash);

  //   //console.log({ res });

  //   const finalUrl = roomData.roomId
  //     ? `/rooms/shared/filter?folder=${roomData.roomId}`
  //     : defaultPage;

  //   const isConfirm = typeof res === "string" && res.includes("confirm");

  //   if (isConfirm) {
  //     sessionStorage.setItem("referenceUrl", finalUrl);

  //     return window.location.replace(typeof res === "string" ? res : "/");
  //   }

  //   window.location.replace(finalUrl);
  // };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
    setIsEmailErrorShow(false);
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      onContinue();
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

  const onBlurEmail = () => {
    setIsEmailErrorShow(true);
  };

  const ssoProps = ssoExists()
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel:
          capabilities?.ssoLabel ||
          getProviderTranslation("sso", t, false, true),
        ssoSVG: SsoReactSvgUrl,
      }
    : {};

  return (
    <StyledPage>
      <StyledContent>
        <ConfirmContainer>
          <GreetingContainer>
            <DocspaceLogo className="docspace-logo" />
            {showGreeting && (
              <div className="tooltip">
                <Text fontSize="16px">
                  <Trans
                    t={t}
                    i18nKey={
                      roomName ? "InvitationToRoom" : "InvitationToPortal"
                    }
                    ns="Confirm"
                    defaults={
                      roomName ? DEFAULT_ROOM_TEXT : DEFAULT_PORTAL_TEXT
                    }
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
                </Text>
              </div>
            )}
          </GreetingContainer>

          <FormWrapper>
            <RegisterContainer>
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
                  {/* <div className="signin-container">
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
                  </div> */}
                </form>
              )}
              {!emailFromLink && (
                <>
                  {(oauthDataExists() || ssoExists()) && (
                    <div className="line">
                      <Text color="#A3A9AE" className="or-label">
                        {t("Common:orContinueWith")}
                      </Text>
                    </div>
                  )}

                  {(oauthDataExists() || ssoExists()) && (
                    <SocialButtonsGroup
                      providers={providers}
                      onClick={onSocialButtonClick}
                      t={t}
                      isDisabled={isLoading}
                      {...ssoProps}
                    />
                  )}
                </>
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
            </RegisterContainer>
          </FormWrapper>
        </ConfirmContainer>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore, authStore }) => {
  const { providers, thirdPartyLogin, capabilities } = authStore;
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
    withLoader(observer(CreateUserForm)),
  ),
);
