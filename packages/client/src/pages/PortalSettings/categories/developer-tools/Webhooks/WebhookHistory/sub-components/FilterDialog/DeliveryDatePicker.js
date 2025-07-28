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

import React, { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import moment from "moment-timezone";

import { Text } from "@docspace/shared/components/text";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@docspace/shared/components/date-picker";
import { Calendar } from "@docspace/shared/components/calendar";
import { TimePicker } from "@docspace/shared/components/time-picker";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItem } from "@docspace/shared/components/selected-item";

import { isMobile } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";

const Selectors = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: ${(props) => `1px solid ${props.theme.infoPanel.borderColor}`};
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

const CalendarElement = ({
  filters,
  onDateSet,
  closeCalendar,
  calendarRef,
  i18n,
}) => (
  <StyledCalendar
    selectedDate={filters.deliveryDate}
    setSelectedDate={onDateSet}
    onChange={closeCalendar}
    isMobile={isMobile()}
    forwardedRef={calendarRef}
    locale={i18n.language}
  />
);

const SelectedDateTime = ({
  isTimeEqual,
  filters,
  deleteSelectedDate,
  toggleCalendar,
  isCalendarOpen,
  calendarRef,
  onDateSet,
  closeCalendar,
  i18n,
}) => {
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
        testId="selected_delivery_date"
      />
      {isCalendarOpen ? (
        <CalendarElement
          filters={filters}
          onDateSet={onDateSet}
          closeCalendar={closeCalendar}
          calendarRef={calendarRef}
          i18n={i18n}
        />
      ) : null}
    </div>
  );
};

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
      deliveryFrom: moment().tz(window.timezone).startOf("day"),
      deliveryTo: moment().tz(window.timezone).endOf("day"),
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
      deliveryFrom: moment().tz(window.timezone).startOf("day"),
      deliveryTo: moment().tz(window.timezone).endOf("day"),
    }));
  };

  const toggleCalendar = () =>
    setIsCalendarOpen((prevIsCalendarOpen) => !prevIsCalendarOpen);

  const closeCalendar = () => {
    setIsApplied(false);
    setIsTimeOpen(false);
    setIsCalendarOpen(false);
  };

  const showTimePicker = () => {
    setIsApplied(false);
    setIsTimeOpen(true);
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
      filters.deliveryFrom.clone().startOf("day"),
    ) &&
    isEqualDates(filters.deliveryTo, filters.deliveryTo.clone().endOf("day"));

  const isDefaultTime = isApplied
    ? isEqualDates(
        filters.deliveryFrom,
        moment().tz(window.timezone).startOf("day"),
      ) &&
      isEqualDates(
        filters.deliveryTo,
        moment().tz(window.timezone).endOf("day"),
      )
    : true;

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
        {filters.deliveryDate ? (
          <SelectedDateTime
            isTimeEqual={isTimeEqual}
            filters={filters}
            deleteSelectedDate={deleteSelectedDate}
            toggleCalendar={toggleCalendar}
            isCalendarOpen={isCalendarOpen}
            calendarRef={calendarRef}
            onDateSet={onDateSet}
            closeCalendar={closeCalendar}
            i18n={i18n}
          />
        ) : (
          <DatePicker
            outerDate={filters.deliveryDate}
            isMobile={isMobile()}
            onChange={onDateSet}
            selectDateText={t("Common:SelectDate")}
            showCalendarIcon={false}
            locale={i18n.language}
            testId="delivery_date_picker"
          />
        )}
        {filters.deliveryDate !== null && isDefaultTime ? (
          isTimeOpen && !isApplied ? (
            <TimePickerCell>
              <span className="timePickerItem">
                <Text
                  isInline
                  fontWeight={600}
                  color={globalColors.gray}
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
                  testId="delivery_time_picker_from"
                />
              </span>

              <Text
                isInline
                fontWeight={600}
                color={globalColors.gray}
                className="mr-8"
              >
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
                testId="delivery_time_picker_to"
              />
            </TimePickerCell>
          ) : (
            <TimePickerCell>
              <SelectorAddButton
                title={t("Common:AddButton")}
                onClick={showTimePicker}
                className="mr-8 add-delivery-time-button"
                label={t("SelectDeliveryTime")}
              />
            </TimePickerCell>
          )
        ) : null}
      </Selectors>
    </>
  );
};

export default DeliveryDatePicker;
