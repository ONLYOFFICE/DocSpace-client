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

import IconCalendar from "PUBLIC_DIR/images/calendar.info.panel.react.svg?url";
import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import type { DateTime } from "luxon";
import { Calendar } from "@docspace/ui-kit/components/calendar";
import { isMobile } from "@docspace/shared/utils";
import { ReactSVG } from "react-svg";
import { now, formatDate, parseToDateTime } from "@docspace/ui-kit/utils/date";

import styles from "./Calendar.module.scss";

const heightCalendar = 376;

interface CalendarProps {
  roomCreationDate: string;
  setCalendarDay: (value: null | string) => void;
  setIsScrollLocked: (value: boolean) => void;
  locale: string;
}

const CalendarComponent = ({
  roomCreationDate,
  setCalendarDay,
  setIsScrollLocked,
  locale,
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

  const onDateSet = (date: DateTime) => {
    if (!date) return;
    setSelectedDate(date);
    setCalendarDay(formatDate(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const formattedRoomCreationDate = formatDate(
    parseToDateTime(roomCreationDate),
    "yyyy-MM-dd",
  );

  const mobile = isMobile();

  return (
    <div className={styles.calendarComponent}>
      <div ref={calendarButtonRef}>
        <ReactSVG
          className="icon-calendar"
          src={IconCalendar}
          onClick={toggleCalendar}
        />
      </div>

      {isOpen ? (
        <Calendar
          className={classNames(styles.calendar, { [styles.mobile]: mobile })}
          style={{ height: mobile ? undefined : height }}
          setSelectedDate={onDateSet}
          selectedDate={selectedDate ?? now()}
          minDate={new Date(formattedRoomCreationDate)}
          maxDate={new Date()}
          forwardedRef={calendarRef}
          isMobile={mobile}
          isScroll={!mobile}
          locale={locale}
        />
      ) : null}
    </div>
  );
};

export default CalendarComponent;
