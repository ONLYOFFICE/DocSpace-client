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
  } = props;

  const [isTimeFocused, setIsTimeFocused] = useState(false);

  const [date, setDate] = useState(initialDate ? moment(initialDate) : null);

  const showTimePicker = () => setIsTimeFocused(true);
  const hideTimePicker = () => setIsTimeFocused(false);

  const handleChange = (d: moment.Moment | null) => {
    onChange?.(d);
    setDate(d);
  };

  const timePickerRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target &&
      timePickerRef?.current &&
      !timePickerRef?.current?.contains(target)
    )
      setIsTimeFocused(false);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ButtonKeys.enter || event.key === ButtonKeys.tab) {
      setIsTimeFocused(false);
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
      />
      <span
        className={styles.timeSelector}
        data-testid="date-time-picker-time-wrapper"
      >
        {date !== null ? (
          isTimeFocused ? (
            <TimePicker
              initialTime={date}
              onChange={handleChange}
              tabIndex={0}
              onBlur={hideTimePicker}
              focusOnRender
              forwardedRef={timePickerRef}
              aria-label="Time picker"
            />
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
              {date.format("HH:mm")}
            </span>
          )
        ) : null}
      </span>
    </div>
  );
};

export { DateTimePicker };
