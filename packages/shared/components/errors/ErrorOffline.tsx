import React from "react";
import { useTranslation } from "react-i18next";

import ErrorContainer from "../error-container/ErrorContainer";

const ErrorOfflineContainer = () => {
  const { t } = useTranslation("Common");

  return <ErrorContainer headerText={t("ErrorOfflineText")} />;
};

export default ErrorOfflineContainer;
