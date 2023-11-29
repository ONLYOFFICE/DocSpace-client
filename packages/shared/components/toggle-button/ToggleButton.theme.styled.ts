import styled, { css } from "styled-components";
import { Container, ToggleButtonContainer } from "./styled-toggle-button";

export interface ContainerToggleButtonThemeProps {
  $currentColorScheme: any;
  isChecked?: boolean;
  isDisabled?: boolean;
}

const ContainerToggleButtonTheme = styled(
  Container
)<ContainerToggleButtonThemeProps>`
  ${({ $currentColorScheme, isChecked, isDisabled, theme }) =>
    $currentColorScheme &&
    css`
      ${ToggleButtonContainer} {
        svg {
          rect {
            fill: ${isChecked && $currentColorScheme.main.accent} !important;
          }

          circle {
            fill: ${(isChecked && isDisabled && theme.isBase && "#FFFFFF") ||
            (isChecked && $currentColorScheme.text.accent)};
          }
        }
      }
    `}
`;

export default ContainerToggleButtonTheme;
