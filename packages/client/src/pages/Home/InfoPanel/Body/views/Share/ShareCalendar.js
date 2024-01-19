import styled, { css } from "styled-components";
import moment from "moment";

import { Calendar } from "@docspace/shared/components/calendar";
import { isMobile } from "@docspace/shared/utils/device";

const StyledCalendar = styled(Calendar)`
  position: absolute;
  right: 32px;

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
  const maxDate = moment().add(10, "years");

  return (
    <StyledCalendar
      selectedDate={selectedDate}
      setSelectedDate={onDateSet}
      onChange={closeCalendar}
      isMobile={isMobile()}
      forwardedRef={calendarRef}
      locale={locale}
      minDate={selectedDate}
      maxDate={maxDate}
    />
  );
};

export default ShareCalendar;
