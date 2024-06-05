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
  isLdapEnabled,
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
          isDisabled={!isLdapEnabled || isUIDisabled}
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
    enableLdap,
    isLdapEnabled,
    toggleCron,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
    isUIDisabled,
  } = ldapStore;

  const { isLdapAvailable } = currentQuotaStore;

  console.log({
    theme,
    toggleContentBackground:
      theme.client.settings.integration.sso.toggleContentBackground,
  });

  return {
    theme,
    enableLdap,
    toggleCron,
    isLdapAvailable,
    isLdapEnabled,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
    isUIDisabled,
  };
})(observer(ToggleAutoSync));
