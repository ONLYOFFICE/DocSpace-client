/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

import IconCalendar from "@docspace/ui-kit/assets/calendar.react.svg";
import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import type { DateTime } from "luxon";
import { Calendar } from "@docspace/ui-kit/components/calendar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { isMobile } from "@docspace/shared/utils";
import type { Nullable } from "@docspace/shared/types";
import { now, formatDate, parseToDateTime } from "@docspace/ui-kit/utils/date";

import styles from "./Calendar.module.scss";

const heightCalendar = 376;

interface CalendarProps {
  roomCreationDate?: string;
  setCalendarDay: (value: Nullable<string>) => void;
  setIsScrollLocked: (value: boolean) => void;
  locale: string;
  title: string;
}

const CalendarComponent = ({
  roomCreationDate,
  setCalendarDay,
  setIsScrollLocked,
  locale,
  title,
}: CalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>();

  const [height, setHeight] = useState(heightCalendar);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const calendarButtonRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (!calendarButtonRef?.current || !calendarRef?.current) return;

    const calendarButtonElem = calendarButtonRef.current;
    const calendarElem = calendarRef.current as HTMLElement;

    if (
      !calendarButtonElem.contains(e.target as Node) &&
      !calendarElem.contains(e.target as Node)
    )
      setIsOpen(false);
  };

  const onChangeHeight = () => {
    if (!calendarButtonRef?.current) return;

    const calendarButtonElem = calendarButtonRef.current as HTMLElement;

    const hightTop = calendarButtonElem.getBoundingClientRect().top;
    const hightIconCalendar = 20;
    const hightWindow = document.documentElement.clientHeight;
    const hightScroll = hightWindow - hightIconCalendar - hightTop;

    if (hightScroll !== heightCalendar && hightScroll > heightCalendar) {
      setHeight(heightCalendar);
    } else setHeight(hightScroll);
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("resize", onChangeHeight);
    onChangeHeight();

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("resize", onChangeHeight);
      setCalendarDay(null);
    };
  }, [setCalendarDay]);

  useEffect(() => {
    if (isOpen && height < heightCalendar) setIsScrollLocked(true);
    if (!isOpen) setIsScrollLocked(false);
  }, [isOpen, height, setIsScrollLocked]);

  const toggleCalendar = () => setIsOpen((open) => !open);

  const isShrunk = height < heightCalendar;

  const onDateSet = (date: DateTime) => {
    if (!date) return;
    setSelectedDate(date);
    setCalendarDay(formatDate(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const creationDate = parseToDateTime(roomCreationDate);

  const mobile = isMobile();

  return (
    <div
      className={styles.calendarComponent}
      data-testid="info_history_date_picker"
    >
      <div ref={calendarButtonRef}>
        <IconButton
          id="info_history-calendar"
          className="icon"
          title={title}
          iconNode={<IconCalendar />}
          onClick={toggleCalendar}
          size={16}
          dataTestId="info_history_calendar"
        />
      </div>

      {isOpen ? (
        <Calendar
          className={classNames(styles.calendar, { [styles.mobile]: mobile })}
          style={!mobile && isShrunk ? { height } : undefined}
          setSelectedDate={onDateSet}
          selectedDate={selectedDate ?? now()}
          minDate={creationDate ?? undefined}
          maxDate={now()}
          forwardedRef={calendarRef}
          isMobile={mobile}
          isScroll={!mobile && isShrunk}
          locale={locale}
        />
      ) : null}
    </div>
  );
};

export default CalendarComponent;
