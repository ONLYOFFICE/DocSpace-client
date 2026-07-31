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

import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import LdapFieldComponent from "./LdapFieldComponent";
import { getBrandName } from "@docspace/shared/constants/brands";

const FIELD_STYLE = { marginBottom: "0px" };

const GROUP_DN = "groupDN";
const GROUP_ATTRIBUTE = "groupAttribute";
const GROUP_NAME_ATTRIBUTE = "groupNameAttribute";
const USER_ATTRIBUTE = "userAttribute";
const GROUP_FILTER = "groupFilter";

const GroupMembership = (props) => {
  const {
    groupMembership,
    setIsGroupMembership,
    groupDN,
    userAttribute,
    groupFilter,
    groupAttribute,
    groupNameAttribute,
    setGroupDN,
    setUserAttribute,
    setGroupFilter,
    setGroupAttribute,
    setGroupNameAttribute,

    errors,

    isLdapEnabled,
    isUIDisabled,
  } = props;
  const { t } = useTranslation(["Ldap", "Common"]);

  const onChange = (e) => {
    const { value, name } = e.target;

    switch (name) {
      case GROUP_DN:
        setGroupDN(value);
        break;
      case USER_ATTRIBUTE:
        setUserAttribute(value);
        break;
      case GROUP_FILTER:
        setGroupFilter(value);
        break;
      case GROUP_NAME_ATTRIBUTE:
        setGroupNameAttribute(value);
        break;
      case GROUP_ATTRIBUTE:
        setGroupAttribute(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="group_membership-header">
        <ToggleButton
          className="toggle"
          isChecked={groupMembership}
          onChange={setIsGroupMembership}
          label={t("LdapGroupMembership")}
          isDisabled={!isLdapEnabled || isUIDisabled}
          dataTestId="group_membership_toggle_button"
        />
        <HelpButton
          tooltipContent={t("LdapGroupMembershipTooltip", {
            productName: getBrandName("ProductName"),
          })}
          dataTestId="group_membership_help_button"
        />
      </div>
      <div className="group_membership-container">
        <FieldContainer
          isVertical
          labelVisible
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupDN")}
          isRequired
          hasError={errors.groupDN}
          tooltipContent={t("LdapGroupDNTooltip")}
          dataTestId="group_dn_field_container"
        >
          <LdapFieldComponent
            className="field-input"
            onChange={onChange}
            name={GROUP_DN}
            value={groupDN}
            hasError={errors.groupDN}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            scale
            tabIndex={13}
            dataTestId="group_dn_field"
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          labelVisible
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.userAttribute}
          labelText={t("LdapUserAttribute")}
          isRequired
          tooltipContent={t("LdapGroupUserAttributeTooltip")}
          dataTestId="user_attribute_field_container"
        >
          <LdapFieldComponent
            className="field-input"
            onChange={onChange}
            name={USER_ATTRIBUTE}
            value={userAttribute}
            hasError={errors.userAttribute}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            scale
            tabIndex={14}
            dataTestId="user_attribute_field"
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupFilter")}
          hasError={errors.groupFilter}
          tooltipContent={t("LdapGroupFilterTooltip")}
          className="ldap_group-filter"
          inlineHelpButton
          isRequired
          dataTestId="group_filter_field_container"
        >
          <LdapFieldComponent
            isTextArea
            value={groupFilter}
            onChange={onChange}
            hasError={errors.groupFilter}
            name={GROUP_FILTER}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            heightTextArea={100}
            tabIndex={15}
            dataTestId="group_filter_field"
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.groupNameAttribute}
          labelText={t("LdapGroupNameAttribute")}
          isRequired
          tooltipContent={t("LdapGroupNameAttributeTooltip")}
          dataTestId="group_name_attribute_field_container"
        >
          <LdapFieldComponent
            className="field-input"
            onChange={onChange}
            name={GROUP_NAME_ATTRIBUTE}
            hasError={errors.groupNameAttribute}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            value={groupNameAttribute}
            scale
            tabIndex={16}
            dataTestId="group_name_attribute_field"
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          labelVisible
          errorMessage={t("Common:EmptyFieldError")}
          hasError={errors.groupAttribute}
          labelText={t("LdapGroupAttribute")}
          isRequired
          tooltipContent={t("LdapGroupAttributeTooltip")}
          dataTestId="group_attribute_field_container"
        >
          <LdapFieldComponent
            className="field-input"
            onChange={onChange}
            name={GROUP_ATTRIBUTE}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            value={groupAttribute}
            hasError={errors.groupAttribute}
            scale
            tabIndex={17}
            dataTestId="group_attribute_field"
          />
        </FieldContainer>
      </div>
    </>
  );
};

export default inject(({ ldapStore }) => {
  const {
    groupMembership,
    setIsGroupMembership,
    groupDN,
    userAttribute,
    groupFilter,
    groupAttribute,
    groupNameAttribute,
    setGroupDN,
    setUserAttribute,
    setGroupFilter,
    setGroupAttribute,
    setGroupNameAttribute,

    errors,

    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;

  return {
    groupMembership,
    setIsGroupMembership,
    groupDN,
    userAttribute,
    groupFilter,
    groupAttribute,
    groupNameAttribute,
    setGroupDN,
    setUserAttribute,
    setGroupFilter,
    setGroupAttribute,
    setGroupNameAttribute,

    errors,

    isLdapEnabled,
    isUIDisabled,
  };
})(observer(GroupMembership));
