import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  recalculateQuota,
  checkRecalculateQuota,
} from "@docspace/common/api/settings";
import toastr from "@docspace/components/toast/toastr";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

let isWaitRequest = false;
const RecalculateButton = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const intervalIdRef = useRef(null);
  const timerIdRef = useRef(null);

  const { t } = useTranslation("Settings");

  const {} = props;

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
  const lastUpdateDate = moment("2023-03-09T17:46:59").format("l LT");

  return (
    <div className="button-container">
      <Button
        size="small"
        label={"Recalculate"}
        onClick={onRecalculateClick}
        isLoading={isLoading}
        isDisabled={isLoading}
      />
      <div className="text-container">
        <Text>{t("UpdatingStatistics")}</Text>
        <Text fontSize="12px" className="last-update">
          {t("LastUpdate", { date: lastUpdateDate })}
        </Text>
      </div>
    </div>
  );
};

export default RecalculateButton;
