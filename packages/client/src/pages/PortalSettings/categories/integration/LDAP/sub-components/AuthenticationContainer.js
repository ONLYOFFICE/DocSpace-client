import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";
import { TextInput } from "@docspace/shared/components/text-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

const LOGIN = "login",
  PASSWORD = "password";

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
      <Box className="ldap_authentication">
        <FieldContainer
          isVertical
          labelVisible={true}
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.login}
          labelText={"Login"}
          tooltipContent={t("LdapLoginTooltip")}
          inlineHelpButton
          isRequired
        >
          <TextInput
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
          labelVisible={true}
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.password}
          labelText={t("Common:Password")}
          tooltipContent={t("LdapPasswordTooltip")}
          inlineHelpButton
          isRequired
        >
          <TextInput
            name={PASSWORD}
            type="password"
            hasError={errors.password}
            onChange={onChangeValue}
            value={password}
            isDisabled={!isLdapEnabled || isUIDisabled || !authentication}
            scale
            tabIndex={19}
          />
        </FieldContainer>
      </Box>
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
