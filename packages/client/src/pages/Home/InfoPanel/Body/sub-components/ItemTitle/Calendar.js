import { useState } from "react";
import styled from "styled-components";
import moment from "moment";
import Calendar from "@docspace/components/calendar";

const StyledCalendar = styled.div`
  position: relative;

  .calendar {
    position: absolute;
    right: 0;
    /* ${(props) =>
      props.isMobile &&
      css`
        position: fixed;
        bottom: 0;
        inset-inline-start: 0;
      `} */
  }
`;

const CalendarComponent = ({ setCalendarDay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const toggleCalendar = () => setIsOpen((open) => !open);
  const onDateSet = (date) => {
    const formattedDate = moment(date.format("YYYY-MM-DD"));
    setSelectedDate(date);
    setCalendarDay(formattedDate._i);
    setIsOpen(false);
  };

  return (
    <StyledCalendar>
      <div onClick={toggleCalendar}>Calendar</div>
      {isOpen && (
        <Calendar
          className="calendar"
          setSelectedDate={onDateSet}
          selectedDate={selectedDate}
        />
      )}
    </StyledCalendar>
  );
};

export default CalendarComponent;
