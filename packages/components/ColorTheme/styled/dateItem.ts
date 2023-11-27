import styled, { css } from "styled-components";
import { DateItem } from "../../calendar/styled-components";

const getDefaultStyles = ({
  $currentColorScheme
}: any) =>
  $currentColorScheme &&
  css`
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isCurrent' does not exist on type 'Theme... Remove this comment to see the full error message
      props.isCurrent &&
      css`
        background: ${$currentColorScheme.main.accent};
        :hover {
          background-color: ${$currentColorScheme.main.accent};
        }

        :focus {
          background-color: ${$currentColorScheme.main.accent};
        }
      `}
    color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'Themed... Remove this comment to see the full error message
      props.disabled
        ? props.theme.calendar.disabledColor
        // @ts-expect-error TS(2339): Property 'focused' does not exist on type 'ThemedS... Remove this comment to see the full error message
        : props.focused
        ? $currentColorScheme.main.accent
        : props.theme.calendar.color};
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'focused' does not exist on type 'ThemedS... Remove this comment to see the full error message
      props.focused ? $currentColorScheme.main.accent : "transparent"};
  `;


export default styled(DateItem)(getDefaultStyles);
