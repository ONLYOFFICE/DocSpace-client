/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
// import { ComboBox } from "@docspace/ui-kit/components/combobox";
// import { EmployeeType } from "@docspace/shared/enums";

import AccessSelector from "SRC_DIR/components/AccessSelector";
import { isMobile } from "@docspace/shared/utils";
import { Link } from "@docspace/ui-kit/components/link";
import LdapFieldComponent from "./LdapFieldComponent";
import { getBrandName } from "@docspace/shared/constants/brands";

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
              productName: getBrandName("ProductName"),
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
    const isAdmin = user?.isAdmin || user?.isOwner;

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
