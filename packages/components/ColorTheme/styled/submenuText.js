import styled, { css } from "styled-components";
import StyledText from "SRC_DIR/text/styled-text";
import Base from "SRC_DIR/themes/base";

const getDefaultStyles = ({ $currentColorScheme, isActive, theme }) =>
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
