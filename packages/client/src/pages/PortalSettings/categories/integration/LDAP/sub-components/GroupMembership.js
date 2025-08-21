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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";

import LdapFieldComponent from "./LdapFieldComponent";

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
            productName: t("Common:ProductName"),
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
