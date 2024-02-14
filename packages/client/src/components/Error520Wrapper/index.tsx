import { inject, observer } from "mobx-react";

import Error520 from "@docspace/shared/components/errors/Error520";
import type { Error520Props } from "@docspace/shared/components/errors/Errors.types";

const Error520Wrapper = (props: Error520Props) => {
  return <Error520 {...props} />;
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
})(observer(Error520Wrapper));
