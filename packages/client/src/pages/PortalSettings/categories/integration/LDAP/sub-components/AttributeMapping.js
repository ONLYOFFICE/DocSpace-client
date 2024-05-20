import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";

const FIRST_NAME = "firstName",
  SECOND_NAME = "secondName",
  MAIL = "mailName",
  AVATAR = "avatarAttribute",
  QUOTA = "userQuotaLimit";

const AttributeMapping = (props) => {
  const {
    firstName,
    secondName,
    mail,
    avatarAttribute,
    userQuotaLimit,

    setFirstName,
    setSecondName,
    setMail,
    setAvatarAttribute,
    setUserQuotaLimit,

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
      case AVATAR:
        setAvatarAttribute(value);
        break;
      case QUOTA:
        setUserQuotaLimit(value);
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
          <TextInput
            isReadOnly
            isDisabled
            value={`${t("LdapFirstName")} *`}
            scale
          />
          <TextInput
            isReadOnly
            isDisabled
            value={`${t("LdapSecondName")} *`}
            scale
          />
          <TextInput isReadOnly isDisabled value={`${t("LdapMail")} *`} scale />
          <TextInput isReadOnly isDisabled value={t("LdapAvatar")} scale />
          <TextInput isReadOnly isDisabled value={t("LdapQuota")} scale />
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

          <TextInput
            name={AVATAR}
            hasError={errors.avatarAttribute}
            onChange={onChangeValue}
            value={avatarAttribute}
            scale
          />

          <TextInput
            name={QUOTA}
            hasError={errors.userQuotaLimit}
            onChange={onChangeValue}
            value={userQuotaLimit}
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
    setAvatarAttribute,
    setUserQuotaLimit,

    requiredSettings,
    errors,
  } = ldapStore;

  const { firstName, secondName, mail, avatarAttribute, userQuotaLimit } =
    requiredSettings;
  return {
    setFirstName,
    setSecondName,
    setMail,
    setAvatarAttribute,
    setUserQuotaLimit,

    firstName,
    secondName,
    mail,
    avatarAttribute,
    userQuotaLimit,

    errors,
  };
})(observer(AttributeMapping));
