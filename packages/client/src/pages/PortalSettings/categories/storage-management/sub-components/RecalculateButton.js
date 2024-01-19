import { useEffect } from "react";
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
    getIntervalCheckRecalculate,
    clearIntervalCheckRecalculate,
    setIsRecalculating,
    lastRecalculateDate,
  } = props;

  useEffect(() => {
    getIntervalCheckRecalculate();

    return () => {
      clearIntervalCheckRecalculate();
    };
  }, []);

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
        label={"Recalculate"}
        onClick={onRecalculateClick}
        isLoading={isRecalculating}
        isDisabled={isRecalculating}
      />
      <div className="text-container">
        <Text>{t("UpdatingStatistics")}</Text>

        {!isRecalculating && lastRecalculateDate && (
          <Text fontSize="12px" className="last-update">
            {t("LastUpdate", {
              date: moment(lastRecalculateDate).format("l LT"),
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
    clearIntervalCheckRecalculate,
    setIsRecalculating,
    quotaSettings,
  } = storageManagement;

  const { lastRecalculateDate } = quotaSettings;

  return {
    isRecalculating,
    getIntervalCheckRecalculate,
    clearIntervalCheckRecalculate,
    setIsRecalculating,
    lastRecalculateDate,
  };
})(observer(RecalculateButton));
