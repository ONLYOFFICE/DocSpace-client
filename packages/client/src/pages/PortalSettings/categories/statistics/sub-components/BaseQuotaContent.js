import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "@docspace/components/button";
import { baseUserQuota } from "@docspace/common/api/settings";
import toastr from "@docspace/components/toast/toastr";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const BaseQuotaContentComponent = ({ isEnable }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveQuota = async (value) => {
    const quota = isEnable ? value : -1;
    try {
      timerId = setTimeout(() => setIsLoading(true), 500);
      await baseUserQuota(isEnable, quota);
      toastr.success(t("MemoryQuotaEnabled"));
    } catch (e) {
      toastr.error(e);
    }

    timerId && clearTimeout(timerId);
    timerId = null;
    setIsLoading(false);
  };

  return (
    <>
      {isEnable ? (
        <QuotaForm
          onSaveQuota={onSaveQuota}
          isLoading={isLoading}
          maxInputWidth={"50px"}
        />
      ) : (
        <Button
          size="small"
          primary
          label={t("Common:Save")}
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={onSaveQuota}
        />
      )}
    </>
  );
};

export default BaseQuotaContentComponent;
