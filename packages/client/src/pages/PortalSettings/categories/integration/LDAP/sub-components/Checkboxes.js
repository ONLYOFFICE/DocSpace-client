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

import { HelpButton } from "@docspace/shared/components/help-button";
import { RadioButton } from "@docspace/shared/components/radio-button";
import { Text } from "@docspace/shared/components/text";

const ConnectionType = Object.freeze({
  Unencrypted: 1,
  StartTls: 2,
  SSL: 3,
});

const Checkboxes = ({
  isTlsEnabled,
  isSslEnabled,
  setIsTlsEnabled,
  setIsSslEnabled,

  isLdapEnabled,
  isUIDisabled,
}) => {
  const { t } = useTranslation("Ldap");

  const onChangeUnencrypted = (e) => {
    const checked = e.target.checked;
    isTlsEnabled && checked && setIsTlsEnabled(false);
    isSslEnabled && checked && setIsSslEnabled(false);
  };

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
    <div className="ldap_checkbox-container">
      <div className="ldap_connection_type-text">
        <Text fontWeight={600} fontSize="14px">
          {t("LdapConnectionType")}
        </Text>
      </div>
      <div className="ldap_radio_buttons_group">
        <div className="ldap_checkbox-header">
          <RadioButton
            id="ldap-connection-type"
            tabIndex={1}
            key={ConnectionType.Unencrypted}
            value={ConnectionType.Unencrypted}
            isChecked={!isTlsEnabled ? !isSslEnabled : null}
            onChange={onChangeUnencrypted}
            isDisabled={!isLdapEnabled || isUIDisabled}
            label={t("LdapConnectionTypeUnencrypted")}
            testId="type_unencrypted_radio_button"
          />
        </div>
        <div className="ldap_checkbox-header">
          <RadioButton
            id="ldap-connection-type"
            tabIndex={2}
            key={ConnectionType.StartTls}
            value={ConnectionType.StartTls}
            isChecked={isTlsEnabled}
            onChange={onChangeTls}
            isDisabled={!isLdapEnabled || isUIDisabled}
            label={t("LdapConnectionTypeStartTls")}
            testId="type_starttls_radio_button"
          />
          <HelpButton
            tooltipContent={t("LdapConnectionTypeStartTlsTooltip")}
            dataTestId="type_starttls_help_button"
          />
        </div>
        <div className="ldap_checkbox-header">
          <RadioButton
            id="ldap-connection-type"
            tabIndex={3}
            key={ConnectionType.SSL}
            value={ConnectionType.SSL}
            isChecked={isSslEnabled}
            onChange={onChangeSsl}
            isDisabled={!isLdapEnabled || isUIDisabled}
            label={t("LdapConnectionTypeSSL")}
            testId="type_ssl_radio_button"
          />
          <HelpButton
            tooltipContent={t("LdapConnectionTypeSSLTooltip")}
            dataTestId="type_ssl_help_button"
          />
        </div>
      </div>
    </div>
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
