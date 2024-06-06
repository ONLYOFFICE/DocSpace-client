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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";

const Checkboxes = ({
  isTlsEnabled,
  isSslEnabled,
  setIsTlsEnabled,
  setIsSslEnabled,

  isLdapEnabled,
  isUIDisabled,
}) => {
  const { t } = useTranslation("Ldap");

  const onChangeTls = (e) => {
    const checked = e.target.checked;
    isSslEnabled && checked && setIsSslEnabled(false);
    setIsTlsEnabled(checked);
  };

  const onChangeSsl = (e) => {
    const checked = e.target.checked;
    isTlsEnabled && checked && setIsTlsEnabled(false);
    setIsSslEnabled(checked);
  };

  return (
    <Box className="ldap_checkbox-container">
      <div className="ldap_checkbox-header">
        <Checkbox
          tabIndex={1}
          className="ldap_checkbox-starttls"
          isDisabled={!isLdapEnabled || isUIDisabled}
          label={t("LdapEnableStartTls")}
          isChecked={isTlsEnabled}
          onChange={onChangeTls}
        />
        <HelpButton tooltipContent={t("LdapEnableStartTlsTooltip")} />
      </div>
      <div className="ldap_checkbox-header">
        <Checkbox
          tabIndex={2}
          className="ldap_checkbox-ssl"
          isDisabled={!isLdapEnabled || isUIDisabled}
          label={t("LdapEnableSSL")}
          isChecked={isSslEnabled}
          onChange={onChangeSsl}
        />
        <HelpButton tooltipContent={t("LdapEnableSSLTooltip")} />
      </div>
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const {
    isTlsEnabled,
    isSslEnabled,
    setIsTlsEnabled,
    setIsSslEnabled,
    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;
  return {
    isTlsEnabled,
    isSslEnabled,
    setIsTlsEnabled,
    setIsSslEnabled,
    isLdapEnabled,
    isUIDisabled,
  };
})(observer(Checkboxes));
