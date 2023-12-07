import styled, { css } from "styled-components";

import { commonInputStyles } from "../../utils";
import { Base } from "../../themes";

const StyledIconBlock = styled.div<{
  isDisabled?: boolean;
  isClickable?: boolean;
}>`
  display: ${(props) => props.theme.inputBlock.display};
  align-items: ${(props) => props.theme.inputBlock.alignItems};
  cursor: ${(props) =>
    props.isDisabled || !props.isClickable ? "default" : "pointer"};

  height: ${(props) => props.theme.inputBlock.height};
  padding-right: ${(props) => props.theme.inputBlock.paddingRight};
  padding-left: ${(props) => props.theme.inputBlock.paddingLeft};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      padding-left: ${props.theme.inputBlock.paddingRight};
      padding-right: ${props.theme.inputBlock.paddingLeft};
    `}
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;
StyledIconBlock.defaultProps = { theme: Base };

const StyledChildrenBlock = styled.div`
  display: ${(props) => props.theme.inputBlock.display};
  align-items: ${(props) => props.theme.inputBlock.alignItems};
  padding: ${(props) => props.theme.inputBlock.padding};
`;
StyledChildrenBlock.defaultProps = { theme: Base };

const CustomInputGroup = ({
  isIconFill,
  hasError,
  hasWarning,
  isDisabled,
  scale,
  hoverColor,
  ...props
}: {
  hasError?: boolean;
  hasWarning?: boolean;
  isIconFill?: boolean;
  isDisabled?: boolean;
  scale?: boolean;
  hoverColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => <div {...props} />;

const StyledInputGroup = styled(CustomInputGroup)`
  display: ${(props) => props.theme.inputBlock.display};

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: #ffffff;
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px #23232329;
  }

  .prepend {
    display: ${(props) => props.theme.inputBlock.display};
    align-items: ${(props) => props.theme.inputBlock.alignItems};
  }

  .append {
    align-items: ${(props) => props.theme.inputBlock.alignItems};
    margin: ${(props) => props.theme.inputBlock.margin};
  }

  ${commonInputStyles}

  :focus-within {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.focusErrorBorderColor) ||
      props.theme.inputBlock.borderColor};
  }

  svg {
    path {
      fill: ${(props) =>
        props.color
          ? props.color
          : props.theme.inputBlock.iconColor} !important;
    }
  }

  &:hover {
    svg {
      path {
        fill: ${(props) =>
          props.hoverColor
            ? props.hoverColor
            : props.theme.inputBlock.hoverIconColor} !important;
      }
    }
  }
`;
StyledInputGroup.defaultProps = { theme: Base };

export { StyledInputGroup, StyledChildrenBlock, StyledIconBlock };
