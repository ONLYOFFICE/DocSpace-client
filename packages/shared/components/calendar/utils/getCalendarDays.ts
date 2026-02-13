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

import type { DateTime } from "luxon";
import {
  startOf,
  formatDate,
  subtractFromDate,
  addToDate,
  daysInMonth,
} from "../../../utils/date";

export const getCalendarDays = (date: DateTime) => {
  const observedDate = date;

  const prevMonthDays: { key: string; value: string }[] = [];
  const currentMonthDays: { key: string; value: string }[] = [];
  const nextMonthDays: { key: string; value: string }[] = [];
  const maxCalendarDays = 42;

  // Get first day of month, then start of that week (Monday)
  const firstOfMonth = startOf(observedDate, "month")!;
  const firstCalendarMonday = startOf(firstOfMonth, "week")!.day;

  let yearMonthDate = formatDate(observedDate, "yyyy-MM-");

  const currentMonthDaysCount = daysInMonth(observedDate);
  for (let i = 1; i <= currentMonthDaysCount; i += 1) {
    currentMonthDays.push({
      key: yearMonthDate + String(i),
      value: String(i),
    });
  }

  if (firstCalendarMonday !== 1) {
    const prevMonth = subtractFromDate(observedDate, 1, "months")!;
    const prevMonthLength = daysInMonth(prevMonth);

    yearMonthDate = formatDate(prevMonth, "yyyy-MM-");

    for (let i = firstCalendarMonday; i <= prevMonthLength; i += 1) {
      prevMonthDays.push({
        key: yearMonthDate + String(i),
        value: String(i),
      });
    }
  }

  const nextMonth = addToDate(observedDate, 1, "months")!;
  yearMonthDate = formatDate(nextMonth, "yyyy-MM-");

  for (
    let i = 1;
    i <= maxCalendarDays - currentMonthDays.length - prevMonthDays.length;
    i += 1
  ) {
    nextMonthDays.push({
      key: yearMonthDate + String(i),
      value: String(i),
    });
  }

  return { prevMonthDays, currentMonthDays, nextMonthDays };
};
