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
            color="#333333"
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

export default inject(({ auth, webhooksStore }) => {
  const { webhooksGuideUrl } = auth.settingsStore;
  const { PASSWORD_SETTINGS } = webhooksStore;

  return {
    webhooksGuideUrl,
    PASSWORD_SETTINGS,
  };
})(observer(SecretKeyInput));
