import styled, { css } from "styled-components";
import StyledText from "../../text/Text.styled";
import { Base, TColorScheme, TTheme } from "../../../themes";

const getDefaultStyles = ({
  $currentColorScheme,
  isActive,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  isActive?: boolean;
  theme: TTheme;
}) =>
  $currentColorScheme &&
  css`
    color: ${isActive &&
    theme.isBase &&
    $currentColorScheme.main.accent} !important;

    &:hover {
      color: ${isActive &&
      theme.isBase &&
      $currentColorScheme.main.accent} !important;
    }
  `;

StyledText.defaultProps = { theme: Base };

export default styled(StyledText)(getDefaultStyles);
