import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {Box} from "@docspace/shared/components/box";
import {TextInput} from "@docspace/shared/components/text-input";
import {FieldContainer} from "@docspace/shared/components/field-container";
import {ToggleButton} from "@docspace/shared/components/toggle-button";

const LOGIN = "login",
  PASSWORD = "password";

const AuthenticationContainer = (props) => {
  const {
    login,
    password,
    authentication,

    setLogin,
    setPassword,
    setIsAuthentication,

    errors,
  } = props;
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
      <ToggleButton
        label={"Authentication"}
        className="toggle"
        isChecked={authentication}
        onChange={setIsAuthentication}
      />
      <Box className="ldap_authentication">
        <FieldContainer
          isVertical
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
            isDisabled={!authentication}
            scale
          />
        </FieldContainer>

        <FieldContainer
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.password}
          labelText={t("Common:Password")}
          tooltipContent={t("LdapPasswordTooltip")}
          inlineHelpButton
          isRequired
        >
          <TextInput
            name={PASSWORD}
            hasError={errors.password}
            onChange={onChangeValue}
            value={password}
            isDisabled={!authentication}
            scale
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
  } = ldapStore;

  return {
    setLogin,
    setPassword,
    setIsAuthentication,

    login,
    password,
    authentication,

    errors,
  };
})(observer(AuthenticationContainer));
