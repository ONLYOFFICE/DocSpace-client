import styled, { css } from "styled-components";
import Base from "../../themes/base";

export const DateItem = styled.button`
  font-family: "Open Sans";
  font-weight: 600;
  font-size: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    props.theme.getCorrectFontSize(props.isMobile ? "16px" : "13px")};
  border-radius: 50%;

  border: 2px solid;
  background-color: transparent;

  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
    props.big
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      ? props.isMobile
        ? "60px"
        : "50px"
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      : props.isMobile
      ? "40px"
      : "30px"};
  height: ${(props) =>
    // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
    props.big
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      ? props.isMobile
        ? "60px"
        : "50px"
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      : props.isMobile
      ? "40px"
      : "30px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  :hover {
    cursor: ${(props) => (props.disabled ? "default" : "pointer")};
    background: ${(props) =>
      props.disabled ? "transparent" : props.theme.calendar.onHoverBackground};
  }

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isCurrent' does not exist on type 'Theme... Remove this comment to see the full error message
    props.isCurrent &&
    css`
      background: ${(props) => props.theme.calendar.accent};
      :hover {
        background-color: ${(props) => props.theme.calendar.accent};
      }

      :focus {
        background-color: ${(props) => props.theme.calendar.accent};
      }
    `}
  color: ${(props) =>
    props.disabled
      ? props.theme.calendar.disabledColor
      // @ts-expect-error TS(2339): Property 'focused' does not exist on type 'ThemedS... Remove this comment to see the full error message
      : props.focused
      ? props.theme.calendar.accent
      : props.theme.calendar.color};
  border-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'focused' does not exist on type 'ThemedS... Remove this comment to see the full error message
    props.focused ? props.theme.calendar.accent : "transparent"};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isCurrent' does not exist on type 'Theme... Remove this comment to see the full error message
    props.isCurrent &&
    css`
      color: white !important;

      :hover {
        color: white !important;
      }

      :focus {
        color: white !important;
      }
    `}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isSecondary' does not exist on type 'The... Remove this comment to see the full error message
    props.isSecondary &&
    css`
      color: ${(props) =>
        // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'ThemeP... Remove this comment to see the full error message
        props.disabled
          ? props.theme.calendar.disabledColor
          : props.theme.calendar.pastColor} !important;

      :hover {
        cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
        color: ${(props) =>
          props.disabled
            ? props.theme.calendar.disabledColor
            : props.theme.calendar.pastColor} !important;
      }
    `}
`;
DateItem.defaultProps = { theme: Base };
