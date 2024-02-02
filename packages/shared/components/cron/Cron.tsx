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
import { CronWrapper, Suffix, Wrapper } from "./Cron.styled";

import type { PeriodType, CronProps } from "./Cron.types";

const Cron = ({ value = defaultCronString, setValue, onError }: CronProps) => {
  const { t, i18n } = useTranslation("Common");

  const didMountRef = useRef<boolean>(false);
  const cronRef = useRef<string>(value);
  const errorRef = useRef<Error>();

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
    <CronWrapper data-testid="cron">
      <Period t={t} period={period} setPeriod={setPeriod} />
      {isYear && (
        <Months unit={units[3]} t={t} months={months} setMonths={setMonths} />
      )}
      {(isYear || isMonth) && (
        <MonthDays
          t={t}
          unit={units[2]}
          weekDays={weekDays}
          monthDays={monthDays}
          setMonthDays={setMonthDays}
        />
      )}
      {(isYear || isMonth || isWeek) && (
        <WeekDays
          t={t}
          unit={units[4]}
          isWeek={isWeek}
          monthDays={monthDays}
          weekDays={weekDays}
          setWeekDays={setWeekDays}
        />
      )}
      <Wrapper>
        {!isHour && !isMinute && (
          <Hours unit={units[1]} t={t} hours={hours} setHours={setHours} />
        )}

        {!isMinute && (
          <Minutes
            t={t}
            unit={units[0]}
            period={period}
            minutes={minutes}
            setMinutes={setMinutes}
          />
        )}
        <Suffix>{t("Common:UTC")}</Suffix>
      </Wrapper>
    </CronWrapper>
  );
};

export default Cron;
