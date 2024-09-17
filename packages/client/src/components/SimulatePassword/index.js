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

import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import React, { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import PropTypes from "prop-types";
import { InputBlock } from "@docspace/shared/components/input-block";
import { globalColors } from "@docspace/shared/themes/globalColors";

const iconColor = globalColors.gray;

const bulletsFont = "•";

const StyledBody = styled.div`
  width: 100%;

  #conversion-password {
    max-width: ${(props) =>
      props.inputMaxWidth ? props.inputMaxWidth : "382px"};
    width: 100%;
    margin: 0;
  }
  .conversion-input {
    width: 100%;
    text-align: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `right` : `left`};
  }
`;
const SimulatePassword = memo(
  ({
    onChange,
    onKeyDown,
    inputMaxWidth,
    isDisabled = false,
    hasError = false,
    forwardedRef,
    inputValue,
  }) => {
    const [password, setPassword] = useState(inputValue ?? "");
    const [caretPosition, setCaretPosition] = useState();
    const [inputType, setInputType] = useState("password");

    const { t } = useTranslation("UploadPanel");

    const setPasswordSettings = (newPassword) => {
      let newValue;

      const oldPassword = password;
      const oldPasswordLength = oldPassword.length;
      const caretPosition = document.getElementById(
        "conversion-password",
      ).selectionStart;

      setCaretPosition(caretPosition);
      const newCharactersUntilCaret = newPassword.substring(0, caretPosition);

      const unchangedStartCharacters = newCharactersUntilCaret
        .split("")
        .filter((el) => el === bulletsFont).length;

      const unchangedEndingCharacters =
        newPassword.substring(caretPosition).length;
      const addedCharacters = newCharactersUntilCaret.substring(
        unchangedStartCharacters,
      );

      const startingPartOldPassword = oldPassword.substring(
        0,
        unchangedStartCharacters,
      );
      const countOfCharacters = oldPasswordLength - unchangedEndingCharacters;
      const endingPartOldPassword = oldPassword.substring(countOfCharacters);

      newValue = startingPartOldPassword + addedCharacters;

      if (unchangedEndingCharacters) {
        newValue += endingPartOldPassword;
      }

      setPassword(newValue);
    };

    const onChangePassword = (e) => {
      const newPassword = e.target.value;

      inputType == "password"
        ? setPasswordSettings(newPassword)
        : setPassword(newPassword);
    };

    const onKeyDownAction = (e) => {
      if (e.key === "Enter") {
        onKeyDown && onKeyDown(e);
      }
    };

    const onChangeInputType = () => {
      setInputType(inputType === "password" ? "text" : "password");
    };

    const copyPassword = password;
    const bullets = copyPassword.replace(/(.)/g, bulletsFont);

    const iconName =
      inputType === "password" ? EyeOffReactSvgUrl : EyeReactSvgUrl;

    useEffect(() => {
      onChange && onChange(password);

      caretPosition &&
        inputType === "password" &&
        document
          .getElementById("conversion-password")
          .setSelectionRange(caretPosition, caretPosition);
    }, [password]);

    useEffect(() => {
      isDisabled && inputType !== "password" && setInputType("password");
    }, [isDisabled]);

    useEffect(() => {
      if (inputValue !== undefined) {
        setPassword(inputValue);
      }
    }, [inputValue]);

    return (
      <StyledBody
        className="conversation-password-wrapper"
        inputMaxWidth={inputMaxWidth}
      >
        <InputBlock
          id="conversion-password"
          className="conversion-input"
          type="text"
          hasError={hasError}
          isDisabled={isDisabled}
          iconName={iconName}
          value={inputType === "password" ? bullets : password}
          onIconClick={onChangeInputType}
          onChange={onChangePassword}
          onKeyDown={onKeyDownAction}
          scale
          iconSize={16}
          iconColor={iconColor}
          hoverColor={iconColor}
          placeholder={t("UploadPanel:EnterPassword")}
          forwardedRef={forwardedRef}
          isAutoFocussed
        />
      </StyledBody>
    );
  },
);

SimulatePassword.propTypes = {
  inputMaxWidth: PropTypes.string,
  hasError: PropTypes.bool,
  onChange: PropTypes.func,
};
export default SimulatePassword;
