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

import styles from "../Calendar.module.scss";

export const getMonthElements = (
  months: {
    key: string;
    value: string;
  }[],
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>,
  selectedDate: moment.Moment,
  minDate: moment.Moment,
  maxDate: moment.Moment,
) => {
  const onDateClick = (dateString: string) => {
    setObservedDate(() =>
      moment(
        `${moment(dateString, "YYYY-M").format("YYYY")}-${moment(
          dateString,
          "YYYY-M",
        ).format("MM")}-01`,
        "YYYY-MM-DD",
      ),
    );
    setSelectedScene((prevSelectedScene) => prevSelectedScene - 1);
  };

  const dateFormat = "YYYY-M";

  const monthsElements = months.map((month) => (
    <button
      type="button"
      className={classNames(styles.dateItem, "month", {
        [styles.disabled]:
          moment(month.key, dateFormat).endOf("month") < minDate ||
          moment(month.key, dateFormat).startOf("month") > maxDate,
        [styles.big]: true,
      })}
      key={month.key}
      onClick={() => onDateClick(month.key)}
      disabled={
        moment(month.key, dateFormat).endOf("month") < minDate ||
        moment(month.key, dateFormat).startOf("month") > maxDate
      }
    >
      {month.value}
    </button>
  ));
  for (let i = 12; i < 16; i += 1) {
    monthsElements[i] = (
      <button
        type="button"
        className={classNames(styles.dateItem, "month", {
          [styles.disabled]:
            moment(months[i].key, dateFormat).endOf("month") < minDate ||
            moment(months[i].key, dateFormat).startOf("month") > maxDate,
          [styles.big]: true,
          [styles.isSecondary]: true,
        })}
        key={months[i].key}
        onClick={() => onDateClick(months[i].key)}
        disabled={
          moment(months[i].key, dateFormat).endOf("month") < minDate ||
          moment(months[i].key, dateFormat).startOf("month") > maxDate
        }
      >
        {months[i].value}
      </button>
    );
  }

  const currentDate = `${moment().format("YYYY")}-${moment().format("M")}`;
  const formattedDate = `${moment(selectedDate).format("YYYY")}-${moment(
    selectedDate,
  ).format("M")}`;

  months.forEach((month, index) => {
    if (month.key === currentDate) {
      monthsElements[index] = (
        <button
          type="button"
          className={classNames(styles.dateItem, "month", {
            [styles.disabled]:
              moment(month.key, dateFormat).endOf("month") < minDate,
            [styles.disabled]:
              moment(month.key, dateFormat).startOf("month") > maxDate,
            [styles.big]: true,
            [styles.isCurrent]: true,
          })}
          key={month.key}
          onClick={() => onDateClick(month.key)}
          disabled={
            moment(month.key, dateFormat).endOf("month") < minDate ||
            moment(month.key, dateFormat).startOf("month") > maxDate
          }
        >
          {month.value}
        </button>
      );
    } else if (month.key === formattedDate) {
      monthsElements[index] = (
        <button
          type="button"
          className={classNames(styles.dateItem, "month", {
            [styles.disabled]:
              moment(month.key, dateFormat).endOf("month") < minDate ||
              moment(month.key, dateFormat).startOf("month") > maxDate,
            [styles.big]: true,
            [styles.focused]: true,
          })}
          key={month.key}
          onClick={() => onDateClick(month.key)}
          disabled={
            moment(month.key, dateFormat).endOf("month") < minDate ||
            moment(month.key, dateFormat).startOf("month") > maxDate
          }
        >
          {month.value}
        </button>
      );
    }
  });
  return monthsElements;
};
