import React from "react";
import { inject, observer } from "mobx-react";

import BetaBadge from "@docspace/shared/components/beta-badge/BetaBadge";
import type BetaBadgeProps from "@docspace/shared/components/beta-badge/BetaBadge.props";

const BetaBadgeWrapper = (props: BetaBadgeProps) => {
  return <BetaBadge {...props} />;
};

export default inject<TStore>(({ settingsStore }) => {
  const {
    forumLink,
    currentColorScheme,
    documentationEmail,
    currentDeviceType,
  } = settingsStore;

  return {
    documentationEmail,
    currentColorScheme,
    currentDeviceType,
    forumLink,
  };
})(observer(BetaBadgeWrapper));
