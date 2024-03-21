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

import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Button } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

import { createPasswordHash } from "@docspace/shared/utils/common";
import { login } from "@docspace/shared/utils/loginUtils";
import { getPasswordErrorMessage } from "@docspace/shared/utils/getPasswordErrorMessage";

import DocspaceLogo from "../../../components/DocspaceLogoWrapper";
import withLoader from "../withLoader";
import { StyledPage, StyledBody, StyledContent } from "./StyledConfirm";

const ChangePasswordForm = (props) => {
  const {
    t,
    greetingTitle,
    settings,
    hashSettings,
    defaultPage,
    changePassword,
    linkData,
    getSettings,
    history,
  } = props;

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!hashSettings) getSettings(true);
  }, []);

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

    if (!password.trim()) {
      setPasswordValid(false);
      setIsPasswordErrorShow(true);
    }
    if (!passwordValid || !password.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const hash = createPasswordHash(password, hashSettings);
      const { email, uid, confirmHeader } = linkData;
      await changePassword(uid, hash, confirmHeader);
      setIsLoading(false);
      toastr.success(t("ChangePasswordSuccess"));

      login(email, hash).then((res) => {
        const isConfirm = typeof res === "string" && res.includes("confirm");
        const redirectPath = sessionStorage.getItem("referenceUrl");
        if (redirectPath && !isConfirm) {
          sessionStorage.removeItem("referenceUrl");
          window.location.href = redirectPath;
          return;
        }

        if (typeof res === "string") window.location.replace(res);
        else window.location.replace("/");
      });
    } catch (error) {
      let errorMessage = "";
      if (typeof error === "object") {
        errorMessage =
          error?.response?.data?.error?.message ||
          error?.statusText ||
          error?.message ||
          "";
      } else {
        errorMessage = error;
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

  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <StyledPage>
      <StyledContent>
        <StyledBody>
          <DocspaceLogo className="docspace-logo" />
          <Text fontSize="23px" fontWeight="700" className="title">
            {greetingTitle}
          </Text>

          <FormWrapper>
            <div className="password-form">
              <Text fontSize="16px" fontWeight="600" className="subtitle">
                {t("PassworResetTitle")}
              </Text>
              <FieldContainer
                isVertical={true}
                labelVisible={false}
                hasError={isPasswordErrorShow && !passwordValid}
                errorMessage={`${t(
                  "Common:PasswordLimitMessage",
                )}: ${getPasswordErrorMessage(t, settings)}`}
              >
                <PasswordInput
                  simpleView={false}
                  passwordSettings={settings}
                  id="password"
                  inputName="password"
                  placeholder={t("Common:Password")}
                  type="password"
                  inputValue={password}
                  hasError={isPasswordErrorShow && !passwordValid}
                  size="large"
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
                  )}: ${settings ? settings.minLength : 8}`}
                  tooltipPasswordDigits={`${t("Common:PasswordLimitDigits")}`}
                  tooltipPasswordCapital={`${t(
                    "Common:PasswordLimitUpperCase",
                  )}`}
                  tooltipPasswordSpecial={`${t(
                    "Common:PasswordLimitSpecialSymbols",
                  )}`}
                  generatePasswordTitle={t("Wizard:GeneratePassword")}
                />
              </FieldContainer>
            </div>

            <Button
              primary
              size="medium"
              scale
              label={t("Common:Create")}
              tabIndex={5}
              onClick={onSubmit}
              isDisabled={isLoading}
            />
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ authStore, settingsStore, setup }) => {
  const {
    greetingSettings,
    hashSettings,
    defaultPage,
    passwordSettings,
    theme,
    getSettings,
  } = settingsStore;
  const { changePassword } = setup;

  return {
    theme,
    settings: passwordSettings,
    greetingTitle: greetingSettings,
    hashSettings,
    defaultPage,
    changePassword,
    isAuthenticated: authStore.isAuthenticated,
    getSettings,
  };
})(
  withTranslation(["Confirm", "Common", "Wizard"])(
    withLoader(observer(ChangePasswordForm)),
  ),
);
