// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";
import classNames from "classnames";
import type { DateTime } from "luxon";

import styles from "../Calendar.module.scss";
import { now, endOf, createDateTime } from "../../../utils/date";

export const getYearElements = (
  years: string[],
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>,
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>,
  selectedDate: DateTime,
  minDate: DateTime,
  maxDate: DateTime,
) => {
  const onDateClick = (year: string) => {
    const yearNum = parseInt(year, 10);
    setObservedDate((prevObservedDate) =>
      createDateTime(yearNum, prevObservedDate.month, 1),
    );
    setSelectedScene((prevSelectedScene) => prevSelectedScene - 1);
  };

  const isDisabled = (year: string) => {
    const yearNum = parseInt(year, 10);
    const yearStart = createDateTime(yearNum, 1, 1);
    const yearEnd = endOf(createDateTime(yearNum, 12, 1), "month")!;
    return yearEnd < minDate || yearStart > maxDate;
  };

  const yearElements = years.map((year) => (
    <button
      type="button"
      className={classNames(styles.dateItem, "year", {
        [styles.disabled]: isDisabled(year),
        [styles.big]: true,
        [styles.isSecondary]: true,
      })}
      key={year}
      onClick={() => onDateClick(year)}
      disabled={isDisabled(year)}
    >
      {year}
    </button>
  ));

  for (let i = 1; i < 11; i += 1) {
    yearElements[i] = (
      <button
        type="button"
        className={classNames(styles.dateItem, "year", {
          [styles.disabled]: isDisabled(years[i]),
          [styles.big]: true,
        })}
        key={years[i]}
        onClick={() => onDateClick(years[i])}
        disabled={isDisabled(years[i])}
      >
        {years[i]}
      </button>
    );
  }

  const currentYear = String(now().year);
  const selectedYear = String(selectedDate.year);
  const currentYearIndex = years.indexOf(currentYear);
  const selectedYearIndex = years.indexOf(selectedYear);

  if (selectedYearIndex !== -1) {
    yearElements[selectedYearIndex] = (
      <button
        type="button"
        className={classNames(styles.dateItem, "year", {
          [styles.disabled]: isDisabled(years[selectedYearIndex]),
          [styles.big]: true,
          [styles.focused]: true,
        })}
        key={years[selectedYearIndex]}
        onClick={() => onDateClick(years[selectedYearIndex])}
        disabled={isDisabled(years[selectedYearIndex])}
      >
        {years[selectedYearIndex]}
      </button>
    );
  }
  if (currentYearIndex !== -1) {
    yearElements[currentYearIndex] = (
      <button
        type="button"
        className={classNames(styles.dateItem, "year", {
          [styles.disabled]: isDisabled(years[currentYearIndex]),
          [styles.big]: true,
          [styles.isCurrent]: true,
        })}
        key={years[currentYearIndex]}
        onClick={() => onDateClick(years[currentYearIndex])}
        disabled={isDisabled(years[currentYearIndex])}
      >
        {years[currentYearIndex]}
      </button>
    );
  }

  return yearElements;
};
