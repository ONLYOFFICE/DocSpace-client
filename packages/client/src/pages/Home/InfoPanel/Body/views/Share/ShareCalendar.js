import styled, { css } from "styled-components";
import moment from "moment";

import Calendar from "@docspace/components/calendar";
import { isMobile } from "@docspace/components/utils/device";

const StyledCalendar = styled(Calendar)`
  position: absolute;
  ${(props) =>
    props.isMobile &&
    css`
      position: fixed;
      bottom: 0;
      inset-inline-start: 0;
    `}
`;

const ShareCalendar = ({ onDateSet, closeCalendar, calendarRef, locale }) => {
  const selectedDate = moment();

  return (
    <StyledCalendar
      selectedDate={selectedDate}
      setSelectedDate={onDateSet}
      onChange={closeCalendar}
      isMobile={isMobile()}
      forwardedRef={calendarRef}
      locale={locale}
      minDate={selectedDate}
    />
  );
};

export default ShareCalendar;
