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

import { ChangeEvent, KeyboardEvent, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";

import { TPasswordSettings } from "@docspace/shared/api/settings/types";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { PasswordInput } from "@docspace/shared/components/password-input";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { ALLOWED_PASSWORD_CHARACTERS } from "@docspace/shared/constants";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { GreetingUserContainer } from "@/components/GreetingContainer";

type RegistrationFormProps = {
  isLoading: boolean;
  email: string;
  emailFromLink: string;
  errorText: string;

  fnameValid: boolean;
  fname: string;
  onChangeFname(e: ChangeEvent<HTMLInputElement>): void;

  sname: string;
  snameValid: boolean;
  onChangeSname(e: ChangeEvent<HTMLInputElement>): void;

  isPasswordErrorShow: boolean;
  passwordValid: boolean;
  password: string;
  passwordSettings?: TPasswordSettings;
  onChangePassword(e: ChangeEvent<HTMLInputElement>): void;
  onBlurPassword(): void;
  onKeyPress(e: KeyboardEvent<HTMLInputElement>): void;
  onValidatePassword(progressScore: boolean): void;

  isChecked: boolean;
  onChangeCheckbox(): void;

  onClickBack(): void;
  onSubmit(): void;

  licenseUrl: string;
  legalTerms: string;

  isStandalone: boolean;
  organizationName: string;
};

const RegistrationForm = ({
  isLoading,
  email,
  emailFromLink,
  errorText,

  fnameValid,
  fname,
  onChangeFname,

  sname,
  snameValid,
  onChangeSname,

  isPasswordErrorShow,
  passwordValid,
  passwordSettings,
  password,
  onChangePassword,
  onBlurPassword,
  onKeyPress,
  onValidatePassword,

  isChecked,
  onChangeCheckbox,

  onClickBack,
  onSubmit,

  licenseUrl,
  legalTerms,
  isStandalone,
  organizationName,
}: RegistrationFormProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);

  const { linkData } = useContext(ConfirmRouteContext);

  const newsletter = t("Newsletter", {
    organizationName,
  });

  const termsConditionsComponent = (
    <div className="terms-conditions">
      <Text fontSize="13px" textAlign="center" lineHeight="20px">
        <Trans
          t={t}
          ns="Confirm"
          i18nKey="TermsAndConditions"
          components={{
            1: (
              <Link
                key="component_key"
                tag="a"
                href={licenseUrl}
                target={LinkTarget.blank}
                fontSize="13px"
                color="accent"
                dataTestId="license_url"
              />
            ),
            2: (
              <Link
                key="second_component_key"
                tag="a"
                href={legalTerms}
                target={LinkTarget.blank}
                fontSize="13px"
                color="accent"
                dataTestId="legal_terms_url"
              />
            ),
          }}
        />
      </Text>
    </div>
  );

  return (
    <div>
      <GreetingUserContainer
        email={email}
        onClickBack={onClickBack}
        type={linkData.type ?? ""}
        emailFromLink={emailFromLink}
      />
      <FieldContainer
        className="form-field"
        isVertical
        labelVisible={false}
        hasError={!fnameValid}
        errorMessage={
          errorText ||
          (fname.trim().length === 0
            ? t("Common:RequiredField")
            : t("Common:IncorrectFirstName"))
        }
        dataTestId="first_name_field_container"
      >
        <TextInput
          id="first-name"
          name="first-name"
          type={InputType.text}
          size={InputSize.large}
          hasError={!fnameValid}
          value={fname}
          placeholder={t("Common:FirstName")}
          scale
          tabIndex={1}
          isDisabled={isLoading}
          onChange={onChangeFname}
          onKeyDown={onKeyPress}
          isAutoFocussed
          testId="first_name_input"
        />
      </FieldContainer>
      <FieldContainer
        className="form-field"
        isVertical
        labelVisible={false}
        hasError={!snameValid}
        errorMessage={
          errorText ||
          (sname.trim().length === 0
            ? t("Common:RequiredField")
            : t("Common:IncorrectLastName"))
        }
        dataTestId="last_name_field_container"
      >
        <TextInput
          id="last-name"
          name="last-name"
          type={InputType.text}
          size={InputSize.large}
          hasError={!snameValid}
          value={sname}
          placeholder={t("Common:LastName")}
          scale
          tabIndex={1}
          isDisabled={isLoading}
          onChange={onChangeSname}
          onKeyDown={onKeyPress}
          testId="last_name_input"
        />
      </FieldContainer>
      <FieldContainer
        className="form-field password-field"
        isVertical
        labelVisible={false}
        hasError={isPasswordErrorShow ? !passwordValid : undefined}
        errorMessage={
          password ? t("Common:IncorrectPassword") : t("Common:RequiredField")
        }
        dataTestId="password_field_container"
      >
        <PasswordInput
          simpleView={false}
          passwordSettings={passwordSettings}
          id="password"
          inputName="password"
          placeholder={t("Common:Password")}
          inputType={InputType.password}
          size={InputSize.large}
          hasError={isPasswordErrorShow ? !passwordValid : undefined}
          inputValue={password}
          scale
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
          tooltipPasswordSpecial={`${t("Common:PasswordLimitSpecialSymbols")}`}
          generatePasswordTitle={t("Common:GeneratePassword")}
          tooltipAllowedCharacters={`${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`}
        />
      </FieldContainer>

      {!isStandalone ? (
        <div className="news-subscription">
          <Checkbox
            className="checkbox-news"
            onChange={onChangeCheckbox}
            isChecked={isChecked}
            isDisabled={isLoading}
            label={newsletter}
            truncate={false}
            dataTestId="news_checkbox"
          />
        </div>
      ) : null}

      {termsConditionsComponent}

      <Button
        id="register-singup"
        className="login-button"
        primary
        size={ButtonSize.medium}
        scale
        label={isLoading ? t("Common:LoadingProcessing") : t("SignUp")}
        tabIndex={1}
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onSubmit}
        testId="signup_button"
      />
    </div>
  );
};

export default RegistrationForm;
