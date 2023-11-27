import styled, { css } from "styled-components";
import StyledTextInput from "../../text-input/styled-text-input";
import Base from "../../themes/base";

const getDefaultStyles = ({
  $currentColorScheme,
  hasError,
  hasWarning,
  isDisabled,
  theme
}: any) =>
  $currentColorScheme &&
  theme.isBase &&
  css`
    :focus {
      border-color: ${(hasError && theme.input.focusErrorBorderColor) ||
      (hasWarning && theme.input.focusWarningBorderColor) ||
      (isDisabled && theme.input.focusDisabledBorderColor) ||
      $currentColorScheme.main.accent};
    }
  `;

StyledTextInput.defaultProps = { theme: Base };

export default styled(StyledTextInput)(getDefaultStyles);
