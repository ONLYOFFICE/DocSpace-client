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

import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { RadioButton } from "@docspace/ui-kit/components/radio-button";
import { Text } from "@docspace/ui-kit/components/text";

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
