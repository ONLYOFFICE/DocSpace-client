import { css } from "styled-components";

const commonInputStyles = css<{
  size?: string;
  scale?: boolean;
  isDisabled?: boolean;
  color?: string;
  hasError?: boolean;
  hasWarning?: boolean;
  isReadOnly?: boolean;
}>`
  width: ${(props) =>
    (props.scale && "100%") ||
    (props.size === "base" && props.theme.input.width.base) ||
    (props.size === "middle" && props.theme.input.width.middle) ||
    (props.size === "big" && props.theme.input.width.big) ||
    (props.size === "huge" && props.theme.input.width.huge) ||
    (props.size === "large" && props.theme.input.width.large)};

  background-color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableBackgroundColor
      : props.theme.input.backgroundColor};
  color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableColor
      : props.color
        ? props.color
        : props.theme.input.color};

  border-radius: ${(props) => props.theme.input.borderRadius};
  -moz-border-radius: ${(props) => props.theme.input.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.input.borderRadius};

  box-shadow: ${(props) => props.theme.input.boxShadow};
  box-sizing: ${(props) => props.theme.input.boxSizing};
  border: ${(props) => props.theme.input.border};
  border-color: ${(props) =>
    (props.hasError && props.theme.input.errorBorderColor) ||
    (props.hasWarning && props.theme.input.warningBorderColor) ||
    (props.isDisabled && props.theme.input.disabledBorderColor) ||
    props.theme.input.borderColor};

  :hover {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.hoverErrorBorderColor) ||
      (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
      (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
      props.theme.input.hoverBorderColor};
  }
  :focus {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.focusErrorBorderColor) ||
      (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
      (props.isDisabled && props.theme.input.focusDisabledBorderColor) ||
      props.theme.input.focusBorderColor};
  }

  cursor: ${(props) =>
    props.isReadOnly || props.isDisabled ? "default" : "text"};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      // If current interface direction is rtl, set cursor in the right side of the input
      // Will work only if placeholder exists (placeholder=" " by default required)
      :placeholder-shown {
        direction: rtl;
      }

      ::placeholder {
        text-align: right;
      }

      &[type="tel"]:placeholder-shown {
        direction: ltr;
      }

      &[type="search"] {
        unicode-bidi: plaintext;
      }
    `}
`;

export { commonInputStyles };
