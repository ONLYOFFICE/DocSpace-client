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

import React, { useRef, useState, useEffect } from "react";
import moment from "moment";

import CalendarIconUrl from "PUBLIC_DIR/images/calendar.react.svg?url";
import CalendarIcon from "PUBLIC_DIR/images/calendar.react.svg";

import { Text } from "../text";
import { SelectorAddButton } from "../selector-add-button";
import { SelectedItem } from "../selected-item";
import {
  DateSelector,
  SelectedLabel,
  StyledCalendar,
  Wrapper,
} from "./DatePicker.styled";
import { DatePickerProps } from "./DatePicker.types";
import { globalColors } from "../../themes";

const DatePicker = (props: DatePickerProps) => {
  const {
    initialDate,
    onChange,
    selectDateText = "Select date",
    className,
    id,
    minDate,
    maxDate,
    locale,
    showCalendarIcon = true,
    outerDate,
    openDate,
    isMobile,
  } = props;

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  const [date, setDate] = useState(initialDate ? moment(initialDate) : null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () =>
    setIsCalendarOpen((prevIsCalendarOpen) => !prevIsCalendarOpen);

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleChange = (d: null | moment.Moment) => {
    onChange?.(d);
    setDate(d);
    closeCalendar();
  };

  const deleteSelectedDate = (
    propKey: string,
    label: string | React.ReactNode,
    group: string | undefined,
    e: React.MouseEvent | undefined,
  ) => {
    if (e) e.stopPropagation();
    handleChange(null);
    setIsCalendarOpen(false);
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.classList.contains("nav-thumb-vertical") ||
      target.classList.contains("nav-thumb-horizontal")
    ) {
      return;
    }

    if (
      !selectorRef?.current?.contains(target) &&
      !calendarRef?.current?.contains(target) &&
      !selectedItemRef?.current?.contains(target)
    )
      setIsCalendarOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, { capture: true });
    return () =>
      document.removeEventListener("mousedown", handleClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!outerDate) {
      setDate(null);
    }

    if (
      outerDate &&
      moment(outerDate).format("YYYY-MM-D HH:mm") !==
        moment(date).format("YYYY-MM-D HH:mm")
    ) {
      setDate(outerDate);
    }
  }, [date, outerDate]);

  return (
    <Wrapper className={className} id={id} data-testid="date-picker">
      {!date ? (
        <DateSelector onClick={toggleCalendar} ref={selectorRef}>
          <SelectorAddButton
            title={selectDateText}
            className="mr-8 add-delivery-date-button"
            iconName={CalendarIconUrl}
          />
          <Text isInline fontWeight={600} color={globalColors.gray}>
            {selectDateText}
          </Text>
        </DateSelector>
      ) : (
        <SelectedItem
          className="selectedItem"
          propKey=""
          onClose={deleteSelectedDate}
          label={
            showCalendarIcon ? (
              <SelectedLabel>
                <CalendarIcon className="calendarIcon" />
                {date.format("DD MMM YYYY")}
              </SelectedLabel>
            ) : (
              date.format("DD MMM YYYY")
            )
          }
          onClick={toggleCalendar}
          forwardedRef={selectedItemRef}
        />
      )}

      {isCalendarOpen && (
        <StyledCalendar
          isMobile={isMobile}
          selectedDate={date ?? moment()}
          setSelectedDate={handleChange}
          onChange={closeCalendar}
          forwardedRef={calendarRef}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          initialDate={openDate}
        />
      )}
    </Wrapper>
  );
};

export { DatePicker };
