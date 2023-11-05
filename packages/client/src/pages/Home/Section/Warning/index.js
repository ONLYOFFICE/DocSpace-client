import React from "react";
import { useTranslation } from "react-i18next";

import TrashWarning from "@docspace/common/components/Navigation/sub-components/trash-warning";

const Warning = () => {
  const { t } = useTranslation("Files");

  return <TrashWarning title={t("TrashErasureWarning")} />;
};

export default Warning;
