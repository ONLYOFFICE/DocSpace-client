import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import {Box} from "@docspace/shared/components/box";
//import FormStore from "@docspace/studio/src/store/SsoFormStore";
import {Text} from "@docspace/shared/components/text";
import {ToggleButton} from "@docspace/shared/components/toggle-button";
import {Badge} from "@docspace/shared/components/badge";
//import DisableSsoConfirmationModal from "./DisableSsoConfirmationModal";
//import SSOLoader from "../../sub-components/ssoLoader";
const borderProp = { radius: "6px" };

const ToggleLDAP = (props) => {
  const {
    theme,
    //enableLdap,
    isLdapEnabled,
    toggleLdap,
    isLDAPAvailable,
  } = props;

  const { t } = useTranslation(["Ldap", "Common"]);

  // if (!tReady) {
  //   return <SSOLoader isToggleSSO={true} />;
  // }

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
          onChange={
            toggleLdap
            // isLdapEnabled && enableLdap
            //   ? openConfirmationDisableModal
            //   : ldapToggle
          }
          isDisabled={!isLDAPAvailable}
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
            {t("LdapToggleDescription")}
          </Text>
        </div>
      </Box>

      {/* {confirmationDisableModal && <DisableSsoConfirmationModal />} */}
    </>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { theme } = auth.settingsStore;
  const { enableLdap, isLdapEnabled, toggleLdap } = ldapStore;

  console.log({
    theme,
    toggleContentBackground:
      theme.client.settings.integration.sso.toggleContentBackground,
  });

  return {
    theme,
    enableLdap,
    toggleLdap,
    isLdapEnabled,
  };
})(observer(ToggleLDAP));
