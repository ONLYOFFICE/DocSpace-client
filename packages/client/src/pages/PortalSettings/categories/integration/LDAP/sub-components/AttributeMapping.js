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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
// import { ComboBox } from "@docspace/shared/components/combobox";
// import { EmployeeType } from "@docspace/shared/enums";

import AccessSelector from "SRC_DIR/components/AccessSelector";
import { isMobile } from "@docspace/shared/utils";
import { Link } from "@docspace/shared/components/link";
import LdapFieldComponent from "./LdapFieldComponent";

const FIRST_NAME = "firstName";
const SECOND_NAME = "secondName";
const MAIL = "mail";
const AVATAR = "avatarAttribute";
const QUOTA = "userQuotaLimit";

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

    isDefaultUsersQuotaSet,

    currentColorScheme,

    isOwner,
    isAdmin,
  } = props;

  const { t } = useTranslation("Ldap");

  const navigate = useNavigate();

  const inputsRef = useRef();

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
      default:
        break;
    }
  };

  const onChangeUserType = (option) => {
    setUserType(option.access);
  };

  const goToStarageManagement = () => {
    navigate("/portal-settings/management/disk-space");
  };

  return (
    <>
      <div className="ldap_attribute-mapping-text">
        <Text fontWeight={600} fontSize="14px">
          {t("LdapAttributeMapping")}
        </Text>
        <HelpButton
          dataTestId="attribute_mapping_help_button"
          tooltipContent={t("LdapAdvancedSettingsTooltip")}
        />
      </div>
      <div className="ldap_attribute-mapping">
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.firstName}
          labelText={t("Common:FirstName")}
          isRequired
          dataTestId="first_name_field_container"
        >
          <LdapFieldComponent
            name={FIRST_NAME}
            hasError={errors.firstName}
            onChange={onChangeValue}
            value={firstName}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={7}
            dataTestId="first_name_field"
          />
        </FieldContainer>

        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.secondName}
          labelText={t("LdapSecondName")}
          isRequired
          dataTestId="second_name_field_container"
        >
          <LdapFieldComponent
            name={SECOND_NAME}
            hasError={errors.secondName}
            onChange={onChangeValue}
            value={secondName}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={8}
            dataTestId="second_name_field"
          />
        </FieldContainer>

        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.mail}
          labelText={t("LdapMail")}
          isRequired
          dataTestId="mail_field_container"
        >
          <LdapFieldComponent
            name={MAIL}
            hasError={errors.mail}
            onChange={onChangeValue}
            value={mail}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={9}
            dataTestId="mail_field"
          />
        </FieldContainer>

        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          hasError={errors.avatarAttribute}
          labelText={t("LdapAvatar")}
          dataTestId="avatar_field_container"
        >
          <TextInput
            name={AVATAR}
            hasError={errors.avatarAttribute}
            onChange={onChangeValue}
            value={avatarAttribute}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={10}
            testId="avatar_field"
          />
        </FieldContainer>

        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          hasError={errors.userQuotaLimit}
          labelText={t("LdapQuota")}
          tooltipContent={t("LdapUserQuotaTooltip", {
            contactsName: t("Common:Contacts"),
          })}
          inlineHelpButton
          dataTestId="quota_field_container"
        >
          <TextInput
            name={QUOTA}
            hasError={errors.userQuotaLimit}
            onChange={onChangeValue}
            value={userQuotaLimit}
            scale
            isDisabled={
              !isDefaultUsersQuotaSet || !isLdapEnabled || isUIDisabled
            }
            tabIndex={11}
            testId="quota_limit_input"
          />
          {!isDefaultUsersQuotaSet ? (
            <Text as="span" fontWeight={400} fontSize="12px" lineHeight="16px">
              <Trans
                t={t}
                i18nKey="LdapQuotaInfo"
                ns="Ldap"
                components={[
                  <Link
                    key="link"
                    type="action"
                    color={currentColorScheme.main.accent}
                    onClick={goToStarageManagement}
                    dataTestId="storage_management_link"
                  />,
                ]}
              />
            </Text>
          ) : null}
        </FieldContainer>
      </div>
      <div className="ldap_users-type-box">
        <div className="ldap_users-type-box-title">
          <div className="ldap_users-type-title">
            <Text fontWeight={600} fontSize="15px" lineHeight="16px">
              {t("LdapUsersType")}
            </Text>
          </div>
          <Text fontWeight={400} fontSize="12px" lineHeight="16px">
            {t("LdapUserTypeTooltip", {
              productName: t("Common:ProductName"),
            })}
          </Text>
        </div>
        <div className="access-selector-wrapper">
          <AccessSelector
            className="add-manually-access"
            t={t}
            manualWidth={352}
            roomType={-1}
            defaultAccess={userType}
            onSelectAccess={onChangeUserType}
            containerRef={inputsRef}
            isOwner={isOwner}
            isAdmin={isAdmin}
            isMobileView={isMobile()}
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={12}
            directionX="left"
            scaledOptions={!isMobile()}
          />
          <div />
        </div>
      </div>
    </>
  );
};

export default inject(
  ({ ldapStore, currentQuotaStore, settingsStore, userStore }) => {
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

    const { isDefaultUsersQuotaSet } = currentQuotaStore;

    const { currentColorScheme } = settingsStore;

    const { user } = userStore;
    const isOwner = user?.isOwner;
    const isAdmin = user?.isAdmin;

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

      isDefaultUsersQuotaSet,
      currentColorScheme,

      isOwner,
      isAdmin,
    };
  },
)(observer(AttributeMapping));
