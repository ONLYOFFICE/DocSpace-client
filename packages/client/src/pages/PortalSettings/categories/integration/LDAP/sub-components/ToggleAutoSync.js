import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
//import FormStore from "@docspace/studio/src/store/SsoFormStore";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";
//import DisableSsoConfirmationModal from "./DisableSsoConfirmationModal";
//import SSOLoader from "../../sub-components/ssoLoader";
const borderProp = { radius: "6px" };

const ToggleAutoSync = (props) => {
  const {
    theme,
    toggleCron,
    isLDAPAvailable,
    isLdapEnabled,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
  } = props;

  const { t } = useTranslation(["Ldap", "Common"]);

  // if (!tReady) {
  //   return <SSOLoader isToggleSSO={true} />;
  // }

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
          // isLdapEnabled && enableLdap
          //   ? openConfirmationDisableModal
          //   : ldapToggle

          isDisabled={!isLDAPAvailable || !isLdapEnabled}
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
            {!isLDAPAvailable && (
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

      {/* {confirmationDisableModal && <DisableSsoConfirmationModal />} */}
    </>
  );
};

export default inject(({ settingsStore, ldapStore }) => {
  const { theme } = settingsStore;
  const {
    enableLdap,
    isLdapEnabled,
    toggleCron,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
  } = ldapStore;

  console.log({
    theme,
    toggleContentBackground:
      theme.client.settings.integration.sso.toggleContentBackground,
  });

  return {
    theme,
    enableLdap,
    toggleCron,
    isLdapEnabled,
    isCronEnabled,
    isStatusEmpty,
    saveCronLdap,
  };
})(observer(ToggleAutoSync));
