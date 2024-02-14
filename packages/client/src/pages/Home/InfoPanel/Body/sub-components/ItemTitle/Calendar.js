import IconCalendar from "PUBLIC_DIR/images/calendar.info.panel.react.svg?url";
import { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import moment from "moment";
import {Calendar} from "@docspace/shared/components/calendar"
import { Portal } from "@docspace/shared/components/portal";
import { isMobile } from "@docspace/shared/utils";
import { ReactSVG } from "react-svg";

const StyledCalendarComponent = styled.div`
  position: relative;

  .icon-calendar {
    padding-right: 2px;
  }
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;
  top: 134px;
  right: 16px;

  ${(props) =>
    props.isMobile &&
    css`
      position: fixed;
      bottom: 0;
      top: auto;
      right: auto;
    `}
`;

const CalendarComponent = ({ roomCreationDate, setCalendarDay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarRef = useRef();
  const calendarButtonRef = useRef();

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      setCalendarDay(null);
    };
  }, []);

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
        <Portal
          element={
            <StyledCalendar
              setSelectedDate={onDateSet}
              selectedDate={selectedDate}
              minDate={new Date(formattedRoomCreationDate)}
              maxDate={new Date()}
              forwardedRef={calendarRef}
              isMobile={isMobile()}
            />
          }
        />
      )}
    </StyledCalendarComponent>
  );
};

export default CalendarComponent;
