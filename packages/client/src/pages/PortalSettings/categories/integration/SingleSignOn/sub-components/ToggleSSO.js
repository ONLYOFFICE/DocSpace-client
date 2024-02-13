import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
//import FormStore from "@docspace/studio/src/store/SsoFormStore";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Badge } from "@docspace/shared/components/badge";

const borderProp = { radius: "6px" };

const ToggleSSO = (props) => {
  const { theme, enableSso, ssoToggle, isSSOAvailable, t } = props;

  return (
    <>
      <Text className="intro-text settings_unavailable" noSelect>
        {t("SsoIntro")}
      </Text>

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
          className="enable-sso toggle"
          isChecked={enableSso}
          onChange={() => ssoToggle(t)}
          isDisabled={!isSSOAvailable}
        />

        <div className="toggle-caption">
          <div className="toggle-caption_title">
            <Text
              fontWeight={600}
              lineHeight="20px"
              noSelect
              className="settings_unavailable"
            >
              {t("TurnOnSSO")}
            </Text>
            {!isSSOAvailable && (
              <Badge
                backgroundColor="#EDC409"
                label={t("Common:Paid")}
                fontWeight="700"
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
            {t("TurnOnSSOCaption")}
          </Text>
        </div>
      </Box>
    </>
  );
};

export default inject(({ settingsStore, ssoStore }) => {
  const { theme } = settingsStore;
  const { enableSso, ssoToggle } = ssoStore;

  return {
    theme,
    enableSso,
    ssoToggle,
  };
})(withTranslation(["SingleSignOn"])(observer(ToggleSSO)));
