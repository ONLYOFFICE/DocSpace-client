import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import { getConvertedSize } from "@docspace/common/utils";

import Diagram from "./sub-components/Diagram";
import RecalculateButton from "./sub-components/RecalculateButton";
import { StyledDiscSpaceUsedComponent } from "./StyledComponent";

const DiskSpaceUsedComponent = (props) => {
  const { usedTotalStorageSizeCount, maxTotalSizeByQuota } = props;

  const { t } = useTranslation("Settings");

  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);
  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);

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
      <RecalculateButton />
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
