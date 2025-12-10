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

import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import classNames from "classnames";

import ClockIcon from "PUBLIC_DIR/images/clock.react.svg";

import { ButtonKeys } from "../../enums";

import { TimePicker } from "../time-picker";
import { DatePicker } from "../date-picker";

import { DateTimePickerProps } from "./DateTimerPicker.types";
import styles from "./DateTimePicker.module.scss";
import { ComboBox, TOption } from "../combobox";
import { useTranslation } from "react-i18next";

const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    initialDate,
    selectDateText,
    onChange,
    className,
    id,
    hasError,
    minDate,
    maxDate,
    locale,
    openDate,
    dataTestId,
    hideCross,
  } = props;

  const { t } = useTranslation("Common");

  const options = [
    {
      key: "AM",
      label: t("AM"),
    },
    {
      key: "PM",
      label: t("PM"),
    },
  ];

  const [isTimeFocused, setIsTimeFocused] = useState(false);

  const [date, setDate] = useState(initialDate ? moment(initialDate) : null);
  const [isTwelveHourFormat, setIsTwelveHourFormat] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<TOption>(
    initialDate && moment(initialDate).hour() >= 12 ? options[1] : options[0],
  );

  const showTimePicker = () => setIsTimeFocused(true);
  const hideTimePicker = () => setIsTimeFocused(false);

  const handleChange = (d: moment.Moment | null) => {
    onChange?.(d);
    setDate(d);
  };

  const timePickerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const dropDownElement =
      target.tagName === "SPAN" ? target.parentElement : target;
    const containsDropDown =
      dropDownElement?.classList.contains("drop-down-item");

    if (
      timePickerRef?.current &&
      !timePickerRef?.current?.contains(target) &&
      !containsDropDown
    ) {
      setIsTimeFocused(false);
    }
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ButtonKeys.enter || event.key === ButtonKeys.tab) {
      setIsTimeFocused(false);
    }
  };

  const onSelectFormat = (opt: TOption) => {
    setSelectedFormat(opt);
    if (!date) return;

    if (opt.key === "AM") {
      handleChange(date?.subtract(12, "hours"));
    } else {
      handleChange(date?.add(12, "hours"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  useEffect(() => {
    const date = initialDate ? moment(initialDate) : moment();
    date.locale(locale);

    const localeData = date.localeData();
    const timeFormat = localeData.longDateFormat("LT");

    if (timeFormat.includes("h")) {
      setIsTwelveHourFormat(true);
    } else {
      setIsTwelveHourFormat(false);
    }
  }, [initialDate]);

  return (
    <div
      className={classNames(styles.selectors, className, {
        [styles.hasError]: hasError,
      })}
      id={id}
      data-testid={dataTestId ?? "date-time-picker"}
      aria-label={selectDateText}
      aria-invalid={hasError}
    >
      <DatePicker
        initialDate={initialDate}
        onChange={handleChange}
        selectDateText={selectDateText}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
        openDate={openDate}
        outerDate={date}
        hideCross={hideCross}
      />
      <span
        className={styles.timeSelector}
        data-testid="date-time-picker-time-wrapper"
      >
        {date !== null ? (
          isTimeFocused ? (
            <div className={styles.timePicker} ref={timePickerRef}>
              <TimePicker
                initialTime={date}
                onChange={handleChange}
                tabIndex={0}
                onBlur={hideTimePicker}
                focusOnRender
                aria-label="Time picker"
                isTwelveHourFormat={isTwelveHourFormat}
                meridiem={String(selectedFormat.key)}
              />
              {isTwelveHourFormat ? (
                <ComboBox
                  options={options}
                  selectedOption={selectedFormat}
                  onSelect={onSelectFormat}
                  scaledOptions
                />
              ) : null}
            </div>
          ) : (
            <span
              className={classNames(styles.timeCell, {
                [styles.hasError]: hasError,
              })}
              onClick={showTimePicker}
              data-testid="date-time-picker-time-display"
              role="button"
              aria-label={`Current time: ${date.format("HH:mm")}`}
              tabIndex={0}
            >
              <ClockIcon
                className={styles.clockIcon}
                aria-hidden="true"
                data-testid="date-time-picker-clock-icon"
              />
              {isTwelveHourFormat
                ? date.format("hh:mm A")
                : date.format("HH:mm")}
            </span>
          )
        ) : null}
      </span>
    </div>
  );
};

export { DateTimePicker };
