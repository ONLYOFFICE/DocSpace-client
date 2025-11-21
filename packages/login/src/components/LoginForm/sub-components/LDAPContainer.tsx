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

import React from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

interface ILDAPContainer {
  isLdapLoginChecked: boolean;
  ldapDomain: string;
  onChangeLdapLoginCheckbox: VoidFunction;
}

const LDAPContainer = ({
  isLdapLoginChecked,
  ldapDomain,
  onChangeLdapLoginCheckbox,
}: ILDAPContainer) => {
  const { t } = useTranslation(["Login", "Common"]);

  return (
    <div className="login-forgot-wrapper">
      <div className="login-checkbox-wrapper">
        <Checkbox
          id="login_ldap-checkbox"
          className="login-checkbox"
          tabIndex={4}
          isChecked={isLdapLoginChecked}
          onChange={onChangeLdapLoginCheckbox}
          label={t("SignInLDAP", { ldap_domain: ldapDomain })}
          helpButton={
            <HelpButton
              id="login_ldap-hint"
              className="help-button"
              offsetRight={0}
              tooltipContent={
                <Text fontSize="12px">{t("SignInLdapHelper")}</Text>
              }
              tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
              dataTestId="ldap_login_help_button"
            />
          }
          dataTestId="ldap_login_checkbox"
        />
      </div>
    </div>
  );
};

export default LDAPContainer;
