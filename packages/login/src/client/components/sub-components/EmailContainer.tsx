import { Trans } from "react-i18next";
import React from "react";

import ArrowIcon from "PUBLIC_DIR/images/arrow.left.react.svg?url";

import { EmailInput } from "@docspace/shared/components/email-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";

interface IEmailContainer {
  emailFromInvitation?: string;
  isEmailErrorShow: boolean;
  errorText?: string;
  identifier: string;
  isLoading: boolean;
  onChangeLogin: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurEmail: () => void;
  onValidateEmail: (res: IEmailValid) => void;
  inputRef: HTMLDivElement;
  t: (key: string) => string;
}

const DEFAULT_TEXT =
  "User <1>{{email}}</1> is already registered in this DocSpace, enter your password or go back to continue with another email.";
const EmailContainer = ({
  emailFromInvitation,
  isEmailErrorShow,
  errorText,
  identifier,
  isLoading,
  inputRef,
  onChangeLogin,
  onBlurEmail,
  onValidateEmail,
  t,
}: IEmailContainer) => {
  if (emailFromInvitation) {
    const onClickBack = () => {
      history.go(-1);
    };

    return (
      <div className="invitation-info-container">
        <div className="sign-in-container">
          <div className="back-title">
            <IconButton size={16} iconName={ArrowIcon} onClick={onClickBack} />
            <Text fontWeight={600} onClick={onClickBack}>
              {t("Common:Back")}
            </Text>
          </div>
          <Text fontWeight={600} fontSize={"16px"}>
            {t("Common:LoginButton")}
          </Text>
        </div>
        <Text>
          <Trans
            t={t}
            i18nKey="UserIsAlreadyRegistered"
            ns="Login"
            defaults={DEFAULT_TEXT}
            values={{
              email: emailFromInvitation,
            }}
            components={{
              1: (
                <Link
                  fontWeight={600}
                  className="login-link"
                  type="page"
                  isHovered={false}
                />
              ),
            }}
          />
        </Text>
      </div>
    );
  }

  return (
    <FieldContainer
      isVertical={true}
      labelVisible={false}
      hasError={isEmailErrorShow}
      errorMessage={
        errorText ? t(`Common:${errorText}`) : t("Common:RequiredField")
      } //TODO: Add wrong login server error
    >
      <EmailInput
        id="login_username"
        name="login"
        type="email"
        hasError={isEmailErrorShow}
        value={identifier}
        placeholder={t("RegistrationEmailWatermark")}
        size="large"
        scale={true}
        isAutoFocussed={true}
        tabIndex={1}
        isDisabled={isLoading}
        autoComplete="username"
        onChange={onChangeLogin}
        onBlur={onBlurEmail}
        onValidateInput={onValidateEmail}
        forwardedRef={inputRef}
      />
    </FieldContainer>
  );
};

export default EmailContainer;
