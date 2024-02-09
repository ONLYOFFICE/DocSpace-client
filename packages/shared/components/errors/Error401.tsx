import React from "react";
import { useTranslation } from "react-i18next";
import ErrorContainer from "../error-container/ErrorContainer";

export const Error401 = () => {
  const { t } = useTranslation("Errors");

  return <ErrorContainer headerText={t("Error401Text")} />;
};
