import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

//@ts-ignore
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import ClientForm from "../sub-components/ClientForm";

const OAuthEditPage = () => {
  const { id } = useParams();

  const { t } = useTranslation(["OAuth"]);

  React.useEffect(() => {
    setDocumentTitle(t("OAuth"));
  }, []);

  return <ClientForm id={id} />;
};

export default OAuthEditPage;
