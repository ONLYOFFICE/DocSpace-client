import React from "react";
import { useTranslation } from "react-i18next";
//@ts-ignore
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import ClientForm from "../sub-components/ClientForm";

const OAuthCreatePage = () => {
  const { t } = useTranslation(["OAuth"]);

  React.useEffect(() => {
    setDocumentTitle(t("OAuth"));
  }, []);

  return <ClientForm />;
};

export default OAuthCreatePage;
