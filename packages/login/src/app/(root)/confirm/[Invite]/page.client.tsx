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
  TInvitationSettings,
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
  toUrlParams,
} from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";
import { ButtonKeys } from "@docspace/shared/enums";
import { TValidate } from "@docspace/shared/components/email-input";
import { TCreateUserData, TError } from "@/types";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/shared/components/text";
import { login, thirdPartyLogin } from "@docspace/shared/api/user";
import {
  createUser,
  getUserByEmail,
  signupOAuth,
} from "@docspace/shared/api/people";

import SsoReactSvg from "PUBLIC_DIR/images/sso.react.svg";

import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { RegisterContainer } from "@/components/RegisterContainer.styled";
import { globalColors } from "@docspace/shared/themes";
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
  displayName?: string;
  isStandalone: boolean;
  logoText: string;
  invitationSettings?: TInvitationSettings;
};

const CreateUserForm = (props: CreateUserFormProps) => {
  const {
    userNameRegex,
    passwordHash,
    defaultPage = "/",
    passwordSettings,
    capabilities,
    thirdPartyProviders,
    displayName,
    licenseUrl,
    legalTerms,
    isStandalone,
    logoText,
    invitationSettings,
  } = props;

  const { linkData, roomData, confirmLinkResult } =
    useContext(ConfirmRouteContext);
  const { t, i18n } = useTranslation(["Confirm", "Common"]);

  const router = useRouter();

  const organizationName = logoText || t("Common:OrganizationName");

  const currentCultureName = i18n.language;

  const inputRef = useRef<HTMLInputElement>(null);

  const emailFromLink = confirmLinkResult?.email ? confirmLinkResult.email : "";
  const roomName = roomData?.title;
  const roomId = roomData?.roomId;
  const isAgent = roomData?.isAgent;

  const [email, setEmail] = useState(emailFromLink);
  const [emailValid, setEmailValid] = useState(true);
  const [emailErrorText, setEmailErrorText] = useState<string>();

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [fname, setFname] = useState("");
  const [fnameValid, setFnameValid] = useState(true);
  const [sname, setSname] = useState("");
  const [snameValid, setSnameValid] = useState(true);

  const [isChecked, setIsChecked] = useState(false);

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
      const signupAccount: { [key: string]: string | undefined } = {
        EmployeeType: linkData.emplType,
        Email: confirmLinkResult.email,
        Key: linkData.key,
        SerializedProfile: profile,
        culture: currentCultureName,
      };

      setIsLoading(true);

      const confirmKey = linkData.confirmHeader;

      try {
        const user = await signupOAuth(signupAccount, confirmKey);

        if (!user) {
          toastr.error(t("Common:SomethingWentWrong"));
          return;
        }

        const response = (await thirdPartyLogin(
          profile,
          currentCultureName,
        )) as {
          confirmUrl: string;
          token: unknown;
        };

        if (
          !response ||
          (response && !response.token && !response.confirmUrl)
        ) {
          throw new Error("Empty API response");
        }

        const path = isAgent
          ? `ai-agents/${roomData?.roomId}/chat`
          : `rooms/shared/${roomData?.roomId}/filter`;

        const finalUrl = roomData.roomId
          ? `/${path}?folder=${roomData.roomId}`
          : defaultPage;

        if (response.confirmUrl) {
          sessionStorage.setItem("referenceUrl", finalUrl);
          return window.location.replace(response.confirmUrl);
        }

        window.location.replace(finalUrl);
      } catch (error) {
        setIsLoading(false);
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
      confirmLinkResult.email,
      linkData.emplType,
      linkData.key,
      roomData.roomId,
      roomData.isAgent,
      linkData.confirmHeader,
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
      await getUserByEmail(email, headerKey, currentCultureName);

      setCookie(LANGUAGE, currentCultureName, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      const path = isAgent
        ? `ai-agents/${roomData?.roomId}/chat`
        : `rooms/shared/${roomData?.roomId}/filter`;

      const finalUrl = roomData.roomId
        ? `/${path}?folder=${roomData.roomId}`
        : defaultPage;

      if (roomId) {
        sessionStorage.setItem("referenceUrl", finalUrl);
      }

      const loginData = toUrlParams(
        {
          type: "invitation",
          email,
          roomName,
          displayName,
          spaceAddress: window.location.host,
        },
        true,
      );

      const encodedData = encodeURIComponent(loginData);
      const base64Data = btoa(JSON.stringify(linkData));

      const url = `/?loginData=${encodedData}&linkData=${base64Data}`;

      router.push(url);
    } catch (error) {
      const knownError = error as TError;
      const status =
        typeof knownError === "object" ? knownError?.response?.status : "";
      const isNotExistUser = status === 404;

      const forbiddenInviteUsersPortal = roomData.roomId
        ? !invitationSettings?.allowInvitingGuests
        : !invitationSettings?.allowInvitingMembers;

      if (forbiddenInviteUsersPortal) {
        setEmailValid(false);

        const errorInvite =
          typeof knownError === "object"
            ? knownError?.response?.data?.error?.message
            : "";
        setEmailErrorText(errorInvite);
      } else if (isNotExistUser) {
        setRegistrationForm(true);
      }
    }

    setIsLoading(false);
  };

  const createConfirmUser = async (
    confirmUserData: TCreateUserData,
    key: string,
  ) => {
    await createUser(confirmUserData, key);

    const { userName, passwordHash: ph } = confirmUserData;
    const res = await login(userName, ph);

    if (res && res.tfa && res.confirmUrl) {
      return window.location.replace(res.confirmUrl);
    }

    const path = isAgent
      ? `ai-agents/${roomData?.roomId}/chat`
      : `rooms/shared/${roomData?.roomId}/filter`;

    const finalUrl = roomData.roomId
      ? `/${path}?folder=${roomData.roomId}`
      : defaultPage;

    const isConfirm = typeof res === "string" && res.includes("confirm");
    if (isConfirm) {
      sessionStorage.setItem("referenceUrl", finalUrl);
      return window.location.replace(typeof res === "string" ? res : "/");
    }

    window.location.replace(finalUrl);
  };

  const onSubmit = async () => {
    const type = parseInt(linkData?.emplType ?? "", 10);

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

    const fromInviteLink = !!(
      linkData.type === "LinkInvite" || linkData.type === "EmpInvite"
    );

    const confirmUser: TCreateUserData = {
      fromInviteLink,
      userName: email,
      passwordHash: hash,
      firstName: fname.trim(),
      lastName: sname.trim(),
      email,
      cultureName: currentCultureName,
      spam: isChecked,
    };

    confirmUser.fromInviteLink = fromInviteLink;

    if (type) {
      confirmUser.type = type;
    }

    if (linkData.key) {
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

  const onChangeCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ButtonKeys.enter) {
      if (registrationForm) {
        onSubmit();
      } else {
        onContinue();
      }
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

  const onSocialButtonClick = useCallback(async (e: MouseEvent<Element>) => {
    const target = e.target as HTMLElement;
    let targetElement = target;

    if (!(targetElement instanceof HTMLButtonElement) && target.parentElement) {
      targetElement = target.parentElement;
    }

    const providerName = targetElement.dataset.providername;
    let url = targetElement.dataset.url || "";

    try {
      // Lifehack for Twitter
      if (providerName == "twitter") {
        url += "authCallback";
      }

      const tokenGetterWin =
        window.AscDesktopEditor !== undefined
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
  }, []);

  const oauthDataExists = () => {
    if (!capabilities?.oauthEnabled) return false;

    let existProviders = 0;
    // biome-ignore-start lint/suspicious/noPrototypeBuiltins: TODO fix
    thirdPartyProviders?.forEach((item) => {
      const key = item.provider as keyof typeof PROVIDERS_DATA;
      if (
        Object.prototype.hasOwnProperty.call(PROVIDERS_DATA, key) &&
        !PROVIDERS_DATA[key]
      )
        return;
      existProviders++;
    });

    // biome-ignore-end lint/suspicious/noPrototypeBuiltins: TODO fix

    return !!existProviders;
  };

  const ssoExists = () => {
    if (capabilities?.ssoUrl) return true;
    return false;
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
        {registrationForm ? (
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
            onChangeCheckbox={onChangeCheckbox}
            isChecked={isChecked}
            onBlurPassword={onBlurPassword}
            onKeyPress={onKeyPress}
            onValidatePassword={onValidatePassword}
            onClickBack={onClickBack}
            onSubmit={onSubmit}
            isStandalone={isStandalone}
            organizationName={organizationName}
          />
        ) : null}
      </div>

      {!emailFromLink && (oauthDataExists() || ssoExists()) ? (
        <>
          <div className="line">
            <Text color={globalColors.gray} className="or-label">
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
      ) : null}
    </RegisterContainer>
  );
};

export default CreateUserForm;
