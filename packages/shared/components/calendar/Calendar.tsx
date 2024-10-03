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

/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import moment from "moment";
import "moment/locale/ar-sa";

import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Days, Months, Years } from "./sub-components";

import { getValidDates } from "./utils";
import { CalendarProps } from "./Calendar.types";
import { StyledContainerTheme } from "./Calendar.styled";

const Calendar = ({
  locale = "en",
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
  id,
  className,
  style,
  initialDate,
  onChange,
  isMobile,
  forwardedRef,
  isScroll = false,
}: CalendarProps) => {
  moment.locale(locale);

  const theme = useTheme();

  const handleDateChange = (date: moment.Moment) => {
    const formattedDate = moment(
      date.format("YYYY-MM-DD") +
        (selectedDate ? ` ${selectedDate.format("HH:mm")}` : ""),
    );
    setSelectedDate?.(formattedDate);
    onChange?.(formattedDate);
  };

  const [observedDate, setObservedDate] = useState(moment());
  const [selectedScene, setSelectedScene] = useState(0);
  const [resultMinDate, setResultMinDate] = useState(moment());
  const [resultMaxDate, setResultMaxDate] = useState(moment());

  useEffect(() => {
    const [min, max] = getValidDates(minDate, maxDate);

    setResultMaxDate(max);
    setResultMinDate(min);
  }, [minDate, maxDate]);

  useEffect(() => {
    let date = moment(initialDate);
    const [min, max] = getValidDates(minDate, maxDate);

    if (!initialDate) {
      const today = moment();
      date =
        today <= max && today >= min
          ? today
          : Math.abs(today.diff(min, "day")) > Math.abs(today.diff(max, "day"))
            ? max.clone()
            : min.clone();

      date.startOf("day");
      date = moment();
    } else if (date > max || date < min) {
      date =
        Math.abs(date.diff(min, "day")) > Math.abs(date.diff(max, "day"))
          ? max.clone()
          : min.clone();

      date.startOf("day");

      console.warn(
        "Initial date is out of min/max dates boundaries. Initial date will be set as closest boundary value",
      );
    }
    setObservedDate(date);
  }, [initialDate, maxDate, minDate]);

  const CalendarBodyNode =
    selectedScene === 0 ? (
      <Days
        observedDate={observedDate}
        setObservedDate={setObservedDate}
        setSelectedScene={setSelectedScene}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        minDate={resultMinDate}
        maxDate={resultMaxDate}
        isMobile={isMobile || false}
        isScroll={isScroll}
      />
    ) : selectedScene === 1 ? (
      <Months
        observedDate={observedDate}
        setObservedDate={setObservedDate}
        setSelectedScene={setSelectedScene}
        selectedDate={selectedDate}
        minDate={resultMinDate}
        maxDate={resultMaxDate}
        isMobile={isMobile || false}
        isScroll={isScroll}
      />
    ) : (
      <Years
        observedDate={observedDate}
        setObservedDate={setObservedDate}
        setSelectedScene={setSelectedScene}
        selectedDate={selectedDate}
        minDate={resultMinDate}
        maxDate={resultMaxDate}
        isMobile={isMobile || false}
        isScroll={isScroll}
      />
    );

  const CalendarNode = isScroll ? (
    <Scrollbar>{CalendarBodyNode}</Scrollbar>
  ) : (
    CalendarBodyNode
  );

  return (
    <StyledContainerTheme
      id={id}
      className={className}
      style={style}
      isMobile={isMobile}
      ref={forwardedRef}
      $currentColorScheme={theme?.currentColorScheme}
      data-testid="calendar"
      isScroll={isScroll}
    >
      {CalendarNode}
    </StyledContainerTheme>
  );
};

export { Calendar };
