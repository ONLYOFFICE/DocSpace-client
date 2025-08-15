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

import { ChangeEvent, KeyboardEvent, Ref } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { EmailInput, TValidate } from "@docspace/shared/components/email-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { InputSize } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";

type EmailInputFormProps = {
  ref: Ref<HTMLInputElement>;
  isLoading: boolean;
  email: string;
  isEmailErrorShow: boolean;
  emailValid: boolean;
  emailFromLink: string;
  emailErrorText?: string;
  onContinue(): Promise<void>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  onValidate(result: TValidate): undefined;
  onBlur(): void;
  onKeyPress(e: KeyboardEvent<HTMLInputElement>): void;
};

const EmailInputForm = ({
  ref,
  isLoading,
  email,
  isEmailErrorShow,
  emailValid,
  emailErrorText,
  emailFromLink,

  onContinue,
  onChange,
  onValidate,
  onBlur,
  onKeyPress,
}: EmailInputFormProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);

  return (
    <div className="email-container">
      <Text fontSize="16px" fontWeight="600" className="sign-in-subtitle">
        {t("EnterEmailHeader")}
      </Text>
      <FieldContainer
        className="form-field"
        isVertical
        labelVisible={false}
        hasError={isEmailErrorShow ? !emailValid : undefined}
        errorMessage={
          emailErrorText
            ? t(`Common:${emailErrorText}`)
            : t("Common:RequiredField")
        }
        dataTestId="email_field_container"
      >
        <EmailInput
          id="login"
          name="login"
          size={InputSize.large}
          hasError={isEmailErrorShow ? !emailValid : undefined}
          value={email}
          placeholder={t("Common:Email")}
          scale
          isAutoFocussed
          tabIndex={1}
          isDisabled={isLoading || !!emailFromLink}
          autoComplete="username"
          onChange={onChange}
          onBlur={onBlur}
          onValidateInput={onValidate}
          forwardedRef={ref}
          onKeyDown={onKeyPress}
        />
      </FieldContainer>
      <Button
        id="email-continue"
        className="login-button"
        primary
        size={ButtonSize.medium}
        scale
        label={t("Common:ContinueButton")}
        tabIndex={1}
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onContinue}
        testId="email_continue_button"
      />
    </div>
  );
};

export default EmailInputForm;
