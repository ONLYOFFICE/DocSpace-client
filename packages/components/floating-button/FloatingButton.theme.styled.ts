import styled, { css } from "styled-components";

import { Base } from "../themes";
import { StyledCircleWrap } from "./styled-floating-button";

export interface DefaultStylesProps {
  color?: string;
  displayProgress: boolean;
  $currentColorScheme: any;
}

const getDefaultStyles = ({
  $currentColorScheme,
  color,
  displayProgress,
}: DefaultStylesProps) =>
  $currentColorScheme &&
  css`
    background: ${color || $currentColorScheme.main.accent} !important;

    .circle__background {
      background: ${color || $currentColorScheme.main.accent} !important;
    }

    .icon-box {
      svg {
        path {
          fill: ${$currentColorScheme.text.accent};
        }
      }
    }

    .circle__mask .circle__fill {
      background-color: ${!displayProgress
        ? "transparent !important"
        : $currentColorScheme.text.accent};
    }
  `;

StyledCircleWrap.defaultProps = { theme: Base };

const StyledFloatingButtonTheme = styled(StyledCircleWrap)(getDefaultStyles);

export default StyledFloatingButtonTheme;
