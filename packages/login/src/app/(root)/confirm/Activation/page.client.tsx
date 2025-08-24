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

import { useContext, useState, KeyboardEvent, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { ButtonKeys, EmployeeActivationStatus } from "@docspace/shared/enums";
import {
  TPasswordHash,
  TPasswordSettings,
} from "@docspace/shared/api/settings/types";
import { createPasswordHash } from "@docspace/shared/utils/common";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { ALLOWED_PASSWORD_CHARACTERS } from "@docspace/shared/constants";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { login } from "@docspace/shared/utils/loginUtils";
import {
  changePassword,
  updateActivationStatus,
  updateUser,
} from "@docspace/shared/api/people";

import { TActivateConfirmUser, TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { RegisterContainer } from "@/components/RegisterContainer.styled";
import { GreetingUserContainer } from "@/components/GreetingContainer";

type ActivateUserFormPorps = {
  passwordHash: TPasswordHash;
  defaultPage?: string;
  passwordSettings?: TPasswordSettings;
};

const ActivateUserForm = ({
  passwordSettings,
  passwordHash,
  defaultPage = "/",
}: ActivateUserFormPorps) => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const { confirmLinkResult, linkData } = useContext(ConfirmRouteContext);

  const emailFromLink = confirmLinkResult?.email ? confirmLinkResult.email : "";

  const [name, setName] = useState(linkData.firstname ?? "");
  const [nameValid, setNameValid] = useState(true);
  const [surName, setSurName] = useState(linkData.lastname ?? "");
  const [surNameValid, setSurNameValid] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameValid(true);
  };

  const onChangeSurName = (e: ChangeEvent<HTMLInputElement>) => {
    setSurName(e.target.value);
    setSurNameValid(true);
  };

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onValidatePassword = (progressScore: boolean) => {
    setPasswordValid(progressScore);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const activateConfirmUser = async ({
    personalData,
    loginData,
    key,
    userId,
    activationStatus,
  }: TActivateConfirmUser) => {
    const changedData = {
      id: userId,
      FirstName: personalData.firstname,
      LastName: personalData.lastname,
    };

    const { userName, passwordHash: ph } = loginData;

    await changePassword(userId, ph, key);
    await updateActivationStatus(activationStatus, userId, key);
    await login(userName, ph);
    await updateUser(changedData);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (!name?.trim()) setNameValid(false);
    if (!surName?.trim()) setSurNameValid(false);
    if (!password.trim()) {
      setPasswordValid(false);
      setIsPasswordErrorShow(true);
    }

    if (!nameValid || !surNameValid || !password.trim() || !passwordValid) {
      setIsLoading(false);
      return;
    }

    const hash = createPasswordHash(password, passwordHash);

    const loginData = {
      userName: confirmLinkResult.email ?? "",
      passwordHash: hash,
    };

    const personalData = {
      firstname: name,
      lastname: surName,
    };

    try {
      await activateConfirmUser({
        personalData,
        loginData,
        key: linkData.confirmHeader ?? "",
        userId: linkData.uid ?? "",
        activationStatus: EmployeeActivationStatus.Activated,
      });

      setIsLoading(false);

      window.location.replace(defaultPage);
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

      setIsLoading(false);
      toastr.error(errorMessage);
    }
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ButtonKeys.enter) {
      onSubmit();
    }
  };

  return (
    <RegisterContainer>
      <form className="auth-form-container">
        <GreetingUserContainer
          emailFromLink={emailFromLink}
          email={emailFromLink}
        />

        <FieldContainer
          className="form-field"
          isVertical
          labelVisible={false}
          hasError={!nameValid}
          errorMessage={t("Common:RequiredField")}
          dataTestId="name_field"
        >
          <TextInput
            id="name"
            name="name"
            value={name}
            placeholder={t("Common:FirstName")}
            type={InputType.text}
            size={InputSize.large}
            scale
            tabIndex={1}
            isAutoFocussed
            autoComplete="given-name"
            onChange={onChangeName}
            onKeyDown={onKeyPress}
            testId="name_input"
          />
        </FieldContainer>

        <FieldContainer
          className="form-field"
          isVertical
          labelVisible={false}
          hasError={!surNameValid}
          errorMessage={t("Common:RequiredField")}
          dataTestId="surname_field"
        >
          <TextInput
            id="surname"
            name="surname"
            value={surName}
            placeholder={t("Common:LastName")}
            type={InputType.text}
            size={InputSize.large}
            scale
            tabIndex={2}
            autoComplete="family-name"
            onChange={onChangeSurName}
            onKeyDown={onKeyPress}
            testId="surname_input"
          />
        </FieldContainer>

        <FieldContainer
          className="form-field password-field"
          isVertical
          labelVisible={false}
          hasError={isPasswordErrorShow ? !passwordValid : undefined}
          errorMessage={t("Common:IncorrectPassword")}
          dataTestId="password_field"
        >
          <PasswordInput
            className="confirm-input"
            simpleView={false}
            passwordSettings={passwordSettings}
            id="password"
            inputName="password"
            placeholder={t("Common:Password")}
            inputType={InputType.password}
            inputValue={password}
            hasError={isPasswordErrorShow ? !passwordValid : undefined}
            size={InputSize.large}
            scale
            tabIndex={1}
            autoComplete="current-password"
            onChange={onChangePassword}
            onValidateInput={onValidatePassword}
            onBlur={onBlurPassword}
            onKeyDown={onKeyPress}
            tooltipPasswordTitle={`${t("Common:PasswordLimitMessage")}:`}
            tooltipPasswordLength={`${t("Common:PasswordMinimumLength")}: ${
              passwordSettings ? passwordSettings.minLength : 8
            }`}
            tooltipPasswordDigits={`${t("Common:PasswordLimitDigits")}`}
            tooltipPasswordCapital={`${t("Common:PasswordLimitUpperCase")}`}
            tooltipPasswordSpecial={`${t(
              "Common:PasswordLimitSpecialSymbols",
            )}`}
            generatePasswordTitle={t("Common:GeneratePassword")}
            tooltipAllowedCharacters={`${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`}
            // If need copy credentials use t("EmailAndPasswordCopiedToClipboard")
          />
        </FieldContainer>

        <Button
          scale
          className="confirm-button"
          primary
          size={ButtonSize.medium}
          label={t("LoginRegistryButton")}
          tabIndex={5}
          onClick={onSubmit}
          isDisabled={isLoading}
          testId="signup_button"
        />
      </form>
    </RegisterContainer>
  );
};

export default ActivateUserForm;
