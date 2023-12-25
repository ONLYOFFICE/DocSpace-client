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

  const [date, setDate] = useState<moment.Moment>(
    initialDate ? moment(initialDate) : moment(),
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () =>
    setIsCalendarOpen((prevIsCalendarOpen) => !prevIsCalendarOpen);

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleChange = (d: null | moment.Moment) => {
    onChange?.(d);
    setDate(date);
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
          <Text isInline fontWeight={600} color="#A3A9AE">
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
          selectedDate={date}
          setSelectedDate={handleChange}
          onChange={closeCalendar}
          forwardedRef={calendarRef}
          minDate={minDate || moment()}
          maxDate={maxDate || moment()}
          locale={locale}
          initialDate={openDate}
        />
      )}
    </Wrapper>
  );
};

export { DatePicker };
