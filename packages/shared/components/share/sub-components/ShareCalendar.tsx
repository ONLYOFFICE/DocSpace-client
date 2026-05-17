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

import { now, addToDate } from "@docspace/ui-kit/utils/date";

import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";

import { Calendar } from "@docspace/ui-kit/components/calendar";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import type { ShareCalendarProps } from "../Share.types";
import styles from "../Share.module.scss";

const calendarHeight = 376;
const calendarWidth = 362;

const ShareCalendar = ({
  onDateSet,
  closeCalendar,
  calendarRef,
  locale,
  bodyRef,
}: ShareCalendarProps) => {
  const selectedDate = now();
  const maxDate = addToDate(now(), 10, "years")!;

  const isMobileView = useIsMobile();

  const height = Math.min(
    typeof window !== "undefined" ? window.innerHeight : 0,
    calendarHeight,
  );

  const calendarComponent = (
    <Calendar
      className={styles.calendar}
      selectedDate={selectedDate}
      setSelectedDate={onDateSet}
      onChange={closeCalendar}
      isMobile={isMobileView}
      forwardedRef={calendarRef}
      locale={locale}
      minDate={selectedDate}
      maxDate={maxDate}
      dataTestId="info_panel_share_calendar"
      id="share_calendar"
    />
  );

  return (
    <DropDown
      open
      topSpace={0}
      isDefaultMode
      directionY="both"
      forwardedRef={bodyRef}
      eventTypes={["mousedown"]}
      className={styles.dropDown}
      withBackdrop={isMobileView}
      isMobileView={isMobileView}
      withBackground={isMobileView}
      usePortalBackdrop={isMobileView}
      shouldShowBackdrop={isMobileView}
      clickOutsideAction={() => closeCalendar()}
    >
      <Scrollbar style={{ height, width: calendarWidth }}>
        {calendarComponent}
      </Scrollbar>
    </DropDown>
  );
};

export default ShareCalendar;
