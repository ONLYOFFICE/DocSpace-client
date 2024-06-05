import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ComboBox } from "@docspace/shared/components/combobox";
import { EmployeeType } from "@docspace/shared/enums";

const FIRST_NAME = "firstName",
  SECOND_NAME = "secondName",
  MAIL = "mailName",
  AVATAR = "avatarAttribute",
  QUOTA = "userQuotaLimit";

const FIELD_STYLE = { marginBottom: "0px" };

const AttributeMapping = (props) => {
  const {
    firstName,
    secondName,
    mail,
    avatarAttribute,
    userQuotaLimit,
    userType,

    setFirstName,
    setSecondName,
    setMail,
    setAvatarAttribute,
    setUserQuotaLimit,
    setUserType,

    errors,

    isLdapEnabled,
    isUIDisabled,
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

  const onChangeUserType = (option) => {
    setUserType(option.key);
  };

  const getUserTypes = React.useCallback(() => {
    const options = [
      {
        key: EmployeeType.Collaborator,
        label: t("Common:PowerUser"),
      },
      { key: EmployeeType.User, label: t("Common:RoomAdmin") },
      { key: EmployeeType.Admin, label: t("Common:DocspaceAdmin") },
    ];
    return options;
  }, [t]);

  const userTypes = getUserTypes(t);

  const selectedOption =
    userTypes.find((option) => option.key === userType) || {};

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
          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            errorMessage={t("Common:EmptyFieldError")}
            hasError={errors.firstName}
            labelText={t("LdapFirstName")}
            isRequired
          >
            <TextInput
              name={FIRST_NAME}
              hasError={errors.firstName}
              onChange={onChangeValue}
              value={firstName}
              scale
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={7}
            />
          </FieldContainer>

          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            errorMessage={t("Common:EmptyFieldError")}
            hasError={errors.mail}
            labelText={t("LdapMail")}
            isRequired
          >
            <TextInput
              name={MAIL}
              hasError={errors.mail}
              onChange={onChangeValue}
              value={mail}
              scale
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={9}
            />
          </FieldContainer>

          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            hasError={errors.userQuotaLimit}
            labelText={t("LdapQuota")}
          >
            <TextInput
              name={QUOTA}
              hasError={errors.userQuotaLimit}
              onChange={onChangeValue}
              value={userQuotaLimit}
              scale
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={11}
            />
          </FieldContainer>
        </div>
        <div>
          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            errorMessage={t("Common:EmptyFieldError")}
            hasError={errors.secondName}
            labelText={t("LdapSecondName")}
            isRequired
          >
            <TextInput
              name={SECOND_NAME}
              hasError={errors.secondName}
              onChange={onChangeValue}
              value={secondName}
              scale
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={8}
            />
          </FieldContainer>

          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            hasError={errors.avatarAttribute}
            labelText={t("LdapAvatar")}
          >
            <TextInput
              name={AVATAR}
              hasError={errors.avatarAttribute}
              onChange={onChangeValue}
              value={avatarAttribute}
              scale
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={10}
            />
          </FieldContainer>

          <FieldContainer
            style={FIELD_STYLE}
            isVertical
            labelVisible={true}
            hasError={errors.avatarAttribute}
            labelText={t("LdapUserType")}
            tooltipContent={t("LdapUserTypeTooltip")}
            inlineHelpButton
          >
            <ComboBox
              scaled
              onSelect={onChangeUserType}
              options={userTypes}
              selectedOption={selectedOption}
              displaySelectedOption
              directionY="bottom"
              withoutPadding
              isDisabled={!isLdapEnabled || isUIDisabled}
              tabIndex={12}
            />
          </FieldContainer>
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
    setUserType,

    requiredSettings,
    errors,
    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;

  const {
    firstName,
    secondName,
    mail,
    avatarAttribute,
    userQuotaLimit,
    userType,
  } = requiredSettings;

  return {
    setFirstName,
    setSecondName,
    setMail,
    setAvatarAttribute,
    setUserQuotaLimit,
    setUserType,

    firstName,
    secondName,
    mail,
    avatarAttribute,
    userQuotaLimit,
    userType,

    errors,
    isLdapEnabled,
    isUIDisabled,
  };
})(observer(AttributeMapping));
