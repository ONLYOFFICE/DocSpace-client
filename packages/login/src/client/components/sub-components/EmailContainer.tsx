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
