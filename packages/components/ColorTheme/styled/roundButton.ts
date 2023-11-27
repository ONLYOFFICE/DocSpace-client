import styled, { css } from "styled-components";
import { RoundButton } from "../../calendar/styled-components";

const getDefaultStyles = ({
  $currentColorScheme
}: any) =>
  $currentColorScheme &&
  css`
    :hover {
      outline: ${(props) =>
        // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'ThemeP... Remove this comment to see the full error message
        props.disabled
          ? `1px solid ${props.theme.calendar.outlineColor}`
          : `2px solid ${$currentColorScheme.main.accent}`};
      span {
        border-color: ${(props) =>
          // @ts-expect-error TS(2339): Property 'disabled' does not exist on type 'ThemeP... Remove this comment to see the full error message
          props.disabled
            ? props.theme.calendar.disabledArrow
            : $currentColorScheme.main.accent};
      }
    }
  `;

export default styled(RoundButton)(getDefaultStyles);
