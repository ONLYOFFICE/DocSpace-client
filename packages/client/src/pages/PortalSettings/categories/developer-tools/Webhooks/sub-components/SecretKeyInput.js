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

import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { Link } from "@docspace/shared/components/link";

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import { Hint } from "../styled-components";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import { PasswordInput } from "@docspace/shared/components/password-input";
import { inject, observer } from "mobx-react";

import { useTranslation } from "react-i18next";

const SecretKeyWrapper = styled.div`
  .link {
    display: inline-block;
    margin-top: 6px;
    color: ${(props) => props.theme.tooltip.textColor};
  }

  .dotted {
    text-decoration: underline dotted;
  }
`;

const Header = styled.h4`
  margin-top: 21px;
  margin-bottom: 5px;

  font-weight: 600;
  display: flex;
  align-items: center;

  cursor: default;

  .secretKeyHelpButton {
    margin-left: 4px;
  }

  img {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 4px;
          `
        : css`
            margin-left: 4px;
          `}
  }
`;

const SecretKeyInput = (props) => {
  const {
    isResetVisible,
    name,
    value,
    onChange,
    PASSWORD_SETTINGS,
    isPasswordValid,
    setIsPasswordValid,
    setIsResetVisible,
    webhooksGuideUrl,
    passwordInputKey,
    additionalId,
    isDisabled,
  } = props;

  const { t } = useTranslation(["Webhooks"]);

  const secretKeyInputRef = useRef(null);

  const handleInputValidation = (isValid) => {
    setIsPasswordValid(isValid);
  };

  const generatePassword = () => {
    console.log("134");
    secretKeyInputRef.current.onGeneratePassword();
  };

  const handleOnChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  const hideReset = () => {
    generatePassword();
    setIsResetVisible(false);
  };

  useEffect(() => {
    if (!isResetVisible) {
      onChange({
        target: { name, value: secretKeyInputRef.current.value },
      });
    }
  }, [isResetVisible]);

  return (
    <SecretKeyWrapper>
      <Header>
        {t("SecretKey")}
        <HelpButton
          className="secretKeyHelpButton"
          iconName={InfoReactSvgUrl}
          tooltipContent={
            <Text fontSize="12px">
              {t("SecretKeyHint")} <br /> <br />
              <Link
                id="read-more-link"
                type="page"
                isHovered
                fontWeight={600}
                href={webhooksGuideUrl}
                target="_blank"
                className="link"
              >
                {t("ReadMore")}
              </Link>
            </Text>
          }
          place="bottom"
        />
      </Header>
      {isResetVisible && (
        <Hint>
          {t("SecretKeyWarning")} <br />
          <Link
            id="reset-key-link"
            type="action"
            fontWeight={600}
            isHovered={true}
            onClick={hideReset}
            className="link"
          >
            {t("ResetKey")}
          </Link>
        </Hint>
      )}
      <div hidden={isResetVisible}>
        <PasswordInput
          id={additionalId + "-secret-key-input"}
          onChange={handleOnChange}
          inputValue={value}
          inputName={name}
          placeholder={t("EnterSecretKey")}
          onValidateInput={handleInputValidation}
          ref={secretKeyInputRef}
          hasError={!isPasswordValid}
          isDisableTooltip={true}
          inputType="password"
          isFullWidth={true}
          passwordSettings={PASSWORD_SETTINGS}
          key={passwordInputKey}
          isDisabled={isDisabled}
        />
        <Link
          id="generate-link"
          type="action"
          fontWeight={600}
          isHovered={true}
          onClick={isDisabled ? () => {} : generatePassword}
          className="link dotted"
        >
          {t("Generate")}
        </Link>
      </div>
    </SecretKeyWrapper>
  );
};

export default inject(({ settingsStore, webhooksStore }) => {
  const { webhooksGuideUrl } = settingsStore;
  const { PASSWORD_SETTINGS } = webhooksStore;

  return {
    webhooksGuideUrl,
    PASSWORD_SETTINGS,
  };
})(observer(SecretKeyInput));
