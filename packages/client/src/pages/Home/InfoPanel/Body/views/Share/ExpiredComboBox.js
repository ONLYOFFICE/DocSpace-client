import { useState, useRef, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";

import moment from "moment";

import { Text } from "@docspace/shared/components/text";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import { Link } from "@docspace/shared/components/link";

import { getExpiredOptions } from "./optionsHelper";
import ShareCalendar from "./ShareCalendar";

const ExpiredComboBox = ({ link, changeExpirationOption, isDisabled }) => {
  const { t, i18n } = useTranslation(["SharingPanel", "Settings", "Common"]);
  const calendarRef = useRef();
  const bodyRef = useRef();

  const [showCalendar, setShowCalendar] = useState(false);
  const { isExpired, expirationDate } = link.sharedTo;

  const handleClick = (e) => {
    !bodyRef?.current?.contains(e.target) &&
      !calendarRef?.current?.contains(e.target) &&
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

  const setDateFromCalendar = (e) => {
    const currentDate = moment(e);
    changeExpirationOption(link, currentDate);
  };

  const getDate = () => {
    const currentDare = moment(new Date());
    const expDate = moment(new Date(expirationDate));
    const calculatedDate = expDate.diff(currentDare, "days");

    if (calculatedDate < 1) {
      return {
        date: expDate.diff(currentDare, "hours") + 1,
        label: t("Common:Hours"),
      };
    } else {
      return { date: calculatedDate + 1, label: t("Common:Days") };
    }
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
    onCalendarOpen
  );

  const getExpirationTrans = () => {
    if (expirationDate) {
      const dateObj = getDate();
      const date = dateObj?.date + " " + dateObj?.label;
      return (
        <Trans t={t} i18nKey="LinkExpireAfter" ns="SharingPanel">
          The link will expire after
          <LinkWithDropdown
            className="expired-options"
            color="#4781D1"
            dropdownType="alwaysDashed"
            data={expiredOptions}
            fontSize="12px"
            fontWeight={400}
            withoutHover
            isDisabled={isDisabled}
          >
            {{ date }}
          </LinkWithDropdown>
        </Trans>
      );
    } else {
      const date = t("Common:Unlimited");
      return (
        <Trans t={t} i18nKey="LinkIsValid" ns="SharingPanel">
          The link is valid for
          <LinkWithDropdown
            className="expired-options"
            color="#4781D1"
            dropdownType="alwaysDashed"
            data={expiredOptions}
            fontSize="12px"
            fontWeight={400}
            withoutHover
            isDisabled={isDisabled}
          >
            {{ date }}
          </LinkWithDropdown>
        </Trans>
      );
    }
  };

  return (
    <div ref={bodyRef}>
      {isExpired ? (
        <Text className="expire-text" as="div" fontSize="12px" fontWeight="400">
          {t("LinkExpired")}{" "}
          <Link
            type="action"
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
