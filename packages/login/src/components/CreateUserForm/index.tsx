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

import SsoReactSvgUrl from "PUBLIC_DIR/images/sso.react.svg?url";

import { ConfirmRouteContext } from "@/app/(root)/confirm/confirmRoute";
import withLoader from "@/app/(root)/confirm/withLoader";
import { TPasswordHash } from "@docspace/shared/api/settings/types";
import { toastr } from "@docspace/shared/components/toast";
import {
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  PROVIDERS_DATA,
} from "@docspace/shared/constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  createPasswordHash,
  getLoginLink,
  getOAuthToken,
} from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { DeviceType } from "@docspace/shared/enums";
import useDeviceType from "@/hooks/useDeviceType";
import { RegisterContainer } from "./CreateUserForm.styled";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { EmailInput, TValidate } from "@docspace/shared/components/email-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { getPasswordErrorMessage } from "@docspace/shared/utils/getPasswordErrorMessage";
import { TError, WithLoaderProps } from "@/types";
import { TUser } from "@docspace/shared/api/people/types";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/shared/components/text";

import { login } from "@docspace/shared/api/user";
import {
  createUser,
  getUserByEmail,
  getUserFromConfirm,
  signupOAuth,
} from "@/utils/actions";

export type CreateUserFormProps = {
  userNameRegex: string;
  passwordHash: TPasswordHash;
  defaultPage?: string;
} & WithLoaderProps;

const CreateUserForm = (props: CreateUserFormProps) => {
  const {
    userNameRegex,
    passwordHash,
    defaultPage = "/",
    passwordSettings,
    capabilities,
    thirdPartyProviders,
  } = props;
  const { linkData, roomData } = useContext(ConfirmRouteContext);
  const { t, i18n } = useTranslation(["Confirm", "Common", "Wizard"]);
  const { currentDeviceType } = useDeviceType();

  const currentCultureName = i18n.language;
  const isDesktopView = currentDeviceType === DeviceType.desktop;

  const inputRef = useRef<HTMLInputElement>(null);

  const emailFromLink = linkData?.email ? linkData.email : "";
  const roomName = roomData?.title;

  const [email, setEmail] = useState(emailFromLink);
  const [emailValid, setEmailValid] = useState(true);
  const [emailErrorText, setEmailErrorText] = useState<string>();

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [fname, setFname] = useState("");
  const [fnameValid, setFnameValid] = useState(true);
  const [sname, setSname] = useState("");
  const [snameValid, setSnameValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [errorText, setErrorText] = useState("");

  const [user, setUser] = useState<TUser>();

  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [registrationForm, setRegistrationForm] = useState(!!emailFromLink);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const nameRegex = new RegExp(userNameRegex, "gu");

  const authCallback = useCallback(
    async (profile: string) => {
      const signupAccount: { [key: string]: string } = {
        EmployeeType: linkData.emplType ?? "",
        Email: linkData.email ?? "",
        Key: linkData.key ?? "",
        SerializedProfile: profile,
        culture: currentCultureName,
      };

      // remove from component?
      return signupOAuth(signupAccount)
        .then(() => {
          const url = roomData.roomId
            ? `/rooms/shared/filter?folder=${roomData.roomId}/`
            : defaultPage;
          window.location.replace(url);
        })
        .catch((e) => {
          toastr.error(e);
        });
    },
    [
      currentCultureName,
      defaultPage,
      linkData.email,
      linkData.emplType,
      linkData.key,
      roomData.roomId,
    ],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (linkData.type === "LinkInvite") {
        const uid = linkData?.uid ?? "";
        const confirmKey = linkData?.confirmHeader || null;
        // remove from component?
        const user = await getUserFromConfirm(uid, confirmKey);
        setUser(user);
      }
      window.authCallback = authCallback;

      focusInput();
    };

    fetchData();
  }, [authCallback, linkData?.confirmHeader, linkData.type, linkData?.uid]);

  const onContinue = async () => {
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

    const headerKey = linkData?.confirmHeader ?? null;

    try {
      const toBinaryStr = (str: string) => {
        const encoder = new TextEncoder();
        const charCodes = encoder.encode(str);
        return String.fromCharCode(...charCodes);
      };

      const loginData = window.btoa(
        toBinaryStr(
          JSON.stringify({
            type: "invitation",
            email,
            roomName,
            firstName: user?.firstName,
            lastName: user?.lastName,
          }),
        ),
      );

      const response = await getUserByEmail(email, headerKey);

      if (typeof response === "number") {
        const isNotExistUser = response === 404;

        if (isNotExistUser) {
          setRegistrationForm(true);
        }
        setIsLoading(false);

        return;
      }

      setCookie(LANGUAGE, currentCultureName, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        "/login",
        `?loginData=${loginData}`,
      );
    } catch (error) {
      /* const knownError = error as TError;
      console.log("knownError", error.status);

      const status =
        typeof knownError === "object" ? knownError.response?.status : "";
      const isNotExistUser = status === 404;

      if (isNotExistUser) {
        setRegistrationForm(true);
      } */
    }

    setIsLoading(false);
  };

  const onSubmit = () => {
    const type = parseInt(linkData?.emplType ?? "");
    console.log("here");

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

    const hash = createPasswordHash(password, passwordHash);

    const loginData = {
      userName: email,
      passwordHash: hash,
    };

    const personalData: { [key: string]: string | number } = {
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

    const headerKey = linkData?.confirmHeader ?? "";

    createConfirmUser(personalData, loginData, headerKey).catch((error) => {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }

      console.error("confirm error", errorMessage);
      setIsEmailErrorShow(true);
      setEmailErrorText(errorMessage);
      setEmailValid(false);
      setIsLoading(false);
    });
  };

  const createConfirmUser = async (
    registerData: { [key: string]: string | number },
    loginData: { userName: string; passwordHash: string },
    key: string,
  ) => {
    const fromInviteLink =
      linkData.type === "LinkInvite" || linkData.type === "EmpInvite"
        ? true
        : false;

    const data = Object.assign({ fromInviteLink }, registerData, loginData);

    await createUser(data, key);

    const { userName, passwordHash } = loginData;

    const res = await login(userName, passwordHash);

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

  const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsEmailErrorShow(false);
  };
  const onChangeFname = (e: ChangeEvent<HTMLInputElement>) => {
    setFname(e.target.value);
    setFnameValid(nameRegex.test(e.target.value.trim()));
    setErrorText("");
  };

  const onChangeSname = (e: ChangeEvent<HTMLInputElement>) => {
    setSname(e.target.value);
    setSnameValid(nameRegex.test(e.target.value.trim()));
    setErrorText("");
  };

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorText("");
    setIsPasswordErrorShow(false);
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      registrationForm ? onSubmit() : onContinue();
    }
  };
  const onValidatePassword = (progressScore: boolean) => {
    setPasswordValid(progressScore);
  };

  const onBlurEmail = () => {
    setIsEmailErrorShow(true);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const onSocialButtonClick = useCallback(
    (e: MouseEvent<Element>) => {
      const target = e.target as HTMLElement;
      let targetElement = target;

      if (
        !(targetElement instanceof HTMLButtonElement) &&
        target.parentElement
      ) {
        targetElement = target.parentElement;
      }

      const providerName = targetElement.dataset.providername;
      const url = targetElement.dataset.url || "";

      try {
        const tokenGetterWin = isDesktopView
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

          if (tokenGetterWin && typeof tokenGetterWin === "object")
            tokenGetterWin.location.href = getLoginLink(token, code);
        });
      } catch (err) {
        console.log(err);
      }
    },
    [isDesktopView],
  );

  const oauthDataExists = () => {
    if (!capabilities?.oauthEnabled) return false;

    let existProviders = 0;
    thirdPartyProviders && thirdPartyProviders.length > 0;
    thirdPartyProviders?.map((item) => {
      let key = item.provider as keyof typeof PROVIDERS_DATA;
      if (PROVIDERS_DATA.hasOwnProperty(key) && !PROVIDERS_DATA[key]) return;
      existProviders++;
    });

    return !!existProviders;
  };

  const ssoExists = () => {
    if (capabilities?.ssoUrl) return true;
    else return false;
  };

  const onValidateEmail = (result: TValidate): undefined => {
    setEmailValid(result.isValid);
    setEmailErrorText(result.errors?.[0]);
  };

  const ssoProps = ssoExists()
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel: capabilities?.ssoLabel,
        ssoSVG: SsoReactSvgUrl,
      }
    : {};

  return (
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
              type={InputType.email}
              size={InputSize.large}
              hasError={isEmailErrorShow && !emailValid}
              value={email}
              placeholder={t("Common:Email")}
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
            size={ButtonSize.medium}
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
            {/* <RegistrationFormGreeting
              email={email}
              setRegistrationForm={setRegistrationForm}
              type={linkData.type ?? ""}
              emailFromLink={emailFromLink}
            /> */}
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
                type={InputType.text}
                size={InputSize.large}
                hasError={!fnameValid}
                value={fname}
                placeholder={t("Common:FirstName")}
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
                type={InputType.text}
                size={InputSize.large}
                hasError={!snameValid}
                value={sname}
                placeholder={t("Common:LastName")}
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
                "Common:PasswordLimitMessage",
              )}: ${getPasswordErrorMessage(t, passwordSettings)}`}
            >
              <PasswordInput
                simpleView={false}
                passwordSettings={passwordSettings}
                id="password"
                inputName="password"
                placeholder={t("Common:Password")}
                inputType={InputType.password}
                size={InputSize.large}
                hasError={isPasswordErrorShow && !passwordValid}
                inputValue={password}
                scale={true}
                tabIndex={1}
                isDisabled={isLoading}
                autoComplete="current-password"
                onChange={onChangePassword}
                onBlur={onBlurPassword}
                onKeyDown={onKeyPress}
                onValidateInput={onValidatePassword}
                tooltipPasswordTitle={`${t("Common:PasswordLimitMessage")}:`}
                tooltipPasswordLength={`${t(
                  "Common:PasswordMinimumLength",
                )}: ${passwordSettings ? passwordSettings.minLength : 8}`}
                tooltipPasswordDigits={`${t("Common:PasswordLimitDigits")}`}
                tooltipPasswordCapital={`${t("Common:PasswordLimitUpperCase")}`}
                tooltipPasswordSpecial={`${t(
                  "Common:PasswordLimitSpecialSymbols",
                )}`}
                generatePasswordTitle={t("Wizard:GeneratePassword")}
              />
            </FieldContainer>

            <Button
              className="login-button"
              primary
              size={ButtonSize.medium}
              scale={true}
              label={isLoading ? t("Common:LoadingProcessing") : t("SignUp")}
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
            providers={thirdPartyProviders}
            onClick={onSocialButtonClick}
            t={t}
            isDisabled={isLoading}
            {...ssoProps}
          />
        </>
      )}
    </RegisterContainer>
  );
};

export default withLoader(CreateUserForm);
