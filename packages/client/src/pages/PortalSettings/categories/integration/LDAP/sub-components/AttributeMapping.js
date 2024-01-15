import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {Box} from "@docspace/shared/components/box";
import {TextInput} from "@docspace/shared/components/text-input";
import {Text} from "@docspace/shared/components/text";
import {HelpButton} from "@docspace/shared/components/help-button";

const FIRST_NAME = "firstName",
  SECOND_NAME = "secondName",
  MAIL = "mailName";

const AttributeMapping = (props) => {
  const {
    firstName,
    secondName,
    mail,

    setFirstName,
    setSecondName,
    setMail,

    errors,
  } = props;

  const { t } = useTranslation("Ldap");

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
    <>
      <div className="ldap_attribute-mapping-text">
        <Text fontWeight={600} fontSize={"14px"}>
          {t("LdapAttributeMapping")}
        </Text>
        <HelpButton tooltipContent={t("LdapAdvancedSettingsTooltip")} />
      </div>
      <Box className="ldap_attribute-mapping">
        <div>
          <TextInput isReadOnly isDisabled value={t("LdapFirstName")} scale />
          <TextInput isReadOnly isDisabled value={t("LdapSecondName")} scale />
          <TextInput isReadOnly isDisabled value={t("LdapMail")} scale />
        </div>
        <div>
          <TextInput
            name={FIRST_NAME}
            hasError={errors.firstName}
            onChange={onChangeValue}
            value={firstName}
            scale
          />

          <TextInput
            name={SECOND_NAME}
            hasError={errors.secondName}
            onChange={onChangeValue}
            value={secondName}
            scale
          />

          <TextInput
            name={MAIL}
            hasError={errors.mail}
            onChange={onChangeValue}
            value={mail}
            scale
          />
        </div>
      </Box>
    </>
  );
};

export default inject(({ ldapStore }) => {
  const {
    setMail,
    setFirstName,
    setSecondName,

    requiredSettings,
    errors,
  } = ldapStore;

  const { firstName, secondName, mail } = requiredSettings;
  return {
    setFirstName,
    setSecondName,
    setMail,

    firstName,
    secondName,
    mail,

    errors,
  };
})(observer(AttributeMapping));
