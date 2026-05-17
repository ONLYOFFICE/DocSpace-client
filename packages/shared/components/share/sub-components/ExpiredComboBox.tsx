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

import { useState, useRef, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import type { DateTime } from "luxon";

import { now, addToDate } from "@docspace/ui-kit/utils/date";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { LinkWithDropdown } from "@docspace/ui-kit/components/link-with-dropdown";
import { globalColors } from "@docspace/ui-kit/providers/theme";

import { getDate, getExpiredOptions } from "../Share.helpers";
import { ExpiredComboBoxProps } from "../Share.types";

import ShareCalendar from "./ShareCalendar";
import styles from "../Share.module.scss";

const ExpiredComboBox = ({
  link,
  changeExpirationOption,
  isDisabled,
  removedExpiredLink,
}: ExpiredComboBoxProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const { isExpired, expirationDate } = link.sharedTo;

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !bodyRef?.current?.contains(target) &&
      !calendarRef?.current?.contains(target)
    )
      setShowCalendar(false);
  };

  const setTwelveHours = () => {
    const currentDate = addToDate(now(), 12, "hours");
    changeExpirationOption(link, currentDate);
  };

  const setOneDay = () => {
    const currentDate = addToDate(now(), 1, "days");
    changeExpirationOption(link, currentDate);
  };

  const setSevenDays = () => {
    const currentDate = addToDate(now(), 7, "days");
    changeExpirationOption(link, currentDate);
  };

  const setUnlimited = () => {
    changeExpirationOption(link, null);
  };

  const onCalendarOpen = () => {
    setShowCalendar(true);
  };

  const onCalendarClose = () => {
    setShowCalendar(false);
  };

  const setDateFromCalendar = (e: DateTime) => {
    changeExpirationOption(link, e);
  };

  const onReactivate = () => {
    removedExpiredLink(link, true);
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  const expiredOptions = getExpiredOptions(
    t,
    setTwelveHours,
    setOneDay,
    setSevenDays,
    setUnlimited,
    onCalendarOpen,
    i18n.language,
  );

  const getExpirationTrans = () => {
    if (expirationDate) {
      const date = getDate(expirationDate);

      return (
        <Trans t={t} i18nKey="LinkExpireAfter" ns="Common">
          The link will expire
          <LinkWithDropdown
            className={styles.expiredOptions}
            color={globalColors.lightBlueMain}
            dropdownType="alwaysDashed"
            data={expiredOptions}
            fontSize="12px"
            fontWeight={400}
            isDisabled={isDisabled}
            directionY="both"
            withoutBackground
          >
            {/* @ts-expect-error pass object as children for correct work link component */}
            {{ date }}
          </LinkWithDropdown>
        </Trans>
      );
    }
    const date = t("Common:Unlimited").toLowerCase();

    return (
      <Trans t={t} i18nKey="LinkIsValid" ns="Common">
        The link is valid for
        <LinkWithDropdown
          className={styles.expiredOptions}
          color={globalColors.lightBlueMain}
          dropdownType="alwaysDashed"
          data={expiredOptions}
          fontSize="12px"
          fontWeight={400}
          isDisabled={isDisabled}
          directionY="both"
          withoutBackground
        >
          {/* @ts-expect-error pass object as children for correct work link component */}
          {{ date }}
        </LinkWithDropdown>
      </Trans>
    );
  };

  return (
    <div ref={bodyRef}>
      {isExpired ? (
        <Text
          className={styles.expireText}
          as="div"
          fontSize="12px"
          fontWeight="400"
        >
          {t("Common:LinkExpired")}{" "}
          <Link
            type={LinkType.action}
            fontWeight={400}
            fontSize="12px"
            color={globalColors.lightBlueMain}
            onClick={onReactivate}
            dataTestId="expired_combo_box_remove_link"
          >
            {t("Common:ReactivateLink")}
          </Link>
        </Text>
      ) : (
        <Text
          className={styles.expireText}
          as="div"
          fontSize="12px"
          fontWeight="400"
        >
          {getExpirationTrans()}
        </Text>
      )}
      {showCalendar ? (
        <ShareCalendar
          bodyRef={bodyRef}
          locale={i18n.language}
          calendarRef={calendarRef}
          onDateSet={setDateFromCalendar}
          closeCalendar={onCalendarClose}
        />
      ) : null}
    </div>
  );
};

export default ExpiredComboBox;
