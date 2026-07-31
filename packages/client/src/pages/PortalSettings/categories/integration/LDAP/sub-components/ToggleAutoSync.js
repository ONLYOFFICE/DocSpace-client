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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Badge } from "@docspace/ui-kit/components/badge";
import { toastr } from "@docspace/ui-kit/components/toast";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import classnames from "classnames";
import styles from "./ToggleAutoSync.module.scss";

const ToggleAutoSync = ({
  theme,
  toggleCron,
  isLdapAvailable,
  isLdapEnabledOnServer,
  isCronEnabled,
  saveCronLdap,
  isUIDisabled,
}) => {
  const { t } = useTranslation(["Ldap", "Common"]);

  const onChangeToggle = React.useCallback(
    (e) => {
      toggleCron();

      if (!e.target.checked) {
        saveCronLdap()
          .then(() =>
            toastr.success(t("Common:SuccessfullySaveSettingsMessage")),
          )
          .catch((err) => toastr.error(err));
      }
    },
    [toggleCron],
  );

  return (
    <div className={classnames(styles.styledWrapper, { [styles.unavailable]: !isLdapAvailable })}>
      <ToggleButton
        className="toggle"
        isChecked={isCronEnabled}
        onChange={onChangeToggle}
        isDisabled={!isLdapEnabledOnServer || isUIDisabled}
        dataTestId="auto_sync_toggle_button"
      />

      <div className="toggle-caption">
        <div className="toggle-caption_title">
          <Text
            fontWeight={600}
            lineHeight="20px"
            noSelect
            className="settings_unavailable"
          >
            {t("LdapAutoSyncToggle")}
          </Text>
          {!isLdapAvailable ? (
            <Badge
              backgroundColor={
                theme.isBase
                  ? globalColors.favoritesStatus
                  : globalColors.favoriteStatusDark
              }
              label={t("Common:Paid")}
              className="toggle-caption_title_badge"
              isPaidBadge
            />
          ) : null}
        </div>
        <Text
          fontSize="12px"
          fontWeight={400}
          lineHeight="16px"
          className="settings_unavailable"
        >
          {t("LdapAutoSyncToggleDescription")}
        </Text>
      </div>
    </div>
  );
};

export default inject(({ currentQuotaStore, settingsStore, ldapStore }) => {
  const { theme } = settingsStore;
  const {
    toggleCron,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
    isUIDisabled,
    serverSettings,
  } = ldapStore;

  const { isLdapAvailable } = currentQuotaStore;

  return {
    theme,
    toggleCron,
    isLdapAvailable,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
    isUIDisabled,
    isLdapEnabledOnServer: serverSettings.EnableLdapAuthentication,
  };
})(observer(ToggleAutoSync));
