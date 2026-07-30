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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import type { DateTime } from "luxon";

import CalendarIcon from "@docspace/ui-kit/assets/calendar.react.svg";
import { Calendar } from "@docspace/ui-kit/components/calendar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { now, formatDate, parseToDateTime } from "@docspace/ui-kit/utils/date";
import { useClickOutside } from "@docspace/ui-kit/utils/use-click-outside";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { useCalendarViewport } from "../../hooks/useCalendarViewport";
import type { DateFilterProps } from "./DateFilter.types";
import styles from "./DateFilter.module.scss";

const SELECTED_DAY_FORMAT = "MMM d, yyyy";
const REQUESTED_DAY_FORMAT = "yyyy-MM-dd";

export const DateFilter = ({
  selectedDay,
  earliestDate,
  locale,
  onSelectDay,
  setIsScrollLocked,
}: DateFilterProps) => {
  const { t } = useTranslation(["InfoPanel", "Common"]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeCalendar = useEventCallback(() => setIsCalendarOpen(false));

  useClickOutside(containerRef, closeCalendar);

  const { isMobileView, isShrunk, height } = useCalendarViewport(buttonRef);

  useEffect(() => {
    setIsScrollLocked(isCalendarOpen && isShrunk);

    return () => setIsScrollLocked(false);
  }, [isCalendarOpen, isShrunk, setIsScrollLocked]);

  const selectedDate = parseToDateTime(selectedDay);

  const onCalendarDateSet = (date: DateTime) => {
    if (!date) return;

    onSelectDay(formatDate(date, REQUESTED_DAY_FORMAT));
    closeCalendar();
  };

  const onResetClick = () => {
    onSelectDay(null);
    closeCalendar();
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-testid="info_history_date_picker"
    >
      <button
        type="button"
        ref={buttonRef}
        className={styles.button}
        onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
        data-testid="info_history_calendar"
      >
        <CalendarIcon className={styles.icon} />
        <span className={styles.label}>
          {selectedDate
            ? formatDate(selectedDate, SELECTED_DAY_FORMAT, { locale })
            : t("InfoPanel:GoToDate")}
        </span>
      </button>

      {selectedDate ? (
        <IconButton
          className={styles.reset}
          title={t("Common:ClearFilter")}
          iconName={CrossReactSvgUrl}
          color="--info-panel-toolbar-icon-color"
          size={12}
          onClick={onResetClick}
          dataTestId="info_history_calendar_reset"
        />
      ) : null}

      {isCalendarOpen ? (
        <Calendar
          className={classNames(styles.calendar, {
            [styles.mobile]: isMobileView,
          })}
          style={isShrunk ? { height } : undefined}
          selectedDate={selectedDate ?? now()}
          setSelectedDate={onCalendarDateSet}
          minDate={earliestDate ?? undefined}
          maxDate={now()}
          isMobile={isMobileView}
          isScroll={isShrunk}
          locale={locale}
        />
      ) : null}
    </div>
  );
};
