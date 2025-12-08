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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import LdapFieldComponent from "./LdapFieldComponent";

const LOGIN = "login";
const PASSWORD = "password";

const AuthenticationContainer = ({
  login,
  password,
  authentication,

  setLogin,
  setPassword,
  setIsAuthentication,

  errors,

  isLdapEnabled,
  isUIDisabled,
}) => {
  const { t } = useTranslation(["Ldap", "Common"]);
  const onChangeValue = (e) => {
    const { value, name } = e.target;

    switch (name) {
      case LOGIN:
        setLogin(value);
        break;
      case PASSWORD:
        setPassword(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="ldap_authentication-header">
        <ToggleButton
          label={t("Common:Authentication")}
          className="toggle"
          isChecked={authentication}
          onChange={setIsAuthentication}
          isDisabled={!isLdapEnabled || isUIDisabled}
        />
        <HelpButton tooltipContent={t("LdapAuthenticationTooltip")} />
      </div>
      <div className="ldap_authentication">
        <FieldContainer
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.login}
          labelText="Login"
          tooltipContent={t("LdapLoginTooltip")}
          inlineHelpButton
          isRequired
        >
          <LdapFieldComponent
            name={LOGIN}
            hasError={errors.login}
            onChange={onChangeValue}
            value={login}
            isDisabled={!isLdapEnabled || isUIDisabled || !authentication}
            scale
            tabIndex={18}
          />
        </FieldContainer>

        <FieldContainer
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.password}
          labelText={t("Common:Password")}
          tooltipContent={t("LdapPasswordTooltip")}
          inlineHelpButton
          isRequired
        >
          <LdapFieldComponent
            isPassword
            name={PASSWORD}
            type="password"
            hasError={errors.password}
            onChange={onChangeValue}
            value={password}
            isDisabled={!isLdapEnabled || isUIDisabled || !authentication}
            scale
            tabIndex={19}
            simpleView
            size={InputSize.base}
            autoComplete="current-password"
            inputType={InputType.password}
            isDisableTooltip
          />
        </FieldContainer>
      </div>
    </>
  );
};

export default inject(({ ldapStore }) => {
  const {
    setLogin,
    setPassword,
    setIsAuthentication,

    authentication,
    login,
    password,
    errors,

    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;

  return {
    setLogin,
    setPassword,
    setIsAuthentication,

    login,
    password,
    authentication,

    errors,

    isLdapEnabled,
    isUIDisabled,
  };
})(observer(AuthenticationContainer));
