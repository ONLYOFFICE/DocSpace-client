import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { StyledDiscSpaceUsedComponent } from "./StyledComponent";

import Text from "@docspace/components/text";
import { getConvertedSize } from "@docspace/common/utils";
import Diagram from "./sub-components/Diagram";

const DiskSpaceUsedComponent = (props) => {
  const { t } = useTranslation("Settings");
  const { usedTotalStorageSizeCount, maxTotalSizeByQuota } = props;

  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);
  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);

  console.log("Disk Space render");
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
