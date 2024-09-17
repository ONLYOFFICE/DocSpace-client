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

import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { TextInput } from "@docspace/shared/components/text-input";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Button } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { inject, observer } from "mobx-react";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import {
  changePassword,
  updateActivationStatus,
  updateUser,
} from "@docspace/shared/api/people";
import { createPasswordHash } from "@docspace/shared/utils/common";
import { toastr } from "@docspace/shared/components/toast";
import { getPasswordErrorMessage } from "@docspace/shared/utils/getPasswordErrorMessage";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

import { StyledPage, StyledHeader } from "./StyledConfirm";
import withLoader from "../withLoader";

import {
  GreetingContainer,
  RegisterContainer,
  StyledCreateUserContent,
} from "./StyledCreateUser";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import GreetingUserContainer from "./GreetingUserContainer";
import { ALLOWED_PASSWORD_CHARACTERS } from "@docspace/shared/constants";

const ActivateUserForm = (props) => {
  const { t, settings, linkData, hashSettings, defaultPage, login } = props;

  const emailFromLink = linkData?.email ? linkData.email : "";
  const [name, setName] = useState(linkData.firstname);
  const [nameValid, setNameValid] = useState(true);
  const [surName, setSurName] = useState(linkData.lastname);
  const [surNameValid, setSurNameValid] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeName = (e) => {
    setName(e.target.value);
    setNameValid(true);
  };

  const onChangeSurName = (e) => {
    setSurName(e.target.value);
    setSurNameValid(true);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onValidatePassword = (res) => {
    setPasswordValid(res);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (!name.trim()) setNameValid(false);
    if (!surName.trim()) setSurNameValid(false);
    if (!password.trim()) {
      setPasswordValid(false);
      setIsPasswordErrorShow(true);
    }

    if (!nameValid || !surNameValid || !password.trim() || !passwordValid) {
      setIsLoading(false);
      return;
    }

    const hash = createPasswordHash(password, hashSettings);

    const loginData = {
      userName: linkData.email,
      passwordHash: hash,
    };

    const personalData = {
      firstname: name,
      lastname: surName,
    };

    try {
      await activateConfirmUser(
        personalData,
        loginData,
        linkData.confirmHeader,
        linkData.uid,
        EmployeeActivationStatus.Activated,
      );

      setIsLoading(false);

      window.location.replace(defaultPage);
    } catch (error) {
      //console.error(error);
      setIsLoading(false);
      toastr.error(error);
    }
  };

  const activateConfirmUser = async (
    personalData,
    loginData,
    key,
    userId,
    activationStatus,
  ) => {
    const changedData = {
      id: userId,
      FirstName: personalData.firstname,
      LastName: personalData.lastname,
    };

    const { userName, passwordHash } = loginData;

    const res1 = await changePassword(userId, loginData.passwordHash, key);
    const res2 = await updateActivationStatus(activationStatus, userId, key);
    const res3 = await login(userName, passwordHash);
    const res4 = await updateUser(changedData);
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <StyledPage>
      <StyledCreateUserContent>
        <StyledHeader>
          <GreetingContainer>
            <PortalLogo className="portal-logo" />
          </GreetingContainer>
        </StyledHeader>

        <FormWrapper>
          <RegisterContainer>
            <form className="auth-form-container">
              <GreetingUserContainer
                emailFromLink={!!emailFromLink}
                email={emailFromLink}
              />

              <FieldContainer
                className="form-field"
                isVertical={true}
                labelVisible={false}
                hasError={!nameValid}
                errorMessage={t("Common:RequiredField")}
              >
                <TextInput
                  id="name"
                  name="name"
                  value={name}
                  placeholder={t("Common:FirstName")}
                  size="large"
                  scale={true}
                  tabIndex={1}
                  isAutoFocussed={true}
                  autoComplete="given-name"
                  onChange={onChangeName}
                  onKeyDown={onKeyPress}
                />
              </FieldContainer>

              <FieldContainer
                className="form-field"
                isVertical={true}
                labelVisible={false}
                hasError={!surNameValid}
                errorMessage={t("Common:RequiredField")}
              >
                <TextInput
                  id="surname"
                  name="surname"
                  value={surName}
                  placeholder={t("Common:LastName")}
                  size="large"
                  scale={true}
                  tabIndex={2}
                  autoComplete="family-name"
                  onChange={onChangeSurName}
                  onKeyDown={onKeyPress}
                />
              </FieldContainer>

              <FieldContainer
                className="form-field password-field"
                isVertical={true}
                labelVisible={false}
                hasError={isPasswordErrorShow && !passwordValid}
                errorMessage={t("Common:IncorrectPassword")}
              >
                <PasswordInput
                  className="confirm-input"
                  simpleView={false}
                  passwordSettings={settings}
                  id="password"
                  inputName="password"
                  placeholder={t("Common:Password")}
                  type="password"
                  inputValue={password}
                  hasError={isPasswordErrorShow && !passwordValid}
                  size="large"
                  scale={true}
                  tabIndex={1}
                  autoComplete="current-password"
                  onChange={onChangePassword}
                  onValidateInput={onValidatePassword}
                  onBlur={onBlurPassword}
                  onKeyDown={onKeyPress}
                  tooltipPasswordTitle={`${t("Common:PasswordLimitMessage")}:`}
                  tooltipPasswordLength={`${t("Common:PasswordMinimumLength")}: ${
                    settings ? settings.minLength : 8
                  }`}
                  tooltipPasswordDigits={`${t("Common:PasswordLimitDigits")}`}
                  tooltipPasswordCapital={`${t("Common:PasswordLimitUpperCase")}`}
                  tooltipPasswordSpecial={`${t(
                    "Common:PasswordLimitSpecialSymbols",
                  )}`}
                  generatePasswordTitle={t("Wizard:GeneratePassword")}
                  tooltipAllowedCharacters={`${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`}
                  // If need copy credentials use t("EmailAndPasswordCopiedToClipboard")
                />
              </FieldContainer>

              <Button
                scale
                className="confirm-button"
                primary
                size="medium"
                label={t("LoginRegistryButton")}
                tabIndex={5}
                onClick={onSubmit}
                isDisabled={isLoading}
              />
            </form>
          </RegisterContainer>
        </FormWrapper>
      </StyledCreateUserContent>
    </StyledPage>
  );
};

export default inject(({ authStore, settingsStore }) => {
  const {
    greetingSettings,
    hashSettings,
    defaultPage,
    passwordSettings,
    theme,
  } = settingsStore;

  return {
    theme,
    settings: passwordSettings,
    hashSettings,
    defaultPage,
    login: authStore.login,
  };
})(
  withTranslation(["Confirm", "Common", "Wizard"])(
    withLoader(observer(ActivateUserForm)),
  ),
);
