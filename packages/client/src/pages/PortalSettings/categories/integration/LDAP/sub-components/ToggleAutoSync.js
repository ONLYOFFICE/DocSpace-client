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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";

const borderProp = { radius: "6px" };

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
            toastr.success(t("Settings:SuccessfullySaveSettingsMessage")),
          )
          .catch((e) => toastr.error(e));
      }
    },
    [toggleCron],
  );

  return (
    <>
      <Box
        backgroundProp={
          theme.client.settings.integration.sso.toggleContentBackground
        }
        borderProp={borderProp}
        displayProp="flex"
        flexDirection="row"
        marginProp={"20px 0 0 0"}
        paddingProp="12px"
      >
        <ToggleButton
          className="toggle"
          isChecked={isCronEnabled}
          onChange={onChangeToggle}
          isDisabled={!isLdapEnabledOnServer || isUIDisabled}
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
            {!isLdapAvailable && (
              <Badge
                backgroundColor="#EDC409"
                label={t("Common:Paid")}
                className="toggle-caption_title_badge"
                isPaidBadge={true}
              />
            )}
          </div>
          <Text
            fontSize="12px"
            fontWeight={400}
            lineHeight="16px"
            className="settings_unavailable"
            noSelect
          >
            {t("LdapAutoSyncToggleDescription")}
          </Text>
        </div>
      </Box>
    </>
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