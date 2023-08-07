import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import { getConvertedSize } from "@docspace/common/utils";
import Button from "@docspace/components/button";
import {
  recalculateQuota,
  checkRecalculateQuota,
} from "@docspace/common/api/settings";
import toastr from "@docspace/components/toast/toastr";

import Diagram from "./sub-components/Diagram";
import { StyledDiscSpaceUsedComponent } from "./StyledComponent";

let isWaitRequest = false;
const DiskSpaceUsedComponent = (props) => {
  const { usedTotalStorageSizeCount, maxTotalSizeByQuota } = props;
  const [isLoading, setIsLoading] = useState(false);
  const intervalIdRef = useRef(null);
  const timerIdRef = useRef(null);
  const { t } = useTranslation("Settings");

  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);
  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);

  const checkRecalculate = () => {
    intervalIdRef.current = setInterval(async () => {
      try {
        timerIdRef.current = setTimeout(() => setIsLoading(true), 300);
        console.log("interval");
        if (isWaitRequest) {
          return;
        }

        isWaitRequest = true;
        const result = await checkRecalculateQuota();

        isWaitRequest = false;

        if (result === false) {
          const timerId = timerIdRef.current;
          const intervalId = intervalIdRef.current;

          clearInterval(intervalId);
          clearTimeout(timerId);

          intervalId = null;
          timerId = null;

          setIsLoading(false);
          return;
        }
      } catch (e) {
        clearInterval(intervalIdRef.current);
        clearTimeout(timerIdRef.current);
        setIsLoading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    checkRecalculate();

    return () => {
      clearInterval(intervalIdRef.current);
      clearTimeout(timerIdRef.current);
    };
  }, []);
  const onRecalculateClick = async () => {
    try {
      await recalculateQuota();

      checkRecalculate();
    } catch (e) {
      toastr.error("Error");
    }
  };

  return (
    <StyledDiscSpaceUsedComponent>
      <Text fontSize="16px" fontWeight={700} className="disk-space_title">
        {t("DiskSpaceUsed")}
      </Text>

      <Text fontWeight={600}>
        {t("TotalStorage", {
          size: totalSize,
        })}
      </Text>
      <Text fontWeight={600}>
        {t("UsedStorage", {
          size: usedSize,
        })}
      </Text>

      <Diagram />
      <Button
        label={"Recalculate"}
        onClick={onRecalculateClick}
        isLoading={isLoading}
        isDisabled={isLoading}
      />
    </StyledDiscSpaceUsedComponent>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { maxTotalSizeByQuota, usedTotalStorageSizeCount } = currentQuotaStore;

  return {
    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,
  };
})(observer(DiskSpaceUsedComponent));
