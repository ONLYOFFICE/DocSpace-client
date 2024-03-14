import React from "react";
import { i18n } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";

import ErrorContainer from "../error-container/ErrorContainer";

const Error404 = () => {
  const { t, ready } = useTranslation(["Common"]);

  return ready && <ErrorContainer headerText={t("Error404Text")} />;
};

export default Error404;

export const Error404Wrapper = ({ i18nProp }: { i18nProp: i18n }) => {
  if (!i18nProp.language) return null;
  return (
    <I18nextProvider i18n={i18nProp}>
      <Error404 />
    </I18nextProvider>
  );
};
