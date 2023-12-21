import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ToggleButton from "@docspace/components/toggle-button";
import HelpButton from "@docspace/components/help-button";
import Box from "@docspace/components/box";
import TextInput from "@docspace/components/text-input";
import FieldContainer from "@docspace/components/field-container";
import Textarea from "@docspace/components/textarea";

const FIELD_STYLE = { marginBottom: "0px" };

const GroupMembership = () => {
  const { t } = useTranslation(["Ldap", "Common"]);
  return (
    <>
      <div className="group_membership-header">
        <ToggleButton className="toggle" label={"GroupMembership"} />
        <HelpButton tooltipContent={"LdapGroupMembershipTooltip"} />
      </div>
      <Box className="group_membership-container">
        <FieldContainer
          isVertical
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={"GroupDN"}
          isRequired
          tooltipContent="GroupDNTooltip"
        >
          <TextInput className="field-input" scale />
        </FieldContainer>
        <FieldContainer
          isVertical
          style={FIELD_STYLE}
          errorMessage={t("Common:EmptyFieldError")}
          labelText={"UserAttribute"}
          isRequired
          tooltipContent="UserAttributeTooltip"
        >
          <TextInput
            className="field-input"
            value={"distinguishedName"}
            scale
          />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          labelText={t("LdapGroupFilter")}
          tooltipContent={t("LdapGroupFilterTooltip")}
          className="ldap_group-filter"
          inlineHelpButton
          isRequired
        >
          <Textarea value={"(objectClass=group)"} heightTextArea={100} />
        </FieldContainer>
        <FieldContainer
          style={FIELD_STYLE}
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          labelText={"GroupNameAttribute"}
          isRequired
          tooltipContent="GroupNameAttributeTooltip"
        >
          <TextInput className="field-input" value={"cn"} scale />
        </FieldContainer>
        <FieldContainer
          isVertical
          errorMessage={t("Common:EmptyFieldError")}
          labelText={"GroupAttribute"}
          isRequired
          tooltipContent="GroupAttributeTooltip"
        >
          <TextInput className="field-input" value={"member"} scale />
        </FieldContainer>
      </Box>
    </>
  );
};

export default inject(({ ldapStore }) => {
  //  const {} = ldapStore;

  return {};
})(observer(GroupMembership));
