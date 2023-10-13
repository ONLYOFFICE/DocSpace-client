import React from "react";
import { inject, observer } from "mobx-react";
import ErrorContainer from "@docspace/common/components/ErrorContainer";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./i18n";

const Error401 = ({ setBodyRendered }) => {
  const { t } = useTranslation("Errors");

  React.useEffect(() => {
    setBodyRendered(true);
    return () => {
      setBodyRendered(false);
    };
  }, []);

  return <ErrorContainer headerText={t("Error401Text")} />;
};

export default inject(({ auth }) => {
  return { setBodyRendered: auth.settingsStore.setBodyRendered };
})(
  observer(({ setBodyRendered }) => (
    <I18nextProvider i18n={i18n}>
      <Error401 setBodyRendered={setBodyRendered} />
    </I18nextProvider>
  ))
);
