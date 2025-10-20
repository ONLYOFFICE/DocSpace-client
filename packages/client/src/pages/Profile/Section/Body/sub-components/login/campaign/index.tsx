import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { TColorScheme } from "@docspace/shared/themes";
import { TwoFactorCampaignBanner } from "@docspace/shared/components/two-factor-campaign";
import { isTablet } from "@docspace/shared/utils";

type LoginCampaignProps = {
  currentColorScheme: TColorScheme;
  tfaEnabled: boolean;
  canManageTfa: boolean;
};

const LoginCampaignComponent = (props: LoginCampaignProps) => {
  const { currentColorScheme, tfaEnabled, canManageTfa } = props;

  const [tablet, setTablet] = useState<boolean>(isTablet());

  useEffect(() => {
    const handleResize = () => setTablet(isTablet());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize as EventListener);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "orientationchange",
        handleResize as EventListener,
      );
    };
  }, []);

  if (!canManageTfa) {
    return null;
  }

  return (
    <TwoFactorCampaignBanner
      style={{ maxWidth: tablet ? "100%" : "660px" }}
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
