import React from "react";
import { inject, observer } from "mobx-react";
import { TColorScheme } from "@docspace/shared/themes";
import { TwoFactorCampaignBanner } from "@docspace/shared/components/two-factor-campaign";

type LoginCampaignProps = {
  currentColorScheme: TColorScheme;
  tfaEnabled: boolean;
  canManageTfa: boolean;
};

const LoginCampaignComponent = (props: LoginCampaignProps) => {
  const { currentColorScheme, tfaEnabled, canManageTfa } = props;

  if (!canManageTfa) {
    return null;
  }

  return (
    <TwoFactorCampaignBanner
      tfaEnabled={tfaEnabled}
      currentColorScheme={currentColorScheme}
      withCampaign
    />
  );
};

const LoginCampaign = inject(
  ({ tfaStore, settingsStore, userStore }: TStore) => {
    const { currentColorScheme } = settingsStore;
    const { tfaSettings } = tfaStore || {};
    const tfaEnabled = tfaSettings && tfaSettings !== "none";

    const { user } = userStore;
    const canManageTfa = user?.isOwner || user?.isAdmin;

    return {
      currentColorScheme,
      tfaEnabled,
      canManageTfa,
    };
  },
)(observer(LoginCampaignComponent)) as unknown as React.ComponentType;

export default LoginCampaign;
