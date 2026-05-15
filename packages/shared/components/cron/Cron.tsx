/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
import { getConstName } from "@docspace/shared/constants/consts";

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
        <span className={styles.suffix}>{getConstName("UTC")}</span>
      </div>
    </div>
  );
};

export default Cron;
