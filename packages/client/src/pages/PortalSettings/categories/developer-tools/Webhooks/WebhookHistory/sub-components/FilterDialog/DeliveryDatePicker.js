import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import moment from "moment-timezone";

import { Text } from "@docspace/shared/components/text";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@docspace/shared/components/date-picker";
import { Calendar } from "@docspace/shared/components/calendar";
import { TimePicker } from "@docspace/shared/components/time-picker";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItem } from "@docspace/shared/components/selected-item";

import { isMobile } from "@docspace/shared/utils";

const Selectors = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 16px;
  height: 32px;
  display: flex;
  align-items: center;

  .mr-8 {
    margin-inline-end: 8px;
  }

  .selectedItem {
    margin-bottom: 0;
  }
`;

const TimePickerCell = styled.span`
  margin-inline-start: 8px;
  display: inline-flex;
  align-items: center;

  .timePickerItem {
    display: inline-flex;
    align-items: center;
    margin-inline-end: 16px;
  }
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;
  ${(props) =>
    props.isMobile &&
    css`
      position: fixed;
      bottom: 0;
      inset-inline-start: 0;
    `}
`;

const DeliveryDatePicker = ({
  filters,
  setFilters,
  isApplied,
  setIsApplied,
}) => {
  const { t, i18n } = useTranslation(["Webhooks", "Common"]);

  const calendarRef = useRef();
  const selectorRef = useRef();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  const deleteSelectedDate = (propKey, label, group, e) => {
    e.stopPropagation();
    setIsApplied(false);
    setFilters((prevFilters) => ({
      ...prevFilters,
      deliveryDate: null,
      deliveryFrom: moment()
        .tz(window.timezone)
        .startOf("day"),
      deliveryTo: moment()
        .tz(window.timezone)
        .endOf("day"),
    }));
    setIsTimeOpen(false);
    setIsCalendarOpen(false);
  };

  const setDeliveryFrom = (date) => {
    setFilters((prevfilters) => ({ ...prevfilters, deliveryFrom: date }));
  };
  const setDeliveryTo = (date) => {
    setFilters((prevfilters) => ({ ...prevfilters, deliveryTo: date }));
  };
  const onDateSet = (date) => {
    setIsApplied(false);
    setIsTimeOpen(false);
    setIsCalendarOpen(false);
    setFilters((prevFilters) => ({
      ...prevFilters,
      deliveryDate: date,
      deliveryFrom: moment()
        .tz(window.timezone)
        .startOf("day"),
      deliveryTo: moment()
        .tz(window.timezone)
        .endOf("day"),
    }));
  };

  const toggleCalendar = () =>
    setIsCalendarOpen((prevIsCalendarOpen) => !prevIsCalendarOpen);

  const closeCalendar = () => {
    setIsApplied(false);
    setIsTimeOpen(false);
    setIsCalendarOpen(false);
  };

  const showTimePicker = () => setIsTimeOpen(true);

  const CalendarElement = () => (
    <StyledCalendar
      selectedDate={filters.deliveryDate}
      setSelectedDate={onDateSet}
      onChange={closeCalendar}
      isMobile={isMobile()}
      forwardedRef={calendarRef}
      locale={i18n.language}
    />
  );

  const SelectedDateTime = () => {
    const formattedTime = isTimeEqual
      ? ""
      : ` ${moment(filters.deliveryFrom).tz(window.timezone).format("HH:mm")} - ${moment(
          filters.deliveryTo,
        )
          .tz(window.timezone)
          .format("HH:mm")}`;

    return (
      <div>
        <SelectedItem
          className="selectedItem delete-delivery-date-button"
          onClose={deleteSelectedDate}
          label={filters.deliveryDate.format("DD MMM YYYY") + formattedTime}
          onClick={toggleCalendar}
        />
        {isCalendarOpen && <CalendarElement />}
      </div>
    );
  };

  const handleClick = (e) => {
    !selectorRef?.current?.contains(e.target) &&
      !calendarRef?.current?.contains(e.target) &&
      setIsCalendarOpen(false);
  };
  const isEqualDates = (firstDate, secondDate) => {
    return (
      firstDate.format("YYYY-MM-D HH:mm") ===
      secondDate.format("YYYY-MM-D HH:mm")
    );
  };

  const isTimeEqual =
    isEqualDates(
      filters.deliveryFrom,
      filters.deliveryFrom.clone().startOf("day")
    ) &&
    isEqualDates(filters.deliveryTo, filters.deliveryTo.clone().endOf("day"));

  const isTimeValid = filters.deliveryTo > filters.deliveryFrom;

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <>
      <Text fontWeight={600} fontSize="15px">
        {t("DeliveryDate")}
      </Text>
      <Selectors ref={selectorRef}>
        {isApplied && filters.deliveryDate !== null ? (
          <SelectedDateTime />
        ) : (
          <DatePicker
            outerDate={filters.deliveryDate}
            isMobile={isMobile()}
            onChange={onDateSet}
            selectedDateText={t("SelectDate")}
            showCalendarIcon={false}
            locale={i18n.language}
          />
        )}
        {filters.deliveryDate !== null &&
          !isApplied &&
          (isTimeOpen ? (
            <TimePickerCell>
              <span className="timePickerItem">
                <Text
                  isInline
                  fontWeight={600}
                  color="#A3A9AE"
                  className="mr-8"
                >
                  {t("From")}
                </Text>
                <TimePicker
                  classNameInput="from-time"
                  onChange={setDeliveryFrom}
                  hasError={!isTimeValid}
                  tabIndex={1}
                  locale={i18n.language}
                  initialTime={filters.deliveryFrom}
                />
              </span>

              <Text isInline fontWeight={600} color="#A3A9AE" className="mr-8">
                {t("Before")}
              </Text>
              <TimePicker
                classNameInput="before-time"
                date={filters.deliveryTo}
                onChange={setDeliveryTo}
                hasError={!isTimeValid}
                tabIndex={2}
                locale={i18n.language}
                initialTime={filters.deliveryTo}
              />
            </TimePickerCell>
          ) : (
            <TimePickerCell>
              <SelectorAddButton
                title={t("Common:AddButton")}
                onClick={showTimePicker}
                className="mr-8 add-delivery-time-button"
              />
              <Text isInline fontWeight={600} color="#A3A9AE">
                {t("SelectDeliveryTime")}
              </Text>
            </TimePickerCell>
          ))}
      </Selectors>
    </>
  );
};

export default DeliveryDatePicker;
