import styled from "styled-components";

export const RoundButton = styled.button`
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  width: ${(props) => (props.isMobile ? "32px" : "26px")};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  height: ${(props) => (props.isMobile ? "32px" : "26px")};

  box-sizing: border-box;

  border-radius: 50%;
  outline: 1px solid;
  outline-color: ${(props) => props.theme.calendar.outlineColor};
  border: none;
  background-color: transparent;
  position: relative;

  transition: all ease-in-out 0.05s;

  span {
    border-color: ${(props) =>
      props.disabled
        ? props.theme.calendar.disabledArrow
        : props.theme.calendar.arrowColor};
  }

  :hover {
    cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
    outline: ${(props) =>
      props.disabled
        ? `1px solid ${props.theme.calendar.outlineColor}`
        : `2px solid ${props.theme.calendar.accent}`};
    span {
      border-color: ${(props) =>
        props.disabled
          ? props.theme.calendar.disabledArrow
          : props.theme.calendar.accent};
    }
  }
`;
