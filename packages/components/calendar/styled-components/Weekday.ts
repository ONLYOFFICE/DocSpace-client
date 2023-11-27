import styled from "styled-components";
import Base from "../../themes/base";

export const Weekday = styled.span`
  pointer-events: none;
  font-family: "Open Sans";
  font-weight: 400;
  font-size: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    props.theme.getCorrectFontSize(props.isMobile ? "16px" : "13px")};
  line-height: 16px;

  color: ${(props) => props.theme.calendar.weekdayColor};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  width: ${(props) => (props.isMobile ? "40px" : "30px")};

  text-align: center;
  padding: 10.7px 0;
`;
Weekday.defaultProps = { theme: Base };
