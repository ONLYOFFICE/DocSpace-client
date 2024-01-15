import React from "react";
import { useTranslation } from "react-i18next";

import TrashWarning from "@docspace/shared/components/Navigation/sub-components/TrashWarning";

const Warning = () => {
  const { t } = useTranslation("Files");

  return <TrashWarning title={t("TrashErasureWarning")} />;
};

export default Warning;
