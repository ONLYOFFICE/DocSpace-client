import styled, { css } from "styled-components";
import StyledText from "../../text/styled-text";
import Base from "../../themes/base";

const getDefaultStyles = ({
  $currentColorScheme,
  isActive,
  theme
}: any) =>
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
