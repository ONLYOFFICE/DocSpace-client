import IconCalendar from "PUBLIC_DIR/images/calendar.info.panel.react.svg?url";
import { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import moment from "moment";
import { Calendar } from "@docspace/shared/components/calendar";
import { isMobile } from "@docspace/shared/utils";
import { ReactSVG } from "react-svg";

const heightCalendar = 376;
const heightCalendarMobile = 420;

const StyledCalendarComponent = styled.div`
  position: relative;

  .icon-calendar {
    height: 16px;
    padding-right: 2px;
  }
`;

const StyledCalendar = styled(Calendar)<{
  height: number;
}>`
  position: absolute;
  top: 20px;
  right: -30px;

  height: ${(props) => `${props.height}px`};

  ${(props) =>
    props.isMobile &&
    css`
      position: fixed;
      bottom: 0;
      top: auto;
      right: auto;
      left: 0;
      height: ${`${heightCalendarMobile}px`};
    `}

  .track-vertical {
    height: 100% !important;
  }
`;

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
  const [selectedDate, setSelectedDate] = useState<moment.Moment>();

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

  const onDateSet = (date: moment.Moment) => {
    if (!date) return;
    const formattedDate = moment(date.format("YYYY-MM-DD"));
    setSelectedDate(date);
    setCalendarDay(formattedDate.format("YYYY-MM-DD"));
    setIsOpen(false);
  };

  const formattedRoomCreationDate =
    moment(roomCreationDate).format("YYYY-MM-DD");

  return (
    <StyledCalendarComponent>
      <div ref={calendarButtonRef}>
        <ReactSVG
          className="icon-calendar"
          src={IconCalendar}
          onClick={toggleCalendar}
        />
      </div>

      {isOpen ? (
        <StyledCalendar
          height={height}
          setSelectedDate={onDateSet}
          selectedDate={selectedDate ?? moment()}
          minDate={new Date(formattedRoomCreationDate)}
          maxDate={new Date()}
          forwardedRef={calendarRef}
          isMobile={isMobile()}
          isScroll={!isMobile()}
          locale={locale}
        />
      ) : null}
    </StyledCalendarComponent>
  );
};

export default CalendarComponent;
