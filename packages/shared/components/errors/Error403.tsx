import React from "react";
import { useTranslation } from "react-i18next";

import ErrorContainer from "../error-container/ErrorContainer";

const Error403 = () => {
  const { t } = useTranslation("Common");

  return <ErrorContainer headerText={t("Error403Text")} />;
};

export default Error403;
