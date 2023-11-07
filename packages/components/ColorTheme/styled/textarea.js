import styled, { css } from "styled-components";
import { StyledScrollbar } from "SRC_DIR/textarea/styled-textarea";
import Base from "SRC_DIR/themes/base";

const getDefaultStyles = ({ $currentColorScheme, hasError, theme }) =>
  $currentColorScheme &&
  css`
    :focus-within {
      border-color: ${hasError
        ? theme?.textArea.focusErrorBorderColor
        : theme.textArea.focusBorderColor};
    }
  `;

StyledScrollbar.defaultProps = {
  theme: Base,
};

export default styled(StyledScrollbar)(getDefaultStyles);
