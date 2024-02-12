import { inject, observer } from "mobx-react";

import ErrorBoundary from "@docspace/shared/components/error-boundary/ErrorBoundary";
import type { ErrorBoundaryProps } from "@docspace/shared/components/error-boundary/ErrorBoundary.types";

const ErrorBoundaryWrapper = (props: ErrorBoundaryProps) => {
  return <ErrorBoundary {...props} />;
};

export default inject<TStore>(({ authStore, settingsStore, userStore }) => {
  const {
    whiteLabelLogoUrls,
    firebaseHelper,
    currentDeviceType,
    currentColorScheme,
  } = settingsStore;

  const { user } = userStore;
  const version = authStore.version;

  return {
    user,
    version,
    firebaseHelper,
    currentDeviceType,
    whiteLabelLogoUrls,
    currentColorScheme,
  };
})(observer(ErrorBoundaryWrapper));
