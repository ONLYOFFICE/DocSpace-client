// (c) Copyright Ascensio System SIA 2009-2024
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

import { StyledDateItemTheme } from "../Calendar.styled";

export const getYearElements = (
  years: string[],
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>,
  selectedDate: moment.Moment,
  minDate: moment.Moment,
  maxDate: moment.Moment,
  isMobile: boolean,
) => {
  const onDateClick = (year: string) => {
    setObservedDate((prevObservedDate) =>
      moment(
        `${moment(year, "YYYY").format("YYYY")}-${prevObservedDate.format(
          "MM-DD",
        )}`,
        "YYYY-MM-DD",
      ),
    );
    setSelectedScene((prevSelectedScene) => prevSelectedScene - 1);
  };

  const yearElements = years.map((year) => (
    <StyledDateItemTheme
      className="year"
      isSecondary
      big
      focused={false}
      key={year}
      onClick={() => onDateClick(year)}
      disabled={
        moment(year).endOf("year").endOf("month") < minDate ||
        moment(year) > maxDate
      }
      isMobile={isMobile}
    >
      {year}
    </StyledDateItemTheme>
  ));

  for (let i = 1; i < 11; i += 1) {
    yearElements[i] = (
      <StyledDateItemTheme
        className="year"
        big
        focused={false}
        key={years[i]}
        onClick={() => onDateClick(years[i])}
        disabled={
          moment(years[i]).endOf("year").endOf("month") < minDate ||
          moment(years[i]) > maxDate
        }
        isMobile={isMobile}
      >
        {years[i]}
      </StyledDateItemTheme>
    );
  }

  const currentYearIndex = years.indexOf(moment().format("YYYY"));
  const selectedYearIndex = years.indexOf(moment(selectedDate).format("YYYY"));
  if (selectedYearIndex !== -1) {
    yearElements[selectedYearIndex] = (
      <StyledDateItemTheme
        className="year"
        big
        focused
        key={years[selectedYearIndex]}
        onClick={() => onDateClick(years[selectedYearIndex])}
        disabled={
          moment(years[selectedYearIndex]).endOf("year").endOf("month") <
            minDate || moment(years[selectedYearIndex]) > maxDate
        }
        isMobile={isMobile}
      >
        {years[selectedYearIndex]}
      </StyledDateItemTheme>
    );
  }
  if (currentYearIndex !== -1) {
    yearElements[currentYearIndex] = (
      <StyledDateItemTheme
        className="year"
        isCurrent
        big
        focused={false}
        key={years[currentYearIndex]}
        onClick={() => onDateClick(years[currentYearIndex])}
        disabled={
          moment(years[currentYearIndex]).endOf("year").endOf("month") <
            minDate || moment(years[currentYearIndex]) > maxDate
        }
        isMobile={isMobile}
      >
        {years[currentYearIndex]}
      </StyledDateItemTheme>
    );
  }

  return yearElements;
};
