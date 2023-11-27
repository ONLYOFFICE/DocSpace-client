import { css } from "styled-components";

const commonInputStyle = css`
  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'ThemeProp... Remove this comment to see the full error message
    (props.scale && "100%") ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
    (props.size === "base" && props.theme.input.width.base) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
    (props.size === "middle" && props.theme.input.width.middle) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
    (props.size === "big" && props.theme.input.width.big) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
    (props.size === "huge" && props.theme.input.width.huge) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
    (props.size === "large" && props.theme.input.width.large)};

  background-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled
      ? props.theme.input.disableBackgroundColor
      : props.theme.input.backgroundColor};
  color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled
      ? props.theme.input.disableColor
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'ThemedSty... Remove this comment to see the full error message
      : props.color
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'ThemedSty... Remove this comment to see the full error message
      ? props.color
      : props.theme.input.color};

  border-radius: ${(props) => props.theme.input.borderRadius};
  -moz-border-radius: ${(props) => props.theme.input.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.input.borderRadius};

  box-shadow: ${(props) => props.theme.input.boxShadow};
  box-sizing: ${(props) => props.theme.input.boxSizing};
  border: ${(props) => props.theme.input.border};
  border-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
    (props.hasError && props.theme.input.errorBorderColor) ||
    // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
    (props.hasWarning && props.theme.input.warningBorderColor) ||
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    (props.isDisabled && props.theme.input.disabledBorderColor) ||
    props.theme.input.borderColor};

  :hover {
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
      (props.hasError && props.theme.input.hoverErrorBorderColor) ||
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
      (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
      props.theme.input.hoverBorderColor};
  }
  :focus {
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
      (props.hasError && props.theme.input.focusErrorBorderColor) ||
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
      (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      (props.isDisabled && props.theme.input.focusDisabledBorderColor) ||
      props.theme.input.focusBorderColor};
  }

  cursor: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isReadOnly' does not exist on type 'Them... Remove this comment to see the full error message
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

export default commonInputStyle;
