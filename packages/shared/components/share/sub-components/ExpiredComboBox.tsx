// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState, useRef, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";

import moment from "moment";

import { Text } from "../../text";
import { LinkWithDropdown } from "../../link-with-dropdown";
import { Link, LinkType } from "../../link";

import { getExpiredOptions } from "../Share.helpers";
import { ExpiredComboBoxProps } from "../Share.types";

import ShareCalendar from "./ShareCalendar";

const ExpiredComboBox = ({
  link,
  changeExpirationOption,
  isDisabled,
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
    const currentDate = moment().add(12, "hour");
    changeExpirationOption(link, currentDate);
  };

  const setOneDay = () => {
    const currentDate = moment().add(1, "days");
    changeExpirationOption(link, currentDate);
  };

  const setSevenDays = () => {
    const currentDate = moment().add(7, "days");
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

  const setDateFromCalendar = (e: moment.Moment) => {
    const currentDate = moment(e);
    changeExpirationOption(link, currentDate);
  };

  const getDate = () => {
    if (!expirationDate) return;
    const currentDare = moment(new Date());
    const expDate = moment(new Date(expirationDate));
    const calculatedDate = expDate.diff(currentDare, "days");

    if (calculatedDate < 1) {
      return {
        date: expDate.diff(currentDare, "hours") + 1,
        label: t("Common:Hours"),
      };
    }

    return { date: calculatedDate + 1, label: t("Common:Days") };
  };

  const onRegenerateClick = () => {
    setSevenDays();
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
  );

  const getExpirationTrans = () => {
    if (expirationDate) {
      const dateObj = getDate();
      const date = `${dateObj?.date} ${dateObj?.label}`;

      return (
        <Trans t={t} i18nKey="LinkExpireAfter" ns="Common">
          The link will expire after
          <LinkWithDropdown
            className="expired-options"
            color="#4781D1"
            dropdownType="alwaysDashed"
            data={expiredOptions}
            fontSize="12px"
            fontWeight={400}
            isDisabled={isDisabled}
            directionY="both"
          >
            {/* @ts-expect-error pass object as children for correct work link component */}
            {{ date }}
          </LinkWithDropdown>
        </Trans>
      );
    }
    const date = t("Common:Unlimited");

    return (
      <Trans t={t} i18nKey="LinkIsValid" ns="Common">
        The link is valid for
        <LinkWithDropdown
          className="expired-options"
          color="#4781D1"
          dropdownType="alwaysDashed"
          data={expiredOptions}
          fontSize="12px"
          fontWeight={400}
          isDisabled={isDisabled}
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
        <Text className="expire-text" as="div" fontSize="12px" fontWeight="400">
          {t("Common:LinkExpired")}{" "}
          <Link
            type={LinkType.action}
            fontWeight={400}
            fontSize="12px"
            color="#4781D1"
            onClick={onRegenerateClick}
          >
            {t("Common:Regenerate")}
          </Link>
        </Text>
      ) : (
        <Text className="expire-text" as="div" fontSize="12px" fontWeight="400">
          {getExpirationTrans()}
        </Text>
      )}
      {showCalendar && (
        <ShareCalendar
          onDateSet={setDateFromCalendar}
          calendarRef={calendarRef}
          closeCalendar={onCalendarClose}
          locale={i18n.language}
        />
      )}
    </div>
  );
};

export default ExpiredComboBox;
