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
    padding-right: 2px;
  }
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;
  top: 20px;
  right: -30px;

  height: ${(props) => props.height + "px"};

  ${(props) =>
    props.isMobile &&
    css`
      position: fixed;
      bottom: 0;
      top: auto;
      right: auto;
      left: 0;
      height: ${heightCalendarMobile + "px"};
    `}

  .track-vertical {
    height: 100% !important;
  }
`;

const CalendarComponent = ({
  roomCreationDate,
  setCalendarDay,
  setIsScrollLocked,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [height, setHeight] = useState(heightCalendar);

  const calendarRef = useRef();
  const calendarButtonRef = useRef();

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("resize", onChangeHeight);
    onChangeHeight();

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("resize", onChangeHeight);
      setCalendarDay(null);
    };
  }, []);

  useEffect(() => {
    if (isOpen && height < heightCalendar) setIsScrollLocked(true);
    if (!isOpen) setIsScrollLocked(false);
  }, [isOpen, height, heightCalendar]);

  const onChangeHeight = () => {
    const hightTop = calendarButtonRef?.current?.getBoundingClientRect().top;
    const hightIconCalendar = 20;
    const hightWindow = document.documentElement.clientHeight;
    const hightScroll = hightWindow - hightIconCalendar - hightTop;

    if (hightScroll !== heightCalendar && hightScroll > heightCalendar) {
      setHeight(heightCalendar);
    } else setHeight(hightScroll);
  };

  const handleClick = (e) => {
    !calendarButtonRef?.current?.contains(e.target) &&
      !calendarRef?.current?.contains(e.target) &&
      setIsOpen(false);
  };

  const toggleCalendar = () => setIsOpen((open) => !open);

  const onDateSet = (date) => {
    const formattedDate = moment(date.format("YYYY-MM-DD"));
    setSelectedDate(date);
    setCalendarDay(formattedDate._i);
    setIsOpen(false);
  };

  const formattedRoomCreationDate =
    moment(roomCreationDate).format("YYYY/MM/DD");

  return (
    <StyledCalendarComponent>
      <div ref={calendarButtonRef}>
        <ReactSVG
          className="icon-calendar"
          src={IconCalendar}
          onClick={toggleCalendar}
        />
      </div>

      {isOpen && (
        <StyledCalendar
          height={height}
          setSelectedDate={onDateSet}
          selectedDate={selectedDate}
          minDate={new Date(formattedRoomCreationDate)}
          maxDate={new Date()}
          forwardedRef={calendarRef}
          isMobile={isMobile()}
          isScroll={!isMobile()}
        />
      )}
    </StyledCalendarComponent>
  );
};

export default CalendarComponent;
