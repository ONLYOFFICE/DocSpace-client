import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Badge } from "@docspace/shared/components/badge";

const borderProp = { radius: "6px" };

const ToggleLDAP = ({
  theme,
  isLdapEnabled,
  toggleLdap,
  isLdapAvailable,
  save,
}) => {
  const { t } = useTranslation(["Ldap", "Common"]);

  const onChangeToggle = React.useCallback(
    (e) => {
      toggleLdap();

      if (!e.target.checked) {
        save(t, false, true).catch((e) => toastr.error(e));
      }
    },
    [toggleLdap, t, save],
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
        paddingProp="12px"
      >
        <ToggleButton
          className="toggle"
          isChecked={isLdapEnabled}
          onChange={onChangeToggle}
          isDisabled={!isLdapAvailable}
        />

        <div className="toggle-caption">
          <div className="toggle-caption_title">
            <Text
              fontWeight={600}
              lineHeight="20px"
              noSelect
              className="settings_unavailable"
            >
              {t("LdapToggle")}
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
            {t("LdapToggleDescription")}
          </Text>
        </div>
      </Box>

      {/* {confirmationDisableModal && <DisableSsoConfirmationModal />} */}
    </>
  );
};

export default inject(({ settingsStore, ldapStore, currentQuotaStore }) => {
  const { theme } = settingsStore;
  const { enableLdap, isLdapEnabled, toggleLdap, save } = ldapStore;
  const { isLdapAvailable } = currentQuotaStore;

  return {
    theme,
    enableLdap,
    toggleLdap,
    isLdapEnabled,
    save,
    isLdapAvailable,
  };
})(observer(ToggleLDAP));
