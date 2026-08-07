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

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import type { DateTime } from "luxon";

import { Calendar } from "@docspace/ui-kit/components/calendar";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";
import { formatDateLocalized, now } from "@docspace/ui-kit/utils/date";
import { useClickOutside } from "@docspace/ui-kit/utils/use-click-outside";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import type { Nullable } from "@docspace/shared/types";

import CalendarIcon from "PUBLIC_DIR/images/icons/16/calendar.dots.react.svg";

import { useCalendarViewport } from "../../hooks/useCalendarViewport";
import type { ExportDateRangeProps, RangeEdge } from "./ExportDateRange.types";
import styles from "./ExportDateRange.module.scss";

export const ExportDateRange = ({
  dateRange,
  earliestDate,
  locale,
  onChange,
}: ExportDateRangeProps) => {
  const { t } = useTranslation(["Common"]);

  const [openedEdge, setOpenedEdge] = useState<Nullable<RangeEdge>>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const closeCalendar = useEventCallback(() => setOpenedEdge(null));

  useClickOutside(containerRef, closeCalendar);

  const onOutsideFieldsClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(`.${styles.calendar}`)) return;

    closeCalendar();
  };

  const { isMobileView, isShrunk, height, refreshPlacement } =
    useCalendarViewport(containerRef);

  const today = now();

  const edges: { edge: RangeEdge; label: string }[] = [
    { edge: "fromDate", label: t("Common:DateRangeFrom") },
    { edge: "toDate", label: t("Common:DateRangeTo") },
  ];

  const onDateSet = (date: DateTime) => {
    if (!date || !openedEdge) return;

    const changed = { ...dateRange, [openedEdge]: date };

    onChange(
      changed.fromDate > changed.toDate
        ? { fromDate: changed.toDate, toDate: changed.fromDate }
        : changed,
    );

    closeCalendar();
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={onOutsideFieldsClick}
      data-testid="info_history_export_date_range"
    >
      {edges.map(({ edge, label }) => {
        const openCalendar = (event: React.MouseEvent) => {
          event.stopPropagation();

          refreshPlacement();
          setOpenedEdge(edge);
        };

        return (
          <div key={edge} className={styles.field}>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {label}
            </Text>

            <InputBlock
              value={formatDateLocalized(dateRange[edge], "DATE_SHORT", {
                locale,
              })}
              type={InputType.text}
              size={InputSize.base}
              iconNode={
                <div
                  className={styles.calendarIcon}
                  data-testid="info_history_export_calendar_icon"
                >
                  <CalendarIcon />
                </div>
              }
              iconSize={16}
              iconButtonClassName={styles.iconDivider}
              onClick={openCalendar}
              onIconClick={openCalendar}
              isReadOnly
              scale
              testId={`info_history_export_${edge}`}
            />
          </div>
        );
      })}

      {openedEdge ? (
        <Calendar
          className={classNames(styles.calendar, {
            [styles.mobile]: isMobileView,
          })}
          style={isShrunk ? { height } : undefined}
          selectedDate={dateRange[openedEdge]}
          setSelectedDate={onDateSet}
          minDate={earliestDate ?? undefined}
          maxDate={today}
          isMobile={isMobileView}
          isScroll={isShrunk}
          locale={locale}
        />
      ) : null}
    </div>
  );
};
