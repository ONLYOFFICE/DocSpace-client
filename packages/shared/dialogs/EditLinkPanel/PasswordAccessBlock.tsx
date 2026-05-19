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

import { useRef, type FC } from "react";
import copy from "copy-to-clipboard";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ALLOWED_PASSWORD_CHARACTERS } from "../../constants";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import type { PasswordInputHandle } from "@docspace/ui-kit/components/password-input";

import ToggleBlock from "./ToggleBlock";
import type { PasswordAccessBlockProps } from "./EditLinkPanel.types";
import styles from "./EditLinkPanel.module.scss";

const PasswordAccessBlock: FC<PasswordAccessBlockProps> = ({
  t,
  bodyText,
  onChange,
  isLoading,
  isChecked,
  headerText,
  passwordValue,
  setPasswordValue,
  isPasswordValid,
  setIsPasswordValid,
  passwordSettings,
  isPasswordErrorShow,
  setIsPasswordErrorShow,
}) => {
  const passwordInputRef = useRef<PasswordInputHandle>(null);

  const onGeneratePasswordClick = (event: React.MouseEvent<HTMLDivElement>) => {
    passwordInputRef.current?.onGeneratePassword(event);
  };

  const onCleanClick = (event: React.MouseEvent<Element>) => {
    event.stopPropagation();
    setPasswordValue("");
    setIsPasswordValid(false);
  };

  const onCopyClick = () => {
    const isValid = !!passwordValue.trim();
    if (isValid) {
      copy(passwordValue);
      toastr.success(t("Common:PasswordSuccessfullyCopied"));
    }
  };

  const onChangePassword = (
    _: React.ChangeEvent<HTMLInputElement>,
    value?: string,
  ) => {
    setPasswordValue(value ?? "");
    setIsPasswordValid(true);
    setIsPasswordErrorShow(false);
  };

  // const onBlurPassword = () => {
  //   setIsPasswordErrorShow(true);
  // };

  const onValidatePassword = (isValidate: boolean) => {
    setIsPasswordValid(isValidate);
  };

  const errorMessage = !passwordValue
    ? t("Common:RequiredField")
    : t("Common:IncorrectPassword");

  const hasError = isPasswordErrorShow && !isPasswordValid;

  const tooltipData = {
    tooltipPasswordTitle: `${t("Common:PasswordLimitMessage")}:`,
    tooltipPasswordLength: `${t("Common:PasswordMinimumLength")}: ${
      passwordSettings ? passwordSettings.minLength : 8
    }`,
    tooltipPasswordDigits: `${t("Common:PasswordLimitDigits")}`,
    tooltipPasswordCapital: `${t("Common:PasswordLimitUpperCase")}`,
    tooltipPasswordSpecial: `${t("Common:PasswordLimitSpecialSymbols")}`,
    generatePasswordTitle: t("Common:GeneratePassword"),
    tooltipAllowedCharacters: `${t("Common:AllowedCharacters")}: ${ALLOWED_PASSWORD_CHARACTERS}`,
  };

  return (
    <ToggleBlock
      bodyText={bodyText}
      isLoading={isLoading}
      isChecked={isChecked}
      headerText={headerText}
      onChange={onChange}
      dataTestId="edit_link_panel_password_toggle"
    >
      {isChecked ? (
        <div>
          <div className={styles.passwordBlock}>
            <FieldContainer
              isVertical
              hasError={hasError}
              errorMessage={errorMessage}
              className={styles.passwordBlock}
            >
              <PasswordInput
                id="conversion-password"
                className={styles.passwordInput}
                ref={passwordInputRef}
                isDisabled={isLoading}
                inputValue={passwordValue}
                onChange={onChangePassword}
                passwordSettings={passwordSettings}
                simpleView={false}
                placeholder={t("Common:Password")}
                hasError={!isPasswordValid}
                isAutoFocussed
                // onBlur={onBlurPassword}
                onValidateInput={onValidatePassword}
                isSimulateType
                simulateSymbol="•"
                autoComplete="off"
                testId="edit_link_panel_password_input"
                {...tooltipData}
              />
            </FieldContainer>

            <IconButton
              size={16}
              isDisabled={isLoading}
              iconName={RefreshReactSvgUrl}
              onClick={onGeneratePasswordClick}
              className={styles.generateIcon}
              dataTestId="edit_link_panel_generate_password_button"
            />
          </div>
          <div className={styles.passwordLinks}>
            <Link
              isHovered
              fontSize="13px"
              fontWeight={600}
              type={LinkType.action}
              onClick={onCleanClick}
              dataTestId="edit_link_panel_clean_password_link"
            >
              {t("Common:Clean")}
            </Link>
            <Link
              isHovered
              fontSize="13px"
              fontWeight={600}
              onClick={onCopyClick}
              type={LinkType.action}
              dataTestId="edit_link_panel_copy_password_link"
            >
              {t("Common:CopyPassword")}
            </Link>
          </div>
        </div>
      ) : null}
    </ToggleBlock>
  );
};

export default PasswordAccessBlock;
