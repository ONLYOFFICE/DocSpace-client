import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { frameCallCommand } from "@docspace/shared/utils/common";
import ErrorContainer from "@docspace/common/components/ErrorContainer";

const RoomErrors = ({ t, tReady, isInvalid }) => {
  const headerText = isInvalid ? t("InvalidLink") : t("Common:ExpiredLink");
  const bodyText = isInvalid ? t("LinkDoesNotExist") : t("LinkHasExpired");

  useEffect(() => {
    frameCallCommand("setIsLoaded");
  }, []);

  return tReady ? (
    <ErrorContainer headerText={headerText} bodyText={bodyText} />
  ) : (
    <></>
  );
};

export default withTranslation(["Errors", "Common"])(RoomErrors);
