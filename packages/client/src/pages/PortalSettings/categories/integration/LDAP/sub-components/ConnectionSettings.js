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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import LdapFieldComponent from "./LdapFieldComponent";

const USER_DN = "userDN";
const SERVER = "server";
const LOGIN_ATTRIBUTE = "loginAttribute";
const PORT_NUMBER = "portNumber";
const USER_FILTER = "userFilter";

const FIELD_STYLE = { marginBottom: "12px" };
const LAST_FIELD_STYLE = { marginBottom: "0px" };

const ConnectionSettings = (props) => {
  const {
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

    isLdapEnabled,
    isUIDisabled,
  } = props;
  const { t } = useTranslation(["Ldap", "Common"]);
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
      default:
        break;
    }
  };

  return (
    <div className="ldap_connection-container">
      <div>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.server}
          labelText={t("LdapServer")}
          tooltipContent={t("LdapServerTooltip")}
          inlineHelpButton
          isRequired
          dataTestId="server_field_container"
        >
          <LdapFieldComponent
            name={SERVER}
            hasError={errors.server}
            onChange={onChangeValue}
            value={server}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={3}
            dataTestId="server_field"
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.userDN}
          labelText={t("LdapUserDN")}
          tooltipContent={t("LdapUserDNTooltip")}
          inlineHelpButton
          isRequired
          dataTestId="user_dn_field_container"
        >
          <LdapFieldComponent
            name={USER_DN}
            hasError={errors.userDN}
            onChange={onChangeValue}
            value={userDN}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={5}
            dataTestId="user_dn_field"
          />
        </FieldContainer>
        <FieldContainer
          style={LAST_FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.loginAttribute}
          labelText={t("LdapLoginAttribute")}
          tooltipContent={t("LdapLoginAttributeTooltip")}
          inlineHelpButton
          isRequired
          dataTestId="login_attribute_field_container"
        >
          <LdapFieldComponent
            name={LOGIN_ATTRIBUTE}
            hasError={errors.loginAttribute}
            onChange={onChangeValue}
            value={loginAttribute}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={7}
            dataTestId="login_attribute_field"
          />
        </FieldContainer>
      </div>
      <div>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.portNumber}
          labelText={t("LdapPortNumber")}
          tooltipContent={t("LdapPortNumberTooltip")}
          inlineHelpButton
          isRequired
          dataTestId="port_number_field_container"
        >
          <LdapFieldComponent
            pattern="[0-9]*"
            name={PORT_NUMBER}
            hasError={errors.portNumber}
            onChange={onChangeValue}
            value={portNumber}
            scale
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={4}
            dataTestId="port_number_field"
          />
        </FieldContainer>

        <FieldContainer
          style={LAST_FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.userFilter}
          labelText={t("LdapUserFilter")}
          tooltipContent={t("LdapUserFilterTooltip")}
          inlineHelpButton
          isRequired
          dataTestId="user_filter_field_container"
        >
          <LdapFieldComponent
            isTextArea
            name={USER_FILTER}
            hasError={errors.userFilter}
            onChange={onChangeValue}
            value={userFilter}
            heightTextArea={100}
            isDisabled={!isLdapEnabled || isUIDisabled}
            tabIndex={6}
            dataTestId="user_filter_field"
          />
        </FieldContainer>
      </div>
    </div>
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

    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;

  const { portNumber, userFilter, userDN, server, loginAttribute } =
    requiredSettings;
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

    isLdapEnabled,
    isUIDisabled,
  };
})(observer(ConnectionSettings));
