import React from "react";
import { inject, observer } from "mobx-react";
import { TColorScheme } from "@docspace/shared/themes";
import { TwoFactorCampaignBanner } from "@docspace/shared/components/two-factor-campaign";

type LoginCampaignProps = {
  currentColorScheme: TColorScheme;
  tfaEnabled: boolean;
};

const LoginCampaignComponent = (props: LoginCampaignProps) => {
  const { currentColorScheme, tfaEnabled } = props;

  return (
    <TwoFactorCampaignBanner
      tfaEnabled={tfaEnabled}
      currentColorScheme={currentColorScheme}
      withCampaign
    />
  );
};

const LoginCampaign = inject(({ tfaStore, settingsStore }: TStore) => {
  const { currentColorScheme } = settingsStore;
  const { tfaSettings } = tfaStore || {};
  const tfaEnabled = tfaSettings && tfaSettings !== "none";

  return {
    currentColorScheme,
    tfaEnabled,
  };
})(observer(LoginCampaignComponent)) as unknown as React.ComponentType;

export default LoginCampaign;
