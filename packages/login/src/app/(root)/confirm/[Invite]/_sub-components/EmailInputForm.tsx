/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import { ChangeEvent, KeyboardEvent, Ref } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { EmailInput, TValidate } from "@docspace/ui-kit/components/email-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";

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
            // biome-ignore lint/plugin/no-dynamic-i18n-key: errorText is a runtime-provided key fragment composed with "Common:" prefix
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
          dataTestId="email-input-invite"
        />
      </FieldContainer>
      <Button
        id="email-continue"
        className="login-continue-button"
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
