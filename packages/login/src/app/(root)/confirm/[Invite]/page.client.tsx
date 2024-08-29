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
import { useRouter } from "next/navigation";

import {
  TCapabilities,
  TPasswordHash,
  TPasswordSettings,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";
import { toastr } from "@docspace/shared/components/toast";
import {
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  PROVIDERS_DATA,
} from "@docspace/shared/constants";
import {
  createPasswordHash,
  getLoginLink,
  getOAuthToken,
} from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";
import { ButtonKeys, DeviceType } from "@docspace/shared/enums";
import { TValidate } from "@docspace/shared/components/email-input";
import { TCreateUserData, TError } from "@/types";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/shared/components/text";
import { login } from "@docspace/shared/api/user";
import {
  createUser,
  getUserByEmail,
  signupOAuth,
} from "@docspace/shared/api/people";

import SsoReactSvg from "PUBLIC_DIR/images/sso.react.svg";

import useDeviceType from "@/hooks/useDeviceType";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { RegisterContainer } from "@/components/RegisterContainer.styled";
import EmailInputForm from "./_sub-components/EmailInputForm";
import RegistrationForm from "./_sub-components/RegistrationForm";

export type CreateUserFormProps = {
  userNameRegex: string;
  passwordHash: TPasswordHash;
  licenseUrl: string;
  legalTerms: string;
  defaultPage?: string;
  passwordSettings?: TPasswordSettings;
  capabilities?: TCapabilities;
  thirdPartyProviders?: TThirdPartyProvider[];
  firstName?: string;
  lastName?: string;
};

const CreateUserForm = (props: CreateUserFormProps) => {
  const {
    userNameRegex,
    passwordHash,
    defaultPage = "/",
    passwordSettings,
    capabilities,
    thirdPartyProviders,
    firstName,
    lastName,
    licenseUrl,
    legalTerms,
  } = props;
  const { linkData, roomData } = useContext(ConfirmRouteContext);
  const { t, i18n } = useTranslation(["Confirm", "Common"]);
  const { currentDeviceType } = useDeviceType();
  const router = useRouter();

  const currentCultureName = i18n.language;
  const isDesktopView = currentDeviceType === DeviceType.desktop;

  const inputRef = useRef<HTMLInputElement>(null);

  const emailFromLink = linkData?.email ? linkData.email : "";
  const roomName = roomData?.title;
  const roomId = roomData?.roomId;

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

      try {
        await signupOAuth(signupAccount);

        const url = roomData.roomId
          ? `/rooms/shared/${roomData.roomId}/filter?folder=${roomData.roomId}/`
          : defaultPage;
        window.location.replace(url);
      } catch (error) {
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
        toastr.error(errorMessage);
      }
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
    window.authCallback = authCallback;
    focusInput();
  }, [authCallback]);

  const onContinue = async () => {
    if (!email.trim()) {
      setEmailValid(false);
      setIsEmailErrorShow(true);
    }

    if (!emailValid || !email.trim()) {
      setIsEmailErrorShow(true);
      return;
    }

    setIsLoading(true);

    const headerKey = linkData?.confirmHeader ?? null;

    try {
      const toBinaryStr = (str: string) => {
        const encoder = new TextEncoder();
        const charCodes = encoder.encode(str);
        // @ts-ignore
        return String.fromCharCode(...charCodes);
      };

      const loginData = window.btoa(
        toBinaryStr(
          JSON.stringify({
            type: "invitation",
            email,
            roomName,
            firstName,
            lastName,
            linkData,
          }),
        ),
      );

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

      router.push(`/?loginData=${loginData}`);
    } catch (error) {
      const knownError = error as TError;
      const status =
        typeof knownError === "object" ? knownError?.response?.status : "";
      const isNotExistUser = status === 404;

      if (isNotExistUser) {
        setRegistrationForm(true);
      }
    }

    setIsLoading(false);
  };

  const onSubmit = async () => {
    const type = parseInt(linkData?.emplType ?? "");

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

    const hash = createPasswordHash(password, passwordHash);

    const fromInviteLink =
      linkData.type === "LinkInvite" || linkData.type === "EmpInvite"
        ? true
        : false;

    const confirmUser: TCreateUserData = {
      fromInviteLink,
      userName: email,
      passwordHash: hash,
      firstName: fname.trim(),
      lastName: sname.trim(),
      email: email,
      cultureName: currentCultureName,
    };

    confirmUser.fromInviteLink = fromInviteLink;

    if (!!type) {
      confirmUser.type = type;
    }

    if (!!linkData.key) {
      confirmUser.key = linkData.key;
    }

    const headerKey = linkData?.confirmHeader ?? "";

    try {
      await createConfirmUser(confirmUser, headerKey);
    } catch (error) {
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
      toastr.error(errorMessage);
      setIsEmailErrorShow(true);
      setEmailErrorText(errorMessage);
      setEmailValid(false);
      setIsLoading(false);
    }
  };

  const createConfirmUser = async (
    confirmUserData: TCreateUserData,
    key: string,
  ) => {
    await createUser(confirmUserData, key);

    const { userName, passwordHash } = confirmUserData;
    const res = await login(userName, passwordHash);

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
    if (e.key === ButtonKeys.enter) {
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
    async (e: MouseEvent<Element>) => {
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

        const code = await getOAuthToken(tokenGetterWin);

        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          }),
        );

        if (tokenGetterWin && typeof tokenGetterWin === "object")
          tokenGetterWin.location.href = getLoginLink(token, code);
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
    setEmailErrorText(result.errors?.[0] ?? "");
  };

  const onClickBack = () => {
    setRegistrationForm(false);
  };

  const ssoProps = ssoExists()
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel: capabilities?.ssoLabel,
        ssoSVG: SsoReactSvg,
      }
    : {};

  return (
    <RegisterContainer registrationForm={registrationForm}>
      <div className="auth-form-fields">
        <EmailInputForm
          ref={inputRef}
          isLoading={isLoading}
          email={email}
          isEmailErrorShow={isEmailErrorShow}
          emailValid={emailValid}
          emailFromLink={emailFromLink}
          emailErrorText={emailErrorText}
          onContinue={onContinue}
          onChange={onChangeEmail}
          onValidate={onValidateEmail}
          onBlur={onBlurEmail}
          onKeyPress={onKeyPress}
        />
        {registrationForm && (
          <RegistrationForm
            isLoading={isLoading}
            email={email}
            emailFromLink={emailFromLink}
            errorText={errorText}
            fnameValid={fnameValid}
            fname={fname}
            sname={sname}
            snameValid={snameValid}
            isPasswordErrorShow={isPasswordErrorShow}
            passwordValid={passwordValid}
            passwordSettings={passwordSettings}
            password={password}
            legalTerms={legalTerms}
            licenseUrl={licenseUrl}
            onChangeFname={onChangeFname}
            onChangeSname={onChangeSname}
            onChangePassword={onChangePassword}
            onBlurPassword={onBlurPassword}
            onKeyPress={onKeyPress}
            onValidatePassword={onValidatePassword}
            onClickBack={onClickBack}
            onSubmit={onSubmit}
          />
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

export default CreateUserForm;
