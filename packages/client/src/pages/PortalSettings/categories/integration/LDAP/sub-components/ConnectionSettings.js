import React from "react";
import { inject, observer } from "mobx-react";

import Box from "@docspace/components/box";
import TextInput from "@docspace/components/text-input";
import FieldContainer from "@docspace/components/field-container";
import Textarea from "@docspace/components/textarea";

const USER_DN = "userDN",
  SERVER = "server",
  LOGIN_ATTRIBUTE = "loginAttribute",
  PORT_NUMBER = "portNumber",
  USER_FILTER = "userFilter";

const FIELD_STYLE = { marginBottom: "12px" },
  LAST_FIELD_STYLE = { marginBottom: "0px" };

const ConnectionSettings = (props) => {
  const {
    t,

    server,
    userDN,
    loginAttribute,
    portNumber,
    userFilter,

    setServer,
    setUserDN,
    setLoginAttribute,
    setPortNumber,
    setUserFilter,

    errors,
  } = props;

  const onChangeValue = (e) => {
    const { value, name, validity } = e.target;

    switch (name) {
      case SERVER:
        setServer(value);
        break;
      case USER_DN:
        setUserDN(value);
        break;
      case LOGIN_ATTRIBUTE:
        setLoginAttribute(value);
        break;
      case PORT_NUMBER:
        if (validity.valid) setPortNumber(value);
        break;
      case USER_FILTER:
        setUserFilter(value);
        break;
    }
  };

  return (
    <Box className="ldap_connection-container">
      <div>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.server}
          labelText={t("LdapServer")}
          isRequired
        >
          <TextInput
            name={SERVER}
            hasError={errors.server}
            onChange={onChangeValue}
            value={server}
            scale
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.userDN}
          labelText={t("LdapUserDN")}
          isRequired
        >
          <TextInput
            name={USER_DN}
            hasError={errors.userDN}
            onChange={onChangeValue}
            value={userDN}
            scale
          />
        </FieldContainer>
        <FieldContainer
          style={LAST_FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.loginAttribute}
          labelText={t("LdapLoginAttribute")}
          isRequired
        >
          <TextInput
            name={LOGIN_ATTRIBUTE}
            hasError={errors.loginAttribute}
            onChange={onChangeValue}
            value={loginAttribute}
            scale
          />
        </FieldContainer>
      </div>
      <div>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.portNumber}
          labelText={t("LdapPortNumber")}
          isRequired
        >
          <TextInput
            pattern="[1-9]*"
            name={PORT_NUMBER}
            hasError={errors.portNumber}
            onChange={onChangeValue}
            value={portNumber}
            scale
          />
        </FieldContainer>

        <FieldContainer
          style={LAST_FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.userFilter}
          labelText={t("LdapUserFilter")}
          isRequired
        >
          <Textarea
            name={USER_FILTER}
            hasError={errors.userFilter}
            onChange={onChangeValue}
            value={userFilter}
            heightTextArea={100}
          />
        </FieldContainer>
      </div>
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const {
    setServer,
    setPortNumber,
    setUserDN,
    setLoginAttribute,
    setUserFilter,

    requiredSettings,
    errors,
  } = ldapStore;

  const {
    portNumber,
    userFilter,
    userDN,
    server,
    loginAttribute,
  } = requiredSettings;
  return {
    setServer,
    setUserDN,
    setLoginAttribute,
    setUserFilter,
    setPortNumber,

    server,
    userDN,
    loginAttribute,
    portNumber,
    userFilter,

    errors,
  };
})(observer(ConnectionSettings));
