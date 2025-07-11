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

import { useRef } from "react";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import { FieldContainer } from "@docspace/shared/components/field-container";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/shared/components/toast";
import { ALLOWED_PASSWORD_CHARACTERS } from "@docspace/shared/constants";
import { PasswordInput } from "@docspace/shared/components/password-input";
import ToggleBlock from "./ToggleBlock";

const PasswordAccessBlock = (props) => {
  const {
    t,
    isLoading,
    isChecked,
    passwordValue,
    setPasswordValue,
    isPasswordValid,
    setIsPasswordValid,
    passwordSettings,
    isPasswordErrorShow,
    setIsPasswordErrorShow,
  } = props;

  const passwordInputRef = useRef(null);

  const onGeneratePasswordClick = () => {
    passwordInputRef.current.onGeneratePassword();
  };

  const onCleanClick = (e) => {
    e.stopPropagation();
    setPasswordValue("");
    setIsPasswordValid(false);
  };

  const onCopyClick = () => {
    const isValid = !!passwordValue.trim();
    if (isValid) {
      copy(passwordValue);
      toastr.success(t("Files:PasswordSuccessfullyCopied"));
    }
  };

  const onChangePassword = (e, value) => {
    setPasswordValue(value);
    setIsPasswordValid(true);
    setIsPasswordErrorShow(false);
  };

  // const onBlurPassword = () => {
  //   setIsPasswordErrorShow(true);
  // };

  const onValidatePassword = (isValidate) => {
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
    <ToggleBlock {...props}>
      {isChecked ? (
        <div>
          <div className="edit-link_password-block">
            <FieldContainer
              isVertical
              hasError={hasError}
              errorMessage={errorMessage}
              className="edit-link_password-block"
            >
              <PasswordInput
                id="conversion-password"
                className="edit-link_password-input"
                ref={passwordInputRef}
                isDisabled={isLoading}
                inputValue={passwordValue}
                onChange={onChangePassword}
                passwordSettings={passwordSettings}
                simpleView={false}
                placeholder={t("Common:Password")}
                hasError={hasError}
                isAutoFocussed
                // onBlur={onBlurPassword}
                onValidateInput={onValidatePassword}
                isSimulateType
                simulateSymbol="•"
                autoComplete="off"
                {...tooltipData}
              />
            </FieldContainer>

            <IconButton
              className="edit-link_generate-icon"
              size="16"
              isDisabled={isLoading}
              iconName={RefreshReactSvgUrl}
              onClick={onGeneratePasswordClick}
            />
          </div>
          <div className="edit-link_password-links">
            <Link
              fontSize="13px"
              fontWeight={600}
              isHovered
              type="action"
              onClick={onCleanClick}
            >
              {t("Files:Clean")}
            </Link>
            <Link
              fontSize="13px"
              fontWeight={600}
              isHovered
              type="action"
              onClick={onCopyClick}
            >
              {t("Files:CopyPassword")}
            </Link>
          </div>
        </div>
      ) : null}
    </ToggleBlock>
  );
};

export default PasswordAccessBlock;
