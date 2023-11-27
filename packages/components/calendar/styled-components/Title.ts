import styled from "styled-components";
import Base from "../../themes/base";

export const Title = styled.h2`
  position: relative;
  font-family: "Open Sans", sans-serif, Arial;
  font-weight: 700;
  font-size: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    props.theme.getCorrectFontSize(props.isMobile ? "21px" : "18px")};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  line-height: ${(props) => (props.isMobile ? "28px" : "24px")};
  color: ${(props) => props.theme.calendar.titleColor};
  border-bottom: 1px dashed transparent;
  margin: 0;
  display: inline-block;

  :hover {
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'Themed... Remove this comment to see the full error message
      props.disabled ? "transparent" : props.theme.calendar.titleColor};
    // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'Themed... Remove this comment to see the full error message
    cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
  }
`;

Title.defaultProps = { theme: Base };
