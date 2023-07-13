import React from "react";
import { inject, observer } from "mobx-react";

import Box from "@docspace/components/box";
import TextInput from "@docspace/components/text-input";

const FIRST_NAME = "firstName",
  SECOND_NAME = "secondName",
  MAIL = "mailName";

const AttributeMapping = (props) => {
  const {
    t,

    firstName,
    secondName,
    mail,

    setFirstName,
    setSecondName,
    setMail,

    isFirstNameError,
    isSecondNameError,
    isMailError,
  } = props;

  const onChangeValue = (e) => {
    const { value, name } = e.target;

    switch (name) {
      case FIRST_NAME:
        setFirstName(value);
        break;
      case SECOND_NAME:
        setSecondName(value);
        break;
      case MAIL:
        setMail(value);
        break;
    }
  };

  return (
    <Box className="ldap_attribute-mapping">
      <div>
        <TextInput isReadOnly isDisabled value={"First name"} scale />
        <TextInput isReadOnly isDisabled value={"Second name"} scale />
        <TextInput isReadOnly isDisabled value={"Mail"} scale />
      </div>
      <div>
        <TextInput
          name={FIRST_NAME}
          hasError={isFirstNameError}
          onChange={onChangeValue}
          value={firstName}
          scale
        />

        <TextInput
          name={SECOND_NAME}
          hasError={isSecondNameError}
          onChange={onChangeValue}
          value={secondName}
          scale
        />

        <TextInput
          name={MAIL}
          hasError={isMailError}
          onChange={onChangeValue}
          value={mail}
          scale
        />
      </div>
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const {
    setMail,
    setFirstName,
    setSecondName,

    firstName,
    secondName,
    mail,
    errors,
  } = ldapStore;

  const { isFirstNameError, isSecondNameError, isMailError } = errors;

  return {
    setFirstName,
    setSecondName,
    setMail,

    firstName,
    secondName,
    mail,

    isFirstNameError,
    isSecondNameError,
    isMailError,
  };
})(observer(AttributeMapping));
