import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Textarea } from "@docspace/shared/components/textarea";

const FIELD_STYLE = { marginBottom: "0px" };

const GROUP_DN = "groupDN",
  GROUP_ATTRIBUTE = "groupAttribute",
  GROUP_NAME_ATTRIBUTE = "groupNameAttribute",
  USER_ATTRIBUTE = "userAttribute",
  GROUP_FILTER = "groupFilter";

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
        />
        <HelpButton tooltipContent={t("LdapGroupMembershipTooltip")} />
      </div>
      <Box className="group_membership-container">
        <FieldContainer
          isVertical
          labelVisible={true}
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupDN")}
          isRequired
          tooltipContent={t("LdapGroupDNTooltip")}
        >
          <TextInput
            className="field-input"
            onChange={onChange}
            name={GROUP_DN}
            value={groupDN}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            scale
            tabIndex={13}
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          labelVisible={true}
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapUserAttribute")}
          isRequired
          tooltipContent={t("LdapGroupUserAttributeTooltip")}
        >
          <TextInput
            className="field-input"
            onChange={onChange}
            name={USER_ATTRIBUTE}
            value={userAttribute}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            scale
            tabIndex={14}
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible={true}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupFilter")}
          tooltipContent={t("LdapGroupFilterTooltip")}
          className="ldap_group-filter"
          inlineHelpButton
          isRequired
        >
          <Textarea
            value={groupFilter}
            onChange={onChange}
            name={GROUP_FILTER}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            heightTextArea={100}
            tabIndex={15}
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          labelVisible={true}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupNameAttribute")}
          isRequired
          tooltipContent={t("LdapGroupNameAttributeTooltip")}
        >
          <TextInput
            className="field-input"
            onChange={onChange}
            name={GROUP_NAME_ATTRIBUTE}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            value={groupNameAttribute}
            scale
            tabIndex={16}
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          labelVisible={true}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupAttribute")}
          isRequired
          tooltipContent={t("LdapGroupAttributeTooltip")}
        >
          <TextInput
            className="field-input"
            onChange={onChange}
            name={GROUP_ATTRIBUTE}
            isDisabled={!isLdapEnabled || isUIDisabled || !groupMembership}
            value={groupAttribute}
            scale
            tabIndex={17}
          />
        </FieldContainer>
      </Box>
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

    isLdapEnabled,
    isUIDisabled,
  };
})(observer(GroupMembership));
