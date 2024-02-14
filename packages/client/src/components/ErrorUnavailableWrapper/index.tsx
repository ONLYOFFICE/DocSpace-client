import { inject, observer } from "mobx-react";

import ErrorUnavailable from "@docspace/shared/components/errors/ErrorUnavailable";
import type { ErrorUnavailableProps } from "@docspace/shared/components/errors/Errors.types";

const ErrorUnavailableWrapper = (props: ErrorUnavailableProps) => {
  return <ErrorUnavailable {...props} />;
};

export default inject<TStore>(({ settingsStore }) => {
  const { whiteLabelLogoUrls } = settingsStore;

  return {
    whiteLabelLogoUrls,
  };
})(observer(ErrorUnavailableWrapper));
