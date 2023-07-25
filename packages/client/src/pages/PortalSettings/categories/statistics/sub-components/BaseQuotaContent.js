import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@docspace/components/button";
import QuotaForm from "../../../../../components/QuotaForm";

const BaseQuotaContentComponent = ({ isEnable }) => {
  const { t } = useTranslation(["Settings", "Common"]);

  return (
    <>
      {isEnable ? (
        <QuotaForm maxInputWidth={"214px"} />
      ) : (
        <Button
          size="small"
          primary
          label={t("Common:Save")}
          // isDisabled={isLoading}
          // isLoading={isLoading}
          // onClick={onSaveQuota}
        />
      )}
    </>
  );
};

export default BaseQuotaContentComponent;
