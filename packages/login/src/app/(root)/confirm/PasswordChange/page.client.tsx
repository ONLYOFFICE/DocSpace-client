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

import { ChangeEvent, KeyboardEvent, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Text } from "@docspace/shared/components/text";
import { createPasswordHash } from "@docspace/shared/utils/common";
import { toastr } from "@docspace/shared/components/toast";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
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

  const onSubmit = async () => {
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
        toastr.error(t(`${errorMessage}`));
      }
      setIsLoading(false);
    }
  };

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
