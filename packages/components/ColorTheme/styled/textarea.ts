import styled, { css } from "styled-components";
import { StyledScrollbar } from "../../textarea/styled-textarea";
import Base from "../../themes/base";

const getDefaultStyles = ({
  $currentColorScheme,
  hasError,
  theme
}: any) =>
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
