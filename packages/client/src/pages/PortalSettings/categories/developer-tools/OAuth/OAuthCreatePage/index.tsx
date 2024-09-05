import React from "react";
import { useTranslation } from "react-i18next";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import ClientForm from "../sub-components/ClientForm";

const Component = () => {
  const { t } = useTranslation(["OAuth"]);

  React.useEffect(() => {
    setDocumentTitle(t("OAuth"));
  }, [t]);

  return <ClientForm />;
};

export { Component };
