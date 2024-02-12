import React from "react";
import { inject, observer } from "mobx-react";

import ErrorBoundary from "@docspace/shared/components/error-boundary/ErrorBoundary";
import type { ErrorBoundaryProps } from "@docspace/shared/components/error-boundary/ErrorBoundary.types";

const ErrorBoundaryWrapper = (props: Partial<ErrorBoundaryProps>) => {
  const {
    children,
    currentColorScheme,
    currentDeviceType,
    firebaseHelper,
    onError,
    user,
    version,
    whiteLabelLogoUrls,
  } = props;

  return (
    <ErrorBoundary
      user={user!}
      version={version!}
      children={children}
      firebaseHelper={firebaseHelper!}
      currentDeviceType={currentDeviceType!}
      currentColorScheme={currentColorScheme}
      whiteLabelLogoUrls={whiteLabelLogoUrls!}
      onError={onError}
    />
  );
};

export default inject<any>(({ authStore, settingsStore, userStore }) => {
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
