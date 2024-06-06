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
