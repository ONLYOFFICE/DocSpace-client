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

import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useContext,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { Text } from "@docspace/ui-kit/components/text";
import { createPasswordHash } from "@docspace/shared/utils/common";
import { toastr } from "@docspace/ui-kit/components/toast";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";
import {
  TPasswordHash,
  TPasswordSettings,
} from "@docspace/shared/api/settings/types";
import { ALLOWED_PASSWORD_CHARACTERS } from "@docspace/shared/constants";
import { changePassword } from "@docspace/shared/api/people";
import { ButtonKeys } from "@docspace/shared/enums";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";

type PasswordChangeFormProps = {
  passwordHash: TPasswordHash;
  passwordSettings?: TPasswordSettings;
};

const PasswordChangeForm = ({
  passwordSettings,
  passwordHash,
}: PasswordChangeFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { uid, confirmHeader } = linkData;

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onValidatePassword = (progressScore: boolean) => {
    setPasswordValid(progressScore);
  };

  const onBlurPassword = () => {
    setIsPasswordErrorShow(true);
  };

  const onSubmit = useCallback(async () => {
    setIsLoading(true);

    if (!password.trim()) {
      setPasswordValid(false);
      setIsPasswordErrorShow(true);
    }
    if (!passwordValid || !password.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const hash = createPasswordHash(password, passwordHash);

      await changePassword(uid, hash, confirmHeader);
      setIsLoading(false);

      window.location.replace("/login?passwordChanged=true");
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
      console.error(errorMessage);

      if (errorMessage === "Invalid params") {
        toastr.error(t("Common:SomethingWentWrong"));
      } else {
        // biome-ignore lint/plugin/no-dynamic-i18n-key: errorMessage is a server-provided i18n key; value is not known at compile time
        toastr.error(t(errorMessage));
      }
      setIsLoading(false);
    }
  }, [password, passwordValid, passwordHash, uid, confirmHeader, t]);

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ButtonKeys.enter) {
      onSubmit();
    }
  };

  return (
    <>
      <div className="password-form">
        <Text fontSize="16px" fontWeight="600" className="subtitle">
          {t("PassworResetTitle")}
        </Text>
        <FieldContainer
          isVertical
          labelVisible={false}
          hasError={isPasswordErrorShow ? !passwordValid : undefined}
          errorMessage={t("Common:IncorrectPassword")}
          dataTestId="password_field"
        >
          <PasswordInput
            simpleView={false}
            passwordSettings={passwordSettings}
            id="password"
            inputName="password"
            placeholder={t("Common:Password")}
            inputValue={password}
            hasError={isPasswordErrorShow ? !passwordValid : undefined}
            inputType={InputType.password}
            size={InputSize.large}
            scale
            tabIndex={1}
            autoComplete="current-password"
            onChange={onChangePassword}
            onValidateInput={onValidatePassword}
            onBlur={onBlurPassword}
            onKeyDown={onKeyPress}
            tooltipPasswordTitle={`${t("Common:PasswordLimitMessage")}:`}
            tooltipPasswordLength={`${t(
              "Common:PasswordMinimumLength",
            )}: ${passwordSettings ? passwordSettings.minLength : 8}`}
            tooltipPasswordDigits={`${t("Common:PasswordLimitDigits")}`}
            tooltipPasswordCapital={`${t("Common:PasswordLimitUpperCase")}`}
            tooltipPasswordSpecial={`${t(
              "Common:PasswordLimitSpecialSymbols",
            )}`}
            generatePasswordTitle={t("Common:GeneratePassword")}
            tooltipAllowedCharacters={`${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`}
            isAutoFocussed
          />
        </FieldContainer>
      </div>

      <Button
        primary
        size={ButtonSize.medium}
        scale
        label={t("Common:Create")}
        tabIndex={5}
        onClick={onSubmit}
        isDisabled={isLoading}
        testId="create_password_button"
      />
    </>
  );
};

export default PasswordChangeForm;

