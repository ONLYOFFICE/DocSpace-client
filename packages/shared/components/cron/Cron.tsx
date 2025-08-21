// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useTranslation } from "react-i18next";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import {
  MonthDays,
  Months,
  Period,
  WeekDays,
  Hours,
  Minutes,
} from "./sub-components";

import { getCronStringFromValues, stringToArray } from "./Cron.part";
import { defaultCronString, defaultPeriod } from "./Cron.constants";
import { getPeriodFromCronParts, getUnits } from "./Cron.utils";

import type { PeriodType, CronProps } from "./Cron.types";
import styles from "./Cron.module.scss";

const Cron = ({
  value = defaultCronString,
  setValue,
  onError,
  isDisabled,
  dataTestId,
}: CronProps) => {
  const { t, i18n } = useTranslation("Common");

  const didMountRef = useRef<boolean>(false);
  const cronRef = useRef<string>(value);
  const errorRef = useRef<Error>(undefined);

  const [error, setError] = useState<Error>();
  const [cron, setCron] = useState<string>(value);
  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);

  const [hours, setHours] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [minutes, setMinutes] = useState<number[]>([]);
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [monthDays, setMonthDays] = useState<number[]>([]);

  const handleError = useCallback((exception?: Error) => {
    setError(exception);
  }, []);

  const init = useCallback(() => {
    try {
      const cronParts = stringToArray(value);
      const initPeriod = getPeriodFromCronParts(cronParts);

      const [minutesPart, hoursPart, monthDaysPart, monthsPart, weekDaysPart] =
        cronParts;

      setMinutes(minutesPart);
      setHours(hoursPart);
      setMonthDays(monthDaysPart);
      setMonths(monthsPart);
      setWeekDays(weekDaysPart);

      setPeriod(initPeriod);
    } catch (exception) {
      if (exception instanceof Error) handleError(exception);
    }
  }, [value, handleError]);

  useEffect(() => {
    handleError(undefined); // reset error state
    if (cronRef.current !== value) init();
  }, [value, handleError, init]);

  useEffect(() => {
    try {
      const cornString = getCronStringFromValues(
        period,
        months,
        monthDays,
        weekDays,
        hours,
        minutes,
      );
      setCron(cornString);

      handleError(undefined);
    } catch (exception) {
      if (exception instanceof Error) handleError(exception);
    }
  }, [period, hours, months, minutes, weekDays, monthDays, handleError]);

  useEffect(() => {
    if (!didMountRef.current) {
      init();
      didMountRef.current = true;
    }
  }, [init]);

  useEffect(() => {
    if (cronRef.current !== cron) {
      setValue(cron);
      cronRef.current = cron;
    }
  }, [cron, setValue]);

  useEffect(() => {
    if (error !== errorRef.current) {
      onError?.(error);
      errorRef.current = error;
    }
  }, [error, onError]);

  const { isYear, isMonth, isWeek, isHour, isMinute } = useMemo(() => {
    return {
      isYear: period === "Year",
      isMonth: period === "Month",
      isWeek: period === "Week",
      isHour: period === "Hour",
      isMinute: period === "Minute",
    };
  }, [period]);

  const units = useMemo(() => getUnits(i18n.language), [i18n.language]);

  return (
    <div data-testid={dataTestId ?? "cron"} className={styles.cronWrapper}>
      <Period
        t={t}
        period={period}
        setPeriod={setPeriod}
        isDisabled={isDisabled}
        dataTestId={dataTestId ? `${dataTestId}_period` : undefined}
      />
      {isYear ? (
        <Months
          unit={units[3]}
          t={t}
          months={months}
          setMonths={setMonths}
          isDisabled={isDisabled}
          dataTestId={dataTestId ? `${dataTestId}_months` : undefined}
        />
      ) : null}
      {isYear || isMonth ? (
        <MonthDays
          t={t}
          unit={units[2]}
          weekDays={weekDays}
          monthDays={monthDays}
          setMonthDays={setMonthDays}
          isDisabled={isDisabled}
          dataTestId={dataTestId ? `${dataTestId}_month_days` : undefined}
        />
      ) : null}
      {isYear || isMonth || isWeek ? (
        <WeekDays
          t={t}
          unit={units[4]}
          isWeek={isWeek}
          monthDays={monthDays}
          weekDays={weekDays}
          setWeekDays={setWeekDays}
          isDisabled={isDisabled}
          dataTestId={dataTestId ? `${dataTestId}_week_days` : undefined}
        />
      ) : null}
      <div className={styles.wrapper}>
        {!isHour && !isMinute ? (
          <Hours
            unit={units[1]}
            t={t}
            hours={hours}
            setHours={setHours}
            isDisabled={isDisabled}
            dataTestId={dataTestId ? `${dataTestId}_hours` : undefined}
          />
        ) : null}

        {!isMinute ? (
          <Minutes
            t={t}
            unit={units[0]}
            period={period}
            minutes={minutes}
            setMinutes={setMinutes}
            isDisabled={isDisabled}
            dataTestId={dataTestId ? `${dataTestId}_minutes` : undefined}
          />
        ) : null}
        <span className={styles.suffix}>{t("Common:UTC")}</span>
      </div>
    </div>
  );
};

export default Cron;
