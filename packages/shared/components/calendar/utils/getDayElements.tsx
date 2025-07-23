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

import React from "react";
import moment from "moment";
import classNames from "classnames";

import { getCalendarDays } from "./getCalendarDays";
import styles from "../Calendar.module.scss";

export const getDayElements = (
  observedDate: moment.Moment,
  selectedDate: moment.Moment,
  handleDateChange: (date: moment.Moment) => void,
  minDate: moment.Moment,
  maxDate: moment.Moment,
) => {
  const dateFormat = "YYYY-MM-D";

  const calendarDays = getCalendarDays(observedDate);

  const monthDays = {
    prevMonthDays: calendarDays.prevMonthDays.map((day) => (
      <button
        type="button"
        className={classNames(styles.dateItem, "day", {
          [styles.isSecondary]: true,
          [styles.disabled]:
            moment(day.key, dateFormat) < minDate ||
            moment(day.key, dateFormat) > maxDate,
        })}
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
      >
        {day.value}
      </button>
    )),
    currentMonthDays: calendarDays.currentMonthDays.map((day) => (
      <button
        type="button"
        className={classNames(styles.dateItem, "day", {
          [styles.disabled]:
            moment(day.key, dateFormat) < minDate ||
            moment(day.key, dateFormat) > maxDate,
        })}
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
      >
        {day.value}
      </button>
    )),
    nextMonthDays: calendarDays.nextMonthDays.map((day) => (
      <button
        type="button"
        className={classNames(styles.dateItem, "day", {
          [styles.isSecondary]: true,
          [styles.disabled]:
            moment(day.key, dateFormat) < minDate ||
            moment(day.key, dateFormat) > maxDate,
        })}
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
      >
        {day.value}
      </button>
    )),
  };

  const currentDate = moment().format("YYYY-MM-") + moment().format("D");
  const selectedDateFormated =
    moment(selectedDate).format("YYYY-MM-") + moment(selectedDate).format("D");

  Object.keys(calendarDays).forEach((key) => {
    if (
      key === "prevMonthDays" ||
      key === "currentMonthDays" ||
      key === "nextMonthDays"
    ) {
      calendarDays[key].forEach((day, index) => {
        if (day.key === currentDate) {
          monthDays[key][index] = (
            <button
              type="button"
              className={classNames(styles.dateItem, "day", {
                [styles.isCurrent]: true,
                [styles.disabled]:
                  moment(day.key, dateFormat) < minDate ||
                  moment(day.key, dateFormat) > maxDate,
              })}
              key={day.key}
              onClick={() => handleDateChange(moment(day.key, dateFormat))}
              disabled={
                moment(day.key, dateFormat) < minDate ||
                moment(day.key, dateFormat) > maxDate
              }
            >
              {day.value}
            </button>
          );
        } else if (day.key === selectedDateFormated) {
          monthDays[key][index] = (
            <button
              type="button"
              className={classNames(styles.dateItem, "day", {
                [styles.focused]: true,
                [styles.disabled]:
                  moment(day.key, dateFormat) < minDate ||
                  moment(day.key, dateFormat) > maxDate,
              })}
              key={day.key}
              onClick={() => handleDateChange(moment(day.key, dateFormat))}
              disabled={
                moment(day.key, dateFormat) < minDate ||
                moment(day.key, dateFormat) > maxDate
              }
            >
              {day.value}
            </button>
          );
        }
      });
    }
  });

  return [
    ...monthDays.prevMonthDays,
    ...monthDays.currentMonthDays,
    ...monthDays.nextMonthDays,
  ];
};
