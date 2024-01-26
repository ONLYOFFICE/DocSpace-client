import { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import Calendar from "@docspace/components/calendar";
import Portal from "@docspace/components/portal";

const StyledCalendarComponent = styled.div`
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

const StyledCalendar = styled(Calendar)`
  position: absolute;
  top: 150px;
  right: 30px;
`;

const CalendarComponent = ({ roomCreationDate, setCalendarDay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    return () => {
      setCalendarDay(null);
    };
  }, []);

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
      <div className="calendar-button" onClick={toggleCalendar}>
        Calendar
      </div>
      {isOpen && (
        <Portal
          element={
            <StyledCalendar
              setSelectedDate={onDateSet}
              selectedDate={selectedDate}
              minDate={new Date(formattedRoomCreationDate)}
              maxDate={new Date()}
            />
          }
        />
      )}
    </StyledCalendarComponent>
  );
};

export default CalendarComponent;
