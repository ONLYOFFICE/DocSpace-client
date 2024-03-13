import moment from "moment";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { recalculateQuota } from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

const RecalculateButton = (props) => {
  const { t } = useTranslation("Settings");

  const {
    isRecalculating,
    setIsRecalculating,
    lastRecalculateDate,
    getIntervalCheckRecalculate,
  } = props;

  const onRecalculateClick = async () => {
    try {
      setIsRecalculating(true);

      await recalculateQuota();

      getIntervalCheckRecalculate();
    } catch (e) {
      toastr.error(e);
    }
  };

  return (
    <div className="button-container">
      <Button
        size="small"
        label={t("Recalculate")}
        onClick={onRecalculateClick}
        isLoading={isRecalculating}
        isDisabled={isRecalculating}
      />
      <div className="text-container">
        <Text>{t("UpdatingStatistics")}</Text>

        {!isRecalculating && lastRecalculateDate && (
          <Text fontSize="12px" className="last-update">
            {t("LastUpdate", {
              date: moment(lastRecalculateDate).format("L LT"),
            })}
          </Text>
        )}
      </div>
    </div>
  );
};

export default inject(({ storageManagement }) => {
  const {
    isRecalculating,

    getIntervalCheckRecalculate,
    setIsRecalculating,
    quotaSettings,
  } = storageManagement;

  const { lastRecalculateDate } = quotaSettings;

  return {
    isRecalculating,
    getIntervalCheckRecalculate,
    setIsRecalculating,
    lastRecalculateDate,
  };
})(observer(RecalculateButton));
